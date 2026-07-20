import { NextResponse } from "next/server";
import { MOCK_LEADERBOARD } from "@/services/mockData";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Leaderboard retrieved successfully",
    data: MOCK_LEADERBOARD,
  });
}
