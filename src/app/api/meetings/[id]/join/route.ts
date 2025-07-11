import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import Meeting from "@/models/Meeting";

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
    const participantIndex = meeting.participants.findIndex(
      (p: any) => p.email === session.user.email
    );
    const isParticipant = participantIndex !== -1;

    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark participant as joined
    if (isParticipant) {
      meeting.participants[participantIndex].joined = true;
      meeting.participants[participantIndex].joinTime = new Date();
      await meeting.save();
    }

    // Generate Daily.co token with properties
    const dailyRoomUrl = `https://${process.env.DAILY_SUBDOMAIN}.daily.co/${meeting.dailyRoomName}`;

    // Include volume control settings
    const { initialAudioEnabled = true, initialVideoEnabled = true } =
      await req.json();

    // Return meeting details with Daily.co URL
    return NextResponse.json({
      meeting,
      dailyRoomUrl,
      dailyRoomName: meeting.dailyRoomName,
      joinConfig: {
        url: dailyRoomUrl,
        userName: session.user.name,
        initialAudioEnabled,
        initialVideoEnabled,
      },
    });
  } catch (error: any) {
    console.error("Error joining meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to join meeting" },
      { status: 500 }
    );
  }
}
