"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { RankBadge } from "@/components/ui/Badge";
import { formatNGN } from "@/lib/utils";
import { leaderboardService, userService } from "@/services";
import { LeaderboardEntry } from "@/types";
import { Trophy, Flame, CheckCircle, Award } from "lucide-react";

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [metric, setMetric] = useState<"earnings" | "streak" | "success">("earnings");

  useEffect(() => {
    userService.getCurrentUser().then((res) => {
      if (res.success && res.data) {
        leaderboardService.getLeaderboard().then((lRes) => {
          if (lRes.success) setEntries(lRes.data);
        });
      } else {
        router.push("/login?redirect=/leaderboard");
      }
    });
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] uppercase tracking-wider mb-1 font-bold">
            <Trophy className="w-4 h-4 text-[#FF5500]" />
            <span>PROOF-OF-WORK LEADERBOARD</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-sans">
            Top Execution Rankings
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Builders ranked by verified commitment pool earnings, completed sprints, and consistency streaks.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => setMetric("earnings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === "earnings"
                ? "bg-white text-[#FF5500] border border-[#FF5500]/30 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Total Earned
          </button>
          <button
            onClick={() => setMetric("streak")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === "streak"
                ? "bg-white text-[#FF5500] border border-[#FF5500]/30 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Active Streak
          </button>
          <button
            onClick={() => setMetric("success")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === "success"
                ? "bg-white text-[#FF5500] border border-[#FF5500]/30 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Success Rate
          </button>
        </div>
      </div>

      {/* Top 3 Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {entries.slice(0, 3).map((entry, idx) => (
          <Card key={entry.user.id} className="p-6 relative text-center space-y-4 border-[#FF5500]/30 shadow-soft-card">
            <div className="absolute top-4 right-4">
              <span className="w-8 h-8 rounded-full bg-[#FFF2EC] text-[#FF5500] flex items-center justify-center font-mono font-bold text-sm border border-[#FF5500]/20">
                #{idx + 1}
              </span>
            </div>

            <img
              src={entry.user.avatarUrl}
              alt={entry.user.name}
              className="w-20 h-20 rounded-full mx-auto border-2 border-[#FF5500] object-cover shadow-orange-glow"
            />

            <div>
              <h3 className="text-lg font-bold text-zinc-900">{entry.user.name}</h3>
              <p className="text-xs font-mono text-zinc-500">@{entry.user.githubUsername}</p>
              <div className="mt-2 inline-block">
                <RankBadge rank={entry.user.rank} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-center">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Earned</span>
                <span className="text-sm font-mono font-bold text-[#FF5500]">
                  {formatNGN(entry.totalEarnedNgn)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Streak</span>
                <span className="text-sm font-mono font-bold text-zinc-900">
                  {entry.streak} Sprints
                </span>
              </div>
            </div>

            <Link href={`/profile/${entry.user.githubUsername}`}>
              <button className="w-full py-2 rounded-lg bg-zinc-100 hover:bg-[#FFF2EC] hover:text-[#FF5500] text-xs font-bold text-zinc-800 transition-colors mt-2">
                View Execution Profile
              </button>
            </Link>
          </Card>
        ))}
      </div>

      {/* Full Rankings Table */}
      <Card className="overflow-hidden border-zinc-200 shadow-soft-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-100 text-zinc-900 text-xs uppercase font-mono font-bold border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Builder</th>
                <th className="px-6 py-3.5">Execution Rank</th>
                <th className="px-6 py-3.5 text-right">Success Rate</th>
                <th className="px-6 py-3.5 text-right">Streak</th>
                <th className="px-6 py-3.5 text-right">Total Net Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {entries.map((entry, idx) => (
                <tr key={entry.user.id} className="hover:bg-[#FFF2EC]/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                    #{idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/profile/${entry.user.githubUsername}`} className="flex items-center gap-3 group">
                      <img
                        src={entry.user.avatarUrl}
                        alt={entry.user.name}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-200 group-hover:border-[#FF5500]"
                      />
                      <div>
                        <p className="font-bold text-zinc-900 group-hover:text-[#FF5500] transition-colors">
                          {entry.user.name}
                        </p>
                        <p className="text-xs font-mono text-zinc-500">@{entry.user.githubUsername}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <RankBadge rank={entry.user.rank} />
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                    {entry.successRate}%
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-zinc-900">
                    {entry.streak} 🔥
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-[#FF5500] text-base">
                    {formatNGN(entry.totalEarnedNgn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
