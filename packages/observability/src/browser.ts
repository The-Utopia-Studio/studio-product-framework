import type { StudioEventName, StudioEventProps } from "./events";

export type PostHogLike = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
};

export type SentryLike = {
  captureException: (error: unknown, context?: Record<string, unknown>) => void;
  setUser: (user: { id?: string; email?: string } | null) => void;
};

export function trackEvent(
  posthog: PostHogLike | null | undefined,
  event: StudioEventName,
  properties?: StudioEventProps,
): void {
  posthog?.capture(event, properties);
}

export function identifyUser(
  posthog: PostHogLike | null | undefined,
  sentry: SentryLike | null | undefined,
  user: { id: string; email?: string; name?: string },
): void {
  posthog?.identify(user.id, {
    email: user.email,
    name: user.name,
  });
  sentry?.setUser({ id: user.id, email: user.email });
}

export function clearUserIdentity(
  posthog: PostHogLike | null | undefined,
  sentry: SentryLike | null | undefined,
): void {
  posthog?.reset();
  sentry?.setUser(null);
}

export function captureException(
  sentry: SentryLike | null | undefined,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  sentry?.captureException(error, context);
}
