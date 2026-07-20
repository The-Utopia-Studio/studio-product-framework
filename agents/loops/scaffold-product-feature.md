---
name: scaffold-product-feature
description: End-to-end loop for adding a product feature on Studio Product Framework
---

# Loop: scaffold a product feature

## Goal

Ship a feature with correct layering, typecheck green, and docs/skills updated if patterns changed.

## Gate

If this feature is the **first committed slice** of a venture v1 (or changes the job / autonomy / cost budget), require a signed `agents/context/discovery/eval-first-spec.md` via `agents/loops/commit-v1.md`. Small post-handover tweaks use `operate-handover` norms — no rediscovery theatre.

## Steps

1. **Clarify non-negotiable** — Does this touch money, inference, or delivery? If yes, plan Effect fence usage. Match eval-first autonomy + cost budget if present.
2. **Locate home** — UI in `apps/web`, orchestration in `apps/web/convex`, shared mechanics in `packages/*`.
3. **Implement thin vertical slice** in the app first (auth → action → UI). Prefer a golden case from the spec when one exists.
4. **Extract** only if a second caller needs the same mechanic.
5. **Wire billing** if gated (Polar/Stripe entitlement or Autumn + wallet).
6. **Typecheck** — `pnpm typecheck`.
7. **Update agent context** — if a new pattern emerged, add a short note under `docs/` or a skill.

## Done when

- [ ] Client does not touch DB/secrets
- [ ] Critical paths use Effect where required
- [ ] No new god-service APIs
- [ ] `pnpm typecheck` passes
- [ ] Commit gate respected when applicable
