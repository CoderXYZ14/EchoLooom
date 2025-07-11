import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import Meeting from "@/models/Meeting";

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

    return NextResponse.json({ participants: meeting.participants });
  } catch (error: any) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch participants" },
      { status: 500 }
    );
  }
}

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

    // Only host can add participants
    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { participants } = await req.json();

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return NextResponse.json(
        { error: "No participants provided" },
        { status: 400 }
      );
    }

    // Add participants to meeting
    const newParticipants = participants.map((p: any) => ({
      userId: p.userId || "",
      email: p.email,
      name: p.name,
      joined: false,
    }));

    // Update meeting with new participants
    const existingEmails = meeting.participants.map((p: any) => p.email);
    const uniqueNewParticipants = newParticipants.filter(
      (p: any) => !existingEmails.includes(p.email)
    );

    if (uniqueNewParticipants.length > 0) {
      meeting.participants.push(...uniqueNewParticipants);
      await meeting.save();
    }

    return NextResponse.json({ participants: meeting.participants });
  } catch (error: any) {
    console.error("Error adding participants:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add participants" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only host can remove participants
    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Participant email is required" },
        { status: 400 }
      );
    }

    // Remove participant from meeting
    const participantIndex = meeting.participants.findIndex(
      (p: any) => p.email === email
    );

    if (participantIndex === -1) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    meeting.participants.splice(participantIndex, 1);
    await meeting.save();

    return NextResponse.json({ participants: meeting.participants });
  } catch (error: any) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove participant" },
      { status: 500 }
    );
  }
}
