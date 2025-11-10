import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // for hashing refresh token
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined. Please set it in your .env.local file."
  );
}

const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET + "_refresh"; // Separate secret for refresh tokens

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

    // CHANGE: Access token now 15 minutes instead of 24h
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, type: "access" }, // type: "access"
      JWT_SECRET!,
      { expiresIn: "15m" } // 15m instead of 24h
    );

    // NEW: Generate refresh token (7 days)
    const refreshTokenValue = jwt.sign(
      { id: user.id, type: "refresh" },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // NEW: Hash and store refresh token in database for rotation/revocation
    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshTokenValue)
      .digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // NEW: Store refresh token in database
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
    console.log("Refresh Token created for user:", user.id); // NEW

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      // NEW: Added token expiry info
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

    // CHANGE: Set access token with shorter expiry (cookie name changed from "token" to "accessToken")
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 15 * 60, // CHANGE: 15 minutes (was 60 * 60 * 24 * 7)
      path: "/", // Cookie available for all routes
    });

    // NEW: Set refresh token as separate cookie (longer expiry)
    response.cookies.set("refreshToken", refreshTokenValue, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/", // Cookie available for all routes
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
