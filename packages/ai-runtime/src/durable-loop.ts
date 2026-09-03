import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import { assertWithinBudget, type AgentBudget } from "./budget";
import {
  appendAgentEvent,
  createAgentRun,
  updateAgentRunStatus,
  type AgentEvent,
  type AgentEventLog,
} from "./event-log";

/**
 * Tier B durable agent loop (LOOP-1, LOOP-2, LOOP-3, HORIZON-*).
 *
 * Owns the while loop. The model (via `step`) picks actions; this code owns
 * stop conditions, retries, budget ceilings, human gates, and checkpointing.
 * Each iteration writes an append-only event through the TUS-2759 port.
 *
 * On `suspend`, the process may exit. The caller reloads events (Convex
 * `listRunEvents` or an in-memory snapshot) and calls `resumeDurableLoop`.
 * Do not use Mastra `createInngestAgent()` for this — resume completion is
 * broken upstream (see long-horizon/INNGEST.md, 6/7).
 */

export type DurableStepStatus = "continue" | "complete" | "suspend" | "fail";

export type DurableStepResult<TState> = {
  readonly status: DurableStepStatus;
  readonly state: TState;
  readonly summary?: string;
  readonly suspendReason?: string;
  readonly suspendPayload?: Record<string, unknown>;
  readonly errorMessage?: string;
};

export type DurableStep<TState> = (input: {
  readonly state: TState;
  readonly iteration: number;
  readonly runId: string;
  readonly resumeData?: Record<string, unknown>;
}) => Promise<DurableStepResult<TState>>;

export type DurableLoopConfig<TState> = {
  readonly runId: string;
  readonly userId: string;
  readonly agentSlug: string;
  readonly goal: string;
  readonly initialState: TState;
  readonly step: DurableStep<TState>;
  readonly eventLog: AgentEventLog;
  readonly budget: AgentBudget;
  readonly maxStallIterations?: number;
  readonly isSuccess?: (state: TState) => boolean;
};

export type DurableLoopResult<TState> = {
  readonly runId: string;
  readonly status: "running" | "awaiting_human" | "succeeded" | "failed" | "cancelled";
  readonly state: TState;
  readonly iterations: number;
  readonly summary?: string;
  readonly suspendReason?: string;
  readonly errorMessage?: string;
};

export type DurableLoopResumeInput<TState> = {
  readonly runId: string;
  readonly eventLog: AgentEventLog;
  /** Full event history for this run, in seq order (caller loads via query). */
  readonly events: ReadonlyArray<AgentEvent>;
  readonly step: DurableStep<TState>;
  readonly budget: AgentBudget;
  readonly resumeData?: Record<string, unknown>;
  readonly maxStallIterations?: number;
  readonly isSuccess?: (state: TState) => boolean;
};

const STATE_PAYLOAD_KEY = "loopState";

export async function startDurableLoop<TState>(
  config: DurableLoopConfig<TState>,
): Promise<Result<DurableLoopResult<TState>, StudioError>> {
  const created = await createAgentRun(config.eventLog, {
    runId: config.runId,
    userId: config.userId,
    agentSlug: config.agentSlug,
    goal: config.goal,
  });
  if (!created.ok) return created;

  const running = await updateAgentRunStatus(config.eventLog, {
    runId: config.runId,
    status: "running",
  });
  if (!running.ok) return running;

  const started = await appendAgentEvent(config.eventLog, {
    runId: config.runId,
    kind: "run_started",
    payload: { agentSlug: config.agentSlug, goal: config.goal },
  });
  if (!started.ok) return started;

  return executeLoop({
    runId: config.runId,
    state: config.initialState,
    step: config.step,
    eventLog: config.eventLog,
    budget: config.budget,
    iteration: 0,
    stallCount: 0,
    lastStateHash: hashState(config.initialState),
    maxStallIterations: config.maxStallIterations ?? 3,
    isSuccess: config.isSuccess,
  });
}

