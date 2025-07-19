import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createDailyRoom } from "@/lib/daily";
import Meeting from "@/models/Meeting";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import redis from "@/lib/redis";

interface CreateInstantMeetingRequest {
  title: string;
  duration?: number;
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

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Meeting title is required" },
        { status: 400 }
      );
    }

    const dailyRoom = await createDailyRoom(title, duration);

    const meeting = await Meeting.create({
      title: title.trim(),
      hostId: session.user.id,
      dailyRoomName: dailyRoom.name,
      scheduledTime: new Date(), // Current time for instant meetings
      duration,
      participants: [], // No participants for instant meetings initially
    });

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { meetings: meeting._id } }
    );

    try {
      await redis.del(`user:${session.user.id}:past_meetings`);
      await redis.del(`user:${session.user.id}:upcoming_meetings`);
    } catch (redisError) {
      console.error("Redis cache invalidation error:", redisError);
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
      error instanceof Error ? error.message : "Failed to create meeting";
    console.error("Error creating instant meeting:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
