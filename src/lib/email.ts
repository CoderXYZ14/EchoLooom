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
