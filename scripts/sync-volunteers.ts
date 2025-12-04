// scripts/sync-volunteers.ts
import { prisma } from "../src/lib/prisma";
import { assignmentManager } from "../src/lib/assignment/redisManager";
import { Redis } from "ioredis";

async function syncVolunteersToRedis() {
  const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

  try {
    console.log("🔄 Starting volunteer sync...\n");

    // ============================================
    // STEP 1: Clear ALL old Redis data
    // ============================================
    console.log("🗑️  Clearing ALL old Redis data...");

    // Clear volunteer workload
    await redis.del("volunteer:workload");
    console.log("   ✅ Cleared volunteer:workload");

    // Clear all volunteer metadata keys
    const volunteerKeys = await redis.keys("volunteer:*");
    if (volunteerKeys.length > 0) {
      await redis.del(...volunteerKeys);
      console.log(`   ✅ Deleted ${volunteerKeys.length} volunteer:* keys`);
    }

    // Clear all assignment keys
    const assignmentKeys = await redis.keys("assignment:*");
    if (assignmentKeys.length > 0) {
      await redis.del(...assignmentKeys);
      console.log(`   ✅ Deleted ${assignmentKeys.length} assignment:* keys`);
    }

    // Clear volunteer pool keys (if any)
    const poolKeys = await redis.keys("volunteers:*");
    if (poolKeys.length > 0) {
      await redis.del(...poolKeys);
      console.log(`   ✅ Deleted ${poolKeys.length} volunteers:* keys`);
    }

    // Clear any report-related keys
    const reportKeys = await redis.keys("report:*");
    if (reportKeys.length > 0) {
      await redis.del(...reportKeys);
      console.log(`   ✅ Deleted ${reportKeys.length} report:* keys`);
    }

    console.log("✅ All old Redis data cleared!\n");

    // ============================================
    // STEP 2: Get fresh volunteers from database
    // ============================================
    const volunteers = await prisma.user.findMany({
      where: {
        role: "volunteer",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`📊 Found ${volunteers.length} volunteers in database:`);
    volunteers.forEach((v) => {
      console.log(`   - ${v.name || v.email} - ID: ${v.id}`);
    });

    if (volunteers.length === 0) {
      console.log("\n⚠️  No volunteers found in database!");
      await redis.quit();
      return;
    }

    // ============================================
    // STEP 3: Register fresh volunteers to Redis
    // ============================================
    console.log("\n📥 Adding fresh volunteers to Redis...");

    for (const volunteer of volunteers) {
      await assignmentManager.registerVolunteer(volunteer.id, 100);
      console.log(`   ✅ Registered: ${volunteer.name || volunteer.email}`);
    }

    // ============================================
    // STEP 4: Verify the sync
    // ============================================
    console.log("\n🔍 Verifying Redis state...");
    const workloadCount = await redis.zcard("volunteer:workload");
    console.log(`   📊 Total volunteers in workload: ${workloadCount}`);

    const allVolunteers = await redis.zrange("volunteer:workload", 0, -1);
    console.log(`   👥 Volunteers: ${allVolunteers.join(", ")}`);

    console.log(`\n✅ Successfully synced ${volunteers.length} volunteers!`);
    console.log("✅ Redis is now clean and up-to-date with production DB!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await redis.quit();
    await prisma.$disconnect();
    process.exit(0);
  }
}

syncVolunteersToRedis();
