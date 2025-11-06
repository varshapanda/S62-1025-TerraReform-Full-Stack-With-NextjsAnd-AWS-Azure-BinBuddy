import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

interface DecodedToken {
  id: number;
  email: string;
  role: string;
}

export function verifyToken(req: NextRequest): {
  success: boolean;
  user?: DecodedToken;
  error?: string;
} {
  // Try to get token from cookie first, then fall back to Authorization header
  let token = req.cookies.get("token")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    token = authHeader?.split(" ")[1];
  }

  if (!token) {
    return { success: false, error: "Token missing" };
  }

  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return { success: true, user: decoded };
  } catch (error) {
    console.error("Token verification error:", error);
    return { success: false, error: "Invalid or expired token" };
  }
}
