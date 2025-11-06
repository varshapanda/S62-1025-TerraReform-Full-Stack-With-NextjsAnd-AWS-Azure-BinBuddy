// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

// Ensure middleware runs in Node.js (not Edge runtime)
export const runtime = "nodejs";

/**
 *  Middleware to protect API routes and handle role-based access.
 * This runs before every API request and validates JWT tokens.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //  Step 1: Define public routes that don’t need authentication
  const publicPaths = ["/api/auth/login", "/api/auth/signup"];
  if (publicPaths.includes(pathname)) {
    // Allow login/signup requests without checking token
    return NextResponse.next();
  }

  //  Step 2: Apply token check only for /api routes
  if (pathname.startsWith("/api/")) {
    // Verify the JWT token (from cookies or Authorization header)
    const { success, user, error } = verifyToken(req);

    //  If token is missing or invalid, block access
    if (!success || !user) {
      return NextResponse.json(
        {
          success: false,
          message: error || "Unauthorized access. Please log in.",
        },
        { status: 401 }
      );
    }

    //  Step 3: Role-based access control
    // Only users with role 'admin' can access /api/admin routes

    if (
      pathname.startsWith("/api/admin") &&
      user.role.toLowerCase() !== "admin"
    ) {
      console.log(" Access denied → non-admin tried to access admin route");
      return NextResponse.json(
        { success: false, message: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    //  Step 4: Attach user data to headers for downstream routes
    const newHeaders = new Headers(req.headers);
    newHeaders.set("x-user-id", String(user.id));
    newHeaders.set("x-user-email", user.email);
    newHeaders.set("x-user-role", user.role);

    // Allow the request to continue to the intended API route

    return NextResponse.next({ request: { headers: newHeaders } });
  }

  //  Step 5: Skip middleware for non-API routes (frontend pages, etc.)
  return NextResponse.next();
}

/**
 *  Configuration: This ensures middleware only runs for API routes.
 * Example: /api/auth/login, /api/admin, /api/users, etc.
 */
export const config = {
  matcher: ["/api/:path*"],
};
