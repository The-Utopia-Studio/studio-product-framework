import { httpRouter } from "convex/server";
import { paymentWebhook } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import {
  langfuseConfigFromEnv,
  traceGeneration,
} from "@studio/observability/langfuse";

const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.FRONTEND_URL || "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  Vary: "origin",
};

/**
 * Streaming chat with auth, rate limit, and wallet debit (1 credit).
 * Prefer `api.inference.runMeteredInference` for non-streaming Effect path.
 */
export const chat = httpAction(async (ctx, req) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  const userId = identity.subject;

  try {
    await ctx.runMutation(internal.rateLimitGuard.assertChatLimit, { userId });
  } catch {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  await ctx.runMutation(internal.wallet.ensureWallet, { userId });

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY is not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }

  // Parse + validate before debit so malformed bodies never charge the wallet.
  let messages: unknown;
  try {
    const body = await req.json();
    messages = body?.messages;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "messages must be an array" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }

  const idempotencyKey = `chat:${userId}:${Date.now()}`;
  try {
    await ctx.runMutation(internal.wallet.debitInternal, {
      userId,
      amount: 1,
      reason: "streaming_chat",
      idempotencyKey,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Insufficient credits" }), {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

  // Debit already happened above — any failure past this point must refund
  // it, since a paid-but-not-delivered stream can't leave the user charged.
  const refund = () =>
    ctx.runMutation(internal.wallet.creditInternal, {
      userId,
      amount: 1,
      reason: "refund:streaming_chat",
      idempotencyKey: `refund:${idempotencyKey}`,
    });

  try {
    const result = streamText({
      model: createOpenAI({
        apiKey: openRouterKey,
        baseURL: "https://openrouter.ai/api/v1",
      })(model),
      messages,
      async onFinish({ text, usage }) {
        await ctx.runMutation(internal.inferenceStore.recordRun, {
          userId,
          model,
          inputTokens: usage?.promptTokens ?? 0,
          outputTokens: usage?.completionTokens ?? 0,
          creditCost: 1,
          transactionId: idempotencyKey,
          status: "succeeded",
        });

        void traceGeneration(langfuseConfigFromEnv(), {
          name: "streaming_chat",
          userId,
          model,
          input: messages,
          output: text,
          inputTokens: usage?.promptTokens ?? 0,
          outputTokens: usage?.completionTokens ?? 0,
          metadata: { transactionId: idempotencyKey, creditCost: 1 },
        });
      },
      async onError({ error }) {
        const message =
          error instanceof Error ? error.message : "Stream failed";
        await refund();
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
          name: "streaming_chat",
          userId,
          model,
          input: messages,
          output: message,
          level: "ERROR",
          statusMessage: message,
          metadata: { creditCost: 0 },
        });

        await ctx.scheduler.runAfter(
          0,
          internal.observabilityNode.reportException,
          { message, tags: { userId, path: "streaming_chat" } },
        );
      },
    });

    return result.toDataStreamResponse({
      headers: corsHeaders,
    });
  } catch (error) {
    // Cover sync failures after debit that never reach streamText onError.
    await refund();
    const message =
      error instanceof Error ? error.message : "Failed to start stream";
    await ctx.scheduler.runAfter(0, internal.observabilityNode.reportException, {
      message,
      tags: { userId, path: "streaming_chat" },
    });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});

const http = httpRouter();

http.route({
  path: "/api/chat",
  method: "POST",
  handler: chat,
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: paymentWebhook,
});

export default http;
