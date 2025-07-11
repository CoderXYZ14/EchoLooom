import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Meetings</h1>
        <Link
          href="/meetings/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Meeting
        </Link>
      </div>

      <div className="grid gap-4">
        {/* Meeting list will be populated here */}
        <p className="text-gray-500">
          No meetings scheduled yet. Create your first meeting!
        </p>
      </div>
    </main>
  );
}
