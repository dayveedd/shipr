import { EvaluationSession } from "@/types";
import { EvaluationOrchestrator } from "@/services/orchestration/evaluation-orchestrator.service";

const globalSessions = new Map<string, EvaluationSession>();

export class EvaluationSessionService {
  /**
   * Initializes a new evaluation session, starts the Evaluation Orchestrator,
   * subscribes to real-time events, and updates progress percentages.
   */
  static startSession(payload: {
    submissionId?: string;
    sprintId?: string;
    githubRepoUrl?: string;
    deploymentUrl?: string;
    notes?: string;
  }): EvaluationSession {
    const sessionId = `sess_${Date.now()}`;
    const submissionId = payload.submissionId || `sub_${Date.now()}`;

    const session: EvaluationSession = {
      id: sessionId,
      submissionId,
      sprintId: payload.sprintId || "spr_react_01",
      githubRepoUrl: payload.githubRepoUrl || "https://github.com/alexdev/react-landing-shipr",
      deploymentUrl: payload.deploymentUrl || "https://react-landing-shipr.vercel.app",
      status: "IN_PROGRESS",
      currentStep: 1,
      totalSteps: 8,
      progressPercent: 12,
      startTime: new Date().toISOString(),
      events: [
        {
          step: 1,
          totalSteps: 8,
          type: "info",
          stage: "INITIALIZING",
          message: "Evaluation session created. Launching orchestrator pipeline...",
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    };

    globalSessions.set(sessionId, session);

    // Launch orchestrator pipeline asynchronously
    EvaluationOrchestrator.runPipeline({
      submissionId,
      sprintId: payload.sprintId,
      githubRepoUrl: payload.githubRepoUrl,
      deploymentUrl: payload.deploymentUrl,
      notes: payload.notes,
      onProgress: (event) => {
        const sess = globalSessions.get(sessionId);
        if (sess) {
          sess.currentStep = event.step;
          sess.progressPercent = Math.min(100, Math.round((event.step / event.totalSteps) * 100));
          sess.events.push(event);
        }
      },
    })
      .then((result) => {
        const sess = globalSessions.get(sessionId);
        if (sess) {
          sess.status = "COMPLETED";
          sess.progressPercent = 100;
          sess.endTime = new Date().toISOString();
          sess.result = result;
        }
      })
      .catch((err) => {
        const sess = globalSessions.get(sessionId);
        if (sess) {
          sess.status = "FAILED";
          sess.error = err.message || "Pipeline execution failed";
        }
      });

    return session;
  }

  /**
   * Retrieves an evaluation session by ID.
   */
  static getSession(sessionId: string): EvaluationSession | undefined {
    return globalSessions.get(sessionId);
  }
}
