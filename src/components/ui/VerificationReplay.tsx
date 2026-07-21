"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, CheckCircle2, XCircle, Info, Clock, ShieldCheck, Terminal } from "lucide-react";
import { EvidenceTimelineEvent } from "@/types";

interface VerificationReplayProps {
  timeline: EvidenceTimelineEvent[];
}

export const VerificationReplay: React.FC<VerificationReplayProps> = ({ timeline }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeline.length]);

  if (!timeline || timeline.length === 0) {
    return null;
  }

  const currentStep = timeline[activeStepIndex] || timeline[0];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-soft-card font-sans">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-zinc-50 border-b border-zinc-200 gap-3">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-[#FF5500]" />
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Verification Process Replay</h4>
            <p className="text-xs text-zinc-500 font-mono">
              Step {activeStepIndex + 1} of {timeline.length}: {currentStep.stepName}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeStepIndex === 0}
            className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 rounded-lg bg-[#FF5500] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#E04B00] transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? "Pause" : "Play Replay"}</span>
          </button>

          <button
            onClick={() => setActiveStepIndex((prev) => Math.min(timeline.length - 1, prev + 1))}
            disabled={activeStepIndex === timeline.length - 1}
            className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Replay Active Step Stage */}
      <div className="p-6 space-y-4">
        <div className="p-5 rounded-xl bg-zinc-900 text-white space-y-3 font-mono border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              {currentStep.status === "SUCCESS" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {currentStep.status === "FAIL" && <XCircle className="w-5 h-5 text-red-400" />}
              {currentStep.status === "INFO" && <Info className="w-5 h-5 text-amber-400" />}
              <span className="text-sm font-bold text-white">{currentStep.stepName}</span>
            </div>
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {currentStep.timestamp}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-300">
            <p><span className="text-[#FF5500] font-bold">SOURCE:</span> {currentStep.evidenceSource}</p>
            {currentStep.relatedRequirement && (
              <p><span className="text-amber-400 font-bold">REQUIREMENT:</span> {currentStep.relatedRequirement}</p>
            )}
            <p className="text-zinc-200 pt-1 leading-relaxed">{currentStep.details}</p>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-2">
          {timeline.map((event, idx) => (
            <button
              key={event.id || idx}
              onClick={() => {
                setActiveStepIndex(idx);
                setIsPlaying(false);
              }}
              className={`flex-1 min-w-[32px] h-2.5 rounded-full transition-all ${
                idx === activeStepIndex
                  ? "bg-[#FF5500] ring-2 ring-[#FF5500]/30 scale-105"
                  : idx < activeStepIndex
                  ? "bg-emerald-500"
                  : "bg-zinc-200 hover:bg-zinc-300"
              }`}
              title={`${idx + 1}. ${event.stepName}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
