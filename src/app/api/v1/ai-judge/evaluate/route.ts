import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { EvaluationOrchestrator } from "@/services/orchestration/evaluation-orchestrator.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, sprintId, githubRepoUrl, deploymentUrl, notes } = body;

    const authHeader = request.headers.get("Authorization") || undefined;

    let activeSubmissionId = submissionId;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://igurvpxbklmodzewzvsd.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_y8k4GYNuVECnXOkH9ZknFA_EbFGWwhw";
    const dbServer = createClient(supabaseUrl, supabaseKey);

    if (!activeSubmissionId) {
      activeSubmissionId = `sub_${Date.now()}`;
      await dbServer.from("submissions").insert({
        id: activeSubmissionId,
        sprint_id: sprintId || "spr_react_01",
        user_id: "usr_demo",
        github_repo_url: githubRepoUrl,
        deployment_url: deploymentUrl,
        notes: notes || "",
        stage: "AI_REVIEW_IN_PROGRESS",
        version: 1,
        submitted_at: new Date().toISOString(),
      });
    } else {
      EvaluationOrchestrator.clearCache(activeSubmissionId);

      // Server-side database fetch & resubmission versioning sync
      const { data: currentSub } = await dbServer
        .from("submissions")
        .select("*")
        .eq("id", activeSubmissionId)
        .maybeSingle();

      if (currentSub && (githubRepoUrl || deploymentUrl)) {
        let attemptsArray: any[] = [];
        try {
          if (currentSub.notes) {
            const parsed = JSON.parse(currentSub.notes);
            if (Array.isArray(parsed?.attemptsHistory)) {
              attemptsArray = parsed.attemptsHistory;
            }
          }
        } catch (e) {
          attemptsArray = [];
        }

        // Push previous attempt if version matches
        const prevVersion = currentSub.version || 1;
        const exists = attemptsArray.some((a: any) => a.version === prevVersion);
        if (!exists) {
          attemptsArray.push({
            version: prevVersion,
            githubRepoUrl: currentSub.github_repo_url,
            deploymentUrl: currentSub.deployment_url,
            submittedAt: currentSub.submitted_at,
            evaluationResult: currentSub.evaluation_result,
            stage: currentSub.stage,
          });
        }

        const nextVersion = prevVersion + 1;
        const updatePayload: any = {
          evaluation_result: null,
          stage: "AI_REVIEW_IN_PROGRESS",
          version: nextVersion,
          submitted_at: new Date().toISOString(),
          notes: JSON.stringify({ attemptsHistory: attemptsArray }),
        };
        if (githubRepoUrl) updatePayload.github_repo_url = githubRepoUrl;
        if (deploymentUrl) updatePayload.deployment_url = deploymentUrl;

        await dbServer
          .from("submissions")
          .update(updatePayload)
          .eq("id", activeSubmissionId);
      }
    }

    const data = await EvaluationOrchestrator.runPipeline({
      submissionId: activeSubmissionId,
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
