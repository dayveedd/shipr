"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, RankBadge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { formatNGN } from "@/lib/utils";
import { sprintService, userService } from "@/services";
import { Sprint, User, FinancialWorkflowStage } from "@/types";
import { Trophy, Flame, ShieldCheck, ArrowRight, Clock, CheckCircle2, AlertCircle, Loader2, Github, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [joinedSprintIds, setJoinedSprintIds] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  useEffect(() => {
    userService.getCurrentUser().then(async (res) => {
      if (res.success && res.data) {
        setUser(res.data);

          // 1. Fetch live user submissions directly from Supabase joining sprints details
          try {
            const { data: dbSubData, error } = await supabase
              .from("submissions")
              .select("*, sprints(title, commitment_ngn)")
              .order("submitted_at", { ascending: false });

            let localList: any[] = [];
            try {
              if (typeof window !== "undefined") {
                const raw = localStorage.getItem("shipr_submissions");
                if (raw) localList = JSON.parse(raw);
              }
            } catch (e) {}

            const merged = [...(dbSubData || [])];
            localList.forEach((loc) => {
              const existingIdx = merged.findIndex((m) => m.id === loc.id);
              if (existingIdx >= 0) {
                merged[existingIdx] = { ...merged[existingIdx], ...loc };
              } else {
                merged.push(loc);
              }
            });

            const subData = merged;

            if (subData) {
              const rows: any[] = [];
              const seenVersions = new Set<string>();

              subData.forEach((sub: any) => {
                let attemptsHistory: any[] = [];
                try {
                  if (sub.notes) {
                    const parsed = JSON.parse(sub.notes);
                    if (Array.isArray(parsed?.attemptsHistory)) {
                      attemptsHistory = parsed.attemptsHistory;
                    } else if (Array.isArray(parsed) && parsed[0]?.version) {
                      attemptsHistory = parsed;
                    }
                  }
                } catch (e) {
                  attemptsHistory = [];
                }

                const sprintTitleKey = sub.sprints?.title || sub.sprintTitle || sub.sprint_id || "Sprinting Challenge";

                // Add past attempts from history (e.g. Attempt v1)
                attemptsHistory.forEach((past: any) => {
                  const pastVer = past.version || 1;
                  const verKey = `${sprintTitleKey}_v${pastVer}`;
                  if (!seenVersions.has(verKey)) {
                    seenVersions.add(verKey);

                    const isPass = past.evaluationResult?.result === "PASS" || past.stage === "PAYMENT_SUCCESSFUL";
                    const isFail = past.evaluationResult?.result === "FAIL" || past.stage === "SUBMISSION_FAILED";
                    const stageText = isPass ? "PAYMENT_SUCCESSFUL" : isFail ? "SUBMISSION_FAILED" : past.stage || "SUBMISSION_FAILED";

                    rows.push({
                      id: sub.id,
                      sprintTitle: sprintTitleKey,
                      stakeNgn: Number(sub.sprints?.commitment_ngn || 5000),
                      submittedAt: past.submittedAt ? new Date(past.submittedAt).toLocaleDateString() : new Date(sub.submitted_at).toLocaleDateString(),
                      stage: stageText,
                      version: pastVer,
                      payoutNgn: isPass ? Number(sub.sprints?.commitment_ngn || 5000) * 1.25 : 0,
                      isPass,
                      isFail,
                    });
                  }
                });

                // Add current active attempt (e.g. Attempt v2)
                const currentVer = sub.version || (attemptsHistory.length + 1) || 1;
                const currentVerKey = `${sprintTitleKey}_v${currentVer}`;

                if (!seenVersions.has(currentVerKey)) {
                  seenVersions.add(currentVerKey);

                  const currentPass = sub.evaluation_result?.result === "PASS" || sub.stage === "PAYMENT_SUCCESSFUL";
                  const currentFail = sub.evaluation_result?.result === "FAIL" || sub.stage === "SUBMISSION_FAILED";
                  const stageText = currentPass ? "PAYMENT_SUCCESSFUL" : currentFail ? "SUBMISSION_FAILED" : sub.stage || "SUBMISSION_RECEIVED";

                  rows.push({
                    id: sub.id,
                    sprintTitle: sprintTitleKey,
                    stakeNgn: Number(sub.sprints?.commitment_ngn || 5000),
                    submittedAt: new Date(sub.submitted_at || Date.now()).toLocaleDateString(),
                    stage: stageText,
                    version: currentVer,
                    payoutNgn: currentPass ? Number(sub.sprints?.commitment_ngn || 5000) * 1.25 : 0,
                    isPass: currentPass,
                    isFail: currentFail,
                  });
                }
              });

              // Sort newest attempt version first
              rows.sort((a, b) => b.version - a.version);
              setSubmissions(rows);

              // Compute live user stats directly from real database records
              const totalEarned = rows.reduce((acc: number, curr: any) => acc + (curr.payoutNgn || 0), 0);
              const totalSubs = rows.length;
              const passSubs = rows.filter((s: any) => s.isPass).length;
              const successRate = totalSubs > 0 ? Math.round((passSubs / totalSubs) * 100) : 0;

              setUser((prev) => prev ? {
                ...prev,
                sprintsCompleted: totalSubs,
                successRate: successRate,
                totalEarnedNgn: totalEarned,
              } : null);
            } else {
              setSubmissions([]);
            }
        } catch (subErr) {
          console.error("Error loading submissions:", subErr);
          setSubmissions([]);
        } finally {
          setIsLoadingSubmissions(false);
        }

        // 2. Fetch user joined sprints from Supabase
        try {
          const { data: joinedData, error: joinedErr } = await supabase
            .from("sprint_participants")
            .select("sprint_id")
            .eq("user_id", res.data.id);

          if (!joinedErr && joinedData) {
            setJoinedSprintIds(joinedData.map((jp: any) => jp.sprint_id));
          }
        } catch (joinedErr) {
          console.error("Error loading joined sprints:", joinedErr);
        }
      } else {
        router.push("/login?redirect=/dashboard");
      }
    });

    sprintService.getSprints().then((res) => {
      if (res.success) setSprints(res.data);
    });
  }, [router]);

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "PAYMENT_SUCCESSFUL":
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold font-mono shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>PASSED (PAID)</span>
          </span>
        );
      case "PAYMENT_PROCESSING":
      case "SETTLEMENT_PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>SETTLING PAYOUT</span>
          </span>
        );
      case "AI_REVIEW_IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold font-mono">
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>AI GRADING</span>
          </span>
        );
      case "SUBMISSION_FAILED":
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-extrabold font-mono shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-mono font-bold">
            <span>{stage.replace(/_/g, " ")}</span>
          </span>
        );
    }
  };

  const handleConnectGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      alert(err.message || "Failed to trigger GitHub authorization");
    }
  };

  const joinedSprints = sprints.filter((sprint) => joinedSprintIds.includes(sprint.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-background space-y-10">
      {/* Top Banner Notice if Github is not connected */}
      {!user?.githubUsername && (
        <div className="p-4 rounded-xl bg-[#FFF2EC] border border-[#FF5500]/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF5500] shrink-0" />
            <div>
              <p className="text-body font-bold text-zinc-900">Verify GitHub Payout Channel</p>
              <p className="text-caption text-zinc-600">Connect your GitHub account to enable the AI Code Judge to score submissions.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={handleConnectGithub}
            className="flex items-center gap-2 font-bold"
          >
            <Github className="w-4 h-4" />
            <span>Connect GitHub</span>
          </Button>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}
            alt={user?.name || "Builder Profile"}
            className="w-16 h-16 rounded-full border-2 border-[#FF5500] object-cover shadow-orange-glow"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-h1 text-zinc-900 font-extrabold font-sans">
                {user?.name || "Builder"}
              </h1>
              <RankBadge rank={user?.rank || "BRONZE"} />
            </div>
            <p className="text-xs font-mono text-zinc-500">
              {user?.githubUsername ? `@${user.githubUsername}` : "No GitHub connected"} • Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "Jan 2026"}
            </p>
          </div>
        </div>

        <Link href="/sprints">
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Browse Active Sprints
          </Button>
        </Link>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Net Earned"
          value={formatNGN(user?.totalEarnedNgn || 0)}
          subtext="Verified Monnify payouts"
          icon={<Trophy className="w-5 h-5 text-[#FF5500]" />}
          highlight
        />
        <StatCard
          label="Active Execution Streak"
          value={`${user?.currentStreak || 0} Sprints`}
          subtext={`Best: ${user?.longestStreak || 0} consecutive`}
          icon={<Flame className="w-5 h-5 text-[#FF5500]" />}
        />
        <StatCard
          label="Sprints Completed"
          value={user?.sprintsCompleted || 0}
          subtext="100% verified proof"
          icon={<ShieldCheck className="w-5 h-5 text-[#FF5500]" />}
        />
        <StatCard
          label="AI Success Rate"
          value={`${user?.successRate || 0}%`}
          subtext="OpenRouter AI Judge verdict"
          icon={<CheckCircle2 className="w-5 h-5 text-[#FF5500]" />}
        />
      </div>

      {/* Asynchronous Financial Submissions Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-zinc-900 font-bold">
            Recent Proof Submissions & Financial Stages
          </h2>
          <span className="text-caption font-mono text-zinc-500">
            Monnify Webhook Sync Active
          </span>
        </div>

        <Card className="overflow-hidden border-zinc-200 shadow-soft-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="bg-zinc-100 text-zinc-900 text-xs uppercase font-mono font-bold border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3.5">Sprint Title</th>
                  <th className="px-6 py-3.5">Attempt</th>
                  <th className="px-6 py-3.5">Stake Locked</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5">Financial & Evaluation Stage</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {isLoadingSubmissions ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center font-mono text-xs">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF5500] mb-2" />
                      <span>Loading submissions...</span>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-zinc-500 font-mono text-xs">
                      No proof submissions found. Join a sprint to get started!
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const isPassed = sub.isPass || sub.stage === "PAYMENT_SUCCESSFUL";
                    const isFailed = sub.isFail || sub.stage === "SUBMISSION_FAILED";

                    let statusBadge;
                    let actionButtonText = "View Evaluation Status";
                    let actionButtonClass = "bg-[#FF5500] hover:bg-[#E04B00] text-white";

                    if (isPassed) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold font-mono shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CHALLENGE PASSED</span>
                        </span>
                      );
                      actionButtonText = "View Disbursement Status";
                      actionButtonClass = "bg-emerald-700 hover:bg-emerald-800 text-white";
                    } else {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-extrabold font-mono shadow-sm">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>SUBMISSION FAILED</span>
                        </span>
                      );
                      actionButtonText = "Resubmit Project";
                      actionButtonClass = "bg-[#FF5500] hover:bg-[#E04B00] text-white";
                    }

                    return (
                      <tr key={`${sub.id}_v${sub.version || 1}`} className="hover:bg-[#FFF2EC]/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-zinc-900">
                          {sub.sprintTitle}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-[#FF5500]">
                          Attempt v{sub.version || 1}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-[#FF5500]">
                          {formatNGN(sub.stakeNgn)}
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                          {sub.submittedAt}
                        </td>
                        <td className="px-6 py-4">
                          {statusBadge}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/proof/${sub.id}${isPassed ? '#disbursement' : '?resubmit=true'}`}>
                            <button className={`${actionButtonClass} text-xs font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center`}>
                              {actionButtonText}
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Active Joined Sprints Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-h2 text-zinc-900 font-bold">
          Active Sprint Commitments ({joinedSprints.length})
        </h2>

        {joinedSprints.length === 0 ? (
          <Card className="p-10 border-zinc-200 text-center space-y-4 shadow-soft-card max-w-2xl">
            <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="text-h3 text-zinc-800 font-bold">No Active Commitments</h3>
            <p className="text-body text-zinc-500">
              You haven't joined any active sprints yet. Browse the available sprints, make your commitment stake pool deposit, and start building!
            </p>
            <Link href="/sprints" className="inline-block">
              <Button variant="primary" size="md">
                Find Sprints to Join
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedSprints.map((sprint) => {
              const projectedPayout = sprint.commitmentNgn + sprint.commitmentNgn * 0.25;
              const sub = submissions.find((s) => s.sprintTitle === sprint.title || s.sprintId === sprint.id || s.id === sprint.id);

              let badgeElement = <StatusBadge status={sprint.status} />;
              let buttonText = "Submit Proof of Work";
              let buttonLink = `/sprints/${sprint.slug}`;
              let buttonVariant: "primary" | "secondary" = "primary";

              if (sub) {
                const isPass = sub.isPass || sub.stage === "PAYMENT_SUCCESSFUL" || sub.verdict === "PASS" || sub.evaluation_result?.result === "PASS";
                const isFail = sub.stage === "SUBMISSION_FAILED" || sub.verdict === "FAIL" || sub.evaluation_result?.result === "FAIL";

                if (isPass) {
                  badgeElement = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold font-mono shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>CHALLENGE PASSED 🏆</span>
                    </span>
                  );
                  buttonText = "View Victory & Proof";
                  buttonLink = `/proof/${sub.id}`;
                  buttonVariant = "secondary";
                } else if (isFail) {
                  badgeElement = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-extrabold font-mono shadow-sm">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>SUBMISSION FAILED</span>
                    </span>
                  );
                  buttonText = "Resubmit Project";
                  buttonLink = `/proof/${sub.id}?resubmit=true`;
                  buttonVariant = "primary";
                }
              }

              return (
                <Card key={sprint.id} className="p-6 border-zinc-200 hover:border-zinc-300 transition-colors shadow-soft-card flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {badgeElement}
                      <CountdownTimer targetDate={sprint.endTime} size="sm" />
                    </div>
                    <h3 className="text-h3 text-zinc-900 font-bold leading-snug">
                      {sprint.title}
                    </h3>
                    <p className="text-body text-zinc-500 line-clamp-3">
                      {sprint.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-100">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-2.5 rounded bg-zinc-50 border border-zinc-100">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Your Stake</span>
                        <span className="text-sm font-extrabold font-mono text-[#FF5500]">
                          {formatNGN(sprint.commitmentNgn)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-zinc-50 border border-zinc-100">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Est. Payout</span>
                        <span className="text-sm font-extrabold font-mono text-zinc-900">
                          {formatNGN(projectedPayout)}
                        </span>
                      </div>
                    </div>

                    <Link href={buttonLink} className="block">
                      <Button variant={buttonVariant} size="md" className="w-full font-bold">
                        {buttonText}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
