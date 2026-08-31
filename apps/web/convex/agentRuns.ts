import { v } from "convex/values";
import {
  appendAgentEvent as guardedAppendEvent,
  createAgentRun as guardedCreateRun,
  updateAgentRunStatus as guardedUpdateStatus,
  type AgentEventLog,
} from "@studio/ai-runtime";
import { internalMutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import {
  agentEventKindValidator,
  agentRunStatusValidator,
} from "./agentRunsShape";

/**
 * Convex implementation of the `AgentEventLog` port (TUS-2759).
 *
 * The rules — terminal runs are frozen, seq is assigned not accepted, events
 * are only ever inserted — live in `@studio/ai-runtime/src/event-log.ts` and are
 * tested there against an in-memory log. This file is the storage adapter and
 * deliberately holds no policy of its own, so the two cannot disagree.
 *
 * Writes are `internalMutation`: a run's history is written by the runtime, not
 * by a browser. The read path is a `query` gated on the caller's identity.
 */
function convexEventLog(ctx: MutationCtx): AgentEventLog {
  return {
    getRun: async (runId) => {
      const row = await ctx.db
        .query("agentRuns")
        .withIndex("by_run", (q) => q.eq("runId", runId))
        .unique();
      if (row === null) return null;
      return {
        runId: row.runId,
        userId: row.userId,
        agentSlug: row.agentSlug,
        goal: row.goal,
        status: row.status,
        lastSeq: row.lastSeq,
      };
    },

    insertRun: async (record) => {
      const now = Date.now();
      await ctx.db.insert("agentRuns", {
        ...record,
        createdAt: now,
        updatedAt: now,
      });
    },

    // Insert only. There is deliberately no update or delete path for an event.
    insertEvent: async (event) => {
      await ctx.db.insert("agentEvents", event);
    },

    setRunStatus: async ({ runId, status, lastSeq, errorMessage }) => {
      const row = await ctx.db
        .query("agentRuns")
        .withIndex("by_run", (q) => q.eq("runId", runId))
        .unique();
      if (row === null) {
        throw new Error(`agentRuns row vanished for run ${runId}`);
      }
      await ctx.db.patch(row._id, {
        status,
        lastSeq,
        updatedAt: Date.now(),
        ...(errorMessage === undefined ? {} : { errorMessage }),
      });
    },
  };
}

/**
 * Guarded operations return `Result` rather than throwing. Convex mutations are
 * transactional, so a rejected write must abort the transaction — otherwise a
 * partial write survives. Throwing here is the abort.
 */
function unwrap<T>(result: { ok: true; value: T } | { ok: false; error: { code: string; message: string } }): T {
  if (!result.ok) {
    throw new Error(`${result.error.code}: ${result.error.message}`);
  }
  return result.value;
}

export const createAgentRun = internalMutation({
  args: {
    runId: v.string(),
    userId: v.string(),
    agentSlug: v.string(),
    goal: v.string(),
  },
  returns: v.object({
    runId: v.string(),
    status: agentRunStatusValidator,
    lastSeq: v.number(),
  }),
  handler: async (ctx, args) => {
    const record = unwrap(await guardedCreateRun(convexEventLog(ctx), args));
    return {
      runId: record.runId,
      status: record.status,
      lastSeq: record.lastSeq,
    };
  },
});

export const appendAgentEvent = internalMutation({
  args: {
    runId: v.string(),
    kind: agentEventKindValidator,
    payload: v.optional(v.any()),
  },
  returns: v.object({
    runId: v.string(),
    seq: v.number(),
    kind: agentEventKindValidator,
    createdAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const event = unwrap(
      await guardedAppendEvent(convexEventLog(ctx), {
        runId: args.runId,
        kind: args.kind,
        payload: args.payload ?? {},
      }),
    );
    return {
      runId: event.runId,
      seq: event.seq,
      kind: event.kind,
      createdAt: event.createdAt,
    };
  },
});

export const updateAgentRunStatus = internalMutation({
  args: {
    runId: v.string(),
    status: agentRunStatusValidator,
    errorMessage: v.optional(v.string()),
  },
  returns: v.object({
    runId: v.string(),
    status: agentRunStatusValidator,
  }),
  handler: async (ctx, args) => {
    const record = unwrap(await guardedUpdateStatus(convexEventLog(ctx), args));
    return { runId: record.runId, status: record.status };
  },
});

/** A run's event log in `seq` order, for the owner of the run only. */
export const listRunEvents = query({
  args: { runId: v.string() },
  returns: v.array(
    v.object({
      seq: v.number(),
      kind: agentEventKindValidator,
      payload: v.any(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const run = await ctx.db
      .query("agentRuns")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .unique();
    if (run === null || run.userId !== identity.subject) {
      return [];
    }

    const events = await ctx.db
      .query("agentEvents")
      .withIndex("by_run_seq", (q) => q.eq("runId", args.runId))
      .order("asc")
      .take(500);

    return events.map((event) => ({
      seq: event.seq,
      kind: event.kind,
      payload: event.payload,
      createdAt: event.createdAt,
    }));
  },
});
