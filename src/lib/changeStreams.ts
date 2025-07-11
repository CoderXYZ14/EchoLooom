import dbConnect from "./db";
import mongoose from "mongoose";

// Define interfaces for change stream types to avoid version conflicts
interface ChangeStreamDocument {
  operationType: string;
  fullDocument?: Record<string, unknown>;
  updateDescription?: {
    updatedFields: Record<string, unknown>;
    removedFields: string[];
  };
}

interface GenericChangeStream {
  on(event: string, listener: (change: ChangeStreamDocument) => void): void;
  close(): void;
}

interface ChatMessage {
  _id: string;
  meetingId: string;
  content: string;
  sender: string;
  timestamp: Date;
  [key: string]: unknown;
}

let chatChangeStream: GenericChangeStream | null = null;
let participantChangeStream: GenericChangeStream | null = null;

export async function initializeChatChangeStream(
  meetingId: string,
  callback: (data: ChatMessage) => void
) {
  if (chatChangeStream) {
    return;
  }

  try {
    await dbConnect();
    const collection = mongoose.connection.collection("chatmessages");

    // Create a change stream for the specific meeting's chat messages
    chatChangeStream = collection.watch([
      {
        $match: {
          "fullDocument.meetingId": meetingId,
          operationType: { $in: ["insert"] },
        },
      },
    ]) as unknown as GenericChangeStream;

    // Set up the change stream listener
    chatChangeStream.on("change", (change: ChangeStreamDocument) => {
      if (change.operationType === "insert" && change.fullDocument) {
        callback(change.fullDocument as ChatMessage);
      }
    });

    return () => {
      if (chatChangeStream) {
        chatChangeStream.close();
        chatChangeStream = null;
      }
    };
  } catch (error: unknown) {
    console.error("Error initializing chat change stream:", error);
    throw error;
  }
}

export async function initializeParticipantChangeStream(
  meetingId: string,
  callback: (data: {
    meetingId: string;
    participants: Record<string, unknown>;
  }) => void
) {
  if (participantChangeStream) {
    return;
  }

  try {
    await dbConnect();
    const collection = mongoose.connection.collection("meetings");

    // Create a change stream for the specific meeting's participant updates
    participantChangeStream = collection.watch([
      {
        $match: {
          "documentKey._id": meetingId,
          operationType: { $in: ["update"] },
        },
      },
    ]) as unknown as GenericChangeStream;

    // Set up the change stream listener
    participantChangeStream.on("change", (change: ChangeStreamDocument) => {
      if (change.operationType === "update" && change.updateDescription) {
        const updatedFields = change.updateDescription.updatedFields || {};

        // Check if any participant fields were updated
        const participantUpdates = Object.keys(updatedFields)
          .filter((field) => field.startsWith("participants"))
          .reduce((obj: Record<string, unknown>, key) => {
            obj[key] = updatedFields[key];
            return obj;
          }, {});

        if (Object.keys(participantUpdates).length > 0) {
          callback({
            meetingId,
            participants: participantUpdates,
          });
        }
      }
    });

    return () => {
      if (participantChangeStream) {
        participantChangeStream.close();
        participantChangeStream = null;
      }
    };
  } catch (error: unknown) {
    console.error("Error initializing participant change stream:", error);
    throw error;
  }
}
