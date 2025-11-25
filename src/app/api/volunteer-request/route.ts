// app/api/volunteer-request/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // REMOVE THIS LINE: const userIdNum = parseInt(userId);
    // Use userId directly as string

    if (
      userRole?.toLowerCase() === "volunteer" ||
      userRole?.toLowerCase() === "admin"
    ) {
      return NextResponse.json(
        { error: "You are already a volunteer or admin." },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.volunteerRequest.findUnique({
      where: { userId: userId }, // Use userId directly
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { error: "You already have a pending volunteer request." },
          { status: 400 }
        );
      }
      if (existingRequest.status === "APPROVED") {
        return NextResponse.json(
          { error: "You are already a volunteer." },
          { status: 400 }
        );
      }

      const updatedRequest = await prisma.volunteerRequest.update({
        where: { userId: userId }, // Use userId directly
        data: {
          status: "PENDING",
          requestedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          reviewNotes: null,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Volunteer request resubmitted successfully.",
          data: { request: updatedRequest },
        },
        { status: 200 }
      );
    }

    const volunteerRequest = await prisma.volunteerRequest.create({
      data: {
        userId: userId, // Use userId directly
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Volunteer request submitted successfully.",
        data: { request: volunteerRequest },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting volunteer request:", error);
    return NextResponse.json(
      { error: "Failed to submit volunteer request. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // REMOVE THIS LINE: const userIdNum = parseInt(userId);
    // Use userId directly as string

    const volunteerRequest = await prisma.volunteerRequest.findUnique({
      where: { userId: userId }, // Use userId directly
    });

    return NextResponse.json(
      {
        success: true,
        data: { request: volunteerRequest },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching volunteer request:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer request." },
      { status: 500 }
    );
  }
}
