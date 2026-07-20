"use client";

import React, { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, RankBadge } from "@/components/ui/Badge";
import { formatNGN } from "@/lib/utils";
import { MOCK_CURRENT_USER, MOCK_SPRINTS, MOCK_AI_EVALUATION_PASS, MOCK_SETTLEMENT_SUMMARY } from "@/services/mockData";
import { Zap, Github, Globe, CheckCircle, ShieldCheck, Share2, ArrowRight, Trophy, Clock, ExternalLink } from "lucide-react";

export default function PublicProofPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);
  const user = MOCK_CURRENT_USER;
  const sprint = MOCK_SPRINTS[0];
  const evaluation = MOCK_AI_EVALUATION_PASS;
  const settlement = MOCK_SETTLEMENT_SUMMARY;

  const publicUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    alert("Proof of Work URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
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

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EC] border border-[#FF5500]/30 text-badge text-[#FF5500] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
            <span>PUBLIC PROOF OF WORK CERTIFICATE</span>
          </div>
        </div>

        {/* Builder & Verdict Hero Card */}
        <Card className="p-8 space-y-6 border-zinc-300 shadow-2xl bg-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Builder Info */}
            <div className="flex items-center gap-4">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-[#FF5500] object-cover shadow-orange-glow"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-h2 text-zinc-900 font-extrabold">{user.name}</h1>
                  <RankBadge rank={user.rank} showIcon={false} />
                </div>
                <p className="text-xs font-mono text-zinc-500">@{user.githubUsername}</p>
                <p className="text-caption text-zinc-600 mt-1">
                  Completed {user.sprintsCompleted} Sprints • {user.successRate}% AI Pass Rate
                </p>
              </div>
            </div>

            {/* Verdict Badge Box */}
            <div className="p-4 rounded-2xl bg-[#FFF2EC] border border-[#FF5500]/20 text-center space-y-1">
              <StatusBadge status={evaluation.result === "PASS" ? "PASS" : "FAIL"} />
              <p className="text-caption font-mono text-zinc-600 pt-1">
                Gemini 1.5 Score: <strong className="text-zinc-900">{evaluation.confidenceScore}%</strong>
              </p>
            </div>
          </div>

          {/* Sprint Details Strip */}
          <div className="pt-6 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-label text-zinc-500 block">48h Coding Sprint</span>
              <h3 className="text-h3 text-zinc-900 font-bold">{sprint.title}</h3>
            </div>

            <div>
              <span className="text-label text-zinc-500 block">Verified Commitment Stake</span>
              <span className="text-financial text-xl text-[#FF5500] font-bold">
                {formatNGN(sprint.commitmentNgn)} Stake Locked
              </span>
            </div>
          </div>

          {/* Links Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href="https://github.com/sarahdev/shipr-landing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-[#FF5500]/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Github className="w-5 h-5 text-zinc-900" />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block group-hover:text-[#FF5500]">GitHub Repository</span>
                  <span className="text-caption text-zinc-500 font-mono">sarahdev/shipr-landing</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#FF5500]" />
            </a>

            <a
              href="https://shipr-landing.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-[#FF5500]/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-[#FF5500]" />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block group-hover:text-[#FF5500]">Live Deployment</span>
                  <span className="text-caption text-zinc-500 font-mono">shipr-landing.vercel.app</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#FF5500]" />
            </a>
          </div>
        </Card>

        {/* AI Judge Inspection Report */}
        <Card className="p-8 space-y-6 border-zinc-200 shadow-soft-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h3 text-zinc-900 font-bold">AI Judge Verification Log</h3>
              <p className="text-body text-zinc-600 text-xs mt-0.5">
                Gemini 1.5 Pro evaluated repository commits and live deployment DOM structure.
              </p>
            </div>
            <span className="text-caption font-mono text-zinc-500">
              ID: {submissionId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evaluation.reasoning.map((item) => (
              <div key={item.itemId} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-zinc-900">{item.itemTitle}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{item.details}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Payout Proof Summary */}
          <div className="p-5 rounded-2xl bg-[#FFF2EC]/80 border border-[#FF5500]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#FF5500] shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Commitment Pool Settlement Released</h4>
                <p className="text-caption text-zinc-600">Initial stake refund (₦5,000) + Failed pool redistribution (+₦1,250)</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-label text-zinc-500 block">Total Payout</span>
              <span className="text-financial text-2xl text-emerald-600 font-bold">
                {formatNGN(settlement.totalReturnPerPassNgn)}
              </span>
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="secondary" size="md" onClick={handleCopy} leftIcon={<Share2 className="w-4 h-4" />}>
            Copy Proof Page Link
          </Button>

          <Link href="/sprints">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Join a Coding Sprint
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
