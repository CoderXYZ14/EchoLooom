import axios from "axios";

export async function createDailyRoom(
  meetingTitle: string,
  expiryMinutes: number = 60
) {
  const roomName = `echoloom-${meetingTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        name: roomName,
        properties: {
          exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60,
          enable_chat: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
          enable_people_ui: false,
          enable_prejoin_ui: false, // Critical: prevents redirect to Daily.co domain
          enable_network_ui: false,
          enable_screenshare: true,
          lang: "en",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || {};
      throw new Error(
        `Failed to create Daily.co room: ${error.message}. ${
          errorData.info || ""
        }`
      );
    }
    throw error;
  }
}

export async function createMeetingToken(
  roomName: string,
  participantName: string,
  participantEmail: string,
  isHost: boolean = false,
  expiryMinutes: number = 120
) {
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/meeting-tokens",
      {
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
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to create meeting token: ${error.message}`);
    }
    throw error;
  }
}

export async function validateMeetingToken(token: string) {
  try {
    const response = await axios.get(
      `https://api.daily.co/v1/meeting-tokens/${token}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    );

    return { valid: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { valid: false, message: "Invalid or expired token" };
      }
      throw new Error(`Failed to validate meeting token: ${error.message}`);
    }
    throw error;
  }
}
