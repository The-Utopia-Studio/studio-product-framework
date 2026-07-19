import { httpRouter } from "convex/server";
import { paymentWebhook } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { openai } from "@ai-sdk/openai";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

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

  const { messages } = await req.json();

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const model = openRouterKey
    ? createOpenAI({
        apiKey: openRouterKey,
        baseURL: "https://openrouter.ai/api/v1",
      })(process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini")
    : openai("gpt-4o-mini");

  const result = streamText({
    model,
    messages,
    async onFinish({ usage }) {
      await ctx.runMutation(internal.inferenceStore.recordRun, {
        userId,
        model: process.env.OPENROUTER_MODEL ?? "gpt-4o-mini",
        inputTokens: usage?.promptTokens ?? 0,
        outputTokens: usage?.completionTokens ?? 0,
        creditCost: 1,
        transactionId: idempotencyKey,
        status: "succeeded",
      });
    },
  });

  return result.toDataStreamResponse({
    headers: corsHeaders,
  });
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
