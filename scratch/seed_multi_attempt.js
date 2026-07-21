import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://igurvpxbklmodzewzvsd.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_y8k4GYNuVECnXOkH9ZknFA_EbFGWwhw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const sprintId = "spr_react_01";
  const subId = "00000000-0000-0000-0000-000000000001";
  const userId = "00000000-0000-0000-0000-000000000000";

  const attemptsHistory = [
    {
      version: 1,
      githubRepoUrl: "https://github.com/torvalds/linux",
      deploymentUrl: "https://invalid-demo-app.vercel.app",
      submittedAt: new Date(Date.now() - 7200000).toISOString(),
      evaluationResult: { result: "FAIL", overallScore: 20 },
      stage: "SUBMISSION_FAILED",
    },
    {
      version: 2,
      githubRepoUrl: "https://github.com/facebook/react",
      deploymentUrl: "https://invalid-demo-app.vercel.app",
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      evaluationResult: { result: "FAIL", overallScore: 40 },
      stage: "SUBMISSION_FAILED",
    }
  ];

  const evalResult = {
    id: "eval_passed_v3",
    submissionId: subId,
    sprintId,
    evaluatedAt: new Date().toISOString(),
    result: "PASS",
    overallScore: 98,
    antiCheatFlags: [],
    dodResults: [
      { ruleId: "dod_repo", ruleName: "Source Code Repository", status: "PASS", message: "Valid React codebase verified." },
      { ruleId: "dod_live", ruleName: "Live Deployment Endpoint", status: "PASS", message: "Live production URL verified." }
    ],
    browserTestSummary: { passed: true, overallScore: 98 },
    confidenceScore: 99
  };

  const payload = {
    id: subId,
    sprint_id: sprintId,
    user_id: userId,
    github_repo_url: "https://github.com/facebook/react",
    deployment_url: "https://react.dev",
    notes: JSON.stringify({ attemptsHistory, evaluationResult: evalResult, version: 3 }),
    stage: "PAYMENT_SUCCESSFUL",
    submitted_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("submissions")
    .upsert(payload)
    .select();

  if (error) {
    console.error("Error upserting to Supabase:", error.message);
  } else {
    console.log("SUCCESSFULLY WRITTEN V3 PASSED SUBMISSION TO SUPABASE!", data);
  }
}

main();
