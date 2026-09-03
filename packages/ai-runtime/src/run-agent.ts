import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import type { AgentRunRequest, AgentRunResult } from "./types";
import {
  createSandbox,
  type SandboxProvider,
} from "./sandbox";
import { assertWithinBudget } from "./budget";
import {
  appendAgentEvent,
  createAgentRun,
  updateAgentRunStatus,
  type AgentEventLog,
} from "./event-log";

export type StartAgentRunOptions = {
  /** When set, opens an agentRuns row and emits run_started (TUS-2759). */
  readonly eventLog?: AgentEventLog;
  /** Required when eventLog is provided. */
  readonly agentSlug?: string;
};

/**
 * Runtime agent entry: validate + budget gate + sandbox gate.
 * When an event log is passed, also opens the durable run index.
 * Orchestration (credits, inference Effect programs) stays in Convex actions.
 */
export async function startAgentRun(
  sandbox: SandboxProvider,
  request: AgentRunRequest,
  options: StartAgentRunOptions = {},
): Promise<Result<AgentRunResult & { sandboxId?: string }, StudioError>> {
  if (!request.goal.trim()) {
    return err(studioError("VALIDATION", "Agent goal is required"));
  }

  if (!request.requireSandbox) {
    return err(
      studioError(
        "VALIDATION",
        "Runtime agents must set requireSandbox: true",
      ),
    );
  }

  const budget = assertWithinBudget(
    { maxTurns: request.maxTurns, maxSpendCredits: request.maxSpendCredits },
    { turnsUsed: request.turns.length, creditsSpent: 0 },
  );
  if (!budget.ok) {
    return budget;
  }

  if (options.eventLog) {
    const slug = options.agentSlug?.trim();
    if (!slug) {
      return err(
        studioError(
          "VALIDATION",
          "agentSlug is required when an eventLog is provided",
        ),
      );
    }

    const created = await createAgentRun(options.eventLog, {
      runId: request.runId,
      userId: request.userId,
      agentSlug: slug,
      goal: request.goal,
    });
    if (!created.ok) return created;

    const running = await updateAgentRunStatus(options.eventLog, {
      runId: request.runId,
      status: "running",
    });
    if (!running.ok) return running;

    const started = await appendAgentEvent(options.eventLog, {
      runId: request.runId,
      kind: "run_started",
      payload: {
        agentSlug: slug,
        goal: request.goal,
        maxTurns: request.maxTurns,
      },
    });
    if (!started.ok) return started;
  }

  const session = await createSandbox(sandbox, {
    runId: request.runId,
    userId: request.userId,
  });

  if (!session.ok) {
    if (options.eventLog) {
      await updateAgentRunStatus(options.eventLog, {
        runId: request.runId,
        status: "failed",
        errorMessage: session.error.message,
      });
    }
    return session;
  }

  return ok({
    runId: request.runId,
    status: "running",
    sandboxId: session.value.id,
  });
}
