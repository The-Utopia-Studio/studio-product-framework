---
name: commit-v1
description: >
  Commit gate before the one big build — problem score, evidence ladder,
  eval-first spec, and (for launch) pilot terms. Use before bootstrap or a
  major product scaffold. Blocks committed build until artifacts are signed.
---

# Loop: commit → v1 (gate)

## Goal

Cross Icarus’s **commit line**: cheap discovery is done; scope is scorable; a human owns invent/wedge. Then — and only then — run the committed build on Studio Product Framework.

Playbook (read, don’t paste): https://the-utopia-studio.github.io/Icarus/

## Forbidden

- Starting `bootstrap-ai-product` for a **venture product** without this gate green
- Agents inventing the wedge / moat (human invents; agents build and test)
- Treating filled templates with only 0.1 “opinion” evidence as a pass
- Skipping data-rights on a paid pilot

## Artifacts (fill in place)

| Artifact | Path |
|----------|------|
| Problem scorecard | `agents/context/discovery/problem-scorecard.md` |
| Evidence ladder | `agents/context/discovery/evidence-ladder.md` |
| Eval-first spec | `agents/context/discovery/eval-first-spec.md` |
| Pilot term sheet | `agents/context/discovery/pilot-term-sheet.md` (required for launch) |

## Steps

1. **Score the problem** — fill problem-scorecard. Stop if total < 32 unless human explicitly overrides with written reason in learnings.
2. **Log evidence** — fill evidence-ladder. Strongest claim must be ≥ 0.5 or a dated path to paid terms.
3. **Write eval-first spec** — job sentence, ≥5 golden cases, autonomy level, cost-per-outcome.
4. **Human gate** — human signs invent/wedge and the commit checklist on the spec. Agents do not self-approve.
5. **Build** — only after sign-off:
   - New product standup → `agents/loops/bootstrap-ai-product.md`
   - Feature vertical → `agents/loops/scaffold-product-feature.md`
   - Ship → `agents/loops/ship-ready-pr.md`
6. **Launch** — before paid pilot / public v1, complete pilot-term-sheet (all six terms + data rights).
7. **Learning** — append one line to `agents/context/learnings.md` (pass/kill/redesign + total score).

## Done when

- [ ] Scorecard ≥32 (or documented kill/redesign)
- [ ] Evidence ladder signed; not opinion-only
- [ ] Eval-first spec signed by a human
- [ ] Next loop named (bootstrap / scaffold) — not started early
- [ ] Pilot sheet ready if this commit includes customer launch

## Report

```
Commit-v1 complete.
  Score:     n/40
  Evidence:  strongest weight …
  Spec:      signed | blocked
  Next:      bootstrap | scaffold | kill | redesign
```

## Exception: platform-only work

Improving Studio Product Framework plumbing (packages, agent OS, reference app infra) does **not** require this gate — use `improve-framework` / `ship-ready-pr`. The gate applies to **venture products and customer-facing v1 scope**.
