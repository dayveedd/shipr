"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { formatNGN } from "@/lib/utils";
import { sprintService } from "@/services";
import { Sprint, SprintStatus, ChallengeCategory } from "@/types";
import { Search, Flame, Users, CheckCircle, Sparkles, Filter } from "lucide-react";

export default function SprintDiscoveryPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<SprintStatus | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    sprintService.getSprints().then((res) => {
      if (res.success) setSprints(res.data);
    });
  }, []);

  const filteredSprints = sprints.filter((s) => {
    const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;
    const matchesCategory = selectedCategory === "ALL" || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header & Creator Portal Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-[#FF5500]" />
            <span>DEVELOPER EXECUTION PLATFORM</span>
          </div>
          <h1 className="text-h1 text-zinc-900 font-extrabold font-sans">
            Explore Coding Sprints
          </h1>
          <p className="text-body text-zinc-600 mt-1">
            Commit money on real developer challenges across Frontend, Backend, Full Stack, Mobile, AI & DevOps. Prove your work to Gemini AI Judge and earn pool rewards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/creator/create">
            <Button variant="primary" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
              Create Challenge
            </Button>
          </Link>
        </div>
      </div>

      {/* Developer Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            {(["ALL", "ACTIVE", "UPCOMING", "SETTLED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? "bg-white text-[#FF5500] border border-[#FF5500]/30 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {st === "ALL" ? "All Statuses" : st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search developer sprints or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#FF5500]/50 shadow-soft-card"
            />
          </div>
        </div>

        {/* Developer Category Tabs Only */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#FF5500]" />
            Developer Domain:
          </span>

          {[
            { id: "ALL", label: "All Dev Domains" },
            { id: "FRONTEND", label: "Frontend Dev" },
            { id: "BACKEND", label: "Backend & API" },
            { id: "FULLSTACK", label: "Full Stack" },
            { id: "MOBILE", label: "Mobile Dev" },
            { id: "AI_ENGINEERING", label: "AI Engineering" },
            { id: "DEVOPS", label: "DevOps & Cloud" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as ChallengeCategory | "ALL")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-[#FF5500] text-white shadow-orange-glow"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sprint Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSprints.map((sprint) => {
          const slotsLeft = sprint.totalSlots - sprint.filledSlots;

          return (
            <Card key={sprint.id} className="flex flex-col justify-between group p-6 border-zinc-200 shadow-soft-card">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={sprint.status} />
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-[#FF5500] border border-zinc-200 uppercase">
                      {sprint.category}
                    </span>
                  </div>
                  <CountdownTimer targetDate={sprint.endTime} size="sm" />
                </div>

                <h3 className="text-h3 text-zinc-900 group-hover:text-[#FF5500] transition-colors line-clamp-1 font-bold">
                  {sprint.title}
                </h3>
                <p className="text-body text-zinc-600 text-xs mt-1.5 line-clamp-2">
                  {sprint.description}
                </p>

                {/* Creator Attribution */}
                {sprint.creatorName && (
                  <p className="text-caption text-zinc-500 mt-2 font-mono">
                    Published by: <strong className="text-zinc-800">{sprint.creatorName}</strong>
                  </p>
                )}

                {/* Stake Box */}
                <div className="mt-5 p-3.5 rounded-xl bg-[#FFF2EC]/60 border border-[#FF5500]/20 flex items-center justify-between">
                  <div>
                    <span className="text-label text-zinc-500 block font-bold">Commitment Stake</span>
                    <span className="text-financial text-lg text-[#FF5500] font-bold">
                      {formatNGN(sprint.commitmentNgn)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-label text-zinc-500 block font-bold">Total Pool</span>
                    <span className="text-financial text-sm text-zinc-900 font-bold">
                      {formatNGN(sprint.totalPoolNgn)}
                    </span>
                  </div>
                </div>

                {/* DoD Preview */}
                <div className="mt-4 space-y-2">
                  <span className="text-label text-zinc-500 block font-bold">
                    Definition of Done ({sprint.definitionOfDone.length} Rules)
                  </span>
                  <ul className="space-y-1.5 text-caption text-zinc-600">
                    {sprint.definitionOfDone.slice(0, 3).map((dod) => (
                      <li key={dod.id} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                        <span className="truncate">{dod.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="mt-6 pt-4 border-t border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-caption text-zinc-500">
                  <Users className="w-3.5 h-3.5 text-zinc-700" />
                  <span>
                    <strong className="text-zinc-900 font-bold font-mono font-tabular">{sprint.filledSlots}</strong>/{sprint.totalSlots} Slots ({slotsLeft} left)
                  </span>
                </div>

                <Link href={`/sprints/${sprint.slug}`}>
                  <Button size="sm" variant="primary">
                    Join Sprint
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
