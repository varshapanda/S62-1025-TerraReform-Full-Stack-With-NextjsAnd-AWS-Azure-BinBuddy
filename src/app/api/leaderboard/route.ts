import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    userPoints: 120,
    topCommunity: {
      name: "Kakkanad Community",
      contributions: 540,
    },
    leaderboard: [
      { rank: 1, name: "Paul Koshy", points: 120 },
      { rank: 2, name: "Akshay Varma", points: 110 },
      { rank: 3, name: "Neha Joseph", points: 100 },
    ],
  };

  return NextResponse.json(data);
}
