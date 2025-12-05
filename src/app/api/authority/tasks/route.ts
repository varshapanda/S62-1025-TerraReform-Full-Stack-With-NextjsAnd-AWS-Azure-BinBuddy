// src/app/api/authority/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { generateReadPresignedUrl } from "@/lib/s3Client";

type TaskStatus =
  | "PENDING"
  | "ASSIGNED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type Priority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";
type TaskWhereInput = Prisma.TaskWhereInput;

interface CreateTaskRequest {
  reportId: string;
}

function isValidPriority(priority: string | null): priority is Priority {
  return ["URGENT", "HIGH", "MEDIUM", "LOW"].includes(priority || "");
}

export async function GET(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const status = searchParams.get("status");
    const priorityParam = searchParams.get("priority");
    const city = searchParams.get("city");
    const skip = (page - 1) * limit;

    const where: TaskWhereInput = {};

    // STATUS FILTER
    if (status && status !== "ALL") {
      if (status === "MY_TASKS") {
        where.assignedToId = userId;
        where.status = { in: ["ASSIGNED", "SCHEDULED", "IN_PROGRESS"] };
      } else {
        where.status = status as TaskStatus;
      }
    }

    // PRIORITY FILTER
    if (
      priorityParam &&
      priorityParam !== "ALL" &&
      isValidPriority(priorityParam)
    ) {
      where.priority = priorityParam;
    }

    // CITY FILTER
    where.report = {};

    if (city) {
      where.report.city = city;
    } else {
      const serviceCities = await getUserServiceCities(userId);

      if (serviceCities.length > 0) {
        where.report.city = { in: serviceCities };
      } else {
        delete where.report.city;
      }
    }

    // FETCH TASKS
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          report: {
            include: {
              reporter: { select: { name: true, email: true } },
              images: { take: 1, orderBy: { createdAt: "desc" } },
            },
          },
          assignedTo: { select: { name: true, email: true } },
        },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),

      prisma.task.count({ where }),
    ]);

    // ✅ Generate presigned URLs for all task images
    const tasksWithPresignedUrls = await Promise.all(
      tasks.map(async (task) => {
        if (task.report?.images && task.report.images.length > 0) {
          const imagesWithPresignedUrls = await Promise.all(
            task.report.images.map(async (image) => ({
              ...image,
              url: await generateReadPresignedUrl(image.url, 3600),
            }))
          );
          return {
            ...task,
            report: {
              ...task.report,
              images: imagesWithPresignedUrls,
            },
          };
        }
        return task;
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasksWithPresignedUrls,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GET authority tasks error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { success, user } = verifyToken(req);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body: CreateTaskRequest = await req.json();
    const { reportId } = body;

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isProfileComplete: true },
    });

    if (
      !userRecord ||
      userRecord.role !== "authority" ||
      !userRecord.isProfileComplete
    ) {
      return NextResponse.json(
        { success: false, error: "Complete your authority profile first" },
        { status: 403 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { task: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.status !== "VERIFIED") {
      return NextResponse.json(
        { success: false, error: "Report must be verified first" },
        { status: 400 }
      );
    }

    if (report.task) {
      return NextResponse.json(
        { success: false, error: "Task already exists for this report" },
        { status: 400 }
      );
    }

    const getPriority = (category: string): Priority => {
      const c = category.toLowerCase();
      if (c.includes("hazardous") || c.includes("medical")) return "URGENT";
      if (c.includes("plastic") || c.includes("metal")) return "HIGH";
      if (c.includes("organic") || c.includes("paper")) return "MEDIUM";
      return "LOW";
    };

    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + 24);

    const task = await prisma.task.create({
      data: {
        reportId,
        assignedToId: userId,
        status: "ASSIGNED",
        priority: getPriority(report.category),
        scheduledFor,
        collectionProof: [],
        location: {
          lat: report.lat,
          lng: report.lng,
          address:
            report.address ||
            `${report.locality}, ${report.city}, ${report.state}`,
        } as Prisma.InputJsonValue,
      },
      include: {
        report: {
          include: {
            reporter: { select: { name: true, email: true } },
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: report.reporterId,
        type: "TASK_CREATED",
        title: "Task Created",
        message: `A waste collection task has been created for your report.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task created",
      data: { task },
    });
  } catch (error) {
    console.error("POST /authority/tasks error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getUserServiceCities(userId: string): Promise<string[]> {
  const areas = await prisma.authorityServiceArea.findMany({
    where: { authorityId: userId },
    select: { city: true },
  });

  return areas.map((a) => a.city).filter(Boolean) as string[];
}
