"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { RankBadge, StatusBadge } from "@/components/ui/Badge";
import { formatNGN } from "@/lib/utils";
import { userService, sprintService } from "@/services";
import { User, Sprint, Submission } from "@/types";
import { Github, Trophy, Flame, CheckCircle2, Shield, Calendar, ExternalLink, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [sprintsMap, setSprintsMap] = useState<Record<string, Sprint>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      setIsLoading(true);
      const uRes = await userService.getUserByUsername(username);
      if (uRes.success && uRes.data) {
        setProfile(uRes.data);

        // Fetch user's real submissions from Supabase
        const { data: subData } = await supabase
          .from("submissions")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (subData) {
          const mappedSubs: Submission[] = subData.map((s: any) => ({
            id: s.id,
            sprintId: s.sprint_id,
            userId: s.user_id,
            githubRepoUrl: s.github_repo_url,
            deploymentUrl: s.deployment_url,
            notes: s.notes,
            submittedAt: s.submitted_at,
            stage: s.stage,
            version: s.version || 1,
            evaluation_result: s.evaluation_result,
          }));
          setSubmissions(mappedSubs);
        }
      }

      const sRes = await sprintService.getSprints();
      if (sRes.success && sRes.data) {
        const sm: Record<string, Sprint> = {};
        sRes.data.forEach((s) => (sm[s.id] = s));
        setSprintsMap(sm);
      }
      setIsLoading(false);
    }

    loadProfileData();
  }, [username]);

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-text-dim">
        Loading builder profile...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Profile Card */}
      <Card className="p-8 border-brand-emerald/40 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-20 h-20 rounded-full border-2 border-[#FF5500] object-cover shadow-orange-glow"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-sans">
                  {profile.name}
                </h1>
                <RankBadge rank={profile.rank} />
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 font-mono">
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#FF5500] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>@{profile.githubUsername}</span>
                </a>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Joined {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-200">
          <StatCard label="Total NGN Earned" value={formatNGN(profile.totalEarnedNgn)} icon={<Trophy className="w-4 h-4 text-[#FF5500]" />} highlight />
          <StatCard label="Success Rate" value={`${profile.successRate}%`} icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} />
          <StatCard label="Current Streak" value={`${profile.currentStreak} Sprints`} icon={<Flame className="w-4 h-4 text-amber-500" />} />
          <StatCard label="Sprints Completed" value={profile.sprintsCompleted} icon={<Shield className="w-4 h-4 text-purple-600" />} />
        </div>
      </Card>

      {/* Verified Execution History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 font-sans">
          Verified Execution History
        </h2>

        {submissions.length === 0 ? (
          <Card className="p-8 text-center text-zinc-500 space-y-3 rounded-none border-zinc-200">
            <ShieldAlert className="w-8 h-8 text-zinc-400 mx-auto opacity-60" />
            <p className="text-sm font-mono font-bold text-zinc-800">No verified execution history found</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              This builder has not completed any passed sprint commitments yet. Verified proof certificates will appear here upon AI Judge settlement.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub: any) => {
              const sprint = sprintsMap[sub.sprintId];
              const evalResult = sub.evaluation_result?.result || sub.evaluation?.result;
              const isPass = sub.stage === "PAYMENT_SUCCESSFUL" || evalResult === "PASS";
              const isFail = sub.stage === "SUBMISSION_FAILED" || evalResult === "FAIL" || (!isPass && sub.stage !== "SUBMISSION_RECEIVED" && sub.stage !== "AI_REVIEW_IN_PROGRESS");

              return (
                <Card key={sub.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-none border-zinc-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={isPass ? "PASS" : isFail ? "FAIL" : "EVALUATING"} />
                      <span className="text-xs font-mono font-bold text-zinc-500">
                        {isPass ? `Payout: ${formatNGN(5000)}` : isFail ? "Stake Forfeited (50% Refunded)" : "Evaluation Pending"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">{sprint?.title || "Developer Sprint Challenge"}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                      Submitted: {sub.submittedAt} • Attempt v{sub.version || 1}
                    </p>
                  </div>

                  <Link href={`/proof/${sub.id}`} className="shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#FF5500] hover:underline">
                      <span>View Proof Lifecycle</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
