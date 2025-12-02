import { prisma } from "../src/lib/prisma";

async function fixPendingReports() {
  console.log("🔧 Fixing reports stuck in PENDING status...\n");

  try {
    // Get all PENDING reports with verifications
    const pendingReports = await prisma.report.findMany({
      where: { status: "PENDING" },
      include: {
        verifications: {
          orderBy: { createdAt: "asc" }, // ✅ FIXED: Use createdAt instead of verifiedAt
        },
      },
    });

    console.log(`Found ${pendingReports.length} reports in PENDING status\n`);

    for (const report of pendingReports) {
      if (report.verifications.length === 0) {
        console.log(`Report ${report.id}: No verifications yet, skipping`);
        continue;
      }

      // Take the FIRST verification (earliest)
      const firstVerification = report.verifications[0];

      console.log(`\nReport ${report.id}:`);
      console.log(`  Has ${report.verifications.length} verification(s)`);
      console.log(`  First verification: ${firstVerification.decision}`);
      console.log(`  Updating to ${firstVerification.decision}...`);

      // Update report status
      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: firstVerification.decision,
          verifiedAt: new Date(), // ✅ FIXED: Set to current time
          verifiedBy: firstVerification.volunteerId,
          remarks:
            firstVerification.decision === "VERIFIED"
              ? firstVerification.verificationNote
              : null,
          rejectionReason:
            firstVerification.decision === "REJECTED"
              ? firstVerification.verificationNote
              : null,
        },
      });

      // Expire remaining assignments
      const expiredCount = await prisma.assignment.updateMany({
        where: {
          reportId: report.id,
          status: { in: ["PENDING", "VIEWED"] },
        },
        data: { status: "EXPIRED" },
      });

      console.log(`  ✅ Updated! Expired ${expiredCount.count} assignment(s)`);
    }

    console.log("\n✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

fixPendingReports();
