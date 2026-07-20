import { NextResponse } from "next/server";
import { MOCK_CURRENT_USER } from "@/services/mockData";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Authenticated user retrieved",
    data: MOCK_CURRENT_USER,
  });
}
