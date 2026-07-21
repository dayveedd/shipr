import {
  ISprintService,
  ISubmissionService,
  IUserService,
  ISettlementService,
  ILeaderboardService,
} from "./interfaces";
import {
  MOCK_SPRINTS,
  MOCK_CURRENT_USER,
  MOCK_AI_EVALUATION_PASS,
  MOCK_SETTLEMENT_SUMMARY,
  MOCK_LEADERBOARD,
} from "./mockData";
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let currentUser: User | null = MOCK_CURRENT_USER;

export class MockSprintService implements ISprintService {
  async getSprints(status?: SprintStatus): Promise<ApiResponse<Sprint[]>> {
    await delay(300);
    const data = status
      ? MOCK_SPRINTS.filter((s) => s.status === status)
      : MOCK_SPRINTS;
    return { success: true, message: "Sprints fetched successfully", data };
  }

  async getSprintBySlug(slug: string): Promise<ApiResponse<Sprint>> {
    await delay(300);
    const sprint = MOCK_SPRINTS.find((s) => s.slug === slug);
    if (!sprint) {
      return { success: false, message: "Sprint not found", data: MOCK_SPRINTS[0] };
    }
    return { success: true, message: "Sprint fetched successfully", data: sprint };
  }

  async joinSprint(sprintId: string): Promise<ApiResponse<{ sprintId: string; joined: boolean }>> {
    await delay(500);
    const sprint = MOCK_SPRINTS.find((s) => s.id === sprintId);
    if (sprint && sprint.filledSlots < sprint.totalSlots) {
      sprint.filledSlots += 1;
    }
    return {
      success: true,
      message: "Successfully joined commitment pool via Monnify",
      data: { sprintId, joined: true },
    };
  }
}

export class MockSubmissionService implements ISubmissionService {
  async submitProof(data: {
    sprintId: string;
    githubRepoUrl: string;
    deploymentUrl: string;
    notes?: string;
  }): Promise<ApiResponse<Submission>> {
    await delay(600);
    const newSubmission: Submission = {
      id: `sub_${Date.now()}`,
      sprintId: data.sprintId,
      userId: currentUser?.id || "usr_1",
      githubRepoUrl: data.githubRepoUrl,
      deploymentUrl: data.deploymentUrl,
      notes: data.notes,
      submittedAt: new Date().toISOString(),
      stage: "SUBMISSION_RECEIVED",
    };
    return { success: true, message: "Proof submitted successfully", data: newSubmission };
  }

  async getSubmissionStatus(submissionId: string): Promise<ApiResponse<Submission>> {
    await delay(300);
    const submission: Submission = {
      id: submissionId,
      sprintId: "spr_react_01",
      userId: currentUser?.id || "usr_1",
      githubRepoUrl: "https://github.com/sarahdev/shipr-landing",
      deploymentUrl: "https://shipr-landing.vercel.app",
      submittedAt: new Date().toISOString(),
      stage: "PAYMENT_SUCCESSFUL",
      payoutTxHash: "MNFY-TX-84920194",
    };
    return { success: true, message: "Submission status fetched", data: submission };
  }

  async triggerAiEvaluation(submissionId: string): Promise<ApiResponse<AiEvaluation>> {
    await delay(1200);
    return { success: true, message: "AI evaluation completed", data: MOCK_AI_EVALUATION_PASS };
  }

  async resubmitProject(submissionId: string, data: { githubRepoUrl: string; deploymentUrl: string; notes?: string }): Promise<ApiResponse<Submission>> {
    await delay(500);
    const updatedSubmission: Submission = {
      id: submissionId,
      sprintId: "spr_react_01",
      userId: currentUser?.id || "usr_1",
      githubRepoUrl: data.githubRepoUrl,
      deploymentUrl: data.deploymentUrl,
      notes: data.notes,
      submittedAt: new Date().toISOString(),
      stage: "AI_REVIEW_IN_PROGRESS",
      version: 2,
    };
    return { success: true, message: "Project resubmitted successfully (Attempt v2)", data: updatedSubmission };
  }
}

export class MockUserService implements IUserService {
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(200);
    return { success: true, message: "Current user fetched", data: currentUser };
  }

  async getUserByUsername(username: string): Promise<ApiResponse<User>> {
    await delay(300);
    return { success: true, message: "User profile fetched", data: MOCK_CURRENT_USER };
  }

  async loginWithGithub(): Promise<ApiResponse<User>> {
    await delay(800);
    currentUser = MOCK_CURRENT_USER;
    return { success: true, message: "GitHub OAuth Login Successful", data: currentUser };
  }

  async loginWithEmail(email: string): Promise<ApiResponse<User>> {
    await delay(800);
    currentUser = {
      id: `usr_${Date.now()}`,
      githubUsername: email.split("@")[0],
      name: email.split("@")[0].replace(".", " "),
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      role: "BUILDER",
      rank: "GOLD",
      totalEarnedNgn: 45000,
      sprintsCompleted: 6,
      currentStreak: 3,
      longestStreak: 5,
      successRate: 92,
      joinedAt: new Date().toISOString(),
    };
    return { success: true, message: "Email Magic Link Login Successful", data: currentUser };
  }

  async logout(): Promise<ApiResponse<{ loggedOut: boolean }>> {
    await delay(300);
    currentUser = null;
    return { success: true, message: "Logged out successfully", data: { loggedOut: true } };
  }
}

export class MockSettlementService implements ISettlementService {
  async getSettlementSummary(sprintId: string): Promise<ApiResponse<SettlementSummary>> {
    await delay(400);
    return { success: true, message: "Settlement summary fetched", data: MOCK_SETTLEMENT_SUMMARY };
  }
}

export class MockLeaderboardService implements ILeaderboardService {
  async getLeaderboard(timeframe: "weekly" | "monthly" | "allTime" = "allTime"): Promise<ApiResponse<LeaderboardEntry[]>> {
    await delay(300);
    return { success: true, message: "Leaderboard fetched", data: MOCK_LEADERBOARD };
  }
}
