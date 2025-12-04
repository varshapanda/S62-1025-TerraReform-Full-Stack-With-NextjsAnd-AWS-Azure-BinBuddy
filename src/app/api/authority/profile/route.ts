// src/app/api/authority/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ------------------------------
// Types
// ------------------------------

type VehicleType = "BIKE" | "AUTO" | "SMALL_TRUCK" | "TRUCK" | "OTHER";

interface ServiceAreaInput {
  city: string;
  state: string;
  locality: string;
  priority?: number;
}

interface UpdateProfileRequest {
  baseLat: number;
  baseLng: number;
  city: string;
  state: string;
  serviceRadius: number;
  vehicleType: VehicleType;
  maxTasksPerDay: number;
  serviceAreas: ServiceAreaInput[];
}

// ------------------------------
// GET: Fetch authority profile
// ------------------------------

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        baseLat: true,
        baseLng: true,
        serviceRadius: true,
        vehicleType: true,
        maxTasksPerDay: true,
        city: true,
        state: true,
        isProfileComplete: true,
        tasksCompleted: true,
        avgCompletionTime: true,
        completionRate: true,

        serviceAreas: {
          select: {
            id: true,
            city: true,
            state: true,
            locality: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { priority: "asc" },
        },
      },
    });

    if (!user || user.role !== "authority") {
      return NextResponse.json(
        { success: false, error: "User not found or not authority" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { profile: user },
    });
  } catch (err) {
    console.error("GET /authority/profile error:", err);
    return NextResponse.json(
      { success: false, error: "Server error fetching profile" },
      { status: 500 }
    );
  }
}

// ------------------------------
// PUT: Update authority profile
// ------------------------------

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as UpdateProfileRequest;

    // ------------------------------
    // Validation
    // ------------------------------

    const validationErrors: string[] = [];

    if (typeof body.baseLat !== "number" || typeof body.baseLng !== "number") {
      validationErrors.push("Location is required (GPS)");
    }

    if (!body.city?.trim()) validationErrors.push("City is required");
    if (!body.state?.trim()) validationErrors.push("State is required");

    if (!Array.isArray(body.serviceAreas) || body.serviceAreas.length === 0) {
      validationErrors.push("At least one service area is required");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // ------------------------------
    // Update User Profile
    // ------------------------------

    await prisma.user.update({
      where: { id: userId },
      data: {
        baseLat: body.baseLat,
        baseLng: body.baseLng,
        city: body.city.trim(),
        state: body.state.trim(),
        serviceRadius: Math.min(Math.max(body.serviceRadius, 1), 100),
        vehicleType: body.vehicleType,
        maxTasksPerDay: Math.min(Math.max(body.maxTasksPerDay, 1), 50),
        isProfileComplete: true,
      },
    });

    // ------------------------------
    // Update service areas
    // ------------------------------

    // Delete old service areas
    await prisma.authorityServiceArea.deleteMany({
      where: { authorityId: userId },
    });

    // Create new ones
    const formattedAreas = body.serviceAreas.map((area) => ({
      authorityId: userId,
      city: area.city.trim(),
      state: area.state.trim(),
      locality: area.locality.trim(),
      priority: area.priority && (area.priority === 2 ? 2 : 1),
    }));

    await prisma.authorityServiceArea.createMany({
      data: formattedAreas,
    });

    // ------------------------------
    // Return updated profile
    // ------------------------------

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        baseLat: true,
        baseLng: true,
        serviceRadius: true,
        vehicleType: true,
        maxTasksPerDay: true,
        city: true,
        state: true,
        isProfileComplete: true,

        serviceAreas: {
          select: {
            id: true,
            city: true,
            state: true,
            locality: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { priority: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: { profile },
    });
  } catch (err) {
    console.error("PUT /authority/profile error:", err);
    return NextResponse.json(
      { success: false, error: "Server error updating profile" },
      { status: 500 }
    );
  }
}
