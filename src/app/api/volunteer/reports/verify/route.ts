import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";
import { assignmentManager } from "@/lib/assignment/redisManager";
import { realtimeEmitter } from "@/lib/realtime/eventEmitter";

const VERIFICATION_THRESHOLD = 1;
const POINTS_PER_VERIFICATION = 5;

export async function POST(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);
    if (!success || !user || user.role !== "volunteer") {
      return sendError("Unauthorized", "AUTH_ERROR", 401);
    }

    const body = await req.json();
    const { reportId, status, verificationNote } = body;

    if (!reportId || !["VERIFIED", "REJECTED"].includes(status)) {
      return sendError("Invalid request", "VALIDATION_ERROR", 400);
    }

    // Check Redis assignment first (fast)
    const isAssigned = await assignmentManager.isAssigned(reportId, user.id);
    if (!isAssigned) {
      return sendError(
        "You are not assigned to this report",
        "AUTH_ERROR",
        403
      );
    }

    // Atomic transaction for verification
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check assignment
      const assignment = await tx.assignment.findUnique({
        where: {
          reportId_volunteerId: { reportId, volunteerId: user.id },
        },
      });

      if (!assignment) throw new Error("Assignment not found");
      if (assignment.status === "COMPLETED")
        throw new Error("Already verified");

      // 2. Check report status
      const report = await tx.report.findUnique({ where: { id: reportId } });
      if (!report || report.status !== "PENDING")
        throw new Error("Report no longer pending");

      // 3. Check duplicate verification
      const existing = await tx.verification.findUnique({
        where: {
          reportId_volunteerId: { reportId, volunteerId: user.id },
        },
      });
      if (existing) throw new Error("Already verified");

      // 4. Create verification
      await tx.verification.create({
        data: {
          reportId,
          volunteerId: user.id,
          decision: status,
          verificationNote: verificationNote?.trim() || null,
        },
      });

      // 5. Update assignment
      await tx.assignment.update({
        where: {
          reportId_volunteerId: { reportId, volunteerId: user.id },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // 6. Count verifications
      const count = await tx.verification.count({
        where: { reportId, decision: status },
      });

      let thresholdReached = false;

      // 7. If threshold reached, finalize
      if (count >= VERIFICATION_THRESHOLD) {
        await tx.report.update({
          where: { id: reportId },
          data: {
            status,
            verifiedAt: new Date(),
            verifiedBy: user.id,
            remarks: status === "VERIFIED" ? verificationNote : null,
            rejectionReason: status === "REJECTED" ? verificationNote : null,
          },
        });

        // ✅ AWARD POINTS
        await tx.user.update({
          where: { id: report.reporterId },
          data: {
            points: { increment: POINTS_PER_VERIFICATION },
          },
        });

        // ✅ UPDATE LEADERBOARD
        await tx.userLeaderboard.upsert({
          where: { userId: report.reporterId },
          update: {
            points: { increment: POINTS_PER_VERIFICATION },
            updatedAt: new Date(),
          },
          create: {
            userId: report.reporterId,
            points: POINTS_PER_VERIFICATION,
            rank: 0, // Calculated dynamically via leaderboard API
          },
        });

        // Expire other assignments
        await tx.assignment.updateMany({
          where: {
            reportId,
            status: { in: ["PENDING", "VIEWED"] },
          },
          data: { status: "EXPIRED" },
        });

        thresholdReached = true;
      }

      return { count, thresholdReached };
    });

    // Update Redis
    await assignmentManager.completeAssignment(reportId, user.id);

    // Broadcast real-time updates
    if (result.thresholdReached) {
      const affectedVolunteers = await assignmentManager.expireReport(reportId);

      realtimeEmitter.notifyMultiple(affectedVolunteers, {
        type: "report_verified",
        data: { reportId, status },
        timestamp: Date.now(),
      });

      console.log(
        `Report ${reportId} ${status} - notified ${affectedVolunteers.length} volunteers`
      );
    }

    return sendSuccess({
      verified: true,
      count: result.count,
      thresholdReached: result.thresholdReached,
      status: result.thresholdReached ? status : "PENDING",
    });
  } catch (error: unknown) {
    console.error("Verification error:", error);

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Verification failed";

    return sendError(message, "VERIFICATION_ERROR", 400);
  }
}
