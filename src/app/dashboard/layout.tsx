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
  const [loadingPastMeetings, setLoadingPastMeetings] = useState(true);
  const color = useMotionValue(GRADIENT_COLORS[0]);

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

  const backgroundGradient = useMotionTemplate`radial-gradient(circle at 50% 50%, ${color}15 0%, transparent 50%)`;
  const glowEffect = useMotionTemplate`0 0 20px ${color}40`;

  // Hardcoded upcoming meetings for now
  const upcomingMeetings: UpcomingMeeting[] = [
    {
      id: "1",
      title: "Weekly Planning",
      time: "3:00 PM Today",
      participants: 5,
    },
    {
      id: "2",
      title: "Client Presentation",
      time: "Tomorrow 10:00 AM",
      participants: 8,
    },
  ];

  const handleScheduleMeeting = () => {
    // This will be handled by individual pages
    console.log("Schedule meeting clicked");
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
          onScheduleMeeting={handleScheduleMeeting}
        />
      </div>
    </motion.div>
  );
}
