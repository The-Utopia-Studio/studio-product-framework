import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import type { AgentRunRequest, AgentRunResult } from "./types";
import {
  createSandbox,
  type SandboxProvider,
} from "./sandbox";
import { assertWithinBudget } from "./budget";

/**
 * Runtime agent entry: validate + budget gate + sandbox gate.
 * Orchestration (credits, inference Effect programs) stays in Convex actions.
 */
export async function startAgentRun(
  sandbox: SandboxProvider,
  request: AgentRunRequest,
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

  const session = await createSandbox(sandbox, {
    runId: request.runId,
    userId: request.userId,
  });

  if (!session.ok) {
    return session;
  }

  return ok({
    runId: request.runId,
    status: "running",
    sandboxId: session.value.id,
  });
}
