import { Effect } from "effect";
import { debitCredits, creditWallet, type WalletLedger } from "./wallet";
import {
  runInference,
  type InferenceGateway,
  type InferenceRequest,
  type InferenceResponse,
} from "./inference";
import { WalletError, type InferenceError } from "./errors";

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
 * If the gateway call fails after the debit succeeded, the debit is
 * refunded before the error propagates — a paid-but-not-delivered
 * inference must never leave the user permanently out of pocket.
 *
 * Debit idempotency replays (`created: false`) fail closed: we must not
 * call the paid provider or issue a refund for a charge this invocation
 * did not make.
 *
 * Refund success → original InferenceError propagates.
 * Refund failure → WalletError propagates (retryable credit) so callers
 * can retry/reconcile instead of silently leaving the user charged.
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

    if (!debit.created) {
      return yield* Effect.fail(
        new WalletError({
          operation: "debit",
          message: "Idempotency key already used for a debit",
          retryable: false,
        }),
      );
    }

    const inference = yield* runInference(gateway, {
      ...input.inference,
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
    }).pipe(
      // tapError: succeed → keep InferenceError; fail → surface WalletError
      Effect.tapError(() =>
        creditWallet(ledger, {
          userId: input.userId,
          amount: input.creditCost,
          reason: `refund:${input.reason}`,
          idempotencyKey: `refund:${input.idempotencyKey}`,
        }),
      ),
    );

    return {
      balance: debit.balance,
      transactionId: debit.transactionId,
      inference,
    };
  });
}
