"use client";

import React from "react";
import { motion } from "motion/react";
import { Calendar, Users, Umbrella } from "lucide-react";

import { Card } from "@/components/ui/card";

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

interface SidebarRightProps {
  upcomingMeetings: UpcomingMeeting[];
  loadingUpcomingMeetings?: boolean;
  onMeetingClick?: (meeting: UpcomingMeeting, status: MeetingStatus) => void;
}

interface MeetingStatus {
  isLive: boolean;
  isUpcoming: boolean;
  hasEnded: boolean;
  startsWithin15Min: boolean;
}

const SidebarRight: React.FC<SidebarRightProps> = ({
  upcomingMeetings,
  loadingUpcomingMeetings = false,
  onMeetingClick,
}) => {
  const handleMeetingClick = (
    meeting: UpcomingMeeting,
    status: MeetingStatus
  ) => {
    if (onMeetingClick) {
      onMeetingClick(meeting, status);
    } else {
      // Default behavior - open meeting in new tab
      window.open(`/meeting/${meeting.dailyRoomName}`, "_blank");
    }
  };
  return (
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
        {loadingUpcomingMeetings ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : upcomingMeetings.length > 0 ? (
          <div className="space-y-2">
            {upcomingMeetings.map((meeting, index) => {
              const now = new Date();
              const meetingStart = new Date(meeting.scheduledTime);
              const meetingEnd = new Date(
                meetingStart.getTime() + meeting.duration * 60000
              );

              // Determine meeting status
              const isLive = now >= meetingStart && now <= meetingEnd;
              const isUpcoming = now < meetingStart;
              const hasEnded = now > meetingEnd;

              // Check if meeting starts within 15 minutes
              const startsWithin15Min =
                meetingStart.getTime() - now.getTime() <= 15 * 60 * 1000 &&
                isUpcoming;

              return (
                <motion.div
                  key={meeting.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isLive
                      ? "border-green-500/50 bg-green-500/10 hover:bg-green-500/20"
                      : startsWithin15Min
                      ? "border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20"
                      : "border-border/50 hover:bg-accent/10"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  onClick={() =>
                    handleMeetingClick(meeting, {
                      isLive,
                      isUpcoming,
                      hasEnded,
                      startsWithin15Min,
                    })
                  }
                >
                  <div className="font-medium text-xs">{meeting.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {meeting.time}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <Users className="w-3 h-3 mr-1" />
                    {meeting.participants} participants
                  </div>
                  {isLive && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      • Live now
                    </div>
                  )}
                  {startsWithin15Min && (
                    <div className="text-xs text-yellow-600 font-medium mt-1">
                      • Starting soon
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Umbrella className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-3">
              No meetings scheduled
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default SidebarRight;
