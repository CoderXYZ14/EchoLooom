import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import Meeting from "@/models/Meeting";
import FormSubmission from "@/models/FormSubmission";

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

    // Check if user is a participant
    const participant = meeting.participants.find(
      (p: any) => p.email === session.user.email
    );

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const { responses } = await req.json();

    if (!responses || typeof responses !== "object") {
      return NextResponse.json(
        { error: "Form responses are required" },
        { status: 400 }
      );
    }

    // Create or update form submission
    const formSubmission = await FormSubmission.findOneAndUpdate(
      {
        meetingId: params.id,
        participantEmail: session.user.email,
      },
      {
        meetingId: params.id,
        participantId: participant.userId || session.user.id,
        participantEmail: session.user.email,
        participantName: session.user.name,
        responses,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ formSubmission }, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit form" },
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

    // Only host can view all submissions
    const isHost = meeting.hostId === session.user.id;

    if (isHost) {
      // Get all form submissions for this meeting
      const submissions = await FormSubmission.find({ meetingId: params.id });
      return NextResponse.json({ submissions });
    } else {
      // Participant can only view their own submission
      const submission = await FormSubmission.findOne({
        meetingId: params.id,
        participantEmail: session.user.email,
      });

      return NextResponse.json({ submission: submission || null });
    }
  } catch (error: any) {
    console.error("Error fetching form submissions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch form submissions" },
      { status: 500 }
    );
  }
}
