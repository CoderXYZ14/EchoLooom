import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import Meeting from "@/models/Meeting";
import { sendMeetingInvite } from "@/lib/email";

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

    // Only host can send invites
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

    // Send email invites
    const meetingLink = `${process.env.NEXTAUTH_URL}/meetings/${meeting._id}`;

    const emailPromises = newParticipants.map((participant: any) =>
      sendMeetingInvite({
        to: participant.email,
        hostName: session.user.name!,
        meetingTitle: meeting.title,
        meetingTime: meeting.scheduledTime,
        meetingLink,
        meetingDescription: meeting.description,
      })
    );

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      participants: meeting.participants,
    });
  } catch (error: any) {
    console.error("Error sending invites:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send invites" },
      { status: 500 }
    );
  }
}
