import { NextResponse } from "next/server";
import { MOCK_AI_EVALUATION_PASS } from "@/services/mockData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId } = body;

    // Simulate AI deep code inspection & live deployment DOM scraping delay
    await new Promise((res) => setTimeout(res, 1200));

    return NextResponse.json({
      success: true,
      message: "AI Judge evaluation completed",
      data: {
        ...MOCK_AI_EVALUATION_PASS,
        submissionId: submissionId || "sub_100",
        evaluatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "AI evaluation failed" },
      { status: 500 }
    );
  }
}
