import { prisma } from "../src/lib/prisma";
import { Redis } from "ioredis";

async function debug() {
  const redis = new Redis(process.env.REDIS_URL!);

  console.log("\n🔍 ASSIGNMENT SYSTEM DIAGNOSTICS\n");
  console.log("=".repeat(50));

  // 1. Check volunteers
  const volunteers = await prisma.user.findMany({
    where: { role: "volunteer" },
    select: { id: true, name: true, email: true },
  });

  console.log(`\n👥 VOLUNTEERS (${volunteers.length}):`);
  for (const v of volunteers) {
    const workload = await redis.zscore("volunteer:workload", v.id);
    const reports = await redis.smembers(`volunteer:${v.id}:reports`);
    console.log(
      `  ${v.name}: workload=${workload || 0}, reports=${reports.length}`
    );
  }

  // 2. Check pending reports
  const pendingReports = await prisma.report.findMany({
    where: { status: "PENDING" },
    select: { id: true, assignedCount: true, createdAt: true },
  });

  console.log(`\n📋 PENDING REPORTS (${pendingReports.length}):`);
  for (const report of pendingReports) {
    const assignments = await prisma.assignment.count({
      where: { reportId: report.id },
    });
    const redisVolunteers = await redis.smembers(
      `report:${report.id}:volunteers`
    );
    console.log(
      `  Report ${report.id}: DB=${assignments}, Redis=${redisVolunteers.length}, assignedCount=${report.assignedCount}`
    );
  }

  // 3. Check assignments
  const assignments = await prisma.assignment.findMany({
    where: {
      status: { in: ["PENDING", "VIEWED"] },
    },
    select: {
      reportId: true,
      volunteerId: true,
      status: true,
    },
  });

  console.log(`\n📌 ACTIVE ASSIGNMENTS (${assignments.length}):`);
  const byVolunteer = new Map<string, number>();
  for (const a of assignments) {
    byVolunteer.set(a.volunteerId, (byVolunteer.get(a.volunteerId) || 0) + 1);
  }

  for (const [vId, count] of byVolunteer.entries()) {
    const v = volunteers.find((vol) => vol.id === vId);
    console.log(`  ${v?.name || vId}: ${count} assignments`);
  }

  await redis.quit();
  console.log("\n" + "=".repeat(50) + "\n");
  process.exit(0);
}

debug();
