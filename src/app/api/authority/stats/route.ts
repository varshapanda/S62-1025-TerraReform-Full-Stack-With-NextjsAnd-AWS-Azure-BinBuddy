//  src/app/api/authority/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all stats in parallel
    const [
      pendingTasks,
      assignedTasks,
      inProgressTasks,
      scheduledTasks,
      completedToday,
      totalCompleted,
      tasksThisWeek,
      efficiencyScore,
    ] = await Promise.all([
      // Pending tasks in my service areas
      prisma.task.count({
        where: {
          status: "PENDING",
          report: {
            OR: [
              { city: { in: await getUserServiceCities(userId) } },
              { state: { in: await getUserServiceStates(userId) } },
            ],
          },
        },
      }),

      // Tasks assigned to me (not yet scheduled or started)
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: "ASSIGNED",
        },
      }),

      // Tasks in progress
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: "IN_PROGRESS",
        },
      }),

      // ✅ FIXED: Count all scheduled tasks (regardless of scheduledFor time)
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: "SCHEDULED",
        },
      }),

      // Tasks completed today
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: "COMPLETED",
          completedAt: { gte: today },
        },
      }),

      // Total completed tasks
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: "COMPLETED",
        },
      }),

      // Tasks completed this week
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Get user for completion rate
      prisma.user.findUnique({
        where: { id: userId },
        select: { completionRate: true, avgCompletionTime: true },
      }),
    ]);

    // Calculate efficiency (0-100)
    const efficiency = efficiencyScore?.completionRate || 0;

    return NextResponse.json({
      success: true,
      data: {
        pendingTasks,
        assignedTasks,
        inProgressTasks,
        scheduledTasks,
        completedToday,
        totalCompleted,
        tasksThisWeek,
        efficiency: Math.round(efficiency),
        avgCompletionTime: efficiencyScore?.avgCompletionTime || 0,
        dailyCapacity: await getUserDailyCapacity(userId),
      },
    });
  } catch (error) {
    console.error("Get authority stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserServiceCities(userId: string): Promise<string[]> {
  const areas = await prisma.authorityServiceArea.findMany({
    where: { authorityId: userId },
    select: { city: true },
  });
  return [...new Set(areas.map((area) => area.city))];
}

async function getUserServiceStates(userId: string): Promise<string[]> {
  const areas = await prisma.authorityServiceArea.findMany({
    where: { authorityId: userId },
    select: { state: true },
  });
  return [...new Set(areas.map((area) => area.state))];
}

async function getUserDailyCapacity(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { maxTasksPerDay: true },
  });
  return user?.maxTasksPerDay || 10;
}
