// src/app/api/authority/service-areas/route.ts
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

    const serviceAreas = await prisma.authorityServiceArea.findMany({
      where: { authorityId: userId },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: { serviceAreas },
    });
  } catch (error) {
    console.error("Get service areas error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { city, state, locality, priority = 1 } = body;

    if (!city || !state || !locality) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const serviceArea = await prisma.authorityServiceArea.create({
      data: {
        authorityId: userId,
        city,
        state,
        locality,
        priority,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service area added successfully",
        data: { serviceArea },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add service area error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const serviceAreaId = searchParams.get("id");

    if (!userId || !serviceAreaId) {
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Check if this is the last service area
    const serviceAreaCount = await prisma.authorityServiceArea.count({
      where: { authorityId: userId },
    });

    if (serviceAreaCount <= 1) {
      return NextResponse.json(
        { success: false, error: "Cannot delete the last service area" },
        { status: 400 }
      );
    }

    await prisma.authorityServiceArea.delete({
      where: {
        id: serviceAreaId,
        authorityId: userId, // Ensure user owns this area
      },
    });

    return NextResponse.json({
      success: true,
      message: "Service area deleted successfully",
    });
  } catch (error) {
    console.error("Delete service area error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