export async function resumeDurableLoop<TState>(
  input: DurableLoopResumeInput<TState>,
): Promise<Result<DurableLoopResult<TState>, StudioError>> {
  const run = await input.eventLog.getRun(input.runId);
  if (!run) {
    return err(studioError("NOT_FOUND", `Run ${input.runId} not found`));
  }
  if (
    run.status === "succeeded" ||
    run.status === "failed" ||
    run.status === "cancelled"
  ) {
    return ok({
      runId: input.runId,
      status: run.status,
      state: {} as TState,
      iterations: 0,
      summary: `Run already terminal: ${run.status}`,
    });
  }

  const ordered = [...input.events].sort((a, b) => a.seq - b.seq);
  const lastWithState = [...ordered]
    .reverse()
    .find(
      (event) =>
        event.kind === "stage_entered" ||
        event.kind === "human_gate_opened" ||
        event.kind === "human_gate_resolved" ||
        event.kind === "tool_result",
    );
  const state =
    (lastWithState?.payload[STATE_PAYLOAD_KEY] as TState | undefined) ??
    ({} as TState);
  const iteration = ordered.filter((event) => event.kind === "stage_entered").length;

  if (run.status === "awaiting_human") {
    const resolved = await appendAgentEvent(input.eventLog, {
      runId: input.runId,
      kind: "human_gate_resolved",
      payload: {
        ...(input.resumeData ?? {}),
        [STATE_PAYLOAD_KEY]: state,
      },
    });
    if (!resolved.ok) return resolved;
  }

  const running = await updateAgentRunStatus(input.eventLog, {
    runId: input.runId,
    status: "running",
  });
  if (!running.ok) return running;

  return executeLoop({
    runId: input.runId,
    state,
    step: input.step,
    eventLog: input.eventLog,
    budget: input.budget,
    iteration,
    stallCount: 0,
    lastStateHash: hashState(state),
    maxStallIterations: input.maxStallIterations ?? 3,
    isSuccess: input.isSuccess,
    resumeData: input.resumeData,
  });
}

type LoopContext<TState> = {
  readonly runId: string;
  state: TState;
  readonly step: DurableStep<TState>;
  readonly eventLog: AgentEventLog;
  readonly budget: AgentBudget;
  iteration: number;
  stallCount: number;
  lastStateHash: string;
  readonly maxStallIterations: number;
  readonly isSuccess?: (state: TState) => boolean;
  resumeData?: Record<string, unknown>;
};

