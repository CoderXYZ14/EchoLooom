import MeetingWrapper from "@/components/MeetingWrapper";

interface MeetingPageProps {
  params: Promise<{
    roomName: string;
  }>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { roomName } = await params;
  const subdomain = process.env.NEXT_PUBLIC_DAILY_SUBDOMAIN || "echoloom";

  const roomUrl = `https://${subdomain}.daily.co/${roomName}`;

  return <MeetingWrapper roomUrl={roomUrl} roomName={roomName} />;
}
