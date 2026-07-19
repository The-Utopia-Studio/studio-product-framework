import { useAuth, useUser } from "@clerk/react-router";
import * as Sentry from "@sentry/react";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import {
  clearUserIdentity,
  identifyUser,
} from "@studio/observability/browser";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const posthogHost =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
  "https://us.i.posthog.com";
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

let observabilityBootstrapped = false;

function bootstrapObservability() {
  if (observabilityBootstrapped || typeof window === "undefined") return;
  observabilityBootstrapped = true;

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      sendDefaultPii: false,
      tracesSampleRate: 0.1,
      environment: import.meta.env.MODE,
    });
  }
}

/**
 * Boots PostHog + Sentry and syncs Clerk identity.
 * Safe when env keys are missing (no-ops for local lift-and-use).
 */
export function ObservabilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    bootstrapObservability();
  }, []);

  useEffect(() => {
    const ph = posthogKey ? posthog : null;
    const sentry = sentryDsn ? Sentry : null;

    if (isSignedIn && user) {
      if (identifiedRef.current !== user.id) {
        identifyUser(ph, sentry, {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName ?? undefined,
        });
        identifiedRef.current = user.id;
      }
      return;
    }

    if (identifiedRef.current) {
      clearUserIdentity(ph, sentry);
      identifiedRef.current = null;
    }
  }, [isSignedIn, user]);

  return <>{children}</>;
}

export function captureAppException(error: unknown) {
  if (!sentryDsn) return;
  Sentry.captureException(error);
}
