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

        // 1. Fetch user submissions from Supabase joining sprints details
        try {
          const { data: subData, error } = await supabase
            .from("submissions")
            .select("*, sprints(title, commitment_ngn)")
            .eq("user_id", res.data.id);

          if (error) throw error;

          if (subData) {
            const mapped = subData.map((sub: any) => ({
              id: sub.id,
              sprintTitle: sub.sprints?.title || "Sprinting Challenge",
              stakeNgn: Number(sub.sprints?.commitment_ngn || 5000),
              submittedAt: new Date(sub.submitted_at).toLocaleDateString(),
              stage: sub.stage,
              payoutNgn: sub.stage === "PAYMENT_SUCCESSFUL" ? Number(sub.sprints?.commitment_ngn || 5000) * 1.25 : 0,
            }));
            setSubmissions(mapped);
          }
        } catch (subErr) {
          console.error("Error loading submissions, using empty fallback:", subErr);
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

  const getStageBadge = (stage: FinancialWorkflowStage) => {
    switch (stage) {
      case "PAYMENT_SUCCESSFUL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>PAID</span>
          </span>
        );
      case "PAYMENT_PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>PROCESSING</span>
          </span>
        );
      case "AI_REVIEW_IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold font-mono">
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>AI GRADING</span>
          </span>
        );
      case "SUBMISSION_FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-bold font-mono">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-mono">
            <span>{stage}</span>
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
          subtext="Gemini 1.5 Pro verdict"
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
                  <th className="px-6 py-3.5">Stake Locked</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5">Financial Lifecycle Stage</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {isLoadingSubmissions ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center font-mono text-xs">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF5500] mb-2" />
                      <span>Loading submissions...</span>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 font-mono text-xs">
                      No proof submissions found. Join a sprint to get started!
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#FFF2EC]/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900">
                        {sub.sprintTitle}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-[#FF5500]">
                        {formatNGN(sub.stakeNgn)}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                        {sub.submittedAt}
                      </td>
                      <td className="px-6 py-4">
                        {getStageBadge(sub.stage)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/sprints/react-landing-page-sprint/evaluating?submissionId=${sub.id}`}>
                          <Button size="sm" variant="secondary">
                            View Lifecycle
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
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
              return (
                <Card key={sprint.id} className="p-6 border-zinc-200 hover:border-zinc-300 transition-colors shadow-soft-card flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={sprint.status} />
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

                    <Link href={`/sprints/${sprint.slug}`} className="block">
                      <Button variant="primary" size="md" className="w-full font-bold">
                        Submit Proof of Work
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
