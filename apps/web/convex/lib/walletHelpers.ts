import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const STARTER_CREDITS = 50;

export async function ensureUserWallet(
  ctx: MutationCtx,
  userId: string,
  starterCredits: number = STARTER_CREDITS,
): Promise<Id<"wallets">> {
  const existing = await ctx.db
    .query("wallets")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (existing) {
    return existing._id;
  }

  const now = Date.now();
  const walletId = await ctx.db.insert("wallets", {
    userId,
    balance: starterCredits,
    updatedAt: now,
  });

  if (starterCredits > 0) {
    await ctx.db.insert("walletTransactions", {
      userId,
      amount: starterCredits,
      type: "credit",
      reason: "starter_grant",
      idempotencyKey: `starter:${userId}`,
      balanceAfter: starterCredits,
      createdAt: now,
    });
  }

  return walletId;
}
