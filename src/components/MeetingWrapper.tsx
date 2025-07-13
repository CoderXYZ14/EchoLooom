"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { DailyProvider } from "@daily-co/daily-react";
import DailyMeeting from "@/components/DailyMeeting";
import { MeetingErrorBoundary } from "@/components/MeetingErrorBoundary";

interface MeetingWrapperProps {
  roomUrl: string;
  roomName: string;
}

export default function MeetingWrapper({ roomUrl }: MeetingWrapperProps) {
  const router = useRouter();

  const handleLeave = () => {
    router.push("/dashboard");
  };

  return (
    <MeetingErrorBoundary>
      <DailyProvider url={roomUrl}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Loading meeting...
                </h2>
                <p className="text-muted-foreground">
                  Setting up your video call...
                </p>
              </div>
            </div>
          }
        >
          <DailyMeeting roomUrl={roomUrl} onLeave={handleLeave} />
        </Suspense>
      </DailyProvider>
    </MeetingErrorBoundary>
  );
}
