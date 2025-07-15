"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { DailyProvider } from "@daily-co/daily-react";
import DailyMeeting from "@/components/DailyMeeting";
import { MeetingErrorBoundary } from "@/components/MeetingErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { Video, User, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface MeetingWrapperProps {
  roomUrl: string;
  roomName: string;
}

interface GuestUser {
  name: string;
  email: string;
  isGuest: true;
}

export default function MeetingWrapper({
  roomUrl,
  roomName,
}: MeetingWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [guestForm, setGuestForm] = useState({ name: "", email: "" });
  const [isJoiningAsGuest, setIsJoiningAsGuest] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [proceedToMeeting, setProceedToMeeting] = useState(false);

  useEffect(() => {
    console.log(
      "MeetingWrapper status changed:",
      status,
      "session exists:",
      !!session,
      "session user:",
      session?.user?.email
    );
    // Show guest form if no session and not loading
    if (status === "unauthenticated") {
      setShowGuestForm(true);
    } else if (status === "authenticated") {
      // Hide guest form if user is authenticated
      setShowGuestForm(false);
      // Clear any guest user data since we now have a real session
      setGuestUser(null);
      // Go directly to meeting for authenticated users
      setProceedToMeeting(true);
      console.log("Setting proceedToMeeting to true for authenticated user");
    }
  }, [status]);

  const handleLeave = () => {
    if (guestUser) {
      // For guests, go to home page
      router.push("/");
    } else {
      // For authenticated users, go to dashboard
      router.push("/dashboard");
    }
  };

  const handleGuestJoin = async () => {
    if (!guestForm.name.trim() || !guestForm.email.trim()) {
      toast.error("Please enter both name and email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsJoiningAsGuest(true);
    try {
      // Create or update guest user in database
      const response = await fetch("/api/meetings/guest-join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: guestForm.name.trim(),
          email: guestForm.email.trim(),
          roomName: roomName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set guest user and hide form
        setGuestUser({
          name: guestForm.name.trim(),
          email: guestForm.email.trim(),
          isGuest: true,
        });
        setShowGuestForm(false);
        // Go directly to meeting for guest users too
        setProceedToMeeting(true);
      } else {
        toast.error(data.error || "Failed to join as guest");
      }
    } catch (error) {
      console.error("Error joining as guest:", error);
      toast.error("Failed to join meeting");
    } finally {
      setIsJoiningAsGuest(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      // Use the current meeting URL as the callback URL
      const result = await signIn("google", {
        callbackUrl: window.location.href,
        redirect: true,
      });

      // If sign in fails, reset the loading state
      if (result?.error) {
        console.error("Sign in error:", result.error);
        setIsSigningIn(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
    }
  };

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

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Loading...
          </h2>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show guest join form if no session
  if (showGuestForm && !session && !guestUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden">
        {/* Background Effects - Same as signin page */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-black dark:via-[#0A0A0A] dark:to-[#121212]" />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]" />

          <MovingOrb />
        </div>

        {/* Floating Elements */}
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

        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-full text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 shadow-lg hover:scale-105 active:scale-95 transform"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            {/* Join Meeting Card */}
            <motion.div
              className="relative p-8 rounded-3xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              {/* Animated background gradient */}
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

              {/* Floating orbs */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl animate-pulse delay-1000" />

              <div className="relative z-10 text-center space-y-8">
                {/* Logo */}
                <motion.div
                  className="flex items-center justify-center gap-3 mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <motion.div
                      className="w-6 h-6 rounded-full bg-white"
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
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    EchoLoom
                  </span>
                </motion.div>

                {/* Welcome Text */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Join Meeting
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Enter your details to join the meeting or sign in with
                    Google for the full experience
                  </p>
                </motion.div>

                {/* Guest Form */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <Label
                        htmlFor="guest-name"
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <User className="w-4 h-4" />
                        Your Name
                      </Label>
                      <Input
                        id="guest-name"
                        placeholder="Enter your full name"
                        value={guestForm.name}
                        onChange={(e) =>
                          setGuestForm({ ...guestForm, name: e.target.value })
                        }
                        className="h-12 rounded-xl bg-white/50 dark:bg-black/50 border-gray-200 dark:border-white/20 focus:border-cyan-500 dark:focus:border-cyan-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <Label
                        htmlFor="guest-email"
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <Input
                        id="guest-email"
                        type="email"
                        placeholder="Enter your email"
                        value={guestForm.email}
                        onChange={(e) =>
                          setGuestForm({ ...guestForm, email: e.target.value })
                        }
                        className="h-12 rounded-xl bg-white/50 dark:bg-black/50 border-gray-200 dark:border-white/20 focus:border-cyan-500 dark:focus:border-cyan-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGuestJoin}
                    disabled={isJoiningAsGuest}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Button shine effect */}
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
                      {isJoiningAsGuest ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          Join as Guest
                        </>
                      )}
                    </span>
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white/80 dark:bg-black/80 px-2 text-gray-500 dark:text-gray-400">
                        Or
                      </span>
                    </div>
                  </div>

                  {/* Google Sign In Button */}
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="w-full h-14 text-lg font-semibold bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 dark:via-white/10 to-transparent skew-x-12"
                      animate={{
                        x: [-200, 200],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSigningIn ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          {/* Google Logo */}
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Sign in with Google
                        </>
                      )}
                    </span>
                  </Button>

                  {/* Footer Text */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    By joining, you agree to our{" "}
                    <a
                      href="#"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // If we have either a session or guest user, show the meeting
  const currentUser = session?.user || guestUser;

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Unable to join meeting
          </h2>
          <p className="text-muted-foreground">
            Please refresh the page and try again
          </p>
        </div>
      </div>
    );
  }

  console.log(
    "Final render - proceedToMeeting:",
    proceedToMeeting,
    "session:",
    !!session,
    "guestUser:",
    !!guestUser
  );

  return (
    <MeetingErrorBoundary>
      <DailyProvider url={roomUrl}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Joining Meeting...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we connect you
                </p>
              </div>
            </div>
          }
        >
          <DailyMeeting
            roomUrl={roomUrl}
            onLeave={handleLeave}
            guestUser={guestUser}
          />
        </Suspense>
      </DailyProvider>
    </MeetingErrorBoundary>
  );
}
