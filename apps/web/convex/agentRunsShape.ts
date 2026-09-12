import { v, type Infer } from "convex/values";
import type { AgentEventKind, AgentRunStatus } from "@studio/ai-runtime";

/**
 * Validators for `agentRuns` / `agentEvents` (TUS-2759).
 *
 * The literals are spelled out because Convex needs them literal to generate
 * precise document types — a validator built by mapping over an array widens to
 * `string`, and the whole table loses its type safety downstream.
 *
 * Drift between these unions and the TypeScript types in
 * `@studio/ai-runtime/src/event-log.ts` is caught at compile time by the
 * bidirectional assertions at the bottom of this file, so a status added to one
 * and forgotten in the other fails the build rather than failing a write in
 * production.
 */

export const agentRunStatusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("awaiting_human"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("cancelled"),
);

export const agentEventKindValidator = v.union(
  v.literal("run_started"),
  v.literal("stage_entered"),
  v.literal("tool_called"),
  v.literal("tool_result"),
  v.literal("action_blocked"),
  v.literal("error"),
  v.literal("retry_scheduled"),
  v.literal("human_gate_opened"),
  v.literal("human_gate_resolved"),
  v.literal("run_finished"),
);

/**
 * Compile-time set equality. Assigning each type to the other proves neither has
 * a member the other lacks; a one-way check would let the validator quietly
 * accept a value the runtime type has never heard of.
 */
type ValidatorRunStatus = Infer<typeof agentRunStatusValidator>;
type ValidatorEventKind = Infer<typeof agentEventKindValidator>;

const _runStatusCoversType: ValidatorRunStatus = "queued" as AgentRunStatus;
const _typeCoversRunStatus: AgentRunStatus = "queued" as ValidatorRunStatus;
const _eventKindCoversType: ValidatorEventKind = "error" as AgentEventKind;
const _typeCoversEventKind: AgentEventKind = "error" as ValidatorEventKind;

void _runStatusCoversType;
void _typeCoversRunStatus;
void _eventKindCoversType;
void _typeCoversEventKind;
