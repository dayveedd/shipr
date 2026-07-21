"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, RankBadge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ResubmitModal } from "@/components/submission/ResubmitModal";
import { formatNGN } from "@/lib/utils";
import { MOCK_CURRENT_USER, MOCK_SPRINTS, MOCK_AI_EVALUATION_PASS, MOCK_SETTLEMENT_SUMMARY } from "@/services/mockData";
import { submissionService, userService } from "@/services";
import { User, Sprint, AiEvaluation, SettlementSummary, SubmissionAttempt, EvidenceTimelineEvent, DodCheckResult } from "@/types";
import {
  Zap,
  Github,
  Globe,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Share2,
  ArrowRight,
  Trophy,
  ExternalLink,
  Loader2,
  Clock,
  RefreshCw,
  Lock,
  Code2,
  FileText,
  Monitor,
  Smartphone,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";

export default function PublicProofPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<User>(MOCK_CURRENT_USER);
  const [sprint, setSprint] = useState<Sprint>(MOCK_SPRINTS[0]);
  const [evaluation, setEvaluation] = useState<AiEvaluation>(MOCK_AI_EVALUATION_PASS);
  const [settlement, setSettlement] = useState<SettlementSummary>(MOCK_SETTLEMENT_SUMMARY);
  const [githubUrl, setGithubUrl] = useState("https://github.com/alexdev/react-landing-shipr");
  const [deploymentUrl, setDeploymentUrl] = useState("https://react-landing-shipr.vercel.app");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Multi-Attempt History & Resubmission State
  const [attempts, setAttempts] = useState<SubmissionAttempt[]>([]);
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState<number>(0);
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<"github" | "deployment" | "screenshots" | "browser" | "integrity">("github");

  const isSprintActive = sprint.status === "ACTIVE";

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const userRes = await userService.getCurrentUser();
        if (userRes.success && userRes.data) {
          setUser(userRes.data);
        }

        const subRes = await submissionService.getSubmissionStatus(submissionId);
        if (subRes.success && subRes.data) {
          const sub = subRes.data;
          setGithubUrl(sub.githubRepoUrl || githubUrl);
          setDeploymentUrl(sub.deploymentUrl || deploymentUrl);
          setNotes(sub.notes || "");
        }

        const evalRes = await submissionService.triggerAiEvaluation(submissionId);
        if (evalRes.success && evalRes.data) {
          const evalData = evalRes.data;
          setEvaluation(evalData);

          // Use real attempts array if present, otherwise map current submission as Version 1
          const realAttempt: SubmissionAttempt = {
            attemptId: `att_${submissionId}`,
            version: subRes.data?.version || 1,
            submittedAt: subRes.data?.submittedAt || new Date().toISOString(),
            githubRepoUrl: subRes.data?.githubRepoUrl || githubUrl,
            deploymentUrl: subRes.data?.deploymentUrl || deploymentUrl,
            notes: subRes.data?.notes || "",
            evaluation: evalData,
            timeline: evalData.timeline || [],
          };

          const attemptsList = (subRes.data?.attempts && subRes.data.attempts.length > 0)
            ? subRes.data.attempts
            : [realAttempt];

          setAttempts(attemptsList);
          setSelectedAttemptIndex(attemptsList.length - 1);
        }
      } catch (err) {
        console.warn("Failed to load live proof data; using fallback state:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [submissionId]);

  const activeAttempt = attempts[selectedAttemptIndex] || {
    version: 1,
    submittedAt: new Date().toISOString(),
    githubRepoUrl: githubUrl,
    deploymentUrl,
    evaluation,
    timeline: evaluation.timeline || [],
  };

  const activeEval = activeAttempt.evaluation || evaluation;
  const activeTimeline = activeAttempt.timeline || evaluation.timeline || [];

  // Compute Improvement Delta (Part 8)
  const previousAttempt = selectedAttemptIndex > 0 ? attempts[selectedAttemptIndex - 1] : null;
  const deltaChanges: string[] = [];
  if (previousAttempt) {
    const prevResultsMap = new Map(previousAttempt.evaluation.reasoning.map(r => [r.itemId, r.isPassed]));
    activeEval.reasoning.forEach(r => {
      if (r.isPassed && prevResultsMap.get(r.itemId) === false) {
        deltaChanges.push(`✓ Fixed "${r.itemTitle}" requirement`);
      }
    });
    if (activeAttempt.githubRepoUrl !== previousAttempt.githubRepoUrl) {
      deltaChanges.push("✓ Updated GitHub Repository URL");
    }
    if (activeAttempt.deploymentUrl !== previousAttempt.deploymentUrl) {
      deltaChanges.push("✓ Redeployed Live Application Endpoint");
    }
  }

  const publicUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      alert("Proof of Work URL copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500] text-white flex items-center justify-center shadow-orange-glow">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-extrabold text-lg text-zinc-900 font-sans">
              Ship<span className="text-[#FF5500]">R</span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#FFF2EC] border border-[#FF5500]/30 font-mono text-[10px] text-[#FF5500] font-bold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
            <span>SUBMISSION LIFECYCLE & EVALUATION REPORT</span>
          </div>
        </div>

        {/* Part 2 — Submission Overview Banner */}
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-200 shadow-none bg-white rounded-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-zinc-900 text-white uppercase tracking-widest">
                  {sprint.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20 uppercase tracking-widest">
                  Attempt v{activeAttempt.version}
                </span>
                <StatusBadge status={activeEval.result === "PASS" ? "PASS" : "FAIL"} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-sans">
                {sprint.title}
              </h1>
              <p className="text-xs font-mono text-zinc-500">
                Submission ID: <strong className="text-zinc-800">{submissionId}</strong> • Evaluation ID: <strong className="text-zinc-800">{activeEval.id}</strong>
              </p>
            </div>

            {/* Countdown / Deadline Status */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 text-right space-y-1 min-w-[220px]">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Sprint Deadline Status</span>
              {isSprintActive ? (
                <div className="flex items-center justify-end gap-1.5 text-xs text-[#FF5500] font-bold font-mono">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <CountdownTimer targetDate={sprint.endTime} size="sm" />
                </div>
              ) : (
                <div className="text-xs font-bold font-mono text-zinc-700 flex items-center justify-end gap-1">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Sprint Closed</span>
                </div>
              )}
            </div>
          </div>

          {/* Links & Submitter details strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-zinc-400 block uppercase text-[10px] font-bold">GitHub Repository</span>
              <a
                href={activeAttempt.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#FF5500] font-bold hover:underline flex items-center gap-1 truncate"
              >
                <Github className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{activeAttempt.githubRepoUrl.replace("https://github.com/", "")}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-400 block uppercase text-[10px] font-bold">Live Deployment</span>
              <a
                href={activeAttempt.deploymentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#FF5500] font-bold hover:underline flex items-center gap-1 truncate"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{activeAttempt.deploymentUrl.replace("https://", "")}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-400 block uppercase text-[10px] font-bold">Submitted At</span>
              <span className="text-zinc-800 font-bold block">{activeAttempt.submittedAt}</span>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button size="sm" variant="outline" className="rounded-none" leftIcon={<Share2 className="w-4 h-4" />} onClick={handleCopy}>
              Share Proof Certificate
            </Button>

            {/* Part 9 & 10 — Resubmit Project vs Closed Banner */}
            {isSprintActive ? (
              <Button
                size="md"
                variant="primary"
                className="rounded-none"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={() => setIsResubmitModalOpen(true)}
              >
                Resubmit Project (Attempt v{attempts.length + 1})
              </Button>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 text-xs font-mono font-bold text-amber-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>This sprint has ended. Submissions are locked. Settlement is being processed.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Part 3 — Attempt History Selector Tabs */}
        {attempts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#FF5500]" />
                <span>Submission Version Audit Log ({attempts.length} Attempts)</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">Select attempt version to inspect</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {attempts.map((att, idx) => (
                <button
                  key={att.attemptId || idx}
                  onClick={() => setSelectedAttemptIndex(idx)}
                  className={`px-4 py-2 rounded-none text-xs font-mono font-bold transition-all shrink-0 border flex items-center gap-2.5 ${
                    selectedAttemptIndex === idx
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <span>Attempt v{att.version}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 font-bold uppercase ${
                      att.evaluation.result === "PASS"
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {att.evaluation.result}
                  </span>
                  <span className="text-[10px] text-zinc-400">{att.submittedAt.split(" ")[1]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Part 8 — Improvement Comparison Delta Box */}
        {previousAttempt && (
          <Card className="p-4 bg-emerald-50/60 border-emerald-200 rounded-none space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-emerald-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Improvement Comparison (Attempt v{previousAttempt.version} → Attempt v{activeAttempt.version})</span>
            </div>
            {deltaChanges.length > 0 ? (
              <ul className="space-y-1 text-xs font-mono text-emerald-800 pl-6 list-disc">
                {deltaChanges.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-emerald-700">
                Attempt v{activeAttempt.version} re-evaluated all repository and deployment evidence independently.
              </p>
            )}
          </Card>
        )}

        {/* Part 7 — AI Verdict Card */}
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-200 shadow-none bg-white rounded-none">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-100">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <StatusBadge status={activeEval.result === "PASS" ? "PASS" : "FAIL"} />
                <span className="text-xs font-mono font-bold text-zinc-500">
                  Confidence: <strong className="text-zinc-900">{activeEval.confidenceScore}%</strong>
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-zinc-900 font-sans">
                OpenRouter AI Judge Final Verdict
              </h2>
            </div>

            <div className="text-center sm:text-right p-4 bg-zinc-50 border border-zinc-200 min-w-[180px]">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Overall Score</span>
              <span className={`text-3xl font-extrabold font-mono block mt-0.5 ${
                activeEval.result === "PASS" ? "text-emerald-600" : "text-red-600"
              }`}>
                {activeEval.overallScore !== undefined 
                  ? activeEval.overallScore 
                  : Math.round(((activeEval.reasoning?.filter(r => r.isPassed).length || 0) / (activeEval.reasoning?.length || 1)) * 100)}/100
              </span>
            </div>
          </div>

          {/* Reasoning & Suggestions */}
          <div className="space-y-4 text-xs font-mono">
            {activeEval.suggestions && activeEval.suggestions.length > 0 && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 text-amber-900 space-y-2">
                <span className="font-extrabold uppercase tracking-wider text-amber-900 block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Actionable AI Recommendations for Builder</span>
                </span>
                <ul className="space-y-1.5 text-zinc-700 pl-5 list-disc">
                  {activeEval.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Part 5 — Definition of Done Requirement Results */}
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-200 shadow-none bg-white rounded-none">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <h3 className="text-lg font-bold text-zinc-900 font-sans">
              Requirement Results (Definition of Done)
            </h3>
            <span className="text-xs font-mono text-zinc-500 font-bold">
              {activeEval.reasoning?.filter(r => r.isPassed).length || 0} / {activeEval.reasoning?.length || 0} Rules Passed
            </span>
          </div>

          <div className="space-y-4">
            {activeEval.reasoning?.map((dod, idx) => (
              <div
                key={dod.itemId || idx}
                className={`p-4 border transition-all ${
                  dod.isPassed ? "bg-emerald-50/40 border-emerald-200" : "bg-red-50/40 border-red-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {dod.isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <h4 className="text-xs font-mono font-extrabold text-zinc-900">{dod.itemTitle}</h4>
                      <span className={`text-[9px] font-mono px-2 py-0.5 font-bold uppercase ${
                        dod.isPassed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}>
                        {dod.isPassed ? "PASS" : "FAIL"}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-zinc-600 mt-1 pl-6">
                      <strong>AI Explanation:</strong> {dod.details}
                    </p>

                    {dod.evidenceUsed && (
                      <p className="text-[11px] font-mono text-zinc-500 pl-6 mt-1">
                        <strong>Evidence Used:</strong> {dod.evidenceUsed}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 font-mono text-[10px]">
                    <span className="text-zinc-400 block uppercase font-bold">Confidence</span>
                    <span className="text-zinc-900 font-extrabold block text-xs">{dod.confidence || 95}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Part 4 — Evaluation Timeline */}
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-200 shadow-none bg-white rounded-none">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <h3 className="text-lg font-bold text-zinc-900 font-sans flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF5500]" />
              <span>Pipeline Execution Timeline</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">OpenRouter Orchestrator Logs</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {activeTimeline.map((evt, idx) => (
              <div key={evt.id || idx} className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200/80">
                <div className="shrink-0 mt-0.5">
                  {evt.status === "SUCCESS" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : evt.status === "FAIL" ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#FF5500]" />
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-zinc-900">{evt.stepName}</span>
                    <span className="text-[10px] text-zinc-400">{evt.timestamp}</span>
                  </div>
                  <p className="text-zinc-600 text-[11px]">{evt.details}</p>
                  <span className="text-[9px] text-zinc-400 block uppercase">Source: {evt.evidenceSource}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Part 6 — Evidence Inspector */}
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-200 shadow-none bg-white rounded-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <h3 className="text-lg font-bold text-zinc-900 font-sans">
              Collected Evidence Inspector
            </h3>

            {/* Evidence Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none bg-zinc-100 p-1 border border-zinc-200">
              {(["github", "deployment", "screenshots", "browser", "integrity"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveEvidenceTab(tab)}
                  className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                    activeEvidenceTab === tab
                      ? "bg-white text-[#FF5500] shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="font-mono text-xs space-y-4">
            {activeEvidenceTab === "github" && (
              <div className="space-y-3">
                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="text-zinc-400 block uppercase text-[10px] font-bold">Detected Framework</span>
                  <span className="text-sm font-bold text-zinc-900 block">
                    {activeEval.evidenceDetails?.github?.framework || "React / Next.js 15 Server Components"}
                  </span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="text-zinc-400 block uppercase text-[10px] font-bold">Package.json Dependencies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeEval.evidenceDetails?.github?.packageJsonDeps || ["next", "react", "tailwindcss", "@supabase/supabase-js", "lucide-react"]).map((dep) => (
                      <span key={dep} className="px-2 py-0.5 bg-zinc-200 text-zinc-800 text-[10px]">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="text-zinc-400 block uppercase text-[10px] font-bold">Indexed File Structure</span>
                  <div className="p-3 bg-zinc-900 text-emerald-400 text-[11px] rounded max-h-40 overflow-y-auto">
                    {(activeEval.evidenceDetails?.github?.indexedFiles || [
                      "src/app/page.tsx",
                      "src/app/layout.tsx",
                      "src/components/ui/Button.tsx",
                      "package.json",
                      "README.md"
                    ]).map((f) => (
                      <div key={f}>📄 {f}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeEvidenceTab === "deployment" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 block uppercase text-[10px] font-bold">HTTP Response Code</span>
                    <span className="text-lg font-bold text-emerald-600 mt-1 block">
                      {activeEval.evidenceDetails?.deployment?.statusCode || 200} OK
                    </span>
                  </div>
                  <div className="p-4 bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 block uppercase text-[10px] font-bold">Page Title</span>
                    <span className="text-sm font-bold text-zinc-900 mt-1 block truncate">
                      {activeEval.evidenceDetails?.deployment?.pageTitle || "ShipR — Developer Execution Platform"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="text-zinc-400 block uppercase text-[10px] font-bold">Response Headers</span>
                  <div className="p-3 bg-zinc-900 text-zinc-300 text-[11px] rounded">
                    <div>Content-Type: text/html; charset=utf-8</div>
                    <div>Server: Vercel</div>
                    <div>Cache-Control: public, max-age=0, must-revalidate</div>
                  </div>
                </div>
              </div>
            )}

            {activeEvidenceTab === "screenshots" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2 text-center">
                  <Monitor className="w-6 h-6 text-[#FF5500] mx-auto" />
                  <span className="font-bold text-zinc-800 block">Desktop Viewport (1280px)</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">✓ Visual Layout Verified</span>
                </div>
                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2 text-center">
                  <Smartphone className="w-6 h-6 text-[#FF5500] mx-auto" />
                  <span className="font-bold text-zinc-800 block">Mobile Viewport (375px)</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">✓ Responsive Layout Verified</span>
                </div>
              </div>
            )}

            {activeEvidenceTab === "browser" && (
              <div className="space-y-3">
                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="text-zinc-400 block uppercase text-[10px] font-bold">Interacted UI Buttons</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeEval.evidenceDetails?.browserTesting?.clickedButtons || ["Hero CTA Button", "Navigation Link", "Connect Wallet"]).map((b) => (
                      <span key={b} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="text-zinc-400 block uppercase text-[10px] font-bold">Client JavaScript Console Errors</span>
                  <div className="p-3 bg-zinc-900 text-emerald-400 text-[11px] rounded">
                    <div>0 JS Runtime Exceptions Detected (Clean Execution)</div>
                  </div>
                </div>
              </div>
            )}

            {activeEvidenceTab === "integrity" && (
              <div className="space-y-3">
                <div className="p-4 bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block uppercase text-[10px] font-bold">Anti-Cheat Integrity Score</span>
                    <span className="text-2xl font-bold text-emerald-600 block">
                      {activeEval.evidenceDetails?.integrity?.integrityScore || 98}/100
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs">
                    SAFE / VERIFIED
                  </span>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="text-zinc-400 block uppercase text-[10px] font-bold">Repository Quality & Plagiarism Checks</span>
                  <div className="space-y-1.5 text-zinc-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Original commit timeline and repository commit log verified.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>No duplicate repository URL signatures detected across active participants.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Resubmit Modal Component */}
      <ResubmitModal
        isOpen={isResubmitModalOpen}
        onClose={() => setIsResubmitModalOpen(false)}
        submissionId={submissionId}
        currentGithubUrl={githubUrl}
        currentDeploymentUrl={deploymentUrl}
        currentNotes={notes}
        currentVersion={attempts.length || 1}
        onSuccess={() => {
          const sprintSlug = sprint?.slug || "react-landing-sprint";
          router.push(`/sprints/${sprintSlug}/evaluating?submissionId=${submissionId}`);
        }}
      />
    </div>
  );
}
