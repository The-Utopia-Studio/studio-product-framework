# Loop engineering

How Studio Product Framework improves **without a human owning continuous improvement**.

Humans set outcomes, budgets, and kill switches. Agents run the loops. After delivery, operators (clients or your team) run the same loops — we do not sell endless minor tweaks.

## What a loop is

A loop is a **bounded, recursive workflow** with:

| Contract field | Required |
|----------------|----------|
| **Goal** | One measurable outcome |
| **Done when** | Explicit checklist / score |
| **Max iterations** | Hard cap (default 3–5) |
| **Forbidden moves** | e.g. weaken auth, skip Effect fence, invent packages |
| **Artifacts** | What gets written back into the repo |
| **Human gate** | Only taste, money, or irreversible (merge to `main`, prod deploy) |

If it cannot state an exit condition, it is not a loop — it is busywork.

## Loop kinds (only these)

| Kind | Owns | Example |
|------|------|---------|
| **Discover** | Problem evidence → scorecard | `score-problem` |
| **Commit** | Scorable scope before big build | `commit-v1` (+ engineering blueprint) |
| **Ship** | One PR quality | `ship-ready-pr`, `greploop` |
| **Build** | Product standup / DS / feature | `bootstrap-ai-product`, `integrate-design-system`, `scaffold-product-feature` |
| **Research** | Framework evidence → queue | `agents/skills/research.md` |
| **Improve** | Framework score ↑ | `improve-framework` |
| **Operate** | Handover / self-serve changes | `operate-handover` |

Do **not** add: unbounded “always-on” agents, silent auto-merge to `main`, or loops that rewrite architecture without a scorecard gap.

**Venture products:** run `commit-v1` before bootstrap. Discovery templates live in `agents/context/discovery/` (Icarus methodology → actionable gate). Framework plumbing may skip the commit gate.

## Self-recursion (allowed pattern)

```
# Framework improve
improve-framework
  └─ research (if evidence missing)
       └─ scaffold / capability skill
            └─ ship-ready-pr
                 └─ greploop + rams

# Venture product (fellow path — docs/fellow-day-0.md)
score-problem
  └─ commit-v1 (+ engineering-blueprint)
       └─ integrate-design-system
            └─ bootstrap-ai-product / scaffold-product-feature
                 └─ ship-ready-pr
                      └─ operate-handover
```

AI placement defaults to **workflow-embedded jobs** ([ai-in-workflow.md](./ai-in-workflow.md)), not chat-dashboard clones.

Rules:

1. **Depth ≤ 3** (parent → child → grandchild). No infinite spawn.
2. Child inherits parent **forbidden moves** and must not invent new goals.
3. Parent only recurses if the last child **raised a score or cleared a queue item**.
4. Same failure twice → **stop** and write a blocked note to `agents/context/learnings.md`. Do not retry forever.

Greploop is the reference recursive ship loop: score exit, max iterations, no weakening constraints.

## Auto-research (what it is / is not)

**Is:** Structured evidence gathering that feeds the research queue and improve loop — Convex components, deps, scorecard gaps, competitor patterns that map to *our* capabilities.

**Is not:** Open-ended browsing, rewriting docs for style, or “AI opinions” without a file path / URL / scorecard row.

Research writes to `agents/context/research-queue.md`. Improve consumes the top item. Nothing auto-merges.

## Who is responsible for “getting better”

| Role | Responsibility |
|------|----------------|
| **Human** | Outcomes, max budget (PRs/week), merge/deploy gates, kill switch |
| **Builder agent** | Run research → improve → ship loops; update scorecard/learnings |
| **Operator (client)** | After handover: run operate + ship loops for their own tweaks |
| **Studio delivery** | 1–2 feedback iterations, then teach operate — not endless polish |

This matches delivery: we hand over a **system they can operate**, not a retainer for minor UI tweaks.

## Cadence (suggested, not mandatory)

| Cadence | Loop |
|---------|------|
| Before venture build | `score-problem` → `commit-v1` → blueprint → `integrate-design-system` |
| Every PR | `ship-ready-pr` |
| Weekly / when scorecard stale | `research` → `improve-framework` (1 gap max) |
| At client handover | `operate-handover` |
| Never unattended | Merge to `main`, `convex deploy`, billing/wallet changes without human gate |

Prefer Cursor `/loop` or a scheduled agent session over inventing a second orchestration runtime. File-based artifacts in `agents/context/` are the **git-audited** memory — git is the audit log. **Hivemind** is the **session/team** memory layer (traces, wiki summaries, emergent skills across Cursor/Claude/Codex). Keep capture on during loop work; promote durable patterns into `agents/` via PR. See [hivemind.md](./hivemind.md).

## Anti-patterns (reject these)

- “Keep improving forever” with no scorecard
- Auto-merge from improve loops
- Research that does not update the queue
- New packages/skills that do not map to a capability or scorecard gap
- Humans as the default fix path after handover (use operate loop instead)
- Runtime agents self-modifying builder skills (wrong agent kind)
- Treating Hivemind as a replacement for committed `agents/` skills (promote keepers; don’t dual-source hard rules)
- Capturing client/venture secrets into the shared `studio-product-framework` workspace

## Related

- Loops: `agents/loops/`
- Research skill: `agents/skills/research.md`
- Shared agent memory: `docs/hivemind.md`, `agents/skills/hivemind.md`
- Scorecard: `docs/production-readiness.md`
- Capability truth: `docs/capabilities.md`
