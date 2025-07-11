import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import Meeting from "@/models/Meeting";
import { sendMeetingInvite } from "@/lib/email";

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

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Only host can update meeting
    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, description, scheduledTime, duration, participants } =
      await req.json();

    // Update meeting
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      params.id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(scheduledTime && { scheduledTime: new Date(scheduledTime) }),
        ...(duration && { duration }),
        ...(participants && { participants }),
      },
      { new: true }
    );

    return NextResponse.json({ meeting: updatedMeeting });
  } catch (error: any) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update meeting" },
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

    // Only host can delete meeting
    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Meeting.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
