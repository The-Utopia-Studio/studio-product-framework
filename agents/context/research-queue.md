# Research queue

Fed by `agents/skills/research.md`. Consumed by `agents/loops/improve-framework.md`.

Status: `open` | `done` | `blocked`

## Open

<!-- Newest actionable items at top. Max ~15 open; archive done below. -->

### RQ-004 · fellow · worked example
- **Score:** 2
- **Why:** Fellow Day-0 + blueprint + DS loop shipped as docs; still no filled venture example to shadow
- **Evidence:** `docs/fellow-day-0.md`, `docs/production-readiness.md` “Still required” #9–10
- **Next:** `improve-framework` → add one anonymized filled blueprint + eval-first + DS token map under `agents/context/discovery/examples/` (or link a real venture)
- **Estimate:** M
- **Status:** open

### RQ-001 · scorecard · completeness
- **Score:** 3
- **Why:** Production readiness completeness still mid; Stripe/Autumn/sandbox ports unfinished
- **Evidence:** `docs/production-readiness.md`, `docs/capabilities.md` Port rows
- **Next:** `improve-framework` → pick one Port (prefer Autumn env wiring or Stripe adapter), not all
- **Estimate:** M
- **Status:** open

### RQ-002 · security · validators
- **Score:** 3
- **Why:** Public Convex `returns` / authed wrappers still incomplete
- **Evidence:** `docs/production-readiness.md` “Still required” #4–5
- **Next:** `improve-framework` → add `authedQuery`/`authedMutation` pattern + validators on hottest public functions
- **Estimate:** M
- **Status:** open

### RQ-003 · process · review apps
- **Score:** 2
- **Why:** Greptile + Rams are Process until installed on org repo
- **Evidence:** `docs/capabilities.md`, `docs/tooling.md`
- **Next:** Human installs apps on `The-Utopia-Studio/studio-product-framework`; agent verifies with `gh`
- **Estimate:** S
- **Status:** open

## Done

_(move items here with date)_

## Template

```
### RQ-NNN · <focus> · <short title>
- **Score:** 1–3
- **Why:** …
- **Evidence:** path or URL
- **Next:** skill/loop name
- **Estimate:** S|M|L
- **Status:** open
```
