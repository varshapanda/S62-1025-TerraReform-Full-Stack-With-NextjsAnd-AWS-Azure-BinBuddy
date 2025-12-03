// src/app/api/admin/reports/[reportId]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";
import { generateReadPresignedUrl } from "@/lib/s3Client";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ reportId: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
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

    const { reportId } = await params;

    // Fetch report with all related data
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            state: true,
          },
        },
        images: true,
        verifications: {
          include: {
            volunteer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        assignments: {
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
    });

    if (!report) {
      return sendError("Report not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Generate presigned URLs
    const reportWithSignedUrls = {
      ...report,
      imageUrl: await generateReadPresignedUrl(report.imageUrl),
      images: await Promise.all(
        report.images.map(async (img) => ({
          ...img,
          url: await generateReadPresignedUrl(img.url),
        }))
      ),
    };

    return sendSuccess(
      { report: reportWithSignedUrls },
      "Report details fetched successfully",
      200
    );
  } catch (error) {
    return handleError(error, "GET /api/admin/reports/:reportId");
  }
}

// Update report status (for admin override)
export async function PATCH(req: NextRequest, { params }: Params) {
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

    const { reportId } = await params;
    const { status, remarks } = await req.json();

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return sendError("Invalid status", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        verifiedAt: new Date(),
        verifiedBy: user.id,
        remarks: status === "VERIFIED" ? remarks : null,
        rejectionReason: status === "REJECTED" ? remarks : null,
      },
    });

    return sendSuccess(
      { report: updatedReport },
      `Report ${status.toLowerCase()} successfully`,
      200
    );
  } catch (error) {
    return handleError(error, "PATCH /api/admin/reports/:reportId");
  }
}

// Delete report
export async function DELETE(req: NextRequest, { params }: Params) {
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

    const { reportId } = await params;

    // Delete report and related data in transaction
    await prisma.$transaction(async (tx) => {
      await tx.verification.deleteMany({ where: { reportId } });
      await tx.assignment.deleteMany({ where: { reportId } });
      await tx.image.deleteMany({ where: { reportId } });
      await tx.report.delete({ where: { id: reportId } });
    });

    return sendSuccess(null, "Report deleted successfully", 200);
  } catch (error) {
    return handleError(error, "DELETE /api/admin/reports/:reportId");
  }
}
