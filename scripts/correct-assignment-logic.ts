import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

async function fixAssignmentsCorrectly() {
  console.log("🔧 FIXING ASSIGNMENT SYSTEM (CORRECT LOGIC)");
  console.log("=".repeat(60));

  try {
    // 1. Clear everything
    console.log("\n🧹 Step 1: Clearing Redis...");
    const keys = await redis.keys("*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✅ Cleared ${keys.length} Redis keys`);
    }

    console.log("\n🗑️  Step 2: Clearing old assignments...");
    const deletedAssignments = await prisma.assignment.deleteMany({});
    console.log(`✅ Deleted ${deletedAssignments.count} old assignments`);

    console.log("\n🔄 Step 3: Resetting report counts...");
    const resetReports = await prisma.report.updateMany({
      where: { status: "PENDING" },
      data: { assignedCount: 0 },
    });
    console.log(`✅ Reset ${resetReports.count} reports`);

    // 2. Get all volunteers
    console.log("\n👥 Step 4: Getting volunteers...");
    const volunteers = await prisma.user.findMany({
      where: { role: "volunteer" },
      select: { id: true, name: true },
    });
    console.log(`✅ Found ${volunteers.length} volunteers`);

    if (volunteers.length === 0) {
      console.log("⚠️  No volunteers found! Cannot assign reports.");
      return;
    }

    // 3. Register volunteers in Redis with workload tracking
    console.log("\n📝 Step 5: Registering volunteers in Redis...");
    for (const volunteer of volunteers) {
      await redis.zadd("volunteer:workload", 0, volunteer.id);
      await redis.hset(`volunteer:${volunteer.id}`, {
        name: volunteer.name,
        assignedCount: 0,
      });
      console.log(`  ✅ ${volunteer.name} registered with workload=0`);
    }

    // 4. Get all pending reports
    console.log("\n📋 Step 6: Getting pending reports...");
    const pendingReports = await prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { id: true, category: true },
    });
    console.log(`✅ Found ${pendingReports.length} pending reports`);

    if (pendingReports.length === 0) {
      console.log("⚠️  No pending reports to assign.");
      return;
    }

    // 5. Assign reports using PROPER LOGIC
    console.log("\n🎯 Step 7: Creating assignments (PROPER DISTRIBUTION)...");

    // Match the worker's configuration - each report goes to 1 volunteer
    const VERIFICATIONS_NEEDED = 1;
    console.log(
      `📌 Each report will be assigned to ${VERIFICATIONS_NEEDED} volunteers\n`
    );

    let totalAssignmentsCreated = 0;

    for (const report of pendingReports) {
      console.log(
        `  Processing report ${report.id.slice(0, 8)} (${report.category})...`
      );

      // Get volunteers with LOWEST workload (fair distribution)
      const volunteersWithWorkload = await redis.zrange(
        "volunteer:workload",
        0,
        VERIFICATIONS_NEEDED - 1,
        "WITHSCORES"
      );

      const selectedVolunteers: string[] = [];

      // Parse the response (it comes as [id1, score1, id2, score2, ...])
      for (let i = 0; i < volunteersWithWorkload.length; i += 2) {
        selectedVolunteers.push(volunteersWithWorkload[i]);
      }

      console.log(
        `    → Assigning to ${selectedVolunteers.length} volunteers with lowest workload`
      );

      // Create Assignment records in database
      const assignments = await Promise.all(
        selectedVolunteers.map((volunteerId) =>
          prisma.assignment.create({
            data: {
              reportId: report.id,
              volunteerId: volunteerId,
              status: "PENDING",
            },
          })
        )
      );

      // Update report's assignedCount
      await prisma.report.update({
        where: { id: report.id },
        data: { assignedCount: assignments.length },
      });

      // Update each volunteer's workload in Redis
      for (const volunteerId of selectedVolunteers) {
        // Increment workload score (used for load balancing)
        await redis.zincrby("volunteer:workload", 1, volunteerId);

        // Increment assignment count
        await redis.hincrby(`volunteer:${volunteerId}`, "assignedCount", 1);

        // Track which reports are assigned to this volunteer
        await redis.sadd(`volunteer:${volunteerId}:reports`, report.id);

        // Track which volunteers are assigned to this report
        await redis.sadd(`report:${report.id}:volunteers`, volunteerId);
      }

      totalAssignmentsCreated += assignments.length;
      console.log(`    ✅ Created ${assignments.length} assignments`);
    }

    // 6. Show final distribution
    console.log("\n\n✅ VERIFICATION & DISTRIBUTION");
    console.log("=".repeat(60));

    // Get workload per volunteer
    console.log("\n👥 Volunteer Workload Distribution:");
    const workloads = await redis.zrange(
      "volunteer:workload",
      0,
      -1,
      "WITHSCORES"
    );

    for (let i = 0; i < workloads.length; i += 2) {
      const volunteerId = workloads[i];
      const workload = workloads[i + 1];

      const volunteerData = await redis.hgetall(`volunteer:${volunteerId}`);
      const assignmentCount = await prisma.assignment.count({
        where: {
          volunteerId,
          status: "PENDING",
        },
      });

      console.log(
        `  📊 ${volunteerData.name}: ${assignmentCount} reports assigned (workload score: ${workload})`
      );
    }

    // Database stats
    console.log("\n📊 Database Assignment Stats:");
    const dbStats = await prisma.assignment.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    dbStats.forEach((stat) => {
      console.log(`  ${stat.status}: ${stat._count.id} assignments`);
    });

    // Report verification
    console.log("\n📋 Report Assignment Verification:");
    const reportStats = await prisma.report.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        category: true,
        assignedCount: true,
        _count: {
          select: { assignments: true },
        },
      },
    });

    reportStats.forEach((report) => {
      const match =
        report.assignedCount === report._count.assignments ? "✅" : "❌";
      console.log(
        `  ${match} ${report.category} (${report.id.slice(0, 8)}): DB=${report._count.assignments}, Count=${report.assignedCount}`
      );
    });

    console.log("\n\n🎉 ASSIGNMENT COMPLETE!");
    console.log(`Total assignments created: ${totalAssignmentsCreated}`);
    console.log(`Reports processed: ${pendingReports.length}`);
    console.log(
      `Average per volunteer: ${(totalAssignmentsCreated / volunteers.length).toFixed(1)}`
    );
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await redis.quit();
  }
}

fixAssignmentsCorrectly();
