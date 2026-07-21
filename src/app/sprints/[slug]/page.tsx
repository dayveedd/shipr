"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { DodChecklist } from "@/components/ui/DodChecklist";
import { formatNGN } from "@/lib/utils";
import { sprintService } from "@/services";
import { Sprint } from "@/types";
import { ArrowLeft, ShieldCheck, Zap, Trophy, CheckCircle, AlertTriangle, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";

function SprintDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams?.get("payment");

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    sprintService.getSprintBySlug(slug).then((res) => {
      if (res.success && res.data) {
        setSprint(res.data);
        
        // 1. Check if user is registered in this sprint in the database on load
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase
              .from("sprint_participants")
              .select("*")
              .eq("sprint_id", res.data.id)
              .eq("user_id", user.id)
              .maybeSingle()
              .then(({ data: participant }) => {
                if (participant) {
                  setHasJoined(true);
                }
              });
          }
        });
      }
    });
  }, [slug]);

  // 2. Immediate registration confirmation if user has successfully redirected back from Monnify
  useEffect(() => {
    if (paymentStatus === "success") {
      setHasJoined(true);
    }
  }, [paymentStatus]);

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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=/sprints/${slug}`);
        return;
      }

      // Call transaction initialization server endpoint
      const res = await fetch("/api/v1/payments/initialize-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sprintId: sprint.id,
          redirectUrl: `${window.location.origin}/sprints/${slug}?payment=success`,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to initialize payment gateway");
      }

      // Record registration locally in parallel
      await sprintService.joinSprint(sprint.id);

      // Launch Monnify checkout!
      window.location.href = resData.data.checkoutUrl;
    } catch (err: any) {
      alert(err.message || "Monnify transaction initialization failed");
    } finally {
      setIsJoining(false);
      setShowCheckoutModal(false);
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

            <div className="p-4 rounded-xl bg-[#FFF2EC] border border-[#FF5500]/20 space-y-4">
              <div className="text-center pb-2 border-b border-[#FF5500]/10">
                <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-wider">Option 1: Direct Escrow Bank Transfer</span>
              </div>
              {sprint.poolAccounts && sprint.poolAccounts.length > 0 ? (
                sprint.poolAccounts.map((acc, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Bank Name:</span>
                      <span className="text-zinc-900 font-bold">{acc.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-950 font-extrabold font-mono text-sm tracking-wider">{acc.accountNumber}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(acc.accountNumber);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="p-1 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
                          title="Copy Account Number"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Account Name:</span>
                      <span className="text-zinc-900 font-medium">ShipR Escrow Pool</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Bank Name:</span>
                    <span className="text-zinc-900 font-bold">Wema Bank</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-950 font-extrabold font-mono text-sm tracking-wider">0010993026</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("0010993026");
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="p-1 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
                        title="Copy Account Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Account Name:</span>
                    <span className="text-zinc-900 font-medium">ShipR Escrow Pool</span>
                  </div>
                </div>
              )}
              {isCopied && (
                <p className="text-[10px] text-emerald-600 font-bold text-center font-mono animate-fadeIn">
                  ✓ Account number copied to clipboard!
                </p>
              )}
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-200"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-400 font-mono font-bold uppercase">Or Option 2: Pay Online</span>
              <div className="flex-grow border-t border-zinc-200"></div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Commitment Stake:</span>
                <span className="text-financial text-zinc-900 text-xs font-bold">{formatNGN(sprint.commitmentNgn)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Payment Methods:</span>
                <span className="text-zinc-900 font-mono">Card / Bank App Checkout</span>
              </div>
            </div>

            <div className="p-3 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                By committing, your stake is locked in the pool escrow until AI inspection.
              </span>
            </div>

            <Button
              size="lg"
              variant="primary"
              className="w-full bg-zinc-900 hover:bg-zinc-800 border-zinc-900 text-white font-bold"
              isLoading={isJoining}
              onClick={handleConfirmPayment}
            >
              Pay Online via Monnify Card / Transfer
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function SprintDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-caption text-zinc-500">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/3 mx-auto" />
          <div className="h-4 bg-zinc-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    }>
      <SprintDetailContent slug={slug} />
    </Suspense>
  );
}
