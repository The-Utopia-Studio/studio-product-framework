# Studio Product Framework

Lift-and-use foundation for **AI-native companies** — Next.js product surface, Convex control plane, Effect fence for money/inference, dual billing (subscriptions + credits), and an agent OS that compounds: commit → build → ship → research → improve → handover.

## Why this exists

Teams rebuilding auth, billing, agents, observability, and review workflows for every product waste the advantage of AI-native shipping. This monorepo is the shared system: compose packages, build in `apps/*`, let agents use the same structure humans do — and keep improving via **research → improve → ship** without a human owning continuous polish. After delivery, operators run the same loops (we do not sell endless minor tweaks).

## What you get

| Layer | Stack |
|-------|--------|
| Product | Next.js App Router · Clerk · Vercel |
| Control plane | Convex (queries, mutations, actions, components) |
| Money | Polar / Stripe subscriptions · Autumn credits · Effect wallet |
| Inference | OpenRouter · Langfuse traces · metered chat vertical |
| Runtime agents | `@studio/ai-runtime` (sandbox + gateway) |
| Web for agents | Parallel (research) · Firecrawl (scrape) · Browserbase (act) |
| Quality OS | Rams · Greptile · Aikido · Ponytail · Superpowers |
| Compound habit | Plan → Work → Review → Compound + Hivemind memory |

External site (GitHub Pages): [the-utopia-studio.github.io/studio-product-framework](https://the-utopia-studio.github.io/studio-product-framework/) — enable Pages in repo settings on first deploy.

Visual: [docs/diagrams/spf-offering.html](./docs/diagrams/spf-offering.html) · [framework stack](./docs/diagrams/spf-framework-stack.html) · source in [`site/`](./site/)

## Capability stack

| Need | Use |
|------|-----|
| Auth | Clerk + `@studio/auth` |
| Backend | Convex |
| Subscriptions | Polar **and/or** Stripe (`@studio/billing`) |
| Credits | Autumn component + Effect wallet ledger |
| Rate limits | `@convex-dev/rate-limiter` component |
| Components | https://www.convex.dev/components — see `docs/convex-components.md` |
| Runtime agents | `@studio/ai-runtime` (sandbox + OpenRouter) |
| Analytics | **PostHog** (`@studio/observability`) |
| Errors | **Sentry** |
| LLM traces | **Langfuse** (wired on metered inference) |
| Web scrape | **Firecrawl** + `@studio/web-tools` |
| Cited research | **Parallel** + `@studio/web-tools` |
| Browser agents | **Browserbase** + `@studio/web-tools` |
| Email / files / flags / rate limits | `@studio/email`, `storage`, `flags`, `ratelimit` |
| Design review | **Rams** (GitHub App) + `agents/skills/rams.md` |
| Code review | **Greptile** + **greploop** skill |
| Security / pentest | **Aikido** + `agents/skills/aikido.md` |
| Token-efficient agents | **Ponytail** + `agents/skills/ponytail.md` |
| Builder harness | **Superpowers** + `agents/skills/superpowers.md` |
| Compound features | `agents/loops/compound-engineering.md` |
| Auto-research / self-improve | `research` skill → `improve-framework` loop |
| Venture commit gate | `score-problem` → `commit-v1` + `agents/context/discovery/` |
| Operate / handover | `operate-handover` loop |
| Deploy | Vercel |

Full map: [docs/capabilities.md](./docs/capabilities.md) · Tooling: [docs/tooling.md](./docs/tooling.md)

## Quick start

**Fastest path:** `npx github:The-Utopia-Studio/studio_product_framework_setter` — a separate, guided setup wizard that clones this template into a new repo for your product and walks you through Clerk, Convex, and the rest (~10 min, no manual env-var copying). Manual steps below.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# fill Clerk, Convex, billing, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_SENTRY_DSN, model keys

cd apps/web && npx convex dev   # terminal 1
pnpm dev:web                    # terminal 2  → http://localhost:3000
```

Then on GitHub: install **Greptile** + **Rams** + **Aikido**. Per engineer: **Ponytail** + **Superpowers**. Wire **Langfuse** + web keys (**Firecrawl** / **Parallel** / **Browserbase**) as needed. Ship features with the `compound-engineering` loop.

Bootstrap: `agents/loops/bootstrap-ai-product.md` · Venture commit gate: `agents/loops/commit-v1.md` · Loop doctrine: `docs/loop-engineering.md` · Improve: `agents/loops/improve-framework.md`.

Discovery playbook (Utopia): [Icarus](https://the-utopia-studio.github.io/Icarus/) — SPF holds the **commit artifacts**, not a second copy of the playbook.

## Repository layout

```
apps/web                 Next.js + Convex reference product
packages/*               Composable capabilities (+ web-tools, observability)
agents/                  Builder skills + engineered loops
docs/                    Architecture, capabilities, tooling, diagrams
.github/                 CI + PR template
.cursor/rules/           Cursor project rules
```

## Commands

```bash
pnpm dev:web
pnpm typecheck
pnpm lint
pnpm build
```

## Architecture (one sentence)

**Apps orchestrate; packages compose; Effect fences money/inference/delivery; Langfuse/PostHog/Sentry observe; Rams + Greptile + Aikido review; Parallel/Firecrawl/Browserbase feed the web; builder agents use `agents/`, runtime agents use `@studio/ai-runtime`.**

See [docs/architecture.md](./docs/architecture.md), [docs/production-readiness.md](./docs/production-readiness.md), and [agents/AGENTS.md](./agents/AGENTS.md).
