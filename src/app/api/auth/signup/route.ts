import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; //for hashing refresh token
import { prisma } from "@/lib/prisma";
import { welcomeTemplate } from "@/lib/email-template";
import { sendEmail } from "@/lib/email-sender";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + "_refresh";

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined. Please set it in your .env.local file."
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // SEND WELCOME EMAIL
    try {
      const emailResult = await sendEmail(
        email,
        "Welcome to BinBuddy!",
        welcomeTemplate(name)
      );

      if (emailResult.success) {
        console.log("Welcome email sent to:", email);
      } else {
        console.error("Email failed (non-critical):", emailResult.error);
      }
    } catch (emailError) {
      console.error("Email error (non-critical):", emailError);
    }

    // CHANGE: Generate access token with 15m expiry (was 24h)
    const accessToken = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        type: "access",
      }, // NEW: type: "access"
      JWT_SECRET!,
      { expiresIn: "15m" } // CHANGE: 15m instead of 24h
    );

    // NEW: Generate refresh token (7 days)
    const refreshTokenValue = jwt.sign(
      { id: newUser.id, type: "refresh" },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // NEW: Hash and store refresh token in database
    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshTokenValue)
      .digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // NEW: Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: newUser.id,
        token: hashedRefreshToken,
        expiresAt,
      },
    });

    console.log("Access Token payload:", {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      expiresIn: "15m",
    });
    console.log("Refresh Token created for user:", newUser.id);

    // Don't send password in response
    const { password: _removedPassword, ...userWithoutPassword } = newUser;

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Signup successful! Check your email for a welcome message.",
        // Added token expiry info
        tokens: {
          accessTokenExpiresIn: "15m",
          refreshTokenExpiresIn: "7d",
        },
        user: userWithoutPassword,
      },
      { status: 201 }
    );

    // CHANGE: Set access token with 15m expiry (cookie name changed from "token")
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // CHANGE: 15 minutes (was 7 days)
      path: "/",
    });

    // Set refresh token as separate cookie
    response.cookies.set("refreshToken", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Signup failed" },
      { status: 500 }
    );
  }
}
