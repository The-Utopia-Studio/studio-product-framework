import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const recordRun = internalMutation({
  args: {
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
  },
  returns: v.id("inferenceRuns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("inferenceRuns", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listRecent = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("inferenceRuns"),
      model: v.string(),
      inputTokens: v.number(),
      outputTokens: v.number(),
      creditCost: v.number(),
      status: v.union(
        v.literal("succeeded"),
        v.literal("failed"),
        v.literal("streaming"),
      ),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const runs = await ctx.db
      .query("inferenceRuns")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(20);

    return runs.map((run) => ({
      _id: run._id,
      model: run.model,
      inputTokens: run.inputTokens,
      outputTokens: run.outputTokens,
      creditCost: run.creditCost,
      status: run.status,
      createdAt: run.createdAt,
    }));
  },
});
