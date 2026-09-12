import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  agentEventKindValidator,
  agentRunStatusValidator,
} from "./agentRunsShape";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  subscriptions: defineTable({
    userId: v.optional(v.string()),
    polarId: v.optional(v.string()),
    polarPriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),

  webhookEvents: defineTable({
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("polarEventId", ["polarEventId"]),

  /** Authoritative credit ledger (Effect fence). Reconcile with Autumn when enabled. */
  wallets: defineTable({
    userId: v.string(),
    balance: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  walletTransactions: defineTable({
    userId: v.string(),
    amount: v.number(),
    type: v.union(v.literal("debit"), v.literal("credit")),
    reason: v.string(),
    idempotencyKey: v.string(),
    balanceAfter: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_idempotency", ["idempotencyKey"]),

  inferenceRuns: defineTable({
    userId: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    creditCost: v.number(),
    transactionId: v.optional(v.string()),
    providerRequestId: v.optional(v.string()),
    status: v.union(
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("streaming"),
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  /**
   * Run index for long-horizon agent runs — canonical for audit (STATE-1).
   * One row per run, updated in place as the run progresses. The narrative of
   * what happened lives in `agentEvents`, not here.
   */
  agentRuns: defineTable({
    runId: v.string(),
    userId: v.string(),
    agentSlug: v.string(),
    goal: v.string(),
    status: agentRunStatusValidator,
    /** Highest seq written to agentEvents for this run. 0 before the first event. */
    lastSeq: v.number(),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_run", ["runId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  /**
   * Append-only event log — canonical for evals and the trace archive
   * (STACK-3). Rows are only ever inserted: nothing may patch, replace, or
   * delete one, and `agentRuns.test.ts` asserts that against the source.
   *
   * Ordered by `seq`, not `createdAt` — two events written in the same
   * millisecond are indistinguishable by timestamp. `by_run_seq` is unique by
   * construction because seq is assigned from `agentRuns.lastSeq` in the
   * mutation, never accepted from the caller.
   */
  agentEvents: defineTable({
    runId: v.string(),
    seq: v.number(),
    kind: agentEventKindValidator,
    payload: v.any(),
    createdAt: v.number(),
  })
    .index("by_run_seq", ["runId", "seq"])
    .index("by_run_kind", ["runId", "kind"]),
});
