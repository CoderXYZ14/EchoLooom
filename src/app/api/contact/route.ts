import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: "EchoLoom Contact Form <no-reply@echoloom.live>",
      to: ["shahwaizislam1404@gmail.com"],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #555;">Message:</h3>
            <p style="line-height: 1.6; color: #333;">${message.replace(
              /\n/g,
              "<br>"
            )}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
            <p style="margin: 0; color: #0066cc; font-size: 14px;">
              💡 <strong>Quick Actions:</strong><br>
              • Reply directly to: ${email}<br>
              • Add to CRM/Spreadsheet<br>
              • Schedule follow-up
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Contact | Failed to send contact email:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    const contact = await Contact.create({
      name,
      email,
      details: message,
      resolved: false,
    });

    console.log("Contact |  Contact message sent successfully!", contact);
    return NextResponse.json(
      { success: true, message: "Message sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact | Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
