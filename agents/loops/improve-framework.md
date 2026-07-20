---
name: improve-framework
description: >
  Self-recursive loop that raises Studio Product Framework quality via research
  queue + scorecard. Bounded depth; ships one gap per outer iteration. Use when
  asked to improve the framework, self-improve, or close production-readiness gaps.
---

# Loop: improve framework

## Goal

Raise one scorecard dimension or convert one **Port → Shipped** without a human driving the research/fix cycle. Human only merges / kills.

## Budget (defaults — override explicitly)

| Knob | Default |
|------|--------:|
| Outer iterations | 1 |
| Recursion depth | ≤ 3 |
| Max greploop iters | 5 |
| Auto-merge | **never** |

One outer iteration = one queue item or one scorecard gap. Prefer **one PR**.

## Forbidden moves

- Weaken auth, validators, rate limits, or Effect fence
- Add packages not justified by `docs/capabilities.md`
- “Improve” by rewriting architecture docs without code
- Touch client wallet / billing money paths without Effect + review
- Recurse after a failed identical attempt

## Steps

### 1. Select work

1. Read `agents/context/research-queue.md` — take highest score **open** item.
2. If queue empty → run `agents/skills/research.md` once (depth +1), then re-select.
3. If still empty → stop; write “no actionable gaps” to learnings; exit.

### 2. Plan (≤10 lines)

State: gap, files likely touched, done-when, and which child loops/skills. Abort if estimate is **L** and outer budget is 1 — split or escalate to human.

### 3. Execute (depth +1)

Dispatch **one** child path:

| Gap type | Child |
|----------|--------|
| New package / port wiring | `add-capability` / `add-billing-provider` / `add-convex-component` / `add-runtime-agent-tool` |
| Feature vertical in reference app | `scaffold-product-feature` |
| Docs/scorecard honesty only | edit `docs/*` + capabilities status — no ship loop if docs-only |

### 4. Ship (depth +1)

Run `agents/loops/ship-ready-pr.md` (includes Rams + greploop). Do not merge unless the human asked.

### 5. Close the loop

1. Mark queue item **done** (or **blocked** with reason).
2. Update `docs/capabilities.md` / `docs/production-readiness.md` if status changed.
3. Append a short entry to `agents/context/learnings.md`.
4. Outer recurse only if: budget remains **and** score/queue improved **and** human did not say stop.

## Done when

- [ ] One gap closed or explicitly blocked with learning
- [ ] PR open (or docs-only commit) with ship gates run
- [ ] Queue + scorecard + learnings consistent
- [ ] No silent merge

## Report

```
Improve-framework complete.
  Item:        …
  Depth used:  n/3
  PR:          url or n/a
  Scorecard:   what moved (or unchanged)
  Learning:    one sentence
  Next:        human merge | another outer iter | stop
```
