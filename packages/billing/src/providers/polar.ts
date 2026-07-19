import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import type { CheckoutRequest, CheckoutSession, Entitlement } from "../types";

/**
 * Polar subscription capability block.
 * Wire real SDK calls from Convex actions; keep this package free of DB access.
 */
export type PolarClient = {
  createCheckoutUrl: (input: {
    priceId: string;
    successUrl: string;
    customerExternalId: string;
  }) => Promise<string>;
  getEntitlement: (userId: string) => Promise<Entitlement | null>;
};

export async function createPolarCheckout(
  client: PolarClient,
  request: CheckoutRequest,
): Promise<Result<CheckoutSession, StudioError>> {
  if (request.provider !== "polar") {
    return err(
      studioError("VALIDATION", "Polar checkout requires provider: polar"),
    );
  }

  try {
    const url = await client.createCheckoutUrl({
      priceId: request.priceId,
      successUrl: request.successUrl,
      customerExternalId: request.userId,
    });
    return ok({
      provider: "polar",
      url,
      sessionId: `polar_${request.userId}_${request.priceId}`,
    });
  } catch (cause) {
    return err(
      studioError("BILLING", "Failed to create Polar checkout", {
        cause,
        retryable: true,
      }),
    );
  }
}

export async function getPolarEntitlement(
  client: PolarClient,
  userId: string,
): Promise<Result<Entitlement, StudioError>> {
  try {
    const entitlement = await client.getEntitlement(userId);
    if (!entitlement) {
      return ok({
        provider: "polar",
        status: "none",
      });
    }
    return ok(entitlement);
  } catch (cause) {
    return err(
      studioError("BILLING", "Failed to load Polar entitlement", {
        cause,
        retryable: true,
      }),
    );
  }
}
