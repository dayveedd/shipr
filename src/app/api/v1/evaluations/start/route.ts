import { NextResponse } from "next/server";
import { EvaluationSessionService } from "@/services/session/evaluation-session.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = EvaluationSessionService.startSession(body);

    return NextResponse.json({
      success: true,
      message: "Evaluation session created and pipeline launched",
      data: session,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to start evaluation session" },
      { status: 500 }
    );
  }
}
