import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createMeetingToken } from "@/lib/daily";

interface CreateTokenRequest {
  roomName: string;
  participantName: string;
  participantEmail: string;
  isHost?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomName = searchParams.get("room");

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Use session user info
    const participantName = session.user.name || "Guest";
    const participantEmail = session.user.email || "guest@example.com";

    // Verify room exists first
    const roomResponse = await fetch(
      `https://api.daily.co/v1/rooms/${roomName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    );

    if (!roomResponse.ok) {
      if (roomResponse.status === 404) {
        return NextResponse.json(
          { error: "Meeting room does not exist" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to verify room: ${roomResponse.statusText}`);
    }

    // Create meeting token
    const tokenData = await createMeetingToken(
      roomName,
      participantName,
      participantEmail,
      true // Default to host for now
    );

    return NextResponse.json(
      {
        success: true,
        token: tokenData.token,
        roomName: roomName,
        participantName: participantName,
        isHost: true,
        expiresAt: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error creating meeting token:", error);

    // Return more specific error messages
    if (
      error instanceof Error &&
      error.message.includes("room does not exist")
    ) {
      return NextResponse.json(
        { error: "Meeting room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      roomName,
      participantName,
      participantEmail,
      isHost = false,
    } = (await req.json()) as CreateTokenRequest;

    // Validate required fields
    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "Room name and participant name are required" },
        { status: 400 }
      );
    }

    // Use session email if participantEmail is not provided
    const email = participantEmail || session.user.email;

    // Verify room exists first
    const roomResponse = await fetch(
      `https://api.daily.co/v1/rooms/${roomName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    );

    if (!roomResponse.ok) {
      if (roomResponse.status === 404) {
        return NextResponse.json(
          { error: "Meeting room does not exist" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to verify room: ${roomResponse.statusText}`);
    }

    // Create meeting token
    const tokenData = await createMeetingToken(
      roomName,
      participantName,
      email || session.user.email,
      isHost
    );

    return NextResponse.json(
      {
        success: true,
        token: tokenData.token,
        roomName: roomName,
        participantName: participantName,
        isHost: isHost,
        expiresAt: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error creating meeting token:", error);

    // Return more specific error messages
    if (
      error instanceof Error &&
      error.message.includes("room does not exist")
    ) {
      return NextResponse.json(
        { error: "Meeting room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
