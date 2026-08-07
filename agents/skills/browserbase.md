---
name: browserbase
description: >
  Give runtime agents a real browser (Browserbase). Use for login walls,
  forms, and multi-step UI. Prefer Firecrawl for read-only scrape;
  Parallel for cited research.
---

# Browserbase

**Product:** https://www.browserbase.com  
**Package:** `@studio/web-tools` → `createBrowserSession`  
**Convex:** `api.webTools.createSession` (authenticated)

## When to use

| Job | Tool |
|-----|------|
| Act in a real browser | **Browserbase** |
| URL → markdown only | Firecrawl |
| Cited answers / monitoring | Parallel |

## Setup

1. Create project + API key at Browserbase.  
2. Convex env: `BROWSERBASE_API_KEY`, optional `BROWSERBASE_PROJECT_ID`.  
3. Create a session via `api.webTools.createSession`, then drive it with Stagehand / Playwright CDP using `connectUrl` **inside a sandbox** (`@studio/ai-runtime`).

## Runtime pattern

1. `createBrowserSession` → `{ id, connectUrl }`  
2. `createSandbox` / `execInSandbox` with Stagehand or Playwright connected to `connectUrl`  
3. Meter credits around browser minutes + model calls (Effect fence)  
4. Destroy session when done  

Never put Browserbase keys in the client bundle.

## Done when

`createSession` returns an id with keys set; agent automation runs only in sandbox; keys absent → clear CONFIG error.
