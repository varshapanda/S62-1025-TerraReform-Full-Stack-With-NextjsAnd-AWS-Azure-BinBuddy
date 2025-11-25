// app/api/admin/volunteer-requests/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userRole = req.headers.get("x-user-role");
    const adminId = req.headers.get("x-user-id");

    if (userRole?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // FIX: Await the params Promise
    const { id } = await params;
    const body = await req.json();
    const { action, notes } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject".' },
        { status: 400 }
      );
    }

    // Convert string ID to number for VolunteerRequest
    const requestId = parseInt(id);

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

    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.volunteerRequest.update({
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

      return updatedRequest;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Volunteer request ${action}d successfully.`,
        data: { request: result },
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

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userRole = req.headers.get("x-user-role");

    if (userRole?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // FIX: Await the params Promise
    const { id } = await params;

    // Convert string ID to number for VolunteerRequest
    const requestId = parseInt(id);

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
