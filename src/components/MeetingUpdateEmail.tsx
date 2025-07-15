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

interface MeetingUpdateEmailProps {
  participantName: string;
  hostName: string;
  meetingTitle: string;
  meetingTime: string;
  duration: number;
  meetingLink: string;
  changedFields: string[];
}

export const MeetingUpdateEmail = ({
  participantName,
  hostName,
  meetingTitle,
  meetingTime,
  duration,
  meetingLink,
  changedFields,
}: MeetingUpdateEmailProps) => {
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

  const getChangeDescription = () => {
    if (changedFields.length === 0) return "Meeting details have been updated.";

    const fieldNames = {
      title: "meeting title",
      scheduledTime: "meeting time",
      duration: "meeting duration",
    };

    const changedFieldNames = changedFields.map(
      (field) => fieldNames[field as keyof typeof fieldNames] || field
    );

    if (changedFieldNames.length === 1) {
      return `The ${changedFieldNames[0]} has been updated.`;
    } else if (changedFieldNames.length === 2) {
      return `The ${changedFieldNames[0]} and ${changedFieldNames[1]} have been updated.`;
    } else {
      const lastField = changedFieldNames.pop();
      return `The ${changedFieldNames.join(
        ", "
      )}, and ${lastField} have been updated.`;
    }
  };

  return (
    <Html>
      <Head />
      <Preview>
        Meeting Updated: {meetingTitle} - {formatDate(meetingTime)} at{" "}
        {formatTime(meetingTime)}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 my-auto mx-auto font-sans">
          <Container className="bg-white border border-solid border-gray-200 rounded-lg my-[40px] mx-auto p-[40px] max-w-[600px] shadow-sm">
            {/* Header with Logo */}
            <Section className="text-center mb-8">
              <Img
                src="https://tan-ebony-93.tiiny.site/favicon.svg"
                alt="EchoLoom Logo"
                width="60"
                height="60"
                className="mx-auto mb-1"
              />
              <Text className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-0">
                EchoLoom
              </Text>
            </Section>

            {/* Main Content */}
            <Heading className="text-gray-800 text-[24px] font-semibold text-center mb-6 leading-tight">
              Meeting Updated
            </Heading>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-4">
              Hi {participantName},
            </Text>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6">
              {hostName} has updated the meeting details.{" "}
              {getChangeDescription()}
            </Text>

            {/* Changed Fields Highlight */}
            {changedFields.length > 0 && (
              <Section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <Text className="font-semibold text-blue-800 text-[14px] mb-2">
                  📝 What changed:
                </Text>
                <ul className="text-blue-700 text-[14px] leading-[20px] space-y-1 list-disc list-inside mb-0">
                  {changedFields.includes("title") && <li>Meeting title</li>}
                  {changedFields.includes("scheduledTime") && (
                    <li>Meeting time</li>
                  )}
                  {changedFields.includes("duration") && (
                    <li>Meeting duration</li>
                  )}
                </ul>
              </Section>
            )}

            {/* Updated Meeting Details */}
            <Section className="bg-gray-50 rounded-lg p-6 mb-8">
              <Text className="font-bold text-[18px] text-gray-800 mb-4 text-center">
                {meetingTitle}
              </Text>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Text className="font-semibold text-gray-700 text-[14px] w-20 mb-0">
                    Date:
                  </Text>
                  <Text className="text-gray-600 text-[14px] mb-0">
                    {formatDate(meetingTime)}
                  </Text>
                </div>

                <div className="flex items-center">
                  <Text className="font-semibold text-gray-700 text-[14px] w-20 mb-0">
                    Time:
                  </Text>
                  <Text className="text-gray-600 text-[14px] mb-0">
                    {formatTime(meetingTime)}
                  </Text>
                </div>

                <div className="flex items-center">
                  <Text className="font-semibold text-gray-700 text-[14px] w-20 mb-0">
                    Duration:
                  </Text>
                  <Text className="text-gray-600 text-[14px] mb-0">
                    {formatDuration(duration)}
                  </Text>
                </div>

                <div className="flex items-center">
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
                Join Updated Meeting
              </Button>

              <Text className="text-gray-600 text-[14px] mt-4 mb-0">
                Please note the updated details and join at the new scheduled
                time.
              </Text>
            </Section>

            {/* Important Note */}
            <Section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <Text className="font-semibold text-yellow-800 text-[14px] mb-2">
                ⚠️ Important:
              </Text>
              <Text className="text-yellow-700 text-[14px] mb-0">
                Please update your calendar with the new meeting details. The
                meeting link remains the same.
              </Text>
            </Section>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6 text-center">
              If you have any questions about the changes, please contact the
              host directly.
            </Text>

            <Hr className="border border-solid border-gray-200 my-8 mx-0 w-full" />

            {/* Footer */}
            <Section className="text-center">
              <table className="w-full">
                <tr className="w-full">
                  <td align="center">
                    <Img
                      src="https://tan-ebony-93.tiiny.site/favicon.svg"
                      alt="EchoLoom Logo"
                      width="42"
                      height="42"
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

MeetingUpdateEmail.PreviewProps = {
  participantName: "John Doe",
  hostName: "Jane Smith",
  meetingTitle: "Weekly Team Standup",
  meetingTime: "2025-01-15T14:00:00Z",
  duration: 90,
  meetingLink: "https://echoloom.com/meeting/example-room",
  changedFields: ["scheduledTime", "duration"],
} as MeetingUpdateEmailProps;

export default MeetingUpdateEmail;
