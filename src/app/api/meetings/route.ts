import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createDailyRoom } from "@/lib/daily";
import Meeting from "@/models/Meeting";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, scheduledTime, duration, participants } =
      await req.json();

    if (!title || !scheduledTime || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create Daily.co room
    const dailyRoom = await createDailyRoom(title, duration);

    // Create meeting in database
    const meeting = await Meeting.create({
      title,
      description,
      hostId: session.user.id,
      dailyRoomName: dailyRoom.name,
      scheduledTime: new Date(scheduledTime),
      duration,
      participants:
        participants?.map((p: any) => ({
          userId: p.userId || "",
          email: p.email,
          name: p.name,
          joined: false,
        })) || [],
    });

    // Add meeting to user's meetings
    await User.findOneAndUpdate(
      { googleId: session.user.googleId },
      { $push: { meetings: meeting._id } }
    );

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create meeting" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's meetings
    const user = await User.findOne({
      googleId: session.user.googleId,
    }).populate("meetings");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find meetings where user is host or participant
    const hostedMeetings = await Meeting.find({ hostId: session.user.id });
    const participatingMeetings = await Meeting.find({
      "participants.email": session.user.email,
    });

    const meetings = [...hostedMeetings, ...participatingMeetings];

    return NextResponse.json({ meetings });
  } catch (error: any) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}
