/**
 * App-level re-exports from Studio Product Framework packages.
 * Keep orchestration in routes/Convex; import mechanics from here or packages directly.
 */
export { ok, err, isOk, isErr, studioError } from "@studio/core";
export type { Result, StudioError } from "@studio/core";

export { requireIdentity } from "@studio/auth";
export type { StudioIdentity } from "@studio/auth";

export type { BillingProvider, Entitlement } from "@studio/billing";

export {
  StudioEvents,
  trackEvent,
  captureException,
} from "@studio/observability";

export { StudioFlags, isFeatureEnabled } from "@studio/flags";
export { StudioRateLimits, assertRateLimit } from "@studio/ratelimit";
export { sendEmail } from "@studio/email";
export { createUploadUrl } from "@studio/storage";
