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

export interface ISprintService {
  getSprints(status?: SprintStatus): Promise<ApiResponse<Sprint[]>>;
  getSprintBySlug(slug: string): Promise<ApiResponse<Sprint>>;
  joinSprint(sprintId: string): Promise<ApiResponse<{ sprintId: string; joined: boolean }>>;
}

export interface ISubmissionService {
  submitProof(data: {
    sprintId: string;
    githubRepoUrl: string;
    deploymentUrl: string;
    notes?: string;
  }): Promise<ApiResponse<Submission>>;
  getSubmissionStatus(submissionId: string): Promise<ApiResponse<Submission>>;
  triggerAiEvaluation(submissionId: string, overrides?: { githubRepoUrl?: string; deploymentUrl?: string; notes?: string }): Promise<ApiResponse<AiEvaluation>>;
  resubmitProject(submissionId: string, data: {
    githubRepoUrl: string;
    deploymentUrl: string;
    notes?: string;
  }): Promise<ApiResponse<Submission>>;
}

export interface IUserService {
  getCurrentUser(): Promise<ApiResponse<User | null>>;
  getUserByUsername(username: string): Promise<ApiResponse<User>>;
  loginWithGithub(): Promise<ApiResponse<User>>;
  loginWithEmail(email: string): Promise<ApiResponse<User>>;
  logout(): Promise<ApiResponse<{ loggedOut: boolean }>>;
}

export interface ISettlementService {
  getSettlementSummary(sprintId: string): Promise<ApiResponse<SettlementSummary>>;
}

export interface ILeaderboardService {
  getLeaderboard(timeframe?: "weekly" | "monthly" | "allTime"): Promise<ApiResponse<LeaderboardEntry[]>>;
}
