---
name: parallel
description: >
  Cited web search / deep research via Parallel.ai. Prefer for research skills
  and grounding answers. Use Firecrawl for single-URL scrape; Browserbase to act.
---

# Parallel

**Product:** https://parallel.ai · Onboard: https://parallel.ai/agents.md  
**Package:** `@studio/web-tools` → `searchWeb`  
**Convex:** `api.webTools.search` (authenticated)

## When to use

| Job | Tool |
|-----|------|
| Cited search / research / enrich / monitor | **Parallel** |
| Single URL → markdown | Firecrawl |
| Interactive browser | Browserbase |

## Setup

1. Get an API key from https://platform.parallel.ai/  
2. Convex env: `PARALLEL_API_KEY`  
3. Optional: follow https://parallel.ai/agents.md for CLI/agent install in your harness  

## Builder research (required path)

When `research` skill needs live web evidence beyond our dep changelogs:

1. Call Parallel Search (`searchWeb` / `api.webTools.search`) with a concrete objective.  
2. Cite hit URLs in the research-queue item.  
3. If you need full page body of one hit → Firecrawl scrape that URL.

## Runtime

Expose as an agent tool with credit metering. Prefer Parallel over inventing a crawl loop.

## Done when

Search returns hits with keys set; research queue items include Parallel citations when web evidence was used.
