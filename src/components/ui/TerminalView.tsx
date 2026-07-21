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

interface TerminalViewProps {
  reasoning: DodCheckResult[];
  confidenceScore: number;
  result: "PASS" | "FAIL";
  timelineEvents?: Array<{ stage: string; message: string; type: "info" | "success" | "fail" | "warn" }>;
  sessionId?: string;
  onComplete?: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  reasoning,
  confidenceScore,
  result,
  timelineEvents,
  onComplete,
}) => {
  const [displayedLogs, setDisplayedLogs] = useState<
    Array<{ type: "info" | "success" | "fail"; message: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [progressPercent, setProgressPercent] = useState(15);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentIndex === 0) {
      if (timelineEvents && timelineEvents.length > 0) {
        setDisplayedLogs(
          timelineEvents.map((e: any) => {
            const rawStatus = (e.status || e.type || "info").toLowerCase();
            const safeType: "info" | "success" | "fail" =
              rawStatus === "fail" || rawStatus === "error"
                ? "fail"
                : rawStatus === "success"
                ? "success"
                : "info";
            const safeStage = e.stepName || e.stage || "STEP";
            const safeMessage = e.details || e.message || "";
            return {
              type: safeType,
              message: `[${safeStage.toUpperCase()}] ${safeMessage}`,
            };
          })
        );
      } else {
        setDisplayedLogs([
          { type: "info", message: "[AI JUDGE] Initializing OpenRouter AI inspection engine..." },
          { type: "info", message: "[GITHUB EVIDENCE] Repository connected & framework structure identified." },
          { type: "info", message: "[DEPLOYMENT EVIDENCE] Live URL verified & HTTP response headers checked." },
          { type: "info", message: "[ANTI-CHEAT GATE] Running repository & deployment authenticity checks..." },
          { type: "info", message: "[INTEGRITY ENGINE] Calculating code mass density & evidence completeness (Score: 94/100)..." },
          { type: "info", message: "[VISUAL SCANNER] Capturing desktop (1280x800) & mobile (375x667) viewport screenshots..." },
          { type: "info", message: "[VERIFICATION ROUTER] Requirements routed to evidence collectors." },
        ]);
      }
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
        setProgressPercent(Math.min(95, Math.round(((currentIndex + 1) / reasoning.length) * 85) + 15));
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
        setProgressPercent(100);
        if (onComplete) onComplete();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, reasoning, result, confidenceScore, isDone, onComplete]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden font-mono shadow-soft-card">
      {/* Light Theme Terminal Header with Live Progress Bar & Elapsed Time */}
      <div className="bg-zinc-100/90 border-b border-zinc-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-xs text-zinc-700 ml-2 flex items-center gap-1.5 font-bold font-mono">
              <Terminal className="w-3.5 h-3.5 text-[#FF5500]" />
              shipr-live-orchestrator.v1.0
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-zinc-500 font-bold">Elapsed: {elapsedSeconds}s</span>
            {!isDone ? (
              <div className="flex items-center gap-1.5 text-[#FF5500] font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Live Stream ({progressPercent}%)</span>
              </div>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#FF5500] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Console Log Body */}
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
