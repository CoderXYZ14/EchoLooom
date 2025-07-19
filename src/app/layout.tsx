import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://echoloom.live"),
  title: "EchoLoom — Smarter Video Calls with Personal Audio Control",
  description:
    "EchoLoom is a video conferencing platform that gives you control. Tune out background noise, lower meeting volume, and finally enjoy your favorite music while staying connected.",
  keywords: [
    "EchoLoom",
    "smart meeting platform",
    "adjust meeting volume",
    "video conferencing with audio control",
    "AI video chat",
    "mute meeting background",
    "meet and listen to music",
    "Zoom alternative",
    "Zoom alternative with volume control",
    "Zoom alternative with audio control",
    "Zoom alternative with chat",
    "Zoom alternative with video",
    "Zoom alternative with screen sharing",
    "Zoom alternative with recording",
    "Zoom",
    "Google Meet",
    "Google Meet alternative",
    "Google Meet alternative with volume control",
    "Google Meet alternative with audio control",
    "Google Meet alternative with chat",
    "Google Meet alternative with video",
    "Google Meet alternative with screen sharing",
    "productivity meetings",
    "AI-powered meetings",
    "EchoLoom video SDK",
  ],
  openGraph: {
    title: "EchoLoom — Smarter Video Calls with Personal Audio Control",
    description:
      "Join meetings your way. EchoLoom lets you adjust meeting volume, chat with teammates, and control your call experience — all in one beautiful interface.",
    url: "/",
    siteName: "EchoLoom",
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "EchoLoom — Smarter Video Calls with Personal Audio Control",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EchoLoom — Smarter Video Calls with Personal Audio Control",
    description:
      "Meet. Control. Focus. EchoLoom gives you full control over your video calls — from volume sliders to in-meet chat and more.",
    creator: "@coderxyz14",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  appleWebApp: {
    title: "EchoLoom",
    capable: true,
    statusBarStyle: "default",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" }, // Use the main favicon.png
      { url: "/icon0.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  // Add web app manifest
  manifest: "/manifest.json",
  authors: [{ name: "Shahwaiz Islam" }],
  alternates: {
    canonical: "https://echoloom.live/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PRIMARY FAVICON - This is the most important for Google Search */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

        {/* Additional favicon formats - use your existing files */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon0.svg" />

        {/* Apple touch icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Web app meta tags */}
        <meta name="apple-mobile-web-app-title" content="EchoLoom" />
        <meta name="application-name" content="EchoLoom" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://echoloom.live" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "EchoLoom",
              operatingSystem: "All",
              applicationCategory: "CommunicationApplication",
              url: "https://echoloom.live",
              description:
                "EchoLoom is a video conferencing platform that puts users in control — adjust meeting volume, join in real-time, and stay productive without audio chaos.",
              keywords: [
                "EchoLoom",
                "smart video calls",
                "adjust meeting volume",
                "video chat with audio control",
                "AI meeting platform",
                "video conferencing app",
                "Chrome conferencing tool",
                "Zoom alternative",
                "mute manager meeting",
                "low volume Google Meet",
              ],
              author: {
                "@type": "Person",
                name: "Shahwaiz Islam",
              },
            }),
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            theme="light"
            duration={2000}
            position="bottom-right"
            richColors
          />
        </Providers>
      </body>
    </html>
  );
}
