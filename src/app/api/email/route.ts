import { NextResponse } from "next/server";
import sendgrid from "@sendgrid/mail";

// Initialize SendGrid with API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    // Parse request body
    const { to, subject, message } = await req.json();

    // Validate inputs
    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData = {
      to,
      from: process.env.SENDGRID_SENDER!,
      subject,
      html: message,
    };

    // Send email
    const response = await sendgrid.send(emailData);

    console.log("Email sent successfully!");
    console.log("Response headers:", response[0].headers);

    return NextResponse.json({
      success: true,
      messageId: response[0].headers["x-message-id"],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Email send failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}
