import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { rateLimiter } from "./rateLimits";

/** Rate limits must run in mutations (component writes). Call from actions/HTTP. */
export const assertChatLimit = internalMutation({
  args: { userId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "chat", {
      key: args.userId,
      throws: true,
    });
    return null;
  },
});

export const assertMeteredInferenceLimit = internalMutation({
  args: { userId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "meteredInference", {
      key: args.userId,
      throws: true,
    });
    return null;
  },
});
