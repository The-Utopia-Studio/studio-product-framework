---
name: research
description: >
  Auto-research for Studio Product Framework — gather evidence on scorecard gaps,
  Convex components, and capability ports. Writes to research-queue. Use before
  improve-framework or when asked to research / auto-research the framework.
---

# Skill: research (auto-research)

## Goal

Produce **actionable** queue items the improve loop can consume. Humans should not be the research bottleneck.

## Inputs

Optional focus: `scorecard` | `components` | `billing` | `security` | `observability` | `deps` | `web`. Default: scorecard gaps in `docs/production-readiness.md` + **Port** rows in `docs/capabilities.md`.

## Forbidden

- Style-only doc edits
- Proposing new packages without a capability slot
- Claiming “Shipped” without code evidence
- More than **5** new queue items per run
- Auto-implementing (that is `improve-framework`)

## Steps

1. **Read truth sources** (in order):
   - `docs/production-readiness.md` scorecard
   - `docs/capabilities.md` Port / Process rows
   - `docs/convex-components.md`
   - `agents/context/research-queue.md` (skip duplicates)
   - `agents/context/learnings.md` (blocked items)

2. **Gather evidence** (only as needed for the focus):
   - Repo: grep/read for missing validators, TODOs, stub ports
   - Docs: Context7 / Convex component catalog for gaps we already named
   - **Live web (when needed):**
     1. **Parallel** (`agents/skills/parallel.md` / `api.webTools.search`) for cited search  
     2. **Firecrawl** (`agents/skills/firecrawl.md` / `api.webTools.scrape`) for full page bodies of chosen URLs  
     3. Dep changelogs only when Parallel is unavailable — Convex, Clerk, Polar, Autumn, Greptile, etc.

3. **Score each candidate** (pick top ≤5):

   | Score | Meaning |
   |------:|---------|
   | 3 | Raises scorecard dimension or closes money/trust risk |
   | 2 | Moves a Port → Shipped with clear file path |
   | 1 | Nice DX; defer unless no 2–3 items |

4. **Append to** `agents/context/research-queue.md` using the template there. Include: why, evidence path/URL (cite Parallel hits), suggested loop/skill, estimate (S/M/L).

5. **Report** to the operator:

```
Research complete.
  Focus:     …
  Added:     N items (ids …)
  Skipped:   duplicates / out of scope
  Next:      run agents/loops/improve-framework.md on top item
           or agents/loops/compound-engineering.md if shipping a feature
```

## Done when

- [ ] Queue updated (or explicitly “nothing actionable”)
- [ ] No code changes except queue / optional learnings note
- [ ] Each item has evidence + suggested next skill/loop
- [ ] Web evidence (if any) cites Parallel/Firecrawl URLs
