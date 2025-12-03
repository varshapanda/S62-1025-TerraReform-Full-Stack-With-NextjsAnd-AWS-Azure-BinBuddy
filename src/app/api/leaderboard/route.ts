import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ---- TOP USERS (LEADERBOARD) ----
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

    // ---- USER METRICS (MOCK UNTIL AUTH INTEGRATION) ----
    const userPoints = users[0]?.points || 0;
    const userRank = 1;

    const userTotalReports = await prisma.report.count();
    const userValidatedReports = await prisma.report.count({
      where: {
        status: "VERIFIED",
      },
    });

    // ---- COMMUNITY AGGREGATION (STATE-BASED) ----
    const communities = await prisma.user.groupBy({
      by: ["state"],
      where: {
        state: { not: null },
      },
      _sum: {
        points: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          points: "desc",
        },
      },
    });

    const topCommunities = communities.map((c, index) => ({
      rank: index + 1,
      name: c.state,
      impactScore: c._sum.points || 0,
      userCount: c._count.id,
    }));

    const topCommunity = topCommunities[0]
      ? {
          name: topCommunities[0].name,
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
      leaderboard: users,
    });
  } catch (err) {
    console.error("LEADERBOARD API ERROR:", err);
    return NextResponse.json(
      { error: "Leaderboard API failed" },
      { status: 500 }
    );
  }
}
