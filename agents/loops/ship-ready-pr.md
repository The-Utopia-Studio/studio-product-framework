---
name: ship-ready-pr
description: >
  Engineered loop to get a PR merge-ready for AI-native Studio products —
  typecheck/lint, Rams design pass, Greptile greploop, observability sanity.
---

# Loop: ship-ready PR

## Goal

PR is mergeable with framework quality bar: types, lint, design review, code review.

## Steps

1. **Verify branch PR exists** — `gh pr view` (create if missing).
2. **Quality gates locally**
   ```bash
   pnpm typecheck
   pnpm lint
   ```
3. **Rams design pass** on changed UI (`apps/web/app/**/*.{tsx,css}`) using `agents/skills/rams.md`. Fix critical/serious issues.
4. **Push** and ensure CI workflow is green.
5. **Greploop** using `agents/skills/greploop.md` until 5/5 or max iterations.
6. **Check PR** using `agents/skills/check-pr.md` for leftovers (Rams + human).
7. **Observability sanity** — if the PR adds user-facing flows, confirm PostHog events / Sentry capture points exist where failures cost money or trust.

## Done when

- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] Rams critical a11y cleared on touched UI
- [ ] Greptile 5/5 or remaining items explicitly documented
- [ ] No secrets in client; Effect fence respected for money/inference
