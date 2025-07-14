import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MeetingModel from "@/models/Meeting";
import UserModel from "@/models/User";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

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

    // Prepare update data
    const updateData: Partial<{
      title: string;
      scheduledTime: Date;
      duration: number;
      participants: Array<{ email: string; name: string; joined: boolean }>;
    }> = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: "Meeting title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
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
      updateData.scheduledTime = newMeetingDate;
    }

    if (duration !== undefined) {
      if (duration <= 0) {
        return NextResponse.json(
          { error: "Duration must be greater than 0" },
          { status: 400 }
        );
      }
      updateData.duration = duration;
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
