import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MeetingModel from "@/models/Meeting";
import {
  createGuestUser,
  addUserToMeeting,
  formatUserForFrontend,
} from "@/lib/guestUtils";
import mongoose from "mongoose";

interface GuestJoinRequest {
  name: string;
  email: string;
  roomName: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, roomName } = (await req.json()) as GuestJoinRequest;

    if (!name || !email || !roomName) {
      return NextResponse.json(
        { error: "Name, email, and room name are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const meeting = await MeetingModel.findOne({ dailyRoomName: roomName });
    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting room not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const meetingEndTime = new Date(
      meeting.scheduledTime.getTime() + meeting.duration * 60000
    );

    if (meetingEndTime < now) {
      return NextResponse.json(
        { error: "This meeting has ended" },
        { status: 410 }
      );
    }

    const user = await createGuestUser(
      name,
      email,
      meeting._id as mongoose.Types.ObjectId
    );

    await addUserToMeeting(
      (user._id as mongoose.Types.ObjectId).toString(),
      email,
      name,
      meeting._id as mongoose.Types.ObjectId
    );

    const formattedUser = formatUserForFrontend(user, true);

    return NextResponse.json({
      success: true,
      message: "Guest user created successfully",
      user: formattedUser,
      meeting: {
        id: (meeting._id as mongoose.Types.ObjectId).toString(),
        title: meeting.title,
        roomName: meeting.dailyRoomName,
      },

      accountUpgradeMessage:
        "Sign in with Google to save your meeting history and access more features!",
    });
  } catch (error: unknown) {
    console.error("Error creating guest user:", error);
    return NextResponse.json(
      { error: "Failed to join as guest" },
      { status: 500 }
    );
  }
}
