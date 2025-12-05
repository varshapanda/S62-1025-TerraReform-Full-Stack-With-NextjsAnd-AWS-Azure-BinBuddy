// src/app/api/leaderboard/users/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const timeRange = searchParams.get("timeRange") || "all";

    console.log("[LEADERBOARD/USERS] Request:", { limit, timeRange });

    // Build date filter
    let dateFilter = {};
    if (timeRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (timeRange === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }

    // Get all users with role "user" and their points
    const users = await prisma.user.findMany({
      where: {
        role: "user",
        points: {
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        city: true,
        _count: {
          select: {
            reports: {
              where: {
                status: "VERIFIED",
                ...(Object.keys(dateFilter).length > 0 && {
                  verifiedAt: dateFilter,
                }),
              },
            },
          },
        },
        reports: {
          where: { locality: { not: null } },
          select: { locality: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        points: "desc",
      },
      take: limit,
    });

    console.log(`[LEADERBOARD/USERS] Found ${users.length} users`);

    // Add rank to each user
    const rankedUsers = users.map((user, index) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points || 0,
      rank: index + 1,
      role: "user",
      verifiedReports: user._count.reports,
      city: user.city || null,
      locality: user.reports?.[0]?.locality || null,
    }));

    console.log("[LEADERBOARD/USERS] Success, returning data");
    return sendSuccess(rankedUsers);
  } catch (error) {
    console.error("[LEADERBOARD/USERS] Error:", error);
    return sendError(
      error instanceof Error ? error.message : "Failed to fetch leaderboard",
      "DB_ERROR",
      500
    );
  }
}
