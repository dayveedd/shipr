"use client";

import React, { useEffect, useState } from "react";
import { formatCountdown, cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  size = "md",
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatCountdown(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const sizes = {
    sm: "text-xs gap-1 py-1 px-2.5",
    md: "text-sm gap-2 py-1.5 px-3.5",
    lg: "text-lg gap-3 py-3 px-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-[#FFF2EC] border border-[#FF5500]/30 text-timer text-[#FF5500]",
        sizes[size],
        timeLeft.isExpired && "text-red-600 border-red-200 bg-red-50",
        className
      )}
    >
      <Clock
        className={cn(
          "w-4 h-4 text-[#FF5500] animate-pulse",
          timeLeft.isExpired && "text-red-600 animate-none"
        )}
      />
      {timeLeft.isExpired ? (
        <span>SPRINT CLOSED</span>
      ) : (
        <div className="flex items-center gap-1 font-mono font-tabular">
          <span className="bg-white border border-[#FF5500]/20 px-1.5 py-0.5 rounded shadow-sm">{timeLeft.hours}h</span>
          <span>:</span>
          <span className="bg-white border border-[#FF5500]/20 px-1.5 py-0.5 rounded shadow-sm">{timeLeft.minutes}m</span>
          <span>:</span>
          <span className="bg-white border border-[#FF5500]/20 px-1.5 py-0.5 rounded shadow-sm">{timeLeft.seconds}s</span>
        </div>
      )}
    </div>
  );
};
