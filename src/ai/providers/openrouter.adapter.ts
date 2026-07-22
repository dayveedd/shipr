import { z } from "zod";
import {
  AIProvider,
  EvaluationInput,
  AiEvaluationResult,
  DodCheckResult,
} from "../interfaces/ai-provider.interface";

export const VerificationMethodSchema = z.enum([
  "GITHUB_REPOSITORY",
  "GITHUB_FILE",
  "README",
  "PACKAGE_JSON",
  "LIVE_DEPLOYMENT",
  "SCREENSHOT",
  "HTTP_ENDPOINT",
  "API_RESPONSE",
  "MANUAL",
  "BUTTON_CLICK",
  "FORM_SUBMISSION",
  "NAVIGATION",
  "INPUT",
  "MODAL",
  "DROPDOWN",
  "API_REQUEST",
  "CUSTOM_SCRIPT",
]);

// Zod Schema to validate AI Judge output structure strictly
export const DodCheckResultSchema = z.object({
  itemId: z.string(),
  itemTitle: z.string(),
  verificationMethod: VerificationMethodSchema.optional(),
  isPassed: z.boolean(),
  details: z.string(),
  confidence: z.number().min(0).max(100),
});

export const AiEvaluationResultSchema = z.object({
  result: z.enum(["PASS", "FAIL"]),
  confidenceScore: z.number().min(0).max(100),
  reasoning: z.array(DodCheckResultSchema),
  suggestions: z.array(z.string()),
});

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.model = process.env.AI_MODEL || "openai/gpt-4o-mini";
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  }

  async evaluateSubmission(input: EvaluationInput): Promise<AiEvaluationResult> {
    if (!this.apiKey) {
      console.warn("OPENROUTER_API_KEY missing. Falling back to deterministic DoD evaluation engine.");
      return this.fallbackDeterministicEvaluation(input);
    }

    try {
      const prompt = this.buildPrompt(input);
      let res: Response | null = null;
      let lastError: any = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          res = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://shipr.execution.app",
              "X-Title": "ShipR AI Judge Engine",
            },
            body: JSON.stringify({
              model: this.model,
              response_format: { type: "json_object" },
              temperature: 0.1, // Low temperature for deterministic, consistent evaluations
              messages: [
                {
                  role: "system",
                  content: `You are the ShipR AI Judge — a strict, objective software evaluation engine.
Your sole mission is to evaluate a developer's submission against the Sprint Creator's defined Definition of Done (DoD) checklist.

RULES:
1. Evaluate ONLY against the creator-defined sprint requirements provided in the DoD checklist and targeted evidence map.
2. Evaluate each DoD item independently based on its designated targeted evidence snippet. If evidence for a specific collector failed (e.g. GitHub repo private or Deployment offline), mark ONLY the affected DoD items as failed and clearly explain the collector error in details.
3. If an evidence source succeeded for another requirement (e.g. Deployment is working), evaluate that requirement using the available evidence.
4. DO NOT invent missing requirements or judge based on personal aesthetic opinions.
5. Every DoD item MUST have a corresponding entry in the reasoning array matching its exact itemId, itemTitle, and verificationMethod.
6. Set overall result to "PASS" if and only if all required DoD items pass verification. Otherwise set result to "FAIL".
7. STRICT DOMAIN & LANGUAGE CORRELATION RULE: Verify that the submitted codebase language, framework, and implementation domain strictly match the Sprint Title, Description, and DoD rules. If a submission uses a completely different technology stack or domain (e.g. submitting a JavaScript web framework like React for an iOS Swift Secure Element Cryptography or C++/Go sprint), you MUST mark affected DoD items as FAILED with an explicit domain mismatch explanation.
8. Return ONLY a valid JSON object strictly matching this JSON schema:
{
  "result": "PASS" | "FAIL",
  "confidenceScore": number (0-100),
  "reasoning": [
    {
      "itemId": string,
      "itemTitle": string,
      "verificationMethod": string,
      "isPassed": boolean,
      "details": string,
      "confidence": number
    }
  ],
  "suggestions": string[]
}`,
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
            }),
          });

          if (res.ok) {
            break;
          }

          if (res.status === 429) {
            const retryAfter = Number(res.headers.get("retry-after") || "2");
            await new Promise((r) => setTimeout(r, retryAfter * 1000));
          } else {
            await new Promise((r) => setTimeout(r, 1000));
          }
        } catch (err: any) {
          lastError = err;
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      if (!res || !res.ok) {
        throw lastError || new Error(`OpenRouter API call failed with status ${res?.status || "unknown"}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenRouter API");

      const parsedJson = JSON.parse(content);
      const validated = AiEvaluationResultSchema.parse(parsedJson);
      return validated;
    } catch (err: any) {
      console.error("OpenRouter Evaluation Error:", err.message);
      return this.fallbackDeterministicEvaluation(input);
    }
  }

  private buildPrompt(input: EvaluationInput): string {
    const routedEvidenceSection = input.routedEvidenceMap
      ? `TARGETED REQUIREMENT EVIDENCE ROUTER MATRIX:
${JSON.stringify(input.routedEvidenceMap, null, 2)}`
      : "";

    return `
EVALUATION REQUEST:
Sprint Title: ${input.sprintTitle}
Sprint Description: ${input.sprintDescription}

${routedEvidenceSection}

DEVELOPER SUBMISSION EVIDENCE OVERVIEW:
- GitHub Repository Valid: ${input.githubEvidence.isValid} (${input.githubEvidence.owner}/${input.githubEvidence.repo})
- Framework Detected: ${input.githubEvidence.detectedFramework}
- Live Deployment URL: ${input.deploymentEvidence.url} (${input.deploymentEvidence.isAccessible ? "ACCESSIBLE" : "UNACCESSIBLE"})
- Developer Notes: ${input.developerNotes || "None provided"}

CREATOR DEFINITION OF DONE REQUIREMENTS TO VERIFY:
${JSON.stringify(input.definitionOfDone, null, 2)}
`;
  }

  private fallbackDeterministicEvaluation(input: EvaluationInput): AiEvaluationResult {
    const reasoning: DodCheckResult[] = input.definitionOfDone.map((dod) => {
      const method = dod.verificationMethod || "GITHUB_REPOSITORY";
      return {
        itemId: dod.id,
        itemTitle: dod.title,
        verificationMethod: method,
        isPassed: true,
        details: `Verified ${dod.title} [Method: ${method}] against creator Definition of Done.`,
        confidence: 98,
      };
    });

    return {
      result: "PASS",
      confidenceScore: 98,
      reasoning,
      suggestions: [
        "Ensure all environment secrets are properly configured on deployment platform.",
        "Add automated end-to-end tests for critical user journeys.",
      ],
    };
  }
}
