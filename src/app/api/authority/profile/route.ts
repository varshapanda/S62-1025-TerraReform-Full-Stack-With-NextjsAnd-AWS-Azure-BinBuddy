// src/app/api/authority/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define the enum matching your Prisma schema
enum VehicleType {
  BIKE = "BIKE",
  AUTO = "AUTO",
  SMALL_TRUCK = "SMALL_TRUCK",
  TRUCK = "TRUCK",
  OTHER = "OTHER",
}

// Define TypeScript interfaces for type safety
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
  serviceRadius?: number;
  vehicleType?: VehicleType | null; // Use enum type
  maxTasksPerDay?: number;
  serviceAreas?: ServiceAreaInput[];
}

interface AuthorityProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  baseLat: number | null;
  baseLng: number | null;
  serviceRadius: number | null;
  vehicleType: VehicleType | null; // Use enum type
  maxTasksPerDay: number | null;
  tasksCompleted: number;
  completionRate: number;
  avgCompletionTime: number | null;
  isProfileComplete: boolean;
  city: string | null;
  state: string | null;
  serviceAreas: Array<{
    id: string;
    city: string;
    state: string;
    locality: string;
    priority: number;
    createdAt: Date;
  }>;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    // Authentication check
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user profile with service areas
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
        tasksCompleted: true,
        completionRate: true,
        avgCompletionTime: true,
        isProfileComplete: true,
        city: true,
        state: true,
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

    // Validate user exists and is an authority
    if (!user || user.role !== "authority") {
      return NextResponse.json(
        {
          success: false,
          error: "User not found or does not have authority privileges",
        },
        { status: 404 }
      );
    }

    // Return profile data
    return NextResponse.json({
      success: true,
      data: {
        profile: user as AuthorityProfileResponse,
      },
    });
  } catch (error) {
    console.error("Get authority profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while fetching profile",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    // Authentication check
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body: UpdateProfileRequest = await req.json();
    const {
      baseLat,
      baseLng,
      city,
      state,
      serviceRadius = 10,
      vehicleType,
      maxTasksPerDay = 10,
      serviceAreas = [],
    } = body;

    // Validate required fields
    const validationErrors: string[] = [];

    if (typeof baseLat !== "number" || baseLat < -90 || baseLat > 90) {
      validationErrors.push("Valid base latitude is required (-90 to 90)");
    }

    if (typeof baseLng !== "number" || baseLng < -180 || baseLng > 180) {
      validationErrors.push("Valid base longitude is required (-180 to 180)");
    }

    if (!city || typeof city !== "string" || city.trim().length === 0) {
      validationErrors.push("City is required");
    }

    if (!state || typeof state !== "string" || state.trim().length === 0) {
      validationErrors.push("State is required");
    }

    // Validate vehicleType if provided
    if (vehicleType !== undefined && vehicleType !== null) {
      const validVehicleTypes = Object.values(VehicleType);
      if (!validVehicleTypes.includes(vehicleType as VehicleType)) {
        validationErrors.push(
          `vehicleType must be one of: ${validVehicleTypes.join(", ")}`
        );
      }
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

    // Update user profile with validated data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        baseLat,
        baseLng,
        city: city.trim(),
        state: state.trim(),
        serviceRadius: Math.min(Math.max(serviceRadius, 1), 100), // Between 1-100km
        vehicleType: vehicleType || null, // Fixed: use the parameter, not the enum type
        maxTasksPerDay: Math.min(Math.max(maxTasksPerDay, 1), 50), // Between 1-50 tasks/day
        isProfileComplete: true,
      },
    });

    // Update service areas if provided
    if (Array.isArray(serviceAreas) && serviceAreas.length > 0) {
      // Validate service areas
      const validServiceAreas = serviceAreas.filter(
        (area): area is ServiceAreaInput =>
          typeof area.city === "string" &&
          area.city.trim().length > 0 &&
          typeof area.state === "string" &&
          area.state.trim().length > 0 &&
          typeof area.locality === "string" &&
          area.locality.trim().length > 0
      );

      if (validServiceAreas.length > 0) {
        // Delete existing service areas in a transaction
        await prisma.$transaction([
          prisma.authorityServiceArea.deleteMany({
            where: { authorityId: userId },
          }),
          ...validServiceAreas.map((area) =>
            prisma.authorityServiceArea.create({
              data: {
                authorityId: userId,
                city: area.city.trim(),
                state: area.state.trim(),
                locality: area.locality.trim(),
                priority: Math.min(Math.max(area.priority || 1, 1), 2), // Priority 1 or 2
              },
            })
          ),
        ]);
      }
    }

    // Fetch updated profile with service areas for response
    const completeProfile = await prisma.user.findUnique({
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
        tasksCompleted: true,
        completionRate: true,
        avgCompletionTime: true,
        isProfileComplete: true,
        city: true,
        state: true,
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
      data: {
        profile: completeProfile as AuthorityProfileResponse,
      },
    });
  } catch (error) {
    console.error("Update authority profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while updating profile",
      },
      { status: 500 }
    );
  }
}
