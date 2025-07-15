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
  Button,
} from "@react-email/components";
import { LOGO_URL } from "@/lib/links";

interface MeetingInviteEmailProps {
  participantName: string;
  hostName: string;
  meetingTitle: string;
  meetingTime: string;
  duration: number;
  meetingLink: string;
}

export const MeetingInviteEmail = ({
  participantName,
  hostName,
  meetingTitle,
  meetingTime,
  duration,
  meetingLink,
}: MeetingInviteEmailProps) => {
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
      timeZoneName: "short",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minutes`;
  };

  return (
    <Html>
      <Head />
      <Preview>
        Meeting Invitation: {meetingTitle} - {formatDate(meetingTime)} at{" "}
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
              <Text className="text-2xl font-bold  text-black mb-0">
                EchoLoom
              </Text>
            </Section>

            {/* Main Content */}
            <Heading className="text-gray-800 text-[24px] font-semibold text-center mb-6 leading-tight">
              You&apos;re invited to a meeting!
            </Heading>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-4">
              Hi {participantName},
            </Text>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6">
              {hostName} has invited you to join a meeting on EchoLoom. Here are
              the details:
            </Text>

            {/* Meeting Details */}
            <Section className="bg-gray-50 rounded-lg p-6 mb-8">
              <Text className="font-bold text-[18px] text-gray-800 mb-4 text-center">
                {meetingTitle}
              </Text>

              <div>
                <div className="flex items-center mb-3">
                  <Text className="font-semibold text-gray-700 text-[14px] w-20 mb-0">
                    Date:
                  </Text>
                  <Text className="text-gray-600 text-[14px] mb-0">
                    {formatDate(meetingTime)}
                  </Text>
                </div>

                <div className="flex items-center mb-3">
                  <Text className="font-semibold text-gray-700 text-[14px] w-20 mb-0">
                    Time:
                  </Text>
                  <Text className="text-gray-600 text-[14px] mb-0">
                    {formatTime(meetingTime)}
                  </Text>
                </div>

                <div className="flex items-center mb-3">
                  <Text className="font-semibold text-gray-700 text-[14px] w-20 mb-0">
                    Duration:
                  </Text>
                  <Text className="text-gray-600 text-[14px] mb-0">
                    {formatDuration(duration)}
                  </Text>
                </div>

                <div className="flex items-center mb-3">
                  <Text className="font-semibold text-gray-700 text-[14px] w-20 mb-0">
                    Host:
                  </Text>
                  <Text className="text-gray-600 text-[14px] mb-0">
                    {hostName}
                  </Text>
                </div>
              </div>
            </Section>

            {/* Join Button */}
            <Section className="text-center mb-8">
              <Button
                href={meetingLink}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-lg text-[16px] font-medium no-underline inline-block"
              >
                Join Meeting
              </Button>

              <Text className="text-gray-600 text-[14px] mt-4 mb-0">
                Click the button above to join the meeting at the scheduled
                time.
              </Text>
            </Section>

            {/* Instructions */}
            <Section className="mb-8">
              <Text className="font-semibold text-[16px] text-gray-800 mb-3">
                How to join:
              </Text>
              <ul className="text-gray-700 text-[14px] leading-[22px] list-disc list-inside">
                <li className="mb-2">
                  Click the &quot;Join Meeting&quot; button above
                </li>
                <li className="mb-2">
                  Allow camera and microphone access when prompted
                </li>
                <li className="mb-2">
                  You can join as a guest or sign in with Google for full
                  features
                </li>
                <li className="mb-2">
                  The meeting link will be active 15 minutes before the
                  scheduled time
                </li>
              </ul>
            </Section>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6 text-center">
              If you have any trouble joining the meeting, please contact the
              host or our support team.
            </Text>

            <Hr className="border border-solid border-gray-200 my-8 mx-0 w-full" />

            {/* Footer */}
            <Section className="text-center">
              <table className="w-full">
                <tr className="w-full">
                  <td align="center">
                    <Img
                      src={LOGO_URL}
                      alt="EchoLoom Logo"
                      width="42"
                      height="42"
                      className="mx-auto mb-1"
                    />
                  </td>
                </tr>
                <tr className="w-full">
                  <td align="center">
                    <Text className="my-[8px] font-semibold text-[16px] text-gray-900 leading-[24px]">
                      EchoLoom
                    </Text>
                    <Text className="mt-[4px] mb-0 text-[16px] text-gray-500 leading-[24px]">
                      Your video meeting platform
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Text className="text-gray-500 text-[12px] leading-[20px] text-center mt-4">
              © 2025 EchoLoom. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

MeetingInviteEmail.PreviewProps = {
  participantName: "John Doe",
  hostName: "Jane Smith",
  meetingTitle: "Weekly Team Standup",
  meetingTime: "2025-01-15T10:00:00Z",
  duration: 60,
  meetingLink: "https://echoloom.com/meeting/example-room",
} as MeetingInviteEmailProps;

export default MeetingInviteEmail;
