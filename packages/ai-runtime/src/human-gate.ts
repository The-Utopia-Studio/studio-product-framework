import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import {
  appendAgentEvent,
  isTerminalRunStatus,
  updateAgentRunStatus,
  type AgentEventLog,
} from "./event-log";

/**
 * Human-gate helpers for TUS-2760 / LOOP-5.
 *
 * Opening a gate is normally done by `startDurableLoop` when a step returns
 * `suspend`. These helpers exist for adapters that need to open or resolve a
 * gate outside the loop (webhook, dashboard approve button).
 */

export async function openHumanGate(
  log: AgentEventLog,
  input: {
    readonly runId: string;
    readonly reason: string;
    readonly payload?: Record<string, unknown>;
  },
): Promise<Result<{ runId: string; status: "awaiting_human" }, StudioError>> {
  const run = await log.getRun(input.runId);
  if (!run) {
    return err(studioError("NOT_FOUND", `no run ${input.runId}`));
  }
  if (isTerminalRunStatus(run.status)) {
    return err(
      studioError(
        "VALIDATION",
        `run ${input.runId} is ${run.status}; cannot open a human gate`,
      ),
    );
  }

  const opened = await appendAgentEvent(log, {
    runId: input.runId,
    kind: "human_gate_opened",
    payload: { reason: input.reason, ...(input.payload ?? {}) },
  });
  if (!opened.ok) return opened;

  const status = await updateAgentRunStatus(log, {
    runId: input.runId,
    status: "awaiting_human",
  });
  if (!status.ok) return status;

  return ok({ runId: input.runId, status: "awaiting_human" });
}

/**
 * Record a human decision on an open gate. Does **not** claim the run for
 * execution — leave that to `resumeDurableLoop`, which transitions
 * `awaiting_human` → `running` so duplicate webhooks cannot double-execute.
 */
export async function resolveHumanGate(
  log: AgentEventLog,
  input: {
    readonly runId: string;
    /**
     * Must include `decision: "approved" | "rejected"`. Other fields are
     * stored on the resolve event for the next step's `resumeData`.
     */
    readonly decision: Record<string, unknown>;
    /**
     * Checkpointed loop state to carry on the resolve event. Pass the last
     * `loopState` from `human_gate_opened` / `stage_entered` when available.
     * `resumeDurableLoop` can still recover state from earlier checkpoint
     * events if this is omitted.
     */
    readonly loopState?: Record<string, unknown>;
  },
): Promise<Result<{ runId: string; status: "awaiting_human" }, StudioError>> {
  const run = await log.getRun(input.runId);
  if (!run) {
    return err(studioError("NOT_FOUND", `no run ${input.runId}`));
  }
  if (run.status !== "awaiting_human") {
    return err(
      studioError(
        "VALIDATION",
        `run ${input.runId} is ${run.status}; expected awaiting_human`,
      ),
    );
  }

  const decision = input.decision.decision;
  if (decision !== "approved" && decision !== "rejected") {
    return err(
      studioError(
        "VALIDATION",
        `resolveHumanGate requires decision: "approved" | "rejected"`,
      ),
    );
  }

  const resolved = await appendAgentEvent(log, {
    runId: input.runId,
    kind: "human_gate_resolved",
    payload: {
      ...input.decision,
      ...(input.loopState !== undefined ? { loopState: input.loopState } : {}),
    },
  });
  if (!resolved.ok) return resolved;

  return ok({ runId: input.runId, status: "awaiting_human" });
}
