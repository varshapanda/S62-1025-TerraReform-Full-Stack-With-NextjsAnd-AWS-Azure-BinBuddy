import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated and is admin
    const { success, user } = verifyToken(req);

    if (!success || !user) {
      return sendError("Unauthorized", ERROR_CODES.AUTH_ERROR, 401);
    }

    if (user.role.toLowerCase() !== "admin") {
      return sendError(
        "Access denied. Admin only.",
        ERROR_CODES.AUTH_ERROR,
        403
      );
    }

    // Fetch all users
    const users = await prisma.user.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendSuccess({ users }, "Users fetched successfully", 200);
  } catch (error) {
    return handleError(error, "GET /api/admin/users");
  }
}
