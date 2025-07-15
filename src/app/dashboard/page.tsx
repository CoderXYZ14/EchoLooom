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

import { useSession } from "next-auth/react";
import { useDashboard } from "@/contexts/DashboardContext";
import axios from "axios";
import { toast } from "sonner";

const GRADIENT_COLORS = ["#00D4FF", "#7C3AED", "#EC4899", "#F59E0B"];

const EchoLoomDashboard = () => {
  const { status } = useSession();
  const { addNewMeetingToState } = useDashboard();
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
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false);

  const color = useMotionValue(GRADIENT_COLORS[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      // setCurrentTime(new Date()); // This line was removed
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

  const closeModal = () => {
    setModalType(null);
    setShowJoinInput(false);
    setMeetingCode("");
    setScheduleData({ title: "", date: undefined, emails: "", duration: "30" });
    setNewMeetingTitle("");
    // Reset loading states
    setIsCreatingMeeting(false);
    setIsSchedulingMeeting(false);
    setIsJoiningMeeting(false);
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

  const joinMeeting = async () => {
    if (!meetingCode.trim()) {
      toast.error("Meeting code is required");
      return;
    }

    setIsJoiningMeeting(true);
    try {
      // Redirect to our custom meeting room
      const roomName = meetingCode.trim();
      window.open(`/meeting/${roomName}`, "_blank");
      closeModal();
    } catch (error: unknown) {
      console.error("Error joining meeting:", error);
      toast.error("Failed to join meeting");
    } finally {
      setIsJoiningMeeting(false);
    }
  };

  const createInstantMeeting = async () => {
    if (!newMeetingTitle.trim()) {
      toast.error("Meeting title is required");
      return;
    }

    setIsCreatingMeeting(true);
    try {
      const response = await axios.post("/api/meetings/create", {
        title: newMeetingTitle.trim(),
        duration: 60, // Default 1 hour
      });

      if (response.data.success) {
        // Redirect to our custom meeting room instead of Daily.co domain
        const roomName = response.data.meeting.dailyRoomName;
        window.open(`/meeting/${roomName}`, "_blank");
        closeModal();
      } else {
        toast.error(response.data.error || "Failed to create meeting");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Failed to create meeting");
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const scheduleMeeting = async () => {
    if (!scheduleData.title.trim()) {
      toast.error("Meeting title is required");
      return;
    }

    if (!scheduleData.date) {
      toast.error("Meeting date and time is required");
      return;
    }

    if (!scheduleData.duration) {
      toast.error("Meeting duration is required");
      return;
    }

    setIsSchedulingMeeting(true);

    // Create optimistic meeting object
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMeeting = {
      id: optimisticId,
      title: scheduleData.title.trim(),
      scheduledTime: scheduleData.date.toISOString(),
      duration: parseInt(scheduleData.duration),
      participants: scheduleData.emails.trim()
        ? scheduleData.emails.split(",").length
        : 0,
      dailyRoomName: `echoloom-${Date.now()}`, // Temporary room name
    };

    // Add to state immediately for optimistic UI
    addNewMeetingToState(optimisticMeeting);
    closeModal(); // Close modal immediately

    try {
      const requestData = {
        title: scheduleData.title.trim(),
        scheduledTime: scheduleData.date.toISOString(),
        duration: parseInt(scheduleData.duration),
        participantEmails: scheduleData.emails.trim(),
      };

      const response = await axios.post("/api/meetings/schedule", requestData);

      if (response.data.success) {
        // Replace the optimistic meeting with real data
        const realMeeting = response.data.meeting;
        addNewMeetingToState(realMeeting, optimisticId);
        console.log("Meeting scheduled successfully!");
      } else {
        toast.error(response.data.error || "Failed to schedule meeting");
      }
    } catch (error: unknown) {
      console.error("Error scheduling meeting:", error);
      if (error instanceof Error) {
        toast.error(`Failed to schedule meeting: ${error.message}`);
      } else {
        toast.error("Failed to schedule meeting");
      }
    } finally {
      setIsSchedulingMeeting(false);
    }
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
                  onClick={joinMeeting}
                  disabled={isJoiningMeeting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isJoiningMeeting ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      />
                      Joining...
                    </div>
                  ) : (
                    "Join"
                  )}
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
              <DateTimePicker
                value={scheduleData.date}
                onChange={(date: Date | undefined) =>
                  setScheduleData((prev) => ({ ...prev, date }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emails">Participant Emails (Optional)</Label>
              <Input
                id="emails"
                value={scheduleData.emails}
                onChange={(e) =>
                  setScheduleData((prev) => ({
                    ...prev,
                    emails: e.target.value,
                  }))
                }
                placeholder="email1@example.com, email2@example.com (optional)"
                className="bg-background/50 border-border/50 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to create a meeting without inviting participants
              </p>
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
              onClick={scheduleMeeting}
              disabled={isSchedulingMeeting}
            >
              {isSchedulingMeeting ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  Scheduling...
                </div>
              ) : (
                "Schedule Meeting"
              )}
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
              <Label htmlFor="newTitle">Meeting Title</Label>
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
              onClick={createInstantMeeting}
              disabled={isCreatingMeeting}
            >
              {isCreatingMeeting ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  Creating...
                </div>
              ) : (
                "Start Now"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </motion.div>
  );
};

export default EchoLoomDashboard;
