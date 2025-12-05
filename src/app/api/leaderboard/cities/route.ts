// src/app/api/leaderboard/cities/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(_req: NextRequest) {
  try {
    // Get unique cities from reports
    const cities = await prisma.report.findMany({
      where: {
        city: { not: null },
      },
      select: {
        city: true,
      },
      distinct: ["city"],
    });

    const cityList = cities
      .map((r) => r.city)
      .filter((city): city is string => !!city)
      .sort();

    return sendSuccess(cityList);
  } catch (error) {
    console.error("Fetch cities error:", error);
    return sendError("Failed to fetch cities", "DB_ERROR", 500);
  }
}
