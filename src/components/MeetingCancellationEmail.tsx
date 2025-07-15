import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Text,
  Tailwind,
  Section,
} from "@react-email/components";
import { LOGO_URL } from "@/lib/links";

interface MeetingCancellationEmailProps {
  participantName: string;
  hostName: string;
  meetingTitle: string;
  meetingTime: string;
  duration: number;
  reason?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
};

export const MeetingCancellationEmail = ({
  participantName,
  hostName,
  meetingTitle,
  meetingTime,
  duration,
  reason = "The meeting has been cancelled",
}: MeetingCancellationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Meeting Cancelled: {meetingTitle} - {formatDate(meetingTime)} at{" "}
        {formatTime(meetingTime)}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 my-auto mx-auto font-sans">
          <Container className="bg-white border border-solid border-gray-200 rounded-lg my-[40px] mx-auto p-[40px] max-w-[600px] shadow-sm">
            {/* Header with Logo */}
            <Section className="text-center mb-8">
              <Img
                src={LOGO_URL}
                alt="EchoLoom Logo"
                width="60"
                height="60"
                className="mx-auto mb-1"
              />
              <Text className="text-2xl font-bold text-black mb-0">
                EchoLoom
              </Text>
            </Section>

            {/* Main Content */}
            <Heading className="text-gray-800 text-[24px] font-semibold text-center mb-6 leading-tight">
              Meeting Cancelled
            </Heading>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-4">
              Hi {participantName},
            </Text>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6">
              We&apos;re writing to inform you that the following meeting has
              been cancelled by {hostName}:
            </Text>

            {/* Meeting Details */}
            <Section className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <Text className="text-red-800 text-[18px] font-semibold mb-4">
                {meetingTitle}
              </Text>

              <div>
                <div className="flex items-center mb-2">
                  <Text className="text-red-700 text-[14px] font-medium mb-0 mr-2">
                    📅 Date:
                  </Text>
                  <Text className="text-red-700 text-[14px] mb-0">
                    {formatDate(meetingTime)}
                  </Text>
                </div>

                <div className="flex items-center mb-2">
                  <Text className="text-red-700 text-[14px] font-medium mb-0 mr-2">
                    🕐 Time:
                  </Text>
                  <Text className="text-red-700 text-[14px] mb-0">
                    {formatTime(meetingTime)}
                  </Text>
                </div>

                <div className="flex items-center mb-2">
                  <Text className="text-red-700 text-[14px] font-medium mb-0 mr-2">
                    ⏱️ Duration:
                  </Text>
                  <Text className="text-red-700 text-[14px] mb-0">
                    {duration} minutes
                  </Text>
                </div>

                <div className="flex items-center">
                  <Text className="text-red-700 text-[14px] font-medium mb-0 mr-2">
                    👤 Host:
                  </Text>
                  <Text className="text-red-700 text-[14px] mb-0">
                    {hostName}
                  </Text>
                </div>
              </div>
            </Section>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6">
              {reason}
            </Text>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6">
              We apologize for any inconvenience this may cause. If you need to
              reschedule or have any questions, please contact {hostName}{" "}
              directly.
            </Text>

            <Hr className="border-gray-200 my-6" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-gray-500 text-[14px] leading-[24px] mb-2">
                This email was sent by EchoLoom on behalf of {hostName}.
              </Text>
              <Text className="text-gray-500 text-[12px] leading-[20px]">
                <a
                  href="https://echoloom.live/terms"
                  className="text-purple-600 underline"
                >
                  Terms of Service
                </a>
                {" • "}
                <a
                  href="https://echoloom.live/privacy"
                  className="text-purple-600 underline"
                >
                  Privacy Policy
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MeetingCancellationEmail;