async function executeLoop<TState>(
  ctx: LoopContext<TState>,
): Promise<Result<DurableLoopResult<TState>, StudioError>> {
  while (true) {
    const budgetCheck = assertWithinBudget(ctx.budget, {
      turnsUsed: ctx.iteration,
      creditsSpent: 0,
    });
    if (!budgetCheck.ok) {
      await appendAgentEvent(ctx.eventLog, {
        runId: ctx.runId,
        kind: "error",
        payload: { reason: "budget_exceeded", message: budgetCheck.error.message },
      });
      await updateAgentRunStatus(ctx.eventLog, {
        runId: ctx.runId,
        status: "failed",
        errorMessage: budgetCheck.error.message,
      });
      return ok({
        runId: ctx.runId,
        status: "failed",
        state: ctx.state,
        iterations: ctx.iteration,
        summary: budgetCheck.error.message,
        errorMessage: budgetCheck.error.message,
      });
    }

    if (ctx.isSuccess?.(ctx.state)) {
      return finishSuccess(ctx, "success predicate met");
    }

    let stepResult: DurableStepResult<TState>;
    try {
      stepResult = await ctx.step({
        state: ctx.state,
        iteration: ctx.iteration,
        runId: ctx.runId,
        resumeData: ctx.resumeData,
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Step threw";
      await appendAgentEvent(ctx.eventLog, {
        runId: ctx.runId,
        kind: "error",
        payload: { iteration: ctx.iteration, message },
      });
      await updateAgentRunStatus(ctx.eventLog, {
        runId: ctx.runId,
        status: "failed",
        errorMessage: message,
      });
      return ok({
        runId: ctx.runId,
        status: "failed",
        state: ctx.state,
        iterations: ctx.iteration,
        summary: message,
        errorMessage: message,
      });
    }

    ctx.state = stepResult.state;
    ctx.iteration += 1;
    // Clear resume data after the first post-resume step (HORIZON-2).
    ctx.resumeData = undefined;

    if (stepResult.status === "suspend") {
      const gate = await appendAgentEvent(ctx.eventLog, {
        runId: ctx.runId,
        kind: "human_gate_opened",
        payload: {
          reason: stepResult.suspendReason ?? "human approval required",
          ...(stepResult.suspendPayload ?? {}),
          [STATE_PAYLOAD_KEY]: ctx.state,
        },
      });
      if (!gate.ok) return gate;

      const awaiting = await updateAgentRunStatus(ctx.eventLog, {
        runId: ctx.runId,
        status: "awaiting_human",
      });
      if (!awaiting.ok) return awaiting;

      return ok({
        runId: ctx.runId,
        status: "awaiting_human",
        state: ctx.state,
        iterations: ctx.iteration,
        suspendReason: stepResult.suspendReason,
      });
    }

    if (stepResult.status === "fail") {
      const message = stepResult.errorMessage ?? "Step failed";
      await appendAgentEvent(ctx.eventLog, {
        runId: ctx.runId,
        kind: "error",
        payload: { iteration: ctx.iteration, message },
      });
      await updateAgentRunStatus(ctx.eventLog, {
        runId: ctx.runId,
        status: "failed",
        errorMessage: message,
      });
      return ok({
        runId: ctx.runId,
        status: "failed",
        state: ctx.state,
        iterations: ctx.iteration,
        summary: message,
        errorMessage: message,
      });
    }

    const staged = await appendAgentEvent(ctx.eventLog, {
      runId: ctx.runId,
      kind: "stage_entered",
      payload: {
        iteration: ctx.iteration,
        summary: stepResult.summary,
        [STATE_PAYLOAD_KEY]: ctx.state,
      },
    });
    if (!staged.ok) return staged;

    if (stepResult.status === "complete") {
      return finishSuccess(ctx, stepResult.summary ?? "complete");
    }

    const stateHash = hashState(ctx.state);
    if (stateHash === ctx.lastStateHash) {
      ctx.stallCount += 1;
      if (ctx.stallCount >= ctx.maxStallIterations) {
        const message = `Stalled: no state change across ${ctx.stallCount} iterations`;
        await appendAgentEvent(ctx.eventLog, {
          runId: ctx.runId,
          kind: "error",
          payload: { reason: "stall", stallCount: ctx.stallCount },
        });
        await updateAgentRunStatus(ctx.eventLog, {
          runId: ctx.runId,
          status: "failed",
          errorMessage: message,
        });
        return ok({
          runId: ctx.runId,
          status: "failed",
          state: ctx.state,
          iterations: ctx.iteration,
          summary: message,
          errorMessage: message,
        });
      }
    } else {
      ctx.stallCount = 0;
      ctx.lastStateHash = stateHash;
    }
  }
}

async function finishSuccess<TState>(
  ctx: LoopContext<TState>,
  summary: string,
): Promise<Result<DurableLoopResult<TState>, StudioError>> {
  const finished = await appendAgentEvent(ctx.eventLog, {
    runId: ctx.runId,
    kind: "run_finished",
    payload: { iteration: ctx.iteration, summary },
  });
  if (!finished.ok) return finished;

  const status = await updateAgentRunStatus(ctx.eventLog, {
    runId: ctx.runId,
    status: "succeeded",
  });
  if (!status.ok) return status;

  return ok({
    runId: ctx.runId,
    status: "succeeded",
    state: ctx.state,
    iterations: ctx.iteration,
    summary,
  });
}

function hashState(state: unknown): string {
  return JSON.stringify(state);
}
