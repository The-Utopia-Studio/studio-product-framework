import { Data } from "effect";

/**
 * Typed errors for paths where bugs cost money or trust.
 * Use Effect here; keep Convex orchestration thin and call into these services.
 */
export class WalletError extends Data.TaggedError("WalletError")<{
  readonly operation: "debit" | "credit" | "reconcile" | "read";
  readonly message: string;
  readonly retryable: boolean;
  readonly cause?: unknown;
}> {}

export class InferenceError extends Data.TaggedError("InferenceError")<{
  readonly provider: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly cause?: unknown;
}> {}

export class DeliveryError extends Data.TaggedError("DeliveryError")<{
  readonly channel: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly cause?: unknown;
}> {}
