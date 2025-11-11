import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { handleError } from "@/lib/errorHandler";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(req: NextRequest) {
  try {
    // Verify token using utility function
    const { success, user, error } = verifyToken(req);

    if (!success) {
      return sendError(
        error || "Unauthorized access",
        ERROR_CODES.AUTH_ERROR,
        401
      );
    }

    const data = {
      user: {
        id: user!.id,
        email: user!.email,
        role: user!.role,
      },
    };

    return sendSuccess<typeof data>(
      data,
      "Protected data accessed successfully",
      200
    );
  } catch (error) {
    return handleError(error, "GET /api/user");
  }
}
