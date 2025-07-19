import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createDailyRoom } from "@/lib/daily";
import Meeting from "@/models/Meeting";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import { sendMeetingInviteEmail } from "@/lib/email";
import redis from "@/lib/redis";

interface ScheduleMeetingRequest {
  title: string;
  scheduledTime: string;
  duration: number;
  participantEmails: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, scheduledTime, duration, participantEmails } =
      (await req.json()) as ScheduleMeetingRequest;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Meeting title is required" },
        { status: 400 }
      );
    }

    if (!scheduledTime) {
      return NextResponse.json(
        { error: "Scheduled time is required" },
        { status: 400 }
      );
    }

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { error: "Duration is required and must be greater than 0" },
        { status: 400 }
      );
    }

    const meetingDate = new Date(scheduledTime);

    if (isNaN(meetingDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const participants = [];
    if (participantEmails && participantEmails.trim()) {
      const emailList = participantEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of emailList) {
        if (!emailRegex.test(email)) {
          return NextResponse.json(
            { error: `Invalid email format: ${email}` },
            { status: 400 }
          );
        }
        participants.push({
          email,
          name: email.split("@")[0],
          joined: false,
        });
      }
    }

    // Create Daily.co room
    let dailyRoom;
    try {
      dailyRoom = await createDailyRoom(title, duration);
    } catch (dailyError) {
      console.error(
        "ScheduleMeeting | Daily.co room creation failed:",
        dailyError
      );
      return NextResponse.json(
        { error: "Failed to create meeting room. Please try again." },
        { status: 500 }
      );
    }

    const meeting = await Meeting.create({
      title: title.trim(),
      hostId: session.user.id,
      dailyRoomName: dailyRoom.name,
      scheduledTime: meetingDate,
      duration,
      participants,
    });
    console.log("ScheduleMeeting | Meeting created successfully:", meeting);

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { meetings: meeting._id } }
    );

    // Handle participants: create users if they don't exist and add meeting to their list
    if (participants.length > 0) {
      for (const participant of participants) {
        try {
          let existingUser = await User.findOne({ email: participant.email });

          if (!existingUser) {
            // Create new user with email only (no Google ID)
            existingUser = await User.create({
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
            `ScheduleMeeting | Participant error for ${participant.email}:`,
            error
          );
          // Continue with other participants even if one fails
        }
      }

      const meetingLink = `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://echoloom.com"
      }/meeting/${meeting.dailyRoomName}`;

      for (const participant of participants) {
        try {
          await sendMeetingInviteEmail({
            participantName: participant.name,
            participantEmail: participant.email,
            hostName: session.user.name || session.user.email || "Host",
            meetingTitle: meeting.title,
            meetingTime: meeting.scheduledTime.toISOString(),
            duration: meeting.duration,
            meetingLink,
          });
        } catch (emailError) {
          console.error(
            `ScheduleMeeting | Email error for ${participant.email}:`,
            emailError
          );
        }
      }
    }

    try {
      await redis.del(`user:${session.user.id}:past_meetings`);
      await redis.del(`user:${session.user.id}:upcoming_meetings`);
    } catch (redisError) {
      console.error(
        "ScheduleMeeting | Redis cache invalidation failed:",
        redisError
      );
    }

    return NextResponse.json(
      {
        success: true,
        meeting: {
          id: meeting._id,
          title: meeting.title,
          dailyRoomName: meeting.dailyRoomName,
          scheduledTime: meeting.scheduledTime,
          duration: meeting.duration,
          participants: meeting.participants,
          roomUrl: `https://echoloom.daily.co/${meeting.dailyRoomName}`,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to schedule meeting";
    console.error("ScheduleMeeting | General error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
