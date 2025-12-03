import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export function verifyToken(req: NextRequest): {
  success: boolean;
  user?: DecodedToken;
  error?: string;
  errorType?: "expired" | "invalid" | "missing";
} {
  // Try accessToken first
  let token = req.cookies.get("accessToken")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    token = authHeader?.split(" ")[1];
  }

  if (!token) {
    return {
      success: false,
      error: "Token missing",
      errorType: "missing",
    };
  }

  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Verify this is an access token
    if (decoded.type !== "access") {
      return {
        success: false,
        error: "Invalid token type. Use access token for API requests.",
        errorType: "invalid",
      };
    }

    return { success: true, user: decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Access token expired:", error.message);
      return {
        success: false,
        error: "Access token expired. Please refresh your token.",
        errorType: "expired",
      };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.error("Token verification error:", error.message);
      return {
        success: false,
        error: "Invalid token",
        errorType: "invalid",
      };
    }

    console.error("Unexpected token verification error:", error);
    return {
      success: false,
      error: "Token verification failed",
      errorType: "invalid",
    };
  }
}

// NEW: Enhanced token verification with database check and retry logic
export async function verifyTokenWithDB(req: NextRequest): Promise<{
  success: boolean;
  user?: DecodedToken;
  error?: string;
  errorType?: "expired" | "invalid" | "missing";
}> {
  // First verify JWT
  const jwtVerification = verifyToken(req);

  if (!jwtVerification.success || !jwtVerification.user) {
    return jwtVerification;
  }

  // Try to verify user exists in database with retry logic
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      await prisma.$connect();

      const user = await prisma.user.findUnique({
        where: { id: jwtVerification.user.id },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return {
          success: false,
          error: "User not found",
          errorType: "invalid",
        };
      }

      // Return updated user data from DB
      return {
        success: true,
        user: {
          ...jwtVerification.user,
          role: user.role,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (dbError: any) {
      attempts++;
      console.error(
        `[Auth] DB check attempt ${attempts} failed:`,
        dbError.message
      );

      const isConnectionError =
        dbError.message?.includes("Closed") ||
        dbError.message?.includes("Connection") ||
        dbError.code === "P1001";

      if (isConnectionError && attempts < maxAttempts) {
        console.log(
          `[Auth] Retrying DB connection (${attempts}/${maxAttempts})...`
        );
        await prisma.$disconnect();
        await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
        continue;
      }

      // If max attempts reached or non-connection error, fallback to JWT claims
      console.warn(
        "[Auth] DB verification failed, falling back to JWT claims:",
        dbError.message
      );

      // Trust JWT if it's valid and not expired
      if (
        jwtVerification.user.exp &&
        jwtVerification.user.exp > Date.now() / 1000
      ) {
        return jwtVerification;
      }

      return {
        success: false,
        error: "Database verification failed",
        errorType: "invalid",
      };
    }
  }

  // Fallback to JWT if all retries failed
  return jwtVerification;
}
