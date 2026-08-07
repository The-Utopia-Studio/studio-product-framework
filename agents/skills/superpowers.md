---
name: superpowers
description: >
  Install and use obra/superpowers as the builder harness methodology
  (brainstorm → plan → TDD → subagents). Maps onto SPF loops; does not replace
  Greptile/Rams/Aikido or Convex rules.
---

# Superpowers

**Upstream:** https://github.com/obra/superpowers  

Superpowers is an **installable agent skill pack** (brainstorming, plans, TDD, subagent-driven development). SPF already has product/domain loops — Superpowers fills the **day-to-day coding harness**.

## Install (each engineer / harness)

Cursor:

```text
/add-plugin superpowers
```

Claude Code:

```bash
/plugin install superpowers@claude-plugins-official
```

See upstream README for Codex, Gemini, etc.

## How SPF maps onto Superpowers

| Superpowers | SPF |
|-------------|-----|
| brainstorming + writing-plans | `commit-v1` / `scaffold-product-feature` plan phase |
| subagent-driven-development | Implement inside SPF layering rules |
| test-driven-development | Prefer for packages + Convex; keep Effect money tests tight |
| requesting-code-review | Then **Greptile greploop** + Rams + Aikido (`ship-ready-pr`) |
| finishing-a-development-branch | `ship-ready-pr` → PR |

## Hard rules (do not let Superpowers override)

1. Client never touches DB — Convex only.  
2. Effect only for money / inference / delivery.  
3. Ponytail ladder for code size — Superpowers YAGNI aligns; if they conflict, **smaller correct diff wins**.  
4. Security findings (Aikido) and review scores (Greptile) still block merge.

## Done when

Plugin installed in the active harness; agent uses brainstorm/plan before large builds; SPF ship-ready still runs after.
