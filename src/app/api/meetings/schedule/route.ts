import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createDailyRoom } from "@/lib/daily";
import Meeting from "@/models/Meeting";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

interface ScheduleMeetingRequest {
  title: string;
  scheduledTime: string; // ISO date string
  duration: number; // in minutes
  participantEmails: string; // comma-separated emails
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

    // Validate required fields
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

    // Validate scheduled time is in the future
    const meetingDate = new Date(scheduledTime);
    if (meetingDate <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    // Process participant emails
    const participants = [];
    if (participantEmails && participantEmails.trim()) {
      const emailList = participantEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      // Basic email validation
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
          name: email.split("@")[0], // Use email prefix as default name
          joined: false,
        });
      }
    }

    // Create Daily.co room
    const dailyRoom = await createDailyRoom(title, duration);

    // Create meeting in database
    const meeting = await Meeting.create({
      title: title.trim(),
      hostId: session.user.id,
      dailyRoomName: dailyRoom.name,
      scheduledTime: meetingDate,
      duration,
      participants,
    });

    // Add meeting to host's meetings
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { meetings: meeting._id } }
    );

    // Handle participants: create users if they don't exist and add meeting to their list
    if (participants.length > 0) {
      for (const participant of participants) {
        try {
          // Check if user exists
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
            `Error handling participant ${participant.email}:`,
            error
          );
          // Continue with other participants even if one fails
        }
      }
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
          roomUrl: `https://${process.env.DAILY_SUBDOMAIN}.daily.co/${meeting.dailyRoomName}`,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to schedule meeting";
    console.error("Error scheduling meeting:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
