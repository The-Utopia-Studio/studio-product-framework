import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ensureUserWallet } from "./lib/walletHelpers";

const userDoc = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  image: v.optional(v.string()),
  tokenIdentifier: v.string(),
});

export const findUserByToken = query({
  args: { tokenIdentifier: v.string() },
  returns: v.union(userDoc, v.null()),
  handler: async (ctx, _args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();
  },
});

export const upsertUser = mutation({
  args: {},
  returns: v.union(userDoc, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (existingUser) {
      if (
        existingUser.name !== identity.name ||
        existingUser.email !== identity.email
      ) {
        await ctx.db.patch(existingUser._id, {
          name: identity.name,
          email: identity.email,
        });
      }
      await ensureUserWallet(ctx, identity.subject);
      return (await ctx.db.get(existingUser._id)) ?? existingUser;
    }

    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.subject,
    });

    await ensureUserWallet(ctx, identity.subject);
    return await ctx.db.get(userId);
  },
});
