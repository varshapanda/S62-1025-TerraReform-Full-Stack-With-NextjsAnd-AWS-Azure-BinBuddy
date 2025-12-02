import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { assignmentManager } from "@/lib/assignment/redisManager";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ userId: string }>;
};

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // Verify admin
    const { success, user } = verifyToken(req);

    if (!success || !user || user.role.toLowerCase() !== "admin") {
      return sendError(
        "Unauthorized. Admin access required.",
        ERROR_CODES.AUTH_ERROR,
        403
      );
    }

    const { userId: userIdString } = await params;
    const userId = userIdString; // Use string directly, not parseInt

    // Get user before deleting
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true },
    });

    if (!targetUser) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Delete from database (cascade)
    await prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({ where: { volunteerId: targetUser.id } });
      await tx.verification.deleteMany({
        where: { volunteerId: targetUser.id },
      });
      await tx.volunteerRequest.deleteMany({
        where: { userId: targetUser.id },
      });
      await tx.refreshToken.deleteMany({ where: { userId: targetUser.id } });
      await tx.image.deleteMany({ where: { uploadedBy: targetUser.id } });
      await tx.notification.deleteMany({ where: { userId: targetUser.id } });
      await tx.report.deleteMany({ where: { reporterId: targetUser.id } });
      await tx.user.delete({ where: { id: userId } });
    });

    // 🚨 If was volunteer, unregister from Redis
    if (targetUser.role === "volunteer") {
      try {
        await assignmentManager.unregisterVolunteer(targetUser.id);
        console.log(`Unregistered volunteer ${targetUser.name} from Redis`);
      } catch (err) {
        console.error("Failed to unregister from Redis:", err);
      }
    }

    return sendSuccess(
      null,
      `User ${targetUser.name} deleted successfully`,
      200
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return sendError("Failed to delete user", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}
