import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import type { AgentRunStatus } from "./types";

/**
 * The canonical record of what a long-horizon agent run did.
 *
 * Two surfaces, per STATE-1 and STACK-3 (`atelier-learnings`): Convex is the
 * only canonical source of truth for run-state, and it holds an append-only
 * event log. That splits into:
 *
 * - the **run index** (`AgentRunRecord`) — one mutable row per run, canonical
 *   for audit: who owns it, what it is doing now, when it finished;
 * - the **event log** (`AgentEvent`) — append-only, canonical for evals and the
 *   trace archive. Never edited, never deleted, ordered by `seq`.
 *
 * Ordering is by `seq`, not by timestamp. Two events written inside the same
 * millisecond are indistinguishable by `createdAt`, and a trace archive that
 * cannot put its own events in order is not a trace archive.
 *
 * The storage port is deliberately narrow so the invariants below can be tested
 * without a Convex deployment, and so the Convex mutations and any future
 * implementation are held to the same rules.
 */

/** Every status a run may hold. Mirrors `AgentRunStatus` in ./types. */
export const AGENT_RUN_STATUSES = [
  "queued",
  "running",
  "awaiting_tool",
  "succeeded",
  "failed",
  "cancelled",
] as const satisfies ReadonlyArray<AgentRunStatus>;

/**
 * Statuses after which a run is over. A terminal run is frozen: its status may
 * not change again, and no further events may be appended to it. Without this
 * an "audit" table would let a failed run be quietly reopened and rewritten.
 */
export const TERMINAL_RUN_STATUSES = [
  "succeeded",
  "failed",
  "cancelled",
] as const satisfies ReadonlyArray<AgentRunStatus>;

export function isTerminalRunStatus(status: AgentRunStatus): boolean {
  return (TERMINAL_RUN_STATUSES as ReadonlyArray<string>).includes(status);
}

/**
 * What a run can do that is worth grading or auditing later.
 *
 * `action_blocked` is first-class rather than a flavour of `error`: a guard
 * refusing an action is the guard working, and an eval needs to tell that apart
 * from a run that broke.
 */
export const AGENT_EVENT_KINDS = [
  "run_started",
  "stage_entered",
  "tool_called",
  "tool_result",
  "action_blocked",
  "error",
  "retry_scheduled",
  "human_gate_opened",
  "human_gate_resolved",
  "run_finished",
] as const;

export type AgentEventKind = (typeof AGENT_EVENT_KINDS)[number];

export type AgentRunRecord = {
  readonly runId: string;
  readonly userId: string;
  readonly agentSlug: string;
  readonly goal: string;
  readonly status: AgentRunStatus;
  /** Highest `seq` written for this run. 0 before the first event. */
  readonly lastSeq: number;
};

export type AgentEvent = {
  readonly runId: string;
  /** Monotonic per run, starting at 1. Gaps and repeats are both rejected. */
  readonly seq: number;
  readonly kind: AgentEventKind;
  readonly payload: Record<string, unknown>;
  readonly createdAt: number;
};

export type CreateRunInput = {
  readonly runId: string;
  readonly userId: string;
  readonly agentSlug: string;
  readonly goal: string;
};

export type AppendEventInput = {
  readonly runId: string;
  readonly kind: AgentEventKind;
  readonly payload?: Record<string, unknown>;
};

export type UpdateRunStatusInput = {
  readonly runId: string;
  readonly status: AgentRunStatus;
  readonly errorMessage?: string;
};

/**
 * Storage port. Implementations do exactly what they are told and nothing more:
 * every rule worth enforcing lives in the guarded operations below, so it cannot
 * be enforced in one implementation and forgotten in the next.
 *
 * Note the absence of an update or delete for events. That is the append-only
 * guarantee expressed in the type system rather than in a comment.
 */
export type AgentEventLog = {
  readonly getRun: (runId: string) => Promise<AgentRunRecord | null>;
  readonly insertRun: (record: AgentRunRecord) => Promise<void>;
  readonly insertEvent: (event: AgentEvent) => Promise<void>;
  readonly setRunStatus: (input: {
    runId: string;
    status: AgentRunStatus;
    lastSeq: number;
    errorMessage?: string;
  }) => Promise<void>;
};

const MAX_PAYLOAD_BYTES = 64 * 1024;

function isBlank(s: string): boolean {
  return s.trim() === "";
}

/**
 * Open a run. Refuses a duplicate `runId` rather than overwriting: the run index
 * is canonical for audit, and a silent overwrite loses the earlier run.
 */
