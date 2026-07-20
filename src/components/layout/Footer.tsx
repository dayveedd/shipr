"use client";

import React from "react";
import Link from "next/link";
import { Zap, Github, Twitter } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-zinc-200 mt-20 text-zinc-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500] text-white flex items-center justify-center shadow-orange-glow">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-zinc-900">
                Ship<span className="text-[#FF5500]">R</span>
              </span>
            </Link>
            <p className="text-caption text-zinc-500">
              The AI-powered execution platform. Commit stake, ship real code, prove execution, earn pool rewards.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-label text-zinc-900 font-bold">Platform</h4>
            <ul className="space-y-2 text-caption">
              <li><Link href="/sprints" className="hover:text-[#FF5500] transition-colors">Active Sprints</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#FF5500] transition-colors">Global Leaderboard</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#FF5500] transition-colors">My Dashboard</Link></li>
            </ul>
          </div>

          {/* Community Links */}
          <div className="space-y-3">
            <h4 className="text-label text-zinc-900 font-bold">Community</h4>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-100 hover:bg-[#FFF2EC] hover:text-[#FF5500] text-zinc-800 transition-colors" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-100 hover:bg-[#FFF2EC] hover:text-[#FF5500] text-zinc-800 transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-zinc-500">
          <p>© 2026 ShipR Platform. All rights reserved.</p>
          <p className="font-mono text-[11px] text-[#FF5500] font-bold">Execution Pays. Excuses Don't.</p>
        </div>
      </div>
    </footer>
  );
};
