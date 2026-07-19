import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import type { CreditDebitRequest, CreditDebitResult, Entitlement } from "../types";

/**
 * Autumn credit-metering capability block.
 * Ledger mutations that can lose money must go through @studio/effect-critical.
 */
export type AutumnClient = {
  getBalance: (userId: string) => Promise<number>;
  checkAccess: (userId: string, featureId: string) => Promise<boolean>;
};

export async function getAutumnEntitlement(
  client: AutumnClient,
  userId: string,
): Promise<Result<Entitlement, StudioError>> {
  try {
    const creditsRemaining = await client.getBalance(userId);
    return ok({
      provider: "autumn",
      status: creditsRemaining > 0 ? "active" : "none",
      creditsRemaining,
    });
  } catch (cause) {
    return err(
      studioError("BILLING", "Failed to load Autumn entitlement", {
        cause,
        retryable: true,
      }),
    );
  }
}

export async function assertAutumnAccess(
  client: AutumnClient,
  userId: string,
  featureId: string,
): Promise<Result<true, StudioError>> {
  try {
    const allowed = await client.checkAccess(userId, featureId);
    if (!allowed) {
      return err(
        studioError("BILLING", `No credit access for feature: ${featureId}`),
      );
    }
    return ok(true);
  } catch (cause) {
    return err(
      studioError("BILLING", "Failed to check Autumn access", {
        cause,
        retryable: true,
      }),
    );
  }
}

/** Shape only — debit implementation lives in effect-critical wallet. */
export type CreditDebitPlan = CreditDebitRequest & {
  readonly expectedResult?: CreditDebitResult;
};
