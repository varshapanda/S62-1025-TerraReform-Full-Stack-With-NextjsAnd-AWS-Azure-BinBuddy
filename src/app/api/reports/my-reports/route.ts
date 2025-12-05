// src/app/api/reports/my-reports/route.ts

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";
import { generateReadPresignedUrl } from "@/lib/s3Client";

export async function GET(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);
    if (!success || !user) {
      return sendError("Unauthorized", "AUTH_ERROR", 401);
    }

    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    // ✅ UPDATED: Include task relationship
    const reports = await prisma.report.findMany({
      where: {
        reporterId: String(user.id),
      },
      include: {
        images: true,
        reporter: {
          select: { id: true, name: true, email: true },
        },
        task: {
          // ✅ ADDED: Include task data
          select: {
            id: true,
            status: true,
            scheduledFor: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: showAll ? undefined : 10,
    });

    // Generate presigned URLs
    const reportsWithSignedUrls = await Promise.all(
      reports.map(async (report) => {
        const signedImages = await Promise.all(
          report.images.map(async (img) => ({
            ...img,
            url: await generateReadPresignedUrl(img.url),
          }))
        );

        return {
          ...report,
          imageUrl: report.imageUrl
            ? await generateReadPresignedUrl(report.imageUrl)
            : undefined,
          images: signedImages,
        };
      })
    );

    return sendSuccess(reportsWithSignedUrls);
  } catch (error) {
    console.error("Fetch my reports error:", error);
    return sendError("Failed to fetch reports", "DB_ERROR", 500);
  }
}
