import { GitHubEvidence } from "@/ai/interfaces/ai-provider.interface";

const githubCache = new Map<string, { data: GitHubEvidence; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

async function fetchWithRetry(url: string, options: any, retries = 3, delay = 1000): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (res.status === 429 && retries > 0) {
      const retryAfter = Number(res.headers.get("retry-after") || "2");
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    if (!res.ok && res.status >= 500 && retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
}

export async function fetchGitHubEvidence(githubRepoUrl: string): Promise<GitHubEvidence> {
  try {
    const cleanUrl = githubRepoUrl.trim().replace(/\.git$/, "");
    const cached = githubCache.get(cleanUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);

    if (!match) {
      return {
        isValid: false,
        owner: "",
        repo: "",
        fileTree: [],
        error: "Invalid GitHub repository URL format. Must be https://github.com/owner/repo",
      };
    }

    const owner = match[1];
    const repo = match[2];

    const headers: Record<string, string> = {
      "User-Agent": "ShipR-AI-Judge-Scanner/1.0",
      Accept: "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "your_optional_github_token_here" && process.env.GITHUB_TOKEN.trim() !== "") {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch Repository Metadata
    const repoRes = await fetchWithRetry(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      return {
        isValid: false,
        owner,
        repo,
        fileTree: [],
        error: `GitHub Repository not found or private (HTTP status ${repoRes.status})`,
      };
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. Fetch File Tree
    let fileTree: string[] = [];
    const treeRes = await fetchWithRetry(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers }
    );

    if (treeRes.ok) {
      const treeData = await treeRes.json();
      fileTree = (treeData.tree || [])
        .map((item: any) => item.path)
        .slice(0, 150); // Limit to top 150 files for LLM context optimization
    }

    // 3. Fetch README.md
    let readmeText = "";
    const readmeRes = await fetchWithRetry(
      `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`,
      { headers }
    );
    if (readmeRes.ok) {
      const rawReadme = await readmeRes.text();
      readmeText = rawReadme.slice(0, 3000); // Truncate to first 3000 chars
    }

    // 4. Fetch package.json
    let packageJson: any = null;
    let detectedFramework = "Custom / General Web";
    const pkgRes = await fetchWithRetry(
      `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`,
      { headers }
    );

    if (pkgRes.ok) {
      try {
        packageJson = await pkgRes.json();
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (deps["next"]) detectedFramework = "Next.js";
        else if (deps["react-native"] || deps["expo"]) detectedFramework = "React Native / Expo";
        else if (deps["react"]) detectedFramework = "React";
        else if (deps["vue"] || deps["nuxt"]) detectedFramework = "Vue / Nuxt";
        else if (deps["svelte"]) detectedFramework = "Svelte";
        else if (deps["express"] || deps["fastify"] || deps["@nestjs/core"]) detectedFramework = "Node.js / Express Backend";
      } catch {
        // ignore JSON parse error
      }
    } else {
      // Check for Python / Go / Rust
      if (fileTree.some((f) => f.includes("main.py") || f.includes("requirements.txt") || f.includes("Pipfile"))) {
        detectedFramework = "Python / FastAPI / Django";
      } else if (fileTree.some((f) => f.includes("main.go") || f.includes("go.mod"))) {
        detectedFramework = "Go";
      }
    }

    const finalResult: GitHubEvidence = {
      isValid: true,
      owner,
      repo,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      defaultBranch,
      fileTree,
      readmeText,
      packageJson,
      detectedFramework,
    };

    githubCache.set(cleanUrl, { data: finalResult, timestamp: Date.now() });
    return finalResult;
  } catch (err: any) {
    return {
      isValid: false,
      owner: "",
      repo: "",
      fileTree: [],
      error: err.message || "Failed to inspect GitHub repository",
    };
  }
}
