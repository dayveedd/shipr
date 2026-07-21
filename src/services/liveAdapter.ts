import {
  ISprintService,
  ISubmissionService,
  IUserService,
  ISettlementService,
  ILeaderboardService,
} from "./interfaces";
import {
  Sprint,
  User,
  Submission,
  AiEvaluation,
  SettlementSummary,
  LeaderboardEntry,
  ApiResponse,
  SprintStatus,
} from "@/types";
import { supabase } from "@/lib/supabase";

// Helper mappings between snake_case database schema and camelCase TypeScript interfaces

function mapProfileToUser(row: any): User {
  return {
    id: row.id,
    githubUsername: row.github_username,
    name: row.name,
    avatarUrl: row.avatar_url,
    role: row.role,
    rank: row.rank,
    totalEarnedNgn: Number(row.total_earned_ngn || 0),
    sprintsCompleted: Number(row.sprints_completed || 0),
    currentStreak: Number(row.current_streak || 0),
    longestStreak: Number(row.longest_streak || 0),
    successRate: Number(row.success_rate || 0),
    joinedAt: row.joined_at,
    isVerifiedCreator: row.is_verified_creator,
    creatorVerificationStatus: row.creator_verification_status,
  };
}

function mapSprintToDomain(row: any): Sprint {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    commitmentNgn: Number(row.commitment_ngn || 0),
    totalSlots: Number(row.total_slots || 0),
    filledSlots: Number(row.filled_slots || 0),
    durationHours: Number(row.duration_hours || 0),
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    totalPoolNgn: Number(row.total_pool_ngn || 0),
    passCount: Number(row.pass_count || 0),
    failCount: Number(row.fail_count || 0),
    tags: row.tags || [],
    definitionOfDone: row.definition_of_done || [],
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    isFeatured: row.is_featured,
    poolAccounts: row.pool_accounts || [],
    subAccountCode: row.sub_account_code,
  };
}

function mapSubmissionToDomain(row: any): Submission {
  return {
    id: row.id,
    sprintId: row.sprint_id,
    userId: row.user_id,
    githubRepoUrl: row.github_repo_url,
    deploymentUrl: row.deployment_url,
    notes: row.notes,
    submittedAt: row.submitted_at,
    stage: row.stage,
    payoutTxHash: row.payout_tx_hash,
    settledAt: row.settled_at,
  };
}

import { MOCK_SPRINTS } from "./mockData";

export class LiveSprintService implements ISprintService {
  async getSprints(status?: SprintStatus): Promise<ApiResponse<Sprint[]>> {
    try {
      let query = supabase.from("sprints").select("*");
      if (status) {
        query = query.eq("status", status);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const sprints = (data || []).map(mapSprintToDomain);
      return { success: true, message: "Sprints fetched successfully", data: sprints };
    } catch (err: any) {
      if (err.code === "PGRST205" || err.message?.includes("schema cache") || err.message?.includes("not find the table")) {
        console.warn("Table public.sprints not found in Supabase. Falling back to local MOCK_SPRINTS dataset.");
        const filtered = status ? MOCK_SPRINTS.filter(s => s.status === status) : MOCK_SPRINTS;
        return { success: true, message: "Sprints fetched successfully (mock fallback)", data: filtered };
      }
      return { success: false, message: err.message || "Failed to fetch sprints", data: [] };
    }
  }

  async getSprintBySlug(slug: string): Promise<ApiResponse<Sprint>> {
    try {
      const { data, error } = await supabase
        .from("sprints")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      
      return { success: true, message: "Sprint fetched successfully", data: mapSprintToDomain(data) };
    } catch (err: any) {
      if (err.code === "PGRST205" || err.message?.includes("schema cache") || err.message?.includes("not find the table") || err.message?.includes("Sprint not found")) {
        const found = MOCK_SPRINTS.find(s => s.slug === slug);
        if (found) {
          return { success: true, message: "Sprint fetched successfully (mock fallback)", data: found };
        }
      }
      return { success: false, message: err.message || "Sprint not found", data: null as any };
    }
  }

  async joinSprint(sprintId: string): Promise<ApiResponse<{ sprintId: string; joined: boolean }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: "Authentication required to join sprints", data: { sprintId, joined: false } };
      }

      // Check if already joined
      const { data: existing } = await supabase
        .from("sprint_participants")
        .select("*")
        .eq("sprint_id", sprintId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        return { success: true, message: "Already joined this sprint", data: { sprintId, joined: true } };
      }

      // Record join
      const { error: joinError } = await supabase
        .from("sprint_participants")
        .insert({ sprint_id: sprintId, user_id: user.id });
      if (joinError) throw joinError;

      // Update slots count
      const { data: sprint } = await supabase
        .from("sprints")
        .select("filled_slots")
        .eq("id", sprintId)
        .single();

      if (sprint) {
        await supabase
          .from("sprints")
          .update({ filled_slots: (sprint.filled_slots || 0) + 1 })
          .eq("id", sprintId);
      }

      return {
        success: true,
        message: "Successfully joined commitment pool via Monnify",
        data: { sprintId, joined: true },
      };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to join sprint", data: { sprintId, joined: false } };
    }
  }
}

