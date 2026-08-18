import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

export async function requireIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Ventures provisioned through Setter share ONE Clerk application across
  // every venture, isolated by Organization rather than by instance — so a
  // valid, correctly-signed session from a different venture's org would
  // otherwise also pass here, since both trust the same issuer. When this
  // venture has an assigned org (CLERK_ORGANIZATION_ID, set by the
  // provisioning backend), require the JWT's org claim to match it. Ventures
  // with their own dedicated Clerk app (no CLERK_ORGANIZATION_ID) skip this —
  // their issuer alone already scopes them to one venture.
  const expectedOrgId = process.env.CLERK_ORGANIZATION_ID;
  if (expectedOrgId) {
    const orgId = (identity as unknown as { org_id?: string }).org_id;
    if (orgId !== expectedOrgId) {
      throw new Error("Not authenticated");
    }
  }

  return identity;
}

export async function getAuthedUser(ctx: Ctx): Promise<Doc<"users">> {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found — call upsertUser first");
  }

  return user;
}
