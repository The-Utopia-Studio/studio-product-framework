---
name: bootstrap-ai-product
description: Lift-and-use loop to stand up a new AI-native product on Studio Product Framework
---

# Loop: bootstrap AI product

## Gate (venture products)

If this standup is a **customer/venture product** (not framework plumbing), complete in order:

1. `agents/loops/commit-v1.md` — scorecard, evidence, eval-first spec signed  
2. Fill `docs/engineering-blueprint.md` (80/90 stack — do not re-decide)  
3. Read `docs/fellow-day-0.md` if the builder is a fellow / outsourced engineer  

Do not skip for ventures. Platform-only work on this monorepo may proceed without the commit gate.

## Steps

1. Confirm commit gate + blueprint green (or platform-only exception).
2. **Repo mode** from blueprint: default for fellows = **fork SPF** and rebrand `apps/web`. Adding `apps/<product>` is advanced (only one app exists today).
3. Fill env by **tier** — see `docs/fellow-day-0.md` and comments in `apps/web/.env.example`:
   - Tier A: Convex + Clerk + `FRONTEND_URL`
   - Tier B: Polar (default) and/or Autumn; Stripe only if blueprint forces it (**Port**)
   - Tier C: OpenRouter (+ Langfuse recommended)
   - Tier D: PostHog + Sentry
   - Tier E: web tools / sandbox / email only if the job needs them
4. `pnpm install` → `cd apps/web && npx convex dev` → `pnpm dev:web`
5. **Design system** — run `agents/loops/integrate-design-system.md` before UI polish (Utopia DS, designer pack, or generate).
6. Install GitHub Apps on the venture repo (Studio admin if fellow lacks org rights):
   - **Greptile** — code review  
   - **Rams** — design review  
   - **Aikido** — security / pentest  
7. Hivemind: correct workspace (venture-isolated when needed) — `docs/hivemind.md`.
8. Confirm observability: PostHog pageviews + Sentry (Tier D).
9. **First vertical = golden case #1** from eval-first — **workflow-embedded AI by default**, not a chat clone. Doctrine: `docs/ai-in-workflow.md`. Reuse `runMeteredInference` / wallet as mechanics when metering.
10. Enable runtime agent only if autonomy requires it (`@studio/ai-runtime` + sandbox) — sandbox is **Port** until a provider is wired.
11. Features via `agents/loops/compound-engineering.md` (or `scaffold-product-feature.md`).
12. Ship via `agents/loops/ship-ready-pr.md`.
13. Before paid pilot: `agents/context/discovery/pilot-term-sheet.md`.
14. After 1–2 feedback iterations: `agents/loops/operate-handover.md`.

## Capability checklist

See `docs/capabilities.md` — respect **Shipped** vs **Port**. Do not block Day-0 on Ports unless the golden case requires them.

## Done when

- [ ] App boots with Tier A (+ B/C per blueprint)
- [ ] Design system integrated or generate PR open
- [ ] First golden-case vertical path clear (not “build chat SaaS”)
- [ ] Review apps / Hivemind ownership clear
