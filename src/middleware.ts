import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError } from "@/lib/responseHandler";

export const runtime = "nodejs";

const ROLE_PERMISSIONS: Record<string, RegExp[]> = {
  user: [
    /^\/api\/reports/, // Create/fetch reports
    /^\/api\/tasks\/view/, // View tasks
    /^\/api\/uploads\/presign/, // Upload images
    /^\/api\/user\/profile/, // View own profile
    /^\/api\/volunteer-request$/, // Create volunteer request
  ],
  volunteer: [
    /^\/api\/volunteer/,
    /^\/api\/reports\/.*\/verify/, // Verify reports
    /^\/api\/reports\/pending/, // View pending reports
    /^\/api\/uploads\/presign/, // Upload images
  ],
  authority: [
    /^\/api\/tasks/, // Manage tasks
    /^\/api\/reports\/verified/, // View verified reports
    /^\/api\/uploads\/presign/, // Upload images
  ],
  admin: [
    /^\/api\/admin/, // All admin routes
    /^\/api\/reports/, // All report routes
    /^\/api\/tasks/, // All task routes
    /^\/api\/users/, // All user routes
    /^\/api\/uploads/, // All upload routes
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public API routes (no authentication needed)
  const publicApiPaths = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
    "/api/auth/refresh",
    "/api/auth/verify-email",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/leaderboard",
    "/api/leaderboard/community",
    "/api/leaderboard/user",
  ];

  // API routes that ALL authenticated users can access (no role check)
  const commonAuthApiPaths = ["/api/auth/me", "/api/user/profile"];

  // Auth pages that authenticated users shouldn't access
  const authPages = [
    "/login",
    "/signup",
    "/",
    "/forgot-password",
    "/reset-password",
  ];

  // Check authentication status
  const { success, user } = verifyToken(req);

  // === PAGE REDIRECTS ===

  // Redirect authenticated users away from login/signup pages
  if (authPages.includes(pathname) && success && user) {
    const dashboardPath = getDashboardPath(user.role);
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  // === DASHBOARD ROLE-BASED ACCESS (SERVER-SIDE) ===
  if (pathname.startsWith("/dashboard")) {
    // Check if user is authenticated
    if (!success || !user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Map paths to required roles
    const roleRoutes: Record<string, string> = {
      "/dashboard/user": "user",
      "/dashboard/volunteer": "volunteer",
      "/dashboard/authority": "authority",
      "/dashboard/admin": "admin",
    };

    // Check if accessing a role-specific dashboard
    for (const [route, requiredRole] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        const userRole = user.role.toLowerCase();
        const required = requiredRole.toLowerCase();

        // If role doesn't match, redirect to correct dashboard
        if (userRole !== required) {
          const correctDashboard = getDashboardPath(user.role);
          console.log(
            `[MIDDLEWARE] Role mismatch: ${userRole} tried to access ${pathname}, redirecting to ${correctDashboard}`
          );
          return NextResponse.redirect(new URL(correctDashboard, req.url));
        }
        // Role matches, allow request
        break;
      }
    }

    // For generic /dashboard, redirect to role-specific dashboard
    if (pathname === "/dashboard") {
      const dashboardPath = getDashboardPath(user.role);
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    }

    // Allow the request to continue if authorized
    return NextResponse.next();
  }

  // === API ROUTES ===

  if (pathname.startsWith("/api/")) {
    // Allow public API routes
    if (publicApiPaths.includes(pathname)) {
      console.log(`Public API route accessed: ${pathname}`);
      return NextResponse.next();
    }

    // Require authentication for all other API routes
    if (!success || !user) {
      const { error, errorType } = verifyToken(req);
      console.log(`Unauthorized API access attempt: ${pathname}`);
      return sendError(
        error || "Unauthorized access. Please log in.",
        ERROR_CODES.AUTH_ERROR,
        401,
        {
          errorType,
          refreshUrl: errorType === "expired" ? "/api/auth/refresh" : undefined,
        }
      );
    }

    // Allow common authenticated API routes (no role check)
    if (commonAuthApiPaths.includes(pathname)) {
      const newHeaders = new Headers(req.headers);
      newHeaders.set("x-user-id", String(user.id));
      newHeaders.set("x-user-email", user.email);
      newHeaders.set("x-user-role", user.role);
      return NextResponse.next({ request: { headers: newHeaders } });
    }

    // Role-based access control for specific API routes
    const allowedPatterns = ROLE_PERMISSIONS[user.role.toLowerCase()] || [];
    const hasAccess = allowedPatterns.some((pattern) => pattern.test(pathname));

    // Admins have access to everything
    if (!hasAccess && user.role.toLowerCase() !== "admin") {
      console.log(`Access denied: ${user.role} tried to access ${pathname}`);
      return sendError(
        "Access denied: insufficient permissions",
        ERROR_CODES.AUTH_ERROR,
        403,
        { role: user.role, path: pathname }
      );
    }

    // Attach user data to headers for downstream handlers
    const newHeaders = new Headers(req.headers);
    newHeaders.set("x-user-id", String(user.id));
    newHeaders.set("x-user-email", user.email);
    newHeaders.set("x-user-role", user.role);

    return NextResponse.next({ request: { headers: newHeaders } });
  }

  return NextResponse.next();
}

// Helper function to get role-based dashboard path
function getDashboardPath(role: string): string {
  const roleMap: Record<string, string> = {
    user: "/dashboard/user",
    volunteer: "/dashboard/volunteer",
    authority: "/dashboard/authority",
    admin: "/dashboard/admin",
  };
  return roleMap[role.toLowerCase()] || "/dashboard/user";
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/dashboard",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/",
  ],
};
