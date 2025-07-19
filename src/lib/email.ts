import { Resend } from "resend";
import WelcomeEmail from "@/components/WelcomeEmail";
import MeetingInviteEmail from "@/components/MeetingInviteEmail";
import MeetingUpdateEmail from "@/components/MeetingUpdateEmail";
import MeetingCancellationEmail from "@/components/MeetingCancellationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (name: string, email: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "EchoLoom <no-reply@echoloom.live>",
      to: [email],
      subject: "Welcome to EchoLoom! Your account is ready 🎉",
      react: WelcomeEmail({
        username: name || email.split("@")[0],
      }),
    });

    if (error) {
      console.error("WelcomeEmail | Resend API error:", error);
      return { success: false, error };
    }

    console.log("WelcomeEmail | Email sent successfully to:", email);
    return { success: true, data };
  } catch (error) {
    console.error("WelcomeEmail | General error:", error);
    return { success: false, error };
  }
};

export const sendMeetingInviteEmail = async ({
  participantName,
  participantEmail,
  hostName,
  meetingTitle,
  meetingTime,
  duration,
  meetingLink,
}: {
  participantName: string;
  participantEmail: string;
  hostName: string;
  meetingTitle: string;
  meetingTime: string;
  duration: number;
  meetingLink: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "EchoLoom <meetings@echoloom.live>",
      to: [participantEmail],
      subject: `Meeting Invitation: ${meetingTitle}`,
      react: MeetingInviteEmail({
        participantName,
        hostName,
        meetingTitle,
        meetingTime,
        duration,
        meetingLink,
      }),
    });

    if (error) {
      console.error("MeetingInviteEmail | Resend API error:", error);
      return { success: false, error };
    }

    console.log(
      "MeetingInviteEmail | Email sent successfully to:",
      participantEmail
    );
    return { success: true, data };
  } catch (error) {
    console.error("MeetingInviteEmail | General error:", error);
    return { success: false, error };
  }
};

export const sendMeetingUpdateEmail = async ({
  participantName,
  participantEmail,
  hostName,
  meetingTitle,
  meetingTime,
  duration,
  meetingLink,
  changedFields,
}: {
  participantName: string;
  participantEmail: string;
  hostName: string;
  meetingTitle: string;
  meetingTime: string;
  duration: number;
  meetingLink: string;
  changedFields: string[];
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "EchoLoom <meetings@echoloom.live>",
      to: [participantEmail],
      subject: `Meeting Updated: ${meetingTitle}`,
      react: MeetingUpdateEmail({
        participantName,
        hostName,
        meetingTitle,
        meetingTime,
        duration,
        meetingLink,
        changedFields,
      }),
    });

    if (error) {
      console.error("MeetingUpdateEmail | Resend API error:", error);
      return { success: false, error };
    }

    console.log(
      "MeetingUpdateEmail | Email sent successfully to:",
      participantEmail
    );
    return { success: true, data };
  } catch (error) {
    console.error("MeetingUpdateEmail | General error:", error);
    return { success: false, error };
  }
};

export const sendMeetingCancellationEmail = async ({
  participantName,
  participantEmail,
  hostName,
  meetingTitle,
  meetingTime,
  duration,
  reason,
}: {
  participantName: string;
  participantEmail: string;
  hostName: string;
  meetingTitle: string;
  meetingTime: string;
  duration: number;
  reason?: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "EchoLoom <meetings@echoloom.live>",
      to: [participantEmail],
      subject: `Meeting Cancelled: ${meetingTitle}`,
      react: MeetingCancellationEmail({
        participantName,
        hostName,
        meetingTitle,
        meetingTime,
        duration,
        reason,
      }),
    });

    if (error) {
      console.error("MeetingCancellationEmail | Resend API error:", error);
      return { success: false, error };
    }

    console.log(
      "MeetingCancellationEmail | Email sent successfully to:",
      participantEmail
    );
    return { success: true, data };
  } catch (error) {
    console.error("MeetingCancellationEmail | General error:", error);
    return { success: false, error };
  }
};
