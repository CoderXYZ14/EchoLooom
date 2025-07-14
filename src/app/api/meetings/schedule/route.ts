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
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected successfully");
    const session = await getServerAuthSession();
    console.log("Session:", session);

    if (!session?.user) {
      console.log("ERROR: No session or user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("User authenticated:", session.user.id, session.user.email);

    const { title, scheduledTime, duration, participantEmails } =
      (await req.json()) as ScheduleMeetingRequest;

    console.log("Schedule meeting request:", {
      title,
      scheduledTime,
      duration,
      participantEmails,
    });

    // Validate required fields
    console.log("Validating title:", title);
    if (!title || title.trim() === "") {
      console.log("ERROR: Title validation failed");
      return NextResponse.json(
        { error: "Meeting title is required" },
        { status: 400 }
      );
    }

    console.log("Validating scheduledTime:", scheduledTime);
    if (!scheduledTime) {
      console.log("ERROR: ScheduledTime validation failed");
      return NextResponse.json(
        { error: "Scheduled time is required" },
        { status: 400 }
      );
    }

    console.log("Validating duration:", duration);
    if (!duration || duration <= 0) {
      console.log("ERROR: Duration validation failed");
      return NextResponse.json(
        { error: "Duration is required and must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const meetingDate = new Date(scheduledTime);
    const currentDate = new Date();
    console.log("Meeting date:", meetingDate, "Current date:", currentDate);
    console.log("Meeting date is valid:", !isNaN(meetingDate.getTime()));

    if (isNaN(meetingDate.getTime())) {
      console.log("ERROR: Invalid date format");
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Allow scheduling meetings in the past for testing (remove this later)
    // if (meetingDate <= currentDate) {
    //   console.log("ERROR: Scheduled time must be in future");
    //   return NextResponse.json(
    //     { error: "Scheduled time must be in the future" },
    //     { status: 400 }
    //   );
    // }

    // Process participant emails
    console.log("Processing participant emails:", participantEmails);
    const participants = [];
    if (participantEmails && participantEmails.trim()) {
      console.log("Participant emails provided, processing...");
      const emailList = participantEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      console.log("Email list after processing:", emailList);

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of emailList) {
        console.log("Validating email:", email);
        if (!emailRegex.test(email)) {
          console.log("ERROR: Invalid email format:", email);
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
    } else {
      console.log("No participant emails provided or empty string");
    }
    console.log("Final participants array:", participants);

    // Create Daily.co room
    console.log(
      "Creating Daily.co room with title:",
      title,
      "duration:",
      duration
    );

    let dailyRoom;
    try {
      dailyRoom = await createDailyRoom(title, duration);
      console.log("Daily room created successfully:", {
        name: dailyRoom.name,
        url: dailyRoom.url,
        api_created: dailyRoom.api_created,
      });
    } catch (dailyError) {
      console.error("Failed to create Daily.co room:", dailyError);
      return NextResponse.json(
        { error: "Failed to create meeting room. Please try again." },
        { status: 500 }
      );
    }

    // Create meeting in database
    console.log("Creating meeting in database with data:", {
      title: title.trim(),
      hostId: session.user.id,
      dailyRoomName: dailyRoom.name,
      scheduledTime: meetingDate,
      duration,
      participants,
    });
    const meeting = await Meeting.create({
      title: title.trim(),
      hostId: session.user.id,
      dailyRoomName: dailyRoom.name,
      scheduledTime: meetingDate,
      duration,
      participants,
    });
    console.log("Meeting created successfully:", meeting._id);

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
          roomUrl: `https://${
            process.env.DAILY_SUBDOMAIN ||
            process.env.NEXT_PUBLIC_DAILY_SUBDOMAIN ||
            "echoloom"
          }.daily.co/${meeting.dailyRoomName}`,
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
