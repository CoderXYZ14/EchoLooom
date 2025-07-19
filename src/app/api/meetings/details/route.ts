import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MeetingModel from "@/models/Meeting";
import dbConnect from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("id");

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    const meeting = await MeetingModel.findById(meetingId);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check if user is the host (only hosts can see full details)
    const isHost = meeting.hostId.toString() === session.user.id;
    if (!isHost) {
      return NextResponse.json(
        { error: "Only the meeting host can view meeting details" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      meeting: {
        id: meeting._id?.toString() || "",
        title: meeting.title,
        scheduledTime: meeting.scheduledTime,
        duration: meeting.duration,
        dailyRoomName: meeting.dailyRoomName,
        participants: meeting.participants.map((p) => ({
          email: p.email,
          name: p.name,
          joined: p.joined,
        })),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching meeting details:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting details" },
      { status: 500 }
    );
  }
}
