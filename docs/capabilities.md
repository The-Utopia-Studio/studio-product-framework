# Capability catalog — lift and use

Everything an AI-native company typically needs, mapped to Studio packages and external tools.

Status key: **Shipped** (wired in reference app) · **Port** (package API ready, wire SDK in Convex) · **Process** (install external app / follow skill)

## Product platform

| Capability | Package / tool | Status |
|------------|----------------|--------|
| Auth & identity | Clerk + `@studio/auth` | **Shipped** (Clerk); auth package = contracts |
| Realtime backend / DB | Convex | **Shipped** |
| Subscriptions (Polar) | `@studio/billing` + app Polar wiring | **Shipped** (app); migrate callers into package adapters next |
| Subscriptions (Stripe) | `@studio/billing` Stripe port | **Port** |
| Credits (Autumn) | `@useautumn/convex` + Effect wallet | **Shipped** (component wired; needs `AUTUMN_SECRET_KEY`) |
| Local credit ledger | `convex/wallet` + Effect | **Shipped** (starter credits on signup) |
| Metered inference | `inference.runMeteredInference` | **Shipped** (rate limit → debit → OpenRouter) |
| Rate limiting | `@convex-dev/rate-limiter` | **Shipped** |
| Runtime agents | `@studio/ai-runtime` | **Port** (sandbox required) |
| Critical money/inference/delivery | `@studio/effect-critical` | **Shipped** (`debitAndInfer` vertical) |
| Email | `@studio/email` | **Port** |
| File storage | `@studio/storage` | **Port** |
| Feature flags | `@studio/flags` (+ PostHog) | **Port** |
| Rate limiting | `@studio/ratelimit` | **Port** |
| Analytics | `@studio/observability` + PostHog | **Shipped** (browser; env optional) |
| Errors | `@studio/observability` + Sentry | **Shipped** (browser; env optional) |
| LLM traces / cost | Langfuse via `@studio/observability/langfuse` | **Shipped** (metered inference; keys optional) |
| Web scrape (URL → md) | Firecrawl + `@studio/web-tools` + `webTools.scrape` | **Shipped** (needs `FIRECRAWL_API_KEY`) |
| Cited web search / research | Parallel + `@studio/web-tools` + `webTools.search` | **Shipped** (needs `PARALLEL_API_KEY`) |
| Browser-as-a-service | Browserbase + `@studio/web-tools` + `webTools.createSession` | **Shipped** (session create; drive in sandbox) |
| Deploy | Vercel | **Shipped** (preset) |

## Builder / quality OS

| Capability | Where | Status |
|------------|--------|--------|
| Agent instructions | `AGENTS.md`, `agents/` | **Shipped** |
| Skills / loops | `agents/skills`, `agents/loops` | **Shipped** |
| Loop engineering doctrine | `docs/loop-engineering.md` | **Shipped** |
| Fellow Day-0 / env tiers | `docs/fellow-day-0.md` | **Shipped** (docs) |
| Engineering blueprint (80/90 stack) | `docs/engineering-blueprint.md` | **Shipped** (docs) |
| AI-in-workflow doctrine | `docs/ai-in-workflow.md` | **Shipped** (docs) |
| Design system plug / generate | `agents/loops/integrate-design-system.md` + `agents/skills/plug-design-system.md` | **Shipped** (process; starter UI still Apple/shadcn until plugged) |
| Compound engineering loop | `agents/loops/compound-engineering.md` | **Shipped** (docs; agent-run) |
| Superpowers harness | `agents/skills/superpowers.md` + upstream plugin | **Process** (install per harness) |
| Commit gate (Icarus → artifacts) | `agents/loops/commit-v1.md`, `agents/context/discovery/`, `scripts/check-commit-gate.mjs`, CI `commit-gate` job | **Shipped** (CI blocks a PR that touches `agents/context/discovery/` unless score ≥32 and all three artifacts are human-signed; platform-only PRs never touch those files, so the gate never fires for framework plumbing, per its own documented exception) |
| Problem score / evidence | `agents/skills/score-problem.md` | **Shipped** |
| Auto-research → queue | `agents/skills/research.md` (+ Parallel/Firecrawl) | **Shipped** |
| Self-improve loop | `agents/loops/improve-framework.md` | **Shipped** (docs; agent-run) |
| Operate / handover | `agents/loops/operate-handover.md` | **Shipped** |
| Design review | Rams GitHub App + `agents/skills/rams.md` | **Process** (no GitHub App installed in this repo; CI's `ship-bar-checklist` job blocks merge until a human ticks the PR checkbox, but does not itself verify a design review happened) |
| Code review | Greptile + `agents/skills/greploop.md` | **Process** (same caveat — checkbox enforced, tool not live) |
| Security / pentest | Aikido + `agents/skills/aikido.md` | **Process** (same caveat — checkbox enforced, tool not live) |
| Token-efficient codegen | Ponytail + `agents/skills/ponytail.md` | **Process** (install skill; infused in ship-ready) |
| Shared agent memory | Hivemind + `docs/hivemind.md` + `agents/skills/hivemind.md` | **Process** (team install) |
| Ship-ready loop | `agents/loops/ship-ready-pr.md` | **Shipped** (docs) |
| CI | `.github/workflows/ci.yml` | **Shipped** |
| Lint / types | ESLint + `pnpm typecheck` | **Shipped** (strict on packages) |

## Recommended Convex components (add when needed)

Workflow · Workpool · R2 · RAG · Autumn · `@convex-dev/ratelimiter`

## What “lift and use” means today

**Fellows:** follow [fellow-day-0.md](./fellow-day-0.md) end-to-end.

1. `commit-v1` + fill [engineering-blueprint.md](./engineering-blueprint.md) (80/90 defaults)  
2. Clone / fork monorepo; fill env **by tier** (see `.env.example` + fellow Day-0)  
3. `integrate-design-system` — Utopia DS / designer pack / generate ([utopia-design-system.vercel.app](https://utopia-design-system.vercel.app/))  
4. Install Greptile + Rams + Aikido on GitHub  
5. Install Hivemind and join the correct workspace ([hivemind.md](./hivemind.md))  
6. Install Ponytail + Superpowers for builder agents  
7. `pnpm install` + Convex + `pnpm dev:web`  
8. First vertical = golden-case **job** ([ai-in-workflow.md](./ai-in-workflow.md)) — chat is a mechanic demo, not the default product  
9. Features: prefer `agents/loops/compound-engineering.md` so each change compounds  

See [production-readiness.md](./production-readiness.md) for the honest scorecard.  
Convex components guide: [convex-components.md](./convex-components.md) · catalog: https://www.convex.dev/components
