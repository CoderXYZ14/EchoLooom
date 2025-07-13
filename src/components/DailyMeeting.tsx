"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  AnimatePresence,
} from "motion/react";
import {
  useDaily,
  useParticipantIds,
  useLocalParticipant,
  useParticipant,
  useVideoTrack,
  useAudioTrack,
  useScreenShare,
} from "@daily-co/daily-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Phone,
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";

interface DailyMeetingProps {
  roomUrl: string;
  onLeave: () => void;
}

const VideoTile = ({
  participantId,
  isLocal = false,
}: {
  participantId: string;
  isLocal?: boolean;
}) => {
  const participant = useParticipant(participantId);
  const videoTrack = useVideoTrack(participantId);
  const audioTrack = useAudioTrack(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (videoRef.current && videoTrack.persistentTrack) {
      videoRef.current.srcObject = new MediaStream([
        videoTrack.persistentTrack,
      ]);
    }
  }, [videoTrack.persistentTrack]);

  if (!participant) return null;

  const displayName =
    participant.user_name ||
    (isLocal ? "You" : `Participant ${participantId.slice(-4)}`);

  // Get user info for avatar
  const userImage = isLocal ? session?.user?.image : null;
  const userEmail = isLocal ? session?.user?.email : null;
  const getInitials = (name: string, email?: string) => {
    if (name && name !== "You") {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative aspect-video bg-gradient-to-br from-card via-card to-muted/20 border border-border/60 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {videoTrack.isOff ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 via-muted/20 to-background/50">
          <div className="text-center">
            <Avatar className="w-16 h-16 mb-3 mx-auto shadow-lg">
              {userImage ? (
                <AvatarImage src={userImage} alt={displayName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground font-semibold text-lg">
                  {getInitials(displayName, userEmail || undefined)}
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-muted-foreground text-sm font-medium">
              {displayName}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted={isLocal}
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg text-sm font-medium border border-border/50 shadow-sm">
            <Avatar className="w-5 h-5">
              {userImage ? (
                <AvatarImage src={userImage} alt={displayName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground font-semibold text-xs">
                  {getInitials(displayName, userEmail || undefined)}
                </AvatarFallback>
              )}
            </Avatar>
            <span>{displayName}</span>
          </div>
          {audioTrack.isOff && (
            <div className="absolute top-3 right-3 bg-destructive/90 backdrop-blur-sm text-destructive-foreground p-1.5 rounded-full shadow-lg">
              <MicOff className="w-4 h-4" />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const ScreenShareTile = ({ participantId }: { participantId: string }) => {
  const participant = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (videoRef.current && participant?.tracks?.screenVideo?.persistentTrack) {
      videoRef.current.srcObject = new MediaStream([
        participant.tracks.screenVideo.persistentTrack,
      ]);
    }
  }, [participant?.tracks?.screenVideo?.persistentTrack]);

  if (!participant?.tracks?.screenVideo?.persistentTrack) return null;

  // Get proper display name - use session data for local participant
  const isLocalParticipant = participant.local;
  const displayName = isLocalParticipant
    ? session?.user?.name || "You"
    : participant.user_name || `Participant ${participantId.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full h-full bg-gradient-to-br from-card via-card to-muted/20 border border-border/60 rounded-xl overflow-hidden shadow-lg"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-contain bg-gradient-to-br from-muted/20 to-background/30"
      />
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm text-foreground px-4 py-2 rounded-lg text-sm font-medium border border-border/50 shadow-lg">
        {displayName}&apos;s screen
      </div>
    </motion.div>
  );
};

const DailyMeeting: React.FC<DailyMeetingProps> = ({ roomUrl, onLeave }) => {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();
  const { screens } = useScreenShare();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"sidebar" | "fullscreen">(
    "sidebar"
  );
  const [showSettings, setShowSettings] = useState(false);
  const [masterVolume, setMasterVolume] = useState(100);
  const [micVolume, setMicVolume] = useState(100);
  const hasJoinedRef = useRef(false);

  // Animation values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth) * 100);
      mouseY.set((clientY / innerHeight) * 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const backgroundGradient = useMotionTemplate`
    radial-gradient(circle at ${mouseX}% ${mouseY}%, 
      rgba(59, 130, 246, 0.05) 0%, 
      rgba(147, 51, 234, 0.03) 25%, 
      transparent 50%
    )
  `;

  useEffect(() => {
    if (localParticipant) {
      setLocalAudioEnabled(localParticipant.audio);
      setLocalVideoEnabled(localParticipant.video);
    }
  }, [localParticipant?.audio, localParticipant?.video]);

  useEffect(() => {
    setIsScreenSharing(screens.length > 0);
  }, [screens]);

  useEffect(() => {
    const joinMeeting = async () => {
      if (!daily || hasJoinedRef.current) return;

      try {
        console.log("Attempting to join meeting...");
        setIsJoining(true);
        setError(null);
        hasJoinedRef.current = true;

        await daily.join({ url: roomUrl });
        console.log("Successfully joined meeting");
        setIsJoining(false);
      } catch (error) {
        console.error("Failed to join meeting:", error);
        setError("Failed to join meeting. Please try again.");
        setIsJoining(false);
        hasJoinedRef.current = false;
      }
    };

    joinMeeting();
  }, [daily, roomUrl]);

  const toggleAudio = async () => {
    if (!daily) return;
    try {
      const newState = !localAudioEnabled;
      await daily.setLocalAudio(newState);
      setLocalAudioEnabled(newState);
    } catch (error) {
      console.error("Failed to toggle audio:", error);
    }
  };

  const toggleVideo = async () => {
    if (!daily) return;
    try {
      const newState = !localVideoEnabled;
      await daily.setLocalVideo(newState);
      setLocalVideoEnabled(newState);
    } catch (error) {
      console.error("Failed to toggle video:", error);
    }
  };

  const toggleScreenShare = async () => {
    if (!daily) return;
    try {
      if (isScreenSharing) {
        await daily.stopScreenShare();
      } else {
        await daily.startScreenShare();
      }
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const leaveMeeting = async () => {
    if (daily) {
      try {
        await daily.leave();
      } catch (error) {
        console.error("Error leaving meeting:", error);
      }
    }
    onLeave();
  };

  const remoteParticipants = participantIds.filter(
    (id) => id !== localParticipant?.session_id
  );
  const screenShareParticipants = screens
    .map((screen) => screen.session_id)
    .filter(Boolean);

  if (isJoining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
        <motion.div
          style={{ background: backgroundGradient }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex items-center justify-center min-h-screen"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
            />
            <motion.h2
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2"
            >
              Joining Meeting...
            </motion.h2>
            <p className="text-muted-foreground">
              Please wait while we connect you
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
        <motion.div
          style={{ background: backgroundGradient }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/5 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex items-center justify-center min-h-screen"
        >
          <div className="text-center bg-gradient-to-br from-card via-card to-muted/20 border border-border/60 rounded-xl p-8 shadow-lg max-w-md mx-4">
            <div className="w-16 h-16 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Connection Error
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={onLeave} variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <motion.div
        style={{ background: backgroundGradient }}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-card/90 via-card/85 to-card/90 backdrop-blur-sm border-b border-border/60 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* App Logo */}
              <Link href="/dashboard">
                <motion.div
                  className="flex items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                  <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    EchoLoom
                  </span>
                </motion.div>
              </Link>

              {/* Meeting Info */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                  <Video className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Meeting Room
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {participantIds.length} participant
                    {participantIds.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-background/60"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {/* Settings Dropdown */}
              <div className="relative">
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-background/60"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-lg p-4 z-[60]"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Master Volume
                          </label>
                          <div className="flex items-center space-x-2">
                            <VolumeX className="w-4 h-4 text-muted-foreground" />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={masterVolume}
                              onChange={(e) =>
                                setMasterVolume(Number(e.target.value))
                              }
                              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground w-8">
                              {masterVolume}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Microphone Volume
                          </label>
                          <div className="flex items-center space-x-2">
                            <MicOff className="w-4 h-4 text-muted-foreground" />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={micVolume}
                              onChange={(e) =>
                                setMicVolume(Number(e.target.value))
                              }
                              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <Mic className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground w-8">
                              {micVolume}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                      {session?.user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden md:block">
                  {session?.user?.name || "User"}
                </span>
              </div>

              {/* Layout Toggle */}
              {screenShareParticipants.length > 0 && (
                <Button
                  onClick={() =>
                    setLayoutMode(
                      layoutMode === "sidebar" ? "fullscreen" : "sidebar"
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background/80 shadow-sm"
                >
                  {layoutMode === "sidebar" ? "Fullscreen" : "Sidebar"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {screenShareParticipants.length > 0 ? (
            layoutMode === "sidebar" ? (
              <>
                {/* Screen Share - Main Area */}
                <div className="flex-1 p-4">
                  <ScreenShareTile participantId={screenShareParticipants[0]} />
                </div>

                {/* Participants - Sidebar */}
                <div className="w-80 p-4 bg-gradient-to-b from-card/60 via-card/50 to-card/60 backdrop-blur-sm border-l border-border/60">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Participants
                  </h3>
                  <div className="space-y-3">
                    {localParticipant && (
                      <VideoTile
                        participantId={localParticipant.session_id}
                        isLocal={true}
                      />
                    )}
                    {remoteParticipants.map((participantId) => (
                      <VideoTile
                        key={participantId}
                        participantId={participantId}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Fullscreen Screen Share */
              <div className="flex-1 p-4">
                <ScreenShareTile participantId={screenShareParticipants[0]} />
              </div>
            )
          ) : (
            /* Normal Grid View */
            <div className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                {localParticipant && (
                  <VideoTile
                    participantId={localParticipant.session_id}
                    isLocal={true}
                  />
                )}
                {remoteParticipants.map((participantId) => (
                  <VideoTile
                    key={participantId}
                    participantId={participantId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-card/90 via-card/85 to-card/90 backdrop-blur-sm border-t border-border/60 p-4 shadow-sm"
        >
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={toggleAudio}
              variant={localAudioEnabled ? "default" : "destructive"}
              size="lg"
              className="w-12 h-12 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              {localAudioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>

            <Button
              onClick={toggleVideo}
              variant={localVideoEnabled ? "default" : "destructive"}
              size="lg"
              className="w-12 h-12 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              {localVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>

            <Button
              onClick={toggleScreenShare}
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              className="w-12 h-12 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              {isScreenSharing ? (
                <MonitorOff className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </Button>

            <Button
              onClick={leaveMeeting}
              variant="destructive"
              size="lg"
              className="w-12 h-12 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <Phone className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Click outside to close settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default DailyMeeting;
