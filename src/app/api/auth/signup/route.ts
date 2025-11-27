// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { emailVerificationTemplate } from "@/lib/email-template";
import { sendEmail } from "@/lib/email-sender";
import { handleError } from "@/lib/errorHandler";
import { sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("\n=== SIGNUP REQUEST RECEIVED ===");

    const body = await req.json();
    const { name, email, password, state, city } = body;

    console.log("Signup attempt for email:", email);

    // Validate input
    if (!name || !email || !password || !state || !city) {
      console.log("Validation failed: Missing fields");
      return sendError(
        "All fields are required",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
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

    // Password validation
    if (password.length < 8) {
      return sendError(
        "Password must be at least 8 characters",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("User already exists:", email);
      return sendError(
        "User with this email already exists",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    console.log("Creating user in database...");
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        state,
        city,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    console.log("User created successfully:", newUser.id);

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    console.log("Verification URL:", verificationUrl);
    console.log("Sending verification email...");

    // Send verification email
    const emailResult = await sendEmail(
      email,
      "Verify Your Email - BinBuddy",
      emailVerificationTemplate(name, verificationUrl)
    );

    console.log("Email send result:", emailResult);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);

      // Delete user if email fails in production
      if (process.env.NODE_ENV === "production") {
        await prisma.user.delete({ where: { id: newUser.id } });
        return sendError(
          "Failed to send verification email. Please try again.",
          ERROR_CODES.EXTERNAL_SERVICE_FAILURE,
          500
        );
      }

      // In development, continue anyway
      console.log("Development mode: Continuing despite email failure");
    }

    console.log("=== SIGNUP SUCCESSFUL ===\n");

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully! Please check your email to verify your account before logging in.",
        data: {
          email: newUser.email,
          name: newUser.name,
          requiresVerification: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=== SIGNUP ERROR ===");
    console.error(error);
    return handleError(error, "POST /api/auth/signup");
  }
}
