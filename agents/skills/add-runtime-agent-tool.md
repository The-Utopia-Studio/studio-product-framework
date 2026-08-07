---
name: add-runtime-agent-tool
description: Add a tool to the product runtime agent with sandbox + credit safety
---

# Add a runtime agent tool

## Rules

- Runtime agent ≠ builder agent
- Tools that execute code/commands must run in a **sandbox** (`@studio/ai-runtime`)
- Inference goes through the Effect inference fence when metered
- Debit credits (wallet) before or atomically around paid inference
- Prefer existing web ports: Firecrawl scrape, Parallel search, Browserbase session (`@studio/web-tools` / `api.webTools.*`)

## Steps

1. Define the tool name + argument Zod (or equivalent) schema in the app/Convex layer.
2. If the tool needs a sandbox, use `createSandbox` / `execInSandbox`.
3. If the tool calls a model, use `runInference` from `@studio/effect-critical` via an injected gateway; emit Langfuse via `traceGeneration`.
4. If the tool needs the web: use `scrape` / `search` / `createSession` from `convex/webTools.ts` (or call `@studio/web-tools` directly) — see skills `firecrawl` / `parallel` / `browserbase`.
5. Gate with Autumn/entitlement checks in the Convex action.
6. Return structured tool results to the agent loop; do not leak secrets to the client.

## Checklist

- [ ] `requireSandbox: true` for code execution / Browserbase automation
- [ ] No API keys in client bundles
- [ ] Credit path uses Effect wallet on paid runs
- [ ] Langfuse traced if the tool invokes a model
- [ ] `pnpm typecheck`
