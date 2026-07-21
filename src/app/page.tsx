"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, RankBadge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { formatNGN } from "@/lib/utils";
import { sprintService, userService } from "@/services";
import { Sprint, User } from "@/types";
import { Zap, ShieldCheck, Cpu, ArrowRight, Trophy, Flame, CheckCircle, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    sprintService.getSprints().then((res) => {
      if (res.success) setSprints(res.data);
    });
    userService.getCurrentUser().then((res) => {
      if (res.success) setUser(res.data);
    });
  }, []);

  const totalActivePool = sprints.reduce((acc, curr) => acc + curr.totalPoolNgn, 0);

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Hero Background Grid & Ambient Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] cyber-grid pointer-events-none opacity-40 -z-10" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF5500]/10 blur-[140px] pointer-events-none -z-10 rounded-full" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Platform Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EC] border border-[#FF5500]/30 text-badge text-[#FF5500] shadow-orange-glow font-bold">
            <Zap className="w-3.5 h-3.5 fill-[#FF5500]" />
            <span>AI-POWERED PROOF-OF-WORK PLATFORM</span>
          </div>

          {/* Tagline Headline - Massive Hero Display */}
          <h1 className="text-hero-display text-5xl sm:text-7xl lg:text-8xl text-zinc-900 font-extrabold tracking-tighter leading-[1.05]">
            Execution Pays. <br />
            <span className="text-[#FF5500]">Excuses Don't.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-zinc-600 max-w-2xl mx-auto">
            Commit money to 48-hour coding sprints. Prove your work. AI judges your submission. <span className="text-zinc-900 font-semibold">Finish and earn rewards from the Commitment Pool.</span> Procrastinate and lose your stake.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sprints">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Browse Active Sprints
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="secondary">
                How Commitment Works
              </Button>
            </Link>
          </div>
          </div>

        {/* Global Live Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-16">
          <StatCard
            label="Total Pool Locked"
            value={formatNGN(totalActivePool || 475000)}
            subtext="Live across 3 active sprints"
            icon={<ShieldCheck className="w-5 h-5 text-[#FF5500]" />}
            highlight
          />
          <StatCard
            label="AI Verification Rate"
            value="98.4%"
            subtext="OpenRouter AI Judge visual scanner"
            icon={<Cpu className="w-5 h-5 text-[#FF5500]" />}
          />
          <StatCard
            label="Active Builders"
            value="43"
            subtext="Committing stakes today"
            icon={<Users className="w-5 h-5 text-[#FF5500]" />}
          />
          <StatCard
            label="Average Sprint Payout"
            value="₦6,250"
            subtext="Initial stake + 25% fail pool bonus"
            icon={<Trophy className="w-5 h-5 text-[#FF5500]" />}
          />
        </div>
      </section>

      {/* Featured Active Sprints Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-label text-[#FF5500] mb-1 font-bold">
              <Flame className="w-4 h-4 text-[#FF5500]" />
              <span>LIVE COMMITMENT POOLS</span>
            </div>
            <h2 className="text-h2 text-zinc-900">
              Featured Coding Sprints
            </h2>
          </div>
          <Link href="/sprints" className="text-button text-[#FF5500] hover:underline flex items-center gap-1 font-bold">
            <span>View All 8 Sprints</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Sprint Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map((sprint) => {
            const slotsLeft = sprint.totalSlots - sprint.filledSlots;

            return (
              <Card key={sprint.id} className="flex flex-col justify-between group p-6">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <StatusBadge status={sprint.status} />
                    <CountdownTimer targetDate={sprint.endTime} size="sm" />
                  </div>

                  <h3 className="text-h3 text-zinc-900 group-hover:text-[#FF5500] transition-colors line-clamp-1">
                    {sprint.title}
                  </h3>
                  <p className="text-body text-zinc-600 mt-1.5 line-clamp-2">
                    {sprint.description}
                  </p>

                  {/* Financial Stake Box */}
                  <div className="mt-5 p-3.5 rounded-lg bg-[#FFF2EC]/60 border border-[#FF5500]/20 flex items-center justify-between">
                    <div>
                      <span className="text-label text-zinc-500 block">
                        Commitment Stake
                      </span>
                      <span className="text-financial text-lg text-[#FF5500] font-bold">
                        {formatNGN(sprint.commitmentNgn)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-label text-zinc-500 block">
                        Total Pool
                      </span>
                      <span className="text-financial text-sm text-zinc-900 font-bold">
                        {formatNGN(sprint.totalPoolNgn)}
                      </span>
                    </div>
                  </div>

                  {/* Definition of Done Preview */}
                  <div className="mt-4 space-y-2">
                    <span className="text-label text-zinc-500 block">
                      Definition of Done ({sprint.definitionOfDone.length} Criteria)
                    </span>
                    <ul className="space-y-1.5 text-body text-zinc-600">
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
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-200">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-label text-[#FF5500] font-bold">
            Proof of Work Architecture
          </span>
          <h2 className="text-h1 text-zinc-900">
            How ShipR Converts Intent into Execution
          </h2>
          <p className="text-body-lg text-zinc-600">
            No endless streak counters or harmless notifications. Real stake backed by AI verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 space-y-4 border-[#FF5500]/20 hover:border-[#FF5500]/40">
            <div className="w-12 h-12 rounded-xl bg-[#FF5500] text-white flex items-center justify-center font-mono font-bold text-lg font-tabular shadow-orange-glow">
              01
            </div>
            <h3 className="text-h3 text-zinc-900">Commit & Stake</h3>
            <p className="text-body text-zinc-600">
              Select a 48h coding sprint and commit funds via Monnify. Your stake enters the sprint’s dedicated Commitment Pool with other builders.
            </p>
          </Card>

          <Card className="p-8 space-y-4 border-[#FF5500]/20 hover:border-[#FF5500]/40">
            <div className="w-12 h-12 rounded-xl bg-[#FF5500] text-white flex items-center justify-center font-mono font-bold text-lg font-tabular shadow-orange-glow">
              02
            </div>
            <h3 className="text-h3 text-zinc-900">Build & Submit Proof</h3>
            <p className="text-body text-zinc-600">
              Build your project before the clock hits 0:00:00. Submit your GitHub repository URL and live deployment link to the platform.
            </p>
          </Card>

          <Card className="p-8 space-y-4 border-[#FF5500]/20 hover:border-[#FF5500]/40">
            <div className="w-12 h-12 rounded-xl bg-[#FF5500] text-white flex items-center justify-center font-mono font-bold text-lg font-tabular shadow-orange-glow">
              03
            </div>
            <h3 className="text-h3 text-zinc-900">AI Evaluation & Payout</h3>
            <p className="text-body text-zinc-600">
              OpenRouter AI Judge inspects repo code and live deployment against the Definition of Done. PASSers get initial stake + bonus pool split!
            </p>
          </Card>
        </div>
      </section>

      {/* Execution Reputation Ranks Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 sm:p-12 border-[#FF5500]/30 bg-gradient-to-r from-white to-[#FFF2EC] shadow-soft-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-label text-[#FF5500] font-bold">
                Permanent Reputation System
              </span>
              <h2 className="text-h2 text-zinc-900">
                Earn Your Builder Execution Rank
              </h2>
              <p className="text-body text-zinc-600">
                Every completed sprint builds your permanent proof-of-work profile. Climb ranks from Bronze to Elite Shipper based on completion consistency, streak multipliers, and net earnings.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <RankBadge rank="BRONZE" />
                <RankBadge rank="SILVER" />
                <RankBadge rank="GOLD" />
                <RankBadge rank="ELITE" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Current Top Streak" value="14 Sprints" subtext="Held by @sarah_code" icon={<Flame className="w-5 h-5 text-[#FF5500]" />} highlight />
              <StatCard label="Highest Single Payout" value="₦18,750" subtext="Full-Stack SaaS Sprint" icon={<Trophy className="w-5 h-5 text-[#FF5500]" />} />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
