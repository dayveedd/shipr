"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ExecutionRank, SprintStatus } from "@/types";
import { Shield, Trophy, Zap, Award, CheckCircle2, XCircle, Clock } from "lucide-react";

interface RankBadgeProps {
  rank: ExecutionRank;
  className?: string;
  showIcon?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  className,
  showIcon = true,
}) => {
  const rankConfigs = {
    BRONZE: {
      label: "Bronze Shipper",
      icon: Shield,
      style: "bg-amber-50 text-amber-900 border-amber-200",
      emoji: "🥉",
    },
    SILVER: {
      label: "Silver Shipper",
      icon: Award,
      style: "bg-slate-100 text-slate-800 border-slate-300",
      emoji: "🥈",
    },
    GOLD: {
      label: "Gold Shipper",
      icon: Trophy,
      style: "bg-yellow-50 text-yellow-900 border-yellow-300 shadow-sm",
      emoji: "🥇",
    },
    ELITE: {
      label: "Elite Shipper",
      icon: Zap,
      style: "bg-[#FF5500] text-white border-[#FF5500] font-bold shadow-orange-glow",
      emoji: "💎",
    },
  };

  const config = rankConfigs[(rank || "BRONZE").toUpperCase() as keyof typeof rankConfigs] || rankConfigs.BRONZE;
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-badge border backdrop-blur-sm",
        config.style,
        className
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
      {showIcon && <IconComponent className="w-3 h-3 ml-0.5 opacity-80" />}
    </span>
  );
};

interface StatusBadgeProps {
  status: SprintStatus | "PASS" | "FAIL" | "PENDING";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfigs = {
    ACTIVE: {
      label: "Sprint Active",
      icon: Zap,
      style: "bg-[#FFF2EC] text-[#FF5500] border-[#FF5500]/40 font-bold animate-pulse",
    },
    UPCOMING: {
      label: "Upcoming",
      icon: Clock,
      style: "bg-zinc-100 text-zinc-700 border-zinc-200",
    },
    EVALUATING: {
      label: "AI Judging",
      icon: Clock,
      style: "bg-amber-50 text-amber-900 border-amber-200 animate-pulse",
    },
    SETTLED: {
      label: "Settled",
      icon: CheckCircle2,
      style: "bg-zinc-100 text-zinc-800 border-zinc-200",
    },
    PASS: {
      label: "PASSED",
      icon: CheckCircle2,
      style: "bg-emerald-50 text-[#00C471] border-[#00C471]/40 font-extrabold",
    },
    FAIL: {
      label: "FAILED",
      icon: XCircle,
      style: "bg-red-50 text-red-600 border-red-200 font-extrabold",
    },
    PENDING: {
      label: "Pending",
      icon: Clock,
      style: "bg-amber-50 text-amber-900 border-amber-200",
    },
  };

  const config = statusConfigs[status];
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-badge border",
        config.style,
        className
      )}
    >
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};
