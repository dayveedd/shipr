import { DodItem, VerificationMethod } from "@/types";

export interface GitHubEvidence {
  isValid: boolean;
  owner: string;
  repo: string;
  stars?: number;
  forks?: number;
  defaultBranch?: string;
  fileTree: string[];
  readmeText?: string;
  packageJson?: any;
  detectedFramework?: string;
  error?: string;
}

export interface DeploymentEvidence {
  isValid: boolean;
  url: string;
  statusCode?: number;
  statusText?: string;
  pageTitle?: string;
  contentType?: string;
  isAccessible: boolean;
  error?: string;
}

export interface RoutedRequirementEvidence {
  requirementId: string;
  title: string;
  description: string;
  verificationMethod: VerificationMethod;
  targetedEvidence: string;
}

export interface EvaluationInput {
  submissionId: string;
  sprintTitle: string;
  sprintDescription: string;
  definitionOfDone: DodItem[];
  githubEvidence: GitHubEvidence;
  deploymentEvidence: DeploymentEvidence;
  routedEvidenceMap?: RoutedRequirementEvidence[];
  developerNotes?: string;
}

export interface DodCheckResult {
  itemId: string;
  itemTitle: string;
  verificationMethod?: VerificationMethod;
  isPassed: boolean;
  details: string;
  confidence: number;
}

export interface AiEvaluationResult {
  result: "PASS" | "FAIL";
  confidenceScore: number;
  reasoning: DodCheckResult[];
  suggestions: string[];
}

export interface AIProvider {
  evaluateSubmission(input: EvaluationInput): Promise<AiEvaluationResult>;
}
