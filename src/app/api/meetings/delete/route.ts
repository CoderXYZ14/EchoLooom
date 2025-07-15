import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MeetingModel from "@/models/Meeting";
import UserModel from "@/models/User";
import dbConnect from "@/lib/db";
import { sendMeetingCancellationEmail } from "@/lib/email";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get meeting ID from query parameters
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get("id");

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    // Find the meeting first to check permissions
    const meeting = await MeetingModel.findById(meetingId);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check if user is the host or a participant
    // hostId is stored as the user's MongoDB ObjectId, not email
    const isHost = meeting.hostId === session.user.id;
    const isParticipant = meeting.participants.some(
      (p) => p.email === session.user.email
    );

    if (!isHost && !isParticipant) {
      return NextResponse.json(
        { error: "You don't have permission to delete this meeting" },
        { status: 403 }
      );
    }

    // If user is the host, delete the entire meeting
    if (isHost) {
      // Send cancellation emails to all participants
      if (meeting.participants.length > 0) {
        const hostName = session.user.name || session.user.email || "Host";

        for (const participant of meeting.participants) {
          try {
            await sendMeetingCancellationEmail({
              participantName: participant.name,
              participantEmail: participant.email,
              hostName,
              meetingTitle: meeting.title,
              meetingTime: meeting.scheduledTime.toISOString(),
              duration: meeting.duration,
              reason: "The meeting has been cancelled by the host.",
            });
            console.log(`Cancellation email sent to ${participant.email}`);
          } catch (emailError) {
            console.error(
              `Failed to send cancellation email to ${participant.email}:`,
              emailError
            );
            // Continue with other participants even if email fails
          }
        }
      }

      // Remove meeting from all participants' meeting arrays
      await UserModel.updateMany(
        { meetings: meetingId },
        { $pull: { meetings: meetingId } }
      );

      // Delete the meeting document
      await MeetingModel.findByIdAndDelete(meetingId);

      return NextResponse.json({
        success: true,
        message: "Meeting deleted successfully",
      });
    }

    // If user is just a participant, remove them from the meeting and remove meeting from their history
    if (isParticipant) {
      // Remove participant from the meeting
      await MeetingModel.findByIdAndUpdate(meetingId, {
        $pull: { participants: { email: session.user.email } },
      });

      // Remove meeting from user's meetings array
      await UserModel.findOneAndUpdate(
        { email: session.user.email },
        { $pull: { meetings: meetingId } }
      );

      return NextResponse.json({
        success: true,
        message: "Meeting removed from your history",
      });
    }

    return NextResponse.json(
      { error: "Unable to delete meeting" },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
