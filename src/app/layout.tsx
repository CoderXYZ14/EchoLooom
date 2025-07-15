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
    images: ["/og-cover.png"],
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/png", sizes: "96x96" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  authors: [{ name: "Shahwaiz Islam" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "EchoLoom",
              operatingSystem: "All",
              applicationCategory: "CommunicationApplication",
              url: "",
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
