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

const API_BASE = "/api/v1";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error occurred",
      data: null as unknown as T,
    };
  }
}

export class LiveSprintService implements ISprintService {
  async getSprints(status?: SprintStatus): Promise<ApiResponse<Sprint[]>> {
    const query = status ? `?status=${status}` : "";
    return fetchJson<Sprint[]>(`/sprints${query}`);
  }

  async getSprintBySlug(slug: string): Promise<ApiResponse<Sprint>> {
    return fetchJson<Sprint>(`/sprints/${slug}`);
  }

  async joinSprint(sprintId: string): Promise<ApiResponse<{ sprintId: string; joined: boolean }>> {
    return fetchJson<{ sprintId: string; joined: boolean }>(`/sprints/${sprintId}/join`, {
      method: "POST",
    });
  }
}

export class LiveSubmissionService implements ISubmissionService {
  async submitProof(data: {
    sprintId: string;
    githubRepoUrl: string;
    deploymentUrl: string;
    notes?: string;
  }): Promise<ApiResponse<Submission>> {
    return fetchJson<Submission>("/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSubmissionStatus(submissionId: string): Promise<ApiResponse<Submission>> {
    return fetchJson<Submission>(`/submissions/${submissionId}`);
  }

  async triggerAiEvaluation(submissionId: string): Promise<ApiResponse<AiEvaluation>> {
    return fetchJson<AiEvaluation>("/ai-judge/evaluate", {
      method: "POST",
      body: JSON.stringify({ submissionId }),
    });
  }
}

export class LiveUserService implements IUserService {
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    return fetchJson<User | null>("/users/me");
  }

  async getUserByUsername(username: string): Promise<ApiResponse<User>> {
    return fetchJson<User>(`/users/${username}`);
  }

  async loginWithGithub(): Promise<ApiResponse<User>> {
    return fetchJson<User>("/auth/github", { method: "POST" });
  }

  async loginWithEmail(email: string): Promise<ApiResponse<User>> {
    return fetchJson<User>("/auth/email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async logout(): Promise<ApiResponse<{ loggedOut: boolean }>> {
    return fetchJson<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });
  }
}

export class LiveSettlementService implements ISettlementService {
  async getSettlementSummary(sprintId: string): Promise<ApiResponse<SettlementSummary>> {
    return fetchJson<SettlementSummary>(`/settlements/${sprintId}`);
  }
}

export class LiveLeaderboardService implements ILeaderboardService {
  async getLeaderboard(timeframe: "weekly" | "monthly" | "allTime" = "allTime"): Promise<ApiResponse<LeaderboardEntry[]>> {
    return fetchJson<LeaderboardEntry[]>(`/leaderboard?timeframe=${timeframe}`);
  }
}
