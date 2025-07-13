import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createDailyRoom } from "@/lib/daily";
import Meeting from "@/models/Meeting";
import User from "@/models/User";
import dbConnect from "@/lib/db";

interface CreateMeetingRequest {
  title: string;

  scheduledTime: string;
  duration: number;
  participants?: ParticipantInput[];
}

interface ParticipantInput {
  userId?: string;
  email: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, scheduledTime, duration, participants } =
      (await req.json()) as CreateMeetingRequest;

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

      hostId: session.user.id,
      dailyRoomName: dailyRoom.name,
      scheduledTime: new Date(scheduledTime),
      duration,
      participants:
        participants?.map((p) => ({
          userId: p.userId || "",
          email: p.email,
          name: p.name,
          joined: false,
        })) || [],
    });

    // Add meeting to user's meetings
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { meetings: meeting._id } }
    );

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create meeting";
    console.error("Error creating meeting:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find meetings where user is host or participant
    const hostedMeetings = await Meeting.find({ hostId: session.user.id });
    const participatingMeetings = await Meeting.find({
      "participants.email": session.user.email,
    });

    const meetings = [...hostedMeetings, ...participatingMeetings];

    return NextResponse.json({ meetings });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch meetings";
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
