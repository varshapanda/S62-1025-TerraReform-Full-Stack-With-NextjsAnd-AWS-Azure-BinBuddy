import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-sender";
import { passwordResetTemplate } from "@/lib/email-template";
import { handleError } from "@/lib/errorHandler";
import { sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("\n=== FORGOT PASSWORD REQUEST RECEIVED ===");

    const body = await req.json();
    const { email } = body;

    console.log("Password reset requested for email:", email);

    // Validate input
    if (!email) {
      console.log("Validation failed: Missing email");
      return sendError("Email is required", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(
        "Invalid email format",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    // SECURITY: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(
        "User not found, but returning success to prevent enumeration"
      );
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists with this email, you will receive a password reset link shortly.",
        },
        { status: 200 }
      );
    }

    // Check if user registered with Google (no password)
    if (!user.password) {
      console.log("User registered with Google, cannot reset password");
      return sendError(
        "This account was created using Google login. Please use Google to sign in.",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    console.log("Generated reset token, updating user...");

    // Store reset token in database
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry,
      },
    });

    console.log("Reset token stored successfully");

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    console.log("Reset URL:", resetUrl);
    console.log("Sending password reset email...");

    // Send password reset email
    const emailResult = await sendEmail(
      email,
      "Reset Your Password - BinBuddy",
      passwordResetTemplate(user.name, resetUrl)
    );

    console.log("Email send result:", emailResult);

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);

      // In production, clear the reset token if email fails
      if (process.env.NODE_ENV === "production") {
        await prisma.user.update({
          where: { email },
          data: {
            passwordResetToken: null,
            passwordResetExpiry: null,
          },
        });
        return sendError(
          "Failed to send password reset email. Please try again.",
          ERROR_CODES.EXTERNAL_SERVICE_FAILURE,
          500
        );
      }

      // In development, continue anyway
      console.log("Development mode: Continuing despite email failure");
    }

    console.log("=== PASSWORD RESET REQUEST SUCCESSFUL ===\n");

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message:
          "Password reset link has been sent to your email. Please check your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("=== FORGOT PASSWORD ERROR ===");
    console.error(error);
    return handleError(error, "POST /api/auth/forgot-password");
  }
}
