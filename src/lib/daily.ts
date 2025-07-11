export async function createDailyRoom(
  meetingTitle: string,
  expiryMinutes: number = 60,
  hostEmail?: string
) {
  // Generate a URL-friendly room name based on the meeting title
  const roomName = `echoloom-${meetingTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

  const response = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: roomName,
      properties: {
        exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60,
        enable_chat: true,
        enable_knocking: true,
        start_video_off: false,
        start_audio_off: false,
        enable_people_ui: true,
        enable_prejoin_ui: true,
        enable_network_ui: true,
        enable_screenshare: true,
        lang: "en",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create Daily.co room: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function createMeetingToken(
  roomName: string,
  participantName: string,
  participantEmail: string,
  isHost: boolean = false,
  expiryMinutes: number = 120
) {
  const response = await fetch("https://api.daily.co/v1/meeting-tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: participantName,
        user_id: participantEmail,
        exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60,
        is_owner: isHost,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create meeting token: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function validateMeetingToken(token: string) {
  const response = await fetch(
    `https://api.daily.co/v1/meeting-tokens/${token}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return { valid: false, message: "Invalid or expired token" };
    }
    throw new Error(`Failed to validate meeting token: ${response.statusText}`);
  }

  const data = await response.json();
  return { valid: true, data };
}
