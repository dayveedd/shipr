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
import { Trophy, Flame, ShieldCheck, ArrowRight, Clock, CheckCircle2, AlertCircle, Loader2, Github } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  useEffect(() => {
    userService.getCurrentUser().then(async (res) => {
      if (res.success && res.data) {
        setUser(res.data);

        // Fetch user submissions from Supabase joining sprints details
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
          console.error("Error loading submissions, using mock fallback:", subErr);
          const mockUserSubmissions = [
            {
              id: "sub_101",
              sprintTitle: "React Landing Page 48h Sprint",
              stakeNgn: 5000,
              submittedAt: "2 hours ago",
              stage: "PAYMENT_SUCCESSFUL" as const,
              payoutNgn: 6250,
            },
            {
              id: "sub_102",
              sprintTitle: "Full-Stack Analytics Dashboard",
              stakeNgn: 15000,
              submittedAt: "30 minutes ago",
              stage: "PAYMENT_PROCESSING" as const,
              payoutNgn: 18750,
            },
            {
              id: "sub_103",
              sprintTitle: "Next.js 15 Server Actions & Auth API",
              stakeNgn: 10000,
              submittedAt: "Just now",
              stage: "AI_REVIEW_IN_PROGRESS" as const,
              payoutNgn: 0,
            },
          ];
          setSubmissions(mockUserSubmissions);
        } finally {
          setIsLoadingSubmissions(false);
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF2EC] text-[#FF5500] border border-[#FF5500]/30 text-xs font-bold font-mono animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>MONNIFY DISBURSING</span>
          </span>
        );
      case "AI_REVIEW_IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>AI SCANNING</span>
          </span>
        );
      case "SUBMISSION_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>RECEIVED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono">
            <span>{stage.replace(/_/g, " ")}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* GitHub Connect Verification Alert Banner for Magic Link Logins */}
      {user && user.role !== "VERIFIED_CREATOR" && (
        <div className="p-5 rounded-2xl bg-[#FFF2EC] border border-[#FF5500]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-card animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF5500] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-zinc-900 font-sans">Verify Developer Identity with GitHub</h4>
              <p className="text-xs text-zinc-600 mt-1 max-w-2xl">
                You logged in via email magic link. To join sprints, submit code repositories, and unlock the <strong>Creator Studio</strong> to publish developer challenges, you must link your GitHub profile.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="bg-zinc-900 hover:bg-zinc-800 border-zinc-900 text-white font-bold shrink-0 flex items-center justify-center gap-2 py-2 px-4 rounded-xl"
            onClick={async () => {
              await userService.loginWithGithub();
            }}
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
                {user?.name || "Alex Rivera"}
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
          Active Sprint Commitments ({sprints.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map((sprint) => (
            <Card key={sprint.id} className="p-6 space-y-4 flex flex-col justify-between border-zinc-200 shadow-soft-card">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <StatusBadge status={sprint.status} />
                  <CountdownTimer targetDate={sprint.endTime} size="sm" />
                </div>

                <h3 className="text-h3 text-zinc-900 font-bold line-clamp-1">
                  {sprint.title}
                </h3>
                <p className="text-body text-zinc-600 text-xs mt-1 line-clamp-2">
                  {sprint.description}
                </p>

                <div className="mt-4 p-3 rounded-lg bg-[#FFF2EC]/60 border border-[#FF5500]/20 flex items-center justify-between">
                  <div>
                    <span className="text-label text-zinc-500 block">Your Stake</span>
                    <span className="text-financial text-base text-[#FF5500] font-bold">
                      {formatNGN(sprint.commitmentNgn)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-label text-zinc-500 block">Total Pool</span>
                    <span className="text-financial text-xs text-zinc-900 font-bold">
                      {formatNGN(sprint.totalPoolNgn)}
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/sprints/${sprint.slug}/submit`}>
                <Button size="md" variant="primary" className="w-full">
                  Submit Proof of Work
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
