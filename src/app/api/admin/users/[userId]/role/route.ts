import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";
import { assignmentManager } from "@/lib/assignment/redisManager";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
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
    const userId = userIdString; // Use string directly, not parseInt

    const validRoles = ["user", "volunteer", "authority", "admin"];
    if (!validRoles.includes(role.toLowerCase())) {
      return sendError("Invalid role", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // 🚨 GET OLD ROLE BEFORE UPDATE
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true },
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

    // 🚨 HANDLE REDIS SYNC
    const oldRole = targetUser.role.toLowerCase();
    const newRole = role.toLowerCase();

    if (oldRole === "volunteer" && newRole !== "volunteer") {
      // Changed FROM volunteer TO something else - UNREGISTER
      try {
        await assignmentManager.unregisterVolunteer(targetUser.id);
        console.log(
          `Unregistered demoted volunteer ${targetUser.name} from Redis`
        );
      } catch (err) {
        console.error("Failed to unregister from Redis:", err);
      }
    } else if (oldRole !== "volunteer" && newRole === "volunteer") {
      // Changed TO volunteer - REGISTER
      try {
        await assignmentManager.registerVolunteer(targetUser.id);
        console.log(
          `Registered promoted volunteer ${targetUser.name} in Redis`
        );
      } catch (err) {
        console.error("Failed to register in Redis:", err);
      }
    }

    return sendSuccess(
      { user: updatedUser },
      `User role updated to ${role}`,
      200
    );
  } catch (error) {
    return handleError(error, "PATCH /api/admin/users/:userId/role");
  }
}
