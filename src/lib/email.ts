import { Resend } from "resend";
import WelcomeEmail from "@/components/WelcomeEmail";
import MeetingInviteEmail from "@/components/MeetingInviteEmail";
import MeetingUpdateEmail from "@/components/MeetingUpdateEmail";
import MeetingCancellationEmail from "@/components/MeetingCancellationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (name: string, email: string) => {
  try {
    console.log("About to send welcome email", { name, email });
    console.log("API Key exists:", !!process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "EchoLoom <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to EchoLoom! Your account is ready 🎉",
      react: WelcomeEmail({
        username: name || email.split("@")[0],
      }),
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    console.log("Welcome email sent successfully", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
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
    console.log("About to send meeting invite email", {
      participantName,
      participantEmail,
      meetingTitle,
    });

    const { data, error } = await resend.emails.send({
      from: "EchoLoom <meetings@resend.dev>",
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
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    console.log("Meeting invite email sent successfully", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send meeting invite email:", error);
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
    console.log("About to send meeting update email", {
      participantName,
      participantEmail,
      meetingTitle,
      changedFields,
    });

    const { data, error } = await resend.emails.send({
      from: "EchoLoom <meetings@resend.dev>",
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
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    console.log("Meeting update email sent successfully", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send meeting update email:", error);
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
    console.log("About to send meeting cancellation email", {
      participantName,
      participantEmail,
      meetingTitle,
    });

    const { data, error } = await resend.emails.send({
      from: "EchoLoom <meetings@resend.dev>",
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
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    console.log("Meeting cancellation email sent successfully", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send meeting cancellation email:", error);
    return { success: false, error };
  }
};

export async function sendMeetingInvite({
  to,
  hostName,
  meetingTitle,
  meetingTime,
  meetingLink,
}: {
  to: string;
  hostName: string;
  meetingTitle: string;
  meetingTime: Date;
  meetingLink: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "EchoLoom <meetings@echoloom.com>",
      to,
      subject: `Meeting Invitation: ${meetingTitle}`,
      html: `
        <div>
          <h2>You've been invited to a meeting</h2>
          <p><strong>Meeting:</strong> ${meetingTitle}</p>
          <p><strong>Host:</strong> ${hostName}</p>
          <p><strong>Time:</strong> ${meetingTime.toLocaleString()}</p>

          <p>
            <a href="${meetingLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Join Meeting
            </a>
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return await response.json();
}
