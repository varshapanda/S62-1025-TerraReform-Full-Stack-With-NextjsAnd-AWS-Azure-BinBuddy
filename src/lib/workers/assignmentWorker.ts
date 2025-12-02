// ============================================
// FILE 3: src/lib/workers/assignmentWorker.ts
// ============================================
// WHY: Core logic for assigning reports to volunteers
// WHAT: Called when a report is created, selects volunteers and notifies them

import { prisma } from "@/lib/prisma";
import { assignmentManager } from "../assignment/redisManager";
import { realtimeEmitter } from "../realtime/eventEmitter";

// 🎯 CONFIGURATION: Change this to assign more/fewer volunteers per report
const NUM_VERIFIERS_PER_REPORT = 1;

interface AssignmentResult {
  success: boolean;
  assigned: string[];
  message?: string;
}

/**
 * Main function: Assigns a report to N volunteers
 * Called after report creation
 */
export async function assignReportToVolunteers(
  reportId: string
): Promise<AssignmentResult> {
  try {
    console.log(`\n🔄 Starting assignment for report ${reportId}`);

    // 1. Get report details
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        assignedCount: true,
        status: true,
      },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.status !== "PENDING") {
      console.log(`⚠️  Report ${reportId} is already ${report.status}`);
      return { success: false, assigned: [], message: "Report not pending" };
    }

    // 2. Get existing assignments from DB
    const existingAssignments = await prisma.assignment.findMany({
      where: { reportId },
      select: { volunteerId: true },
    });

    const alreadyAssigned = existingAssignments.map((a) => a.volunteerId);

    if (alreadyAssigned.length >= NUM_VERIFIERS_PER_REPORT) {
      console.log(
        `✅ Report ${reportId} already has ${alreadyAssigned.length} volunteers`
      );
      return {
        success: true,
        assigned: alreadyAssigned,
        message: "Already assigned",
      };
    }

    // 3. Select volunteers from Redis
    const needed = NUM_VERIFIERS_PER_REPORT - alreadyAssigned.length;
    const selectedIds = await assignmentManager.selectVolunteers(
      needed,
      alreadyAssigned
    );

    if (selectedIds.length === 0) {
      console.warn(`⚠️  No volunteers available for report ${reportId}`);
      return {
        success: false,
        assigned: [],
        message: "No volunteers available",
      };
    }

    console.log(
      `👥 Selected ${selectedIds.length} volunteers: ${selectedIds.join(", ")}`
    );

    // 4. Create assignment records in database
    const created = await prisma.assignment.createMany({
      data: selectedIds.map((volunteerId) => ({
        reportId,
        volunteerId,
        status: "PENDING",
      })),
      skipDuplicates: true,
    });

    console.log(`💾 Created ${created.count} new assignment records in DB`);

    // 5. Update Redis tracking
    await assignmentManager.assignReport(reportId, selectedIds);

    // 6. Update report assignment count
    await prisma.report.update({
      where: { id: reportId },
      data: { assignedCount: alreadyAssigned.length + selectedIds.length },
    });

    // 7. Send real-time notifications
    for (const volunteerId of selectedIds) {
      realtimeEmitter.notifyNewAssignment(volunteerId, reportId);
    }

    console.log(
      `✅ Successfully assigned report ${reportId} to ${selectedIds.length} volunteers\n`
    );

    return { success: true, assigned: selectedIds };
  } catch (error) {
    console.error(`❌ Assignment error for report ${reportId}:`, error);
    return {
      success: false,
      assigned: [],
      message: error instanceof Error ? error.message : "Assignment failed",
    };
  }
}
