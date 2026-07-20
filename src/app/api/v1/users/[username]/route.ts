import { NextResponse } from "next/server";
import { MOCK_CURRENT_USER, MOCK_LEADERBOARD } from "@/services/mockData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const match = MOCK_LEADERBOARD.find(
    (e) => e.user.githubUsername.toLowerCase() === username.toLowerCase()
  );

  return NextResponse.json({
    success: true,
    message: "User profile retrieved",
    data: match ? match.user : MOCK_CURRENT_USER,
  });
}
