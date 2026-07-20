"use client";

import React from "react";
import { FinancialWorkflowStage } from "@/types";
import { CheckCircle2, Clock, Loader2, ShieldCheck, Banknote, AlertCircle, Cpu, FileCheck } from "lucide-react";

interface StepConfig {
  stage: FinancialWorkflowStage;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STAGES: StepConfig[] = [
  {
    stage: "SUBMISSION_RECEIVED",
    title: "Submission Received",
    description: "GitHub repository & live URL queued in async evaluation worker.",
    icon: <FileCheck className="w-4 h-4 text-[#FF5500]" />,
  },
  {
    stage: "AI_REVIEW_IN_PROGRESS",
    title: "AI Review in Progress",
    description: "Gemini 1.5 Pro scanning code structure, DOM elements & responsive layout.",
    icon: <Cpu className="w-4 h-4 text-[#FF5500]" />,
  },
  {
    stage: "AI_REVIEW_COMPLETE",
    title: "AI Review Complete",
    description: "100% Definition of Done requirements satisfied with PASS verdict.",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
  {
    stage: "SETTLEMENT_PROCESSING",
    title: "Settlement Processing",
    description: "Computing sprint commitment pool, refund calculations & failure redistribution.",
    icon: <ShieldCheck className="w-4 h-4 text-[#FF5500]" />,
  },
  {
    stage: "PAYMENT_PROCESSING",
    title: "Payment Processing",
    description: "Monnify Transfers API generating disbursement order to your bank account.",
    icon: <Loader2 className="w-4 h-4 text-[#FF5500] animate-spin" />,
  },
  {
    stage: "FUNDS_RELEASED",
    title: "Funds Released",
    description: "Monnify escrow webhook confirmed transaction batch execution.",
    icon: <Banknote className="w-4 h-4 text-emerald-600" />,
  },
  {
    stage: "PAYMENT_SUCCESSFUL",
    title: "Payment Successful",
    description: "Initial stake + bonus pool split deposited. Execution rank updated!",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
];

interface FinancialWorkflowTimelineProps {
  currentStage: FinancialWorkflowStage;
  txHash?: string;
  payoutNgn?: number;
}

export const FinancialWorkflowTimeline: React.FC<FinancialWorkflowTimelineProps> = ({
  currentStage,
  txHash = "MNFY-TX-84920194",
  payoutNgn = 6250,
}) => {
  const isFailed = currentStage === "SUBMISSION_FAILED";
  const currentStageIndex = isFailed ? -1 : STAGES.findIndex((s) => s.stage === currentStage);

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h3 className="text-h3 text-zinc-900 font-extrabold font-sans">
            Asynchronous Financial Lifecycle
          </h3>
          <p className="text-caption text-zinc-500">
            Real-time Monnify escrow settlement & AI evaluation stage tracking.
          </p>
        </div>

        {currentStage === "PAYMENT_SUCCESSFUL" && (
          <div className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold">
            ✓ SETTLED & PAID
          </div>
        )}
      </div>

      {/* Timeline Steps Stack */}
      <div className="relative space-y-4 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
        {STAGES.map((step, idx) => {
          const isCompleted = currentStageIndex > idx || currentStage === "PAYMENT_SUCCESSFUL";
          const isCurrent = currentStageIndex === idx;
          const isPending = currentStageIndex < idx && !isCompleted;

          return (
            <div
              key={step.stage}
              className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
                isCurrent
                  ? "bg-[#FFF2EC] border-[#FF5500]/40 shadow-soft-card ring-1 ring-[#FF5500]/20"
                  : isCompleted
                  ? "bg-white border-zinc-200"
                  : "bg-zinc-50/50 border-zinc-200 opacity-60"
              }`}
            >
              {/* Step Circle Marker */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-mono font-bold text-xs shadow-sm ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-[#FF5500] text-white shadow-orange-glow"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>

              {/* Step Info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-bold font-sans ${
                      isCurrent
                        ? "text-[#FF5500]"
                        : isCompleted
                        ? "text-zinc-900"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.title}
                  </h4>

                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-[10px] font-mono font-bold uppercase animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>

                <p className="text-caption text-zinc-600 text-[11px]">
                  {step.description}
                </p>

                {/* Monnify Tx Hash badge if completed */}
                {step.stage === "FUNDS_RELEASED" && (isCompleted || isCurrent) && (
                  <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span>Monnify Ref:</span>
                    <strong className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                      {txHash}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Failed State Card if Applicable */}
        {isFailed && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Submission Verification Failed</span>
            </div>
            <p className="text-caption text-red-600">
              Gemini AI Judge detected missing Definition of Done items. Review feedback below and re-submit before deadline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
