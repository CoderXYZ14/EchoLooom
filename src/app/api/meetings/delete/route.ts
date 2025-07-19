import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MeetingModel from "@/models/Meeting";
import UserModel from "@/models/User";
import dbConnect from "@/lib/db";
import { sendMeetingCancellationEmail } from "@/lib/email";
import redis from "@/lib/redis";

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
          } catch (emailError) {
            console.error(
              `DeleteMeeting | Email error for ${participant.email}:`,
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

      // Invalidate Redis cache after deleting meeting
      try {
        await redis.del(`user:${session.user.id}:past_meetings`);
        await redis.del(`user:${session.user.id}:upcoming_meetings`);
      } catch (redisError) {
        console.error(
          "DeleteMeeting | Redis cache invalidation failed:",
          redisError
        );
      }

      console.log("DeleteMeeting | Meeting deleted successfully:", {
        meetingId,
        title: meeting.title,
        hostId: meeting.hostId,
      });

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

      // Invalidate Redis cache after removing meeting from history
      try {
        await redis.del(`user:${session.user.id}:past_meetings`);
        await redis.del(`user:${session.user.id}:upcoming_meetings`);
      } catch (redisError) {
        console.error(
          "DeleteMeeting | Redis cache invalidation failed:",
          redisError
        );
      }

      console.log("DeleteMeeting | Meeting removed from history:", {
        meetingId,
        title: meeting.title,
        userEmail: session.user.email,
      });

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
    console.error("DeleteMeeting | General error:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
