import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { handleError } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    // Verify token using utility function
    const { success, user, error } = verifyToken(req);

    if (!success) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Protected data accessed successfully",
      user: {
        id: user!.id,
        email: user!.email,
        role: user!.role,
      },
    });
  } catch (error) {
    return handleError(error, "GET /api/user");
  }
}
