"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { submissionService } from "@/services";
import { Github, Globe, RefreshCw, X, Sparkles, Loader2 } from "lucide-react";

interface ResubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  currentGithubUrl: string;
  currentDeploymentUrl: string;
  currentNotes?: string;
  currentVersion?: number;
  onSuccess?: () => void;
}

export const ResubmitModal: React.FC<ResubmitModalProps> = ({
  isOpen,
  onClose,
  submissionId,
  currentGithubUrl,
  currentDeploymentUrl,
  currentNotes = "",
  currentVersion = 1,
  onSuccess,
}) => {
  const [githubUrl, setGithubUrl] = useState(currentGithubUrl);
  const [deploymentUrl, setDeploymentUrl] = useState(currentDeploymentUrl);
  const [notes, setNotes] = useState(currentNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const nextVersion = (currentVersion || 1) + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !deploymentUrl) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await submissionService.resubmitProject(submissionId, {
        githubRepoUrl: githubUrl.trim(),
        deploymentUrl: deploymentUrl.trim(),
        notes: notes.trim(),
      });

      if (response.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(response.message || "Failed to resubmit project");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg">
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-200 shadow-2xl bg-white rounded-none">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-[#FF5500]/10 border border-[#FF5500]/20 text-[10px] font-mono font-bold text-[#FF5500] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#FF5500]" />
                <span>UNLIMITED RESUBMISSIONS ACTIVE</span>
              </div>
              <h2 className="text-xl font-extrabold text-zinc-900 font-sans">
                Resubmit Project (Attempt v{nextVersion})
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Update repository or deployment URLs. A new independent evaluation attempt (v{nextVersion}) will be created without overwriting Attempt v{currentVersion}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-xs font-mono text-red-600 font-bold">
                {errorMessage}
              </div>
            )}

            {/* GitHub URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-800 uppercase flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>GitHub Repository URL *</span>
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full px-3.5 py-2.5 rounded-none bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:border-[#FF5500]"
                required
              />
            </div>

            {/* Deployment URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-800 uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Live Deployment URL *</span>
              </label>
              <input
                type="url"
                value={deploymentUrl}
                onChange={(e) => setDeploymentUrl(e.target.value)}
                placeholder="https://my-app.vercel.app"
                className="w-full px-3.5 py-2.5 rounded-none bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:border-[#FF5500]"
                required
              />
            </div>

            {/* Change Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-800 uppercase">
                Changelog / Fix Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe what you fixed (e.g. Added pricing table, fixed mobile layout)..."
                className="w-full px-3.5 py-2.5 rounded-none bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Submit Attempt v{nextVersion}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
