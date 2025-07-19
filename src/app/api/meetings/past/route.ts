import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MeetingModel from "@/models/Meeting";
import UserModel from "@/models/User";
import { Meeting } from "@/models/Meeting";
import { User } from "@/models/User";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import redis from "@/lib/redis";

// Interface for populated meeting data
interface PopulatedMeeting extends Omit<Meeting, "hostId"> {
  _id: mongoose.Types.ObjectId;
  hostId: User & { _id: mongoose.Types.ObjectId };
}

// Interface for populated user data
interface PopulatedUser extends Omit<User, "meetings"> {
  meetings: PopulatedMeeting[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = `user:${userId}:past_meetings`;

    // Try to get from Redis cache first
    try {
      const cachedMeetings = await redis.get(cacheKey);
      if (cachedMeetings) {
        return NextResponse.json({
          success: true,
          meetings: cachedMeetings,
          cached: true,
        });
      }
    } catch (redisError) {
      console.error("PastMeetings | Redis cache error:", redisError);
    }

    await dbConnect();

    // Always return last 5 meetings for sidebar
    const limit = 5;

    // Find the user and populate their meetings
    const user = (await UserModel.findOne({ email: session.user.email })
      .populate({
        path: "meetings",
        model: MeetingModel,
        populate: {
          path: "hostId",
          model: UserModel,
          select: "email name",
        },
      })
      .lean()) as PopulatedUser | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const allPastMeetings = user.meetings.filter(
      (meeting: PopulatedMeeting) => {
        const meetingEndTime = new Date(
          meeting.scheduledTime.getTime() + meeting.duration * 60000
        );
        return meetingEndTime < now;
      }
    );

    // Sort by most recent first (descending order)
    allPastMeetings.sort(
      (a: PopulatedMeeting, b: PopulatedMeeting) =>
        new Date(b.scheduledTime).getTime() -
        new Date(a.scheduledTime).getTime()
    );

    // Get only the last 5 meetings
    const pastMeetings = allPastMeetings.slice(0, limit);

    // Format the meetings for the frontend
    const formattedMeetings = pastMeetings.map((meeting: PopulatedMeeting) => {
      const isToday =
        meeting.scheduledTime.toDateString() === new Date().toDateString();
      const isYesterday =
        meeting.scheduledTime.toDateString() ===
        new Date(Date.now() - 86400000).toDateString();

      let timeDisplay;
      if (isToday) {
        timeDisplay = meeting.scheduledTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      } else if (isYesterday) {
        timeDisplay = "Yesterday";
      } else {
        timeDisplay = meeting.scheduledTime.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      return {
        id: meeting._id.toString(),
        name: meeting.title,
        time: timeDisplay,
        duration: `${meeting.duration} min`,
        scheduledTime: meeting.scheduledTime,
        dailyRoomName: meeting.dailyRoomName,
        isHost: meeting.hostId._id?.toString() === session.user.id,
        participants: (meeting.participants?.length || 0) + 1,
      };
    });

    try {
      await redis.setex(cacheKey, 10800, JSON.stringify(formattedMeetings));
    } catch (redisError) {
      console.error("PastMeetings | Redis cache save error:", redisError);
    }

    console.log("PastMeetings | Fetched successfully for user:", userId);

    return NextResponse.json({
      success: true,
      meetings: formattedMeetings,
      total: allPastMeetings.length,
    });
  } catch (error: unknown) {
    console.error("PastMeetings | General error:", error);
    return NextResponse.json(
      { error: "Failed to fetch past meetings" },
      { status: 500 }
    );
  }
}