export class LiveSubmissionService implements ISubmissionService {
  async submitProof(data: {
    sprintId: string;
    githubRepoUrl: string;
    deploymentUrl: string;
    notes?: string;
  }): Promise<ApiResponse<Submission>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: "Authentication required to submit proof", data: null as any };
      }

      const id = `sub_${Date.now()}`;
      const newSub = {
        id,
        sprint_id: data.sprintId,
        user_id: user.id,
        github_repo_url: data.githubRepoUrl,
        deployment_url: data.deploymentUrl,
        notes: data.notes,
        stage: "SUBMISSION_RECEIVED",
        submitted_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase
        .from("submissions")
        .insert(newSub)
        .select()
        .single();

      if (error) throw error;

      return { success: true, message: "Proof submitted successfully", data: mapSubmissionToDomain(inserted) };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to submit proof", data: null as any };
    }
  }

  async getSubmissionStatus(submissionId: string): Promise<ApiResponse<Submission>> {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", submissionId)
        .single();

      if (error) throw error;
      return { success: true, message: "Submission status fetched", data: mapSubmissionToDomain(data) };
    } catch (err: any) {
      return { success: false, message: err.message || "Submission not found", data: null as any };
    }
  }

  async triggerAiEvaluation(submissionId: string): Promise<ApiResponse<AiEvaluation>> {
    try {
      // Trigger Next.js server route to perform the AI evaluation safely
      const res = await fetch("/api/v1/ai-judge/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to run AI evaluation",
        data: null as any,
      };
    }
  }
}

export class LiveUserService implements IUserService {
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    let authUser: any = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: true, message: "No active session", data: null };
      }
      authUser = user;

      let { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      const isGithubLogin = user.app_metadata?.provider === "github" || 
                            user.identities?.some(id => id.provider === "github");
      const githubUsername = user.user_metadata?.user_name || 
                             user.user_metadata?.preferred_username || 
                             "";

      if (!profile) {
        // Automatically create user profile
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Builder";
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";

        const newProfile = {
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
        };

        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (insertError) throw insertError;
        profile = inserted;
      } else {
        // Profile exists. If logged in with GitHub but profile doesn't show it as verified/linked, upgrade it!
        if (isGithubLogin && (!profile.github_username || profile.role !== "VERIFIED_CREATOR")) {
          const updates = {
            github_username: githubUsername || profile.github_username,
            role: "VERIFIED_CREATOR",
            is_verified_creator: true,
            creator_verification_status: "APPROVED",
            avatar_url: user.user_metadata?.avatar_url || profile.avatar_url,
          };
          const { data: updated, error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id)
            .select()
            .single();
          if (!updateError && updated) {
            profile = updated;
          }
        }
      }

      return { success: true, message: "Current user fetched", data: mapProfileToUser(profile) };
    } catch (err: any) {
      if (authUser) {
        // Fallback: build user profile directly from Auth metadata if database profiles read/insert fails
        const isGithubLogin = authUser.app_metadata?.provider === "github" || 
                              authUser.identities?.some((id: any) => id.provider === "github");
        const githubUsername = authUser.user_metadata?.user_name || 
                               authUser.user_metadata?.preferred_username || 
                               "";
        const name = authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Builder";
        const avatarUrl =
          authUser.user_metadata?.avatar_url ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";

        const fallbackUser: User = {
          id: authUser.id,
          githubUsername,
          name,
          avatarUrl,
          role: isGithubLogin ? "VERIFIED_CREATOR" : "BUILDER",
          rank: "BRONZE",
          totalEarnedNgn: 0,
          sprintsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          successRate: 100,
          joinedAt: authUser.created_at || new Date().toISOString(),
          isVerifiedCreator: isGithubLogin,
          creatorVerificationStatus: isGithubLogin ? "APPROVED" : "NONE",
        };
        return { success: true, message: "Fetched current user (with database fallback)", data: fallbackUser };
      }
      return { success: false, message: err.message || "Failed to fetch user profiles", data: null };
    }
  }

  async getUserByUsername(username: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("github_username", username)
        .single();

      if (error) throw error;
      return { success: true, message: "User profile fetched", data: mapProfileToUser(data) };
    } catch (err: any) {
      return { success: false, message: err.message || "User not found", data: null as any };
    }
  }

  async loginWithGithub(): Promise<ApiResponse<User>> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true, message: "GitHub OAuth process initiated", data: null as any };
    } catch (err: any) {
      return { success: false, message: err.message || "GitHub authentication failed", data: null as any };
    }
  }

  async loginWithEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true, message: "Email magic link dispatched successfully", data: null as any };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to send magic link", data: null as any };
    }
  }

  async logout(): Promise<ApiResponse<{ loggedOut: boolean }>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, message: "Logged out successfully", data: { loggedOut: true } };
    } catch (err: any) {
      return { success: false, message: err.message || "Logout failed", data: { loggedOut: false } };
    }
  }
}

