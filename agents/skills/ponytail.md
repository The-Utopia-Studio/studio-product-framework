---
name: ponytail
description: >
  Token-efficient coding constraint — write only what the task needs (lazy
  senior ladder). Use when the user asks for ponytail, to cut agent tokens /
  over-engineering, or before large codegen. Never drop security or validation.
---

# Ponytail

**Product:** https://ponytail.dev · Upstream: https://github.com/DietrichGebert/ponytail

Ponytail makes builder agents behave like a **lazy senior**: climb a decision ladder before writing code. Less code → fewer tokens → lower cost. Safety is not optional.

## Decision ladder (stop at the first rung that holds)

1. Does this need to exist? Speculative = skip (YAGNI).  
2. Already in this codebase? Reuse the helper / pattern.  
3. Stdlib covers it? Use it.  
4. Native platform feature? Prefer it over a new component/lib.  
5. Already-installed dependency? Use it — don’t add another.  
6. Can it be one line? One line.  
7. Only then: the minimum code that works.

**Never simplify away:** trust-boundary validation, data-loss handling, security, accessibility.

## Intensity

| Mode | Behavior |
|------|----------|
| `lite` | Build what was asked; name the lazier alternative in one line |
| `full` (default for SPF) | Ladder enforced; shortest correct diff |
| `ultra` | YAGNI extremist — one-liner + challenge extra requirements |
| `off` | Disable for this session |

Prefer **`full`** on SPF. Use `ultra` only when the user explicitly wants maximal cut.

## Install (each engineer / agent)

Follow upstream install for Cursor / Claude Code / Codex: https://ponytail.dev  
Keep this skill as the **repo-local reminder**; upstream skill supplies hooks/commands (`/ponytail`, `/ponytail-review`, `/ponytail-audit`).

## SPF hard rules

- Ponytail does **not** override Convex auth, Effect money paths, or Aikido/Greptile findings.  
- Prefer deleting speculative abstractions over “framework-y” helpers.  
- After a large agent pass, run `/ponytail-review` (or manually scan the diff for over-build).

## Done when

Diff is the smallest correct change; no new deps unless required; validation/security intact.
