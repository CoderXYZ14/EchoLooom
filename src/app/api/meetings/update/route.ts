import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MeetingModel from "@/models/Meeting";
import UserModel from "@/models/User";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import {
  sendMeetingInviteEmail,
  sendMeetingUpdateEmail,
  sendMeetingCancellationEmail,
} from "@/lib/email";

interface UpdateMeetingRequest {
  id: string;
  title?: string;
  scheduledTime?: string; // ISO date string
  duration?: number; // in minutes
  participantEmails?: string; // comma-separated emails
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id, title, scheduledTime, duration, participantEmails } =
      (await request.json()) as UpdateMeetingRequest;

    if (!id) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    // Find the meeting first to check permissions
    const meeting = await MeetingModel.findById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check if user is the host (only hosts can edit meetings)
    const isHost = meeting.hostId.toString() === session.user.id;
    if (!isHost) {
      return NextResponse.json(
        { error: "Only the meeting host can edit this meeting" },
        { status: 403 }
      );
    }

    // Check if meeting has already started or ended
    const now = new Date();
    const meetingStart = new Date(meeting.scheduledTime);

    if (now >= meetingStart) {
      return NextResponse.json(
        { error: "Cannot edit a meeting that has already started" },
        { status: 400 }
      );
    }

    // Prepare update data and track changes
    const updateData: Partial<{
      title: string;
      scheduledTime: Date;
      duration: number;
      participants: Array<{ email: string; name: string; joined: boolean }>;
    }> = {};

    const changedFields: string[] = [];

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: "Meeting title cannot be empty" },
          { status: 400 }
        );
      }
      if (title.trim() !== meeting.title) {
        updateData.title = title.trim();
        changedFields.push("title");
      }
    }

    if (scheduledTime !== undefined) {
      const newMeetingDate = new Date(scheduledTime);
      if (isNaN(newMeetingDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduled time format" },
          { status: 400 }
        );
      }
      if (newMeetingDate <= now) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        );
      }
      if (newMeetingDate.getTime() !== meeting.scheduledTime.getTime()) {
        updateData.scheduledTime = newMeetingDate;
        changedFields.push("scheduledTime");
      }
    }

    if (duration !== undefined) {
      if (duration <= 0) {
        return NextResponse.json(
          { error: "Duration must be greater than 0" },
          { status: 400 }
        );
      }
      if (duration !== meeting.duration) {
        updateData.duration = duration;
        changedFields.push("duration");
      }
    }

    if (participantEmails !== undefined) {
      // Process participant emails
      const participants = [];
      if (participantEmails.trim()) {
        const emails = participantEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const email of emails) {
          if (!emailRegex.test(email)) {
            return NextResponse.json(
              { error: `Invalid email format: ${email}` },
              { status: 400 }
            );
          }
        }

        // Remove duplicates and host email
        const uniqueEmails = [...new Set(emails)].filter(
          (email) => email !== session.user.email
        );

        for (const email of uniqueEmails) {
          participants.push({
            email,
            name: email.split("@")[0], // Use email prefix as default name
            joined: false,
          });
        }
      }

      // Remove meeting from old participants who are no longer invited
      const oldParticipantEmails = meeting.participants.map((p) => p.email);
      const newParticipantEmails = participants.map((p) => p.email);
      const removedEmails = oldParticipantEmails.filter(
        (email) => !newParticipantEmails.includes(email)
      );

      console.log("Old participant emails:", oldParticipantEmails);
      console.log("New participant emails:", newParticipantEmails);
      console.log("Removed emails:", removedEmails);

      // Send cancellation emails to removed participants
      if (removedEmails.length > 0) {
        const hostName = session.user.name || session.user.email || "Host";

        for (const email of removedEmails) {
          const removedParticipant = meeting.participants.find(
            (p) => p.email === email
          );
          if (removedParticipant) {
            try {
              await sendMeetingCancellationEmail({
                participantName: removedParticipant.name,
                participantEmail: removedParticipant.email,
                hostName,
                meetingTitle: meeting.title,
                meetingTime: meeting.scheduledTime.toISOString(),
                duration: meeting.duration,
                reason: "You have been removed from this meeting by the host.",
              });
              console.log(
                `Removal notification sent to ${removedParticipant.email}`
              );
            } catch (emailError) {
              console.error(
                `Failed to send removal notification to ${removedParticipant.email}:`,
                emailError
              );
              // Continue with other participants even if email fails
            }
          }
        }
      }

      for (const email of removedEmails) {
        await UserModel.findOneAndUpdate(
          { email },
          { $pull: { meetings: meeting._id } }
        );
      }

      updateData.participants = participants;
    }

    // Update the meeting
    const updatedMeeting = await MeetingModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedMeeting) {
      return NextResponse.json(
        { error: "Failed to update meeting" },
        { status: 500 }
      );
    }

    // Handle new participants: create users if they don't exist and add meeting to their list
    if (updateData.participants) {
      const oldParticipantEmails = meeting.participants.map((p) => p.email);

      const addedParticipants = updateData.participants.filter(
        (p) => !oldParticipantEmails.includes(p.email)
      );

      for (const participant of updateData.participants) {
        try {
          // Check if user exists
          let existingUser = await UserModel.findOne({
            email: participant.email,
          });

          if (!existingUser) {
            // Create new user with email only
            existingUser = await UserModel.create({
              email: participant.email,
              name: participant.name,
              meetings: [meeting._id as mongoose.Types.ObjectId],
            });
          } else {
            // Add meeting to existing user's meetings if not already there
            const meetingId = meeting._id as mongoose.Types.ObjectId;
            if (!existingUser.meetings.includes(meetingId)) {
              existingUser.meetings.push(meetingId);
              await existingUser.save();
            }
          }
        } catch (error) {
          console.error(
            `Error handling participant ${participant.email}:`,
            error
          );
          // Continue with other participants even if one fails
        }
      }

      // Send invitation emails to newly added participants only
      if (addedParticipants.length > 0) {
        const meetingLink = `${
          process.env.NEXT_PUBLIC_BASE_URL || "https://echoloom.live"
        }/meeting/${updatedMeeting.dailyRoomName}`;

        for (const participant of addedParticipants) {
          try {
            await sendMeetingInviteEmail({
              participantName: participant.name,
              participantEmail: participant.email,
              hostName: session.user.name || session.user.email || "Host",
              meetingTitle: updatedMeeting.title,
              meetingTime: updatedMeeting.scheduledTime.toISOString(),
              duration: updatedMeeting.duration,
              meetingLink,
            });
            console.log(
              `Invitation email sent to new participant ${participant.email}`
            );
          } catch (emailError) {
            console.error(
              `Failed to send invitation email to ${participant.email}:`,
              emailError
            );
            // Continue with other participants even if email fails
          }
        }
      }
    }

    // Send update emails to existing participants if important fields changed
    if (changedFields.length > 0) {
      const meetingLink = `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://echoloom.com"
      }/meeting/${updatedMeeting.dailyRoomName}`;

      // Get existing participants (those who were already in the meeting)
      const existingParticipants = meeting.participants.filter((p) => {
        // Don't send update emails to participants who were removed
        if (updateData.participants) {
          return updateData.participants.some((newP) => newP.email === p.email);
        }
        return true; // If participants weren't updated, all existing participants should get updates
      });

      for (const participant of existingParticipants) {
        try {
          await sendMeetingUpdateEmail({
            participantName: participant.name,
            participantEmail: participant.email,
            hostName: session.user.name || session.user.email || "Host",
            meetingTitle: updatedMeeting.title,
            meetingTime: updatedMeeting.scheduledTime.toISOString(),
            duration: updatedMeeting.duration,
            meetingLink,
            changedFields,
          });
          console.log(
            `Update email sent to existing participant ${participant.email}`
          );
        } catch (emailError) {
          console.error(
            `Failed to send update email to ${participant.email}:`,
            emailError
          );
          // Continue with other participants even if email fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Meeting updated successfully",
      meeting: {
        id: updatedMeeting._id,
        title: updatedMeeting.title,
        scheduledTime: updatedMeeting.scheduledTime,
        duration: updatedMeeting.duration,
        participants: updatedMeeting.participants,
        dailyRoomName: updatedMeeting.dailyRoomName,
      },
    });
  } catch (error: unknown) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}
