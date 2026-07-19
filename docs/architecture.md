# Studio Product Framework — Architecture

Production-grade, composable framework for building SaaS and credit-metered AI products on a high abstraction rung (Convex, Clerk, Vercel).

## Non-negotiables

| Layer | Cannot fail | Can be imperfect |
|--------|-------------|------------------|
| **Framework** | Safe composition, clear boundaries, maintainability | Fancy DX sugar |
| **Subscription products** | Entitlements + webhooks | Settings page polish |
| **Credit / agent products** | Money (wallet) + inference brokerage | Non-critical UI latency |

Every design choice trades off scalability, reliability, performance, cost, and maintainability. Name the non-negotiable first; the rest follows.

## Abstraction ladder

Default: **managed backends** (Convex + Clerk + Vercel). Do not drop to raw cloud/metal unless there is a hard constraint.

Convex is the **control plane**: queries, mutations, actions, and components (Polar, Workflow, Workpool, R2, RAG, Autumn, etc.). Nearly everything routes through it.

## Layering

```
Application (apps/*)     → why/when: domain rules, authz, status transitions
Capabilities (packages/*)→ how: composable ops, explicit inputs, structured results
Effect fence             → money, inference, delivery only
Platform                 → Convex / Clerk / billing providers / sandboxes
```

**Rule:** Actions orchestrate. Services do not mutate domain DB tables directly.

## Client never touches the database

Clients call Convex functions (or HTTP actions). Auth, validation, and rate limits live on the server. Managed backends make shortcuts tempting — do not take them.

## Billing capabilities (all first-class)

| Provider | Shape |
|----------|--------|
| **Polar** | Subscriptions (existing reference wiring) |
| **Stripe** | Subscriptions / payments |
| **Autumn** | Credit metering |

Credit **ledger truth** for money-critical paths lives behind `@studio/effect-critical` (wallet). Reconcile provider balances against the ledger deliberately.

## Effect fence

Use Effect **only** where a bug costs money or trust:

- Wallet debit / credit / reconcile
- Inference brokerage (e.g. OpenRouter)
- Delivery channels that must not silently fail

Everywhere else: Convex + TypeScript is enough. Ceremony is not free.

**Call shape:** Convex action (orchestration) → Effect program (critical path) → mutation (persist durable app state).

## Two kinds of agents

| Kind | Package / folder | Job |
|------|------------------|-----|
| **Builder agent** | `agents/` | Writes product code; uses monorepo context, skills, loops |
| **Runtime agent** | `@studio/ai-runtime` | Acts for end users in sandboxes; meters credits; calls models |

Do not conflate them in docs or APIs.

## Monorepo (agent-native)

One Turborepo so coding agents see web + packages + Convex + agent config in one context window. Structure is for humans **and** models.

```
apps/web                 Reference product (React Router + Convex)
packages/core            Result / error primitives
packages/auth            Identity contracts + guards
packages/billing         Polar / Stripe / Autumn capability blocks
packages/effect-critical Effect: wallet, inference, delivery
packages/ai-runtime      Sandbox + model gateway + run lifecycle
packages/observability   PostHog / Sentry + StudioEvents
packages/email           Transactional email blocks
packages/storage         Signed upload / public URL blocks
packages/flags           Feature flag evaluation
packages/ratelimit       Rate limit assertions
agents/                  Builder-agent surface (Rams, greploop, loops)
docs/                    Architecture + capabilities + tooling
```

## Observability & reviews

- **PostHog** — product analytics + feature flags (`@studio/observability`, `@studio/flags`)
- **Sentry** — exceptions / performance
- **Rams** — design review on PRs + `agents/skills/rams.md`
- **Greptile + greploop** — code review loop to 5/5

See [capabilities.md](./capabilities.md) and [tooling.md](./tooling.md).

## Adding a capability

1. Write the flow in the app/action first.
2. Extract repeated operational chunks into a package as **capability blocks**.
3. Replace one caller → verify → migrate the rest.
4. Keep policy (auth, entitlements, status) in the app/Convex layer.
