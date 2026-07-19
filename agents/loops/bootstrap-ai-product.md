---
name: bootstrap-ai-product
description: Lift-and-use loop to stand up a new AI-native product on Studio Product Framework
---

# Loop: bootstrap AI product

## Steps

1. Copy / clone this monorepo (or add `apps/<product>`).
2. Fill `apps/web/.env.local` from `.env.example` (Clerk, Convex, billing, PostHog, Sentry, OpenRouter).
3. Install GitHub Apps on the repo:
   - **Greptile** — code review
   - **Rams** — design review (https://www.rams.ai)
4. `pnpm install` → `cd apps/web && npx convex dev` → `pnpm dev:web`
5. Pick billing shape: Polar and/or Stripe (subscriptions) + Autumn (credits).
6. Enable runtime agent only if needed (`@studio/ai-runtime` + sandbox keys).
7. Confirm observability: PostHog pageviews + Sentry error boundary.
8. First feature via `agents/loops/scaffold-product-feature.md`.
9. Ship via `agents/loops/ship-ready-pr.md`.

## Capability checklist

See `docs/capabilities.md`.
