import { prisma } from "@/lib/prisma";

async function checkImageUrls() {
  const reports = await prisma.report.findMany({
    select: {
      id: true,
      imageUrl: true,
    },
    take: 10, // Check first 10
  });

  console.log("Found", reports.length, "reports");
  console.log("\nSample URLs:");

  reports.forEach((report, index) => {
    console.log(`\n${index + 1}. ID: ${report.id}`);
    console.log(`   URL: ${report.imageUrl}`);
    console.log(`   Has spaces: ${report.imageUrl.includes(" ")}`);
    console.log(`   Has %20: ${report.imageUrl.includes("%20")}`);
    console.log(`   Has %2520: ${report.imageUrl.includes("%2520")}`);
  });
}

checkImageUrls()
  .then(() => {
    console.log("\n✓ Check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
