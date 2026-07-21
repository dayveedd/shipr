"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { formatNGN } from "@/lib/utils";
import { ShieldCheck, Users, AlertTriangle, Cpu, Server, FileText, ExternalLink } from "lucide-react";

export default function AdminPortalPage() {
  const [creators, setCreators] = useState([
    { id: "c1", name: "David Kim", email: "david@builds.io", category: "FRONTEND", github: "https://github.com/davidkim", status: "PENDING" },
    { id: "c2", name: "Elena Rostova", email: "elena@ai.lab", category: "AI_ENGINEERING", github: "https://github.com/elenarostova", status: "PENDING" },
  ]);

  const [disputes, setDisputes] = useState([
    { id: "disp_1", builder: "Alex Rivera", sprintTitle: "React Landing Page 48h Sprint", aiVerdict: "FAIL", reason: "Hero CTA button class name mismatch", status: "OPEN" },
  ]);

  const handleApproveCreator = (id: string) => {
    setCreators(creators.map(c => c.id === id ? { ...c, status: "APPROVED" } : c));
    alert("Creator approved & granted challenge creation permissions!");
  };

  const handleRejectCreator = (id: string) => {
    setCreators(creators.map(c => c.id === id ? { ...c, status: "REJECTED" } : c));
  };

  const handleOverrideAi = (disputeId: string, overrideVerdict: "PASS" | "FAIL") => {
    setDisputes(disputes.map(d => d.id === disputeId ? { ...d, status: "RESOLVED" } : d));
    alert(`Admin Override Applied: Verdict updated to ${overrideVerdict}. Settlement re-queued.`);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
            <span>PLATFORM GOVERNANCE & CONTROL CENTER</span>
          </div>
          <h1 className="text-h1 text-zinc-900 font-extrabold font-sans">
            ShipR Admin Management
          </h1>
          <p className="text-body text-zinc-600 mt-1">
            Manage creator verification applications, override AI verdict disputes, and audit Monnify escrow settlement health.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-zinc-900 text-white font-mono text-xs font-bold shrink-0">
          Role: PLATFORM_ADMIN
        </div>
      </div>

      {/* Admin Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Monnify Escrow Vault"
          value={formatNGN(4250000)}
          subtext="42 Active Pools Locked"
          icon={<ShieldCheck className="w-5 h-5 text-[#FF5500]" />}
          highlight
        />
        <StatCard
          label="Verified Creators"
          value="18"
          subtext="Approved Challenge Publishers"
          icon={<Users className="w-5 h-5 text-[#FF5500]" />}
        />
        <StatCard
          label="AI Scans Run"
          value="1,420"
          subtext="OpenRouter AI Judge Executions"
          icon={<Cpu className="w-5 h-5 text-[#FF5500]" />}
        />
        <StatCard
          label="Pending Appeals"
          value={String(disputes.filter(d => d.status === "OPEN").length)}
          subtext="AI Dispute Escalations"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Section 1: Creator Verification Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-zinc-900 font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF5500]" />
            <span>1. Pending Creator Verification Queue</span>
          </h2>
          <span className="text-caption font-mono text-zinc-500">
            {creators.filter(c => c.status === "PENDING").length} Applications Awaiting Decision
          </span>
        </div>

        <Card className="overflow-hidden border-zinc-200 shadow-soft-card bg-white p-0">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-100/80 text-zinc-900 text-xs uppercase font-mono font-bold border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3.5">Applicant Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Engineering Domain</th>
                <th className="px-6 py-3.5">GitHub Profile</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {creators.map((creator) => (
                <tr key={creator.id} className="hover:bg-[#FFF2EC]/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 font-sans">{creator.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">{creator.email}</td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-[#FF5500]">{creator.category}</td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <a
                      href={creator.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF5500] hover:underline flex items-center gap-1"
                    >
                      <span>{creator.github.replace("https://", "")}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                      creator.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : creator.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {creator.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {creator.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveCreator(creator.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-bold text-xs shadow-orange-glow transition-all font-sans"
                        >
                          Approve Creator
                        </button>
                        <button
                          onClick={() => handleRejectCreator(creator.id)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs border border-zinc-200 transition-colors font-sans"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Section 2: AI Verdict Dispute Appeals */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-zinc-900 font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>2. AI Verdict Dispute Appeals & Overrides</span>
          </h2>
        </div>

        <Card className="overflow-hidden border-zinc-200 shadow-soft-card bg-white p-0">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-100/80 text-zinc-900 text-xs uppercase font-mono font-bold border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3.5">Builder</th>
                <th className="px-6 py-3.5">Sprint Title</th>
                <th className="px-6 py-3.5">AI Verdict</th>
                <th className="px-6 py-3.5">Appeal Grounds</th>
                <th className="px-6 py-3.5 text-right">Admin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {disputes.map((disp) => (
                <tr key={disp.id} className="hover:bg-[#FFF2EC]/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 font-sans">{disp.builder}</td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-800">{disp.sprintTitle}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={disp.aiVerdict as "PASS" | "FAIL"} />
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-600">{disp.reason}</td>
                  <td className="px-6 py-4 text-right">
                    {disp.status === "OPEN" ? (
                      <button
                        onClick={() => handleOverrideAi(disp.id, "PASS")}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-bold text-xs shadow-orange-glow transition-all font-sans"
                      >
                        Override to PASS
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-emerald-600 font-bold">✓ OVERRIDDEN TO PASS</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
