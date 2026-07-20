---
name: bootstrap-ai-product
description: Lift-and-use loop to stand up a new AI-native product on Studio Product Framework
---

# Loop: bootstrap AI product

## Gate (venture products)

If this standup is a **customer/venture product** (not framework plumbing), complete `agents/loops/commit-v1.md` first — scorecard, evidence, eval-first spec signed. Do not skip.

Platform-only work on this monorepo may proceed without the gate.

## Steps

1. Confirm commit gate green (or platform-only exception).
2. Copy / clone this monorepo (or add `apps/<product>`).
3. Fill `apps/web/.env.local` from `.env.example` (Clerk, Convex, billing, PostHog, Sentry, OpenRouter).
4. Install GitHub Apps on the repo:
   - **Greptile** — code review
   - **Rams** — design review (https://www.rams.ai)
5. `pnpm install` → `cd apps/web && npx convex dev` → `pnpm dev:web`
6. Pick billing shape: Polar and/or Stripe (subscriptions) + Autumn (credits).
7. Enable runtime agent only if needed (`@studio/ai-runtime` + sandbox keys) — match autonomy level from eval-first spec.
8. Confirm observability: PostHog pageviews + Sentry error boundary.
9. Implement golden cases from the spec as the first vertical (tests or scored fixtures where practical).
10. First feature via `agents/loops/scaffold-product-feature.md`.
11. Ship via `agents/loops/ship-ready-pr.md`.
12. Before paid pilot: complete `agents/context/discovery/pilot-term-sheet.md`.

## Capability checklist

See `docs/capabilities.md`.
