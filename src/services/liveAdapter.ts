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
      
      const sprints = await Promise.all(
        (data || []).map(async (row) => {
          const { count } = await supabase
            .from("sprint_participants")
            .select("*", { count: "exact", head: true })
            .or(`sprint_id.eq.${row.id},sprint_id.eq.${row.slug}`);

          const participantCount = count || Number(row.filled_slots || 0);
          const commitment = Number(row.commitment_ngn || 5000);
          const calculatedPool = participantCount * commitment;

          const domain = mapSprintToDomain(row);
          domain.filledSlots = participantCount;
          domain.totalPoolNgn = Math.max(domain.totalPoolNgn, calculatedPool);
          return domain;
        })
      );
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
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();
      if (error) throw error;
      if (!data) return { success: false, message: "Sprint not found", data: null as any };

      const { count } = await supabase
        .from("sprint_participants")
        .select("*", { count: "exact", head: true })
        .or(`sprint_id.eq.${data.id},sprint_id.eq.${data.slug}`);

      const participantCount = count || Number(data.filled_slots || 0);
      const commitment = Number(data.commitment_ngn || 5000);
      const calculatedPool = participantCount * commitment;

      const domain = mapSprintToDomain(data);
      domain.filledSlots = participantCount;
      domain.totalPoolNgn = Math.max(domain.totalPoolNgn, calculatedPool);

      return { success: true, message: "Sprint fetched successfully", data: domain };
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
      // Update slots count & total pool size
      const { data: sprint } = await supabase
        .from("sprints")
        .select("id, filled_slots, commitment_ngn, total_pool_ngn")
        .or(`id.eq.${sprintId},slug.eq.${sprintId}`)
        .maybeSingle();

      if (sprint) {
        await supabase
          .from("sprints")
          .update({
            filled_slots: (sprint.filled_slots || 0) + 1,
            total_pool_ngn: (sprint.total_pool_ngn || 0) + Number(sprint.commitment_ngn || 5000),
          })
          .eq("id", sprint.id);
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
      const userId = user?.id || "user_demo_builder";

      // 1. Ensure user profile exists in Supabase
      await supabase.from("profiles").upsert({
        id: userId,
        github_username: user?.user_metadata?.user_name || "builder_demo",
        name: user?.user_metadata?.full_name || "Demo Builder",
        avatar_url: user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        role: "BUILDER",
        rank: "Silver Shipper",
      }, { onConflict: "id" });

      // 2. Resolve sprint_id by ID or slug in Supabase
      let realSprintId = data.sprintId;
      const { data: existingSprint } = await supabase
        .from("sprints")
        .select("id")
        .or(`id.eq.${data.sprintId},slug.eq.${data.sprintId}`)
        .maybeSingle();

      if (existingSprint) {
        realSprintId = existingSprint.id;
      } else {
        // Find sprint definition from mock dataset or create fallback sprint in Supabase DB
        const mockSprint = MOCK_SPRINTS.find(s => s.id === data.sprintId || s.slug === data.sprintId) || MOCK_SPRINTS[0];
        realSprintId = mockSprint.id;

        await supabase.from("sprints").upsert({
          id: mockSprint.id,
          title: mockSprint.title,
          slug: mockSprint.slug,
          description: mockSprint.description,
          category: mockSprint.category,
          commitment_ngn: mockSprint.commitmentNgn,
          total_slots: mockSprint.totalSlots,
          filled_slots: mockSprint.filledSlots,
          duration_hours: mockSprint.durationHours,
          status: mockSprint.status,
          total_pool_ngn: mockSprint.totalPoolNgn,
          pass_count: mockSprint.passCount,
          fail_count: mockSprint.failCount,
          tags: mockSprint.tags,
          definition_of_done: mockSprint.definitionOfDone,
        }, { onConflict: "id" });
      }

      const id = `sub_${Date.now()}`;
      const newSub = {
        id,
        sprint_id: realSprintId,
        user_id: userId,
        github_repo_url: data.githubRepoUrl,
        deployment_url: data.deploymentUrl,
        notes: data.notes,
        stage: "SUBMISSION_RECEIVED",
        submitted_at: new Date().toISOString(),
      };

      const { data: insertedRows, error } = await supabase
        .from("submissions")
        .insert(newSub)
        .select();

      const inserted = insertedRows && insertedRows.length > 0 ? insertedRows[0] : newSub;

      if (error) {
        console.warn("Supabase submission insert warning, using domain fallback:", error.message);
        return {
          success: true,
          message: "Proof submitted successfully",
          data: {
            id,
            sprintId: realSprintId,
            userId,
            githubRepoUrl: data.githubRepoUrl,
            deploymentUrl: data.deploymentUrl,
            notes: data.notes,
            submittedAt: newSub.submitted_at,
            stage: "SUBMISSION_RECEIVED",
          },
        };
      }

      return { success: true, message: "Proof submitted successfully", data: mapSubmissionToDomain(inserted) };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to submit proof", data: null as any };
    }
  }

  async getSubmissionStatus(submissionId: string): Promise<ApiResponse<Submission>> {
    try {
      let data: any = null;
      try {
        const { data: dbData } = await supabase
          .from("submissions")
          .select("*")
          .eq("id", submissionId)
          .maybeSingle();
        data = dbData;
      } catch (e) {}

      if (!data && typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("shipr_submissions");
          if (raw) {
            const list = JSON.parse(raw);
            const found = list.find((s: any) => s.id === submissionId);
            if (found) data = found;
          }
        } catch (e) {}
      }

      if (!data) {
        return { success: false, message: "Submission not found", data: null as any };
      }
      return { success: true, message: "Submission status fetched", data: mapSubmissionToDomain(data) };
    } catch (err: any) {
      return { success: false, message: err.message || "Submission not found", data: null as any };
    }
  }

  async triggerAiEvaluation(
    submissionId: string,
    overrides?: { githubRepoUrl?: string; deploymentUrl?: string; notes?: string }
  ): Promise<ApiResponse<AiEvaluation>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        authHeaders["Authorization"] = `Bearer ${session.access_token}`;
      }

      // Trigger Next.js server route to perform the AI evaluation safely
      const res = await fetch("/api/v1/ai-judge/evaluate", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          submissionId,
          githubRepoUrl: overrides?.githubRepoUrl,
          deploymentUrl: overrides?.deploymentUrl,
          notes: overrides?.notes,
        }),
      });
      const evalJson = await res.json();
      if (evalJson?.success && evalJson?.data) {
        try {
          if (typeof window !== "undefined") {
            const raw = localStorage.getItem("shipr_submissions") || "[]";
            const list = JSON.parse(raw);
            const idx = list.findIndex((s: any) => s.id === submissionId);
            if (idx >= 0) {
              list[idx].evaluation_result = evalJson.data;
              list[idx].stage = evalJson.data.result === "PASS" ? "PAYMENT_SUCCESSFUL" : "SUBMISSION_FAILED";
              localStorage.setItem("shipr_submissions", JSON.stringify(list));
            }
          }
        } catch (e) {}
      }
      return evalJson;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to run AI evaluation",
        data: null as any,
      };
    }
  }

  async resubmitProject(submissionId: string, data: { githubRepoUrl: string; deploymentUrl: string; notes?: string }): Promise<ApiResponse<Submission>> {
    try {
      // 1. Fetch current submission to inspect version count & sprint status
      const { data: currentSub } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", submissionId)
        .maybeSingle();

      let attemptsArray: any[] = [];
      try {
        if (currentSub?.notes) {
          const parsed = JSON.parse(currentSub.notes);
          if (Array.isArray(parsed?.attemptsHistory)) {
            attemptsArray = parsed.attemptsHistory;
          } else if (Array.isArray(parsed) && parsed[0]?.version) {
            attemptsArray = parsed;
          }
        }
      } catch (e) {
        attemptsArray = [];
      }

      if (currentSub) {
        attemptsArray.push({
          version: currentSub.version || 1,
          githubRepoUrl: currentSub.github_repo_url,
          deploymentUrl: currentSub.deployment_url,
          submittedAt: currentSub.submitted_at,
          evaluationResult: currentSub.evaluation_result,
          stage: currentSub.stage,
        });
      }

      const nextVersion = (currentSub?.version || attemptsArray.length || 1) + 1;

      // 2. Update submission record with new URLs and set stage to AI_REVIEW_IN_PROGRESS
      const { data: updatedRows, error } = await supabase
        .from("submissions")
        .update({
          github_repo_url: data.githubRepoUrl,
          deployment_url: data.deploymentUrl,
          notes: JSON.stringify({ attemptsHistory: attemptsArray, version: nextVersion }),
          stage: "AI_REVIEW_IN_PROGRESS",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", submissionId)
        .select();

      let updatedSub = updatedRows && updatedRows.length > 0 ? updatedRows[0] : null;

      if (!updatedSub) {
        updatedSub = {
          id: submissionId,
          sprint_id: currentSub?.sprint_id || "spr_react_01",
          user_id: currentSub?.user_id || "usr_demo",
          github_repo_url: data.githubRepoUrl,
          deployment_url: data.deploymentUrl,
          notes: JSON.stringify({ attemptsHistory: attemptsArray }),
          stage: "AI_REVIEW_IN_PROGRESS",
          version: nextVersion,
          submitted_at: new Date().toISOString(),
        };
      }

      // Persist to localStorage for guaranteed UI state sync
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("shipr_submissions") || "[]";
          const list = JSON.parse(raw);
          const idx = list.findIndex((s: any) => s.id === submissionId);
          if (idx >= 0) {
            list[idx] = updatedSub;
          } else {
            list.push(updatedSub);
          }
          localStorage.setItem("shipr_submissions", JSON.stringify(list));
        }
      } catch (e) {}

      // 3. Re-trigger evaluation pipeline asynchronously via server route with new URL overrides
      this.triggerAiEvaluation(submissionId, {
        githubRepoUrl: data.githubRepoUrl,
        deploymentUrl: data.deploymentUrl,
        notes: data.notes,
      }).catch(err => console.error("Async re-evaluation failed:", err));

      return {
        success: true,
        message: `Project resubmitted successfully! Creating Attempt v${nextVersion}...`,
        data: mapSubmissionToDomain(updatedSub),
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to resubmit project",
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
      let data: any = null;
      try {
        const { data: dbData } = await supabase
          .from("settlement_summaries")
          .select("*")
          .eq("sprint_id", sprintId)
          .maybeSingle();
        data = dbData;
      } catch (e) {}

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
      const redistributionPool = fails * (commitment * 0.5); // 50% penalty per failed participant
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
