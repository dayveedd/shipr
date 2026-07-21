"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { TerminalView } from "@/components/ui/TerminalView";
import { FinancialWorkflowTimeline } from "@/components/ui/FinancialWorkflowTimeline";
import { ShareProofModal } from "@/components/ui/ShareProofModal";
import { formatNGN } from "@/lib/utils";
import { submissionService, settlementService, userService, MOCK_AI_EVALUATION_PASS } from "@/services";
import { AiEvaluation, SettlementSummary, FinancialWorkflowStage } from "@/types";
import { Trophy, CheckCircle, ArrowRight, Share2, ShieldCheck, Flame, Banknote } from "lucide-react";

export default function AiEvaluatingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId") || "sub_100";

  const githubRepoUrl = searchParams.get("githubRepoUrl") || undefined;
  const deploymentUrl = searchParams.get("deploymentUrl") || undefined;

  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [settlement, setSettlement] = useState<SettlementSummary | null>(null);
  const [stage, setStage] = useState<FinancialWorkflowStage>("SUBMISSION_RECEIVED");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userService.getCurrentUser().then((res) => {
      if (!res.success || !res.data) {
        router.push(`/login?redirect=/sprints/${slug}/evaluating?submissionId=${submissionId}`);
      }
    });

    setStage("AI_REVIEW_IN_PROGRESS");

    submissionService.triggerAiEvaluation(submissionId, {
      githubRepoUrl,
      deploymentUrl,
    }).then((res) => {
      if (res.success && res.data) {
        setEvaluation(res.data);
        setIsLoading(false);
        setStage("AI_REVIEW_COMPLETE");

        const isPass = res.data.result === "PASS";

        if (isPass) {
          // Dynamic transition through financial stages after review completes
          setTimeout(() => setStage("SETTLEMENT_PROCESSING"), 1000);
          setTimeout(() => setStage("PAYMENT_PROCESSING"), 2000);
          setTimeout(() => setStage("FUNDS_RELEASED"), 3000);
          setTimeout(() => setStage("PAYMENT_SUCCESSFUL"), 4000);
        } else {
          // Immediately stop payment/disbursement steps and transition to failed stage
          setTimeout(() => setStage("SUBMISSION_FAILED"), 1500);
        }
      } else {
        setIsLoading(false);
        setStage("SUBMISSION_RECEIVED");
      }
    });

    settlementService.getSettlementSummary("spr_react_01").then((res) => {
      if (res.success) setSettlement(res.data);
    });
  }, [submissionId]);

  const isSettled = stage === "PAYMENT_SUCCESSFUL" || stage === "SUBMISSION_FAILED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EC] border border-[#FF5500]/30 text-badge text-[#FF5500] font-bold">
          <Flame className="w-4 h-4 fill-[#FF5500]" />
          <span>OPENROUTER & MONNIFY ESCROW ENGINE</span>
        </div>
        <h1 className="text-h1 text-zinc-900 font-extrabold font-sans">
          Evaluating Proof of Work & Settling Pool
        </h1>
        <p className="text-body text-zinc-600 max-w-xl mx-auto">
          Inspecting GitHub repository structure and live deployment URL against sprint Definition of Done criteria.
        </p>
      </div>

      {/* Side-by-Side Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Light Terminal Console (7/12 Width) */}
        <div className="lg:col-span-7 w-full">
          <TerminalView
            reasoning={evaluation?.reasoning || []}
            confidenceScore={evaluation?.confidenceScore || 0}
            result={evaluation?.result || "FAIL"}
            timelineEvents={evaluation?.timeline || []}
          />
        </div>

        {/* Right Column: Asynchronous Financial Timeline (5/12 Width) */}
        <div className="lg:col-span-5 w-full">
          <Card className="p-6 border-zinc-200 shadow-soft-card bg-white w-full">
            <FinancialWorkflowTimeline
              currentStage={stage}
              payoutNgn={settlement?.totalReturnPerPassNgn || 6250}
            />
          </Card>
        </div>
      </div>

      {/* 3. Final Verdict & Settlement Payout Card */}
      {isSettled && evaluation && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="p-8 border-2 border-emerald-500 bg-emerald-50/20 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <StatusBadge status={evaluation.result} />
                  <span className="text-caption font-mono text-zinc-500">
                    Confidence Score: <strong className="text-zinc-900">{evaluation.confidenceScore}%</strong>
                  </span>
                </div>
                <h2 className="text-h2 text-zinc-900 font-extrabold">
                  {evaluation.result === "PASS" ? "Sprint Passed & Funds Deposited!" : "Sprint Completed with Failures"}
                </h2>
                <p className="text-body text-zinc-600">
                  {evaluation.result === "PASS"
                    ? "Your proof of work satisfied all required Definition of Done criteria. Initial stake refund and failed pool bonus have been settled via Monnify."
                    : "Some of the Creator's required Definition of Done checks could not be verified by the AI Judge. Please check the detailed feedback report below."}
                </p>
              </div>

              {settlement && evaluation.result === "PASS" && (
                <div className="p-5 rounded-2xl bg-white border border-emerald-300 text-center space-y-1 shadow-soft-card shrink-0">
                  <span className="text-label text-zinc-500 block">Total Disbursed Payout</span>
                  <span className="text-financial text-3xl text-emerald-600 font-bold">
                    {formatNGN(settlement.totalReturnPerPassNgn)}
                  </span>
                  <span className="text-caption text-zinc-500 block font-mono">
                    Initial Stake ₦5,000 + Bonus ₦1,250
                  </span>
                </div>
              )}
            </div>

            {/* Reasoning Checklist */}
            <div className="mt-8 pt-6 border-t border-zinc-200/80 space-y-3">
              <h4 className="text-label text-zinc-900 font-bold">AI Detailed Inspection Report</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evaluation.reasoning.map((item: any) => (
                  <div key={item.itemId} className="p-3 rounded-lg bg-white border border-zinc-200 flex items-start gap-2.5 shadow-sm">
                    {item.isPassed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✗</span>
                    )}
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{item.itemTitle}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post-Verdict Actions */}
            <div className="mt-8 pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/dashboard">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Go to Dashboard
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsShareModalOpen(true)}
                leftIcon={<Share2 className="w-4 h-4 text-[#FF5500]" />}
              >
                Share Proof of Work
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Share Proof Modal */}
      <ShareProofModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        submissionId={submissionId}
        sprintTitle={settlement?.sprintTitle || "React Landing Page 48h Sprint"}
        builderName="Sarah Chen"
        verdict={evaluation?.result || "FAIL"}
        payoutNgn={settlement?.totalReturnPerPassNgn || 6250}
      />
    </div>
  );
}
