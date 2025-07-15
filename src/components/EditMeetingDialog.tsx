"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Users, Mail } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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

interface Participant {
  email: string;
  name: string;
  joined: boolean;
}

interface MeetingUpdateData {
  title?: string;
  scheduledTime?: string;
  duration?: number;
  participantEmails?: string;
}

interface EditMeetingDialogProps {
  meeting: UpcomingMeeting | null;
  open: boolean;
  onClose: () => void;
  onSave: (meetingId: string, updates: MeetingUpdateData) => void;
  isLoading?: boolean;
}

export const EditMeetingDialog: React.FC<EditMeetingDialogProps> = ({
  meeting,
  open,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    scheduledTime: undefined as Date | undefined,
    duration: "30",
    participantEmails: "",
  });

  const [currentParticipants, setCurrentParticipants] = useState<Participant[]>(
    []
  );
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Reset form when meeting changes
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        scheduledTime: new Date(meeting.scheduledTime),
        duration: meeting.duration.toString(),
        participantEmails: "",
      });
      fetchMeetingDetails(meeting.id);
    }
  }, [meeting]);

  // Fetch meeting details including participants
  const fetchMeetingDetails = async (meetingId: string) => {
    setLoadingParticipants(true);
    try {
      const response = await axios.get(`/api/meetings/details?id=${meetingId}`);
      if (response.data.success) {
        setCurrentParticipants(response.data.meeting.participants || []);
        // Set participant emails in form
        const participantEmails = response.data.meeting.participants
          .map((p: Participant) => p.email)
          .join(", ");
        setFormData((prev) => ({ ...prev, participantEmails }));
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Remove participant from the list
  const removeParticipant = (emailToRemove: string) => {
    // Update the visual participant list immediately
    setCurrentParticipants((prev) =>
      prev.filter((participant) => participant.email !== emailToRemove)
    );

    // Update the form input
    const updatedEmails = formData.participantEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email !== emailToRemove)
      .join(", ");

    setFormData((prev) => ({ ...prev, participantEmails: updatedEmails }));
  };

  const handleSave = () => {
    if (!meeting) return;

    if (!formData.title.trim()) {
      toast.error("Meeting title is required");
      return;
    }

    if (!formData.scheduledTime) {
      toast.error("Meeting date and time is required");
      return;
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    const updates: MeetingUpdateData = {};

    // Only include fields that have changed
    if (formData.title.trim() !== meeting.title) {
      updates.title = formData.title.trim();
    }

    if (
      formData.scheduledTime.getTime() !==
      new Date(meeting.scheduledTime).getTime()
    ) {
      updates.scheduledTime = formData.scheduledTime.toISOString();
    }

    if (parseInt(formData.duration) !== meeting.duration) {
      updates.duration = parseInt(formData.duration);
    }

    // Always include participant emails to handle additions/removals
    updates.participantEmails = formData.participantEmails.trim();

    // Only save if there are changes
    if (Object.keys(updates).length > 0) {
      onSave(meeting.id, updates);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      title: "",
      scheduledTime: undefined,
      duration: "30",
      participantEmails: "",
    });
  };

  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card/90 backdrop-blur-lg border-border/50 shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Meeting
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Meeting Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Meeting Title</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter meeting title"
              className="bg-background/50 border-border/50 focus:border-primary"
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <DateTimePicker
              value={formData.scheduledTime}
              onChange={(date: Date | undefined) =>
                setFormData((prev) => ({ ...prev, scheduledTime: date }))
              }
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select
              value={formData.duration}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, duration: value }))
              }
            >
              <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Participants */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">
                Current Participants
              </Label>
              {loadingParticipants && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {currentParticipants.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentParticipants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">
                          {participant.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {participant.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={participant.joined ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {participant.joined ? "Joined" : "Invited"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.email)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                No participants invited yet
              </div>
            )}
          </div>

          {/* Add Participant Emails */}
          <div className="space-y-2">
            <Label htmlFor="edit-emails">
              Add Participant Emails (optional)
            </Label>
            <Textarea
              id="edit-emails"
              value={formData.participantEmails}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  participantEmails: e.target.value,
                }))
              }
              placeholder="Enter emails separated by commas"
              className="bg-background/50 border-border/50 focus:border-primary min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple emails with commas. You can also remove
              participants above.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
