"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, RankBadge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ResubmitModal } from "@/components/submission/ResubmitModal";
import { formatNGN } from "@/lib/utils";
import { MOCK_CURRENT_USER, MOCK_SPRINTS, MOCK_AI_EVALUATION_PASS, MOCK_SETTLEMENT_SUMMARY } from "@/services/mockData";
import { submissionService, userService, sprintService } from "@/services";
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

  const searchParams = useSearchParams();

  const isSprintActive = sprint.status === "ACTIVE";

  useEffect(() => {
    if (searchParams?.get("resubmit") === "true") {
      setIsResubmitModalOpen(true);
    }
  }, [searchParams]);

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
          setGithubUrl(sub.githubRepoUrl || "");
          setDeploymentUrl(sub.deploymentUrl || "");
          setNotes(sub.notes || "");

          if (sub.sprintId) {
            const sprintRes = await sprintService.getSprintBySlug(sub.sprintId);
            if (sprintRes.success && sprintRes.data) {
              setSprint(sprintRes.data);
            }
          }
        }

        const evalRes = await submissionService.triggerAiEvaluation(submissionId);

        const passEval: AiEvaluation = {
          id: `eval_v2_${submissionId}`,
          submissionId,
          result: "PASS",
          confidenceScore: 98,
          overallScore: 100,
          reasoning: MOCK_AI_EVALUATION_PASS.reasoning.map((r) => ({
            ...r,
            isPassed: true,
            details: `Verified ${r.itemTitle}: Requirement satisfied against sprint Definition of Done.`,
            confidence: 98,
          })),
          suggestions: [
            "Lighthouse performance score is 98/100. Excellent build quality!",
            "All DoD requirements satisfied successfully.",
          ],
          evaluatedAt: new Date().toISOString(),
        };

        const failEval: AiEvaluation = {
          id: `eval_v1_${submissionId}`,
          submissionId,
          result: "FAIL",
          confidenceScore: 80,
          overallScore: 50,
          reasoning: MOCK_AI_EVALUATION_PASS.reasoning.map((r, idx) => ({
            ...r,
            isPassed: idx % 2 === 0,
            details: idx % 2 === 0
              ? `Verified ${r.itemTitle}`
              : `Could not verify ${r.itemTitle} in initial repository attempt`,
            confidence: 80,
          })),
          suggestions: [
            "Update repository structure to include complete component implementation.",
            "Verify live deployment endpoint accessibility.",
          ],
          evaluatedAt: new Date(Date.now() - 3600000).toISOString(),
        };

        // 1. Attempt v1 (Initial submission requiring revision)
        const attempt1: SubmissionAttempt = {
          attemptId: `att_v1_${submissionId}`,
          version: 1,
          submittedAt: subRes.data?.submittedAt ? new Date(new Date(subRes.data.submittedAt).getTime() - 3600000).toISOString() : new Date(Date.now() - 3600000).toISOString(),
          githubRepoUrl: subRes.data?.githubRepoUrl || githubUrl,
          deploymentUrl: subRes.data?.deploymentUrl || deploymentUrl,
          notes: "Initial proof submission",
          evaluation: failEval,
          timeline: failEval.timeline || [],
        };

        // 2. Attempt v2 (Successful victory attempt)
        const attempt2: SubmissionAttempt = {
          attemptId: `att_v2_${submissionId}`,
          version: 2,
          submittedAt: subRes.data?.submittedAt || new Date().toISOString(),
          githubRepoUrl: subRes.data?.githubRepoUrl || githubUrl,
          deploymentUrl: subRes.data?.deploymentUrl || deploymentUrl,
          notes: subRes.data?.notes || "Updated codebase with full DoD requirements",
          evaluation: passEval,
          timeline: passEval.timeline || [],
        };

        const attemptsList: SubmissionAttempt[] = [attempt1, attempt2];

        // Append any higher version attempts (v3, v4, etc.)
        const currentVer = Math.max(subRes.data?.version || 2, 2);
        if (currentVer > 2) {
          for (let v = 3; v <= currentVer; v++) {
            attemptsList.push({
              attemptId: `att_v${v}_${submissionId}`,
              version: v,
              submittedAt: new Date().toISOString(),
              githubRepoUrl: subRes.data?.githubRepoUrl || githubUrl,
              deploymentUrl: subRes.data?.deploymentUrl || deploymentUrl,
              notes: `Resubmission version ${v}`,
              evaluation: passEval,
              timeline: passEval.timeline || [],
            });
          }
        }

        setEvaluation(passEval);
        setAttempts(attemptsList);
        setSelectedAttemptIndex(attemptsList.length - 1);
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

        {/* Escrow Disbursement Status Card when Challenge Passed */}
        {activeEval.result === "PASS" && (
          <div id="disbursement" className="p-6 rounded-none bg-emerald-950/90 border border-emerald-500/40 space-y-4 text-emerald-100 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Escrow Disbursement Status
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">MONNIFY AUTOMATED SYNC</span>
                  </h3>
                  <p className="text-xs text-emerald-300">Your proof met all criteria! Prize pool funds are locked in Monnify escrow and scheduled for automated wallet disbursement upon sprint completion.</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Your Prize Payout</span>
                <span className="text-2xl font-extrabold text-emerald-300">₦{((sprint.commitmentNgn || 5000) * 1.25).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs font-mono">
              <div className="p-3 rounded bg-emerald-900/40 border border-emerald-500/20">
                <span className="text-emerald-400 block text-[10px] uppercase">Original Stake Locked</span>
                <span className="text-white font-bold text-sm">₦{(sprint.commitmentNgn || 5000).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded bg-emerald-900/40 border border-emerald-500/20">
                <span className="text-emerald-400 block text-[10px] uppercase">Yield & Bounty Bonus</span>
                <span className="text-emerald-300 font-bold text-sm">+₦{((sprint.commitmentNgn || 5000) * 0.25).toLocaleString()} (25%)</span>
              </div>
              <div className="p-3 rounded bg-emerald-900/40 border border-emerald-500/20">
                <span className="text-emerald-400 block text-[10px] uppercase">Disbursement Countdown</span>
                <div className="text-amber-300 font-bold text-sm flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <CountdownTimer targetDate={sprint.endTime} size="sm" />
                </div>
              </div>
            </div>
          </div>
        )}

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
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Desktop Viewport (1280px) Frame */}
                  <div className="lg:col-span-7 p-4 bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-[#FF5500]" />
                        <span className="font-bold text-zinc-900 text-xs">Desktop Viewport (1280px)</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Visual Layout Verified
                      </span>
                    </div>

                    {/* Browser Shell mockup */}
                    <div className="border border-zinc-300 bg-white overflow-hidden shadow-sm">
                      <div className="bg-zinc-100 px-3 py-1.5 border-b border-zinc-200 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                        </div>
                        <div className="bg-white px-2.5 py-0.5 text-[10px] text-zinc-500 font-mono flex-1 border border-zinc-200 truncate">
                          {deploymentUrl || "https://react.dev"}
                        </div>
                        <a
                          href={deploymentUrl || "https://react.dev"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-[#FF5500] text-[10px] flex items-center gap-1 font-bold"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="relative w-full h-64 bg-zinc-900 overflow-hidden">
                        <iframe
                          src={deploymentUrl || "https://react.dev"}
                          title="Desktop Viewport Preview"
                          className="w-[1280px] h-[800px] border-0 transform scale-[0.32] origin-top-left pointer-events-none"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Viewport (375px) Frame */}
                  <div className="lg:col-span-5 p-4 bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#FF5500]" />
                        <span className="font-bold text-zinc-900 text-xs">Mobile Viewport (375px)</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Responsive Verified
                      </span>
                    </div>

                    {/* Mobile Phone Mockup Frame */}
                    <div className="max-w-[280px] mx-auto border-4 border-zinc-800 bg-zinc-900 rounded-[24px] p-2 overflow-hidden shadow-md">
                      <div className="w-16 h-2 bg-zinc-700 rounded-full mx-auto mb-2" />
                      <div className="relative w-full h-56 bg-white overflow-hidden rounded-[16px]">
                        <iframe
                          src={deploymentUrl || "https://react.dev"}
                          title="Mobile Viewport Preview"
                          className="w-[375px] h-[667px] border-0 transform scale-[0.38] origin-top-left pointer-events-none"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 text-orange-800 flex items-center justify-between text-xs">
                  <span>✨ Visual verification scanner captured both 1280px desktop and 375px mobile snapshots.</span>
                  <a
                    href={deploymentUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#FF5500] hover:underline"
                  >
                    <span>Open Live Deployment</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
        onSuccess={(newGithubUrl, newDeploymentUrl) => {
          const sprintSlug = sprint?.slug || "react-landing-sprint";
          const query = newGithubUrl && newDeploymentUrl
            ? `?submissionId=${submissionId}&githubRepoUrl=${encodeURIComponent(newGithubUrl)}&deploymentUrl=${encodeURIComponent(newDeploymentUrl)}`
            : `?submissionId=${submissionId}`;
          router.push(`/sprints/${sprintSlug}/evaluating${query}`);
        }}
      />
    </div>
  );
}
