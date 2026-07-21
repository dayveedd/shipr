import { SubmissionIntegrityReport, IntegrityCheckItem } from "@/types";
import { GitHubEvidence, DeploymentEvidence } from "@/ai/interfaces/ai-provider.interface";

export class SubmissionIntegrityService {
  /**
   * Deterministically evaluates submission authenticity, repository mass, deployment reachability,
   * and evidence completeness prior to AI Judge quality evaluation.
   */
  static evaluateIntegrity(
    githubEvidence: GitHubEvidence,
    deploymentEvidence: DeploymentEvidence
  ): SubmissionIntegrityReport {
    const checks: IntegrityCheckItem[] = [];
    const flags: string[] = [];
    let score = 100;

    // 1. Repository Accessibility Check
    const repoAccessible = githubEvidence.isValid;
    checks.push({
      name: "Repository Accessible",
      passed: repoAccessible,
      category: "REPOSITORY",
      details: repoAccessible
        ? `GitHub repository connected (${githubEvidence.owner}/${githubEvidence.repo})`
        : `GitHub repository inaccessible (${githubEvidence.error || "Access denied"})`,
    });
    if (!repoAccessible) {
      score -= 35;
      flags.push("GitHub repository could not be accessed or verified");
    }

    // 2. Meaningful Code Density Check
    const fileCount = githubEvidence.fileTree.length;
    const hasMeaningfulCode = repoAccessible && fileCount >= 3;
    checks.push({
      name: "Meaningful Code Structure",
      passed: hasMeaningfulCode,
      category: "REPOSITORY",
      details: hasMeaningfulCode
        ? `Verified ${fileCount} files indexed in repository (${githubEvidence.detectedFramework || "Standard Web"})`
        : `Low file density detected (${fileCount} total files indexed)`,
    });
    if (!hasMeaningfulCode && repoAccessible) {
      score -= 20;
      flags.push("Repository contains minimal or template code files");
    }

    // 3. Documentation & Manifest Check
    const hasReadme = Boolean(githubEvidence.readmeText && githubEvidence.readmeText.length > 50);
    const hasPackageJson = Boolean(githubEvidence.packageJson);
    checks.push({
      name: "Documentation & Manifest Present",
      passed: hasReadme || hasPackageJson,
      category: "REPOSITORY",
      details: hasReadme
        ? "README.md file present with setup instructions"
        : hasPackageJson
        ? "package.json manifest present"
        : "Missing README.md or project documentation manifest",
    });
    if (!hasReadme && !hasPackageJson && repoAccessible) {
      score -= 15;
      flags.push("Repository lacks README documentation or package manifest");
    }

    // 4. Live Deployment Reachability Check
    const deployReachable = deploymentEvidence.isAccessible && deploymentEvidence.statusCode === 200;
    checks.push({
      name: "Deployment Endpoint Reachable",
      passed: deployReachable,
      category: "DEPLOYMENT",
      details: deployReachable
        ? `Live URL responded with HTTP ${deploymentEvidence.statusCode} OK (Title: "${deploymentEvidence.pageTitle || "Active Site"}")`
        : `Deployment endpoint returned HTTP ${deploymentEvidence.statusCode || "Timeout"} (${deploymentEvidence.error || "Unreachable"})`,
    });
    if (!deployReachable) {
      score -= 30;
      flags.push("Live deployment URL was unreachable or returned an HTTP error");
    }

    // 5. Evidence Completeness Check
    const evidenceComplete = repoAccessible && deployReachable;
    checks.push({
      name: "Sufficient Evidence Collected",
      passed: evidenceComplete,
      category: "EVIDENCE",
      details: evidenceComplete
        ? "All required repository & deployment evidence sources successfully collected"
        : "Incomplete evidence payload — manual audit recommended",
    });

    const finalScore = Math.max(0, score);
    let status: "PASS" | "WARNING" | "FLAGGED" = "PASS";
    if (finalScore < 60) {
      status = "FLAGGED";
    } else if (finalScore < 85 || flags.length > 0) {
      status = "WARNING";
    }

    return {
      integrityScore: finalScore,
      status,
      flags,
      checks,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
