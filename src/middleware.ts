// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError } from "@/lib/responseHandler";

// Ensure middleware runs in Node.js (not Edge runtime)
export const runtime = "nodejs";

/**
 * Role-based access matrix defining which routes are accessible to which roles.
 */
const ROLE_PERMISSIONS: Record<string, RegExp[]> = {
  user: [/^\/api\/reports/, /^\/api\/tasks\/view/], // users can report or view tasks
  volunteer: [/^\/api\/reports\/.*\/verify/, /^\/api\/reports\/pending/],
  authority: [/^\/api\/tasks/, /^\/api\/reports\/verified/],
  admin: [/^\/api\/admin/, /^\/api\/reports/, /^\/api\/tasks/, /^\/api\/users/],
};

/**
 * Global middleware for JWT validation + Role-Based Access Control
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //  Step 1: Public routes (no authentication needed)
  const publicPaths = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
    "/api/auth/refresh",
  ];
  if (publicPaths.includes(pathname)) return NextResponse.next();

  //  Step 2: Protect all /api routes
  if (pathname.startsWith("/api/")) {
    const { success, user, error, errorType } = verifyToken(req);

    // Token missing or invalid
    if (!success || !user) {
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

    // ✅ Step 3: Check if user's role has access to the requested path
    const allowedPatterns = ROLE_PERMISSIONS[user.role.toLowerCase()] || [];
    const hasAccess = allowedPatterns.some((pattern) => pattern.test(pathname));

    if (!hasAccess && user.role.toLowerCase() !== "admin") {
      console.log(` Access denied: ${user.role} tried to access ${pathname}`);
      return sendError(
        "Access denied: insufficient permissions",
        ERROR_CODES.AUTH_ERROR,
        403,
        { role: user.role, path: pathname }
      );
    }

    //  Step 4: Attach user data to headers for downstream handlers
    const newHeaders = new Headers(req.headers);
    newHeaders.set("x-user-id", String(user.id));
    newHeaders.set("x-user-email", user.email);
    newHeaders.set("x-user-role", user.role);

    return NextResponse.next({ request: { headers: newHeaders } });
  }

  //  Step 5: Skip for non-API routes (frontend pages)
  return NextResponse.next();
}

/**
 * Apply middleware only to API routes
 */
export const config = {
  matcher: ["/api/:path*"],
};
