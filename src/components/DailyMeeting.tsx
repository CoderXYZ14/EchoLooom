"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
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
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";

interface GuestUser {
  name: string;
  email: string;
  isGuest: true;
}

interface DailyMeetingProps {
  roomUrl: string;
  onLeave: () => void;
  guestUser?: GuestUser | null;
}

interface PreMeetingSettings {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
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

  const displayName = isLocal
    ? "You"
    : participant.user_name || `Participant ${participantId.slice(-4)}`;

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
      className="relative aspect-video bg-gradient-to-br from-card via-card to-muted/20 border border-border/60 rounded-lg md:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {videoTrack.isOff ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 via-muted/20 to-background/50">
          <div className="text-center">
            <Avatar className="w-12 h-12 md:w-16 md:h-16 mb-2 md:mb-3 mx-auto shadow-lg">
              {userImage ? (
                <AvatarImage src={userImage} alt={displayName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground font-semibold text-sm md:text-lg">
                  {getInitials(displayName, userEmail || undefined)}
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">
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
          <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 flex items-center space-x-1 md:space-x-2 bg-background/90 backdrop-blur-sm text-foreground px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-xs md:text-sm font-medium border border-border/50 shadow-sm">
            <Avatar className="w-4 h-4 md:w-5 md:h-5">
              {userImage ? (
                <AvatarImage src={userImage} alt={displayName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground font-semibold text-xs">
                  {getInitials(displayName, userEmail || undefined)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="truncate">{displayName}</span>
          </div>
          {audioTrack.isOff && (
            <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-destructive/90 backdrop-blur-sm text-destructive-foreground p-1 md:p-1.5 rounded-full shadow-lg">
              <MicOff className="w-3 h-3 md:w-4 md:h-4" />
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

  useEffect(() => {
    if (videoRef.current && participant?.tracks?.screenVideo?.persistentTrack) {
      videoRef.current.srcObject = new MediaStream([
        participant.tracks.screenVideo.persistentTrack,
      ]);
    }
  }, [participant?.tracks?.screenVideo?.persistentTrack]);

  if (!participant?.tracks?.screenVideo?.persistentTrack) return null;

  const isLocalParticipant = participant.local;
  const displayName = isLocalParticipant
    ? "You"
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

const DailyMeeting: React.FC<DailyMeetingProps> = ({
  roomUrl,
  onLeave,
  guestUser,
}) => {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();
  const { screens } = useScreenShare();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const currentUser = session?.user || guestUser;

  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"sidebar" | "fullscreen">(
    "sidebar"
  );

  const [meetingVolume, setMeetingVolume] = useState(0.7); // 0 to 1 for volume control
  const [showPreMeetingSetup, setShowPreMeetingSetup] = useState(true);
  const [preMeetingSettings, setPreMeetingSettings] =
    useState<PreMeetingSettings>({
      cameraEnabled: true,
      microphoneEnabled: true,
    });
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const hasJoinedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    if (!daily) return;

    const setupAudioContext = () => {
      try {
        const audioContext = new (window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext: typeof AudioContext;
            }
          ).webkitAudioContext)();
        const gainNode = audioContext.createGain();

        audioContextRef.current = audioContext;
        gainNodeRef.current = gainNode;

        // Set initial volume
        gainNode.gain.value = meetingVolume;

        // Connect to destination
        gainNode.connect(audioContext.destination);

        // Find and connect all audio elements
        const connectAudioElements = () => {
          const audioElements = document.querySelectorAll("audio, video");
          audioElements.forEach((element) => {
            if (element instanceof HTMLMediaElement && !element.muted) {
              try {
                const source = audioContext.createMediaElementSource(element);
                source.connect(gainNode);
              } catch (error) {
                // Element might already be connected or not ready
                console.error(
                  "DailyMeeting | Audio element connection failed:",
                  error
                );
              }
            }
          });
        };

        // Connect existing elements
        connectAudioElements();

        // Set up observer for new audio elements
        const observer = new MutationObserver(() => {
          connectAudioElements();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        return () => {
          observer.disconnect();
          audioContext.close();
        };
      } catch (error) {
        console.error(
          "DailyMeeting | Web Audio API initialization failed:",
          error
        );
        // Fallback to direct volume control on audio elements
        const updateAudioVolume = () => {
          const audioElements = document.querySelectorAll("audio, video");
          audioElements.forEach((element) => {
            if (element instanceof HTMLMediaElement && !element.muted) {
              element.volume = meetingVolume;
            }
          });
        };

        updateAudioVolume();

        const interval = setInterval(updateAudioVolume, 1000);
        return () => clearInterval(interval);
      }
    };

    const cleanup = setupAudioContext();
    return cleanup;
  }, [daily, meetingVolume]);

  // Update volume when meetingVolume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = meetingVolume;
    } else {
      // Fallback: directly set volume on audio elements
      const audioElements = document.querySelectorAll("audio, video");
      audioElements.forEach((element) => {
        if (element instanceof HTMLMediaElement && !element.muted) {
          element.volume = meetingVolume;
        }
      });
    }
  }, [meetingVolume]);

  const joinMeeting = async () => {
    if (!daily || hasJoinedRef.current) return;

    try {
      setIsJoining(true);
      setError(null);
      hasJoinedRef.current = true;

      const userName = currentUser?.name || "Guest";

      await daily.join({
        url: roomUrl,
        userName: userName,
      });

      // Apply pre-meeting settings after joining
      await daily.setLocalAudio(preMeetingSettings.microphoneEnabled);
      await daily.setLocalVideo(preMeetingSettings.cameraEnabled);
      setLocalAudioEnabled(preMeetingSettings.microphoneEnabled);
      setLocalVideoEnabled(preMeetingSettings.cameraEnabled);

      setIsJoining(false);
    } catch (error: unknown) {
      console.error("DailyMeeting | Join meeting failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        roomUrl,
        userName: currentUser?.name || "Guest",
      });

      let errorMessage = "Failed to join meeting. Please try again.";
      if (error instanceof Error) {
        if (
          error.message.includes("Invalid room") ||
          error.message.includes("room")
        ) {
          errorMessage = "This meeting room doesn't exist or has expired.";
        } else if (
          error.message.includes("Network") ||
          error.message.includes("network")
        ) {
          errorMessage = "Network error. Please check your connection.";
        } else if (
          error.message.includes("token") ||
          error.message.includes("auth")
        ) {
          errorMessage =
            "Authentication error. Please try refreshing the page.";
        } else {
          errorMessage = `Meeting error: ${error.message}`;
        }
      }
      setError(errorMessage);
      setIsJoining(false);
      hasJoinedRef.current = false;
    }
  };

  useEffect(() => {
    if (!showPreMeetingSetup) {
      joinMeeting();
    }
  }, [daily, roomUrl, currentUser, showPreMeetingSetup, preMeetingSettings]);

  const toggleAudio = async () => {
    if (!daily) return;
    try {
      const newState = !localAudioEnabled;
      await daily.setLocalAudio(newState);
      setLocalAudioEnabled(newState);
    } catch (error) {
      console.error("DailyMeeting | Audio toggle failed:", error);
    }
  };

  const toggleVideo = async () => {
    if (!daily) return;
    try {
      const newState = !localVideoEnabled;
      await daily.setLocalVideo(newState);
      setLocalVideoEnabled(newState);
    } catch (error) {
      console.error("DailyMeeting | Video toggle failed:", error);
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
      console.error("DailyMeeting | Screen share toggle failed:", error);
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
        console.error("DailyMeeting | Leave meeting failed:", error);
      }
    }
    onLeave();
  };

  const handleVolumeChange = (value: number[]) => {
    setMeetingVolume(value[0]);
  };

  const handleJoinMeeting = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
    }
    setShowPreMeetingSetup(false);
  };

  // Camera preview functionality
  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setPreviewStream(stream);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("DailyMeeting | Camera access failed:", error);

      setPreMeetingSettings((prev) => ({ ...prev, cameraEnabled: false }));
    }
  };

  const stopCameraPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  };

  const toggleCameraPreview = (enabled: boolean) => {
    setPreMeetingSettings((prev) => ({ ...prev, cameraEnabled: enabled }));
    if (enabled) {
      startCameraPreview();
    } else {
      stopCameraPreview();
    }
  };

  useEffect(() => {
    if (showPreMeetingSetup && preMeetingSettings.cameraEnabled) {
      startCameraPreview();
    }

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showPreMeetingSetup]);

  useEffect(() => {
    if (previewVideoRef.current && previewStream) {
      previewVideoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  const remoteParticipants = participantIds.filter(
    (id) => id !== localParticipant?.session_id
  );
  const screenShareParticipants = screens
    .map((screen) => screen.session_id)
    .filter(Boolean);

  if (showPreMeetingSetup) {
    const MovingOrb = () => (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 left-1/4 w-[200px] h-[200px]"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-white/10 to-cyan-500/10 rounded-full blur-2xl" />
        </motion.div>
      </div>
    );

    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-black dark:via-[#0A0A0A] dark:to-[#121212]" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]" />

          <MovingOrb />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <motion.div
              className="relative p-6 rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 dark:from-cyan-500/10 dark:via-blue-500/10 dark:to-purple-500/10"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl animate-pulse delay-1000" />

              <div className="relative z-10 text-center space-y-6">
                <motion.div
                  className="flex items-center justify-center gap-2 mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    EchoLoom
                  </span>
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ready to join?
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Hi {currentUser?.name || "Guest"}, choose your settings
                  </p>
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-white/20">
                    {preMeetingSettings.cameraEnabled && previewStream ? (
                      <video
                        ref={previewVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                            <VideoOff className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {preMeetingSettings.cameraEnabled
                              ? "Starting camera..."
                              : "Camera is off"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
                      {currentUser?.name || "Guest"} (You)
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/20 rounded-lg hover:bg-white/70 dark:hover:bg-black/70 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full transition-all duration-200 ${
                          preMeetingSettings.cameraEnabled
                            ? "bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {preMeetingSettings.cameraEnabled ? (
                          <Video className="w-5 h-5" />
                        ) : (
                          <VideoOff className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Camera
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {preMeetingSettings.cameraEnabled
                            ? "Camera will be on"
                            : "Camera will be off"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        preMeetingSettings.cameraEnabled ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        toggleCameraPreview(!preMeetingSettings.cameraEnabled)
                      }
                      className={`min-w-16 transition-all duration-200 ${
                        preMeetingSettings.cameraEnabled
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg"
                          : "border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {preMeetingSettings.cameraEnabled ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/20 rounded-lg hover:bg-white/70 dark:hover:bg-black/70 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full transition-all duration-200 ${
                          preMeetingSettings.microphoneEnabled
                            ? "bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {preMeetingSettings.microphoneEnabled ? (
                          <Mic className="w-5 h-5" />
                        ) : (
                          <MicOff className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Microphone
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {preMeetingSettings.microphoneEnabled
                            ? "Microphone will be on"
                            : "Microphone will be off"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        preMeetingSettings.microphoneEnabled
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreMeetingSettings((prev) => ({
                          ...prev,
                          microphoneEnabled: !prev.microphoneEnabled,
                        }))
                      }
                      className={`min-w-16 transition-all duration-200 ${
                        preMeetingSettings.microphoneEnabled
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg"
                          : "border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {preMeetingSettings.microphoneEnabled ? "On" : "Off"}
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Button
                    onClick={handleJoinMeeting}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      animate={{
                        x: [-200, 200],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </span>
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
                    You can change these settings anytime during the meeting
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex items-center justify-center min-h-screen"
        >
          <div className="text-center max-w-md">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-red-500 text-2xl">✕</span>
            </motion.div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
              Unable to Join Meeting
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="text-xs text-muted-foreground mb-6 p-3 bg-muted/20 rounded-lg">
              <p>
                <strong>Room URL:</strong> {roomUrl}
              </p>
              <p>
                <strong>User:</strong> {currentUser?.name || "Unknown"}
              </p>
              <p>
                <strong>Email:</strong> {currentUser?.email || "Unknown"}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  hasJoinedRef.current = false;
                  // Trigger rejoin attempt
                  window.location.reload();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onLeave}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Leave
              </button>
            </div>
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

      <div
        className={`relative z-10 ${
          isMobile ? "min-h-screen" : "h-screen"
        } flex flex-col`}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-card/90 via-card/85 to-card/90 backdrop-blur-sm border-b border-border/60 p-3 md:p-4 shadow-sm flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* App Logo */}
              <Link href="/dashboard">
                <motion.div
                  className="flex items-center gap-1 md:gap-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <motion.div
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white"
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
                  <span className="text-base md:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hidden sm:block">
                    EchoLoom
                  </span>
                </motion.div>
              </Link>

              {/* Meeting Info */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                  <Video className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-sm md:text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Meeting Room
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {participantIds.length} participant
                    {participantIds.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-2">
              {/* Theme Toggle */}
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="w-7 h-7 md:w-8 md:h-8 p-0 hover:bg-background/60"
              >
                {theme === "dark" ? (
                  <Sun className="w-3 h-3 md:w-4 md:h-4" />
                ) : (
                  <Moon className="w-3 h-3 md:w-4 md:h-4" />
                )}
              </Button>

              {/* Volume Control - Responsive for mobile */}
              <div className="flex items-center space-x-2 md:space-x-3 bg-card/60 backdrop-blur-sm border border-border/60 rounded-lg px-2 md:px-3 py-2">
                <VolumeX className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-16 md:min-w-24">
                  <Slider
                    value={[meetingVolume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    min={0}
                    step={0.05}
                    className="w-full"
                    aria-label="Volume"
                  />
                </div>
                <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground min-w-6 md:min-w-8 text-center">
                  {Math.round(meetingVolume * 100)}%
                </span>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-1 md:space-x-2">
                <Avatar className="w-6 h-6 md:w-8 md:h-8">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground font-semibold text-xs md:text-sm">
                      {session?.user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden lg:block">
                  {session?.user?.name || "User"}
                </span>
              </div>

              {/* Layout Toggle - Hidden on mobile */}
              {screenShareParticipants.length > 0 && (
                <Button
                  onClick={() =>
                    setLayoutMode(
                      layoutMode === "sidebar" ? "fullscreen" : "sidebar"
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background/80 shadow-sm hidden md:block"
                >
                  {layoutMode === "sidebar" ? "Fullscreen" : "Sidebar"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div
          className={`flex-1 flex ${
            isMobile ? "overflow-auto" : "overflow-hidden"
          }`}
        >
          {screenShareParticipants.length > 0 ? (
            layoutMode === "sidebar" && !isMobile ? (
              <>
                {/* Screen Share - Main Area */}
                <div className="flex-1 p-2 md:p-4">
                  <ScreenShareTile participantId={screenShareParticipants[0]} />
                </div>

                {/* Participants - Sidebar */}
                <div className="w-60 md:w-80 p-2 md:p-4 bg-gradient-to-b from-card/60 via-card/50 to-card/60 backdrop-blur-sm border-l border-border/60">
                  <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Participants
                  </h3>
                  <div className="space-y-2 md:space-y-3">
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
              /* Fullscreen Screen Share or Mobile */
              <div className="flex-1 p-2 md:p-4">
                <ScreenShareTile participantId={screenShareParticipants[0]} />
              </div>
            )
          ) : (
            /* Normal Grid View */
            <div className="flex-1 p-3 md:p-6">
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 ${
                  isMobile ? "min-h-full" : "h-full"
                }`}
              >
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
          className="bg-gradient-to-r from-card/90 via-card/85 to-card/90 backdrop-blur-sm border-t border-border/60 p-3 md:p-4 shadow-sm flex-shrink-0"
        >
          <div className="flex items-center justify-center space-x-3 md:space-x-4">
            <Button
              onClick={toggleAudio}
              variant={localAudioEnabled ? "default" : "destructive"}
              size={isMobile ? "default" : "lg"}
              className={`${
                isMobile ? "w-10 h-10" : "w-12 h-12"
              } rounded-full shadow-md hover:shadow-lg transition-shadow`}
            >
              {localAudioEnabled ? (
                <Mic className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
              ) : (
                <MicOff className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
              )}
            </Button>

            <Button
              onClick={toggleVideo}
              variant={localVideoEnabled ? "default" : "destructive"}
              size={isMobile ? "default" : "lg"}
              className={`${
                isMobile ? "w-10 h-10" : "w-12 h-12"
              } rounded-full shadow-md hover:shadow-lg transition-shadow`}
            >
              {localVideoEnabled ? (
                <Video className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
              ) : (
                <VideoOff className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
              )}
            </Button>

            {/* Screen Share - Hidden on mobile */}
            {!isMobile && (
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
            )}

            <Button
              onClick={leaveMeeting}
              variant="destructive"
              size={isMobile ? "default" : "lg"}
              className={`${
                isMobile ? "w-10 h-10" : "w-12 h-12"
              } rounded-full shadow-md hover:shadow-lg transition-shadow`}
            >
              <Phone className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyMeeting;
