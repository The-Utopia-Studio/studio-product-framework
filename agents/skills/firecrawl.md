---
name: firecrawl
description: >
  Scrape or search the live web into LLM-ready markdown via Firecrawl.
  Use for builder research pages and runtime agent scrape tools
  (api.webTools.scrape). Prefer Parallel for cited research; Browserbase for acting.
---

# Firecrawl

**Product:** https://www.firecrawl.dev  
**Package:** `@studio/web-tools` → `scrapeUrl`  
**Convex:** `api.webTools.scrape` (authenticated)

## When to use

| Job | Tool |
|-----|------|
| This URL → clean markdown | **Firecrawl** |
| Cited research / monitor / enrich | Parallel |
| Click, login, multi-step UI | Browserbase |

## Setup

1. Create a key at Firecrawl.  
2. Set `FIRECRAWL_API_KEY` in Convex env (`npx convex env set FIRECRAWL_API_KEY …`) and `apps/web/.env.local` for local.  
3. Call `api.webTools.scrape` from the product, or `scrapeUrl` from a Convex action / sandbox tool.

## Builder research

```
Need the contents of https://docs.example.com/x
→ use Firecrawl scrape (or api.webTools.scrape in a throwaway script / action)
→ paste/summarize evidence into research-queue or the PR
```

Do **not** use Firecrawl when Parallel Search already answers with citations.

## Runtime agent tool

Follow `add-runtime-agent-tool.md`: expose `scrape` with Zod args `{ url }`, debit credits if costly, sandbox only if you shell out — HTTP scrape does not need a sandbox.

## Done when

A scrape returns markdown for a known URL with the key set; without the key, error message is `FIRECRAWL_API_KEY is not set` (not a silent empty string).
