import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { isOk } from "@studio/core";
import {
  createBrowserSession,
  scrapeUrl,
  searchWeb,
} from "@studio/web-tools";

/**
 * Usable web-tool actions for runtime agents + authenticated product features.
 * Requires the matching API key in Convex env; returns a clear CONFIG error otherwise.
 */

export const scrape = action({
  args: { url: v.string() },
  returns: v.object({
    url: v.string(),
    markdown: v.string(),
    title: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.runMutation(internal.rateLimitGuard.assertWebToolsLimit, {
      userId: identity.subject,
    });

    const result = await scrapeUrl(
      { apiKey: process.env.FIRECRAWL_API_KEY ?? "" },
      { url: args.url },
    );
    if (!isOk(result)) {
      throw new Error(result.error.message);
    }
    return result.value;
  },
});

export const search = action({
  args: {
    query: v.string(),
    maxResults: v.optional(v.number()),
  },
  returns: v.object({
    hits: v.array(
      v.object({
        url: v.string(),
        title: v.string(),
        snippet: v.optional(v.string()),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.runMutation(internal.rateLimitGuard.assertWebToolsLimit, {
      userId: identity.subject,
    });

    const result = await searchWeb(
      { apiKey: process.env.PARALLEL_API_KEY ?? "" },
      { query: args.query, maxResults: args.maxResults },
    );
    if (!isOk(result)) {
      throw new Error(result.error.message);
    }
    return result.value;
  },
});

export const createSession = action({
  args: {},
  returns: v.object({
    id: v.string(),
    connectUrl: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.runMutation(internal.rateLimitGuard.assertWebToolsLimit, {
      userId: identity.subject,
    });

    const result = await createBrowserSession({
      apiKey: process.env.BROWSERBASE_API_KEY ?? "",
      projectId: process.env.BROWSERBASE_PROJECT_ID,
    });
    if (!isOk(result)) {
      throw new Error(result.error.message);
    }
    return result.value;
  },
});
