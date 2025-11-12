import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { role } = await req.json();
    const { userId: userIdString } = await params;
    const userId = parseInt(userIdString);

    // Validate role
    const validRoles = ["user", "volunteer", "authority", "admin"];
    if (!validRoles.includes(role.toLowerCase())) {
      return sendError("Invalid role", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return sendSuccess(
      { user: updatedUser },
      `User role updated to ${role}`,
      200
    );
  } catch (error) {
    return handleError(error, "PATCH /api/admin/users/:userId/role");
  }
}
