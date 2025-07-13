import MeetingWrapper from "@/components/MeetingWrapper";

interface MeetingPageProps {
  params: Promise<{
    roomName: string;
  }>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { roomName } = await params;
  const subdomain = process.env.NEXT_PUBLIC_DAILY_SUBDOMAIN;

  if (!subdomain) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-gray-400">
            NEXT_PUBLIC_DAILY_SUBDOMAIN environment variable is not set
          </p>
        </div>
      </div>
    );
  }

  const roomUrl = `https://${subdomain}.daily.co/${roomName}`;

  return <MeetingWrapper roomUrl={roomUrl} roomName={roomName} />;
}