export async function createAgentRun(
  log: AgentEventLog,
  input: CreateRunInput,
): Promise<Result<AgentRunRecord, StudioError>> {
  for (const [field, value] of [
    ["runId", input.runId],
    ["userId", input.userId],
    ["agentSlug", input.agentSlug],
    ["goal", input.goal],
  ] as const) {
    if (isBlank(value)) {
      return err(studioError("VALIDATION", `${field} is required`));
    }
  }

  const existing = await runOrError(() => log.getRun(input.runId));
  if (!existing.ok) return existing;
  if (existing.value !== null) {
    return err(
      studioError("VALIDATION", `run ${input.runId} already exists`, {
        retryable: false,
      }),
    );
  }

  const record: AgentRunRecord = {
    runId: input.runId,
    userId: input.userId,
    agentSlug: input.agentSlug,
    goal: input.goal,
    status: "queued",
    lastSeq: 0,
  };

  const written = await runOrError(() => log.insertRun(record));
  if (!written.ok) return written;
  return ok(record);
}

/**
 * Append one event. The `seq` is assigned here from the run's `lastSeq` rather
 * than accepted from the caller, so two concurrent writers cannot agree on the
 * same number, and a caller cannot backdate an event over an existing one.
 */
export async function appendAgentEvent(
  log: AgentEventLog,
  input: AppendEventInput,
  now: number = Date.now(),
): Promise<Result<AgentEvent, StudioError>> {
  if (!(AGENT_EVENT_KINDS as ReadonlyArray<string>).includes(input.kind)) {
    return err(studioError("VALIDATION", `unknown event kind: ${input.kind}`));
  }

  const payload = input.payload ?? {};
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    return err(
      studioError(
        "VALIDATION",
        `event payload is ${payloadBytes} bytes (max ${MAX_PAYLOAD_BYTES})`,
      ),
    );
  }

  const found = await runOrError(() => log.getRun(input.runId));
  if (!found.ok) return found;
  const run = found.value;
  if (run === null) {
    return err(studioError("NOT_FOUND", `no run ${input.runId}`));
  }

  // A finished run is frozen. Late events mean a bug upstream, and swallowing
  // them would let the trace archive disagree with the run index.
  if (isTerminalRunStatus(run.status)) {
    return err(
      studioError(
        "VALIDATION",
        `run ${input.runId} is ${run.status}; the event log is closed`,
        { retryable: false },
      ),
    );
  }

  const event: AgentEvent = {
    runId: input.runId,
    seq: run.lastSeq + 1,
    kind: input.kind,
    payload,
    createdAt: now,
  };

  const written = await runOrError(() => log.insertEvent(event));
  if (!written.ok) return written;

  const advanced = await runOrError(() =>
    log.setRunStatus({
      runId: run.runId,
      status: run.status,
      lastSeq: event.seq,
    }),
  );
  if (!advanced.ok) return advanced;

  return ok(event);
}

/**
 * Move a run's status. Terminal is terminal: a succeeded run cannot be reopened,
 * and a failed run cannot be quietly marked succeeded later.
 */
export async function updateAgentRunStatus(
  log: AgentEventLog,
  input: UpdateRunStatusInput,
): Promise<Result<AgentRunRecord, StudioError>> {
  if (!(AGENT_RUN_STATUSES as ReadonlyArray<string>).includes(input.status)) {
    return err(studioError("VALIDATION", `unknown status: ${input.status}`));
  }

  const found = await runOrError(() => log.getRun(input.runId));
  if (!found.ok) return found;
  const run = found.value;
  if (run === null) {
    return err(studioError("NOT_FOUND", `no run ${input.runId}`));
  }

  if (isTerminalRunStatus(run.status)) {
    return err(
      studioError(
        "VALIDATION",
        `run ${input.runId} is already ${run.status} and cannot change to ${input.status}`,
        { retryable: false },
      ),
    );
  }

  // "failed" without a reason is the shape of a bug that gets closed as a
  // mystery three weeks later.
  if (input.status === "failed" && (input.errorMessage ?? "").trim() === "") {
    return err(
      studioError("VALIDATION", "failed runs require an errorMessage"),
    );
  }

  const written = await runOrError(() =>
    log.setRunStatus({
      runId: run.runId,
      status: input.status,
      lastSeq: run.lastSeq,
      errorMessage: input.errorMessage,
    }),
  );
  if (!written.ok) return written;

  return ok({ ...run, status: input.status });
}

/** Storage faults become retryable INTERNAL errors instead of escaping as throws. */
async function runOrError<T>(
  fn: () => Promise<T>,
): Promise<Result<T, StudioError>> {
  try {
    return ok(await fn());
  } catch (cause) {
    return err(
      studioError("INTERNAL", "agent event log storage failed", {
        cause,
        retryable: true,
      }),
    );
  }
}
