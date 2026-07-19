import { studioError, type StudioError } from "@studio/core";

/**
 * Server-side observability contracts.
 * Wire real PostHog/Sentry Node SDKs inside Convex actions ("use node").
 */
export type ServerAnalytics = {
  capture: (input: {
    distinctId: string;
    event: string;
    properties?: Record<string, unknown>;
  }) => Promise<void>;
};

export type ServerErrorReporter = {
  captureException: (input: {
    error: unknown;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }) => Promise<void>;
};

export async function reportServerError(
  reporter: ServerErrorReporter | null | undefined,
  error: unknown,
  tags?: Record<string, string>,
): Promise<StudioError | null> {
  if (!reporter) return null;
  try {
    await reporter.captureException({ error, tags });
    return null;
  } catch (cause) {
    return studioError("INTERNAL", "Failed to report error to Sentry", {
      cause,
      retryable: true,
    });
  }
}
