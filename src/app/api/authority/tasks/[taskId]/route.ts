// src/app/api/authority/tasks/[taskId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { TaskStatus } from "@prisma/client";

// Define TypeScript interfaces
interface TaskActionRequest {
  action: TaskAction;
  scheduledFor?: string;
  collectionProof?: string[];
  notes?: string;
  reason?: string;
}

type TaskAction =
  | "assign"
  | "schedule"
  | "start"
  | "complete"
  | "cancel"
  | "unassign";

interface TaskUpdateData {
  assignedToId?: string | null;
  status?: TaskStatus;
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  collectionProof?: string[];
  notes?: string | null;
  actualTime?: number;
}

// Helper function interfaces
interface NotificationData {
  scheduledFor?: string;
  reason?: string;
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await props.params;
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        report: {
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            images: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Check if user can view this task
    if (task.assignedToId !== userId && task.status === "PENDING") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await props.params;
  try {
    const { success, user } = verifyToken(req);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = user.id;

    // ✅ FIX: Don't destructure here, keep the entire body
    const body: TaskActionRequest = await req.json();
    const { action } = body;

    console.log("📝 Received request:", JSON.stringify(body, null, 2));

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Validate user can perform action
    const isAuthority = user.role === "authority";

    if (!isAuthority && task.assignedToId !== userId && action !== "cancel") {
      return NextResponse.json(
        { success: false, error: "Not assigned to you" },
        { status: 403 }
      );
    }

    let updateData: TaskUpdateData = {};
    let message = "Task updated";

    switch (action) {
      case "assign":
        if (task.assignedToId) {
          return NextResponse.json(
            { success: false, error: "Task already assigned" },
            { status: 400 }
          );
        }
        updateData = {
          assignedToId: userId,
          status: "ASSIGNED",
        };
        message = "Task assigned to you";
        break;

      case "schedule":
        // ✅ FIX: Access scheduledFor from body, not data
        console.log("📅 Schedule data:", {
          scheduledFor: body.scheduledFor,
          type: typeof body.scheduledFor,
        });

        if (!body.scheduledFor) {
          return NextResponse.json(
            { success: false, error: "Scheduled time required" },
            { status: 400 }
          );
        }

        // Validate the date
        const scheduledDate = new Date(body.scheduledFor);
        if (isNaN(scheduledDate.getTime())) {
          return NextResponse.json(
            { success: false, error: "Invalid date format" },
            { status: 400 }
          );
        }

        updateData = {
          scheduledFor: scheduledDate,
          status: "SCHEDULED",
        };
        message = "Task scheduled";
        break;

      case "start":
        if (task.status !== "ASSIGNED" && task.status !== "SCHEDULED") {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot start task from ${task.status} status`,
            },
            { status: 400 }
          );
        }
        updateData = {
          startedAt: new Date(),
          status: "IN_PROGRESS",
        };
        message = "Collection started";
        break;

      case "complete":
        if (!task.startedAt) {
          return NextResponse.json(
            { success: false, error: "Task must be started before completing" },
            { status: 400 }
          );
        }

        const completionTime = Math.floor(
          (Date.now() - task.startedAt.getTime()) / (1000 * 60)
        ); // minutes

        console.log(
          `Task completion: started at ${task.startedAt}, took ${completionTime} minutes`
        );

        // Update user stats
        await updateAuthorityStats(userId, completionTime);

        // Award points to reporter
        await awardPointsToReporter(task.reportId, 50);

        updateData = {
          completedAt: new Date(),
          status: "COMPLETED",
          collectionProof: body.collectionProof || [],
          notes: body.notes || null,
          actualTime: completionTime,
        };
        message = "Task completed successfully";
        break;

      case "cancel":
        updateData = {
          cancelledAt: new Date(),
          status: "CANCELLED",
          notes: body.reason || null,
        };
        message = "Task cancelled";
        break;

      case "unassign":
        updateData = {
          assignedToId: null,
          status: "PENDING",
        };
        message = "Task unassigned";
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    console.log("💾 Update data:", JSON.stringify(updateData, null, 2));

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        report: {
          include: {
            reporter: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Send notification for all actions
    await sendTaskNotification(taskId, action, task.reportId, userId, body);

    console.log("✅ Task updated successfully:", updatedTask.id);

    return NextResponse.json({
      success: true,
      message,
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error("❌ Update task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function updateAuthorityStats(
  authorityId: string,
  completionTime: number
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: authorityId },
      select: {
        tasksCompleted: true,
        avgCompletionTime: true,
        completionRate: true,
        maxTasksPerDay: true,
      },
    });

    if (!user) {
      console.error(`Authority ${authorityId} not found for stats update`);
      return;
    }

    const totalTasks = user.tasksCompleted + 1;

    let newAvgTime = completionTime;
    if (user.avgCompletionTime && user.tasksCompleted > 0) {
      newAvgTime = Math.round(
        (user.avgCompletionTime * user.tasksCompleted + completionTime) /
          totalTasks
      );
    }

    const newCompletionRate = Math.min(
      100,
      (totalTasks / (user.maxTasksPerDay || 10)) * 100
    );

    await prisma.user.update({
      where: { id: authorityId },
      data: {
        tasksCompleted: totalTasks,
        avgCompletionTime: newAvgTime,
        completionRate: newCompletionRate,
      },
    });

    console.log(
      `Updated stats for authority ${authorityId}: ${totalTasks} tasks, avg ${newAvgTime}min, rate ${newCompletionRate}%`
    );
  } catch (error) {
    console.error("Error updating authority stats:", error);
  }
}

async function awardPointsToReporter(
  reportId: string,
  points: number
): Promise<void> {
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { reporterId: true },
    });

    if (!report || !report.reporterId) {
      console.error(`Report ${reportId} or reporter not found for points`);
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: report.reporterId },
        data: { points: { increment: points } },
      }),
      prisma.reward.create({
        data: {
          userId: report.reporterId,
          points,
          action: "WASTE_COLLECTED",
          description: "Waste successfully collected by authority",
        },
      }),
    ]);

    console.log(`Awarded ${points} points to reporter ${report.reporterId}`);
  } catch (error) {
    console.error("Error awarding points to reporter:", error);
  }
}

async function sendTaskNotification(
  taskId: string,
  action: string,
  _reportId: string,
  authorityId: string,
  _data: NotificationData
): Promise<void> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        report: {
          select: { reporterId: true, category: true },
        },
        assignedTo: {
          select: { name: true },
        },
      },
    });

    if (!task) return;

    const actionMessages: Record<string, string> = {
      assign: "assigned to you",
      schedule: "scheduled for collection",
      start: "collection started",
      complete: "completed successfully",
      cancel: "cancelled",
      unassign: "unassigned from you",
    };

    const message = actionMessages[action] || action;

    // Notify the authority (if they're not the one performing the action)
    if (task.assignedToId && task.assignedToId !== authorityId) {
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          type: "TASK_UPDATE",
          title: `Task ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          message: `Task ${taskId} has been ${message}`,
        },
      });
    }

    // Notify the reporter for certain actions
    if (
      ["complete", "schedule", "start"].includes(action) &&
      task.report.reporterId
    ) {
      const reporterMessage =
        action === "complete"
          ? `Your ${task.report.category} waste report has been collected successfully!`
          : `Your ${task.report.category} waste report collection has been ${message}`;

      await prisma.notification.create({
        data: {
          userId: task.report.reporterId,
          type: "REPORT_UPDATE",
          title: "Report Update",
          message: reporterMessage,
        },
      });
    }

    console.log(`✅ Notifications sent for task ${taskId} action: ${action}`);
  } catch (error) {
    console.error("Failed to send notifications:", error);
  }
}
