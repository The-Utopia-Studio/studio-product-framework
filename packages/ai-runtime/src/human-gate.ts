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

export async function resolveHumanGate(
  log: AgentEventLog,
  input: {
    readonly runId: string;
    readonly decision: Record<string, unknown>;
  },
): Promise<Result<{ runId: string; status: "running" }, StudioError>> {
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

  const resolved = await appendAgentEvent(log, {
    runId: input.runId,
    kind: "human_gate_resolved",
    payload: input.decision,
  });
  if (!resolved.ok) return resolved;

  const status = await updateAgentRunStatus(log, {
    runId: input.runId,
    status: "running",
  });
  if (!status.ok) return status;

  return ok({ runId: input.runId, status: "running" });
}
