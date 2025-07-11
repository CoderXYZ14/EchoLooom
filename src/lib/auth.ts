import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./db";
import UserModel from "@/models/User";

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

          // Check if user exists
          const existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser && account.providerAccountId) {
            // Create new user if they don't exist
            await UserModel.create({
              email: user.email,
              name: user.name || user.email.split("@")[0],
              image: user.image,
              googleId: account.providerAccountId,
              meetings: [],
            });
          } else if (
            existingUser &&
            !existingUser.googleId &&
            account.providerAccountId
          ) {
            // Update existing user with googleId if they don't have one
            existingUser.googleId = account.providerAccountId;
            await existingUser.save();
          }

          return true;
        } catch (error) {
          console.error("NextAuth | signIn error:", error);
          return true; // Still allow sign in even if our extra logic fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.googleId = token.googleId as string;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.googleId = account.providerAccountId;
      }
      return token;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
