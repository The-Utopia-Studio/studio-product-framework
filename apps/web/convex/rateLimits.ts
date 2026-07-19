import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

/**
 * App-level rate limits via Convex Rate Limiter component.
 * https://www.convex.dev/components
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  chat: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },
  meteredInference: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 3,
  },
});
