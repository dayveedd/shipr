import { NextResponse } from "next/server";
import { MOCK_SETTLEMENT_SUMMARY } from "@/services/mockData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  const { sprintId } = await params;

  return NextResponse.json({
    success: true,
    message: "Settlement calculated",
    data: {
      ...MOCK_SETTLEMENT_SUMMARY,
      sprintId,
    },
  });
}
