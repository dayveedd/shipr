"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { submissionService, userService, sprintService } from "@/services";
import { Sprint } from "@/types";
import { ArrowLeft, Github, Globe, FileText, Cpu, AlertCircle, Loader2 } from "lucide-react";

export default function SubmissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch current user and redirect if not authed
    userService.getCurrentUser().then((res) => {
      if (!res.success || !res.data) {
        router.push(`/login?redirect=/sprints/${slug}/submit`);
      } else {
        setUser(res.data);
      }
    });

    // 2. Fetch sprint details
    sprintService.getSprintBySlug(slug).then((res) => {
      if (res.success && res.data) {
        setSprint(res.data);
      }
      setIsLoading(false);
    });
  }, [router, slug]);

  const [githubUrl, setGithubUrl] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sprint) {
      setError("Sprint details not loaded yet.");
      return;
    }

    // Verify if closed before triggering submission
    const isClosed = sprint.status === "SETTLED" || sprint.status === "EVALUATING" || new Date(sprint.endTime) <= new Date();
    if (isClosed) {
      setError("This sprint has closed. Submissions are no longer accepted.");
      return;
    }

    if (!githubUrl.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    if (!deploymentUrl.startsWith("http")) {
      setError("Please enter a valid live deployment URL starting with http:// or https://");
      return;
    }

    setIsSubmitting(true);
    // Use the dynamic sprint id instead of hardcoded 'spr_react_01'
    const res = await submissionService.submitProof({
      sprintId: sprint.id,
      githubRepoUrl: githubUrl,
      deploymentUrl: deploymentUrl,
      notes: notes,
    });
    setIsSubmitting(false);

    if (res.success) {
      router.push(`/sprints/${slug}/evaluating?submissionId=${res.data.id}`);
    } else {
      setError(res.message);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF5500] mb-2" />
        <span>Loading sprint details...</span>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-caption text-zinc-500">
        <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <span>Sprint not found.</span>
      </div>
    );
  }

  const isClosed = sprint.status === "SETTLED" || sprint.status === "EVALUATING" || new Date(sprint.endTime) <= new Date();

  if (isClosed) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Link href={`/sprints/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-[#FF5500] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sprint Details</span>
        </Link>
        <Card className="p-8 border-red-200 bg-red-50 text-center space-y-4 shadow-soft-card">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-h3 text-red-950 font-bold">Submission Period Closed</h3>
          <p className="text-body text-red-900 font-sans">
            This sprint has ended. Submissions are no longer accepted for this challenge.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <Link href={`/sprints/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-[#FF5500] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sprint Details</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-h1 text-zinc-900 font-extrabold font-sans">
          Submit Proof of Work
        </h1>
        <p className="text-body text-zinc-600 font-sans">
          Provide your GitHub repository and live deployment URL for <strong className="text-zinc-900">{sprint.title}</strong>. Shipr AI will inspect your project against the creator's Definition of Done.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border-zinc-300 shadow-soft-card">
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Before you submit, please ensure:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-orange-700">
              <li>Your GitHub repository is set to <strong>Public</strong> so our AI scanner can read the files.</li>
              <li>Your deployment link is active and does not require a login page to view.</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GitHub Repo Input */}
          <div className="space-y-2">
            <label className="text-label text-zinc-900 font-bold flex items-center gap-2">
              <Github className="w-4 h-4 text-[#FF5500]" />
              <span>GitHub Repository URL *</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repo-name"
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-body text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#FF5500]/50 shadow-soft-card font-mono text-sm"
              required
            />
            <p className="text-caption text-zinc-500">
              Must be a public repository. AI scanner will check commit logs, code structure, and DoD implementations.
            </p>
          </div>

          {/* Live Deployment Input */}
          <div className="space-y-2">
            <label className="text-label text-zinc-900 font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FF5500]" />
              <span>Live Deployment URL *</span>
            </label>
            <input
              type="url"
              value={deploymentUrl}
              onChange={(e) => setDeploymentUrl(e.target.value)}
              placeholder="https://your-project.vercel.app"
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-body text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#FF5500]/50 shadow-soft-card font-mono text-sm"
              required
            />
            <p className="text-caption text-zinc-500">
              Must be live and accessible (Vercel, Netlify, Cloudflare Pages, Railway, Render).
            </p>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <label className="text-label text-zinc-900 font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              <span>Developer Notes (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mention any specific features, environment requirements, or test notes..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-body text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#FF5500]/50 shadow-soft-card text-sm"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-caption text-zinc-500">
              <Cpu className="w-4 h-4 text-[#FF5500]" />
              <span>AI Evaluation takes ~20–30 seconds</span>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
            >
              Trigger AI Evaluation
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
