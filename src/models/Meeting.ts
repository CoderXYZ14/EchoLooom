import mongoose, { Schema, Document } from "mongoose";

interface Participant {
  userId: string;
  email: string;
  name: string;
  joined: boolean;
  joinTime?: Date;
}

export interface Meeting extends Document {
  title: string;
  description?: string;
  hostId: string;
  dailyRoomName: string;
  scheduledTime: Date;
  duration: number;
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  joined: { type: Boolean, default: false },
  joinTime: { type: Date },
});

const MeetingSchema: Schema<Meeting> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    hostId: { type: String, required: true },
    dailyRoomName: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    participants: [ParticipantSchema],
  },
  { timestamps: true }
);

const MeetingModel =
  mongoose.models.Meeting || mongoose.model<Meeting>("Meeting", MeetingSchema);
export default MeetingModel as mongoose.Model<Meeting>;
