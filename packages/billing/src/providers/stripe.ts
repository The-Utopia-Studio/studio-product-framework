import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import type { CheckoutRequest, CheckoutSession, Entitlement } from "../types";

/**
 * Stripe subscription/payment capability block.
 * Implement with Stripe SDK inside Convex actions or Effect services.
 */
export type StripeClient = {
  createCheckoutSession: (input: {
    priceId: string;
    successUrl: string;
    cancelUrl?: string;
    clientReferenceId: string;
  }) => Promise<{ id: string; url: string }>;
  getEntitlement: (userId: string) => Promise<Entitlement | null>;
};

export async function createStripeCheckout(
  client: StripeClient,
  request: CheckoutRequest,
): Promise<Result<CheckoutSession, StudioError>> {
  if (request.provider !== "stripe") {
    return err(
      studioError("VALIDATION", "Stripe checkout requires provider: stripe"),
    );
  }

  try {
    const session = await client.createCheckoutSession({
      priceId: request.priceId,
      successUrl: request.successUrl,
      cancelUrl: request.cancelUrl,
      clientReferenceId: request.userId,
    });
    return ok({
      provider: "stripe",
      url: session.url,
      sessionId: session.id,
    });
  } catch (cause) {
    return err(
      studioError("BILLING", "Failed to create Stripe checkout", {
        cause,
        retryable: true,
      }),
    );
  }
}

export async function getStripeEntitlement(
  client: StripeClient,
  userId: string,
): Promise<Result<Entitlement, StudioError>> {
  try {
    const entitlement = await client.getEntitlement(userId);
    if (!entitlement) {
      return ok({
        provider: "stripe",
        status: "none",
      });
    }
    return ok(entitlement);
  } catch (cause) {
    return err(
      studioError("BILLING", "Failed to load Stripe entitlement", {
        cause,
        retryable: true,
      }),
    );
  }
}
