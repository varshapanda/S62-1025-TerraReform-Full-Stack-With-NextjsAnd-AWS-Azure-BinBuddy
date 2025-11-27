// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errorHandler";
import { sendEmail } from "@/lib/email-sender";
import { welcomeTemplate } from "@/lib/email-template";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    console.log("\n=== EMAIL VERIFICATION REQUEST ===");

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    console.log("Token from URL:", token);
    console.log("Token length:", token?.length);

    if (!token) {
      console.log("ERROR: No token provided");
      return NextResponse.redirect(
        new URL("/login?error=missing_token", req.url)
      );
    }

    // Find user with this token
    console.log("Searching for user with token...");

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    console.log("User found:", user ? `Yes (${user.email})` : "No");

    if (user) {
      console.log("User details:");
      console.log("- Email:", user.email);
      console.log("- Email Verified:", user.emailVerified);
      console.log("- Token matches:", user.verificationToken === token);
      console.log("- Token expiry:", user.verificationTokenExpiry);
      console.log("- Current time:", new Date());
      console.log(
        "- Token expired:",
        user.verificationTokenExpiry
          ? user.verificationTokenExpiry < new Date()
          : "N/A"
      );
    }

    if (!user) {
      console.log("ERROR: No user found with this token");
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", req.url)
      );
    }

    // Check if token is expired
    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      console.log("ERROR: Token has expired");
      return NextResponse.redirect(
        new URL("/login?error=expired_token", req.url)
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log("User already verified, redirecting to login");
      return NextResponse.redirect(
        new URL("/login?message=already_verified", req.url)
      );
    }

    // Mark email as verified
    console.log("Marking email as verified...");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    console.log("Email verified successfully for:", user.email);

    // Send welcome email (non-critical, don't fail if it doesn't work)
    try {
      console.log("Sending welcome email...");
      await sendEmail(
        user.email,
        "Welcome to BinBuddy!",
        welcomeTemplate(user.name)
      );
      console.log("Welcome email sent");
    } catch (emailError) {
      console.error("Welcome email failed (non-critical):", emailError);
    }

    console.log("=== VERIFICATION SUCCESSFUL ===\n");

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL("/login?message=verification_success", req.url)
    );
  } catch (error) {
    console.error("=== VERIFICATION ERROR ===");
    console.error(error);
    return handleError(error, "GET /api/auth/verify-email");
  }
}
