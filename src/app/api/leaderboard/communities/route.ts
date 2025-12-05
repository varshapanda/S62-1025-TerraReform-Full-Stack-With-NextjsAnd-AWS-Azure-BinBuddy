// src/app/api/leaderboard/communities/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const timeRange = searchParams.get("timeRange") || "all";
    const cityFilter = searchParams.get("city");

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

    // Build where clause for reports
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reportWhere: any = {
      locality: { not: null },
      city: { not: null },
      ...(Object.keys(dateFilter).length > 0 && {
        createdAt: dateFilter,
      }),
    };

    if (cityFilter && cityFilter !== "ALL") {
      reportWhere.city = {
        equals: cityFilter,
        mode: "insensitive",
      };
    }

    // Fetch all reports matching criteria
    const reports = await prisma.report.findMany({
      where: reportWhere,
      select: {
        locality: true,
        city: true,
        status: true,
        reporter: {
          select: {
            id: true,
            points: true,
          },
        },
      },
    });

    // Group by locality and city
    const communityMap = new Map<
      string,
      {
        locality: string;
        city: string;
        totalPoints: number;
        totalReports: number;
        verifiedReports: number;
        userIds: Set<string>;
      }
    >();

    reports.forEach((report) => {
      const key = `${report.locality}|${report.city}`;
      const existing = communityMap.get(key) || {
        locality: report.locality!,
        city: report.city!,
        totalPoints: 0,
        totalReports: 0,
        verifiedReports: 0,
        userIds: new Set<string>(),
      };

      existing.totalReports++;
      if (report.status === "VERIFIED") {
        existing.verifiedReports++;
        existing.totalPoints += report.reporter.points || 0;
      }
      existing.userIds.add(report.reporter.id);

      communityMap.set(key, existing);
    });

    // Convert to array and sort
    const communities = Array.from(communityMap.values())
      .map((comm) => ({
        locality: comm.locality,
        city: comm.city,
        totalPoints: comm.totalPoints,
        totalReports: comm.totalReports,
        verifiedReports: comm.verifiedReports,
        activeUsers: comm.userIds.size,
        rank: 0, // Will be assigned below
      }))
      .sort((a, b) => {
        // Sort by verified reports first, then total points
        if (b.verifiedReports !== a.verifiedReports) {
          return b.verifiedReports - a.verifiedReports;
        }
        return b.totalPoints - a.totalPoints;
      })
      .slice(0, limit);

    // Assign ranks
    communities.forEach((comm, index) => {
      comm.rank = index + 1;
    });

    return sendSuccess(communities);
  } catch (error) {
    console.error("Leaderboard communities error:", error);
    return sendError("Failed to fetch community leaderboard", "DB_ERROR", 500);
  }
}
