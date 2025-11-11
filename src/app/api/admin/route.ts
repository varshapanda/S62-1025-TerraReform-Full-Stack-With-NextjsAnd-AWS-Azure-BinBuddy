import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "User route accessible to all authenticated users.",
  });
}
