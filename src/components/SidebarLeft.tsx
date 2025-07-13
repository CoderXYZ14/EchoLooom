"use client";

import React from "react";
import { motion, MotionValue } from "motion/react";
import { Clock, ChevronRight, Play, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface MeetingHistoryItem {
  id: string;
  name: string;
  time: string;
  duration: string;
  scheduledTime: Date;
  dailyRoomName: string;
  isHost: boolean;
}

interface SidebarLeftProps {
  currentTime: Date;
  pastMeetings: MeetingHistoryItem[];
  glowEffect: MotionValue<string>;
  loadingPastMeetings: boolean;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({
  currentTime,
  pastMeetings,
  glowEffect,
  loadingPastMeetings,
}) => {
  const { data: session } = useSession();

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

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <motion.div
      className="w-72 p-4 border-r border-border/50 backdrop-blur-md bg-card/30 flex flex-col"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Logo */}
      <Link href="/">
        <motion.div
          className="flex items-center gap-2 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
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
          <span className="text-xl font-bold text-foreground">EchoLoom</span>
        </motion.div>
      </Link>

      {/* Clock Section */}
      <Card className="mb-4 p-4 bg-card/50 backdrop-blur-md border-border/50">
        <motion.div className="text-center" style={{ textShadow: glowEffect }}>
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
          {loadingPastMeetings ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
            </div>
          ) : pastMeetings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">No past meetings</p>
            </div>
          ) : (
            pastMeetings.map((meeting, index) => (
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
            ))
          )}
        </div>
        {!loadingPastMeetings && pastMeetings.length >= 5 && (
          <Link href="/dashboard/meeting-history">
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-xs text-primary hover:text-primary/80"
            >
              View All
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        )}
      </Card>

      {/* User Section */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
                {session?.user?.name
                  ? session.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </div>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {session?.user?.name || "User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {session?.user?.email}
            </span>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SidebarLeft;
