# Production readiness assessment

**Date:** 2026-07-19  
**Product:** Studio Product Framework  
**Method:** Architecture review + code-structure principles + security pass on public Convex/HTTP surfaces  

## Verdict: **adjust — keep the architecture, close the honesty gap**

The **shape is best-in-class** for an AI-native company framework on Convex:

- pnpm + Turborepo monorepo as **agent context** (not just human neatness)
- Apps orchestrate; packages are composable capability ports
- Effect only for money / inference / delivery
- Builder agents (`agents/`) vs runtime agents (`@studio/ai-runtime`)
- Rams + Greptile/greploop as the design/code review OS; Aikido for security/pentest
- PostHog + Sentry as product/error observability; Langfuse for LLM traces
- Ponytail for token-efficient builder codegen
- Hivemind as shared agent memory across the team (see [hivemind.md](./hivemind.md))

What it was *not* yet: a finished lift-and-use product. It was a strong manifesto sitting on a Polar/Clerk starter. This push closes the worst security/branding blockers and documents remaining gaps honestly.

## Scorecard (post-hardening)

| Dimension | Score | Notes |
|-----------|------:|-------|
| Structure | **8.5** | Layout is right; package count slightly ahead of deep adapters |
| DX / docs | **7.5** | Clear AGENTS + capabilities; status now honest |
| Agent OS | **8.5** | Skills + loops + research/improve/operate + Icarus commit gate artifacts; still agent-run not cron-autonomous |
| Security | **6** | Chat auth + subscription IDOR + internal webhooks fixed; more validators/tests still needed |
| Observability | **5.5** | Browser PostHog/Sentry wired; server capture still thin |
| Completeness | **5** | Polar path real; Stripe/Autumn/sandbox are extension ports |

## Is this the best way?

**Yes, for Convex + Clerk + Vercel AI-native companies** — with caveats.

Better than: fat single app, Effect-everywhere, multi-repo platform packages agents cannot see, or pretending Convex components alone are a product framework.

Caveats: architecture ≠ complete adapters. Treat Polar as the reference billing path; Stripe/Autumn as documented extension slots until wired end-to-end. Do not claim “Ready” for unproven verticals.

## Fixed in this pass

- Unauthenticated `/api/chat` → requires Convex/Clerk identity + client Bearer token
- Subscription status IDOR (`userId` arg) → auth-only self check
- `handleWebhookEvent` → `internalMutation` (only callable after Polar signature verify)
- Removed stub `/api/auth/webhook`
- RSK branding → Studio Product Framework
- Honest capability status in docs
- SSR Convex calls pass Clerk JWT (`getConvexToken`)

## Still required for “best of the best”

1. End-to-end vertical: entitlement → wallet debit → OpenRouter inference → persist  
2. Real Stripe + Autumn adapters (or clearly “extension” until then)  
3. Sandbox provider for runtime agents  
4. `authedQuery` / `authedMutation` helpers + `returns` on all public Convex functions  
5. `@convex-dev/eslint-plugin` + package unit tests + Convex authz tests  
6. Install Greptile + Rams GitHub Apps on the repo  
7. Stand up Hivemind org/workspace and have every engineer install ([hivemind.md](./hivemind.md))  
8. Tighten Effect programs (compose debit+inference, idempotency, retries)

## Naming

| Surface | Canonical name |
|---------|----------------|
| Product | **Studio Product Framework** |
| npm scope | `@studio/*` |
| Root package | `studio-product-framework` |
| GitHub repo | `studio-product-framework` |
| Reference app | `apps/web` (`@studio/web`) |
