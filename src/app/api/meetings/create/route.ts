import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createDailyRoom } from "@/lib/daily";
import Meeting from "@/models/Meeting";
import User from "@/models/User";
import dbConnect from "@/lib/db";

interface CreateInstantMeetingRequest {
  title: string;
  duration?: number; // Optional, defaults to 60 minutes
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, duration = 60 } =
      (await req.json()) as CreateInstantMeetingRequest;

    // Validate required fields
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Meeting title is required" },
        { status: 400 }
      );
    }

    // Create Daily.co room
    const dailyRoom = await createDailyRoom(title, duration);

    // Create meeting in database with current time as start time
    const meeting = await Meeting.create({
      title: title.trim(),
      hostId: session.user.id,
      dailyRoomName: dailyRoom.name,
      scheduledTime: new Date(), // Current time for instant meetings
      duration,
      participants: [], // No participants for instant meetings initially
    });

    // Add meeting to user's meetings
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { meetings: meeting._id } }
    );

    return NextResponse.json(
      {
        success: true,
        meeting: {
          id: meeting._id,
          title: meeting.title,
          dailyRoomName: meeting.dailyRoomName,
          scheduledTime: meeting.scheduledTime,
          duration: meeting.duration,
          roomUrl: `https://${process.env.DAILY_SUBDOMAIN}.daily.co/${meeting.dailyRoomName}`,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create meeting";
    console.error("Error creating instant meeting:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
