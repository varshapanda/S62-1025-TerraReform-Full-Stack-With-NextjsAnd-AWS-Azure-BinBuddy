// src/app/api/reports/[id]/route.ts

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";
import { generateReadPresignedUrl } from "@/lib/s3Client";

export async function GET(
  req: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: { params: any }
) {
  try {
    const params = await context.params;
    const reportId = params?.id;

    if (!reportId) {
      return sendError(
        "Missing report id in route params.",
        "BAD_REQUEST",
        400
      );
    }

    const { success, user } = await verifyToken(req);
    if (!success || !user) {
      return sendError("Unauthorized", "AUTH_ERROR", 401);
    }

    // ✅ UPDATED: Include task relationship
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        images: true,
        reporter: {
          select: { id: true, name: true, email: true },
        },
        task: {
          // ✅ ADDED: Include task data for tracking status
          select: {
            id: true,
            status: true,
            scheduledFor: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!report) {
      return sendError("Report not found", "NOT_FOUND", 404);
    }

    if (
      report.reporterId !== String(user.id) &&
      user.role !== "AUTHORITY" &&
      user.role !== "ADMIN"
    ) {
      return sendError(
        "You don't have permission to view this report",
        "FORBIDDEN",
        403
      );
    }

    // Generate presigned URL for the main image
    if (report.imageUrl) {
      report.imageUrl = await generateReadPresignedUrl(report.imageUrl);
    }

    // Generate presigned URLs for all images
    if (report.images && report.images.length > 0) {
      report.images = await Promise.all(
        report.images.map(async (img) => ({
          ...img,
          url: await generateReadPresignedUrl(img.url),
        }))
      );
    }

    return sendSuccess(report);
  } catch (error) {
    console.error("Fetch report error:", error);
    return sendError("Failed to fetch report", "DB_ERROR", 500);
  }
}
