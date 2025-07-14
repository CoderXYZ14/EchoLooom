import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MeetingModel from "@/models/Meeting";
import UserModel from "@/models/User";
import { Meeting } from "@/models/Meeting";
import { User } from "@/models/User";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

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

    await dbConnect();

    // Find the user and populate all their meetings
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

    // Filter upcoming meetings (meetings that haven't started yet)
    const now = new Date();
    const upcomingMeetings = user.meetings.filter((meeting) => {
      return meeting.scheduledTime > now;
    });

    // Sort by earliest first (ascending order)
    upcomingMeetings.sort(
      (a: PopulatedMeeting, b: PopulatedMeeting) =>
        new Date(a.scheduledTime).getTime() -
        new Date(b.scheduledTime).getTime()
    );

    // Format the meetings for the frontend
    const formattedMeetings = upcomingMeetings.map(
      (meeting: PopulatedMeeting) => {
        const isToday =
          meeting.scheduledTime.toDateString() === new Date().toDateString();
        const isTomorrow =
          meeting.scheduledTime.toDateString() ===
          new Date(Date.now() + 86400000).toDateString();

        let timeDisplay;
        if (isToday) {
          timeDisplay = `${meeting.scheduledTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })} Today`;
        } else if (isTomorrow) {
          timeDisplay = `Tomorrow ${meeting.scheduledTime.toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }
          )}`;
        } else {
          timeDisplay = meeting.scheduledTime.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        }

        return {
          id: meeting._id.toString(),
          title: meeting.title,
          time: timeDisplay,
          scheduledTime: meeting.scheduledTime,
          dailyRoomName: meeting.dailyRoomName,
          isHost: meeting.hostId._id?.toString() === session.user.id,
          participants: (meeting.participants?.length || 0) + 1, // +1 for the host
          duration: meeting.duration,
        };
      }
    );

    return NextResponse.json({
      success: true,
      meetings: formattedMeetings,
      total: formattedMeetings.length,
    });
  } catch (error: unknown) {
    console.error("Error fetching upcoming meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming meetings" },
      { status: 500 }
    );
  }
}
