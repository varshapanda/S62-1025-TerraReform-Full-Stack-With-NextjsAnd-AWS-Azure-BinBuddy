import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookie to revoke it
    const refreshToken = req.cookies.get("refreshToken")?.value;

    // If refresh token exists, revoke it in database
    if (refreshToken) {
      try {
        // Hash the token to match database
        const hashedToken = crypto
          .createHash("sha256")
          .update(refreshToken)
          .digest("hex");

        // Mark refresh token as revoked
        await prisma.refreshToken.updateMany({
          where: { token: hashedToken },
          data: { revokedAt: new Date() },
        });

        console.log("Refresh token revoked on logout");
      } catch (err) {
        console.error("Error revoking refresh token:", err);
        // Continue with logout even if revocation fails
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Clear accessToken cookie
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    // Clear refreshToken cookie
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/logout");
  }
}
