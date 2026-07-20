# Studio Product Framework — Builder Agent Guide

You are working in a **pnpm + Turborepo** monorepo for **AI-native companies**. Prefer this file + `docs/architecture.md` + `docs/capabilities.md` before large changes.

## Repo map

| Path | Purpose |
|------|---------|
| `apps/web` | Reference product (React Router 7 + Convex + Clerk) |
| `packages/core` | `Result`, `StudioError` |
| `packages/auth` | Identity types + `requireIdentity` |
| `packages/billing` | Polar / Stripe / Autumn blocks |
| `packages/effect-critical` | Effect: wallet, inference, delivery |
| `packages/ai-runtime` | Sandbox + model gateway + run lifecycle |
| `packages/observability` | PostHog / Sentry contracts + `StudioEvents` |
| `packages/email` | Transactional email blocks |
| `packages/storage` | Signed upload / public URL blocks |
| `packages/flags` | Feature flag evaluation shape |
| `packages/ratelimit` | Rate limit assertion shape |
| `agents/skills` | Task playbooks (Rams, greploop, research, score-problem) |
| `agents/loops` | Engineered loops (discover/commit, ship, build, improve, operate) |
| `agents/context/` | Principles, research queue, learnings, discovery gate |
| `docs/` | Architecture + capabilities + loop engineering |

## Hard rules

1. **Client never talks to the DB** — only Convex queries/mutations/actions/HTTP.
2. **No god services** — composable capability blocks, explicit params, structured returns.
3. **Effect only for money / inference / delivery**.
4. **Runtime agents require sandboxes** — never untrusted work inline in Convex.
5. **Domain policy stays in apps/Convex** — packages must not reach into tables.
6. **Validate public Convex args + returns**; await all promises.
7. Prefer indexes over `.filter()`; paginate unbounded lists.
8. **Observability:** PostHog for product events/flags; Sentry for exceptions.
9. **Reviews:** Rams (design) + Greptile/greploop (code) before merge.
10. **Loop engineering:** bounded recursion, research queue, no auto-merge — see `docs/loop-engineering.md`.
11. **Venture commit gate:** `commit-v1` before bootstrap for customer products — `agents/context/discovery/`.

## Skills & loops (use these)

| Skill / loop | When |
|--------------|------|
| `agents/skills/rams.md` | UI / design review |
| `agents/skills/greploop.md` | Clear Greptile to 5/5 |
| `agents/skills/check-pr.md` | PR hygiene |
| `agents/skills/research.md` | Auto-research → research queue |
| `agents/skills/score-problem.md` | Problem scorecard + evidence ladder |
| `agents/skills/add-capability.md` | New package |
| `agents/skills/add-billing-provider.md` | Billing wiring |
| `agents/skills/add-runtime-agent-tool.md` | Agent tools |
| `agents/skills/add-convex-component.md` | Add Convex component |
| `agents/loops/commit-v1.md` | Commit gate before venture build |
| `agents/loops/bootstrap-ai-product.md` | New product standup |
| `agents/loops/scaffold-product-feature.md` | Feature vertical |
| `agents/loops/ship-ready-pr.md` | Merge-ready PR |
| `agents/loops/improve-framework.md` | Self-recursive framework improve |
| `agents/loops/operate-handover.md` | Client/operator handover (self-serve) |

## External apps to install on the GitHub repo

1. [Greptile](https://www.greptile.com) — code review  
2. [Rams](https://www.rams.ai) — design review  

## Commands

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm dev:web
```

Convex (dev only): `cd apps/web && npx convex dev` — never `convex deploy` unless production.
