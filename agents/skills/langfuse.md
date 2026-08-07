---
name: langfuse
description: >
  Wire or verify Langfuse LLM observability (traces, cost, latency, evals)
  for metered inference and runtime agents. Use when adding tracing,
  debugging model calls, or when the user mentions Langfuse.
---

# Langfuse

**Product:** https://langfuse.com  

SPF split:

| Tool | Owns |
|------|------|
| **PostHog** | Product analytics + feature flags |
| **Sentry** | Exceptions / performance |
| **Langfuse** | LLM traces, token/cost, prompt/eval loops |

## Shipped wiring

- Helper: `@studio/observability/langfuse` → `traceGeneration` / `langfuseConfigFromEnv`  
- **Live path:** `apps/web/convex/inference.ts` (`runMeteredInference`) already emits a generation on success/failure when keys are set (no-op otherwise).

## Setup

Convex + `.env.local`:

```bash
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

`npx convex env set LANGFUSE_PUBLIC_KEY …` (and secret) for the deployment that runs actions.

## Verify

1. Set keys on the Convex deployment.  
2. Sign in → `/dashboard/chat` → send a message.  
3. Open Langfuse project → see `metered_inference` generation with token counts.

## Agent checklist

- [ ] Secrets only on server — never `NEXT_PUBLIC_` for secret key  
- [ ] Tracing must never throw into the money path (helper already swallows errors)  
- [ ] New inference entry points call `traceGeneration` the same way  

## Done when

Traces appear for a successful chat run with keys configured.
