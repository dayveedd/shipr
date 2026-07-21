"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { userService } from "@/services";
import { Zap, Github, Mail, ShieldCheck, ArrowRight, Trophy, Flame } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoadingGithub(true);
    const res = await userService.loginWithGithub();
    setIsLoadingGithub(false);
    if (res.success) {
      router.push("/dashboard");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsLoadingEmail(true);
    const res = await userService.loginWithEmail(email);
    setIsLoadingEmail(false);

    if (res.success) {
      setEmailSent(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Brand Value Prop */}
        <div className="space-y-6 hidden md:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF2EC] border border-[#FF5500]/30 text-badge text-[#FF5500] font-bold">
            <Zap className="w-3.5 h-3.5 fill-[#FF5500]" />
            <span>EXECUTION ECONOMY FOR BUILDERS</span>
          </div>

          <h1 className="text-h1 text-zinc-900 leading-tight">
            Stop Procrastinating. <br />
            <span className="text-[#FF5500]">Start Shipping Code.</span>
          </h1>

          <p className="text-body-lg text-zinc-600">
            Join 1,200+ developers committing stake, building real products in 48-hour sprints, and earning rewards from the Commitment Pool.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-zinc-200 shadow-soft-card">
              <Trophy className="w-5 h-5 text-[#FF5500] shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Total Payouts Distributed</h4>
                <p className="text-caption text-zinc-500 font-mono font-tabular">₦4,250,000+ to successful shippers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-zinc-200 shadow-soft-card">
              <Flame className="w-5 h-5 text-[#FF5500] shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900">AI Code Verification</h4>
                <p className="text-caption text-zinc-500">OpenRouter AI Judge inspects repos & live URLs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <Card className="p-6 sm:p-8 space-y-6 border-zinc-300 shadow-2xl bg-white">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#FF5500] text-white flex items-center justify-center mx-auto shadow-orange-glow">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <h2 className="text-h2 text-zinc-900 font-extrabold">
              Sign In to ShipR
            </h2>
            <p className="text-caption text-zinc-600">
              Connect your developer profile to start building.
            </p>
          </div>

          {emailSent ? (
            <div className="p-4 rounded-xl bg-[#FFF2EC] border border-[#FF5500]/30 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#FF5500] text-white flex items-center justify-center mx-auto">
                ✓
              </div>
              <h4 className="text-h3 text-zinc-900 text-sm">Magic Link Sent</h4>
              <p className="text-caption text-zinc-600">
                Check your inbox at <strong className="text-zinc-900 font-mono">{email}</strong>. Logging you in...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-zinc-900 hover:bg-zinc-800 border-zinc-900 text-white shadow-sm font-bold"
                isLoading={isLoadingGithub}
                onClick={handleGithubLogin}
              >
                <Github className="w-5 h-5" />
                <span>Continue with GitHub</span>
              </Button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-mono text-zinc-400 uppercase tracking-wider absolute">
                  Or email magic link
                </span>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="developer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-body text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#FF5500]/50 shadow-soft-card"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  isLoading={isLoadingEmail}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Magic Link
                </Button>
              </form>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-200 text-center flex items-center justify-center gap-1.5 text-caption text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
            <span>Protected by GitHub OAuth 2.0 & Monnify Security</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
