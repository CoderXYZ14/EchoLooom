"use client";

import React from "react";
import { motion } from "motion/react";
import { Calendar, Users, Umbrella } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  participants: number;
}

interface SidebarRightProps {
  upcomingMeetings: UpcomingMeeting[];
  onScheduleMeeting: () => void;
}

const SidebarRight: React.FC<SidebarRightProps> = ({
  upcomingMeetings,
  onScheduleMeeting,
}) => {
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
          onClick={onScheduleMeeting}
        >
          + Schedule a meeting
        </Button>
      </Card>
    </motion.div>
  );
};

export default SidebarRight;
