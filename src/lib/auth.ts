import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

interface DecodedToken {
  id: number;
  email: string;
  role: string;
  type: "access" | "refresh"; // Token type identification
  iat?: number;
  exp?: number; // Expiration for detailed error handling
}

export function verifyToken(req: NextRequest): {
  success: boolean;
  user?: DecodedToken;
  error?: string;
  errorType?: "expired" | "invalid" | "missing"; //Error type differentiation
} {
  // Try accessToken first (was "token")
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

    //Verify this is an access token, not refresh token
    if (decoded.type !== "access") {
      return {
        success: false,
        error: "Invalid token type. Use access token for API requests.",
        errorType: "invalid",
      };
    }

    return { success: true, user: decoded };
  } catch (error) {
    // Differentiate between expired and invalid tokens
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
