import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { success, user, error } = verifyToken(req);

    console.log("Token verification result:", { success, user, error }); // Debug log

    if (!success || !user) {
      return sendError(error || "Unauthorized", ERROR_CODES.AUTH_ERROR, 401);
    }

    // Fetch full user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        state: true,
        city: true,
        createdAt: true,
      },
    });

    console.log("Fetched user data from DB:", userData); // Debug log

    if (!userData) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(
      { user: userData },
      "User data fetched successfully",
      200
    );
  } catch (error) {
    console.error("Error in /api/auth/me:", error); // Debug log
    return handleError(error, "GET /api/auth/me");
  }
}
