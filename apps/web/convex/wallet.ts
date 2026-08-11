import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ensureUserWallet } from "./lib/walletHelpers";

export const getBalance = query({
  args: {},
  returns: v.object({
    balance: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { balance: 0 };
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    return { balance: wallet?.balance ?? 0 };
  },
});

export const ensureWallet = internalMutation({
  args: {
    userId: v.string(),
    starterCredits: v.optional(v.number()),
  },
  returns: v.id("wallets"),
  handler: async (ctx, args) => {
    return await ensureUserWallet(ctx, args.userId, args.starterCredits);
  },
});

export const getBalanceInternal = internalQuery({
  args: { userId: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    return wallet?.balance ?? 0;
  },
});

export const debitInternal = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    reason: v.string(),
    idempotencyKey: v.string(),
  },
  returns: v.object({
    balance: v.number(),
    transactionId: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Debit amount must be positive");
    }

    const existingTx = await ctx.db
      .query("walletTransactions")
      .withIndex("by_idempotency", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();

    if (existingTx) {
      return {
        balance: existingTx.balanceAfter,
        transactionId: existingTx._id,
      };
    }

    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: args.userId,
        balance: 0,
        updatedAt: Date.now(),
      });
      wallet = await ctx.db.get(walletId);
    }

    if (!wallet) {
      throw new Error("Failed to create wallet");
    }

    if (wallet.balance < args.amount) {
      throw new Error("Insufficient credits");
    }

    const balance = wallet.balance - args.amount;
    const now = Date.now();
    await ctx.db.patch(wallet._id, { balance, updatedAt: now });

    const transactionId = await ctx.db.insert("walletTransactions", {
      userId: args.userId,
      amount: args.amount,
      type: "debit",
      reason: args.reason,
      idempotencyKey: args.idempotencyKey,
      balanceAfter: balance,
      createdAt: now,
    });

    return { balance, transactionId };
  },
});

export const creditInternal = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    reason: v.string(),
    idempotencyKey: v.string(),
  },
  returns: v.object({
    balance: v.number(),
    transactionId: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Credit amount must be positive");
    }

    const existingTx = await ctx.db
      .query("walletTransactions")
      .withIndex("by_idempotency", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();

    if (existingTx) {
      return {
        balance: existingTx.balanceAfter,
        transactionId: existingTx._id,
      };
    }

    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: args.userId,
        balance: 0,
        updatedAt: Date.now(),
      });
      wallet = await ctx.db.get(walletId);
    }

    if (!wallet) {
      throw new Error("Failed to create wallet");
    }

    const balance = wallet.balance + args.amount;
    const now = Date.now();
    await ctx.db.patch(wallet._id, { balance, updatedAt: now });

    const transactionId = await ctx.db.insert("walletTransactions", {
      userId: args.userId,
      amount: args.amount,
      type: "credit",
      reason: args.reason,
      idempotencyKey: args.idempotencyKey,
      balanceAfter: balance,
      createdAt: now,
    });

    return { balance, transactionId };
  },
});

/**
 * Admin/support credit grant. Internal-only — never client-callable.
 * Invoke from a trusted server context (billing webhook, support tool),
 * not from the browser, so a signed-in user can't self-grant credits.
 */
export const grantCredits = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    reason: v.optional(v.string()),
  },
  returns: v.object({
    balance: v.number(),
    transactionId: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.amount <= 0 || args.amount > 10_000) {
      throw new Error("Invalid credit amount");
    }

    const idempotencyKey = `grant:${args.userId}:${Date.now()}`;
    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: args.userId,
        balance: 0,
        updatedAt: Date.now(),
      });
      wallet = await ctx.db.get(walletId);
    }

    if (!wallet) {
      throw new Error("Failed to create wallet");
    }

    const balance = wallet.balance + args.amount;
    const now = Date.now();
    await ctx.db.patch(wallet._id, { balance, updatedAt: now });
    const transactionId = await ctx.db.insert("walletTransactions", {
      userId: args.userId,
      amount: args.amount,
      type: "credit",
      reason: args.reason ?? "manual_grant",
      idempotencyKey,
      balanceAfter: balance,
      createdAt: now,
    });

    return { balance, transactionId };
  },
});