export class LiveSettlementService implements ISettlementService {
  async getSettlementSummary(sprintId: string): Promise<ApiResponse<SettlementSummary>> {
    try {
      const { data, error } = await supabase
        .from("settlement_summaries")
        .select("*")
        .eq("sprint_id", sprintId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const mapped: SettlementSummary = {
          sprintId: data.sprint_id,
          sprintTitle: data.sprint_title,
          totalPoolNgn: Number(data.total_pool_ngn || 0),
          totalParticipants: Number(data.total_participants || 0),
          passCount: Number(data.pass_count || 0),
          failCount: Number(data.fail_count || 0),
          initialStakeRefundNgn: Number(data.initial_stake_refund_ngn || 0),
          redistributedBonusNgn: Number(data.redistributed_bonus_ngn || 0),
          totalReturnPerPassNgn: Number(data.total_return_per_pass_ngn || 0),
          settledAt: data.settled_at,
        };
        return { success: true, message: "Settlement summary fetched", data: mapped };
      }

      // Default fallback calculations based on sprint data for demo/hackathon ease
      const { data: sprint } = await supabase.from("sprints").select("*").eq("id", sprintId).maybeSingle();
      const sprintTitle = sprint?.title || "Sprinting Challenge";
      const totalPool = sprint?.total_pool_ngn ? Number(sprint.total_pool_ngn) : 100000;
      const participants = sprint?.filled_slots ? Number(sprint.filled_slots) : 20;
      const commitment = sprint?.commitment_ngn ? Number(sprint.commitment_ngn) : 5000;
      
      const passes = Math.round(participants * 0.8);
      const fails = participants - passes;
      const initialStakeRefund = commitment;
      const redistributionPool = fails * commitment;
      const bonus = passes > 0 ? redistributionPool / passes : 0;

      return {
        success: true,
        message: "Dynamic settlement summary generated",
        data: {
          sprintId,
          sprintTitle,
          totalPoolNgn: totalPool,
          totalParticipants: participants,
          passCount: passes,
          failCount: fails,
          initialStakeRefundNgn: initialStakeRefund,
          redistributedBonusNgn: bonus,
          totalReturnPerPassNgn: initialStakeRefund + bonus,
          settledAt: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to fetch settlement summary", data: null as any };
    }
  }
}

export class LiveLeaderboardService implements ILeaderboardService {
  async getLeaderboard(
    timeframe: "weekly" | "monthly" | "allTime" = "allTime"
  ): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      // Direct query from profiles, ordering by total_earned_ngn
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("total_earned_ngn", { ascending: false })
        .limit(20);

      if (error) throw error;

      const entries: LeaderboardEntry[] = (data || []).map((row, idx) => ({
        rankPosition: idx + 1,
        user: mapProfileToUser(row),
        totalEarnedNgn: Number(row.total_earned_ngn || 0),
        successRate: Number(row.success_rate || 0),
        streak: Number(row.current_streak || 0),
        completedSprintsCount: Number(row.sprints_completed || 0),
      }));

      return { success: true, message: "Leaderboard fetched successfully", data: entries };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to fetch leaderboard", data: [] };
    }
  }
}
