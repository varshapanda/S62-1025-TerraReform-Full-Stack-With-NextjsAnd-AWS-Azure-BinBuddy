import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);

    if (!success || !user) {
      return sendError("Unauthorized", ERROR_CODES.AUTH_ERROR, 401);
    }

    if (user.role.toLowerCase() !== "admin") {
      return sendError(
        "Access denied. Admin only.",
        ERROR_CODES.AUTH_ERROR,
        403
      );
    }

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalReports,
      activeTasks,
      pendingVolunteerRequests,
      recentReports,
      usersByRole,
      reportsToday,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total reports
      prisma.report.count(),

      // Active tasks (pending + in progress)
      prisma.task.count({
        where: {
          status: {
            in: ["PENDING", "ASSIGNED", "IN_PROGRESS"],
          },
        },
      }),

      // Pending volunteer requests
      prisma.volunteerRequest.count({
        where: { status: "PENDING" },
      }),

      // Recent reports (last 7 days)
      prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Users by role
      prisma.user.groupBy({
        by: ["role"],
        _count: {
          role: true,
        },
      }),

      // Reports created today
      prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Calculate system health (simplified metric)
    const completedTasks = await prisma.task.count({
      where: { status: "COMPLETED" },
    });
    const totalTasksCount = await prisma.task.count();

    const systemHealth =
      totalTasksCount > 0
        ? Math.round((completedTasks / totalTasksCount) * 100)
        : 100;

    // Format users by role
    const roleBreakdown = usersByRole.reduce(
      (acc, curr) => {
        acc[curr.role.toLowerCase()] = curr._count.role;
        return acc;
      },
      {} as Record<string, number>
    );

    return sendSuccess(
      {
        stats: {
          totalUsers,
          totalReports,
          activeTasks,
          systemHealth,
          pendingVolunteerRequests,
          recentReports,
          reportsToday,
          roleBreakdown,
        },
      },
      "Admin stats fetched successfully",
      200
    );
  } catch (error) {
    return handleError(error, "GET /api/admin/stats");
  }
}
