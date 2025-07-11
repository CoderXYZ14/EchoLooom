import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import Meeting from "@/models/Meeting";
import ChatMessage from "@/models/ChatMessage";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meeting = await Meeting.findById(params.id);

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check if user is host or participant
    const isHost = meeting.hostId === session.user.id;
    const isParticipant = meeting.participants.some(
      (p: any) => p.email === session.user.email
    );

    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Save chat message
    const chatMessage = await ChatMessage.create({
      meetingId: params.id,
      userId: session.user.id,
      userName: session.user.name,
      message,
    });

    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meeting = await Meeting.findById(params.id);

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check if user is host or participant
    const isHost = meeting.hostId === session.user.id;
    const isParticipant = meeting.participants.some(
      (p: any) => p.email === session.user.email
    );

    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get chat messages
    const messages = await ChatMessage.find({ meetingId: params.id }).sort({
      timestamp: 1,
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
