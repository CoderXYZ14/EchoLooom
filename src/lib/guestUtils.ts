import dbConnect from "./db";
import UserModel, { User } from "@/models/User";
import MeetingModel from "@/models/Meeting";
import mongoose from "mongoose";

export interface GuestUser {
  name: string;
  email: string;
  isGuest: true;
}

/**
 * Creates or updates a guest user for joining meetings
 */
export async function createGuestUser(
  name: string,
  email: string,
  meetingId: mongoose.Types.ObjectId
) {
  await dbConnect();

  // Check if user exists
  let user = await UserModel.findOne({ email });

  if (!user) {
    // Create new guest user
    user = await UserModel.create({
      email,
      name,
      meetings: [meetingId],
      // No googleId for guest users - will be added when they sign up
    });
  } else {
    // Update existing user
    if (user.name !== name) {
      user.name = name;
    }
    if (!user.meetings.includes(meetingId)) {
      user.meetings.push(meetingId);
    }
    await user.save();
  }

  return user;
}

/**
 * Checks if a user is a guest (no Google ID)
 */
export function isGuestUser(user: User): boolean {
  return !user.googleId;
}

/**
 * Gets meeting history for both guest and authenticated users
 */
export async function getUserMeetingHistory(email: string) {
  await dbConnect();

  const user = await UserModel.findOne({ email })
    .populate({
      path: "meetings",
      model: MeetingModel,
      populate: {
        path: "hostId",
        model: UserModel,
        select: "email name",
      },
    })
    .lean();

  return user;
}

/**
 * Merges guest account with Google account (called during sign-in)
 */
export async function mergeGuestAccount(
  email: string,
  googleId: string,
  googleName: string,
  googleImage?: string
) {
  await dbConnect();

  const user = await UserModel.findOne({ email });

  if (!user) {
    // Create new user if doesn't exist
    return await UserModel.create({
      email,
      name: googleName,
      image: googleImage,
      googleId,
      meetings: [],
    });
  }

  // Update existing user (guest -> full account)
  let updated = false;

  if (!user.googleId) {
    user.googleId = googleId;
    updated = true;
  }

  if (!user.image && googleImage) {
    user.image = googleImage;
    updated = true;
  }

  // Update name if it's generic or different
  if (
    !user.name ||
    user.name === email.split("@")[0] ||
    (googleName && googleName !== user.name)
  ) {
    user.name = googleName || user.name;
    updated = true;
  }

  if (updated) {
    await user.save();
  }

  return user;
}

/**
 * Adds a user to a meeting as a participant
 */
export async function addUserToMeeting(
  userId: string,
  email: string,
  name: string,
  meetingId: mongoose.Types.ObjectId
) {
  await dbConnect();

  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) {
    throw new Error("Meeting not found");
  }

  // Check if user is already a participant
  const existingParticipant = meeting.participants.find(
    (p) => p.email === email
  );

  if (!existingParticipant) {
    meeting.participants.push({
      userId,
      email,
      name,
      joined: false,
    });
    await meeting.save();
  }

  return meeting;
}

/**
 * Formats user data for frontend consumption
 */
export function formatUserForFrontend(user: User, isGuest: boolean = false) {
  return {
    id: user._id?.toString() || user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    isGuest,
    hasGoogleAccount: !!user.googleId,
  };
}
