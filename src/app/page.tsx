import Image from "next/image";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">
          Welcome, {session.user.name}
        </h1>
        <div className="flex flex-col gap-4">
          <p>Signed in as {session.user.email}</p>
          <Link
            href="/api/auth/signout"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign out
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">EchoLoom</h1>
      <div className="flex flex-col gap-4">
        <Link
          href="/api/auth/signin/google"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign in with Google
        </Link>
      </div>
    </main>
  );
}
