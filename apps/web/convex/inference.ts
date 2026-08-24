import { v, ConvexError } from "convex/values";
import { action, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Effect } from "effect";
import {
  debitAndInfer,
  type InferenceError,
  type WalletError,
} from "@studio/effect-critical";
import {
  createOpenRouterGateway,
  type ToolConfig,
  type ToolDefinition,
} from "@studio/ai-runtime";
import {
  langfuseConfigFromEnv,
  traceGeneration,
} from "@studio/observability/langfuse";
import { isAutumnConfigured, autumn } from "./autumn";
import type { ActionCtx } from "./_generated/server";

const DEFAULT_CREDIT_COST = 1;
const DEFAULT_MODEL = "openai/gpt-4o-mini";

// The raw message (OpenRouter's JSON error body, Autumn's internal string,
// etc.) is what gets recorded to inferenceRuns/Langfuse/Sentry for debugging
// — this only rewrites what actually reaches the end user, who has no way
// to act on "OpenRouter error: 402 {\"error\":{...}}" anyway.
function humanizeInferenceError(message: string): string {
  if (message.includes("Insufficient credits")) {
    return "AI chat is temporarily unavailable — the account powering it has run out of credits. Please try again later.";
  }
  if (message.includes("OPENROUTER_API_KEY is not configured")) {
    return "AI chat isn't set up for this app yet.";
  }
  if (/OpenRouter error: 401/.test(message)) {
    return "AI chat is temporarily unavailable — please try again later.";
  }
  if (/OpenRouter error: 429/.test(message)) {
    return "AI chat is getting a lot of requests right now — please try again in a moment.";
  }
  if (message.startsWith("Autumn: no access")) {
    return "You've used all of your included AI credits for this plan.";
  }
  if (message === "Idempotency key already used for a debit") {
    return "That message was already sent — please try a new one.";
  }
  return "Something went wrong answering that. Please try again.";
}

// Gives the chat model real tools to use — only the ones whose API key is
// actually configured. Search results/scraped content are capped before
// being fed back to the model; nothing here needs the raw multi-KB payload.
function buildToolConfig(ctx: ActionCtx): ToolConfig | undefined {
  const tools: ToolDefinition[] = [];
  if (process.env.PARALLEL_API_KEY) {
    tools.push({
      name: "search_web",
      description:
        "Search the web for current information — use for anything time-sensitive or outside your own knowledge.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    });
  }
  if (process.env.FIRECRAWL_API_KEY) {
    tools.push({
      name: "scrape_url",
      description: "Fetch and read the content of a specific web page URL.",
      parameters: {
        type: "object",
        properties: { url: { type: "string" } },
        required: ["url"],
      },
    });
  }
  if (tools.length === 0) return undefined;

  return {
    tools,
    executeTool: async (name, args) => {
      if (name === "search_web") {
        const result = await ctx.runAction(api.webTools.search, {
          query: String(args.query ?? ""),
          maxResults: 5,
        });
        return JSON.stringify(result.hits);
      }
      if (name === "scrape_url") {
        const result = await ctx.runAction(api.webTools.scrape, {
          url: String(args.url ?? ""),
        });
        return result.markdown.slice(0, 8000);
      }
      return `Unknown tool: ${name}`;
    },
  };
}

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
  },
  returns: v.object({
    text: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    balance: v.number(),
    transactionId: v.string(),
    providerRequestId: v.optional(v.string()),
    toolCalls: v.array(v.object({ name: v.string(), args: v.any() })),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    // Price, model, and debit idempotency keys are server-controlled.
    // A client-supplied key would let debitInternal short-circuit while
    // debitAndInfer still paid the provider (and could refund a charge
    // this invocation never made).
    const creditCost = DEFAULT_CREDIT_COST;
    const idempotencyKey = `infer:${userId}:${crypto.randomUUID()}`;
    const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

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
              signal: AbortSignal.timeout(30_000),
            },
          );

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter error: ${response.status} ${errText}`);
          }

          return (await response.json()) as {
            id?: string;
            choices: Array<{
              message?: {
                content?: string | null;
                tool_calls?: Array<{
                  id: string;
                  function: { name: string; arguments: string };
                }>;
              };
            }>;
            usage?: { prompt_tokens?: number; completion_tokens?: number };
          };
        },
      },
      { defaultModel: model },
      buildToolConfig(ctx),
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

      void traceGeneration(langfuseConfigFromEnv(), {
        name: "metered_inference",
        userId,
        model: result.inference.model,
        input: args.messages,
        output: result.inference.text,
        inputTokens: result.inference.inputTokens,
        outputTokens: result.inference.outputTokens,
        metadata: {
          transactionId: result.transactionId,
          creditCost,
          providerRequestId: result.inference.providerRequestId,
        },
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
        toolCalls: result.inference.toolCalls?.map((t) => ({ name: t.name, args: t.args })) ?? [],
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

      void traceGeneration(langfuseConfigFromEnv(), {
        name: "metered_inference",
        userId,
        model,
        input: args.messages,
        output: message,
        level: "ERROR",
        statusMessage: message,
        metadata: { creditCost },
      });

      await ctx.scheduler.runAfter(0, internal.observabilityNode.reportException, {
        message,
        tags: { userId, path: "runMeteredInference" },
      });

      throw new ConvexError(humanizeInferenceError(message));
    }
  },
});

// Lets the chat UI show which tools are actually live — booleans only, no
// secrets cross this boundary.
export const getEnabledTools = query({
  args: {},
  returns: v.object({
    chatEnabled: v.boolean(),
    webSearch: v.boolean(),
    pageReader: v.boolean(),
  }),
  handler: async () => ({
    chatEnabled: Boolean(process.env.OPENROUTER_API_KEY),
    webSearch: Boolean(process.env.PARALLEL_API_KEY),
    pageReader: Boolean(process.env.FIRECRAWL_API_KEY),
  }),
});
