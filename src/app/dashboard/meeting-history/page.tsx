"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Clock,
  Users,
  Search,
  ChevronDown,
  ArrowLeft,
  Video,
  Crown,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useDashboard } from "@/contexts/DashboardContext";

interface MeetingHistoryItem {
  id: string;
  name: string;
  time: string;
  duration: string;
  scheduledTime: Date;
  dailyRoomName: string;
  isHost: boolean;
  fullDate: string;
  participants: number;
  participantDetails: Array<{
    email: string;
    name: string;
    joined: boolean;
    joinTime?: Date;
  }>;
  hostEmail: string;
  hostName: string;
}

const MeetingHistoryPage = () => {
  const { data: session } = useSession();
  const { removePastMeeting, clearAllPastMeetings } = useDashboard();
  const [meetings, setMeetings] = useState<MeetingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMeetings, setFilteredMeetings] = useState<
    MeetingHistoryItem[]
  >([]);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    fetchMeetingHistory();
  }, []);

  useEffect(() => {
    const filtered = meetings.filter(
      (meeting) =>
        meeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.fullDate.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMeetings(filtered);
  }, [meetings, searchTerm]);

  const fetchMeetingHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/meetings/history");
      if (response.data.success) {
        setMeetings(response.data.meetings);
      }
    } catch (error: unknown) {
      console.error("MeetingHistoryPage | Fetch history failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    const actionText = meeting?.isHost
      ? "delete this meeting"
      : "remove this meeting from your history";

    if (
      !confirm(
        `Are you sure you want to ${actionText}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingMeeting(meetingId);
      const response = await axios.delete(
        `/api/meetings/delete?id=${meetingId}`
      );

      if (response.data.success) {
        setMeetings((prev) =>
          prev.filter((meeting) => meeting.id !== meetingId)
        );
        setFilteredMeetings((prev) =>
          prev.filter((meeting) => meeting.id !== meetingId)
        );
        setExpandedMeeting(null);

        removePastMeeting(meetingId);

        toast.success(
          response.data.message || "Operation completed successfully"
        );
      } else {
        toast.error(response.data.error || `Failed to ${actionText}`);
      }
    } catch (error: unknown) {
      console.error("MeetingHistoryPage | Delete meeting failed:", error);
      toast.error(
        `Failed to ${actionText}: ${
          (error as Error).message || "Unknown error"
        }`
      );
    } finally {
      setDeletingMeeting(null);
    }
  };

  const clearAllHistory = async () => {
    if (
      !confirm(
        `Are you sure you want to clear all meeting history? This will remove ${meetings.length} meetings from your history. This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setClearingAll(true);

      const deletePromises = meetings.map((meeting) =>
        axios.delete(`/api/meetings/delete?id=${meeting.id}`)
      );

      await Promise.all(deletePromises);

      setMeetings([]);
      setFilteredMeetings([]);
      setExpandedMeeting(null);

      clearAllPastMeetings();

      toast.success("All meeting history cleared successfully");
    } catch (error: unknown) {
      console.error("MeetingHistoryPage | Clear all history failed:", error);
      toast.error("Failed to clear all history");
    } finally {
      setClearingAll(false);
    }
  };

  const groupMeetingsByDate = (meetings: MeetingHistoryItem[]) => {
    const groups: { [key: string]: MeetingHistoryItem[] } = {};

    meetings.forEach((meeting) => {
      const date = new Date(meeting.scheduledTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meeting);
    });

    return groups;
  };

  const groupedMeetings = groupMeetingsByDate(filteredMeetings);
  const sortedDates = Object.keys(groupedMeetings).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Meeting History
                </h1>
                <p className="text-sm text-muted-foreground">
                  {meetings.length} meetings • All your past conversations
                </p>
              </div>
            </div>

            {meetings.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={clearAllHistory}
                disabled={clearingAll}
              >
                {clearingAll ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    Clearing...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Clear All History
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 bg-background/50 border-border/50 focus:border-primary text-sm"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"
            />
          </div>
        ) : meetings.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <Video className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No meetings yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start your first meeting to see it appear here
            </p>
            <Link href="/dashboard">
              <Button size="sm">Start New Meeting</Button>
            </Link>
          </motion.div>
        ) : filteredMeetings.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No meetings found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date, dateIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: dateIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-base font-semibold text-foreground">
                    {date}
                  </h2>
                  <div className="flex-1 h-px bg-border"></div>
                  <Badge variant="outline" className="text-xs">
                    {groupedMeetings[date].length}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {groupedMeetings[date].map((meeting, meetingIndex) => (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: meetingIndex * 0.05 }}
                      whileHover={{ scale: 1.005 }}
                    >
                      <Card className="p-3 bg-card/50 backdrop-blur-md border-border/50 hover:border-border transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                              <Video className="w-4 h-4 text-primary" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {meeting.name}
                                </h3>
                                {meeting.isHost && (
                                  <div title="You hosted this meeting">
                                    <Crown className="w-3 h-3 text-yellow-500" />
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {meeting.time} • {meeting.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {meeting.participants}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMeeting(
                                  expandedMeeting === meeting.id
                                    ? null
                                    : meeting.id
                                );
                              }}
                            >
                              {expandedMeeting === meeting.id
                                ? "Hide"
                                : "Details"}
                              <ChevronDown
                                className={`w-3 h-3 ml-1 transition-transform ${
                                  expandedMeeting === meeting.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </Button>
                          </div>
                        </div>

                        {expandedMeeting === meeting.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 pt-3 border-t border-border/50"
                          >
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-xs font-semibold text-foreground mb-2">
                                  Meeting Details
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Room ID:
                                    </span>
                                    <span className="ml-2 text-foreground font-mono text-xs">
                                      {meeting.dailyRoomName}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Duration:
                                    </span>
                                    <span className="ml-2 text-foreground">
                                      {meeting.duration}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Host:
                                    </span>
                                    <span className="ml-2 text-foreground">
                                      {meeting.hostEmail}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Date:
                                    </span>
                                    <span className="ml-2 text-foreground">
                                      {meeting.fullDate}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-semibold text-foreground mb-2">
                                  Participants ({meeting.participants})
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                      <Crown className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs font-medium text-foreground">
                                        {meeting.hostName}{" "}
                                        {meeting.hostEmail ===
                                        session?.user?.email
                                          ? "(You)"
                                          : ""}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Host • {meeting.hostEmail}
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs h-5"
                                    >
                                      Host
                                    </Badge>
                                  </div>

                                  {meeting.participantDetails.map(
                                    (participant, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 rounded-md bg-muted/20"
                                      >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                          <span className="text-white text-xs font-semibold">
                                            {participant.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-xs font-medium text-foreground">
                                            {participant.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {participant.email}
                                          </div>
                                        </div>
                                        <Badge
                                          variant={
                                            participant.joined
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs h-5"
                                        >
                                          {participant.joined
                                            ? "Joined"
                                            : "Invited"}
                                        </Badge>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="pt-3 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-xs font-semibold text-foreground mb-1">
                                      Danger Zone
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      {meeting.isHost
                                        ? "Delete this meeting for everyone. This action cannot be undone."
                                        : "Remove this meeting from your history. This won't affect other participants."}
                                    </p>
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1 h-7 px-3 text-xs"
                                    onClick={() => deleteMeeting(meeting.id)}
                                    disabled={deletingMeeting === meeting.id}
                                  >
                                    {deletingMeeting === meeting.id ? (
                                      <>
                                        <motion.div
                                          animate={{ rotate: 360 }}
                                          transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                          }}
                                          className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                                        />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="w-3 h-3" />
                                        {meeting.isHost ? "Delete" : "Remove"}
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingHistoryPage;
