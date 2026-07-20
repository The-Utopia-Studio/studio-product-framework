---
name: score-problem
description: >
  Fill the problem quality scorecard and evidence ladder under
  agents/context/discovery/. Use during discovery or before commit-v1.
---

# Skill: score-problem

## Goal

Produce commit-ready discovery artifacts — not a slide deck.

## Steps

1. Read `agents/context/discovery/README.md`.
2. Interview notes / traces / artefacts → fill `problem-scorecard.md` (1–5 each; cite evidence).
3. Append rows to `evidence-ladder.md` with honest weights (money 1.0 … opinion 0.1).
4. If total ≥ 32 and evidence ≥ 0.5 path exists → tell operator to run `agents/loops/commit-v1.md` next (eval-first spec).
5. If 28–31 → recommend wedge redesign (two weeks), do not open bootstrap.
6. If under 28 → recommend kill; append learning.

## Forbidden

- Inflating scores to unlock build
- Inventing the product solution in this skill (problem only)
- Marking Shipped / commit without human sign-off on the scorecard

## Done when

- [ ] Scorecard totals filled
- [ ] Evidence log has ≥1 real artefact or money/behaviour row (or explicit kill)
- [ ] Next action stated: commit-v1 | redesign | kill
