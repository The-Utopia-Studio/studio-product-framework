import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
});
