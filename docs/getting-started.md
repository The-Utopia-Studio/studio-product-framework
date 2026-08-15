# Getting started

**Fastest path:** `npx github:The-Utopia-Studio/studio_product_framework_setter` — a separate guided-setup wizard that clones this template into a new repo for your product and walks you through Clerk, Convex, and the optional integrations in a browser UI (~10 min). The steps below are the manual/reference version of the same process.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 10+
- Clerk, Convex accounts
- Billing keys as needed (Polar and/or Stripe and/or Autumn)
- PostHog + Sentry projects (recommended)
- OpenRouter (or OpenAI) for inference
- Optional: sandbox provider credentials for runtime agents
- GitHub: install **Greptile** + **Rams** apps on the repo
- **Hivemind** (required for team agents): follow [hivemind.md](./hivemind.md) — install CLI, login to Utopia org / `studio-product-framework` workspace, restart Cursor

## Install

```bash
pnpm install
```

Shared agent memory (each engineer, after org exists):

```bash
curl -fsSL https://deeplake.ai/hivemind.sh | sh
# restart Cursor; trust hooks; confirm with: hivemind status
```

## Configure the reference app

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in Convex, Clerk, billing, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, and model keys.

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
Then `agents/loops/bootstrap-ai-product.md`, then prefer `agents/loops/compound-engineering.md` for features, and `agents/loops/ship-ready-pr.md` before merge (Ponytail → Rams → CI → greploop → Aikido).

Install tooling: Greptile + Rams + Aikido on GitHub; Langfuse keys; Ponytail + Superpowers; Firecrawl/Parallel/Browserbase as needed — see [tooling.md](./tooling.md).

Ongoing improve: `agents/skills/research.md` → `agents/loops/improve-framework.md`.  
Client handover: `agents/loops/operate-handover.md` (1–2 feedback iterations, then they operate).

See [architecture.md](./architecture.md), [capabilities.md](./capabilities.md), [loop-engineering.md](./loop-engineering.md).  
Visual overview: [diagrams/spf-offering.html](./diagrams/spf-offering.html) · [framework stack](./diagrams/spf-framework-stack.html) · [solution architecture](./diagrams/spf-architecture.html)  
Discovery playbook (external): [Icarus](https://the-utopia-studio.github.io/Icarus/).
