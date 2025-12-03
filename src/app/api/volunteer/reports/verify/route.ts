import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";
import { assignmentManager } from "@/lib/assignment/redisManager";
import { realtimeEmitter } from "@/lib/realtime/eventEmitter";
import { Prisma, TaskStatus, Priority } from "@prisma/client";

const VERIFICATION_THRESHOLD = 1;
const POINTS_PER_VERIFICATION = 5;

// Helper to find best authority
async function findBestAuthorityForTask(
  lat: number,
  lng: number,
  city: string,
  state: string,
  locality: string = ""
) {
  try {
    const authorities = await prisma.user.findMany({
      where: {
        role: "authority",
        isProfileComplete: true,
        baseLat: { not: null },
        baseLng: { not: null },
      },
      include: {
        serviceAreas: {
          select: {
            locality: true,
            city: true,
            state: true,
          },
        },
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
      console.log("❌ No authority users found");
      return null;
    }

    console.log(`✅ Found ${authorities.length} potential authorities`);

    // Calculate distance
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Score authorities
    const scored = authorities
      .map((authority) => {
        let score = 0;

        // Distance scoring
        if (authority.baseLat && authority.baseLng) {
          const distance = calculateDistance(
            lat,
            lng,
            authority.baseLat,
            authority.baseLng
          );
          const radius = authority.serviceRadius || 10;
          if (distance <= radius) {
            score += Math.max(30 - distance * 2, 5);
          } else {
            console.log(
              `Authority ${authority.id} too far: ${distance.toFixed(2)}km`
            );
            return { authority, score: 0 };
          }
        }

        // Workload scoring
        const maxTasks = authority.maxTasksPerDay || 10;
        const currentTasks = authority._count.assignedTasks;
        const workload = (currentTasks / maxTasks) * 100;
        if (workload < 50) score += 20;
        else if (workload < 75) score += 10;
        else if (workload < 90) score += 5;
        console.log(
          `Authority ${authority.id} workload: ${workload.toFixed(1)}% (${currentTasks}/${maxTasks})`
        );

        // Performance scoring
        const completionRate = authority.completionRate || 0;
        if (completionRate > 90) score += 10;
        else if (completionRate > 75) score += 5;

        // Service area priority bonus
        if (authority.serviceAreas && authority.serviceAreas.length > 0) {
          const hasMatchingArea = authority.serviceAreas.some(
            (area) =>
              (area.locality &&
                area.locality.toLowerCase() === locality.toLowerCase()) ||
              (area.city && area.city.toLowerCase() === city.toLowerCase()) ||
              (area.state && area.state.toLowerCase() === state.toLowerCase())
          );
          if (hasMatchingArea) {
            score += 15;
            console.log(`Authority ${authority.id} has matching service area`);
          }
        }

        console.log(`Authority ${authority.id} final score: ${score}`);
        return { authority, score };
      })
      .filter((item) => item.score > 0);

    if (scored.length === 0) {
      console.log("❌ No suitable authorities found after filtering");
      return null;
    }

    const best = scored.sort((a, b) => b.score - a.score)[0];
    console.log(
      `🏆 Selected authority ${best.authority.id} with score ${best.score}`
    );
    return best.authority;
  } catch (error) {
    console.error("❌ Error finding authority:", error);
    return null;
  }
}

// Helper to determine task priority
function getTaskPriority(category: string): Priority {
  const cat = category.toLowerCase();
  if (
    cat.includes("hazardous") ||
    cat.includes("medical") ||
    cat.includes("electronic")
  )
    return "URGENT";
  if (cat.includes("plastic") || cat.includes("metal") || cat.includes("mixed"))
    return "HIGH";
  if (cat.includes("organic") || cat.includes("paper") || cat.includes("food"))
    return "MEDIUM";
  return "LOW";
}

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
      console.log("🔍 DEBUG - Report verification:");
      console.log("Report ID:", report.id);
      console.log("Report status:", report.status);
      console.log("Verification status:", status);
      console.log("Verification count:", count);
      console.log("Threshold reached:", count >= VERIFICATION_THRESHOLD);

      let thresholdReached = false;
      let authorityTaskCreated = false;

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

        // ========== AUTHORITY ASSIGNMENT LOGIC ==========
        if (status === "VERIFIED") {
          console.log(
            "📋 Starting authority assignment for verified report..."
          );

          // Find best authority for this task
          const bestAuthority = await findBestAuthorityForTask(
            report.lat,
            report.lng,
            report.city || "Unknown",
            report.state || "Unknown",
            report.locality || ""
          );

          // Add fallback authority logic
          let assignedAuthority = bestAuthority
            ? {
                id: bestAuthority.id,
                name: bestAuthority.name,
                email: bestAuthority.email,
              }
            : null;
          if (!assignedAuthority) {
            console.log(
              "⚠️ No authority found via algorithm, trying fallback..."
            );

            // Fallback: Find ANY authority with complete profile
            const fallbackAuthority = await tx.user.findFirst({
              where: {
                role: "authority",
                isProfileComplete: true,
              },
              orderBy: { tasksCompleted: "asc" },
            });

            assignedAuthority = fallbackAuthority;

            if (assignedAuthority) {
              console.warn(
                `⚠️ Using fallback authority ${assignedAuthority.id} for report ${report.id}`
              );
            } else {
              console.error(
                "❌ CRITICAL: No authority users exist in the system!"
              );
            }
          }

          // Create task for authority collection
          const taskPriority = getTaskPriority(report.category);
          const address =
            report.address ||
            `${report.houseNo ? report.houseNo + ", " : ""}${report.street ? report.street + ", " : ""}${report.locality}, ${report.city}, ${report.state} - ${report.pincode}`;

          // Add scheduledFor (required by schema)
          const scheduledFor = new Date();
          scheduledFor.setHours(scheduledFor.getHours() + 24);

          // Task data with all required fields
          const taskData: Prisma.TaskCreateInput = {
            report: { connect: { id: report.id } },
            priority: taskPriority,
            location: {
              lat: report.lat,
              lng: report.lng,
              address: address,
            } as Prisma.InputJsonValue,
            status: assignedAuthority ? "ASSIGNED" : "PENDING",
            scheduledFor: scheduledFor,
            collectionProof: [],
            ...(assignedAuthority && {
              assignedTo: { connect: { id: assignedAuthority.id } },
            }),
          };

          // Debug logging
          console.log("=== TASK CREATION DEBUG ===");
          console.log("Report ID:", report.id);
          console.log("Report City:", report.city);
          console.log("Report State:", report.state);
          console.log("Authority found:", assignedAuthority?.id || "NONE");
          console.log("Authority name:", assignedAuthority?.name || "NONE");
          console.log(
            "Task status:",
            assignedAuthority ? "ASSIGNED" : "PENDING"
          );
          console.log("Task priority:", taskPriority);
          console.log("Scheduled for:", scheduledFor);
          console.log("=== END DEBUG ===");

          try {
            const createdTask = await tx.task.create({
              data: taskData,
            });
            authorityTaskCreated = true;
            console.log(
              `✅ Task ${createdTask.id} created for report ${report.id}, assigned to ${assignedAuthority?.id || "NO AUTHORITY"}`
            );
          } catch (taskError: unknown) {
            const errorMessage =
              taskError instanceof Error ? taskError.message : "Unknown error";
            console.error("❌ Task creation failed:", errorMessage);
          }

          // Send notification to reporter
          if (report.reporterId) {
            try {
              await tx.notification.create({
                data: {
                  userId: report.reporterId,
                  type: "REPORT_VERIFIED",
                  title: "Report Verified!",
                  message: `Your ${report.category} waste report has been verified. ${assignedAuthority ? `Assigned to ${assignedAuthority.name}` : "Awaiting authority assignment"}.`,
                },
              });
              console.log(
                `✅ Notification sent to reporter ${report.reporterId}`
              );
            } catch (notifError) {
              console.error("❌ Notification creation failed:", notifError);
            }
          }

          // Send notification to assigned authority (if any)
          if (assignedAuthority) {
            try {
              await tx.notification.create({
                data: {
                  userId: assignedAuthority.id,
                  type: "TASK_ASSIGNED",
                  title: "New Task Assigned",
                  message: `New ${taskPriority} priority task assigned to you in ${report.city}.`,
                },
              });
              console.log(
                `✅ Notification sent to authority ${assignedAuthority.id}`
              );
            } catch (notifError) {
              console.error("❌ Authority notification failed:", notifError);
            }
          }
        }
        // ========== END OF LOGIC ==========
      }

      return { count, thresholdReached, authorityTaskCreated };
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
      authorityTaskCreated: result.authorityTaskCreated,
      status: result.thresholdReached ? status : "PENDING",
    });
  } catch (error: unknown) {
    console.error("❌ Verification error:", error);

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Verification failed";

    return sendError(message, "VERIFICATION_ERROR", 400);
  }
}
