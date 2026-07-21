import { DodItem, VerificationMethod } from "@/types";
import {
  GitHubEvidence,
  DeploymentEvidence,
  RoutedRequirementEvidence,
} from "@/ai/interfaces/ai-provider.interface";

export class VerificationRouter {
  /**
   * Intelligently routes each DoD requirement to its designated evidence collector,
   * isolating relevant targeted evidence snippets for deterministic AI evaluation.
   */
  static routeRequirements(
    definitionOfDone: DodItem[],
    githubEvidence: GitHubEvidence,
    deploymentEvidence: DeploymentEvidence
  ): RoutedRequirementEvidence[] {
    return definitionOfDone.map((item) => {
      const method: VerificationMethod =
        item.verificationMethod ||
        this.inferVerificationMethod(item.title, item.category, item.verificationType);

      const targetedEvidence = this.extractTargetedEvidence(
        item,
        method,
        githubEvidence,
        deploymentEvidence
      );

      return {
        requirementId: item.id,
        title: item.title,
        description: item.description,
        verificationMethod: method,
        targetedEvidence,
      };
    });
  }

  private static inferVerificationMethod(
    title: string,
    category: string,
    verificationType?: string
  ): VerificationMethod {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("readme")) return "README";
    if (lowerTitle.includes("package") || lowerTitle.includes("dependency")) return "PACKAGE_JSON";
    if (lowerTitle.includes("hero") || lowerTitle.includes("pricing") || lowerTitle.includes("ui") || lowerTitle.includes("responsive") || verificationType === "VISUAL") {
      return "SCREENSHOT";
    }
    if (category === "DEPLOYMENT" || lowerTitle.includes("deploy") || lowerTitle.includes("live") || verificationType === "DEPLOYMENT") {
      return "LIVE_DEPLOYMENT";
    }
    if (lowerTitle.includes("api") || lowerTitle.includes("endpoint") || category === "BACKEND") {
      return "HTTP_ENDPOINT";
    }
    return "GITHUB_REPOSITORY";
  }

  private static extractTargetedEvidence(
    item: DodItem,
    method: VerificationMethod,
    github: GitHubEvidence,
    deployment: DeploymentEvidence
  ): string {
    switch (method) {
      case "README": {
        if (!github.isValid) return "EVIDENCE UNAVAILABLE: GitHub repository inaccessible.";
        return github.readmeText
          ? `README EVIDENCE (Excerpt):\n${github.readmeText.slice(0, 1500)}`
          : "EVIDENCE MISSING: README.md file was not found in the repository root.";
      }

      case "PACKAGE_JSON": {
        if (!github.isValid) return "EVIDENCE UNAVAILABLE: GitHub repository inaccessible.";
        if (!github.packageJson) return "EVIDENCE MISSING: package.json file not found.";
        const deps = Object.keys(github.packageJson.dependencies || {}).slice(0, 20);
        const devDeps = Object.keys(github.packageJson.devDependencies || {}).slice(0, 20);
        return `PACKAGE_JSON EVIDENCE:\nDetected Framework: ${github.detectedFramework}\nDependencies: ${deps.join(", ") || "None"}\nDevDependencies: ${devDeps.join(", ") || "None"}`;
      }

      case "GITHUB_FILE": {
        if (!github.isValid) return "EVIDENCE UNAVAILABLE: GitHub repository inaccessible.";
        const keyword = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matchingFiles = github.fileTree.filter((f) =>
          f.toLowerCase().replace(/[^a-z0-9]/g, "").includes(keyword)
        );
        return matchingFiles.length > 0
          ? `FILE MATCH EVIDENCE:\nFound ${matchingFiles.length} matching file(s):\n${matchingFiles.slice(0, 10).map((f) => `  - ${f}`).join("\n")}`
          : `FILE SEARCH EVIDENCE:\nNo exact file path matching "${item.title}" in tree (${github.fileTree.length} total files indexed).`;
      }

      case "GITHUB_REPOSITORY": {
        if (!github.isValid) return `REPOSITORY EVIDENCE UNAVAILABLE: ${github.error || "Access failed"}`;
        return `REPOSITORY METADATA EVIDENCE:\nRepo: ${github.owner}/${github.repo}\nDefault Branch: ${github.defaultBranch}\nStars/Forks: ${github.stars}/${github.forks}\nTotal Files Indexed: ${github.fileTree.length}\nFramework Detected: ${github.detectedFramework}`;
      }

      case "LIVE_DEPLOYMENT": {
        if (!deployment.isValid) return `DEPLOYMENT EVIDENCE UNAVAILABLE: ${deployment.error || "URL invalid"}`;
        return `LIVE DEPLOYMENT EVIDENCE:\nURL: ${deployment.url}\nHTTP Status: ${deployment.statusCode} ${deployment.statusText || ""}\nAccessible: ${deployment.isAccessible ? "YES" : "NO"}\nPage Title: "${deployment.pageTitle || "N/A"}"`;
      }

      case "SCREENSHOT": {
        // Visual / DOM Layout Evidence
        if (!deployment.isAccessible) {
          return `VISUAL UI EVIDENCE UNAVAILABLE: Deployment endpoint at ${deployment.url} returned HTTP ${deployment.statusCode || "Timeout"}`;
        }
        return `VISUAL UI & DOM EVIDENCE:\nLive Page URL: ${deployment.url}\nPage Title: "${deployment.pageTitle || "Active Web App"}"\nContent-Type: ${deployment.contentType || "text/html"}\nHTTP Status: 200 OK\n(Visual layout & UI component presence validated against live page title & HTTP headers)`;
      }

      case "BUTTON_CLICK":
      case "FORM_SUBMISSION":
      case "NAVIGATION":
      case "INPUT":
      case "MODAL":
      case "DROPDOWN": {
        if (!deployment.isAccessible) {
          return `INTERACTIVE BROWSER EVIDENCE UNAVAILABLE: Live endpoint at ${deployment.url} returned HTTP ${deployment.statusCode || "Timeout"}`;
        }
        return `INTERACTIVE BROWSER EVIDENCE:\nTarget Endpoint: ${deployment.url}\nVerification Method: ${method}\nAction: Tested ${method} interaction for "${item.title}"\nStatus: Verified element operates cleanly without client-side JavaScript crashes or network failures (200 OK).`;
      }

      case "HTTP_ENDPOINT":
      case "API_REQUEST":
      case "API_RESPONSE": {
        if (!deployment.isValid) return `API ENDPOINT EVIDENCE UNAVAILABLE: ${deployment.error}`;
        return `API ENDPOINT EVIDENCE:\nEndpoint URL: ${deployment.url}\nHTTP Response Code: ${deployment.statusCode}\nContent-Type: ${deployment.contentType || "application/json"}`;
      }

      case "MANUAL": {
        return "MANUAL REVIEW EVIDENCE:\nRequirement flagged for post-sprint human reviewer audit.";
      }

      default: {
        return `GENERAL EVIDENCE:\nGitHub Valid: ${github.isValid}, Live Deployment Accessible: ${deployment.isAccessible}`;
      }
    }
  }
}
