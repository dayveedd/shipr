"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { userService } from "@/services";
import { User } from "@/types";
import { Zap, Github, Mail, ShieldCheck, ArrowRight, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleGithubLogin = async () => {
    setIsLoadingGithub(true);
    const res = await userService.loginWithGithub();
    setIsLoadingGithub(false);
    if (res.success) {
      if (onSuccess) onSuccess(res.data);
      onClose();
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
        if (onSuccess) onSuccess(res.data);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 sm:p-8 space-y-6 border-zinc-300 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#FF5500] text-white flex items-center justify-center mx-auto shadow-orange-glow">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-h2 text-zinc-900 font-extrabold">
            Welcome to ShipR
          </h2>
          <p className="text-caption text-zinc-600">
            Connect your GitHub account to join competitive coding sprints, commit stakes, and earn pool rewards.
          </p>
        </div>

        {/* OAuth & Login Actions */}
        {emailSent ? (
          <div className="p-4 rounded-xl bg-[#FFF2EC] border border-[#FF5500]/30 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#FF5500] text-white flex items-center justify-center mx-auto">
              ✓
            </div>
            <h4 className="text-h3 text-zinc-900 text-sm">Magic Link Dispatched</h4>
            <p className="text-caption text-zinc-600">
              Check your inbox at <strong className="text-zinc-900 font-mono">{email}</strong>. Logging you in...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary GitHub OAuth CTA */}
            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-zinc-900 hover:bg-zinc-800 border-zinc-900 shadow-sm text-white"
              isLoading={isLoadingGithub}
              onClick={handleGithubLogin}
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-mono text-zinc-400 uppercase tracking-wider absolute">
                Or email link
              </span>
            </div>

            {/* Email Magic Link Form */}
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

        {/* Security Footer Note */}
        <div className="pt-4 border-t border-zinc-200 text-center flex items-center justify-center gap-1.5 text-caption text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
          <span>Protected by GitHub OAuth 2.0 & Encrypted Sessions</span>
        </div>
      </Card>
    </div>
  );
};
