import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errorHandler";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined. Please set it in your .env.local file."
  );
}

const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET + "_refresh";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if password exists (for non-Google users)
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "Please login with Google" },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Access token (15 minutes)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, type: "access" },
      JWT_SECRET!,
      { expiresIn: "15m" }
    );

    // Generate refresh token (7 days)
    const refreshTokenValue = jwt.sign(
      { id: user.id, type: "refresh" },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Hash and store refresh token in database
    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshTokenValue)
      .digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefreshToken,
        expiresAt,
      },
    });

    console.log("Access Token payload:", {
      id: user.id,
      email: user.email,
      role: user.role,
      expiresIn: "15m",
    });
    console.log("Refresh Token created for user:", user.id);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      tokens: {
        accessTokenExpiresIn: "15m",
        refreshTokenExpiresIn: "7d",
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
      },
    });

    // Set access token cookie
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    // Set refresh token cookie
    response.cookies.set("refreshToken", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/login");
  }
}
