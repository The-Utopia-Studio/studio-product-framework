import { httpRouter } from "convex/server";
import { paymentWebhook } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.FRONTEND_URL || "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  Vary: "origin",
};

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

  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    async onFinish({ text }) {
      console.warn("chat finished", {
        subject: identity.subject,
        chars: text.length,
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
