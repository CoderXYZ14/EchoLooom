"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MeetingStatusCheckProps {
  roomName: string;
  onProceed: () => void;
  onCancel: () => void;
}

interface MeetingInfo {
  id?: string;
  title: string;
  scheduledTime: Date;
  duration: number;
  isHost?: boolean;
  participants: number;
  dailyRoomName?: string;
  hostName?: string;
  hostEmail?: string;
  isValidRoom?: boolean;
}

export default function MeetingStatusCheck({
  roomName,
  onProceed,
  onCancel,
}: MeetingStatusCheckProps) {
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!meetingInfo && !error) {
      fetchMeetingInfo();
    }
  }, [roomName]);

  const fetchMeetingInfo = async () => {
    try {
      setLoading(true);

      // Reduce timeout to prevent hanging - 5 seconds is enough
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await axios.get(
        `/api/meetings/info?roomName=${roomName}`,
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      clearTimeout(timeoutId);

      const data = response.data;

      if (response.status === 200) {
        let scheduledTime = new Date(data.meeting.scheduledTime);

        if (isNaN(scheduledTime.getTime())) {
          console.error(
            "MeetingStatusCheck | Invalid scheduledTime format:",
            data.meeting.scheduledTime
          );
          scheduledTime = new Date();
        }

        const meetingInfo = {
          id: data.meeting.id || "unknown",
          title: data.meeting.title || "Meeting Room",
          scheduledTime,
          duration: data.meeting.duration || 60,
          isHost: data.meeting.isHost || false,
          participants: data.meeting.participants || 1,
          dailyRoomName: data.meeting.dailyRoomName || roomName,
          hostName: data.meeting.hostName,
          hostEmail: data.meeting.hostEmail,
          isValidRoom: true,
        };
        setMeetingInfo(meetingInfo);
        setError(null);
      } else {
        if (response.status === 404 || response.status === 401) {
          setError(null);
          onProceed();
          return;
        }
        setError(data.error || "Failed to fetch meeting info");
      }
    } catch (err) {
      console.error("MeetingStatusCheck | API fetch error:", err);
      if (axios.isCancel(err)) {
        onProceed();
        return;
      } else {
        onProceed();
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Checking meeting status...
          </h2>
          <p className="text-muted-foreground">Room: {roomName}</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={onProceed} variant="outline">
              Join Anyway
            </Button>
            <Button onClick={onCancel}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meetingInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Meeting Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            {error || "This meeting room doesn't exist or has been deleted."}
          </p>
          <Button onClick={onCancel} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!meetingInfo.scheduledTime || !meetingInfo.duration) {
    console.error("MeetingStatusCheck | Missing required meeting data:", {
      hasScheduledTime: !!meetingInfo.scheduledTime,
      hasDuration: !!meetingInfo.duration,
      meetingId: meetingInfo.id,
    });
    onProceed();
    return null;
  }

  const meetingStart = meetingInfo.scheduledTime;
  const meetingEnd = new Date(
    meetingStart.getTime() + meetingInfo.duration * 60000
  );
  const now = currentTime;

  const isLive = now >= meetingStart && now <= meetingEnd;
  const isUpcoming = now < meetingStart;
  const hasEnded = now > meetingEnd;
  const startsWithin15Min =
    meetingStart.getTime() - now.getTime() <= 15 * 60 * 1000 && isUpcoming;

  const timeUntilStart = Math.ceil(
    (meetingStart.getTime() - now.getTime()) / (1000 * 60)
  );
  const timeUntilEnd = Math.ceil(
    (meetingEnd.getTime() - now.getTime()) / (1000 * 60)
  );
  const timeSinceEnd = Math.ceil(
    (now.getTime() - meetingEnd.getTime()) / (1000 * 60)
  );

  if (hasEnded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Meeting Has Ended
          </h2>
          <p className="text-muted-foreground mb-2">
            <strong>{meetingInfo.title}</strong>
          </p>
          <p className="text-muted-foreground mb-4">
            This meeting ended {timeSinceEnd} minutes ago at{" "}
            {meetingEnd.toLocaleString()}.
          </p>
          <Button onClick={onCancel} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (isLive) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Meeting is Live
          </h2>
          <p className="text-muted-foreground mb-2">
            <strong>{meetingInfo.title}</strong>
          </p>
          <p className="text-muted-foreground mb-4">
            This meeting is currently in progress and will end in {timeUntilEnd}{" "}
            minutes.
          </p>
          <div className="flex gap-2">
            <Button onClick={onProceed} className="flex-1">
              Join Meeting
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (startsWithin15Min) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Meeting Starting Soon
          </h2>
          <p className="text-muted-foreground mb-2">
            <strong>{meetingInfo.title}</strong>
          </p>
          <p className="text-muted-foreground mb-4">
            This meeting will start in {timeUntilStart} minutes at{" "}
            {meetingStart.toLocaleString()}.
          </p>
          <div className="flex gap-2">
            <Button onClick={onProceed} className="flex-1">
              Join Early
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isUpcoming) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md text-center">
          <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Meeting Not Started Yet
          </h2>
          <p className="text-muted-foreground mb-2">
            <strong>{meetingInfo.title}</strong>
          </p>
          <p className="text-muted-foreground mb-4">
            This meeting is scheduled to start at{" "}
            {meetingStart.toLocaleString()}. Please return in {timeUntilStart}{" "}
            minutes.
          </p>
          <div className="flex gap-2">
            <Button onClick={onProceed} variant="outline" className="flex-1">
              Join Anyway
            </Button>
            <Button onClick={onCancel}>Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Unable to determine meeting status
        </h2>
        <Button onClick={onCancel}>Go Back</Button>
      </Card>
    </div>
  );
}
