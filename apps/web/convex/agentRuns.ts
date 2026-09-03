import { v } from "convex/values";
import {
  appendAgentEvent as guardedAppendEvent,
  createAgentRun as guardedCreateRun,
  updateAgentRunStatus as guardedUpdateStatus,
  type AgentEventLog,
} from "@studio/ai-runtime";
import { internalMutation, internalQuery, query } from "./_generated/server";
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

const MAX_EVENT_PAGE = 500;

/**
 * One page of a run's event log in `seq` order, for the owner of the run only.
 *
 * Paginated rather than capped. A long-horizon run is expected to exceed any
 * single page, and returning the first N with no signal would hand audit and
 * eval consumers a partial history that looks complete — the precise failure
 * this table exists to prevent. Callers walk pages with `afterSeq` until
 * `hasMore` is false.
 */
export const listRunEvents = query({
  args: {
    runId: v.string(),
    /** Exclusive lower bound: pass the previous page's `lastSeq`. */
    afterSeq: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    events: v.array(
      v.object({
        seq: v.number(),
        kind: agentEventKindValidator,
        payload: v.any(),
        createdAt: v.number(),
      }),
    ),
    hasMore: v.boolean(),
    /** `seq` of the last event returned, or the given `afterSeq` when empty. */
    lastSeq: v.number(),
  }),
  handler: async (ctx, args) => {
    const afterSeq = args.afterSeq ?? 0;
    const empty = { events: [], hasMore: false, lastSeq: afterSeq };

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return empty;
    }

    const run = await ctx.db
      .query("agentRuns")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .unique();
    if (run === null || run.userId !== identity.subject) {
      return empty;
    }

    const limit = Math.min(
      Math.max(args.limit ?? MAX_EVENT_PAGE, 1),
      MAX_EVENT_PAGE,
    );

    // Over-fetch by one: if the extra row exists there is another page. Keeps
    // `hasMore` honest without a second count query.
    const rows = await ctx.db
      .query("agentEvents")
      .withIndex("by_run_seq", (q) =>
        q.eq("runId", args.runId).gt("seq", afterSeq),
      )
      .order("asc")
      .take(limit + 1);

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];

    return {
      events: page.map((event) => ({
        seq: event.seq,
        kind: event.kind,
        payload: event.payload,
        createdAt: event.createdAt,
      })),
      hasMore,
      lastSeq: last === undefined ? afterSeq : last.seq,
    };
  },
});

/**
 * Internal read path for resume workers (Convex actions / cron).
 * Paginate with `afterSeq` until `hasMore` is false, then pass events into
 * `resumeDurableLoop`. Auth is the caller's responsibility — only schedule
 * this from trusted backend code (STACK scheduler rule).
 */
export const getRunInternal = internalQuery({
  args: { runId: v.string() },
  returns: v.union(
    v.object({
      runId: v.string(),
      userId: v.string(),
      agentSlug: v.string(),
      goal: v.string(),
      status: agentRunStatusValidator,
      lastSeq: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("agentRuns")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
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
});

export const listRunEventsInternal = internalQuery({
  args: {
    runId: v.string(),
    afterSeq: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    events: v.array(
      v.object({
        runId: v.string(),
        seq: v.number(),
        kind: agentEventKindValidator,
        payload: v.any(),
        createdAt: v.number(),
      }),
    ),
    hasMore: v.boolean(),
    lastSeq: v.number(),
  }),
  handler: async (ctx, args) => {
    const afterSeq = args.afterSeq ?? 0;
    const limit = Math.min(
      Math.max(args.limit ?? MAX_EVENT_PAGE, 1),
      MAX_EVENT_PAGE,
    );

    const rows = await ctx.db
      .query("agentEvents")
      .withIndex("by_run_seq", (q) =>
        q.eq("runId", args.runId).gt("seq", afterSeq),
      )
      .order("asc")
      .take(limit + 1);

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];

    return {
      events: page.map((event) => ({
        runId: event.runId,
        seq: event.seq,
        kind: event.kind,
        payload: event.payload,
        createdAt: event.createdAt,
      })),
      hasMore,
      lastSeq: last === undefined ? afterSeq : last.seq,
    };
  },
});
