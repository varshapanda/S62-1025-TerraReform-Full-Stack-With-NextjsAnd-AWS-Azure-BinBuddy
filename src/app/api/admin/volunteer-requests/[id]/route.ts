// src/app/api/admin/volunteer-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignmentManager } from "@/lib/assignment/redisManager"; // import the instance

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = req.headers.get("x-user-role");
    const adminId = req.headers.get("x-user-id") ?? null;

    if (userRole?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing request id." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action, notes } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject".' },
        { status: 400 }
      );
    }

    const requestId = parseInt(id, 10);
    if (Number.isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request id." },
        { status: 400 }
      );
    }

    const volunteerRequest = await prisma.volunteerRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!volunteerRequest) {
      return NextResponse.json(
        { error: "Volunteer request not found." },
        { status: 404 }
      );
    }

    if (volunteerRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been reviewed." },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    // Update DB + Register in Redis atomically
    const updatedRequest = await prisma.$transaction(async (tx) => {
      const r = await tx.volunteerRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          reviewNotes: notes || null,
        },
      });

      if (action === "approve") {
        await tx.user.update({
          where: { id: volunteerRequest.userId },
          data: { role: "volunteer" },
        });
      }

      return r;
    });

    // CRITICAL: Register volunteer AFTER DB commit succeeds
    if (action === "approve") {
      try {
        await assignmentManager.registerVolunteer(volunteerRequest.userId);
        console.log(`Registered volunteer ${volunteerRequest.userId} in Redis`);

        // AUTO-ASSIGN EXISTING PENDING REPORTS
        const pendingReports = await prisma.report.findMany({
          where: {
            status: "PENDING",
            assignedCount: { lt: 3 }, // Only if not fully assigned
          },
          select: { id: true },
          take: 5, // Assign first 5 reports
        });

        console.log(
          `Found ${pendingReports.length} reports to assign to new volunteer`
        );

        for (const report of pendingReports) {
          await assignReportToVolunteers(report.id);
        }
      } catch (err) {
        console.error("Failed to register volunteer in Redis:", err);
        // Don't rollback DB - user is still a volunteer
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Volunteer request ${action}d successfully.`,
        data: { request: updatedRequest },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reviewing volunteer request:", error);
    return NextResponse.json(
      { error: "Failed to review volunteer request." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = req.headers.get("x-user-role");

    if (userRole?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing request id." },
        { status: 400 }
      );
    }

    const requestId = parseInt(id, 10);
    if (Number.isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request id." },
        { status: 400 }
      );
    }

    await prisma.volunteerRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Volunteer request deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting volunteer request:", error);
    return NextResponse.json(
      { error: "Failed to delete volunteer request." },
      { status: 500 }
    );
  }
}
