import { prisma } from "../src/lib/prisma";
import { assignmentManager } from "../src/lib/assignment/redisManager";
import { Redis } from "ioredis";

async function setup() {
  console.log("🚀 Setting up assignment system...\n");

  try {
    const redis = new Redis(process.env.REDIS_URL!);

    // 1. CLEAR Redis first to avoid duplicates
    console.log("🧹 Clearing old Redis data...");
    await redis.del("volunteer:workload");
    const volunteerKeys = await redis.keys("volunteer:*:meta");
    const reportKeys = await redis.keys("volunteer:*:reports");
    const assignmentKeys = await redis.keys("report:*:volunteers");

    if (volunteerKeys.length) await redis.del(...volunteerKeys);
    if (reportKeys.length) await redis.del(...reportKeys);
    if (assignmentKeys.length) await redis.del(...assignmentKeys);

    // 2. Register ALL volunteers fresh
    const volunteers = await prisma.user.findMany({
      where: { role: "volunteer" },
      select: { id: true, name: true },
    });

    console.log(`\n📋 Registering ${volunteers.length} volunteers...`);

    for (const volunteer of volunteers) {
      await assignmentManager.registerVolunteer(volunteer.id);
      console.log(`  ✅ Registered: ${volunteer.name}`);
    }

    // 3. Sync existing assignments to Redis
    console.log("\n📊 Syncing existing assignments to Redis...");

    const assignments = await prisma.assignment.findMany({
      where: {
        status: { in: ["PENDING", "VIEWED"] },
        report: { status: "PENDING" },
      },
      select: {
        reportId: true,
        volunteerId: true,
      },
    });

    console.log(`Found ${assignments.length} active assignments to sync`);

    // Group by report
    const reportMap = new Map<string, string[]>();
    for (const assignment of assignments) {
      const volunteers = reportMap.get(assignment.reportId) || [];
      volunteers.push(assignment.volunteerId);
      reportMap.set(assignment.reportId, volunteers);
    }

    for (const [reportId, volunteerIds] of reportMap.entries()) {
      await assignmentManager.assignReport(reportId, volunteerIds);
      console.log(
        `  ✅ Synced report ${reportId}: ${volunteerIds.length} volunteers`
      );
    }

    // 4. Assign unassigned pending reports
    const unassignedReports = await prisma.report.findMany({
      where: {
        status: "PENDING",
        assignedCount: 0,
      },
      select: { id: true },
    });

    console.log(`\n📝 Found ${unassignedReports.length} unassigned reports`);

    const { assignReportToVolunteers } = await import(
      "../src/lib/workers/assignmentWorker.js"
    );

    for (const report of unassignedReports) {
      await assignReportToVolunteers(report.id);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await redis.quit();
    console.log("\n✅ Setup complete!");
    console.log(`\n📊 Summary:`);
    console.log(`  - Volunteers registered: ${volunteers.length}`);
    console.log(`  - Existing assignments synced: ${assignments.length}`);
    console.log(`  - New reports assigned: ${unassignedReports.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

setup();
