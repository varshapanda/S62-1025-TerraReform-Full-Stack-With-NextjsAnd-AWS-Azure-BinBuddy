// src/app/api/authority/optimize-route/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define TypeScript interfaces for type safety
interface Location {
  lat: number;
  lng: number;
}

interface ReportData {
  id: string;
  address: string | null;
  lat: number;
  lng: number;
  category: string;
  priority: number;
}

interface TaskWithReport {
  id: string;
  assignedToId: string | null;
  status: string;
  priority: string;
  report: ReportData;
}

interface RouteLocation {
  id: string;
  lat: number;
  lng: number;
  address: string | null;
  category: string;
  priority: string;
  task: TaskWithReport;
}

interface OptimizedRouteStop {
  id: string;
  lat: number;
  lng: number;
  address: string | null;
  category: string;
  priority: string;
  distanceFromPrevious: number;
  estimatedCollectionTime: number;
  task: TaskWithReport;
}

interface RouteStatistics {
  totalDistance: number;
  travelTime: number;
  collectionTime: number;
  totalTime: number;
  totalStops: number;
}

interface OptimizeRouteRequestBody {
  taskIds: string[];
  startLocation?: Location;
  optimizeFor: "distance" | "time";
}

interface OptimizeRouteResponse {
  optimizedRoute: OptimizedRouteStop[];
  routeStats: RouteStatistics;
  totalTasks: number;
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body: OptimizeRouteRequestBody = await req.json();

    const {
      taskIds = [],
      startLocation,
      optimizeFor = "distance", // 'distance' or 'time'
    } = body;

