import mongoose, { Schema, Document } from "mongoose";

export interface Contact extends Document {
  name: string;
  email: string;
  details: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema<Contact> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    details: { type: String, required: true, trim: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ContactModel =
  mongoose.models.Contact || mongoose.model<Contact>("Contact", ContactSchema);

export default ContactModel as mongoose.Model<Contact>;
