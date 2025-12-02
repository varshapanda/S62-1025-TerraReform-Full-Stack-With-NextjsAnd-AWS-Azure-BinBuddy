import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);
    if (!success || !user || user.role !== "volunteer") {
      return sendError("Unauthorized", "AUTH_ERROR", 401);
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get assignments for this volunteer (PENDING or VIEWED only)
    const assignments = await prisma.assignment.findMany({
      where: {
        volunteerId: user.id,
        status: { in: ["PENDING", "VIEWED"] },
        report: {
          status: "PENDING", // Report not yet verified
        },
      },
      include: {
        report: {
          include: {
            images: true,
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [{ report: { priority: "desc" } }, { assignedAt: "asc" }],
      skip,
      take: limit,
    });

    // Count total
    const total = await prisma.assignment.count({
      where: {
        volunteerId: user.id,
        status: { in: ["PENDING", "VIEWED"] },
        report: { status: "PENDING" },
      },
    });

    // Extract reports
    const reports = assignments.map((a) => a.report);

    return sendSuccess({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Queue fetch error:", error);
    return sendError("Failed to fetch queue", "DB_ERROR", 500);
  }
}
