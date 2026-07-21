"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Zap, Share2, Copy, Check, X, Twitter, Linkedin, ExternalLink } from "lucide-react";

interface ShareProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  sprintTitle: string;
  builderName: string;
  verdict: "PASS" | "FAIL";
  payoutNgn?: number;
}

export const ShareProofModal: React.FC<ShareProofModalProps> = ({
  isOpen,
  onClose,
  submissionId,
  sprintTitle,
  builderName,
  verdict,
  payoutNgn,
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/proof/${submissionId}`
    : `https://shipr.build/proof/${submissionId}`;

  const shareText = verdict === "PASS"
    ? `🔥 I just passed the 48h "${sprintTitle}" coding sprint on @ShipR_Build! AI verified my proof of work and unlocked ${payoutNgn ? `₦${payoutNgn.toLocaleString()}` : "my commitment pool reward"}. Execution pays!`
    : `🚀 Built and shipped "${sprintTitle}" in 48 hours on @ShipR_Build! Check out my proof of work verified by OpenRouter AI Judge:`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ShipR Proof of Work — ${sprintTitle}`,
          text: shareText,
          url: publicUrl,
        });
        showToast("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast("Proof of Work URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(publicUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold font-mono shadow-2xl flex items-center gap-2 border border-zinc-700 animate-fadeIn">
          <Check className="w-4 h-4 text-[#FF5500]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Card className="max-w-md w-full p-6 sm:p-8 space-y-6 border-zinc-300 shadow-2xl relative bg-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#FFF2EC] border border-[#FF5500]/30 text-[#FF5500] flex items-center justify-center mx-auto shadow-soft-card">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="text-h2 text-zinc-900 font-extrabold font-sans">
            Share Proof of Work
          </h2>
          <p className="text-caption text-zinc-600">
            Showcase your verified 48h coding sprint achievement to your network.
          </p>
        </div>

        {/* URL Box */}
        <div className="space-y-2">
          <label className="text-label text-zinc-500 block">Public Proof Link</label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="w-full bg-transparent text-xs font-mono text-zinc-800 focus:outline-none px-2 truncate"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="shrink-0"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Primary Web Share CTA */}
        <Button
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleNativeShare}
          leftIcon={<Share2 className="w-4 h-4" />}
        >
          Share via Web Apps
        </Button>

        {/* Quick Social Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Twitter className="w-4 h-4 fill-white" />
            <span>Share on X</span>
          </a>
          <a
            href={linkedinShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Linkedin className="w-4 h-4 fill-white" />
            <span>Share on LinkedIn</span>
          </a>
        </div>

        {/* Public View Link CTA */}
        <div className="pt-4 border-t border-zinc-200 text-center">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5500] hover:underline"
          >
            <span>View Public Proof Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </Card>
    </div>
  );
};
