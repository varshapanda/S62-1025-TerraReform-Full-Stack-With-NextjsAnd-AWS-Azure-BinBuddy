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
    "/api/auth/verify-email", // ADDED: Email verification should be public
    "/api/leaderboard",
    "/api/leaderboard/community",
    "/api/leaderboard/user",
  ];

  // API routes that ALL authenticated users can access (no role check)
  const commonAuthApiPaths = ["/api/auth/me", "/api/user/profile"];

  // Auth pages that authenticated users shouldn't access
  const authPages = ["/login", "/signup", "/"];

  // Protected pages that require authentication
  const protectedPages = [
    "/dashboard",
    "/dashboard/user/report",
    "/dashboard/volunteer",
    "/dashboard/volunteer/verify",
    "/dashboard/volunteer/history",
  ];

  // Check authentication status
  const { success, user } = verifyToken(req);

  // === PAGE REDIRECTS ===

  // Redirect authenticated users away from login/signup pages to their role-based dashboard
  if (authPages.includes(pathname) && success && user) {
    const dashboardPath = getDashboardPath(user.role);
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  // Redirect unauthenticated users from protected pages to login
  if (protectedPages.some((path) => pathname.startsWith(path)) && !success) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect to role-based dashboard from generic /dashboard
  if (pathname === "/dashboard" && success && user) {
    const dashboardPath = getDashboardPath(user.role);
    if (dashboardPath !== "/dashboard") {
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    }
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
    "/",
  ],
};
