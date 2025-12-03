// src/app/api/authority/my-tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma types for type safety

export async function GET(req: NextRequest) {
  try {
    // Extract user ID from request headers for authentication
    const userId = req.headers.get("x-user-id");

    // Parse query parameters from URL for filtering and pagination
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // Optional: Filter by task status
    const priority = searchParams.get("priority"); // Optional: Filter by priority level
    const limit = parseInt(searchParams.get("limit") || "50"); // Results limit, default 50

    // Authentication check: Ensure user is logged in
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    /**
     * Build WHERE clause using Prisma's type-safe TaskWhereInput
     * This ensures compile-time type checking for query conditions
     */
    const where: Prisma.TaskWhereInput = {
      assignedToId: userId, // Only tasks assigned to current authority
      status: {
        in: ["ASSIGNED", "SCHEDULED", "IN_PROGRESS"], // Default: Show active tasks only
      },
    };

    /**
     * Status Filtering Logic:
     * - If user provides specific status (not 'ALL'), override default
     * - Type assertion ensures value matches TaskStatus enum
     */
    if (status && status !== "ALL") {
      // Type-safe assertion: Ensure status matches expected enum values
      where.status = status as
        | "PENDING"
        | "ASSIGNED"
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED";
    }

    /**
     * Priority Filtering Logic:
     * - If user provides specific priority (not 'ALL'), add to filter
     * - Type assertion ensures value matches Priority enum
     */
    if (priority && priority !== "ALL") {
      // Type-safe assertion: Ensure priority matches expected enum values
      where.priority = priority as "URGENT" | "HIGH" | "MEDIUM" | "LOW";
    }

    /**
     * Database Query:
     * Fetch tasks with related data using Prisma's type-safe query builder
     */
    const tasks = await prisma.task.findMany({
      where, // Apply constructed filters

      /**
       * Include related data to avoid N+1 queries:
       * - Report details including reporter information
       * - Reporter's basic info (name, email)
       * - First image from report for visual reference
       */
      include: {
        report: {
          include: {
            reporter: {
              select: {
                name: true, // Reporter's full name
                email: true, // Reporter's email for notifications
              },
            },
            images: {
              take: 1, // Limit to first image for performance
            },
          },
        },
      },

      /**
       * Ordering Strategy (multi-level sort):
       * 1. Priority (ascending: URGENT → HIGH → MEDIUM → LOW)
       * 2. Scheduled time (ascending: soonest tasks first)
       * 3. Creation date (descending: newest tasks first)
       */
      orderBy: [
        { priority: "asc" }, // Handle urgent tasks first
        { scheduledFor: "asc" }, // Schedule-based ordering
        { createdAt: "desc" }, // Prefer newer tasks
      ],

      take: limit, // Prevent over-fetching for performance
    });

    /**
     * Success Response:
     * Return tasks with 200 OK status
     */
    return NextResponse.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    /**
     * Error Handling:
     * - Log detailed error for server-side debugging
     * - Return generic error to client for security
     */
    console.error("Get my tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
