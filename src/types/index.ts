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

export type VerificationType = "REPOSITORY" | "DEPLOYMENT" | "VISUAL" | "HYBRID";

export type VerificationMethod =
  | "GITHUB_REPOSITORY"
  | "GITHUB_FILE"
  | "README"
  | "PACKAGE_JSON"
  | "LIVE_DEPLOYMENT"
  | "SCREENSHOT"
  | "HTTP_ENDPOINT"
  | "API_RESPONSE"
  | "MANUAL"
  | "BUTTON_CLICK"
  | "FORM_SUBMISSION"
  | "NAVIGATION"
  | "INPUT"
  | "MODAL"
  | "DROPDOWN"
  | "API_REQUEST"
  | "CUSTOM_SCRIPT";

export interface EvidenceTimelineEvent {
  id: string;
  stepName: string;
  timestamp: string;
  status: "SUCCESS" | "FAIL" | "INFO";
  evidenceSource: string;
  relatedRequirement?: string;
  details: string;
}

export interface IntegrityCheckItem {
  name: string;
  passed: boolean;
  category: "REPOSITORY" | "DEPLOYMENT" | "BROWSER" | "EVIDENCE";
  details: string;
}

export interface SubmissionIntegrityReport {
  integrityScore: number;
  status: "PASS" | "WARNING" | "FLAGGED";
  flags: string[];
  checks: IntegrityCheckItem[];
  evaluatedAt: string;
}

export interface EvaluationSession {
  id: string;
  submissionId: string;
  sprintId: string;
  githubRepoUrl: string;
  deploymentUrl: string;
  status: "INITIALIZING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  startTime: string;
  endTime?: string;
  events: Array<{
    step: number;
    totalSteps: number;
    type: "info" | "success" | "fail" | "warn";
    stage: string;
    message: string;
    timestamp: string;
  }>;
  result?: any;
  error?: string;
}

export interface DodItem {
  id: string;
  title: string;
  description: string;
  category: "FRONTEND" | "BACKEND" | "DEPLOYMENT" | "TESTING" | "CODE_QUALITY";
  verificationType?: VerificationType;
  verificationMethod?: VerificationMethod;
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

export interface SubmissionAttempt {
  attemptId: string;
  version: number;
  submittedAt: string;
  githubRepoUrl: string;
  deploymentUrl: string;
  notes?: string;
  evaluation: AiEvaluation;
  timeline: EvidenceTimelineEvent[];
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
  version?: number;
  attempts?: SubmissionAttempt[];
  sprintTitle?: string;
  stakeNgn?: number;
}

export interface DodCheckResult {
  itemId: string;
  itemTitle: string;
  isPassed: boolean;
  details: string;
  confidence: number;
  verificationMethod?: string;
  evidenceUsed?: string;
}

export interface AiEvaluation {
  id: string;
  submissionId: string;
  result: "PASS" | "FAIL";
  confidenceScore: number;
  overallScore?: number;
  reasoning: DodCheckResult[];
  suggestions: string[];
  evaluatedAt: string;
  version?: number;
  timeline?: EvidenceTimelineEvent[];
  evidenceDetails?: {
    github?: {
      framework?: string;
      hasReadme?: boolean;
      readmeSnippet?: string;
      packageJsonDeps?: string[];
      indexedFiles?: string[];
    };
    deployment?: {
      statusCode?: number;
      pageTitle?: string;
      headers?: Record<string, string>;
      isAccessible?: boolean;
    };
    screenshots?: {
      desktopCaptured?: boolean;
      mobileCaptured?: boolean;
      desktopUrl?: string;
      mobileUrl?: string;
    };
    browserTesting?: {
      clickedButtons?: string[];
      formsTested?: string[];
      navigationTested?: string[];
      consoleErrors?: string[];
      networkFailures?: string[];
    };
    integrity?: SubmissionIntegrityReport;
  };
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
