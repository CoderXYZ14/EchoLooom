"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
  AnimatePresence,
} from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import { EditMeetingDialog } from "@/components/EditMeetingDialog";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";

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

interface RawMeetingData {
  id: string;
  title: string;
  scheduledTime: string | Date;
  duration: number;
  participants?:
    | Array<{ email: string; name: string; joined: boolean }>
    | number;
  dailyRoomName: string;
}

interface MeetingUpdateData {
  title?: string;
  scheduledTime?: string;
  duration?: number;
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
  const [editingMeeting, setEditingMeeting] = useState<UpcomingMeeting | null>(
    null
  );
  const [isUpdatingMeeting, setIsUpdatingMeeting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(isMobileDevice);

      // Close sidebars when switching to mobile
      if (isMobileDevice) {
        setShowLeftSidebar(false);
        setShowRightSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      console.error("DashboardLayout | Past meetings fetch failed:", error);
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
      console.error("DashboardLayout | Upcoming meetings fetch failed:", error);
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
      toast.error(
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

    window.open(`/meeting/${meeting.dailyRoomName}`, "_blank");
  };

  const handleEditMeeting = (meeting: UpcomingMeeting) => {
    setEditingMeeting(meeting);
  };

  const updateMeeting = async (
    meetingId: string,
    updates: MeetingUpdateData
  ) => {
    setIsUpdatingMeeting(true);

    // Optimistic update - update UI immediately
    const originalMeetings = [...upcomingMeetings];
    setUpcomingMeetings((prev) =>
      prev.map((meeting) => {
        if (meeting.id === meetingId) {
          const updatedMeeting = { ...meeting };
          if (updates.title) updatedMeeting.title = updates.title;
          if (updates.scheduledTime) {
            updatedMeeting.scheduledTime = new Date(updates.scheduledTime);
            // Update time display
            const newTime = new Date(updates.scheduledTime);
            const isToday =
              newTime.toDateString() === new Date().toDateString();
            const isTomorrow =
              newTime.toDateString() ===
              new Date(Date.now() + 86400000).toDateString();

            if (isToday) {
              updatedMeeting.time = `${newTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })} Today`;
            } else if (isTomorrow) {
              updatedMeeting.time = `Tomorrow ${newTime.toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }
              )}`;
            } else {
              updatedMeeting.time = newTime.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
            }
          }
          if (updates.duration) updatedMeeting.duration = updates.duration;
          return updatedMeeting;
        }
        return meeting;
      })
    );

    try {
      const response = await axios.put("/api/meetings/update", {
        id: meetingId,
        ...updates,
      });

      if (response.data.success) {
        toast.success("Meeting updated successfully");
        setEditingMeeting(null);
        // Refresh the meetings to get the latest data
        fetchUpcomingMeetings();
      } else {
        throw new Error(response.data.error || "Failed to update meeting");
      }
    } catch (error: unknown) {
      console.error("DashboardLayout | Meeting update failed:", error);
      toast.error("Failed to update meeting");
      // Revert optimistic update
      setUpcomingMeetings(originalMeetings);
    } finally {
      setIsUpdatingMeeting(false);
    }
  };

  const handleDeleteMeeting = async (meeting: UpcomingMeeting) => {
    if (
      !confirm(
        `Are you sure you want to delete "${meeting.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    // Optimistic update - remove from UI immediately
    const originalMeetings = [...upcomingMeetings];
    setUpcomingMeetings((prev) => prev.filter((m) => m.id !== meeting.id));

    try {
      const response = await axios.delete(
        `/api/meetings/delete?id=${meeting.id}`
      );

      if (response.data.success) {
        toast.success("Meeting deleted successfully");
      } else {
        throw new Error(response.data.error || "Failed to delete meeting");
      }
    } catch (error: unknown) {
      console.error("DashboardLayout | Meeting delete failed:", error);
      toast.error("Failed to delete meeting");
      // Revert optimistic update
      setUpcomingMeetings(originalMeetings);
    }
  };

  // Function to remove a meeting from past meetings (for sidebar update)
  const removePastMeeting = (meetingId: string) => {
    setPastMeetings((prev) =>
      prev.filter((meeting) => meeting.id !== meetingId)
    );
  };

  // Function to clear all past meetings (for sidebar update)
  const clearAllPastMeetings = () => {
    setPastMeetings([]);
  };

  const addNewMeetingToState = (
    newMeeting: RawMeetingData,
    replaceId?: string
  ) => {
    // Format the new meeting to match the UpcomingMeeting interface
    const scheduledTime = new Date(newMeeting.scheduledTime);
    const isToday = scheduledTime.toDateString() === new Date().toDateString();
    const isTomorrow =
      scheduledTime.toDateString() ===
      new Date(Date.now() + 86400000).toDateString();

    let timeDisplay;
    if (isToday) {
      timeDisplay = `${scheduledTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })} Today`;
    } else if (isTomorrow) {
      timeDisplay = `Tomorrow ${scheduledTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      timeDisplay = scheduledTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    const formattedMeeting: UpcomingMeeting = {
      id: newMeeting.id,
      title: newMeeting.title,
      time: timeDisplay,
      scheduledTime: scheduledTime,
      dailyRoomName: newMeeting.dailyRoomName,
      isHost: true, // User is always host of meetings they create
      participants:
        (typeof newMeeting.participants === "number"
          ? newMeeting.participants
          : Array.isArray(newMeeting.participants)
          ? newMeeting.participants.length
          : 0) + 1, // +1 for host
      duration: newMeeting.duration,
    };

    // Add to the upcoming meetings and sort by time
    setUpcomingMeetings((prev) => {
      let updated;
      if (replaceId) {
        // Replace the optimistic meeting with the real one
        updated = prev.map((meeting) =>
          meeting.id === replaceId ? formattedMeeting : meeting
        );
      } else {
        // Add new meeting
        updated = [...prev, formattedMeeting];
      }
      return updated.sort(
        (a, b) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
      );
    });
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-8 h-8 border-2 border-current border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="h-screen overflow-hidden bg-background text-foreground flex relative"
      style={{ backgroundImage: backgroundGradient }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <motion.div
          className="absolute top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border/60 p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              <span className="text-lg font-bold">EchoLoom</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                className="p-2"
                title="Toggle Left Sidebar"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className="p-2"
                title="Toggle Right Sidebar"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Overlay for Left Sidebar */}
      <AnimatePresence>
        {isMobile && showLeftSidebar && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLeftSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Overlay for Right Sidebar */}
      <AnimatePresence>
        {isMobile && showRightSidebar && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRightSidebar(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-1 h-full">
        {/* Left Sidebar */}
        <AnimatePresence>
          {(!isMobile || showLeftSidebar) && (
            <motion.div
              className={`${
                isMobile ? "fixed left-0 top-0 bottom-0 z-50 w-80" : "relative"
              }`}
              initial={isMobile ? { x: -320 } : undefined}
              animate={isMobile ? { x: 0 } : undefined}
              exit={isMobile ? { x: -320 } : undefined}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <SidebarLeft
                currentTime={currentTime}
                pastMeetings={pastMeetings}
                glowEffect={glowEffect}
                loadingPastMeetings={loadingPastMeetings}
                isMobile={isMobile}
                onClose={() => setShowLeftSidebar(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${isMobile ? "pt-20" : ""}`}>
          <DashboardProvider
            addNewMeetingToState={addNewMeetingToState}
            upcomingMeetings={upcomingMeetings}
            removePastMeeting={removePastMeeting}
            clearAllPastMeetings={clearAllPastMeetings}
          >
            {children}
          </DashboardProvider>
        </div>

        {/* Right Sidebar */}
        <AnimatePresence>
          {(!isMobile || showRightSidebar) && (
            <motion.div
              className={`${
                isMobile ? "fixed right-0 top-0 bottom-0 z-50 w-80" : "relative"
              }`}
              initial={isMobile ? { x: 320 } : undefined}
              animate={isMobile ? { x: 0 } : undefined}
              exit={isMobile ? { x: 320 } : undefined}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {isMobile && (
                <div className="absolute top-4 left-4 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRightSidebar(false)}
                    className="p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <SidebarRight
                upcomingMeetings={upcomingMeetings}
                loadingUpcomingMeetings={loadingUpcomingMeetings}
                onMeetingClick={handleMeetingClick}
                onEditMeeting={handleEditMeeting}
                onDeleteMeeting={handleDeleteMeeting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Meeting Dialog */}
      <EditMeetingDialog
        meeting={editingMeeting}
        open={editingMeeting !== null}
        onClose={() => setEditingMeeting(null)}
        onSave={updateMeeting}
        isLoading={isUpdatingMeeting}
      />
    </motion.div>
  );
}
