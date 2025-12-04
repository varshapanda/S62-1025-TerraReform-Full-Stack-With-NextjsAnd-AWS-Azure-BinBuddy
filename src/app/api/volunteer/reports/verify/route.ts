// src/app/api/volunteer/reports/verify/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";
import { assignmentManager } from "@/lib/assignment/redisManager";
import { realtimeEmitter } from "@/lib/realtime/eventEmitter";
import { Prisma, Priority, TaskStatus, ReportStatus } from "@prisma/client";

const VERIFICATION_THRESHOLD = 1;
const POINTS_PER_VERIFICATION = 5;

/* ---------------------------------------------------------
   Utility: Haversine Distance
--------------------------------------------------------- */
function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ---------------------------------------------------------
   STRICT Authority Selection
   - MUST match locality OR city OR state
   - MUST be within serviceRadius
--------------------------------------------------------- */
async function findBestAuthorityForTask(
  lat: number,
  lng: number,
  city: string,
  state: string,
  locality: string
) {
  console.log("\n================ AUTHORITY SELECTION START ================");
  console.log("Report location:", { lat, lng, locality, city, state });

  const normCity = (city || "").trim().toLowerCase();
  const normState = (state || "").trim().toLowerCase();
  const normLocality = (locality || "").trim().toLowerCase();

  const authorities = await prisma.user.findMany({
    where: {
      role: "authority",
      isProfileComplete: true,
      baseLat: { not: null },
      baseLng: { not: null },
    },
    include: {
      serviceAreas: true,
      _count: {
        select: {
          assignedTasks: {
            where: {
              status: {
                in: ["ASSIGNED", "SCHEDULED", "IN_PROGRESS"] as TaskStatus[],
              },
            },
          },
        },
      },
    },
  });

  if (authorities.length === 0) {
    console.log("❌ No authorities found.");
    return null;
  }

  console.log(`Found ${authorities.length} authorities`);

  const candidates: {
    authority: Prisma.UserGetPayload<{ include: { serviceAreas: true } }>;
    distance: number;
    score: number;
  }[] = [];

  for (const a of authorities) {
    const baseLat = a.baseLat!;
    const baseLng = a.baseLng!;
    const radius = a.serviceRadius ?? 10;

    const distance = getDistanceKm(lat, lng, baseLat, baseLng);

    const areas = a.serviceAreas.map((sa) => ({
      locality: (sa.locality || "").trim().toLowerCase(),
      city: (sa.city || "").trim().toLowerCase(),
      state: (sa.state || "").trim().toLowerCase(),
    }));

    const areaMatch = areas.some(
      (sa) =>
        (normLocality && sa.locality === normLocality) ||
        (normCity && sa.city === normCity) ||
        (normState && sa.state === normState)
    );

    console.log("\nAuthority:", a.id);
    console.log(" - distance:", distance.toFixed(2), "km");
    console.log(" - radius:", radius, "km");
    console.log(" - areaMatch:", areaMatch);
    console.log(" - serviceAreas:", areas);

    if (distance > radius) {
      console.log(" ❌ Excluded: Outside radius");
      continue;
    }
    if (!areaMatch) {
      console.log(" ❌ Excluded: Area mismatch");
      continue;
    }

    let score = 0;
    score += Math.max(30 - distance * 2, 5);

    const current = a._count?.assignedTasks ?? 0;
    const maxTasks = a.maxTasksPerDay ?? 10;
    const workload = (current / maxTasks) * 100;

    if (workload < 50) score += 20;
    else if (workload < 75) score += 10;

    score += 10; // area match bonus

    candidates.push({ authority: a, distance, score });

    console.log(" ✔ INCLUDED with score:", score);
  }

  if (candidates.length === 0) {
    console.log("❌ No matching authorities after filtering.");
    console.log("================ AUTHORITY SELECTION END =================\n");
    return null;
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  console.log("\n🏆 SELECTED AUTHORITY:", best.authority.id);
  console.log(
    "Score:",
    best.score,
    "Distance:",
    best.distance.toFixed(2),
    "km"
  );
  console.log("================ AUTHORITY SELECTION END =================\n");

  return best.authority;
}

/* ---------------------------------------------------------
   Task Priority Based on Category
--------------------------------------------------------- */
function getTaskPriority(category: string): Priority {
  const c = category.toLowerCase();
  if (
    c.includes("hazardous") ||
    c.includes("medical") ||
    c.includes("electronic")
  )
    return "URGENT";
  if (c.includes("plastic") || c.includes("metal") || c.includes("mixed"))
    return "HIGH";
  if (c.includes("organic") || c.includes("paper") || c.includes("food"))
    return "MEDIUM";
  return "LOW";
}

/* ---------------------------------------------------------
   MAIN POST: VERIFY REPORT
--------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    console.log("\n============= VERIFICATION REQUEST START =============");

    const { success, user } = verifyToken(req);
    if (!success || !user) {
      console.error("❌ AUTH FAILED");
      return sendError("Unauthorized", "AUTH_ERROR", 401);
    }

    console.log("✅ User authenticated:", user.id);

    const body = await req.json();
    const { reportId, status, verificationNote } = body;

    console.log("📝 Verification Request:", {
      reportId,
      status,
      userId: user.id,
      hasNote: !!verificationNote,
    });

    if (!reportId || !["VERIFIED", "REJECTED"].includes(status)) {
      console.error("❌ INVALID BODY:", { reportId, status });
      return sendError("Invalid request body", "VALIDATION_ERROR", 400);
    }

    // CHECK REDIS ASSIGNMENT
    console.log("🔍 Checking Redis assignment...");
    const isAssigned = await assignmentManager.isAssigned(reportId, user.id);
    console.log("📊 Redis assignment result:", isAssigned);

    if (!isAssigned) {
      console.error("❌ NOT ASSIGNED in Redis:", { reportId, userId: user.id });
      return sendError(
        "You are not assigned to this report",
        "AUTH_ERROR",
        403
      );
    }

    console.log("✅ Redis assignment check passed");

    const result = await prisma.$transaction(async (tx) => {
      // CHECK DB ASSIGNMENT
      console.log("🔍 Checking DB assignment...");
      const assignment = await tx.assignment.findUnique({
        where: { reportId_volunteerId: { reportId, volunteerId: user.id } },
      });

      console.log(
        "📊 DB assignment:",
        assignment
          ? {
              id: assignment.id,
              status: assignment.status,
              reportId: assignment.reportId,
              volunteerId: assignment.volunteerId,
            }
          : "NOT FOUND"
      );

      if (!assignment) {
        console.error("❌ ASSIGNMENT NOT FOUND IN DB");
        throw new Error("Assignment not found");
      }

      if (assignment.status === "COMPLETED") {
        console.error("❌ ALREADY COMPLETED");
        throw new Error("Already verified");
      }

      console.log("✅ DB assignment check passed");

      // CHECK REPORT
      console.log("🔍 Checking report...");
      const report = await tx.report.findUnique({
        where: { id: reportId },
      });

      console.log(
        "📊 Report:",
        report
          ? {
              id: report.id,
              status: report.status,
              category: report.category,
            }
          : "NOT FOUND"
      );

      if (!report) {
        console.error("❌ REPORT NOT FOUND");
        throw new Error("Report not found");
      }

      if (report.status !== "PENDING") {
        console.error("❌ REPORT NOT PENDING, status:", report.status);
        throw new Error("Report already finalized");
      }

      console.log("✅ Report check passed");

      // CHECK DUPLICATE
      console.log("🔍 Checking for duplicate verification...");
      const existing = await tx.verification.findUnique({
        where: { reportId_volunteerId: { reportId, volunteerId: user.id } },
      });

      console.log("📊 Existing verification:", existing ? "FOUND" : "NONE");

      if (existing) {
        console.error("❌ DUPLICATE VERIFICATION");
        throw new Error("Duplicate verification");
      }

      console.log("✅ No duplicate verification found");

      // CREATE VERIFICATION
      console.log("💾 Creating verification record...");
      await tx.verification.create({
        data: {
          reportId,
          volunteerId: user.id,
          decision: status as ReportStatus,
          verificationNote: verificationNote ?? null,
        },
      });
      console.log("✅ Verification record created");

      // UPDATE ASSIGNMENT
      console.log("💾 Updating assignment status...");
      await tx.assignment.update({
        where: { reportId_volunteerId: { reportId, volunteerId: user.id } },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      console.log("✅ Assignment updated to COMPLETED");

      // COUNT VERIFICATIONS
      const count = await tx.verification.count({
        where: { reportId, decision: status },
      });

      console.log(`📊 Total ${status} verifications for this report:`, count);

      if (count < VERIFICATION_THRESHOLD) {
        console.log("⏳ Threshold not reached yet");
        return { count, thresholdReached: false, authorityTaskCreated: false };
      }

      console.log("✅ Threshold reached! Finalizing report...");

      // UPDATE REPORT STATUS
      await tx.report.update({
        where: { id: reportId },
        data: {
          status: status,
          verifiedAt: new Date(),
          verifiedBy: user.id,
          remarks: status === "VERIFIED" ? verificationNote : null,
          rejectionReason: status === "REJECTED" ? verificationNote : null,
        },
      });
      console.log(`✅ Report status updated to ${status}`);

      // AWARD POINTS
      if (report.reporterId) {
        console.log("🎁 Awarding points to reporter...");
        await tx.user.update({
          where: { id: report.reporterId },
          data: { points: { increment: POINTS_PER_VERIFICATION } },
        });

        await tx.userLeaderboard.upsert({
          where: { userId: report.reporterId },
          update: {
            points: { increment: POINTS_PER_VERIFICATION },
            updatedAt: new Date(),
          },
          create: {
            userId: report.reporterId,
            points: POINTS_PER_VERIFICATION,
            rank: 0,
          },
        });
        console.log(`✅ ${POINTS_PER_VERIFICATION} points awarded`);
      }

      // EXPIRE OTHER ASSIGNMENTS
      console.log("⏰ Expiring other assignments...");
      await tx.assignment.updateMany({
        where: { reportId, status: { in: ["PENDING", "VIEWED"] } },
        data: { status: "EXPIRED" },
      });
      console.log("✅ Other assignments expired");

      // CREATE TASK IF VERIFIED
      if (status === "VERIFIED") {
        console.log("\n================ CREATE TASK START ==================");

        const bestAuthority = await findBestAuthorityForTask(
          report.lat,
          report.lng,
          report.city || "",
          report.state || "",
          report.locality || ""
        );

        if (!bestAuthority) {
          console.log("❌ NO AUTHORITY VALID → Task will remain PENDING");
        }

        const priority = getTaskPriority(report.category);

        const address =
          report.address ||
          `${report.houseNo ? report.houseNo + ", " : ""}${report.street ? report.street + ", " : ""}${
            report.locality || ""
          }, ${report.city || ""}, ${report.state || ""}${report.pincode ? " - " + report.pincode : ""}`;

        const scheduledFor = new Date();
        scheduledFor.setHours(scheduledFor.getHours() + 24);

        console.log(
          "Creating task with authority:",
          bestAuthority?.id || "NONE"
        );

        await tx.task.create({
          data: {
            report: { connect: { id: reportId } },
            priority,
            location: {
              lat: report.lat,
              lng: report.lng,
              address,
            },
            status: bestAuthority ? "ASSIGNED" : "PENDING",
            scheduledFor,
            collectionProof: [],
            ...(bestAuthority
              ? { assignedTo: { connect: { id: bestAuthority.id } } }
              : {}),
          },
        });

        console.log("✅ Task created successfully");
        console.log("================ CREATE TASK END ==================\n");

        return { count, thresholdReached: true, authorityTaskCreated: true };
      }

      return { count, thresholdReached: true, authorityTaskCreated: false };
    });

    console.log("✅ Transaction completed successfully");

    // UPDATE REDIS
    console.log("📤 Updating Redis state...");
    await assignmentManager.completeAssignment(reportId, user.id);
    console.log("✅ Redis updated");

    // SEND NOTIFICATIONS
    if (result.thresholdReached) {
      console.log("📢 Sending real-time notifications...");
      const volunteers = await assignmentManager.expireReport(reportId);
      realtimeEmitter.notifyMultiple(volunteers, {
        type: "report_verified",
        data: { reportId, status },
        timestamp: Date.now(),
      });
      console.log(`✅ Notified ${volunteers.length} volunteers`);
    }

    console.log("============= VERIFICATION REQUEST END =============\n");

    return sendSuccess(result);
  } catch (error) {
    console.error("\n❌❌❌ VERIFICATION ERROR ❌❌❌");
    console.error("Error:", error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error("❌❌❌ END ERROR ❌❌❌\n");

    const msg = error instanceof Error ? error.message : "Verification failed";
    return sendError(msg, "VERIFICATION_ERROR", 400);
  }
}
