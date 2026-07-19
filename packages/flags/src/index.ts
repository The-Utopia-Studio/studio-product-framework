/**
 * Feature flags — prefer PostHog feature flags or a Convex-backed map.
 * Evaluation stays server-side for gated AI / billing features.
 */
export type FlagContext = {
  readonly userId?: string;
  readonly email?: string;
  readonly properties?: Record<string, string | number | boolean>;
};

export type FlagProvider = {
  readonly isEnabled: (
    flag: string,
    context: FlagContext,
  ) => Promise<boolean>;
  readonly getVariant: (
    flag: string,
    context: FlagContext,
  ) => Promise<string | null>;
};

export async function isFeatureEnabled(
  provider: FlagProvider,
  flag: string,
  context: FlagContext,
): Promise<boolean> {
  return provider.isEnabled(flag, context);
}

/** Common AI-native flags — override names in your product if needed. */
export const StudioFlags = {
  agentRuntime: "agent_runtime",
  creditMetering: "credit_metering",
  newCheckout: "new_checkout",
  ragSearch: "rag_search",
} as const;
