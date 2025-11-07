import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const emailData = {
      to,
      from: process.env.SENDGRID_SENDER!,
      subject,
      html,
    };

    const response = await sendgrid.send(emailData);
    console.log("Email sent successfully!");
    return { success: true, messageId: response[0].headers["x-message-id"] };
  } catch (error: unknown) {
    console.error("Email send failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
