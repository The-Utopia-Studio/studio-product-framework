import { Effect } from "effect";
import { InferenceError } from "./errors";

export type InferenceRequest = {
  readonly model: string;
  readonly messages: ReadonlyArray<{
    readonly role: "system" | "user" | "assistant";
    readonly content: string;
  }>;
  readonly userId: string;
  readonly idempotencyKey: string;
};

export type InferenceResponse = {
  readonly text: string;
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly providerRequestId?: string;
  readonly toolCalls?: ReadonlyArray<{
    readonly name: string;
    readonly args: Record<string, unknown>;
  }>;
};

export type InferenceGateway = {
  readonly complete: (request: InferenceRequest) => Promise<InferenceResponse>;
};

/**
 * Broker model calls (e.g. OpenRouter) with typed retryable failures.
 * Pair with wallet debit in the same Effect program when credits are required.
 */
export function runInference(
  gateway: InferenceGateway,
  request: InferenceRequest,
): Effect.Effect<InferenceResponse, InferenceError> {
  return Effect.tryPromise({
    try: () => gateway.complete(request),
    catch: (cause) =>
      new InferenceError({
        provider: "openrouter",
        message:
          cause instanceof Error ? cause.message : "Inference request failed",
        retryable: true,
        cause,
      }),
  });
}
