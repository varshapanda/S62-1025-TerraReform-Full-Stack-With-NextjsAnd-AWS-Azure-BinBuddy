// lib/email-sender.ts
import sendgrid from "@sendgrid/mail";

// Initialize SendGrid once at module load
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_SENDER;

if (SENDGRID_API_KEY) {
  sendgrid.setApiKey(SENDGRID_API_KEY);
  console.log("SendGrid initialized successfully");
} else {
  console.warn("WARNING: SENDGRID_API_KEY not found in environment variables");
}

interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  console.log("=== SEND EMAIL ATTEMPT ===");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("SENDGRID_API_KEY exists:", !!SENDGRID_API_KEY);
  console.log("SENDGRID_SENDER exists:", !!SENDGRID_SENDER);
  console.log("SENDGRID_SENDER value:", SENDGRID_SENDER);

  try {
    if (!SENDGRID_API_KEY || !SENDGRID_SENDER) {
      const missingVars = [];
      if (!SENDGRID_API_KEY) missingVars.push("SENDGRID_API_KEY");
      if (!SENDGRID_SENDER) missingVars.push("SENDGRID_SENDER");

      const errorMsg = `SendGrid not configured. Missing: ${missingVars.join(", ")}`;
      console.error("ERROR:", errorMsg);

      // In development, log the email content for testing
      if (process.env.NODE_ENV === "development") {
        console.log("\n=== DEVELOPMENT MODE - EMAIL CONTENT ===");
        console.log("To:", to);
        console.log("Subject:", subject);

        // Extract verification URL from HTML
        const urlMatch = html.match(/href="([^"]*verify[^"]*)"/i);
        if (urlMatch) {
          console.log("\nVERIFICATION URL (copy and paste in browser):");
          console.log(urlMatch[1]);
          console.log("\n");
        }
        console.log("=== END EMAIL CONTENT ===\n");

        return {
          success: true,
          messageId: "dev-mode-no-sendgrid",
        };
      }

      return {
        success: false,
        error: errorMsg,
      };
    }

    const emailData = {
      to,
      from: SENDGRID_SENDER,
      subject,
      html,
    };

    console.log("Sending email via SendGrid...");
    const response = await sendgrid.send(emailData);

    console.log("SUCCESS: Email sent via SendGrid");
    console.log("Message ID:", response[0].headers["x-message-id"]);

    return {
      success: true,
      messageId: response[0].headers["x-message-id"],
    };
  } catch (error: unknown) {
    type SendGridError = Error & {
      response?: { body?: unknown };
      code?: number | string;
    };

    const err = error as SendGridError;

    console.error("=== EMAIL SEND ERROR ===");
    console.error("Error type:", err?.constructor?.name ?? typeof error);
    console.error("Error message:", err?.message ?? String(error));

    if (err.response) {
      console.error(
        "SendGrid response body:",
        JSON.stringify(err.response.body, null, 2)
      );
      console.error("Status code:", err.code);
    }

    if (err.stack) {
      console.error("Stack trace:", err.stack);
    }

    // In development, still allow the process to continue
    if (process.env.NODE_ENV === "development") {
      console.log("\n=== DEVELOPMENT MODE - ALLOWING SIGNUP TO PROCEED ===");

      // Extract and log verification URL
      const urlMatch = html.match(/href="([^"]*verify[^"]*)"/i);
      if (urlMatch) {
        console.log("\nMANUAL VERIFICATION URL:");
        console.log(urlMatch[1]);
        console.log("\n");
      }

      return {
        success: true,
        messageId: "dev-mode-error-fallback",
      };
    }

    return {
      success: false,
      error: err?.message ?? "Failed to send email via SendGrid",
    };
  }
}
