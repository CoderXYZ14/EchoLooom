import mongoose, { Schema, Document } from "mongoose";

export interface ChatMessage extends Document {
  meetingId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema: Schema<ChatMessage> = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: "Meeting", required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChatMessageModel =
  mongoose.models.ChatMessage ||
  mongoose.model<ChatMessage>("ChatMessage", ChatMessageSchema);
export default ChatMessageModel as mongoose.Model<ChatMessage>;
