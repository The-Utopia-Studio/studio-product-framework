/**
 * Multi-provider billing contracts.
 * Subscriptions: Polar | Stripe
 * Credits: Autumn (+ wallet ledger via @studio/effect-critical)
 */
export type BillingProvider = "polar" | "stripe" | "autumn";

export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

export type Entitlement = {
  readonly provider: BillingProvider;
  readonly status: SubscriptionStatus;
  readonly productId?: string;
  readonly customerId?: string;
  /** For credit products; omit for pure subscription. */
  readonly creditsRemaining?: number;
};

export type CheckoutRequest = {
  readonly provider: Exclude<BillingProvider, "autumn">;
  readonly userId: string;
  readonly priceId: string;
  readonly successUrl: string;
  readonly cancelUrl?: string;
};

export type CheckoutSession = {
  readonly provider: BillingProvider;
  readonly url: string;
  readonly sessionId: string;
};

export type CreditDebitRequest = {
  readonly userId: string;
  readonly amount: number;
  readonly reason: string;
  readonly idempotencyKey: string;
};

export type CreditDebitResult = {
  readonly balance: number;
  readonly transactionId: string;
};
