"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { RankBadge, StatusBadge } from "@/components/ui/Badge";
import { formatNGN } from "@/lib/utils";
import { userService, sprintService } from "@/services";
import { User, Sprint } from "@/types";
import { Github, Trophy, Flame, CheckCircle2, Shield, Calendar, ExternalLink } from "lucide-react";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<User | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);

  useEffect(() => {
    userService.getUserByUsername(username).then((res) => {
      if (res.success) setProfile(res.data);
    });
    sprintService.getSprints().then((res) => {
      if (res.success) setSprints(res.data);
    });
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
              className="w-20 h-20 rounded-full border-2 border-brand-emerald/50 object-cover shadow-emerald-glow"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                  {profile.name}
                </h1>
                <RankBadge rank={profile.rank} />
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary font-mono">
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-brand-emerald transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>@{profile.githubUsername}</span>
                </a>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-text-dim" />
                  <span>Joined {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-surface-border">
          <StatCard label="Total NGN Earned" value={formatNGN(profile.totalEarnedNgn)} icon={<Trophy className="w-4 h-4 text-brand-emerald" />} highlight />
          <StatCard label="Success Rate" value={`${profile.successRate}%`} icon={<CheckCircle2 className="w-4 h-4 text-brand-emerald" />} />
          <StatCard label="Current Streak" value={`${profile.currentStreak} Sprints`} icon={<Flame className="w-4 h-4 text-amber-400" />} />
          <StatCard label="Sprints Completed" value={profile.sprintsCompleted} icon={<Shield className="w-4 h-4 text-purple-400" />} />
        </div>
      </Card>

      {/* Completed Sprints Portfolio */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary">
          Verified Execution History
        </h2>

        <div className="space-y-4">
          {sprints.map((sprint) => (
            <Card key={sprint.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status="PASS" />
                  <span className="text-xs font-mono text-text-dim">
                    Payout: {formatNGN(sprint.commitmentNgn + 1250)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-text-primary">{sprint.title}</h3>
                <p className="text-xs text-text-secondary mt-0.5">{sprint.description}</p>
              </div>

              <Link href={`/sprints/${sprint.slug}`} className="shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald hover:underline">
                  <span>View Proof</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
