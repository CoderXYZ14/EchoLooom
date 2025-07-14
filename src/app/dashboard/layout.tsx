"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
} from "motion/react";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import { useSession } from "next-auth/react";
import axios from "axios";

interface MeetingHistoryItem {
  id: string;
  name: string;
  time: string;
  duration: string;
  scheduledTime: Date;
  dailyRoomName: string;
  isHost: boolean;
  participants: number;
}

interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  participants: number;
  scheduledTime: Date;
  dailyRoomName: string;
  isHost: boolean;
  duration: number;
}

const GRADIENT_COLORS = ["#00D4FF", "#7C3AED", "#EC4899", "#F59E0B"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pastMeetings, setPastMeetings] = useState<MeetingHistoryItem[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>(
    []
  );
  const [loadingPastMeetings, setLoadingPastMeetings] = useState(true);
  const [loadingUpcomingMeetings, setLoadingUpcomingMeetings] = useState(true);
  const color = useMotionValue(GRADIENT_COLORS[0]);

  // Meeting status interface
  interface MeetingStatus {
    isLive: boolean;
    isUpcoming: boolean;
    hasEnded: boolean;
    startsWithin15Min: boolean;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    animate(color, GRADIENT_COLORS, {
      ease: "easeInOut",
      duration: 8,
      repeat: Infinity,
      repeatType: "mirror",
    });

    return () => clearInterval(timer);
  }, [color]);

  useEffect(() => {
    fetchPastMeetings();
    fetchUpcomingMeetings();
  }, []);

  const fetchPastMeetings = async () => {
    try {
      setLoadingPastMeetings(true);
      const response = await axios.get("/api/meetings/past");
      if (response.data.success) {
        setPastMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error("Error fetching past meetings:", error);
    } finally {
      setLoadingPastMeetings(false);
    }
  };

  const fetchUpcomingMeetings = async () => {
    try {
      setLoadingUpcomingMeetings(true);
      const response = await axios.get("/api/meetings/upcoming");
      if (response.data.success) {
        setUpcomingMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error("Error fetching upcoming meetings:", error);
    } finally {
      setLoadingUpcomingMeetings(false);
    }
  };

  const backgroundGradient = useMotionTemplate`radial-gradient(circle at 50% 50%, ${color}15 0%, transparent 50%)`;
  const glowEffect = useMotionTemplate`0 0 20px ${color}40`;

  const handleMeetingClick = (
    meeting: UpcomingMeeting,
    status: MeetingStatus
  ) => {
    const now = new Date();
    const meetingStart = new Date(meeting.scheduledTime);
    const meetingEnd = new Date(
      meetingStart.getTime() + meeting.duration * 60000
    );

    // Only prevent joining if meeting has ended
    if (status.hasEnded) {
      alert(
        `This meeting has ended. It was scheduled for ${meetingStart.toLocaleString()} and ended at ${meetingEnd.toLocaleString()}.`
      );
      return;
    }

    // Allow joining for all other cases - live, starting soon, or upcoming
    // Just show appropriate confirmation messages

    if (status.isLive) {
      // Meeting is live - join immediately
      window.open(`/meeting/${meeting.dailyRoomName}`, "_blank");
      return;
    }

    if (status.startsWithin15Min) {
      // Meeting starting soon - confirm and join
      if (
        confirm(
          `Meeting "${
            meeting.title
          }" is starting soon at ${meetingStart.toLocaleString()}. Would you like to join now?`
        )
      ) {
        window.open(`/meeting/${meeting.dailyRoomName}`, "_blank");
      }
      return;
    }

    if (status.isUpcoming) {
      // Meeting is upcoming - confirm and allow early join
      const timeUntilStart = Math.ceil(
        (meetingStart.getTime() - now.getTime()) / (1000 * 60)
      );
      if (
        confirm(
          `Meeting "${
            meeting.title
          }" is scheduled to start in ${timeUntilStart} minutes at ${meetingStart.toLocaleString()}. Would you like to join early?`
        )
      ) {
        window.open(`/meeting/${meeting.dailyRoomName}`, "_blank");
      }
      return;
    }

    // Fallback - join anyway
    window.open(`/meeting/${meeting.dailyRoomName}`, "_blank");
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <motion.div
              className="w-4 h-4 rounded-full bg-white"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <span className="text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-screen overflow-hidden bg-background text-foreground flex"
      style={{ backgroundImage: backgroundGradient }}
    >
      <div className="flex flex-1 h-full">
        {/* Left Sidebar */}
        <SidebarLeft
          currentTime={currentTime}
          pastMeetings={pastMeetings}
          glowEffect={glowEffect}
          loadingPastMeetings={loadingPastMeetings}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Right Sidebar */}
        <SidebarRight
          upcomingMeetings={upcomingMeetings}
          loadingUpcomingMeetings={loadingUpcomingMeetings}
          onMeetingClick={handleMeetingClick}
        />
      </div>
    </motion.div>
  );
}
