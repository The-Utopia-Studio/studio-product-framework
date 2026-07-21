# Getting started

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 10+
- Clerk, Convex accounts
- Billing keys as needed (Polar and/or Stripe and/or Autumn)
- PostHog + Sentry projects (recommended)
- OpenRouter (or OpenAI) for inference
- Optional: sandbox provider credentials for runtime agents
- GitHub: install **Greptile** + **Rams** apps on the repo

## Install

```bash
pnpm install
```

## Configure the reference app

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in Convex, Clerk, billing, `VITE_POSTHOG_KEY`, `VITE_SENTRY_DSN`, and model keys.

## Develop

```bash
# Terminal 1 — Convex (from apps/web)
cd apps/web && npx convex dev

# Terminal 2 — web app
pnpm dev:web
```

## Workspace commands

| Command | Purpose |
|---------|---------|
| `pnpm dev:web` | Run reference app |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm lint` | ESLint |
| `pnpm build` | Build all packages/apps |

## Where to put work

| Change | Location |
|--------|----------|
| Product UI / routes | `apps/web` |
| Shared Result/errors | `packages/core` |
| Auth contracts | `packages/auth` |
| Checkout / entitlements / credits | `packages/billing` |
| Wallet / inference / delivery | `packages/effect-critical` |
| Runtime agent sandbox + gateway | `packages/ai-runtime` |
| Analytics / errors | `packages/observability` |
| Email / storage / flags / rate limits | matching `packages/*` |
| Builder skills / loops | `agents/` |

## First ship

Use `agents/loops/commit-v1.md` before a venture bootstrap (scorecard → evidence → eval-first spec).  
Then `agents/loops/bootstrap-ai-product.md`, then `agents/loops/ship-ready-pr.md` (Rams → CI → greploop).

Ongoing improve: `agents/skills/research.md` → `agents/loops/improve-framework.md`.  
Client handover: `agents/loops/operate-handover.md` (1–2 feedback iterations, then they operate).

See [architecture.md](./architecture.md), [capabilities.md](./capabilities.md), [loop-engineering.md](./loop-engineering.md).  
Visual overview: [diagrams/spf-architecture.html](./diagrams/spf-architecture.html)  
Discovery playbook (external): [Icarus](https://the-utopia-studio.github.io/Icarus/).
