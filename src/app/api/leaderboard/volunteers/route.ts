// src/app/api/leaderboard/volunteers/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const timeRange = searchParams.get("timeRange") || "all";

    console.log("[LEADERBOARD/VOLUNTEERS] Request:", { limit, timeRange });

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

    // Get all volunteers with points
    const volunteers = await prisma.user.findMany({
      where: {
        role: "volunteer",
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
            verifications: {
              where: {
                ...(Object.keys(dateFilter).length > 0 && {
                  createdAt: dateFilter,
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

    console.log(
      `[LEADERBOARD/VOLUNTEERS] Found ${volunteers.length} volunteers`
    );

    // Add rank to each volunteer
    const rankedVolunteers = volunteers.map((volunteer, index) => ({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      points: volunteer.points || 0,
      rank: index + 1,
      role: "volunteer",
      verificationsCount: volunteer._count.verifications,
      city: volunteer.city || null,
      locality: volunteer.reports?.[0]?.locality || null,
    }));

    console.log("[LEADERBOARD/VOLUNTEERS] Success, returning data");
    return sendSuccess(rankedVolunteers);
  } catch (error) {
    console.error("[LEADERBOARD/VOLUNTEERS] Error:", error);
    return sendError(
      error instanceof Error
        ? error.message
        : "Failed to fetch volunteer leaderboard",
      "DB_ERROR",
      500
    );
  }
}
