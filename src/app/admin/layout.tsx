"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userService } from "@/services";
import { ShieldCheck, Lock, LogOut, Activity, Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    userService.getCurrentUser().then((res) => {
      if (res.success && res.data?.role === "ADMIN") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push("/login?redirect=/admin");
      }
    });
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5500]" />
        <p className="text-zinc-600 font-mono text-sm font-semibold">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans flex flex-col selection:bg-[#FF5500] selection:text-white">
      {/* Light Theme Admin Header Console */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-200 shadow-soft-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Admin Identity Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF2EC] border border-[#FF5500]/30 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#FF5500]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-900 font-sans">
                  Ship<span className="text-[#FF5500]">R</span> Governance
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-mono text-emerald-800 font-bold">
                  ● SECURE AUTH
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                Isolated Platform Admin Control Portal v2.0
              </p>
            </div>
          </div>

          {/* Escrow Health & System Status Ticker */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono font-tabular">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-zinc-500">Escrow Engine:</span>
              <span className="text-emerald-700 font-bold">OPERATIONAL</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200">
              <Lock className="w-3.5 h-3.5 text-[#FF5500]" />
              <span className="text-zinc-500">Monnify Vault:</span>
              <span className="text-zinc-900 font-bold">₦4,250,000</span>
            </div>
          </div>

          {/* Admin Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/sprints"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 border border-zinc-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-500" />
              <span>Exit Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Console Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>

      {/* Admin Audit Footer */}
      <footer className="border-t border-zinc-200 bg-white py-4 text-center text-xs font-mono font-tabular text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ShipR Platform Governance Engine • All Admin Actions Logged & Cryptographically Signed</span>
          <span>Session Hash: <strong className="text-zinc-800">0x7F9...B42E</strong></span>
        </div>
      </footer>
    </div>
  );
}
