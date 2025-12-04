import sendgrid from "@sendgrid/mail";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

// Initialize SendGrid with API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    // Parse request body
    const { to, subject, message } = await req.json();

    // Validate inputs
    if (!to || !subject || !message) {
      return sendError(
        "Missing required fields",
        ERROR_CODES.VALIDATION_ERROR,
        400
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

    const data = {
      messageId: response[0].headers["x-message-id"],
    };

    return sendSuccess<typeof data>(
      data,
      "Email sent successfully via SendGrid",
      200
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Email send failed:", error);

    // Check for specific SendGrid errors
    if (error.response) {
      const sendGridError =
        error.response.body?.errors?.[0]?.message || error.message;
      return sendError(
        sendGridError || "Failed to send email via SendGrid",
        ERROR_CODES.EXTERNAL_SERVICE_FAILURE || "E005",
        502,
        error.response.body
      );
    }

    // Fallback for other errors
    return sendError(
      error.message || "Failed to send email",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
