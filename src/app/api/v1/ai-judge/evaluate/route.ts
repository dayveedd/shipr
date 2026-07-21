import { NextResponse } from "next/server";
import { EvaluationOrchestrator } from "@/services/orchestration/evaluation-orchestrator.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, sprintId, githubRepoUrl, deploymentUrl, notes } = body;

    const authHeader = request.headers.get("Authorization") || undefined;

    const data = await EvaluationOrchestrator.runPipeline({
      submissionId,
      sprintId,
      githubRepoUrl,
      deploymentUrl,
      notes,
      authHeader,
    });

    return NextResponse.json({
      success: true,
      message: "Evaluation orchestrator pipeline completed successfully",
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "AI evaluation orchestration pipeline failed" },
      { status: 500 }
    );
  }
}
