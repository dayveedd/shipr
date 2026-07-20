import { NextResponse } from "next/server";
import { MOCK_SPRINTS } from "@/services/mockData";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Sprints retrieved successfully",
    data: MOCK_SPRINTS,
  });
}
