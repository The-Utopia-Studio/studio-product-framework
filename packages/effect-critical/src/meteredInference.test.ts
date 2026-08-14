import { describe, expect, it } from "vitest";
import { Effect } from "effect";
import { debitAndInfer } from "./meteredInference";
import type { WalletLedger, WalletLedgerResult } from "./wallet";
import type { InferenceGateway } from "./inference";
import { WalletError, InferenceError } from "./errors";

function fakeLedger(startingBalance: number) {
  let balance = startingBalance;
  const seen = new Map<string, WalletLedgerResult>();
  const calls: Array<{ op: "debit" | "credit"; amount: number }> = [];

  const ledger: WalletLedger = {
    getBalance: async () => balance,
    debit: async (input) => {
      const existing = seen.get(input.idempotencyKey);
      if (existing) return { ...existing, created: false };
      balance -= input.amount;
      calls.push({ op: "debit", amount: input.amount });
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
      calls.push({ op: "credit", amount: input.amount });
      const result = {
        balance,
        transactionId: `credit:${input.idempotencyKey}`,
        created: true,
      };
      seen.set(input.idempotencyKey, result);
      return result;
    },
  };

  return { ledger, calls, getBalance: () => balance };
}

const baseInput = {
  userId: "u1",
  creditCost: 2,
  reason: "metered_inference",
  idempotencyKey: "infer-1",
  inference: {
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user" as const, content: "hi" }],
    userId: "u1",
    idempotencyKey: "infer-1",
  },
};

describe("debitAndInfer", () => {
  it("debits once and returns the inference result on success", async () => {
    const { ledger, calls } = fakeLedger(10);
    const gateway: InferenceGateway = {
      complete: async () => ({
        text: "hello",
        model: "openai/gpt-4o-mini",
        inputTokens: 1,
        outputTokens: 1,
      }),
    };

    const result = await Effect.runPromise(
      debitAndInfer(ledger, gateway, baseInput),
    );

    expect(result.balance).toBe(8);
    expect(result.inference.text).toBe("hello");
    expect(calls).toEqual([{ op: "debit", amount: 2 }]);
  });

  it("refunds the debit and surfaces the original InferenceError when the gateway fails", async () => {
    const { ledger, calls, getBalance } = fakeLedger(10);
    const gateway: InferenceGateway = {
      complete: async () => {
        throw new Error("OpenRouter 503");
      },
    };

    const exit = await Effect.runPromiseExit(
      debitAndInfer(ledger, gateway, baseInput),
    );

    expect(exit._tag).toBe("Failure");
    if (exit._tag === "Failure") {
      const error = exit.cause._tag === "Fail" ? exit.cause.error : undefined;
      expect(error).toBeInstanceOf(InferenceError);
    }
    expect(calls).toEqual([
      { op: "debit", amount: 2 },
      { op: "credit", amount: 2 },
    ]);
    expect(getBalance()).toBe(10);
  });

  it("surfaces a WalletError (not silence) when the refund itself fails", async () => {
    const ledger: WalletLedger = {
      getBalance: async () => 10,
      debit: async () => ({
        balance: 8,
        transactionId: "debit:1",
        created: true,
      }),
      credit: async () => {
        throw new Error("ledger unavailable");
      },
    };
    const gateway: InferenceGateway = {
      complete: async () => {
        throw new Error("OpenRouter 503");
      },
    };

    const exit = await Effect.runPromiseExit(
      debitAndInfer(ledger, gateway, baseInput),
    );

    expect(exit._tag).toBe("Failure");
    if (exit._tag === "Failure") {
      const error = exit.cause._tag === "Fail" ? exit.cause.error : undefined;
      expect(error).toBeInstanceOf(WalletError);
      expect((error as WalletError).operation).toBe("credit");
    }
  });

  it("fails closed on a replayed idempotency key instead of double-charging or re-calling the provider", async () => {
    const { ledger } = fakeLedger(10);
    let gatewayCalls = 0;
    const gateway: InferenceGateway = {
      complete: async () => {
        gatewayCalls += 1;
        return {
          text: "hello",
          model: "openai/gpt-4o-mini",
          inputTokens: 1,
          outputTokens: 1,
        };
      },
    };

    await Effect.runPromise(debitAndInfer(ledger, gateway, baseInput));
    const exit = await Effect.runPromiseExit(
      debitAndInfer(ledger, gateway, baseInput),
    );

    expect(exit._tag).toBe("Failure");
    if (exit._tag === "Failure") {
      const error = exit.cause._tag === "Fail" ? exit.cause.error : undefined;
      expect(error).toBeInstanceOf(WalletError);
    }
    expect(gatewayCalls).toBe(1);
  });
});
