---
name: ship-ready-pr
description: >
  Engineered loop to get a PR merge-ready for AI-native Studio products —
  typecheck/lint, Rams, Greptile greploop, Aikido security, observability sanity.
---

# Loop: ship-ready PR

## Goal

PR is mergeable with framework quality bar: types, lint, design, code, security.

## Steps

1. **Verify branch PR exists** — `gh pr view` (create if missing).
2. **Ponytail pass (optional but preferred)** — scan the diff for over-build (`agents/skills/ponytail.md`); shrink before review noise.
3. **Quality gates locally**
   ```bash
   pnpm typecheck
   pnpm lint
   ```
4. **Rams design pass** on changed UI using `agents/skills/rams.md`. Fix critical/serious issues.
5. **Push** and ensure CI workflow is green.
6. **Greploop** using `agents/skills/greploop.md` until 5/5 or max iterations.
7. **Aikido** using `agents/skills/aikido.md` — clear critical/high or document exceptions.
8. **Check PR** using `agents/skills/check-pr.md` for leftovers (Rams + Greptile + Aikido + human).
9. **Observability sanity** — PostHog/Sentry for user-facing flows; Langfuse spans if the PR touches inference / runtime agents (`agents/skills/langfuse.md`).

## Done when

- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] Rams critical a11y cleared on touched UI
- [ ] Greptile 5/5 or remaining items explicitly documented
- [ ] Aikido critical/high cleared or risk-noted
- [ ] No secrets in client; Effect fence respected for money/inference
- [ ] Langfuse considered if model path changed
