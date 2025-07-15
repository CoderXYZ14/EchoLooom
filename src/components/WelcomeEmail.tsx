import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
  Tailwind,
  Section,
  Row,
  Column,
  Img,
  Button,
} from "@react-email/components";
import { SOCIAL_LINKS } from "@/lib/links";

interface WelcomeEmailProps {
  username: string;
}

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://echoloom.vercel.app";

export const WelcomeEmail = ({ username }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to EchoLoom! Your video meeting platform is ready 🎉
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
              Welcome to EchoLoom!
            </Heading>
            <Text className="text-gray-700 text-[16px] leading-[26px] mb-4">
              Hi {username},
            </Text>
            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6">
              Thank you for joining EchoLoom! We&apos;re excited to have you on
              board. Your video meeting platform is ready to help you connect,
              collaborate, and communicate with your team seamlessly.
            </Text>

            {/* Features Section */}
            <Section className="text-center mb-8">
              <Row>
                <Column align="center">
                  <Text className="font-bold text-[18px] text-purple-600 leading-[28px] mb-2">
                    Get Started Now
                  </Text>
                  <Text className="text-gray-600 text-[14px] mb-4">
                    Start creating meetings and invite your team
                  </Text>
                  <Button
                    href={`${baseUrl}/dashboard`}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-lg text-[16px] font-medium no-underline"
                  >
                    Go to Dashboard
                  </Button>
                </Column>
              </Row>
            </Section>

            {/* Features List */}
            <Section className="mb-8">
              <Text className="font-semibold text-[16px] text-gray-800 mb-4">
                What you can do with EchoLoom:
              </Text>
              <ul className="text-gray-700 text-[14px] leading-[22px] space-y-2 list-disc list-inside">
                <li>Schedule meetings with calendar integration</li>
                <li>Invite participants via email</li>
                <li>Join meetings as guest or authenticated user</li>
                <li>Real-time video calls with high quality</li>
                <li>View meeting history and analytics</li>
              </ul>
            </Section>

            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6 text-center">
              If you have any questions or need help getting started, don&apos;t
              hesitate to reach out to our support team. We&apos;re here to help
              you succeed!
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
                <tr>
                  <td align="center">
                    <Row className="table-cell h-[44px] w-[56px] align-bottom">
                      <Column className="pr-[8px]">
                        <Link href={SOCIAL_LINKS.twitter}>
                          <Text className="text-blue-400 text-[24px] no-underline">
                            𝕏
                          </Text>
                        </Link>
                      </Column>
                      <Column className="pr-[8px]">
                        <Link href={SOCIAL_LINKS.github}>
                          <Text className="text-gray-600 text-[24px] no-underline">
                            ⚡
                          </Text>
                        </Link>
                      </Column>
                      <Column>
                        <Link href={SOCIAL_LINKS.linkedin}>
                          <Text className="text-blue-600 text-[24px] no-underline">
                            💼
                          </Text>
                        </Link>
                      </Column>
                    </Row>
                  </td>
                </tr>
              </table>
            </Section>

            <Text className="text-gray-500 text-[12px] leading-[20px] text-center mt-6">
              By signing up, you agree to our{" "}
              <Link
                href={`${baseUrl}/terms`}
                className="text-purple-600 underline hover:text-purple-800"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={`${baseUrl}/privacy`}
                className="text-purple-600 underline hover:text-purple-800"
              >
                Privacy Policy
              </Link>
            </Text>
            <Text className="text-gray-500 text-[12px] leading-[20px] text-center mt-4">
              © 2025 EchoLoom. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  username: "John Doe",
} as WelcomeEmailProps;

export default WelcomeEmail;
