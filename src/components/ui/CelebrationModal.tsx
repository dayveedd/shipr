"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight, Zap, Trophy, PartyPopper } from "lucide-react";
import { Button } from "./Button";

interface CelebrationModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  buttonText?: string;
  onConfirm: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  title,
  subtitle,
  buttonText = "View Live Sprints →",
  onConfirm,
}) => {
  const [balloons, setBalloons] = useState<Array<{ id: number; left: number; color: string; delay: number; speed: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      const colors = ["#FF5500", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#F59E0B"];
      const generated = Array.from({ length: 18 }).map((_, idx) => ({
        id: idx,
        left: Math.random() * 90 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.8,
        speed: Math.random() * 2 + 3,
      }));
      setBalloons(generated);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Animated Floating & Popping Balloons Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {balloons.map((b) => (
          <div
            key={b.id}
            className="absolute bottom-0 text-3xl sm:text-4xl animate-floatUp"
            style={{
              left: `${b.left}%`,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.speed}s`,
            }}
          >
            🎈
          </div>
        ))}

        {/* Confetti Poppers */}
        <div className="absolute top-10 left-10 text-4xl animate-bounce">🎉</div>
        <div className="absolute top-10 right-10 text-4xl animate-bounce">🥳</div>
        <div className="absolute bottom-20 left-1/4 text-3xl animate-pulse">✨</div>
        <div className="absolute bottom-20 right-1/4 text-3xl animate-pulse">🏆</div>
      </div>

      {/* Modal Dialog Body */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 border border-zinc-200 shadow-2xl text-center space-y-6 animate-scaleUp z-10">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF2EC] border-4 border-[#FF5500]/20 flex items-center justify-center shadow-orange-glow relative">
          <PartyPopper className="w-10 h-10 text-[#FF5500] animate-bounce" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow">
            ✓
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHALLENGE CREATED & PUBLISHED</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-sans tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-sans max-w-sm mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-orange-glow"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
