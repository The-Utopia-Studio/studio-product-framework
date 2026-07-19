import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Effect } from "effect";
import {
  debitAndInfer,
  type InferenceError,
  type WalletError,
} from "@studio/effect-critical";
import { createOpenRouterGateway } from "@studio/ai-runtime";
import { isAutumnConfigured, autumn } from "./autumn";

const DEFAULT_CREDIT_COST = 1;
const DEFAULT_MODEL = "openai/gpt-4o-mini";

/**
 * Vertical: rate limit → (optional Autumn check) → Effect debit+OpenRouter → persist.
 */
export const runMeteredInference = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(
          v.literal("system"),
          v.literal("user"),
          v.literal("assistant"),
        ),
        content: v.string(),
      }),
    ),
    model: v.optional(v.string()),
    creditCost: v.optional(v.number()),
    idempotencyKey: v.optional(v.string()),
  },
  returns: v.object({
    text: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    balance: v.number(),
    transactionId: v.string(),
    providerRequestId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const creditCost = args.creditCost ?? DEFAULT_CREDIT_COST;
    const idempotencyKey =
      args.idempotencyKey ?? `infer:${userId}:${Date.now()}`;
    const model = args.model ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

    await ctx.runMutation(internal.rateLimitGuard.assertMeteredInferenceLimit, {
      userId,
    });

    if (isAutumnConfigured()) {
      try {
        const access = await autumn.check(ctx, {
          featureId: "ai_messages",
        });
        const allowed =
          access &&
          typeof access === "object" &&
          "data" in access &&
          access.data &&
          typeof access.data === "object" &&
          "allowed" in access.data
            ? Boolean(access.data.allowed)
            : true;
        if (!allowed) {
          throw new Error("Autumn: no access to ai_messages");
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith("Autumn: no access")
        ) {
          throw error;
        }
        console.warn("Autumn check skipped:", error);
      }
    }

    await ctx.runMutation(internal.wallet.ensureWallet, { userId });
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const gateway = createOpenRouterGateway(
      {
        async postChatCompletions(body) {
          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer":
                  process.env.FRONTEND_URL ?? "http://localhost:5173",
                "X-Title": "Studio Product Framework",
              },
              body: JSON.stringify(body),
            },
          );

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter error: ${response.status} ${errText}`);
          }

          return (await response.json()) as {
            id?: string;
            choices: Array<{ message?: { content?: string | null } }>;
            usage?: { prompt_tokens?: number; completion_tokens?: number };
          };
        },
      },
      { defaultModel: model },
    );

    const ledger = {
      getBalance: (id: string) =>
        ctx.runQuery(internal.wallet.getBalanceInternal, { userId: id }),
      debit: (input: {
        userId: string;
        amount: number;
        reason: string;
        idempotencyKey: string;
      }) => ctx.runMutation(internal.wallet.debitInternal, input),
      credit: (input: {
        userId: string;
        amount: number;
        reason: string;
        idempotencyKey: string;
      }) => ctx.runMutation(internal.wallet.creditInternal, input),
    };

    const program = debitAndInfer(ledger, gateway, {
      userId,
      creditCost,
      reason: "metered_inference",
      idempotencyKey,
      inference: {
        model,
        messages: args.messages,
        userId,
        idempotencyKey,
      },
    });

    try {
      const result = await Effect.runPromise(
        program.pipe(
          Effect.mapError((error: WalletError | InferenceError) => {
            return new Error(error.message);
          }),
        ),
      );

      await ctx.runMutation(internal.inferenceStore.recordRun, {
        userId,
        model: result.inference.model,
        inputTokens: result.inference.inputTokens,
        outputTokens: result.inference.outputTokens,
        creditCost,
        transactionId: result.transactionId,
        providerRequestId: result.inference.providerRequestId,
        status: "succeeded",
      });

      if (isAutumnConfigured()) {
        try {
          await autumn.track(ctx, {
            featureId: "ai_messages",
            value: creditCost,
          });
        } catch (error) {
          console.warn("Autumn track skipped:", error);
        }
      }

      return {
        text: result.inference.text,
        model: result.inference.model,
        inputTokens: result.inference.inputTokens,
        outputTokens: result.inference.outputTokens,
        balance: result.balance,
        transactionId: result.transactionId,
        providerRequestId: result.inference.providerRequestId,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Inference failed";

      await ctx.runMutation(internal.inferenceStore.recordRun, {
        userId,
        model,
        inputTokens: 0,
        outputTokens: 0,
        creditCost: 0,
        status: "failed",
        errorMessage: message,
      });

      throw new Error(message);
    }
  },
});
