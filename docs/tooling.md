# Tooling — reviews, analytics, errors, shared agent memory

## Hivemind (shared agent memory) — required for the team

- **Product:** https://deeplake.ai/hivemind — cloud-backed capture/recall across Cursor, Claude Code, Codex, and other agents  
- **Team runbook (share with engineers):** [hivemind.md](./hivemind.md)  
- **Agent skill:** `agents/skills/hivemind.md`  
- **Repo pin:** committed `.hivemind` → workspace `studio-product-framework` (see `.hivemind.example`)  
- **When:** always on for normal SPF work; opt out only for sensitive trees/sessions  

**Doctrine:** Hivemind compounds session memory and emergent skills across the team. Git (`agents/`, `docs/`) stays the source of truth for hard rules and durable playbooks — promote keepers from Hivemind into PRs.

Install (each engineer): `curl -fsSL https://deeplake.ai/hivemind.sh | sh` → login → restart assistants → trust hooks. Admin creates the org/workspace and fills `orgId` in `.hivemind` — details in [hivemind.md](./hivemind.md).

## Rams (design review)

- **Product:** https://www.rams.ai — GitHub App, reviews UI on every PR  
- **Local/agent skill:** `agents/skills/rams.md`  
- **When:** any UI change; always before merge via `ship-ready-pr` loop  

Install: Rams GitHub App → select this repo → open a PR.

## Greptile + greploop (code review)

- **Product:** https://www.greptile.com — GitHub App, full-repo context reviews  
- **Agent skill:** `agents/skills/greploop.md` (iterate to 5/5)  
- **Also:** `agents/skills/check-pr.md`  
- Upstream skills: https://github.com/greptileai/skills  

Install: Greptile GitHub App → enable repo → PRs auto-reviewed. Agents run `/greploop` (or follow the skill) to clear comments.

## Aikido (security + AI pentest)

- **Product:** https://www.aikido.dev — code/cloud/runtime security + AI-assisted pentesting  
- **Agent skill:** `agents/skills/aikido.md`  
- **When:** continuous on PRs; Attack pentest before major launches / handover  

Install: Aikido → connect GitHub org/repo → enable PR checks. Clear critical/high before merge; link pentest reports in release notes when used.

## Langfuse (LLM observability)

- **Product:** https://langfuse.com — traces, token/cost, prompts, evals for LLM apps  
- **Agent skill:** `agents/skills/langfuse.md`  
- **Env:** `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL` (server-side only)  
- **Split:** PostHog = product; Sentry = errors; Langfuse = model traces  
- **Shipped:** `runMeteredInference` traces via `@studio/observability/langfuse` when keys are set  

Wire additional inference / runtime-agent entry points the same way.

## Ponytail (token-efficient agent coding)

- **Product:** https://ponytail.dev · https://github.com/dietrichgebert/ponytail  
- **Agent skill:** `agents/skills/ponytail.md`  
- **When:** default intensity `full` for builder agents; never drop security/validation  
- **Infused:** required before large codegen; step 2 of `ship-ready-pr`; aligns with Superpowers YAGNI (smaller correct diff wins)

Install upstream skill per engineer; keep the SPF skill as the repo reminder.

## Superpowers (builder harness)

- **Product:** https://github.com/obra/superpowers  
- **Agent skill:** `agents/skills/superpowers.md`  
- **When:** brainstorm → plan → TDD → subagents for day-to-day coding  
- **Does not replace:** Greptile / Rams / Aikido / Convex hard rules  

Install the plugin in your harness (`/add-plugin superpowers` in Cursor). Map finishes into `ship-ready-pr`.

## Compound engineering (methodology loop)

- **Doctrine:** https://every.to/guides/compound-engineering  
- **SPF loop:** `agents/loops/compound-engineering.md` (Plan → Work → Review → **Compound**)  
- **Compound ≠ Hivemind:** Hivemind = session memory; Compound = promote learnings into git skills/packages  

## Web tools (Firecrawl · Parallel · Browserbase)

Decision matrix — pick one primary tool per job:

| Job | Use | Skill | Convex / package |
|-----|-----|-------|------------------|
| URL → clean markdown | **Firecrawl** | `firecrawl.md` | `api.webTools.scrape` / `scrapeUrl` |
| Cited search / research / enrich | **Parallel** | `parallel.md` | `api.webTools.search` / `searchWeb` |
| Act in a real browser | **Browserbase** | `browserbase.md` | `api.webTools.createSession` / `createBrowserSession` |

Package: `@studio/web-tools`. Env: `FIRECRAWL_API_KEY`, `PARALLEL_API_KEY`, `BROWSERBASE_API_KEY` (+ optional `BROWSERBASE_PROJECT_ID`).

**Overlap:** all three touch “the web.” Do not scrape with Browserbase or deep-research with Firecrawl when Parallel Search suffices. `research` skill prefers Parallel → Firecrawl.

## PostHog (product analytics + flags)

- Env: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`  
- Wired in `ObservabilityProvider`  
- Event names: `@studio/observability` → `StudioEvents`  
- Feature flags: evaluate server-side for billing/agent gates (`@studio/flags`)

## Sentry (errors)

- Env: `NEXT_PUBLIC_SENTRY_DSN` (browser); add server DSN in Convex when wiring Node actions  
- Error boundary reports via `captureAppException`  
- Use for production failures; pair with PostHog for product funnels

## Vercel Analytics

Mounted in `app/layout.tsx` for web vitals. PostHog owns product analytics; Sentry owns exceptions.

## Loop engineering (research + self-improve)

- **Doctrine:** [loop-engineering.md](./loop-engineering.md)
- **Venture commit:** `agents/skills/score-problem.md` → `agents/loops/commit-v1.md` → `agents/context/discovery/`
- **Research skill:** `agents/skills/research.md` → `agents/context/research-queue.md`
- **Improve loop:** `agents/loops/improve-framework.md` (bounded recursion; no auto-merge)
- **Handover:** `agents/loops/operate-handover.md` — operators run loops after 1–2 Studio iterations
- **Memory (git-audited):** `agents/context/learnings.md` — blocked notes, scorecard evidence; not a second database  
- **Memory (session/team):** Hivemind — traces + summaries across agents; see [hivemind.md](./hivemind.md)

Cadence: before venture build → commit-v1; every PR → ship-ready; weekly/on-demand → research then one improve outer iter. Use Cursor `/loop` if you want a heartbeat — do not invent a parallel orchestration runtime. Keep Hivemind capture on so ship/improve sessions compound for the next engineer.
