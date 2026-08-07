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
| Deploy | Vercel | **Shipped** (preset) |

## Builder / quality OS

| Capability | Where | Status |
|------------|--------|--------|
| Agent instructions | `AGENTS.md`, `agents/` | **Shipped** |
| Skills / loops | `agents/skills`, `agents/loops` | **Shipped** |
| Loop engineering doctrine | `docs/loop-engineering.md` | **Shipped** |
| Commit gate (Icarus → artifacts) | `agents/loops/commit-v1.md`, `agents/context/discovery/` | **Shipped** |
| Problem score / evidence | `agents/skills/score-problem.md` | **Shipped** |
| Auto-research → queue | `agents/skills/research.md`, `agents/context/research-queue.md` | **Shipped** |
| Self-improve loop | `agents/loops/improve-framework.md` | **Shipped** (docs; agent-run) |
| Operate / handover | `agents/loops/operate-handover.md` | **Shipped** |
| Design review | Rams GitHub App + `agents/skills/rams.md` | **Process** |
| Code review | Greptile + `agents/skills/greploop.md` | **Process** |
| Shared agent memory | Hivemind + `docs/hivemind.md` + `agents/skills/hivemind.md` | **Process** (team install) |
| Ship-ready loop | `agents/loops/ship-ready-pr.md` | **Shipped** (docs) |
| CI | `.github/workflows/ci.yml` | **Shipped** |
| Lint / types | ESLint + `pnpm typecheck` | **Shipped** (strict on packages) |

## Recommended Convex components (add when needed)

Workflow · Workpool · R2 · RAG · Autumn · `@convex-dev/ratelimiter`

## What “lift and use” means today

1. Clone monorepo  
2. Fill env (Clerk, Convex, Polar, PostHog, Sentry)  
3. Install Greptile + Rams on GitHub  
4. Install Hivemind and join the team workspace ([hivemind.md](./hivemind.md))  
5. `pnpm install` + Convex + `pnpm dev:web`  
6. Build product in `apps/*` using packages — don’t fork mechanics  

See [production-readiness.md](./production-readiness.md) for the honest scorecard.  
Convex components guide: [convex-components.md](./convex-components.md) · catalog: https://www.convex.dev/components
