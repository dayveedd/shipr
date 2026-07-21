"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { submissionService, userService } from "@/services";
import { ArrowLeft, Github, Globe, FileText, Cpu, AlertCircle } from "lucide-react";

export default function SubmissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  useEffect(() => {
    userService.getCurrentUser().then((res) => {
      if (!res.success || !res.data) {
        router.push(`/login?redirect=/sprints/${slug}/submit`);
      }
    });
  }, [router, slug]);

  const [githubUrl, setGithubUrl] = useState("https://github.com/alexdev/react-landing-shipr");
  const [deploymentUrl, setDeploymentUrl] = useState("https://react-landing-shipr.vercel.app");
  const [notes, setNotes] = useState("Implemented dark mode, pricing toggle, responsive layout, and validated contact form.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!githubUrl.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    if (!deploymentUrl.startsWith("http")) {
      setError("Please enter a valid live deployment URL starting with http:// or https://");
      return;
    }

    setIsSubmitting(true);
    const res = await submissionService.submitProof({
      sprintId: "spr_react_01",
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
        <p className="text-body text-zinc-600">
          Provide your GitHub repository and live deployment URL. Gemini AI Judge will inspect your code against the Definition of Done.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border-zinc-300 shadow-soft-card">
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
