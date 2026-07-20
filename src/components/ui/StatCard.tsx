"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  highlight = false,
  className,
}) => {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between p-5 border",
        highlight
          ? "border-[#FF5500]/40 bg-[#FFF2EC]/60 shadow-orange-glow"
          : "border-zinc-200 bg-white",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-label text-zinc-500">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "p-2 rounded-lg text-[#FF5500] bg-[#FFF2EC] border border-[#FF5500]/20"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div
          className={cn(
            "text-financial text-2xl lg:text-3xl",
            highlight ? "text-[#FF5500]" : "text-zinc-900"
          )}
        >
          {value}
        </div>
        {(subtext || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-caption text-zinc-600">
            {trend && (
              <span
                className={cn(
                  "font-mono font-tabular font-bold",
                  trend.isPositive ? "text-[#00C471]" : "text-red-600"
                )}
              >
                {trend.value}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};
