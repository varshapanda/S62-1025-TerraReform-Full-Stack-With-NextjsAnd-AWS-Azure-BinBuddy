// app/api/admin/volunteer-requests/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userRole = req.headers.get("x-user-role");

    if (userRole?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Fix: Properly type the where clause
    const where =
      status && ["PENDING", "APPROVED", "REJECTED"].includes(status)
        ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
        : {};

    const requests = await prisma.volunteerRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { requests },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching volunteer requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer requests." },
      { status: 500 }
    );
  }
}
