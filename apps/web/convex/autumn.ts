import { Autumn } from "@useautumn/convex";
import type { GenericActionCtx } from "convex/server";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

/**
 * Autumn billing component (credits / usage / Stripe abstraction).
 * Set AUTUMN_SECRET_KEY to enable. Local wallet remains Effect source of truth.
 * https://www.convex.dev/components/autumn
 */
export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
  identify: async (ctx: GenericActionCtx<DataModel>) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return null;

    return {
      customerId: user.subject,
      customerData: {
        name: user.name as string,
        email: user.email as string,
      },
    };
  },
});

export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumn.api();

export function isAutumnConfigured() {
  return Boolean(process.env.AUTUMN_SECRET_KEY);
}
