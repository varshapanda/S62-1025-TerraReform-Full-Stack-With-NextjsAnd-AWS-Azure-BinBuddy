import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

async function fixAssignments() {
  console.log("🔧 FIXING ASSIGNMENT SYSTEM");
  console.log("=".repeat(50));

  try {
    // 1. Clear ALL Redis data related to assignments
    console.log("\n🧹 Step 1: Clearing Redis...");
    const keys = await redis.keys("*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✅ Cleared ${keys.length} Redis keys`);
    }

    // 2. Delete all existing assignments in DB
    console.log("\n🗑️  Step 2: Clearing old assignments...");
    const deletedAssignments = await prisma.assignment.deleteMany({});
    console.log(`✅ Deleted ${deletedAssignments.count} old assignments`);

    // 3. Reset all report assignedCounts to 0
    console.log("\n🔄 Step 3: Resetting report counts...");
    const resetReports = await prisma.report.updateMany({
      where: { status: "PENDING" },
      data: { assignedCount: 0 },
    });
    console.log(`✅ Reset ${resetReports.count} reports`);

    // 4. Get all volunteers
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

    // 5. Register volunteers in Redis
    console.log("\n📝 Step 5: Registering volunteers in Redis...");
    for (const volunteer of volunteers) {
      await redis.zadd("volunteer:workload", 0, volunteer.id);
      await redis.hset(`volunteer:${volunteer.id}`, {
        name: volunteer.name,
        assignedCount: 0,
      });
      console.log(`  ✅ ${volunteer.name} registered`);
    }

    // 6. Get all pending reports
    console.log("\n📋 Step 6: Getting pending reports...");
    const pendingReports = await prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { id: true, category: true },
    });
    console.log(`✅ Found ${pendingReports.count} pending reports`);

    // 7. Assign each report to volunteers
    console.log("\n🎯 Step 7: Creating new assignments...");
    const ASSIGNMENTS_PER_REPORT = 3; // Each report goes to 3 volunteers
    let totalAssignmentsCreated = 0;

    for (const report of pendingReports) {
      console.log(`\n  Processing report ${report.id.slice(0, 8)}...`);

      // Get volunteers with lowest workload
      const volunteersForAssignment = await redis.zrange(
        "volunteer:workload",
        0,
        ASSIGNMENTS_PER_REPORT - 1,
        "WITHSCORES"
      );

      const assignedVolunteers: string[] = [];

      for (let i = 0; i < volunteersForAssignment.length; i += 2) {
        const volunteerId = volunteersForAssignment[i];
        assignedVolunteers.push(volunteerId);
      }

      // Create actual Assignment records in database
      const assignments = await Promise.all(
        assignedVolunteers.map((volunteerId) =>
          prisma.assignment.create({
            data: {
              reportId: report.id,
              volunteerId: volunteerId,
              status: "PENDING",
            },
          })
        )
      );

      // Update report assignedCount
      await prisma.report.update({
        where: { id: report.id },
        data: { assignedCount: assignments.length },
      });

      // Update Redis
      for (const volunteerId of assignedVolunteers) {
        await redis.zincrby("volunteer:workload", 1, volunteerId);
        await redis.hincrby(`volunteer:${volunteerId}`, "assignedCount", 1);
        await redis.sadd(`volunteer:${volunteerId}:reports`, report.id);
        await redis.sadd(`report:${report.id}:volunteers`, volunteerId);
      }

      totalAssignmentsCreated += assignments.length;
      console.log(`    ✅ Created ${assignments.length} assignments`);
    }

    // 8. Verify the fix
    console.log("\n\n✅ VERIFICATION");
    console.log("=".repeat(50));

    const dbStats = await prisma.assignment.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    console.log("\n📊 Database Stats:");
    dbStats.forEach((stat) => {
      console.log(`  ${stat.status}: ${stat._count.id} assignments`);
    });

    const reportStats = await prisma.report.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        assignedCount: true,
        _count: {
          select: { assignments: true },
        },
      },
    });

    console.log("\n📋 Report Assignment Status:");
    reportStats.forEach((report) => {
      const match =
        report.assignedCount === report._count.assignments ? "✅" : "❌";
      console.log(
        `  ${match} Report ${report.id.slice(0, 8)}: assignedCount=${report.assignedCount}, actual=${report._count.assignments}`
      );
    });

    console.log("\n\n🎉 FIX COMPLETE!");
    console.log(`Total assignments created: ${totalAssignmentsCreated}`);
  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await prisma.$disconnect();
    await redis.quit();
  }
}

fixAssignments();
