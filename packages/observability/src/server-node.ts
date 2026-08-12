/**
 * Node-only server-side Sentry capture.
 *
 * Import this ONLY from a Convex action file that starts with
 * `"use node";` — @sentry/node needs the full Node runtime, not the
 * default Convex isolate. Never re-exported from the package root, so it
 * can't accidentally land in a client bundle.
 */
import * as Sentry from "@sentry/node";

export type SentryServerConfig = {
  readonly dsn: string;
};

export function sentryServerConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): SentryServerConfig | null {
  const dsn = env.SENTRY_DSN;
  if (!dsn) return null;
  return { dsn };
}

let initializedDsn: string | null = null;

function ensureInitialized(config: SentryServerConfig): void {
  if (initializedDsn === config.dsn) return;
  Sentry.init({ dsn: config.dsn, environment: process.env.NODE_ENV });
  initializedDsn = config.dsn;
}

/** Fire-and-forget server-side exception capture. Never throws to callers. */
export async function captureServerException(
  config: SentryServerConfig | null | undefined,
  error: unknown,
  tags?: Record<string, string>,
): Promise<void> {
  if (!config?.dsn) return;
  try {
    ensureInitialized(config);
    Sentry.captureException(error, tags ? { tags } : undefined);
    await Sentry.flush(2_000);
  } catch {
    // Observability must never break the money path.
  }
}
