import clientPromise from "./db";
import { ChangeStream, ChangeStreamDocument, Document } from "mongodb";

let chatChangeStream: ChangeStream | null = null;
let participantChangeStream: ChangeStream | null = null;

export async function initializeChatChangeStream(
  meetingId: string,
  callback: (data: any) => void
) {
  if (chatChangeStream) {
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("chatmessages");

    // Create a change stream for the specific meeting's chat messages
    chatChangeStream = collection.watch([
      {
        $match: {
          "fullDocument.meetingId": meetingId,
          operationType: { $in: ["insert"] },
        },
      },
    ]);

    // Set up the change stream listener
    chatChangeStream.on("change", (change: ChangeStreamDocument<Document>) => {
      if (change.operationType === "insert" && change.fullDocument) {
        callback(change.fullDocument);
      }
    });

    return () => {
      if (chatChangeStream) {
        chatChangeStream.close();
        chatChangeStream = null;
      }
    };
  } catch (error) {
    console.error("Error initializing chat change stream:", error);
    throw error;
  }
}

export async function initializeParticipantChangeStream(
  meetingId: string,
  callback: (data: any) => void
) {
  if (participantChangeStream) {
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("meetings");

    // Create a change stream for the specific meeting's participant updates
    participantChangeStream = collection.watch([
      {
        $match: {
          "documentKey._id": meetingId,
          operationType: { $in: ["update"] },
        },
      },
    ]);

    // Set up the change stream listener
    participantChangeStream.on(
      "change",
      (change: ChangeStreamDocument<Document>) => {
        if (
          change.operationType === "update" &&
          "updateDescription" in change
        ) {
          const updateChange = change as any; // Type assertion for updateDescription
          const updatedFields =
            updateChange.updateDescription?.updatedFields || {};

          // Check if any participant fields were updated
          const participantUpdates = Object.keys(updatedFields)
            .filter((field) => field.startsWith("participants"))
            .reduce((obj: Record<string, any>, key) => {
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
      }
    );

    return () => {
      if (participantChangeStream) {
        participantChangeStream.close();
        participantChangeStream = null;
      }
    };
  } catch (error) {
    console.error("Error initializing participant change stream:", error);
    throw error;
  }
}
