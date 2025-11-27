// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errorHandler";
import { sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("\n=== RESET PASSWORD REQUEST RECEIVED ===");

    const body = await req.json();
    const { token, password } = body;

    console.log(
      "Password reset attempt with token:",
      token?.substring(0, 10) + "..."
    );

    // Validate input
    if (!token || !password) {
      console.log("Validation failed: Missing token or password");
      return sendError(
        "Token and password are required",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Password validation
    if (password.length < 8) {
      return sendError(
        "Password must be at least 8 characters",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      console.log("Invalid or expired token");
      return sendError(
        "Invalid or expired password reset token. Please request a new password reset link.",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    console.log("Valid token found for user:", user.email);
    console.log("Hashing new password...");

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Updating user password and clearing reset token...");

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    console.log("Password updated successfully for user:", user.email);

    // Optional: Invalidate all existing sessions/refresh tokens for security
    console.log("Invalidating existing refresh tokens...");
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    console.log("=== PASSWORD RESET SUCCESSFUL ===\n");

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message:
          "Password has been reset successfully. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("=== RESET PASSWORD ERROR ===");
    console.error(error);
    return handleError(error, "POST /api/auth/reset-password");
  }
}
