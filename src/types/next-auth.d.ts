import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      googleId: string;
      name: string;
      email: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    googleId: string;
    name: string;
    email: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string;
    userId?: string;
  }
}
