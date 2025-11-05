import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test multiple queries to verify relationships
    const userCount = await prisma.user.count();
    const reportCount = await prisma.report.count();
    const taskCount = await prisma.task.count();

    // Get a sample user with their reports
    const sampleUser = await prisma.user.findMany({
      include: {
        reports: true,
        rewards: true,
        notifications: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      stats: {
        users: userCount,
        reports: reportCount,
        tasks: taskCount,
      },
      sampleData: sampleUser,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
