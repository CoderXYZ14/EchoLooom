import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./db";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import { sendWelcomeEmail } from "./email";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          await dbConnect();

          const existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser && account.providerAccountId) {
            const newUser = await UserModel.create({
              email: user.email,
              name: user.name || user.email.split("@")[0],
              image: user.image,
              googleId: account.providerAccountId,
              meetings: [],
            });

            try {
              await sendWelcomeEmail(newUser.name, newUser.email);
            } catch (emailError) {
              console.error(
                "Auth | Welcome email failed for new user:",
                emailError
              );
            }
          } else if (existingUser && account.providerAccountId) {
            // ACCOUNT MERGING: Update existing user with Google info
            // This handles the case where user was created as guest or from meeting invitation

            let updated = false;

            if (!existingUser.googleId) {
              existingUser.googleId = account.providerAccountId;
              updated = true;

              try {
                await sendWelcomeEmail(existingUser.name, existingUser.email);
              } catch (emailError) {
                console.error(
                  "Auth | Welcome email failed for upgraded user:",
                  emailError
                );
              }
            }

            if (!existingUser.image && user.image) {
              existingUser.image = user.image;
              updated = true;
            }

            if (
              !existingUser.name ||
              existingUser.name === user.email.split("@")[0] ||
              (user.name && user.name !== existingUser.name)
            ) {
              existingUser.name = user.name || existingUser.name;
              updated = true;
            }

            if (updated) {
              await existingUser.save();
            }
          }

          return true;
        } catch (error) {
          console.error("Auth | SignIn callback failed:", error);
          return true; // Still allow sign in even if our extra logic fails
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          await dbConnect();
          const dbUser = await UserModel.findOne({ email: user.email });
          if (dbUser) {
            token.id = (dbUser._id as mongoose.Types.ObjectId).toString();
          }
        } catch (error) {
          console.error("Auth | JWT callback failed:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      } else if (session.user?.email) {
        // Fallback: fetch user ID from database if not in token
        try {
          await dbConnect();
          const dbUser = await UserModel.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.id = (
              dbUser._id as mongoose.Types.ObjectId
            ).toString();
          }
        } catch (error) {
          console.error("Auth | Session user ID fetch failed:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
