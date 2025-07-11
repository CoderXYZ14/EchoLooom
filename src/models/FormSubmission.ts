import mongoose, { Schema, Document } from "mongoose";

export interface FormSubmission extends Document {
  meetingId: mongoose.Types.ObjectId;
  participantId: string;
  participantEmail: string;
  participantName: string;
  responses: any;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FormSubmissionSchema: Schema<FormSubmission> = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: "Meeting", required: true },
    participantId: { type: String, required: true },
    participantEmail: { type: String, required: true },
    participantName: { type: String, required: true },
    responses: { type: Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const FormSubmissionModel =
  mongoose.models.FormSubmission ||
  mongoose.model<FormSubmission>("FormSubmission", FormSubmissionSchema);
export default FormSubmissionModel as mongoose.Model<FormSubmission>;
