---
name: integrate-design-system
description: Plug or generate a design system into SPF before venture UI polish
---

# Loop: integrate design system

## Goal

Customer-facing UI uses the venture’s design system (or generated tokens), not the SPF Apple/shadcn starter look.

## Done when

- [ ] Blueprint lists DS source (Utopia / designer pack / generate)
- [ ] Tokens mapped into `apps/web/styles/globals.css` (and fonts in layout)
- [ ] Primary surfaces show venture brand (logo + primary color + type)
- [ ] Skill checklist in `agents/skills/plug-design-system.md` complete
- [ ] PR opened; Rams required before merge of visual foundation

## Max iterations

3 (inventory → map tokens → component alias / polish). Stop and ask designer if tokens are ambiguous.

## Forbidden moves

- Skipping tokens and restyling page-by-page
- Blocking all product work until a full component library is ported
- Inventing a second design-system app inside the venture without a consumer

## Steps

1. Confirm design system source on `docs/engineering-blueprint.md` (or venture copy).
2. Follow `agents/skills/plug-design-system.md` (plug **or** generate).
3. Reference: [Utopia Design System](https://utopia-design-system.vercel.app/) when that is the source.
4. `pnpm typecheck` / visual smoke (auth + shell + one CTA).
5. Ship foundation via `agents/loops/ship-ready-pr.md` (Rams mandatory).

## Artifacts

- Updated `globals.css` (+ optional `tokens.css`)
- Blueprint DS section filled
- PR with before/after screenshots when possible

## Human gate

Designer or Studio lead taste sign-off on token mapping when brand-critical; otherwise Rams + fellow judgment for pilot.

## Related

- Fellow Day-0: `docs/fellow-day-0.md`
- Bootstrap (runs after or interleaved with this loop): `agents/loops/bootstrap-ai-product.md`
