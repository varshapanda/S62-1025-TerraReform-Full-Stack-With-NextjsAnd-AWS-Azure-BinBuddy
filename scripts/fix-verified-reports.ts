import { prisma } from "../src/lib/prisma";

async function fixVerifiedReports() {
  console.log("🔧 Fixing already-verified reports stuck in PENDING...\n");

  try {
    // Find all completed assignments where report is still PENDING
    const completedAssignments = await prisma.assignment.findMany({
      where: {
        status: "COMPLETED",
        report: { status: "PENDING" },
      },
      include: {
        report: {
          include: {
            verifications: true,
          },
        },
      },
    });

    console.log(`Found ${completedAssignments.length} reports to fix\n`);

    let fixed = 0;

    for (const assignment of completedAssignments) {
      // Get the first verification (the one that was submitted)
      const verification = assignment.report.verifications[0];

      if (!verification) {
        console.log(
          `⚠️  Report ${assignment.reportId} has no verification, skipping`
        );
        continue;
      }

      console.log(
        `Updating report ${assignment.reportId} to ${verification.decision}`
      );

      // Update the report status
      await prisma.report.update({
        where: { id: assignment.reportId },
        data: {
          status: verification.decision,
          verifiedAt: new Date(),
          verifiedBy: verification.volunteerId,
          remarks:
            verification.decision === "VERIFIED"
              ? verification.verificationNote
              : null,
          rejectionReason:
            verification.decision === "REJECTED"
              ? verification.verificationNote
              : null,
        },
      });

      // Expire any other pending assignments for this report
      await prisma.assignment.updateMany({
        where: {
          reportId: assignment.reportId,
          status: { in: ["PENDING", "VIEWED"] },
        },
        data: { status: "EXPIRED" },
      });

      console.log(`✅ Fixed report ${assignment.reportId}\n`);
      fixed++;
    }

    console.log(`\n🎉 Successfully fixed ${fixed} reports!`);

    // Show summary
    const statusCounts = await prisma.report.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    console.log("\n📊 Current Report Status Distribution:");
    statusCounts.forEach((s) => {
      console.log(`  ${s.status}: ${s._count.id}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixVerifiedReports();
