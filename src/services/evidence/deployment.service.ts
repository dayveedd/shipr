import { DeploymentEvidence } from "@/ai/interfaces/ai-provider.interface";

const deploymentCache = new Map<string, { data: DeploymentEvidence; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

export async function isPrivateIP(urlStr: string): Promise<boolean> {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "0.0.0.0") {
      return true;
    }
    
    const parts = hostname.split(".").map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      if (parts[0] === 10) return true;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      if (parts[0] === 192 && parts[1] === 168) return true;
      if (parts[0] === 169 && parts[1] === 254) return true;
    }
    return false;
  } catch {
    return true; // Treat lookup failures or invalid hostnames as private/unsafe
  }
}

async function fetchWithTimeout(url: string, options: any, timeoutMs = 5000, retries = 2): Promise<Response> {
  let lastError: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt < retries) {
        // Wait 500ms before retrying timeout
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  throw lastError;
}

export async function verifyDeployment(deploymentUrl: string): Promise<DeploymentEvidence> {
  try {
    const cleanUrl = deploymentUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      return {
        isValid: false,
        url: cleanUrl,
        isAccessible: false,
        error: "Deployment URL must start with http:// or https://",
      };
    }

    const cached = deploymentCache.get(cleanUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // SSRF Check: block private space unless local testing is explicitly enabled
    const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_USE_MOCK === "true";
    const isPrivate = await isPrivateIP(cleanUrl);
    if (isPrivate && !isDev) {
      return {
        isValid: false,
        url: cleanUrl,
        isAccessible: false,
        error: "SSRF Warning: Access to private or local addresses is restricted in production.",
      };
    }

    const res = await fetchWithTimeout(cleanUrl, {
      method: "GET",
      headers: {
        "User-Agent": "ShipR-AI-Judge-Scanner/1.0",
        Accept: "text/html,application/xhtml+xml,application/json",
      },
    }, 5000, 2);

    const statusCode = res.status;
    const contentType = res.headers.get("content-type") || "";
    let pageTitle = "";

    if (contentType.includes("text/html")) {
      const htmlText = await res.text();
      const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        pageTitle = titleMatch[1].trim();
      }
    }

    const isAccessible = statusCode >= 200 && statusCode < 400;

    const finalResult: DeploymentEvidence = {
      isValid: true,
      url: cleanUrl,
      statusCode,
      statusText: res.statusText,
      pageTitle,
      contentType,
      isAccessible,
    };

    deploymentCache.set(cleanUrl, { data: finalResult, timestamp: Date.now() });
    return finalResult;
  } catch (err: any) {
    const isAbort = err.name === "AbortError" || err.message?.includes("aborted");
    const finalResult: DeploymentEvidence = {
      isValid: false,
      url: deploymentUrl,
      isAccessible: false,
      error: isAbort ? "Deployment URL timed out after 5 seconds" : err.message || "Deployment URL unreachable",
    };
    return finalResult;
  }
}
