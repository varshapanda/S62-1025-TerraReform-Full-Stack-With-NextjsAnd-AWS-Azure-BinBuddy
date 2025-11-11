import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errorHandler";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = (process.env.JWT_SECRET || "") + "_refresh";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return sendError("Refresh token missing", ERROR_CODES.AUTH_ERROR, 401);
    }

    // Verify refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        id: number;
        type: string;
      };
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return sendError(
        "Invalid or expired refresh token",
        ERROR_CODES.AUTH_ERROR,
        401
      );
    }

    // Ensure this is a refresh token (not access token)
    if (decoded.type !== "refresh") {
      return sendError("Invalid token type", ERROR_CODES.AUTH_ERROR, 401);
    }

    // Hash token to check in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Verify refresh token exists in database (not revoked)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!storedToken || storedToken.revokedAt) {
      console.error("Refresh token not found or revoked for user:", decoded.id);
      return sendError(
        "Refresh token has been revoked",
        ERROR_CODES.AUTH_ERROR,
        401
      );
    }

    // Check if refresh token has expired
    if (storedToken.expiresAt < new Date()) {
      return sendError("Refresh token expired", ERROR_CODES.AUTH_ERROR, 401);
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Generate new access token (15 minutes)
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, type: "access" },
      JWT_SECRET!,
      { expiresIn: "15m" }
    );

    // Generate new refresh token for rotation
    const newRefreshToken = jwt.sign(
      { id: user.id, type: "refresh" },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Store new refresh token
    const newHashedRefreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newHashedRefreshToken,
        expiresAt: newExpiresAt,
      },
    });

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    console.log("Tokens refreshed for user:", user.id);
    console.log("Old refresh token revoked (token rotation)");

    // Create response with new tokens
    const data = {
      tokens: {
        accessTokenExpiresIn: "15m",
        refreshTokenExpiresIn: "7d",
      },
    };

    const response = sendSuccess<typeof data>(
      data,
      "Tokens refreshed successfully",
      200
    );

    // Set new access token
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    // Set new refresh token (rotated)
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/refresh");
  }
}
