import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  googleId?: string; // Optional - can be null for users created from meeting invitations
  email: string;
  name: string;
  image?: string;
  meetings: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<User> = new Schema(
  {
    googleId: { type: String, unique: true, sparse: true }, // sparse allows multiple null values
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    meetings: [{ type: Schema.Types.ObjectId, ref: "Meeting" }],
  },
  { timestamps: true }
);

const UserModel =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);
export default UserModel as mongoose.Model<User>;
