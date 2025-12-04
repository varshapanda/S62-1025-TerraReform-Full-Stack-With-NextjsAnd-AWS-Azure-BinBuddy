import { NextResponse } from "next/server";

export async function GET() {
  // minimal/placeholder response — replace with real logic later
  return NextResponse.json({ ok: true, name: "community leaderboard" });
}
