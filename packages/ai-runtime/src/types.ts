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
};

export type AgentRunStatus =
  | "queued"
  | "running"
  | "awaiting_tool"
  | "succeeded"
  | "failed"
  | "cancelled";

export type AgentRunResult = {
  readonly runId: string;
  readonly status: AgentRunStatus;
  readonly summary?: string;
  readonly errorMessage?: string;
};
