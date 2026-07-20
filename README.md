# Studio Product Framework

Lift-and-use foundation for **AI-native companies** — composable capabilities, Convex control plane, Effect fence for money/inference, and an agent OS (skills, bounded self-improve loops, Rams + Greptile).

## Why this exists

Teams rebuilding auth, billing, agents, observability, and review workflows for every product waste the advantage of AI-native shipping. This monorepo is the shared system: compose packages, build the product in `apps/*`, let agents use the same structure humans do — and **keep improving via research → improve → ship** without a human owning continuous maintenance. After delivery, operators run the same loops (we do not sell endless minor tweaks).

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
| Email / files / flags / rate limits | `@studio/email`, `storage`, `flags`, `ratelimit` |
| Design review | **Rams** (GitHub App) + `agents/skills/rams.md` |
| Code review | **Greptile** + **greploop** skill |
| Auto-research / self-improve | `research` skill → `improve-framework` loop |
| Operate / handover | `operate-handover` loop |
| Deploy | Vercel |

Full map: [docs/capabilities.md](./docs/capabilities.md) · Tooling: [docs/tooling.md](./docs/tooling.md)

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# fill Clerk, Convex, billing, VITE_POSTHOG_KEY, VITE_SENTRY_DSN, model keys

cd apps/web && npx convex dev   # terminal 1
pnpm dev:web                    # terminal 2
```

Then on GitHub: install **Greptile** + **Rams** apps on the repo.

Bootstrap: `agents/loops/bootstrap-ai-product.md` · Venture commit gate: `agents/loops/commit-v1.md` · Loop doctrine: `docs/loop-engineering.md` · Improve: `agents/loops/improve-framework.md`.

Discovery playbook (Utopia): [Icarus](https://the-utopia-studio.github.io/Icarus/) — SPF holds the **commit artifacts**, not a second copy of the playbook.

## Repository layout

```
apps/web                 Reference product
packages/*               Composable capabilities
agents/                  Builder-agent skills + loops
docs/                    Architecture + capability catalog
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

**Apps orchestrate domain rules; packages expose reusable mechanics; Effect fences money/inference/delivery; PostHog/Sentry observe; Rams + Greptile review; builder agents use `agents/`, runtime agents use `@studio/ai-runtime`.**

See [docs/architecture.md](./docs/architecture.md), [docs/production-readiness.md](./docs/production-readiness.md), and [agents/AGENTS.md](./agents/AGENTS.md).
