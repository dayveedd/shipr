import { NextResponse } from "next/server";
import { calculatePoolSettlement } from "@/lib/reputation";
import { MOCK_SPRINTS } from "@/services/mockData";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const { sprintId } = await params;

    const sprint =
      MOCK_SPRINTS.find((s) => s.id === sprintId || s.slug === sprintId) || MOCK_SPRINTS[0];

    // Simulated 20 participants (16 PASS, 4 FAIL) for Commitment Pool redistribution math
    const settlement = calculatePoolSettlement({
      sprintId: sprint.id,
      sprintTitle: sprint.title,
      commitmentNgn: sprint.commitmentNgn,
      totalParticipants: sprint.totalSlots || 20,
      passCount: 16,
      failCount: 4,
    });

    return NextResponse.json({
      success: true,
      message: "Settlement calculated successfully",
      data: settlement,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to calculate settlement" },
      { status: 500 }
    );
  }
}
