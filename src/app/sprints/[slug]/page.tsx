"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { DodChecklist } from "@/components/ui/DodChecklist";
import { formatNGN } from "@/lib/utils";
import { sprintService } from "@/services";
import { Sprint } from "@/types";
import { ArrowLeft, ShieldCheck, Zap, Trophy, CheckCircle, AlertTriangle } from "lucide-react";

export default function SprintDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    sprintService.getSprintBySlug(slug).then((res) => {
      if (res.success) setSprint(res.data);
    });
  }, [slug]);

  if (!sprint) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-caption text-zinc-500">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/3 mx-auto" />
          <div className="h-4 bg-zinc-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  const handleJoinClick = () => {
    setShowCheckoutModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsJoining(true);
    const response = await sprintService.joinSprint(sprint.id);
    setIsJoining(false);
    setShowCheckoutModal(false);

    if (response.success) {
      setHasJoined(true);
    }
  };

  const projectedPayout = sprint.commitmentNgn + sprint.commitmentNgn * 0.25;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-background">
      {/* Back Link */}
      <Link
        href="/sprints"
        className="inline-flex items-center gap-2 text-button text-zinc-600 hover:text-zinc-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sprints</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sprint Detail Column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={sprint.status} />
              <div className="flex gap-1.5">
                {sprint.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <h1 className="text-h1 text-zinc-900">
              {sprint.title}
            </h1>
            <p className="text-body-lg text-zinc-600 mt-3">
              {sprint.description}
            </p>
          </div>

          {/* Key Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Required Stake" value={formatNGN(sprint.commitmentNgn)} subtext="Monnify Secured" icon={<Zap className="w-4 h-4" />} highlight />
            <StatCard label="Total Pool" value={formatNGN(sprint.totalPoolNgn)} subtext={`${sprint.filledSlots} Builders`} icon={<ShieldCheck className="w-4 h-4" />} />
            <StatCard label="Est. PASS Return" value={formatNGN(projectedPayout)} subtext="Initial Stake + Bonus" icon={<Trophy className="w-4 h-4" />} />
          </div>

          {/* Definition of Done */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <h3 className="text-h3 text-zinc-900">
                  Definition of Done (DoD)
                </h3>
                <p className="text-caption text-zinc-500">
                  The AI Judge evaluates your GitHub repo and live deployment against these criteria.
                </p>
              </div>
              <span className="text-badge text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 font-bold">
                {sprint.definitionOfDone.length} Checks Required
              </span>
            </div>

            <DodChecklist items={sprint.definitionOfDone} />
          </Card>
        </div>

        {/* Sidebar Sticky Action Column */}
        <div className="space-y-6">
          <Card className="p-6 border-zinc-300 space-y-6 sticky top-24 shadow-soft-card">
            {/* Timer */}
            <div className="space-y-2 text-center pb-4 border-b border-zinc-200">
              <span className="text-label text-zinc-500 block">
                Sprint Countdown
              </span>
              <CountdownTimer targetDate={sprint.endTime} size="lg" className="w-full justify-center" />
            </div>

            {/* Slots allocation bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-caption">
                <span className="text-zinc-500">Slots Claimed</span>
                <span className="text-zinc-900 font-bold font-mono font-tabular">
                  {sprint.filledSlots} / {sprint.totalSlots}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden p-0.5 border border-zinc-200">
                <div
                  className="h-full bg-zinc-900 rounded-full transition-all"
                  style={{ width: `${(sprint.filledSlots / sprint.totalSlots) * 100}%` }}
                />
              </div>
            </div>

            {/* Action CTA */}
            {hasJoined ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-100 border border-zinc-300 text-center text-caption text-zinc-900 font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>You are registered in this Sprint!</span>
                </div>
                <Link href={`/sprints/${sprint.slug}/submit`} className="block">
                  <Button size="lg" variant="primary" className="w-full">
                    Submit Proof of Work
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                size="lg"
                variant="primary"
                className="w-full"
                onClick={handleJoinClick}
              >
                Commit {formatNGN(sprint.commitmentNgn)} & Join
              </Button>
            )}

            <div className="text-caption text-zinc-500 text-center space-y-1">
              <p>⚡ Monnify Escrow Account Protection</p>
              <p>🤖 Automated AI Judge PASS/FAIL Verdict</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Monnify Checkout Simulation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border-zinc-300 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-zinc-900" />
                <h3 className="text-h3 text-zinc-900">Monnify Commitment Checkout</h3>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-zinc-400 hover:text-zinc-900 text-sm font-sans" aria-label="Close modal">
                ✕
              </button>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex justify-between text-body">
                <span className="text-zinc-500">Sprint:</span>
                <span className="text-zinc-900 font-bold">{sprint.title}</span>
              </div>
              <div className="flex justify-between text-body">
                <span className="text-zinc-500">Commitment Stake:</span>
                <span className="text-financial text-zinc-900 text-sm">{formatNGN(sprint.commitmentNgn)}</span>
              </div>
              <div className="flex justify-between text-body">
                <span className="text-zinc-500">Payment Provider:</span>
                <span className="text-zinc-900 font-mono">Monnify Transfer / Card</span>
              </div>
            </div>

            <div className="p-3 rounded bg-amber-50 border border-amber-200 text-caption text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                By committing, you agree that your stake will be locked in the pool until AI evaluation at sprint completion.
              </span>
            </div>

            <Button
              size="lg"
              variant="primary"
              className="w-full"
              isLoading={isJoining}
              onClick={handleConfirmPayment}
            >
              Confirm Commitment Payment ({formatNGN(sprint.commitmentNgn)})
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
