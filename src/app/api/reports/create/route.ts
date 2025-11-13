import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportCreationSchema } from "@/lib/validation/reportSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { success, user } = verifyToken(req);
    if (!success || !user) {
      return sendError("Unauthorized - please log in", "AUTH_ERROR", 401);
    }

    // Parse & validate request
    const body = await req.json();
    const validated = reportCreationSchema.parse(body);

    // Check for duplicate (same location + hash within 1 hour)
    if (validated.imageHash) {
      const existing = await prisma.report.findFirst({
        where: {
          imageHash: validated.imageHash,
          createdAt: {
            gte: new Date(Date.now() - 3600000), // Last 1 hour
          },
        },
      });

      if (existing) {
        return sendError(
          "Duplicate report detected - same image already submitted",
          "DUPLICATE_REPORT",
          409
        );
      }
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: String(user.id),
        imageUrl: validated.imageUrl,
        imageHash: validated.imageHash,
        category: validated.category,
        note: validated.note || null,
        lat: validated.lat,
        lng: validated.lng,
        status: "PENDING",
      },
    });

    // TODO: Enqueue verification job (BullMQ)
    // await verificationQueue.add("verify-report", { reportId: report.id });

    return sendSuccess(report, "Report created successfully", 201);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return sendError(
        error.issues[0]?.message || "Validation failed",
        "VALIDATION_ERROR",
        400,
        error.issues
      );
    }
    console.error("Report creation error:", error);
    return sendError("Failed to create report", "REPORT_ERROR", 500, {
      originalError: (error as Error)?.message ?? String(error),
    });
  }
}
