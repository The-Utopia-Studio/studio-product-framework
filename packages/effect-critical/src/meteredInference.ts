import { Effect } from "effect";
import { debitCredits, type WalletLedger } from "./wallet";
import {
  runInference,
  type InferenceGateway,
  type InferenceRequest,
  type InferenceResponse,
} from "./inference";
import type { WalletError } from "./errors";
import type { InferenceError } from "./errors";

export type MeteredInferenceInput = {
  readonly userId: string;
  readonly creditCost: number;
  readonly reason: string;
  readonly idempotencyKey: string;
  readonly inference: InferenceRequest;
};

export type MeteredInferenceResult = {
  readonly balance: number;
  readonly transactionId: string;
  readonly inference: InferenceResponse;
};

/**
 * Critical path: debit wallet then call the model gateway.
 * Failures are typed — orchestration decides refunds / user errors.
 */
export function debitAndInfer(
  ledger: WalletLedger,
  gateway: InferenceGateway,
  input: MeteredInferenceInput,
): Effect.Effect<MeteredInferenceResult, WalletError | InferenceError> {
  return Effect.gen(function* () {
    const debit = yield* debitCredits(ledger, {
      userId: input.userId,
      amount: input.creditCost,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
    });

    const inference = yield* runInference(gateway, {
      ...input.inference,
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
    });

    return {
      balance: debit.balance,
      transactionId: debit.transactionId,
      inference,
    };
  });
}
