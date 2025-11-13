import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);
    if (!success || !user) {
      return sendError("Unauthorized", "AUTH_ERROR", 401);
    }

    const reports = await prisma.report.findMany({
      where: { reporterId: String(user.id) },
      orderBy: { createdAt: "desc" },
      take: 10, // Latest 10
    });

    return sendSuccess(reports);
  } catch (error) {
    console.error("Fetch reports error:", error);
    return sendError("Failed to fetch reports", "DB_ERROR", 500);
  }
}
