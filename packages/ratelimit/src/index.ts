import { err, ok, studioError, type Result, type StudioError } from "@studio/core";

/**
 * Rate limiting for public HTTP/actions (chat, agent runs, webhooks).
 * Prefer @convex-dev/ratelimiter component in Convex; this package is the API shape.
 */
export type RateLimitConfig = {
  readonly key: string;
  readonly limit: number;
  readonly windowMs: number;
};

export type RateLimiter = {
  readonly check: (
    config: RateLimitConfig,
  ) => Promise<{ ok: boolean; retryAfterMs?: number }>;
};

export async function assertRateLimit(
  limiter: RateLimiter,
  config: RateLimitConfig,
): Promise<Result<true, StudioError>> {
  try {
    const result = await limiter.check(config);
    if (!result.ok) {
      return err(
        studioError("RATE_LIMITED", "Too many requests", {
          retryable: true,
        }),
      );
    }
    return ok(true);
  } catch (cause) {
    return err(
      studioError("INTERNAL", "Rate limit check failed", {
        cause,
        retryable: true,
      }),
    );
  }
}

/** Sensible defaults for AI product surfaces. */
export const StudioRateLimits = {
  chatPerUser: { limit: 30, windowMs: 60_000 },
  agentRunPerUser: { limit: 10, windowMs: 60_000 },
  checkoutPerUser: { limit: 5, windowMs: 60_000 },
} as const;
