import "next-auth";

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
