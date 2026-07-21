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

  const [evaluation, setEvaluation] = useState<AiEvaluation | null>(null);
  const [settlement, setSettlement] = useState<SettlementSummary | null>(null);
  const [stage, setStage] = useState<FinancialWorkflowStage>("SUBMISSION_RECEIVED");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    userService.getCurrentUser().then((res) => {
      if (!res.success || !res.data) {
        router.push(`/login?redirect=/sprints/${slug}/evaluating?submissionId=${submissionId}`);
      }
    });

    submissionService.triggerAiEvaluation(submissionId).then((res) => {
      if (res.success) setEvaluation(res.data);
    });
    settlementService.getSettlementSummary("spr_react_01").then((res) => {
      if (res.success) setSettlement(res.data);
    });

    // Simulate Asynchronous Financial Lifecycle Stage Transitions
    const t1 = setTimeout(() => setStage("AI_REVIEW_IN_PROGRESS"), 2000);
    const t2 = setTimeout(() => setStage("AI_REVIEW_COMPLETE"), 4500);
    const t3 = setTimeout(() => setStage("SETTLEMENT_PROCESSING"), 6500);
    const t4 = setTimeout(() => setStage("PAYMENT_PROCESSING"), 8500);
    const t5 = setTimeout(() => setStage("FUNDS_RELEASED"), 10500);
    const t6 = setTimeout(() => setStage("PAYMENT_SUCCESSFUL"), 12500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [submissionId]);

  const currentEval = evaluation || MOCK_AI_EVALUATION_PASS;
  const isSettled = stage === "PAYMENT_SUCCESSFUL";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EC] border border-[#FF5500]/30 text-badge text-[#FF5500] font-bold">
          <Flame className="w-4 h-4 fill-[#FF5500]" />
          <span>GEMINI 1.5 PRO & MONNIFY ESCROW ENGINE</span>
        </div>
        <h1 className="text-h1 text-zinc-900 font-extrabold font-sans">
          Evaluating Proof of Work & Settling Pool
        </h1>
        <p className="text-body text-zinc-600 max-w-xl mx-auto">
          Inspecting GitHub repository structure and live deployment URL against sprint Definition of Done criteria.
        </p>
      </div>

      {/* Stacked Vertical Layout (Full Width Terminal Top, Financial Timeline Below) */}
      <div className="space-y-8">
        {/* 1. Full-Width Light Terminal Console (Top) */}
        <div className="w-full">
          <TerminalView
            reasoning={currentEval.reasoning}
            confidenceScore={currentEval.confidenceScore}
            result={currentEval.result}
          />
        </div>

        {/* 2. Full-Width Asynchronous Financial Timeline (Stacked Below) */}
        <Card className="p-6 border-zinc-200 shadow-soft-card bg-white w-full">
          <FinancialWorkflowTimeline
            currentStage={stage}
            payoutNgn={settlement?.totalReturnPerPassNgn || 6250}
          />
        </Card>
      </div>

      {/* 3. Final Verdict & Settlement Payout Card */}
      {isSettled && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="p-8 border-2 border-emerald-500 bg-emerald-50/20 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <StatusBadge status="PASS" />
                  <span className="text-caption font-mono text-zinc-500">
                    Confidence Score: <strong className="text-zinc-900">{currentEval.confidenceScore}%</strong>
                  </span>
                </div>
                <h2 className="text-h2 text-zinc-900 font-extrabold">
                  Sprint Passed & Funds Deposited!
                </h2>
                <p className="text-body text-zinc-600">
                  Your proof of work satisfied all required Definition of Done criteria. Initial stake refund and failed pool bonus have been settled via Monnify.
                </p>
              </div>

              {settlement && (
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
                {currentEval.reasoning.map((item) => (
                  <div key={item.itemId} className="p-3 rounded-lg bg-white border border-zinc-200 flex items-start gap-2.5 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
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
        verdict="PASS"
        payoutNgn={settlement?.totalReturnPerPassNgn || 6250}
      />
    </div>
  );
}
