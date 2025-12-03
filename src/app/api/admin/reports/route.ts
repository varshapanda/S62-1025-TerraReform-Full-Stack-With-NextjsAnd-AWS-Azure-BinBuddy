// src/app/api/admin/reports/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";
import { generateReadPresignedUrl } from "@/lib/s3Client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);

    if (!success || !user) {
      return sendError("Unauthorized", ERROR_CODES.AUTH_ERROR, 401);
    }

    if (user.role.toLowerCase() !== "admin") {
      return sendError(
        "Access denied. Admin only.",
        ERROR_CODES.AUTH_ERROR,
        403
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status && ["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    // Fetch reports with pagination
    const [reports, totalCount] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
            },
          },
          verifications: {
            include: {
              volunteer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    // Generate presigned URLs for images
    const reportsWithSignedUrls = await Promise.all(
      reports.map(async (report) => ({
        ...report,
        imageUrl: await generateReadPresignedUrl(report.imageUrl),
        images: await Promise.all(
          report.images.map(async (img) => ({
            ...img,
            url: await generateReadPresignedUrl(img.url),
          }))
        ),
      }))
    );

    return sendSuccess(
      {
        reports: reportsWithSignedUrls,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      "Reports fetched successfully",
      200
    );
  } catch (error) {
    return handleError(error, "GET /api/admin/reports");
  }
}
