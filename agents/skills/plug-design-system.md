---
name: plug-design-system
description: Map an external or generated design system into the SPF Next.js app (tokens first, components second)
---

# Skill: plug design system

## When

Before customer-facing UI polish on a venture bootstrap. Called from `agents/loops/integrate-design-system.md`.

## Inputs (one of)

1. **Utopia / Studio DS** — e.g. https://utopia-design-system.vercel.app/ (tokens, components, docs)
2. **Designer pack** — Figma variables export, CSS tokens file, or component library path/npm
3. **Brand brief** — name, palette, type, voice → **generate** token set (see Generate path)

## Principles

1. **Tokens before components** — CSS variables in `apps/web/styles/globals.css` beat one-off class edits.
2. **Keep shadcn structure** unless a real component package exists — swap `--primary`, fonts, radius, semantic colors; keep `@/components/ui/*` as the primitive layer.
3. **Do not ship the Apple starter look** for customer ventures — treat current globals as placeholder.
4. **Rams** after the first visual PR (`agents/skills/rams.md`).
5. **No new god theme SDK** — tokens + optional package alias; policy stays in the app.

## Plug path (external DS)

1. Inventory source: colors, type, radius, spacing, dark mode?, component list.
2. Map into `:root` / `.dark` CSS variables already consumed by `@theme inline` in `globals.css`.
3. Set fonts in `app/layout.tsx` (next/font or DS font files) — avoid default Inter/Roboto/Arial stacks when the DS specifies otherwise.
4. If DS ships a React package:
   - add dependency / workspace package
   - alias primitives gradually (`button`, `input`, …) — one PR per cluster
   - do not delete shadcn until replacements cover forms + nav + feedback
5. Strip starter marketing brand (logo, homepage copy, Apple-blue assumption) to venture identity.
6. Smoke: sign-in, dashboard shell, one form, one primary CTA.
7. Open PR → Rams + greploop.

## Generate path (no DS yet)

When there is only a brand brief:

1. Draft token table: background/foreground, primary/accent, muted, destructive, radius scale, font pair (display + body).
2. Write tokens into `globals.css`; document source brief in PR description.
3. Prefer designer review before launch; mark blueprint “Generate — pending design sign-off”.
4. Optionally scaffold a tiny `packages/design-tokens` or `apps/web/styles/tokens.css` if multiple apps will share — only when a second consumer exists.
5. Same smoke + Rams as plug path.

Do **not** invent a full component library in the generate path. Tokens + shadcn is enough for 0→1.

## Forbidden

- Rebuilding the design system inside SPF as a parallel Storybook monorepo “for fun”
- Hard-coding hex in feature components when a token exists
- Dark-mode-only or purple-glow defaults that ignore the brand brief
- Blocking bootstrap on perfect DS parity — tokens + primary/secondary/CTA is Day-0 enough

## Done when

- [ ] Semantic CSS variables match the source DS / brief
- [ ] Fonts loaded per DS
- [ ] Starter Apple palette no longer dominant on primary surfaces
- [ ] Blueprint “Design system” section updated
- [ ] Rams run (or scheduled) on the integrating PR
