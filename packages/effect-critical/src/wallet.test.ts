import { describe, expect, it } from "vitest";
import { Effect } from "effect";
import { debitCredits, creditWallet, reconcileBalances } from "./wallet";
import type { WalletLedger, WalletLedgerResult } from "./wallet";
import { WalletError } from "./errors";

function fakeLedger(startingBalance: number): WalletLedger {
  let balance = startingBalance;
  const seen = new Map<string, WalletLedgerResult>();

  return {
    getBalance: async () => balance,
    debit: async (input) => {
      const existing = seen.get(input.idempotencyKey);
      if (existing) return { ...existing, created: false };
      balance -= input.amount;
      const result = {
        balance,
        transactionId: `debit:${input.idempotencyKey}`,
        created: true,
      };
      seen.set(input.idempotencyKey, result);
      return result;
    },
    credit: async (input) => {
      const existing = seen.get(input.idempotencyKey);
      if (existing) return { ...existing, created: false };
      balance += input.amount;
      const result = {
        balance,
        transactionId: `credit:${input.idempotencyKey}`,
        created: true,
      };
      seen.set(input.idempotencyKey, result);
      return result;
    },
  };
}

describe("debitCredits", () => {
  it("debits when balance covers the amount", async () => {
    const ledger = fakeLedger(10);
    const result = await Effect.runPromise(
      debitCredits(ledger, {
        userId: "u1",
        amount: 3,
        reason: "test",
        idempotencyKey: "k1",
      }),
    );
    expect(result.balance).toBe(7);
    expect(result.created).toBe(true);
  });

  it("fails with a non-retryable WalletError on insufficient credits", async () => {
    const ledger = fakeLedger(1);
    const exit = await Effect.runPromiseExit(
      debitCredits(ledger, {
        userId: "u1",
        amount: 5,
        reason: "test",
        idempotencyKey: "k1",
      }),
    );
    expect(exit._tag).toBe("Failure");
    if (exit._tag === "Failure") {
      const error = exit.cause._tag === "Fail" ? exit.cause.error : undefined;
      expect(error).toBeInstanceOf(WalletError);
      expect((error as WalletError).retryable).toBe(false);
    }
  });

  it("rejects a zero or negative amount", async () => {
    const ledger = fakeLedger(10);
    const exit = await Effect.runPromiseExit(
      debitCredits(ledger, {
        userId: "u1",
        amount: 0,
        reason: "test",
        idempotencyKey: "k1",
      }),
    );
    expect(exit._tag).toBe("Failure");
  });
});

describe("creditWallet", () => {
  it("credits a positive amount", async () => {
    const ledger = fakeLedger(0);
    const result = await Effect.runPromise(
      creditWallet(ledger, {
        userId: "u1",
        amount: 5,
        reason: "refund",
        idempotencyKey: "k1",
      }),
    );
    expect(result.balance).toBe(5);
  });

  it("rejects a zero or negative amount", async () => {
    const ledger = fakeLedger(0);
    const exit = await Effect.runPromiseExit(
      creditWallet(ledger, {
        userId: "u1",
        amount: -1,
        reason: "refund",
        idempotencyKey: "k1",
      }),
    );
    expect(exit._tag).toBe("Failure");
  });
});

describe("reconcileBalances", () => {
  it("matches within tolerance", async () => {
    const result = await Effect.runPromise(
      reconcileBalances({ ledgerBalance: 100, providerBalance: 100 }),
    );
    expect(result.matched).toBe(true);
  });

  it("fails with a non-retryable WalletError on mismatch", async () => {
    const exit = await Effect.runPromiseExit(
      reconcileBalances({ ledgerBalance: 100, providerBalance: 90 }),
    );
    expect(exit._tag).toBe("Failure");
    if (exit._tag === "Failure") {
      const error = exit.cause._tag === "Fail" ? exit.cause.error : undefined;
      expect(error).toBeInstanceOf(WalletError);
      expect((error as WalletError).retryable).toBe(false);
    }
  });
});
