# Studio Product Framework — Builder Agent Guide

You are working in a **pnpm + Turborepo** monorepo for **AI-native companies**. Prefer this file + `docs/architecture.md` + `docs/capabilities.md` before large changes.

## Repo map

| Path | Purpose |
|------|---------|
| `apps/web` | Reference product (Next.js App Router + Convex + Clerk) |
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
| `agents/skills` | Task playbooks (Rams, greploop, aikido, langfuse, ponytail, superpowers, firecrawl, parallel, browserbase, research, …) |
| `agents/loops` | Engineered loops (discover/commit, ship, build, improve, operate) |
| `agents/context/` | Principles, research queue, learnings, discovery gate |
| `docs/` | Architecture + capabilities + loop engineering + Hivemind |

## Hard rules

1. **Client never talks to the DB** — only Convex queries/mutations/actions/HTTP.
2. **No god services** — composable capability blocks, explicit params, structured returns.
3. **Effect only for money / inference / delivery**.
4. **Runtime agents require sandboxes** — never untrusted work inline in Convex.
5. **Domain policy stays in apps/Convex** — packages must not reach into tables.
6. **Validate public Convex args + returns**; await all promises.
7. Prefer indexes over `.filter()`; paginate unbounded lists.
8. **Observability:** PostHog for product events/flags; Sentry for exceptions; Langfuse for LLM traces/cost.
9. **Reviews:** Rams (design) + Greptile/greploop (code) + Aikido (security) before merge.
10. **Loop engineering:** bounded recursion, research queue, no auto-merge — see `docs/loop-engineering.md`.
11. **Venture commit gate:** `commit-v1` before bootstrap for customer products — `agents/context/discovery/`.
12. **Shared agent memory:** Hivemind on by default (`.hivemind` → `studio-product-framework`); git remains durable truth — see `docs/hivemind.md`.
13. **Token discipline:** Ponytail ladder (`full`) — smallest correct diff; never drop validation/security.

## Skills & loops (use these)

| Skill / loop | When |
|--------------|------|
| `agents/skills/rams.md` | UI / design review |
| `agents/skills/greploop.md` | Clear Greptile to 5/5 |
| `agents/skills/aikido.md` | Clear Aikido security / pentest findings |
| `agents/skills/langfuse.md` | LLM traces / cost on inference path |
| `agents/skills/ponytail.md` | Token-efficient codegen (lazy senior ladder) |
| `agents/skills/superpowers.md` | Install/use obra/superpowers harness |
| `agents/skills/firecrawl.md` | URL → markdown scrape |
| `agents/skills/parallel.md` | Cited web search / research |
| `agents/skills/browserbase.md` | Real browser sessions for agents |
| `agents/skills/check-pr.md` | PR hygiene |
| `agents/skills/hivemind.md` | Shared memory setup / doctrine / promote-to-git |
| `agents/skills/research.md` | Auto-research → research queue |
| `agents/skills/score-problem.md` | Problem scorecard + evidence ladder |
| `agents/skills/add-capability.md` | New package |
| `agents/skills/add-billing-provider.md` | Billing wiring |
| `agents/skills/add-runtime-agent-tool.md` | Agent tools |
| `agents/skills/add-convex-component.md` | Add Convex component |
| `agents/loops/commit-v1.md` | Commit gate before venture build |
| `agents/loops/bootstrap-ai-product.md` | New product standup |
| `agents/loops/scaffold-product-feature.md` | Feature vertical |
| `agents/loops/compound-engineering.md` | Plan → Work → Review → Compound |
| `agents/loops/ship-ready-pr.md` | Merge-ready PR |
| `agents/loops/improve-framework.md` | Self-recursive framework improve |
| `agents/loops/operate-handover.md` | Client/operator handover (self-serve) |

## External apps to install on the GitHub repo

1. [Greptile](https://www.greptile.com) — code review  
2. [Rams](https://www.rams.ai) — design review  
3. [Aikido](https://www.aikido.dev) — security scanning + AI pentest  

Also per engineer: [Langfuse](https://langfuse.com) · [Ponytail](https://ponytail.dev) · [Superpowers](https://github.com/obra/superpowers) · web keys ([Firecrawl](https://www.firecrawl.dev) / [Parallel](https://parallel.ai) / [Browserbase](https://www.browserbase.com)) as needed.

## Shared agent memory (every engineer)

1. Follow [docs/hivemind.md](../docs/hivemind.md) — install, login, restart, smoke test  
2. Keep capture on for SPF work; venture isolation via separate Deeplake workspaces

## Commands

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm dev:web
```

Convex (dev only): `cd apps/web && npx convex dev` — never `convex deploy` unless production.
