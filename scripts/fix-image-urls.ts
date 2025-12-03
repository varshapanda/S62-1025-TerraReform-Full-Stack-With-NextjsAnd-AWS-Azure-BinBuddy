// scripts/fix-image-urls.ts
import { prisma } from "@/lib/prisma";

function sanitizeUrl(url: string): string {
  // Replace %20 and spaces with hyphens in the filename only
  return url.replace(/%20/g, "-").replace(/\s+/g, "-");
}

async function fixImageUrls() {
  // Find reports with %20 or spaces in URLs
  const reports = await prisma.report.findMany({
    where: {
      OR: [
        { imageUrl: { contains: "%20" } },
        { imageUrl: { contains: " " } },
        { imageUrl: { contains: "%2520" } },
      ],
    },
  });

  console.log(`Found ${reports.length} reports with problematic URLs\n`);

  let fixed = 0;
  for (const report of reports) {
    const oldUrl = report.imageUrl;
    const newUrl = sanitizeUrl(oldUrl);

    if (oldUrl !== newUrl) {
      console.log(`Fixing report ${report.id}:`);
      console.log(`  Old: ${oldUrl}`);
      console.log(`  New: ${newUrl}\n`);

      await prisma.report.update({
        where: { id: report.id },
        data: { imageUrl: newUrl },
      });

      fixed++;
    }
  }

  console.log(`✓ Fixed ${fixed} report URLs`);
}

fixImageUrls()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
