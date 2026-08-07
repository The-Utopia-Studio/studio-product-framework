/**
 * Minimal Langfuse ingestion via HTTP (no SDK required).
 * No-ops when keys are missing — safe for local lift-and-use.
 */

export type LangfuseConfig = {
  readonly publicKey: string;
  readonly secretKey: string;
  readonly baseUrl?: string;
};

export type LangfuseGenerationInput = {
  readonly name: string;
  readonly userId?: string;
  readonly model: string;
  readonly input: unknown;
  readonly output?: unknown;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly metadata?: Record<string, unknown>;
  readonly level?: "DEFAULT" | "ERROR";
  readonly statusMessage?: string;
};

function basicAuth(publicKey: string, secretKey: string): string {
  const token = `${publicKey}:${secretKey}`;
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(token, "utf8").toString("base64")
      : btoa(token);
  return `Basic ${encoded}`;
}

export function isLangfuseConfigured(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return Boolean(env.LANGFUSE_PUBLIC_KEY && env.LANGFUSE_SECRET_KEY);
}

export function langfuseConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): LangfuseConfig | null {
  if (!env.LANGFUSE_PUBLIC_KEY || !env.LANGFUSE_SECRET_KEY) return null;
  return {
    publicKey: env.LANGFUSE_PUBLIC_KEY,
    secretKey: env.LANGFUSE_SECRET_KEY,
    baseUrl: env.LANGFUSE_BASE_URL ?? "https://cloud.langfuse.com",
  };
}

/** Fire-and-forget generation trace. Never throws to callers. */
export async function traceGeneration(
  config: LangfuseConfig | null | undefined,
  input: LangfuseGenerationInput,
): Promise<void> {
  if (!config?.publicKey || !config.secretKey) return;

  const base = config.baseUrl ?? "https://cloud.langfuse.com";
  const traceId = crypto.randomUUID();
  const generationId = crypto.randomUUID();
  const now = new Date().toISOString();

  const body = {
    batch: [
      {
        id: crypto.randomUUID(),
        type: "trace-create",
        timestamp: now,
        body: {
          id: traceId,
          name: input.name,
          userId: input.userId,
          metadata: input.metadata,
          input: input.input,
          output: input.output,
        },
      },
      {
        id: crypto.randomUUID(),
        type: "generation-create",
        timestamp: now,
        body: {
          id: generationId,
          traceId,
          name: input.name,
          model: input.model,
          input: input.input,
          output: input.output,
          usage: {
            input: input.inputTokens,
            output: input.outputTokens,
            unit: "TOKENS",
          },
          metadata: input.metadata,
          level: input.level ?? "DEFAULT",
          statusMessage: input.statusMessage,
        },
      },
    ],
  };

  try {
    await fetch(`${base}/api/public/ingestion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth(config.publicKey, config.secretKey),
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Observability must never break the money path
  }
}
