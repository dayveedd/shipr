"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChallengeCategory, User, VerificationType, VerificationMethod } from "@/types";
import { userService } from "@/services";
import { supabase } from "@/lib/supabase";
import { Zap, ShieldCheck, Plus, Trash2, ArrowLeft, CheckCircle2, Sparkles, Lock, Clock, Code2, AlertCircle, Loader2 } from "lucide-react";

import { CelebrationModal } from "@/components/ui/CelebrationModal";

interface CreatorDodItem {
  id: string;
  title: string;
  description: string;
  category: "FRONTEND" | "BACKEND" | "DEPLOYMENT" | "TESTING" | "CODE_QUALITY";
  verificationType?: VerificationType;
  verificationMethod?: VerificationMethod;
  isRequired: boolean;
}

export default function CreateChallengePage() {
  const router = useRouter();

  // Verification Gate State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Application Form State
  const [githubUrl, setGithubUrl] = useState("");
  const [expertise, setExpertise] = useState<ChallengeCategory>("FRONTEND");
  const [reason, setReason] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Challenge Studio State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ChallengeCategory>("FRONTEND");
  const [commitmentNgn, setCommitmentNgn] = useState(5000);
  const [totalSlots, setTotalSlots] = useState(20);
  const [durationHours, setDurationHours] = useState(48);
  const [startTime, setStartTime] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [dodItems, setDodItems] = useState<CreatorDodItem[]>([
    { id: "dod_1", title: "Hero & High-Impact Display", description: "Clear value prop, visual element, and primary CTA button", category: "FRONTEND", verificationMethod: "SCREENSHOT", isRequired: true },
    { id: "dod_2", title: "Interactive Core Feature Flow", description: "Primary user interaction flow executes smoothly without JS errors", category: "FRONTEND", verificationMethod: "BUTTON_CLICK", isRequired: true },
    { id: "dod_3", title: "Mobile Viewport Responsive Layout", description: "No horizontal scroll or layout shifts at 375px mobile breakpoint", category: "CODE_QUALITY", verificationMethod: "SCREENSHOT", isRequired: true },
  ]);

  useEffect(() => {
    userService.getCurrentUser().then((res) => {
      if (res.success && res.data) {
        setUser(res.data);
        if (res.data.githubUsername) {
          setGithubUrl(`https://github.com/${res.data.githubUsername}`);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const handleCategoryChange = (selected: ChallengeCategory) => {
    setCategory(selected);
    switch (selected) {
      case "BACKEND":
        setDodItems([
          { id: "dod_1", title: "RESTful API Endpoints", description: "Clean JSON request & response handlers with status code checks", category: "BACKEND", verificationMethod: "HTTP_ENDPOINT", isRequired: true },
          { id: "dod_2", title: "Database Schema & Data Models", description: "Structured database schemas or ORM models present in codebase", category: "BACKEND", verificationMethod: "GITHUB_FILE", isRequired: true },
          { id: "dod_3", title: "API Documentation & README", description: "API route documentation and environment variables setup instructions", category: "CODE_QUALITY", verificationMethod: "README", isRequired: true },
        ]);
        break;
      case "FULLSTACK":
        setDodItems([
          { id: "dod_1", title: "Responsive Frontend Interface", description: "Clean UI components with high-impact hero display and responsive layout", category: "FRONTEND", verificationMethod: "SCREENSHOT", isRequired: true },
          { id: "dod_2", title: "Connected Backend API Flow", description: "Frontend components correctly fetch and render data from backend APIs", category: "BACKEND", verificationMethod: "BUTTON_CLICK", isRequired: true },
          { id: "dod_3", title: "Package Manifest & Build Script", description: "Valid package.json with dependencies and working build command", category: "CODE_QUALITY", verificationMethod: "PACKAGE_JSON", isRequired: true },
        ]);
        break;
      case "AI_ENGINEERING":
        setDodItems([
          { id: "dod_1", title: "AI Model Provider Integration", description: "Integration with OpenRouter, OpenAI, or LLM API adapter layer", category: "BACKEND", verificationMethod: "GITHUB_FILE", isRequired: true },
          { id: "dod_2", title: "Structured Prompt & Zod Validation", description: "System prompts and Zod JSON schema validation for deterministic outputs", category: "CODE_QUALITY", verificationMethod: "GITHUB_FILE", isRequired: true },
          { id: "dod_3", title: "Working Interactive AI Interface", description: "User interface for inputting prompts and displaying streaming AI outputs", category: "FRONTEND", verificationMethod: "SCREENSHOT", isRequired: true },
        ]);
        break;
      case "DEVOPS":
        setDodItems([
          { id: "dod_1", title: "Production Deployment Health Check", description: "Live production deployment endpoint responding with HTTP 200 OK", category: "DEPLOYMENT", verificationMethod: "LIVE_DEPLOYMENT", isRequired: true },
          { id: "dod_2", title: "CI/CD & Infrastructure Config", description: "GitHub Actions workflow, Dockerfile, or deployment configuration manifest", category: "DEPLOYMENT", verificationMethod: "GITHUB_FILE", isRequired: true },
          { id: "dod_3", title: "Environment Variables Documentation", description: "README guide listing all required environment keys and setup steps", category: "CODE_QUALITY", verificationMethod: "README", isRequired: true },
        ]);
        break;
      default:
        setDodItems([
          { id: "dod_1", title: "Hero & High-Impact Display", description: "Clear value prop, visual element, and primary CTA button", category: "FRONTEND", verificationMethod: "SCREENSHOT", isRequired: true },
          { id: "dod_2", title: "Interactive Core Feature Flow", description: "Primary user interaction flow executes smoothly without JS errors", category: "FRONTEND", verificationMethod: "BUTTON_CLICK", isRequired: true },
          { id: "dod_3", title: "Mobile Viewport Responsive Layout", description: "No horizontal scroll or layout shifts at 375px mobile breakpoint", category: "CODE_QUALITY", verificationMethod: "SCREENSHOT", isRequired: true },
        ]);
        break;
    }
  };

  const addDodItem = () => {
    setDodItems([
      ...dodItems,
      {
        id: `dod_${Date.now()}`,
        title: "",
        description: "",
        category: "FRONTEND" as const,
        verificationType: "REPOSITORY" as const,
        isRequired: true,
      },
    ]);
  };

  const removeDodItem = (id: string) => {
    if (dodItems.length <= 1) return;
    setDodItems(dodItems.filter((item) => item.id !== id));
  };

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !reason || !user) return;

    setIsApplying(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ creator_verification_status: "PENDING" })
        .eq("id", user.id);
      
      if (error) throw error;
      
      const res = await userService.getCurrentUser();
      if (res.success) setUser(res.data);
    } catch (err: any) {
      alert(err.message || "Failed to submit verification application");
    } finally {
      setIsApplying(false);
    }
  };

  const handleBypass = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          role: "VERIFIED_CREATOR",
          is_verified_creator: true,
          creator_verification_status: "APPROVED"
        })
        .eq("id", user.id);

      const res = await userService.getCurrentUser();
      if (res.success) setUser(res.data);
    } catch (err: any) {
      alert(err.message || "Failed to bypass verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !user) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("No active session found. Please log in again.");
      }

      const response = await fetch("/api/v1/sprints/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          commitmentNgn,
          totalSlots,
          durationHours,
          description,
          dodItems,
          startTime,
        }),
      });

      const resData = await response.json();

      setShowSuccessModal(true);
    } catch (err: any) {
      alert(err.message || "Failed to publish challenge");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5500]" />
        <p className="text-zinc-600 font-mono text-sm">Loading studio configurations...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Lock className="w-12 h-12 text-[#FF5500] mx-auto" />
        <h2 className="text-h2 text-zinc-900 font-extrabold">Authentication Required</h2>
        <p className="text-body text-zinc-600">Please sign in to access the verified developer studio.</p>
        <Link href="/login">
          <Button variant="primary" className="mt-4">Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  const isVerifiedCreator = user.role === "VERIFIED_CREATOR";
  const verificationStatus = user.creatorVerificationStatus || "NONE";

  // RENDER GATE 1: Creator Account Verification Required
  if (!isVerifiedCreator || verificationStatus !== "APPROVED") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EC] border border-[#FF5500]/30 text-xs text-[#FF5500] font-bold font-mono">
            <Lock className="w-4 h-4 text-[#FF5500]" />
            <span>VERIFIED CREATOR ACCOUNT REQUIRED</span>
          </div>
          <h1 className="text-h1 text-zinc-900 font-extrabold font-sans">
            Apply for Verified Creator Account
          </h1>
          <p className="text-body text-zinc-600 max-w-lg mx-auto">
            To protect Commitment Pool integrity and maintain strict Definition of Done quality, developer challenges can only be created by verified creators approved by ShipR Admins.
          </p>
        </div>

        {verificationStatus === "PENDING" ? (
          <Card className="p-8 border-2 border-amber-400 bg-amber-50/40 text-center space-y-4 shadow-soft-card">
            <Clock className="w-12 h-12 text-amber-600 mx-auto animate-pulse" />
            <h2 className="text-h2 text-zinc-900 font-extrabold">
              Application Under Review
            </h2>
            <p className="text-body text-zinc-600 max-w-md mx-auto">
              Your Creator Verification application has been submitted to ShipR Admins. Once approved, you will unlock full challenge publishing capabilities.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={handleBypass}>
                Demo Admin Approval Bypass
              </Button>
              <Link href="/sprints">
                <Button variant="primary">Return to Sprints</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-zinc-300 bg-white shadow-soft-card space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <ShieldCheck className="w-6 h-6 text-[#FF5500] shrink-0" />
              <div className="text-xs text-zinc-700">
                <strong className="font-bold text-zinc-900 block">Verification Standard:</strong>
                Applicants must have an active GitHub profile with public repositories or proven track record of shipping developer projects.
              </div>
            </div>

            <form onSubmit={handleApplyVerification} className="space-y-5">
              <div className="space-y-2">
                <label className="text-label text-zinc-900 font-bold">GitHub / Portfolio URL *</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-label text-zinc-900 font-bold">Primary Engineering Domain *</label>
                <select
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value as ChallengeCategory)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] font-bold"
                >
                  <option value="FRONTEND">Frontend Development</option>
                  <option value="BACKEND">Backend & API</option>
                  <option value="FULLSTACK">Full Stack Development</option>
                  <option value="MOBILE">Mobile Development (Expo/React Native)</option>
                  <option value="AI_ENGINEERING">AI Engineering & LLMs</option>
                  <option value="DEVOPS">DevOps & Cloud Infrastructure</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-label text-zinc-900 font-bold">Why do you want to host developer sprints? *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Hosting open-source contribution sprints for my developer community..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500]"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isApplying}>
                Submit Verification Application
              </Button>
            </form>
          </Card>
        )}
      </div>
    );
  }

  // RENDER GATE 2: Full Verified Creator Challenge Studio
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <Link href="/sprints" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#FF5500] transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider">
            <Code2 className="w-4 h-4 text-[#FF5500]" />
            <span>VERIFIED CREATOR STUDIO (DEV ONLY)</span>
          </div>
          <h1 className="text-h1 text-zinc-900 font-extrabold font-sans">
            Create Developer Coding Challenge
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Creator Approved</span>
        </div>
      </div>

      <form onSubmit={handlePublish} className="space-y-8">
        {/* Basic Info Card */}
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-300 shadow-soft-card bg-white">
          <h3 className="text-h3 text-zinc-900 font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FF5500]" />
            <span>1. Developer Challenge Overview & Category</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-label text-zinc-900 font-bold">Challenge Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js 15 Server Actions & Auth API"
                className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] shadow-soft-card font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-label text-zinc-900 font-bold">Developer Category *</label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as ChallengeCategory)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] shadow-soft-card font-bold"
                >
                  <option value="FRONTEND">Frontend Development</option>
                  <option value="BACKEND">Backend & API</option>
                  <option value="FULLSTACK">Full Stack</option>
                  <option value="MOBILE">Mobile Development (Expo/React Native)</option>
                  <option value="AI_ENGINEERING">AI Engineering</option>
                  <option value="DEVOPS">DevOps & Cloud Infrastructure</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-label text-zinc-900 font-bold">Commitment Stake (NGN) *</label>
                <input
                  type="number"
                  step={1000}
                  value={commitmentNgn}
                  onChange={(e) => setCommitmentNgn(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] shadow-soft-card font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-label text-zinc-900 font-bold">Max Participant Slots *</label>
                <input
                  type="number"
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] shadow-soft-card font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-label text-zinc-900 font-bold">Duration (Hours) *</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] shadow-soft-card font-bold"
                >
                  <option value={24}>24 Hours (Flash Sprint)</option>
                  <option value={48}>48 Hours (Standard Sprint)</option>
                  <option value={72}>72 Hours (Deep Work Sprint)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-label text-zinc-900 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>Start Time (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] shadow-soft-card font-mono"
              />
              <span className="text-[11px] text-zinc-400 block -mt-1.5">
                Leave empty to launch immediately. Choose a future date/time to schedule as an <strong>Upcoming</strong> challenge.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-label text-zinc-900 font-bold">Challenge Brief & Technical Requirements *</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.max(140, e.target.scrollHeight)}px`;
                }}
                placeholder="Explain what developers need to code and deploy..."
                className="w-full px-4 py-3 rounded-none bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-[#FF5500] min-h-[140px] overflow-hidden transition-[height] duration-100"
                required
              />
            </div>
          </div>
        </Card>

        {/* Definition of Done Builder */}
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-300 shadow-soft-card bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-h3 text-zinc-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF5500]" />
              <span>2. Definition of Done & AI Inspection Rules</span>
            </h3>

            <Button type="button" size="sm" variant="secondary" onClick={addDodItem} leftIcon={<Plus className="w-4 h-4" />}>
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {dodItems.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 relative">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono font-bold text-[#FF5500] uppercase">
                    Developer Requirement #{idx + 1}
                  </span>
                  {dodItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDodItem(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Requirement Title (e.g. Hero Section)"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...dodItems];
                      updated[idx].title = e.target.value;
                      setDodItems(updated);
                    }}
                    className="px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 font-bold focus:outline-none focus:border-[#FF5500]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="AI Inspection Criteria Details..."
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...dodItems];
                      updated[idx].description = e.target.value;
                      setDodItems(updated);
                    }}
                    className="px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-[#FF5500]"
                    required
                  />
                  <select
                    value={item.verificationMethod || item.verificationType || "GITHUB_REPOSITORY"}
                    onChange={(e) => {
                      const updated = [...dodItems];
                      updated[idx].verificationMethod = e.target.value as any;
                      setDodItems(updated);
                    }}
                    className="px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 font-bold focus:outline-none focus:border-[#FF5500]"
                  >
                    <option value="GITHUB_REPOSITORY">Code Repository Check</option>
                    <option value="LIVE_DEPLOYMENT">Live Deployment Check</option>
                    <option value="SCREENSHOT">Visual UI & Layout Check</option>
                    <option value="BUTTON_CLICK">Button Click Interaction</option>
                    <option value="FORM_SUBMISSION">Form Submission Check</option>
                    <option value="NAVIGATION">Page Navigation Check</option>
                    <option value="INPUT">Input Field Validation</option>
                    <option value="MODAL">Modal Popup Verification</option>
                    <option value="README">README Documentation</option>
                    <option value="PACKAGE_JSON">package.json Dependencies</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Button */}
        <div className="pt-4 flex items-center justify-end gap-4">
          <Link href="/sprints">
            <Button variant="secondary" size="lg">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
            Publish Challenge to Platform
          </Button>
        </div>

        {/* Celebration Success Modal with Balloons */}
        <CelebrationModal
          isOpen={showSuccessModal}
          title={title || "Sprint Challenge Published! 🎉"}
          subtitle="Your developer coding challenge is now live in Sprint Discovery. Builders can join the commitment pool and submit proof of work for multi-modal AI Judge evaluation."
          onConfirm={() => router.push("/sprints")}
        />
      </form>
    </div>
  );
}
