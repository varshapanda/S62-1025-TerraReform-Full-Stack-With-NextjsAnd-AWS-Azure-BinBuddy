import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);
    if (!success || !user || user.role !== "volunteer") {
      return sendError("Unauthorized", "AUTH_ERROR", 401);
    }

    // FIX: Count ONLY reports assigned to THIS volunteer
    const pendingCount = await prisma.assignment.count({
      where: {
        volunteerId: user.id,
        status: { in: ["PENDING", "VIEWED"] },
        report: { status: "PENDING" },
      },
    });

    // Count verified reports by this volunteer
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [verifiedToday, totalVerified] = await Promise.all([
      prisma.verification.count({
        where: {
          volunteerId: user.id,
          createdAt: { gte: today },
        },
      }),
      prisma.verification.count({
        where: { volunteerId: user.id },
      }),
    ]);

    return sendSuccess({
      pending: pendingCount, // FIXED: Now matches queue
      verifiedToday,
      totalVerified,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return sendError("Failed to fetch stats", "DB_ERROR", 500);
  }
}
