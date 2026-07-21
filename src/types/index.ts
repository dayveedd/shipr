export type SprintStatus = "ACTIVE" | "UPCOMING" | "EVALUATING" | "SETTLED";
export type ExecutionRank = "BRONZE" | "SILVER" | "GOLD" | "ELITE";
export type UserRole = "BUILDER" | "VERIFIED_CREATOR" | "ADMIN";

export type ChallengeCategory =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "MOBILE"
  | "AI_ENGINEERING"
  | "DEVOPS";

export interface DodItem {
  id: string;
  title: string;
  description: string;
  category: "FRONTEND" | "BACKEND" | "DEPLOYMENT" | "TESTING" | "CODE_QUALITY";
  isRequired: boolean;
}

export type DefinitionOfDoneItem = DodItem;

export interface Sprint {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ChallengeCategory;
  commitmentNgn: number;
  totalSlots: number;
  filledSlots: number;
  durationHours: number;
  status: SprintStatus;
  startTime: string;
  endTime: string;
  totalPoolNgn: number;
  passCount: number;
  failCount: number;
  tags: string[];
  definitionOfDone: DodItem[];
  creatorId?: string;
  creatorName?: string;
  isFeatured?: boolean;
  poolAccounts?: Array<{
    bankName: string;
    accountNumber: string;
    bankCode: string;
  }>;
  subAccountCode?: string;
}

export interface User {
  id: string;
  githubUsername: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  rank: ExecutionRank;
  totalEarnedNgn: number;
  sprintsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  successRate: number; // Percentage e.g. 92
  joinedAt: string;
  isVerifiedCreator?: boolean;
  creatorVerificationStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
}

export type FinancialWorkflowStage =
  | "SUBMISSION_RECEIVED"
  | "AI_REVIEW_IN_PROGRESS"
  | "AI_REVIEW_COMPLETE"
  | "SETTLEMENT_PROCESSING"
  | "PAYMENT_PROCESSING"
  | "FUNDS_RELEASED"
  | "PAYMENT_SUCCESSFUL"
  | "SUBMISSION_FAILED";

export interface SubmissionRequest {
  sprintId: string;
  githubRepoUrl: string;
  deploymentUrl: string;
  notes?: string;
}

export interface Submission {
  id: string;
  sprintId: string;
  userId: string;
  githubRepoUrl: string;
  deploymentUrl: string;
  notes?: string;
  submittedAt: string;
  stage: FinancialWorkflowStage;
  payoutTxHash?: string;
  settledAt?: string;
}

export interface DodCheckResult {
  itemId: string;
  itemTitle: string;
  isPassed: boolean;
  details: string;
  confidence: number;
}

export interface AiEvaluation {
  id: string;
  submissionId: string;
  result: "PASS" | "FAIL";
  confidenceScore: number;
  reasoning: DodCheckResult[];
  suggestions: string[];
  evaluatedAt: string;
}

export interface SettlementSummary {
  sprintId: string;
  sprintTitle: string;
  totalPoolNgn: number;
  totalParticipants: number;
  passCount: number;
  failCount: number;
  initialStakeRefundNgn: number;
  redistributedBonusNgn: number;
  totalReturnPerPassNgn: number;
  settledAt: string;
}

export interface LeaderboardEntry {
  rankPosition: number;
  user: User;
  totalEarnedNgn: number;
  successRate: number;
  streak: number;
  completedSprintsCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
