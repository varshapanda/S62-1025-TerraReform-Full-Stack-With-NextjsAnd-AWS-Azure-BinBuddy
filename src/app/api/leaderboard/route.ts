import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ---- TOP USERS (LEADERBOARD) with locality ----
    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { points: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
      },
    });

    // Get localities for each user from their most recent report
    const usersWithLocality = await Promise.all(
      users.map(async (user) => {
        const latestReport = await prisma.report.findFirst({
          where: { reporterId: user.id },
          orderBy: { createdAt: "desc" },
          select: { locality: true },
        });

        return {
          ...user,
          locality: latestReport?.locality || null,
        };
      })
    );

    // ---- USER METRICS (MOCK UNTIL AUTH INTEGRATION) ----
    const userPoints = users[0]?.points || 0;
    const userRank = 1;

    const userTotalReports = await prisma.report.count();
    const userValidatedReports = await prisma.report.count({
      where: {
        status: "VERIFIED",
      },
    });

    // ---- COMMUNITY AGGREGATION (STATE + LOCALITY BASED) ----
    // Get reports grouped by state and locality
    const reportsByStateLocality = await prisma.report.groupBy({
      by: ["state", "locality"],
      where: {
        state: { not: null },
        locality: { not: null },
      },
      _count: {
        id: true,
      },
    });

    // Get users for each state+locality to calculate points
    const communityData = await Promise.all(
      reportsByStateLocality.map(async (reportGroup) => {
        const usersInLocality = await prisma.user.findMany({
          where: {
            state: reportGroup.state,
            reports: {
              some: {
                locality: reportGroup.locality,
              },
            },
          },
          select: {
            points: true,
            id: true,
          },
        });

        const totalPoints = usersInLocality.reduce(
          (sum, user) => sum + user.points,
          0
        );
        const userCount = usersInLocality.length;

        return {
          state: reportGroup.state,
          locality: reportGroup.locality,
          totalPoints,
          userCount,
          reportCount: reportGroup._count.id,
        };
      })
    );

    // Sort by points and format
    const sortedCommunities = communityData
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 50);

    const topCommunities = sortedCommunities.map((c, index) => ({
      rank: index + 1,
      name: c.state,
      locality: c.locality,
      impactScore: c.totalPoints,
      userCount: c.userCount,
      totalReports: c.reportCount,
    }));

    const topCommunity = topCommunities[0]
      ? {
          name: topCommunities[0].name,
          locality: topCommunities[0].locality,
          validatedCount: userValidatedReports,
          totalReports: userTotalReports,
          userCount: topCommunities[0].userCount,
        }
      : null;

    // ---- RESPONSE ----
    return NextResponse.json({
      userPoints,
      userRank,
      userTotalReports,
      userValidatedReports,
      topCommunity,
      topCommunities,
      leaderboard: usersWithLocality,
    });
  } catch (err) {
    console.error("LEADERBOARD API ERROR:", err);
    return NextResponse.json(
      { error: "Leaderboard API failed" },
      { status: 500 }
    );
  }
}
