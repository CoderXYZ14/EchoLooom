import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MeetingModel from "@/models/Meeting";
import UserModel from "@/models/User";
import dbConnect from "@/lib/db";

interface PopulatedHost {
  _id: string;
  email: string;
  name: string;
}

interface PopulatedMeeting {
  _id: string;
  title: string;
  scheduledTime: Date;
  duration: number;
  dailyRoomName: string;
  hostId: PopulatedHost;
  participants: Array<{
    email: string;
    name: string;
    joined: boolean;
  }>;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Meeting info API - session:", session?.user?.email);

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const roomName = searchParams.get("roomName");

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Find the meeting by room name
    console.log("Looking for meeting with roomName:", roomName);
    const meeting = (await MeetingModel.findOne({ dailyRoomName: roomName })
      .populate({
        path: "hostId",
        model: UserModel,
        select: "email name",
      })
      .lean()) as PopulatedMeeting | null;

    console.log("Found meeting:", meeting ? "Yes" : "No");

    if (!meeting) {
      // If no session but meeting not found in DB, check if it's a valid Daily room format
      if (!session?.user?.email) {
        console.log(
          "No session and no meeting found - checking if room exists in Daily.co"
        );

        // Check if this looks like a valid room name pattern
        if (roomName.startsWith("echoloom-") || roomName.length > 10) {
          // Return minimal info to allow joining
          console.log(
            "Allowing join for apparent valid room name without session"
          );
          return NextResponse.json({
            success: true,
            meeting: {
              id: "unknown",
              title: "Meeting Room",
              scheduledTime: new Date(),
              duration: 60,
              dailyRoomName: roomName,
              isHost: false,
              participants: 1,
              isValidRoom: true,
            },
          });
        }
      }

      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // If no session but meeting exists in DB, this might be a session issue
    if (!session?.user?.email) {
      console.log("Meeting found but no session - allowing basic access");
      // Return basic meeting info without access control for now
      return NextResponse.json({
        success: true,
        meeting: {
          id: meeting._id.toString(),
          title: meeting.title,
          scheduledTime: meeting.scheduledTime,
          duration: meeting.duration,
          dailyRoomName: meeting.dailyRoomName,
          isHost: false, // Can't determine without session
          participants: (meeting.participants?.length || 0) + 1, // +1 for host
          hostName: meeting.hostId.name,
          hostEmail: meeting.hostId.email,
          isValidRoom: true,
        },
      });
    }

    // Check if user is host or participant
    const isHost = meeting.hostId._id.toString() === session.user.id;
    const isParticipant = meeting.participants.some(
      (p) => p.email === session.user.email
    );

    console.log(
      "Access check - isHost:",
      isHost,
      "isParticipant:",
      isParticipant
    );

    // Allow access if user is host, participant, or if it's an open meeting
    if (!isHost && !isParticipant) {
      console.log(
        "User is not host or participant, but allowing access for demo"
      );
      // For now, we'll allow anyone to access meeting info
      // You can add more restrictive logic here if needed
    }

    return NextResponse.json({
      success: true,
      meeting: {
        id: meeting._id.toString(),
        title: meeting.title,
        scheduledTime: meeting.scheduledTime,
        duration: meeting.duration,
        isHost,
        participants: (meeting.participants?.length || 0) + 1, // +1 for host
        dailyRoomName: meeting.dailyRoomName,
        hostName: meeting.hostId.name,
        hostEmail: meeting.hostId.email,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching meeting info:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting info" },
      { status: 500 }
    );
  }
}
