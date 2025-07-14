"use client";

import { useState, useEffect } from "react";

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
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Only fetch once per roomName unless there's an error
    if (!meetingInfo && !error) {
      fetchMeetingInfo();
    }
  }, [roomName]);

  const fetchMeetingInfo = async () => {
    try {
      setLoading(true);

      // Reduce timeout to prevent hanging - 5 seconds is enough
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`/api/meetings/info?roomName=${roomName}`, {
        signal: controller.signal,
        credentials: "include", // Ensure cookies/session are included
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      console.log("API response:", response.status, data);

      if (response.ok) {
        console.log("Meeting info received successfully:", data.meeting);

        // Parse and validate the scheduled time
        let scheduledTime = new Date(data.meeting.scheduledTime);
        console.log("Original scheduledTime:", data.meeting.scheduledTime);
        console.log("Parsed scheduledTime:", scheduledTime);
        console.log("Is valid date:", !isNaN(scheduledTime.getTime()));

        if (isNaN(scheduledTime.getTime())) {
          console.error("Invalid scheduledTime:", data.meeting.scheduledTime);
          // For invalid dates, set to current time and proceed
          scheduledTime = new Date();
          console.log("Using current time as fallback:", scheduledTime);
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
          isValidRoom: true, // Always set to true for successful responses
        };
        console.log("Setting meeting info:", meetingInfo);
        setMeetingInfo(meetingInfo);
        setError(null); // Clear any previous errors
      } else {
        // If meeting not found or unauthorized, allow joining anyway
        if (response.status === 404 || response.status === 401) {
          console.log(
            "Meeting not found in database or unauthorized, allowing direct join"
          );
          setError(null);
          // For 401 errors, it's likely a session issue - proceed to meeting
          // The Daily.co room should still exist and be joinable
          onProceed();
          return;
        }
        setError(data.error || "Failed to fetch meeting info");
      }
    } catch (err) {
      console.error("Error fetching meeting info:", err);
      if (err instanceof Error && err.name === "AbortError") {
        // On timeout, allow direct join
        console.log("Request timed out, allowing direct join");
        onProceed();
        return;
      } else {
        // On other errors, allow direct join
        console.log("Error fetching meeting info, allowing direct join");
        onProceed();
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  console.log(
    "MeetingStatusCheck render - loading:",
    loading,
    "meetingInfo:",
    !!meetingInfo,
    "error:",
    error
  );

  if (loading) {
    console.log("Rendering loading state");
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
    console.log(
      "Rendering error state - error:",
      error,
      "meetingInfo:",
      !!meetingInfo
    );
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

  // Ensure we have valid meeting info before proceeding
  if (!meetingInfo.scheduledTime || !meetingInfo.duration) {
    console.error("Missing required meeting data:", meetingInfo);
    console.log("Proceeding to meeting anyway due to missing data");
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

  console.log("Meeting status calculation:", {
    meetingTitle: meetingInfo.title,
    meetingStart: meetingStart.toISOString(),
    meetingEnd: meetingEnd.toISOString(),
    now: now.toISOString(),
    isLive,
    isUpcoming,
    hasEnded,
    startsWithin15Min,
    timeUntilStart: Math.ceil(
      (meetingStart.getTime() - now.getTime()) / (1000 * 60)
    ),
    isHost: meetingInfo.isHost,
  });

  // Calculate time differences
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
