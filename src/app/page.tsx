"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  Volume2,
  MessageSquare,
  Link2,
  LogIn,
  Moon,
  Sun,
  ArrowRight,
  Play,
  CheckCircle,
  Zap,
  Shield,
  Users,
  Sparkles,
  Calendar,
  Clock,
  Video,
  Mic,
  MicOff,
  Globe,
  Star,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const EchoLoom = () => {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const current = window.scrollY / document.body.scrollHeight;
      const previous = (window.scrollY - 10) / document.body.scrollHeight;

      if (current > 0.1) {
        if (current < previous) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      } else {
        setVisible(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest("[data-user-dropdown]")) {
          setIsUserDropdownOpen(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Floating Navbar
  const FloatingNav = () => {
    const navItems = [
      { name: "Features", link: "#features", icon: Zap },
      { name: "Demo", link: "#demo", icon: Play },
      { name: "Pricing", link: "#pricing", icon: Star },
      { name: "Contact", link: "#contact", icon: MessageSquare },
    ];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 1, y: -100 }}
          animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 flex max-w-fit border border-gray-200 dark:border-white/10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] pr-2 pl-8 py-2 items-center justify-center space-x-4"
        >
          {navItems.map((navItem, idx) => (
            <a
              key={`link=${idx}`}
              href={navItem.link}
              className="relative text-gray-600 dark:text-white/80 items-center flex space-x-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <span className="block sm:hidden">
                <navItem.icon className="h-4 w-4" />
              </span>
              <span className="hidden sm:block text-sm">{navItem.name}</span>
            </a>
          ))}
          <Button className="border text-sm font-medium relative border-gray-200 dark:border-white/20 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 px-4 py-2 rounded-full">
            <span>Book Demo</span>
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px" />
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  };

  const bentoFeatures = [
    {
      title: "Real-time Collaboration",
      description:
        "Work together seamlessly with instant sync and live cursors",
      icon: Users,
      className: "md:col-span-2 md:row-span-2",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="aspect-square bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg border border-white/10"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "HD Video Quality",
      description: "Crystal clear video up to 4K resolution",
      icon: Video,
      className: "md:col-span-1",
      content: (
        <div className="flex items-center justify-center h-full">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full border border-white/10 flex items-center justify-center"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Video className="w-8 h-8 text-purple-400" />
          </motion.div>
        </div>
      ),
    },
    {
      title: "Global Infrastructure",
      description: "Low-latency connections worldwide",
      icon: Globe,
      className: "md:col-span-1",
      content: (
        <div className="flex items-center justify-center h-full">
          <motion.div
            className="w-16 h-16 border-2 border-green-500/30 rounded-full flex items-center justify-center relative"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Globe className="w-6 h-6 text-green-400" />
            <motion.div
              className="absolute w-20 h-20 border border-green-500/20 rounded-full"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </motion.div>
        </div>
      ),
    },
    {
      title: "Smart Noise Cancellation",
      description: "AI-powered background noise removal",
      icon: MicOff,
      className: "md:col-span-2",
      content: (
        <div className="flex items-center justify-center gap-4 h-full">
          <motion.div
            className="flex items-center gap-2"
            animate={{
              x: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Mic className="w-6 h-6 text-cyan-400" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full"
                  animate={{
                    height: [4, 20, 4],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Connect instantly",
      subtitle: "Sign in with Google",
      description:
        "One-click authentication gets you into meetings faster than ever. No downloads, no setup complexity.",
      icon: LogIn,
      gradient: "from-emerald-400 to-cyan-400",
    },
    {
      number: "02",
      title: "Share & join",
      subtitle: "Create or join room",
      description:
        "Generate secure meeting links that work instantly. Share them anywhere and join from any device.",
      icon: Link2,
      gradient: "from-blue-400 to-purple-400",
    },
    {
      number: "03",
      title: "Take control",
      subtitle: "Individual audio control",
      description:
        "Revolutionary per-participant volume controls. Finally, focus on voices that matter most in your meetings.",
      icon: Volume2,
      gradient: "from-purple-400 to-pink-400",
    },
    {
      number: "04",
      title: "Collaborate seamlessly",
      subtitle: "Chat, share, record",
      description:
        "Real-time chat, screen sharing, and session recording. Everything your team needs to stay productive.",
      icon: Users,
      gradient: "from-pink-400 to-rose-400",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Head of Engineering",
      company: "Stripe",
      quote:
        "EchoLoom's individual volume control is revolutionary. It's eliminated meeting fatigue for our entire engineering team. We've cut meeting overrun by 40%.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612c633?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      verified: true,
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      company: "Notion",
      quote:
        "Finally, a meeting tool that gets it right. Clean, fast, and actually useful. Our product reviews are now 60% more efficient.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      verified: true,
    },
    {
      name: "Elena Rodriguez",
      role: "Design Lead",
      company: "Figma",
      quote:
        "The best meeting experience we've had. Our design reviews are now actually productive. The audio clarity is unmatched.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      verified: true,
    },
  ];

  const companies = [
    { name: "Stripe", logo: "S" },
    { name: "Notion", logo: "N" },
    { name: "Figma", logo: "F" },
    { name: "Vercel", logo: "V" },
    { name: "Linear", logo: "L" },
    { name: "GitHub", logo: "G" },
  ];

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

  const CurvedDivider = ({ className = "", flip = false }) => (
    <div
      className={`absolute ${
        flip ? "top-0" : "bottom-0"
      } left-0 w-full overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`relative block w-full ${flip ? "rotate-180" : ""}`}
        style={{ height: "60px" }}
      >
        <path
          d="M0,0V120H1200V0C1200,0 600,60 0,0Z"
          className="fill-current text-gray-100 dark:text-[#0A0A0A]"
          style={{
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
          }}
        />
      </svg>
    </div>
  );

  // Enhanced Floating Header with Mobile Menu
  const FloatingHeader = () => {
    const navItems = [
      { name: "Features", href: "#features", icon: Zap },
      { name: "Demo", href: "#demo", icon: Play },
      { name: "Pricing", href: "#pricing", icon: Star },
      { name: "Contact", href: "#contact", icon: MessageSquare },
    ];

    return (
      <>
        <motion.header
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className={`flex items-center gap-6 px-6 py-3 rounded-full border backdrop-blur-xl transition-all duration-500 ${
              isScrolled
                ? "bg-white/80 dark:bg-black/80 border-gray-200 dark:border-white/20 shadow-2xl"
                : "bg-white/40 dark:bg-black/40 border-gray-200/50 dark:border-white/10 shadow-xl"
            }`}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Logo - hide on mobile when menu is open */}
            <motion.div
              className={`flex items-center gap-2 text-gray-900 dark:text-white transition-opacity duration-300 ${
                isMobileMenuOpen ? "md:flex hidden" : "flex"
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
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
              <span className="text-xl font-bold tracking-tight">EchoLoom</span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-full group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="relative z-10">{item.name}</span>
                  <motion.div
                    className="absolute inset-0 bg-gray-100 dark:bg-white/10 rounded-full opacity-0 group-hover:opacity-100"
                    layoutId="navbar-hover"
                    transition={{
                      type: "spring",
                      duration: 0.4,
                    }}
                  />
                </motion.a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>

              {/* Desktop Auth Section */}
              {session ? (
                <div className="hidden md:flex relative" data-user-dropdown>
                  <motion.button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={session.user?.image || "/default-avatar.png"}
                      alt={session.user?.name || "User"}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-white/20"
                    />
                  </motion.button>

                  {/* Desktop User Dropdown */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        className="absolute top-12 right-0 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-3 border-b border-gray-200 dark:border-white/10">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400"
                          >
                            <LogIn className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/signin">
                  <Button
                    size="sm"
                    className="hidden md:flex bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 rounded-full px-4 shadow-lg"
                  >
                    Sign in
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </motion.header>

        {/* Mobile Menu Dropdown - Smaller and more compact */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-xs px-4 md:hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.div
                className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-2xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {/* Mobile Navigation Links - More compact */}
                <div className="p-4 space-y-2">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileHover={{ x: 4 }}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all duration-300">
                        <item.icon className="w-4 h-4 text-gray-600 dark:text-white/80 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <span className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                          {item.name}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all duration-200" />
                    </motion.a>
                  ))}
                </div>

                {/* Mobile CTA - More compact */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                  {session ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl">
                        <img
                          src={session.user?.image || "/default-avatar.png"}
                          alt={session.user?.name || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full h-10 bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl shadow-lg font-semibold text-sm"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Link href="/signin">
                      <Button
                        className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 rounded-xl shadow-lg font-semibold text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign in
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-x-hidden">
      <FloatingNav />
      <FloatingHeader />

      {/* Enhanced Hero Section with responsive text */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center pt-24 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-black dark:via-[#0A0A0A] dark:to-[#121212] overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Enhanced Background Effects */}
        <MovingOrb />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]" />
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

        <CurvedDivider />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-8 md:space-y-12">
            {/* Enhanced Badge - responsive */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-gray-100/80 to-gray-50/80 dark:from-white/10 dark:to-white/5 border border-gray-200 dark:border-white/20 rounded-full text-gray-700 dark:text-white/90 backdrop-blur-sm mb-6 md:mb-8 relative overflow-hidden text-sm"
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(6, 182, 212, 0.3)",
                    "0 0 40px rgba(6, 182, 212, 0.5)",
                    "0 0 20px rgba(6, 182, 212, 0.3)",
                  ],
                }}
                transition={{
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                  animate={{
                    x: [-100, 400],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10 font-medium">
                  ✨ Now in Beta - Join 500+ teams
                </span>
                <ArrowRight className="w-4 h-4 relative z-10" />
              </motion.div>
            </motion.div>

            {/* Enhanced Typography - responsive */}
            <motion.div
              className="space-y-4 md:space-y-6"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              {/* Main Headline - responsive text sizes */}
              <div className="relative">
                <motion.h1
                  className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-[0.9] md:leading-[0.85] tracking-tight bg-gradient-to-br from-gray-900 via-gray-600 to-gray-400 dark:from-gray-100 dark:via-gray-400 dark:to-gray-500 bg-clip-text text-transparent"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
                  }}
                >
                  Meetings that
                  <br />
                  <motion.span
                    className="relative inline-block"
                    animate={{
                      textShadow: [
                        "0 0 30px rgba(6, 182, 212, 0.6)",
                        "0 0 60px rgba(59, 130, 246, 0.8)",
                        "0 0 30px rgba(6, 182, 212, 0.6)",
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    actually work.
                  </motion.span>
                </motion.h1>

                {/* Decorative element behind text */}
                <motion.div
                  className="absolute -top-4 -left-4 md:-top-8 md:-left-8 w-16 h-16 md:w-32 md:h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl md:blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                    x: [0, 20, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Enhanced Description - responsive */}
            <motion.div
              className="space-y-3 md:space-y-4 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p className="text-lg md:text-xl lg:text-2xl font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                Individual audio control. Real-time collaboration. Zero
                friction.
              </p>
              <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-500 leading-relaxed">
                Finally, a video conferencing tool designed by developers, for
                teams that actually get stuff done.
              </p>

              {/* Stats - responsive */}
              <motion.div
                className="flex items-center justify-center gap-4 md:gap-8 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {[
                  { label: "Active Teams", value: "500+" },
                  { label: "Time Saved", value: "40%" },
                  { label: "Uptime", value: "99.9%" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Enhanced CTA Buttons - responsive */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-6 md:pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="px-8 py-3 md:px-10 md:py-4 text-base md:text-lg font-bold group bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-black hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-100 dark:hover:to-white shadow-2xl border-0 rounded-2xl relative overflow-hidden"
                >
                  {/* Button shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    animate={{
                      x: [-200, 200],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2 md:gap-3">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 md:px-10 md:py-4 text-base md:text-lg font-semibold group border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:border-cyan-400/50 hover:bg-cyan-50 dark:hover:bg-cyan-400/10 backdrop-blur-sm rounded-2xl transition-all duration-300"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                  Watch Demo
                  <motion.div
                    className="absolute inset-0 border border-cyan-400/30 rounded-2xl opacity-0 group-hover:opacity-100"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Bento Grid Features Section */}
      <motion.section
        id="features"
        className="relative py-32 px-6 bg-gray-50 dark:bg-[#0A0A0A]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
      >
        <CurvedDivider flip />

        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Built for modern teams
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need for seamless collaboration, designed with
              precision
            </p>
          </motion.div>

          <div className="grid auto-rows-[200px] grid-cols-1 md:grid-cols-3 gap-6">
            {bentoFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-white/5 dark:to-white/[0.02] backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500 p-6 ${feature.className}`}
                variants={fadeInUp}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
                style={{
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <feature.icon className="w-6 h-6 text-gray-700 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {feature.description}
                  </p>
                  <div className="flex-1 flex items-center justify-center">
                    {feature.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <CurvedDivider className="text-gray-100 dark:text-[#121212]" />
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        id="demo"
        className="relative py-32 px-6 bg-gray-100 dark:bg-[#121212]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
      >
        <CurvedDivider flip className="text-gray-50 dark:text-[#0A0A0A]" />

        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <Badge
              variant="outline"
              className="border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-gray-700 dark:text-white/80 backdrop-blur-sm mb-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              Lightning fast setup
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Start in{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                30 seconds
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              No downloads, no complex setup. Just better meetings from the
              moment you sign up.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="group relative"
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-white/5 dark:to-white/[0.02] backdrop-blur-sm border border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-white/20 transition-all duration-500 overflow-hidden"
                  style={{
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  }}
                  whileHover={{
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {/* Animated background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}
                  />

                  {/* Step content with theme-aware colors */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg relative`}
                    >
                      <span className="text-white font-bold text-lg">
                        {step.number}
                      </span>
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl blur-lg opacity-50`}
                      />
                    </div>

                    <motion.div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${step.gradient} bg-opacity-10 border border-gray-200 dark:border-white/10`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <step.icon className="w-6 h-6 text-gray-700 dark:text-white" />
                    </motion.div>
                  </div>

                  <div className="relative z-10">
                    <p className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider font-medium mb-2">
                      {step.subtitle}
                    </p>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-white/90 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                      {step.description}
                    </p>
                  </div>

                  {/* Progress indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-white/5 rounded-b-3xl overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${step.gradient}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <CurvedDivider className="text-gray-200 dark:text-[#0F0F0F]" />
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        id="testimonials"
        className="relative py-32 px-6 bg-white dark:bg-[#0F0F0F]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
      >
        <CurvedDivider flip className="text-gray-50 dark:text-[#121212]" />

        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge
                variant="outline"
                className="border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 backdrop-blur-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified reviews
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Loved by{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  10,000+
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400/50 to-orange-500/50 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </span>{" "}
              teams
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
              See why industry leaders choose EchoLoom for their critical
              meetings
            </p>

            {/* Company Logos */}
            <motion.div
              className="flex items-center justify-center gap-8 mb-16 opacity-60"
              variants={fadeInUp}
            >
              {companies.map((company) => (
                <motion.div
                  key={company.name}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 font-bold"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {company.logo}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                className="group relative"
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="relative h-full p-8 rounded-3xl bg-white dark:bg-gray-900 backdrop-blur-sm border border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-white/20 transition-all duration-500 overflow-hidden"
                  style={{
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  }}
                  whileHover={{
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 dark:from-cyan-500/10 dark:via-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                  {/* Rating stars */}
                  <div className="flex items-center gap-1 mb-6 relative z-10">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                    {testimonial.verified && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Quote */}
                  <blockquote className="relative z-10 text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-8 font-medium">
                    <span className="text-4xl text-gray-200 dark:text-white/20 absolute -top-2 -left-1">
                      &quot;
                    </span>
                    {testimonial.quote}
                    <span className="text-4xl text-gray-200 dark:text-white/20 absolute -bottom-6 -right-1">
                      &quot;
                    </span>
                  </blockquote>

                  {/* Profile */}
                  <div className="relative z-10 flex items-center gap-4">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-white/10"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">at</span>
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/70 bg-gray-50 dark:bg-white/5"
                        >
                          {testimonial.company}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <CurvedDivider className="text-gray-50 dark:text-[#121212]" />
      </motion.section>

      {/* Book a Meeting - Modern CTA Section */}
      <motion.section
        id="pricing"
        className="relative py-32 px-6 bg-gray-50 dark:bg-[#121212]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
      >
        <CurvedDivider flip className="text-white dark:text-[#0F0F0F]" />

        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <Badge
              variant="outline"
              className="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Limited Early Access
            </Badge>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  revolutionize
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-500/20 to-red-500/20 blur-xl"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </span>
              <br />
              your meetings?
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join the waitlist and be among the first 100 teams to experience
              the future of video conferencing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits */}
            <motion.div className="space-y-8" variants={fadeInUp}>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  What you get with early access:
                </h3>

                {[
                  {
                    icon: Clock,
                    title: "30-min personalized demo",
                    desc: "See EchoLoom in action with your specific use cases",
                    gradient: "from-blue-400 to-cyan-400",
                  },
                  {
                    icon: Users,
                    title: "Priority onboarding",
                    desc: "Get your entire team set up with dedicated support",
                    gradient: "from-purple-400 to-pink-400",
                  },
                  {
                    icon: Zap,
                    title: "Beta feature access",
                    desc: "Try cutting-edge features before they're public",
                    gradient: "from-yellow-400 to-orange-400",
                  },
                  {
                    icon: Shield,
                    title: "Enterprise security",
                    desc: "SOC2 compliant with end-to-end encryption",
                    gradient: "from-green-400 to-emerald-400",
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    className="flex items-start gap-4 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 8 }}
                  >
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${benefit.gradient} bg-opacity-10 border border-gray-200 dark:border-white/10 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <benefit.icon className="w-6 h-6 text-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right side - CTA Card */}
            <motion.div className="relative" variants={fadeInUp}>
              <motion.div
                className="relative p-8 rounded-3xl bg-white dark:bg-gray-900 backdrop-blur-sm border border-gray-200 dark:border-white/20 overflow-hidden"
                style={{
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 16px 64px rgba(0, 0, 0, 0.12)",
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 dark:from-cyan-500/10 dark:via-purple-500/10 dark:to-pink-500/10"
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div className="relative z-10 text-center space-y-6">
                  <div className="space-y-3">
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(168, 85, 247, 0.3)",
                          "0 0 40px rgba(168, 85, 247, 0.5)",
                          "0 0 20px rgba(168, 85, 247, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-gray-700 dark:text-white">
                        Book your demo slot
                      </span>
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Get started today
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Join 200+ companies already on the waitlist
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                      {/* Button shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: [-100, 400],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Schedule Your Demo
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                      </span>
                    </Button>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Free demo • No commitment • Available this week
                    </p>

                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <div className="flex -space-x-2">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white dark:border-gray-700 flex items-center justify-center text-white font-bold text-xs"
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        <span className="text-gray-900 dark:text-white font-semibold">
                          200+
                        </span>{" "}
                        teams waiting
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <CurvedDivider className="text-gray-100 dark:text-[#0F0F0F]" />
      </motion.section>

      {/* Contact */}
      <motion.section
        id="contact"
        className="relative py-32 px-6 bg-gray-100 dark:bg-[#0F0F0F]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
      >
        <CurvedDivider flip className="text-gray-50 dark:text-[#121212]" />

        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Let&apos;s build together
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Questions? Feedback? Ready to revolutionize your meetings?
              We&apos;d love to hear from you.
            </p>
          </motion.div>

          <motion.form
            className="relative p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10"
            variants={fadeInUp}
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
            whileHover={{
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            }}
            transition={{ duration: 0.3 }}
            onSubmit={(e) => {
              e.preventDefault();
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 2000);
            }}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    className="h-12 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@company.com"
                    className="h-12 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="message"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project, questions, or how we can help..."
                  rows={4}
                  className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Send Message
                  </span>
                )}
              </Button>

              {/* Simple footer */}
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </motion.form>
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-[#0A0A0A] border-t border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
            {/* Brand Section */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white"
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
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  EchoLoom
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
                Revolutionizing video conferencing with smart audio control for
                modern teams.
              </p>
            </motion.div>

            {/* Navigation Links */}
            <motion.div
              className="flex items-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { name: "About", href: "#" },
                { name: "Features", href: "#features" },
                { name: "Contact Us", href: "#contact" },
                { name: "Privacy Policy", href: "#" },
              ].map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            className="border-t border-gray-200 dark:border-white/10 pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span>© 2024 EchoLoom. All rights reserved.</span>
                <div className="flex items-center gap-6">
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </div>
              </div>

              <motion.div
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                whileHover={{ scale: 1.05 }}
              >
                <span>Built with</span>
                <motion.span
                  className="text-red-400"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ❤️
                </motion.span>
                <span>by developers, for developers</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default EchoLoom;
