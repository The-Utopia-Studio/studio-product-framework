export type AgentToolName = string;

export type AgentToolCall = {
  readonly name: AgentToolName;
  readonly arguments: Record<string, unknown>;
};

export type AgentToolResult = {
  readonly name: AgentToolName;
  readonly ok: boolean;
  readonly output: unknown;
};

export type AgentTurn = {
  readonly role: "user" | "assistant" | "system" | "tool";
  readonly content: string;
  readonly toolCalls?: ReadonlyArray<AgentToolCall>;
  readonly toolResults?: ReadonlyArray<AgentToolResult>;
};

export type AgentRunRequest = {
  readonly runId: string;
  readonly userId: string;
  readonly goal: string;
  readonly turns: ReadonlyArray<AgentTurn>;
  /** When true, work must execute inside a sandbox, not inline. */
  readonly requireSandbox: boolean;
  /** Hard cap on total turns this run may reach. No default — must be set. */
  readonly maxTurns: number;
  /** Hard cap on wallet credits this run may spend. No default — must be set. */
  readonly maxSpendCredits: number;
};

/**
 * `awaiting_human` is the only non-terminal pause. Per LOOP-5 a human decision
 * is a structured tool call that suspends the loop and resumes from the log —
 * not a special case in the orchestrator — so the loop does not fork on it.
 * The status exists because operations must: a run waiting on a person needs a
 * notification and its compute released, and may sit for days.
 *
 * There is deliberately no separate "waiting on a non-human tool" status. The
 * previous `awaiting_tool` was never assigned anywhere, and a union member
 * nothing can set is one the Convex validator has to keep accepting forever.
 * Add one when something assigns it.
 */
export type AgentRunStatus =
  | "queued"
  | "running"
  | "awaiting_human"
  | "succeeded"
  | "failed"
  | "cancelled";

export type AgentRunResult = {
  readonly runId: string;
  readonly status: AgentRunStatus;
  readonly summary?: string;
  readonly errorMessage?: string;
};
