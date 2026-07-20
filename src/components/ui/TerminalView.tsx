"use client";

import React, { useEffect, useState } from "react";
import { Terminal, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { DodCheckResult } from "@/types";

interface TerminalViewProps {
  reasoning: DodCheckResult[];
  confidenceScore: number;
  result: "PASS" | "FAIL";
  onComplete?: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  reasoning,
  confidenceScore,
  result,
  onComplete,
}) => {
  const [displayedLogs, setDisplayedLogs] = useState<
    Array<{ type: "info" | "success" | "fail"; message: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentIndex === 0) {
      setDisplayedLogs([
        { type: "info", message: "[AI JUDGE] Initializing Gemini 1.5 Pro inspection pipeline..." },
        { type: "info", message: "[GITHUB API] Connecting to repository metadata and file tree..." },
      ]);
    }

    if (currentIndex < reasoning.length) {
      const timer = setTimeout(() => {
        const item = reasoning[currentIndex];
        setDisplayedLogs((prev) => [
          ...prev,
          {
            type: item.isPassed ? "success" : "fail",
            message: `[CHECK DoD #${currentIndex + 1}] ${item.itemTitle}: ${item.details} (${item.confidence}% confidence)`,
          },
        ]);
        setCurrentIndex((prev) => prev + 1);
      }, 700);

      return () => clearTimeout(timer);
    } else if (currentIndex === reasoning.length && !isDone) {
      const timer = setTimeout(() => {
        setDisplayedLogs((prev) => [
          ...prev,
          {
            type: result === "PASS" ? "success" : "fail",
            message: `[FINAL VERDICT] Overall Verdict: ${result} — Confidence: ${confidenceScore}%`,
          },
        ]);
        setIsDone(true);
        if (onComplete) onComplete();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, reasoning, result, confidenceScore, isDone, onComplete]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden font-mono shadow-soft-card">
      {/* Light Theme Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-100/90 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs text-zinc-700 ml-2 flex items-center gap-1.5 font-bold font-mono">
            <Terminal className="w-3.5 h-3.5 text-[#FF5500]" />
            shipr-ai-judge-evaluator.v1.0
          </span>
        </div>
        {!isDone && (
          <div className="flex items-center gap-1.5 text-xs text-[#FF5500] font-mono font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Scanning live submission...</span>
          </div>
        )}
      </div>

      {/* Light Theme Console Body */}
      <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto text-terminal-log bg-white">
        {displayedLogs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2.5 animate-fadeIn font-mono font-tabular">
            {log.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {log.type === "fail" && (
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            {log.type === "info" && (
              <span className="text-[#FF5500] font-bold shrink-0">$</span>
            )}
            <span
              className={
                log.type === "success"
                  ? "text-emerald-700 font-bold"
                  : log.type === "fail"
                  ? "text-red-700 font-bold"
                  : "text-zinc-800"
              }
            >
              {log.message}
            </span>
          </div>
        ))}

        {!isDone && (
          <div className="flex items-center gap-1 text-[#FF5500] animate-pulse">
            <span className="inline-block w-2 h-4 bg-[#FF5500]" />
          </div>
        )}
      </div>
    </div>
  );
};
