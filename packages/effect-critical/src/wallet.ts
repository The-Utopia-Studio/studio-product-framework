import { Effect } from "effect";
import { WalletError } from "./errors";

export type WalletLedger = {
  readonly getBalance: (userId: string) => Promise<number>;
  readonly debit: (input: {
    userId: string;
    amount: number;
    reason: string;
    idempotencyKey: string;
  }) => Promise<{ balance: number; transactionId: string }>;
  readonly credit: (input: {
    userId: string;
    amount: number;
    reason: string;
    idempotencyKey: string;
  }) => Promise<{ balance: number; transactionId: string }>;
};

/**
 * Debit credits with exhaustive typed failures.
 * Call from Convex actions when leaving the managed comfort zone.
 */
export function debitCredits(
  ledger: WalletLedger,
  input: {
    userId: string;
    amount: number;
    reason: string;
    idempotencyKey: string;
  },
): Effect.Effect<{ balance: number; transactionId: string }, WalletError> {
  return Effect.tryPromise({
    try: async () => {
      if (input.amount <= 0) {
        throw new Error("Debit amount must be positive");
      }
      const balance = await ledger.getBalance(input.userId);
      if (balance < input.amount) {
        throw new Error("Insufficient credits");
      }
      return await ledger.debit(input);
    },
    catch: (cause) =>
      new WalletError({
        operation: "debit",
        message:
          cause instanceof Error ? cause.message : "Wallet debit failed",
        retryable: false,
        cause,
      }),
  });
}

export function creditWallet(
  ledger: WalletLedger,
  input: {
    userId: string;
    amount: number;
    reason: string;
    idempotencyKey: string;
  },
): Effect.Effect<{ balance: number; transactionId: string }, WalletError> {
  return Effect.tryPromise({
    try: async () => {
      if (input.amount <= 0) {
        throw new Error("Credit amount must be positive");
      }
      return await ledger.credit(input);
    },
    catch: (cause) =>
      new WalletError({
        operation: "credit",
        message:
          cause instanceof Error ? cause.message : "Wallet credit failed",
        retryable: true,
        cause,
      }),
  });
}

/**
 * Compare Autumn (or other meter) balance with the authoritative ledger.
 * Reconciliation mismatches are non-retryable trust failures.
 */
export function reconcileBalances(input: {
  ledgerBalance: number;
  providerBalance: number;
  tolerance?: number;
}): Effect.Effect<{ matched: true }, WalletError> {
  const tolerance = input.tolerance ?? 0;
  const delta = Math.abs(input.ledgerBalance - input.providerBalance);
  if (delta > tolerance) {
    return Effect.fail(
      new WalletError({
        operation: "reconcile",
        message: `Ledger/provider mismatch: ledger=${input.ledgerBalance} provider=${input.providerBalance}`,
        retryable: false,
      }),
    );
  }
  return Effect.succeed({ matched: true as const });
}
