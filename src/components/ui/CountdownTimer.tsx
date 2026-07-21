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
        "inline-flex items-center text-[13px] font-medium text-zinc-600",
        timeLeft.isExpired && "text-red-600",
        className
      )}
    >
      <Clock
        className={cn(
          "w-3.5 h-3.5 text-zinc-400 mr-1.5 animate-pulse",
          timeLeft.isExpired && "text-red-500 animate-none"
        )}
      />
      {timeLeft.isExpired ? (
        <span className="font-bold">Closed</span>
      ) : (
        <span className="font-mono font-semibold tracking-wide">
          {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
        </span>
      )}
    </div>
  );
};