    // Authentication check
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate task IDs
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No task IDs provided" },
        { status: 400 }
      );
    }

    // Fetch tasks with their location data
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        assignedToId: userId,
        status: { in: ["ASSIGNED", "SCHEDULED"] },
      },
      include: {
        report: {
          select: {
            id: true,
            address: true,
            lat: true,
            lng: true,
            category: true,
            priority: true,
          },
        },
      },
    });

    if (tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid tasks found for optimization" },
        { status: 404 }
      );
    }

    // Get authority's base location
    const authority = await prisma.user.findUnique({
      where: { id: userId },
      select: { baseLat: true, baseLng: true },
    });

    // Determine starting point
    const startLat = startLocation?.lat || authority?.baseLat;
    const startLng = startLocation?.lng || authority?.baseLng;

    // Validate starting coordinates
    if (!startLat || !startLng) {
      return NextResponse.json(
        { success: false, error: "Starting location is required" },
        { status: 400 }
      );
    }

    // Execute route optimization algorithm
    const optimizedRoute = optimizeRoute(
      tasks,
      startLat,
      startLng,
      optimizeFor
    );

    // Calculate route statistics
    const routeStats = calculateRouteStats(optimizedRoute);

    // Prepare success response
    const response: OptimizeRouteResponse = {
      optimizedRoute,
      routeStats,
      totalTasks: tasks.length,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Optimize route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Route optimization using nearest-neighbor algorithm
 * @param tasks - Array of tasks with location data
 * @param startLat - Starting latitude
 * @param startLng - Starting longitude
 * @param optimizeFor - Optimization criteria ('distance' or 'time')
 * @returns Array of optimized route stops
 */
function optimizeRoute(
  tasks: TaskWithReport[],
  startLat: number,
  startLng: number,
  optimizeFor: "distance" | "time"
): OptimizedRouteStop[] {
  // Transform tasks into location objects
  const locations: RouteLocation[] = tasks.map((task) => ({
    id: task.id,
    lat: task.report.lat,
    lng: task.report.lng,
    address: task.report.address,
    category: task.report.category,
    priority: task.priority,
    task: task,
  }));

  const optimizedRoute: OptimizedRouteStop[] = [];
  const visitedTaskIds = new Set<string>();
  let currentLat = startLat;
  let currentLng = startLng;

  // Continue until all locations are visited
  while (optimizedRoute.length < locations.length) {
    let nextLocation: RouteLocation | null = null;
    let minDistance = Infinity;
    let minTime = Infinity;

    // Find the next best location
    for (const location of locations) {
      // Skip already visited locations
      if (visitedTaskIds.has(location.id)) continue;

      // Calculate distance from current position
      const distance = calculateDistance(
        currentLat,
        currentLng,
        location.lat,
        location.lng
      );

      // Estimate collection time for this task
      const collectionTime = estimateCollectionTime(
        location.category,
        location.priority
      );

      // Select based on optimization criteria
      if (optimizeFor === "distance" && distance < minDistance) {
        minDistance = distance;
        nextLocation = location;
      } else if (optimizeFor === "time" && collectionTime < minTime) {
        minTime = collectionTime;
        nextLocation = location;
      }
    }

    // If a location was found, add it to the optimized route
    if (nextLocation) {
      const distanceFromPrevious = calculateDistance(
        currentLat,
        currentLng,
        nextLocation.lat,
        nextLocation.lng
      );

      const estimatedCollectionTime = estimateCollectionTime(
        nextLocation.category,
        nextLocation.priority
      );

      optimizedRoute.push({
        ...nextLocation,
        distanceFromPrevious,
        estimatedCollectionTime,
      });

      // Update tracking variables
      visitedTaskIds.add(nextLocation.id);
      currentLat = nextLocation.lat;
      currentLng = nextLocation.lng;
    } else {
      // No more locations to visit
      break;
    }
  }

  return optimizedRoute;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Starting latitude
 * @param lon1 - Starting longitude
 * @param lat2 - Target latitude
 * @param lon2 - Target longitude
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_KM = 6371;

  // Convert degrees to radians
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Estimate collection time based on waste category and priority
 * @param category - Waste category
 * @param priority - Task priority level
 * @returns Estimated collection time in minutes
 */
function estimateCollectionTime(category: string, priority: string): number {
  // Base collection time in minutes
  const BASE_COLLECTION_TIME = 15;

  let additionalTime = 0;

  // Adjust time based on waste category complexity
  const categoryLower = category.toLowerCase();
  if (
    categoryLower.includes("hazardous") ||
    categoryLower.includes("medical")
  ) {
    additionalTime += 10; // Extra safety precautions needed
  }

  if (
    categoryLower.includes("construction") ||
    categoryLower.includes("bulk")
  ) {
    additionalTime += 20; // Larger/heavier waste requires more time
  }

  // Adjust time based on priority
  if (priority === "URGENT") {
    additionalTime += 5; // Extra care and speed for urgent tasks
  }

  return BASE_COLLECTION_TIME + additionalTime;
}

/**
 * Calculate comprehensive statistics for the optimized route
 * @param route - Array of route stops
 * @returns Route statistics including distance and time estimates
 */
function calculateRouteStats(route: OptimizedRouteStop[]): RouteStatistics {
  let totalDistance = 0;
  let totalCollectionTime = 0;

  // Calculate cumulative distance and collection time
  route.forEach((stop, index) => {
    if (index > 0) {
      totalDistance += stop.distanceFromPrevious;
    }
    totalCollectionTime += stop.estimatedCollectionTime;
  });

  // Estimate travel time (assuming 40 km/h average speed)
  const AVERAGE_SPEED_KMPH = 40;
  const travelTime = (totalDistance / AVERAGE_SPEED_KMPH) * 60; // Convert hours to minutes

  // Round values appropriately
  const roundedDistance = Math.round(totalDistance * 100) / 100; // 2 decimal places
  const roundedTravelTime = Math.round(travelTime);
  const roundedTotalTime = Math.round(travelTime + totalCollectionTime);

  return {
    totalDistance: roundedDistance,
    travelTime: roundedTravelTime,
    collectionTime: totalCollectionTime,
    totalTime: roundedTotalTime,
    totalStops: route.length,
  };
}
