import { studioError, type StudioError } from "@studio/core";

/**
 * Server-side observability contracts.
 * Sentry needs the Node SDK (see "@studio/observability/server-node",
 * imported only from Convex "use node" actions). PostHog's capture API is
 * a single JSON POST, so it's implemented here directly with plain
 * `fetch` — safe for any runtime, no SDK required.
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

export type PostHogServerConfig = {
  readonly apiKey: string;
  readonly host?: string;
};

export function postHogServerConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): PostHogServerConfig | null {
  const apiKey = env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  };
}

/** Fire-and-forget server-side event capture. Never throws to callers. */
export async function captureServerEvent(
  config: PostHogServerConfig | null | undefined,
  input: {
    distinctId: string;
    event: string;
    properties?: Record<string, unknown>;
  },
): Promise<void> {
  if (!config?.apiKey) return;
  try {
    await fetch(`${config.host ?? "https://us.i.posthog.com"}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.apiKey,
        event: input.event,
        distinct_id: input.distinctId,
        properties: input.properties,
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Observability must never break the money path.
  }
}
