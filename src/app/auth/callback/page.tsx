"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncProfile(session.user);
        router.push("/dashboard");
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              await syncProfile(session.user);
              subscription.unsubscribe();
              router.push("/dashboard");
            }
          }
        );
      }
    };

    const syncProfile = async (user: any) => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        const isGithubLogin = user.app_metadata?.provider === "github" || 
                              user.identities?.some((id: any) => id.provider === "github");
        const githubUsername = user.user_metadata?.user_name || 
                               user.user_metadata?.preferred_username || 
                               "";

        if (!profile) {
          const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Builder";
          const avatarUrl =
            user.user_metadata?.avatar_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";

          await supabase.from("profiles").insert({
            id: user.id,
            github_username: githubUsername,
            name,
            avatar_url: avatarUrl,
            role: isGithubLogin ? "VERIFIED_CREATOR" : "BUILDER",
            rank: "BRONZE",
            total_earned_ngn: 0,
            sprints_completed: 0,
            current_streak: 0,
            longest_streak: 0,
            success_rate: 100,
            joined_at: new Date().toISOString(),
            is_verified_creator: isGithubLogin,
            creator_verification_status: isGithubLogin ? "APPROVED" : "NONE",
          });
        } else {
          // If already has profile but now connected with GitHub, upgrade
          if (isGithubLogin && (!profile.github_username || profile.role !== "VERIFIED_CREATOR")) {
            await supabase
              .from("profiles")
              .update({
                github_username: githubUsername || profile.github_username,
                role: "VERIFIED_CREATOR",
                is_verified_creator: true,
                creator_verification_status: "APPROVED",
                avatar_url: user.user_metadata?.avatar_url || profile.avatar_url,
              })
              .eq("id", user.id);
          }
        }
      } catch (err) {
        console.error("Error syncing profile:", err);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF5500]" />
      <p className="text-zinc-600 font-mono text-sm font-semibold">Completing developer session handshake...</p>
    </div>
  );
}
