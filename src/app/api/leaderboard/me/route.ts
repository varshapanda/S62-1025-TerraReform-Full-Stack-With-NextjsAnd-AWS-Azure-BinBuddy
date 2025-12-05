// src/app/api/leaderboard/me/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(req: NextRequest) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    // If not authenticated, return null (not an error)
    if (!userId) {
      console.log("[LEADERBOARD/ME] User not authenticated");
      return sendSuccess(null);
    }

    console.log("[LEADERBOARD/ME] Fetching rank for user:", userId);

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        role: true,
        city: true,
        _count: {
          select: {
            reports: {
              where: { status: "VERIFIED" },
            },
            verifications: true,
          },
        },
        reports: {
          where: { locality: { not: null } },
          select: { locality: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!currentUser) {
      console.log("[LEADERBOARD/ME] User not found in database");
      return sendError("User not found", "NOT_FOUND", 404);
    }

    console.log(
      "[LEADERBOARD/ME] User found:",
      currentUser.id,
      "Points:",
      currentUser.points
    );

    // Calculate rank based on role
    let rank = 0;
    if (currentUser.role === "user") {
      // Count users with more points
      rank =
        (await prisma.user.count({
          where: {
            role: "user",
            points: { gt: currentUser.points || 0 },
          },
        })) + 1;
    } else if (currentUser.role === "volunteer") {
      // Count volunteers with more points
      rank =
        (await prisma.user.count({
          where: {
            role: "volunteer",
            points: { gt: currentUser.points || 0 },
          },
        })) + 1;
    }

    console.log("[LEADERBOARD/ME] Calculated rank:", rank);

    const locality = currentUser.reports?.[0]?.locality || null;

    return sendSuccess({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      points: currentUser.points || 0,
      rank,
      role: currentUser.role,
      verifiedReports: currentUser._count.reports,
      verificationsCount: currentUser._count.verifications,
      city: currentUser.city || null,
      locality,
    });
  } catch (error) {
    console.error("[LEADERBOARD/ME] Error:", error);
    return sendError(
      error instanceof Error ? error.message : "Failed to fetch user rank",
      "DB_ERROR",
      500
    );
  }
}
