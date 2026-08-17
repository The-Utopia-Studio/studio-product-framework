"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import {
  captureServerException,
  sentryServerConfigFromEnv,
} from "@studio/observability/server-node";

/**
 * Sentry needs the full Node runtime, so it lives in its own "use node"
 * action rather than inside the money-critical Convex actions themselves —
 * those keep running in the default runtime, unchanged.
 * Callers should fire this via `ctx.scheduler.runAfter(0, ...)` and never
 * await it inline, so a Sentry outage can't add latency to the money path.
 */
export const reportException = internalAction({
  args: {
    message: v.string(),
    tags: v.optional(v.record(v.string(), v.string())),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await captureServerException(
      sentryServerConfigFromEnv(),
      new Error(args.message),
      args.tags,
    );
    return null;
  },
});
