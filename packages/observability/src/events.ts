/**
 * Canonical product events for AI-native apps.
 * Keep names stable — PostHog dashboards and funnels depend on them.
 */
export const StudioEvents = {
  signedIn: "signed_in",
  signedUp: "signed_up",
  checkoutStarted: "checkout_started",
  checkoutCompleted: "checkout_completed",
  subscriptionActivated: "subscription_activated",
  creditsDebited: "credits_debited",
  creditsExhausted: "credits_exhausted",
  agentRunStarted: "agent_run_started",
  agentRunSucceeded: "agent_run_succeeded",
  agentRunFailed: "agent_run_failed",
  inferenceCompleted: "inference_completed",
  featureFlagEvaluated: "feature_flag_evaluated",
} as const;

export type StudioEventName = (typeof StudioEvents)[keyof typeof StudioEvents];

export type StudioEventProps = Record<string, string | number | boolean | null>;
