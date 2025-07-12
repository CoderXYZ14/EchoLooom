"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
  AnimatePresence,
} from "motion/react";
import { Video, Plus, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import { useSession } from "next-auth/react";

interface MeetingHistoryItem {
  id: string;
  name: string;
  time: string;
  duration: string;
}

interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  participants: number;
}

const GRADIENT_COLORS = ["#00D4FF", "#7C3AED", "#EC4899", "#F59E0B"];

const EchoLoomDashboard = () => {
  const { data: session, status } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalType, setModalType] = useState<
    "join" | "schedule" | "new" | null
  >(null);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [scheduleData, setScheduleData] = useState({
    title: "",
    date: undefined as Date | undefined,
    emails: "",
    duration: "30",
  });
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
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

  const backgroundGradient = useMotionTemplate`radial-gradient(circle at 50% 50%, ${color}15 0%, transparent 50%)`;
  const glowEffect = useMotionTemplate`0 0 20px ${color}40`;

  const pastMeetings: MeetingHistoryItem[] = [
    { id: "1", name: "Team Standup", time: "2:30 PM", duration: "25 min" },
    { id: "2", name: "Client Review", time: "11:00 AM", duration: "45 min" },
    { id: "3", name: "Design Sync", time: "Yesterday", duration: "30 min" },
    { id: "4", name: "Product Demo", time: "Yesterday", duration: "60 min" },
  ];

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

  const closeModal = () => {
    setModalType(null);
    setShowJoinInput(false);
    setMeetingCode("");
    setScheduleData({ title: "", date: undefined, emails: "", duration: "30" });
    setNewMeetingTitle("");
  };

  const handleJoinMeeting = () => {
    setShowJoinInput(true);
  };

  const handleScheduleMeeting = () => {
    setModalType("schedule");
  };

  const handleNewMeeting = () => {
    setModalType("new");
  };

  const ActionButton = ({
    icon: Icon,
    label,
    color,
    onClick,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
    onClick?: () => void;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-md border-border/50 hover:border-border transition-all duration-300 h-20">
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${color}10, transparent)`,
          }}
        />
        <div className="relative h-full flex items-center justify-center text-center space-x-3">
          <motion.div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: color,
              boxShadow: glowEffect,
            }}
            whileHover={{ rotate: 5 }}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {label}
          </h3>
        </div>
      </Card>
    </motion.div>
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (modalType || showJoinInput) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [modalType, showJoinInput]);

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
      {/* Join Meeting Input */}
      <AnimatePresence>
        {showJoinInput && (
          <motion.div
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="p-4 bg-card/90 backdrop-blur-lg border-border/50 shadow-xl">
              <div className="flex items-center space-x-3">
                <Input
                  placeholder="Enter Meeting Code"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  className="w-64 bg-background/50 border-border/50 focus:border-primary"
                  autoFocus
                />
                <Button
                  onClick={() => {
                    if (meetingCode.trim()) {
                      // Handle join logic here
                      console.log("Joining meeting:", meetingCode);
                      closeModal();
                    }
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Join
                </Button>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Meeting Modal */}
      <Dialog open={modalType === "schedule"} onOpenChange={() => closeModal()}>
        <DialogContent className="bg-card/90 backdrop-blur-lg border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Schedule Meeting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={scheduleData.title}
                onChange={(e) =>
                  setScheduleData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Enter meeting title"
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <DateTimePicker />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emails">Participant Emails</Label>
              <Input
                id="emails"
                value={scheduleData.emails}
                onChange={(e) =>
                  setScheduleData((prev) => ({
                    ...prev,
                    emails: e.target.value,
                  }))
                }
                placeholder="email1@example.com, email2@example.com"
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={scheduleData.duration}
                onValueChange={(value) =>
                  setScheduleData((prev) => ({ ...prev, duration: value }))
                }
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 mt-6"
              onClick={() => {
                console.log("Creating scheduled meeting:", scheduleData);
                closeModal();
              }}
            >
              Create Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Meeting Modal */}
      <Dialog open={modalType === "new"} onOpenChange={() => closeModal()}>
        <DialogContent className="bg-card/90 backdrop-blur-lg border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Start New Meeting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newTitle">Meeting Title (Optional)</Label>
              <Input
                id="newTitle"
                value={newMeetingTitle}
                onChange={(e) => setNewMeetingTitle(e.target.value)}
                placeholder="Enter meeting title"
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 mt-6"
              onClick={() => {
                console.log(
                  "Starting new meeting:",
                  newMeetingTitle || "Untitled Meeting"
                );
                closeModal();
              }}
            >
              Start Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 h-full">
        {/* Left Sidebar */}
        <SidebarLeft
          currentTime={currentTime}
          pastMeetings={pastMeetings}
          glowEffect={glowEffect}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <motion.div
            className="max-w-2xl mx-auto w-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <motion.h1
                className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Welcome back
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Start or join a meeting with just one click
              </motion.p>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
              <ActionButton
                icon={Video}
                label="New Meeting"
                color="#F59E0B"
                onClick={handleNewMeeting}
              />
              <ActionButton
                icon={Plus}
                label="Join Meeting"
                color="#00D4FF"
                onClick={handleJoinMeeting}
              />
              <ActionButton
                icon={Calendar}
                label="Schedule"
                color="#7C3AED"
                onClick={handleScheduleMeeting}
              />
            </div>
          </motion.div>
        </div>

        {/* Right Panel */}
        <SidebarRight
          upcomingMeetings={upcomingMeetings}
          onScheduleMeeting={handleScheduleMeeting}
        />
      </div>
    </motion.div>
  );
};

export default EchoLoomDashboard;
