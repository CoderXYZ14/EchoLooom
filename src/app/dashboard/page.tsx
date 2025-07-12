"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
  AnimatePresence,
} from "motion/react";
import {
  Video,
  Plus,
  Calendar,
  Settings,
  LogOut,
  Clock,
  ChevronRight,
  Umbrella,
  Play,
  X,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

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
        <motion.div
          className="w-72 p-4 border-r border-border/50 backdrop-blur-md bg-card/30 flex flex-col"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Logo */}
          <motion.div
            className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            EchoLoom
          </motion.div>

          {/* Clock Section */}
          <Card className="mb-4 p-4 bg-card/50 backdrop-blur-md border-border/50">
            <motion.div
              className="text-center"
              style={{ textShadow: glowEffect }}
            >
              <motion.div
                className="text-2xl font-bold text-foreground mb-1"
                key={currentTime.getSeconds()}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {formatTime(currentTime)}
              </motion.div>
              <div className="text-xs text-muted-foreground">
                {formatDate(currentTime)}
              </div>
            </motion.div>
          </Card>

          {/* Past Meetings */}
          <Card className="flex-1 p-4 bg-card/50 backdrop-blur-md border-border/50">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Past Meetings
            </h3>
            <div className="space-y-2">
              {pastMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 3 }}
                >
                  <div>
                    <div className="font-medium text-xs group-hover:text-primary transition-colors">
                      {meeting.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {meeting.time} • {meeting.duration}
                    </div>
                  </div>
                  <Play className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-xs text-primary hover:text-primary/80"
            >
              View All
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Card>

          {/* User Section */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <div className="w-full h-full bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  JD
                </div>
              </Avatar>
              <span className="text-xs font-medium">John Doe</span>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Settings className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </motion.div>

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
        <motion.div
          className="w-72 p-4 border-l border-border/50 backdrop-blur-md bg-card/30 flex flex-col"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Upcoming Meetings */}
          <Card className="flex-1 p-4 bg-card/50 backdrop-blur-md border-border/50">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming
            </h3>
            {upcomingMeetings.length > 0 ? (
              <div className="space-y-2">
                {upcomingMeetings.map((meeting, index) => (
                  <motion.div
                    key={meeting.id}
                    className="p-3 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className="font-medium text-xs">{meeting.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {meeting.time}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <Users className="w-3 h-3 mr-1" />
                      {meeting.participants} participants
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Umbrella className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-3">
                  No meetings scheduled
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-xs text-primary"
              onClick={handleScheduleMeeting}
            >
              + Schedule a meeting
            </Button>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EchoLoomDashboard;
