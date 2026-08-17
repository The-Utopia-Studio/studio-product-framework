# Eval-first spec (commit scope)

A scope you **cannot score** is an opinion — do not start the committed build.

Venture / product: _______________  
Date: _______________ · Owner: _______________

## 1. Job (one sentence)

Who executes **what job**, on **what trigger**, to **what standard**:

>

## 2. Golden cases (target 20; minimum 5 to start commit)

Each row is a pass/fail contract from a real field artefact.

| # | Input / trigger | Expected output | Pass/fail rule | Source artefact |
|---|-----------------|-----------------|----------------|-----------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

_(Add rows 6–20 as probes harden.)_

## 3. Autonomy & failure

| Level | Meaning | This product |
|------:|---------|--------------|
| L0 | Assist only | |
| L1 | Suggest + human confirm | |
| L2 | Act in narrow band + audit | |
| L3 | Act broadly + exception queue | |
| L4 | Autonomous | |

Declared launch level: **L___** · Promotion only via eval result, not vibe.

Known failure classes and acceptable rates:

| Failure class | Acceptable rate | Guardrail |
|---------------|-----------------|-----------|
| | | |

## 4. Cost-per-outcome budget

| | Value |
|--|-------|
| Outcome definition | |
| Target cost per outcome (to the cent) before GA | $ |
| Two levers most likely to halve cost | 1. … 2. … |

Ship when: golden suite passes **and** cost is in budget.

## 5. Platform mapping (Studio Product Framework)

Defaults — do not re-pick unless a hard constraint is listed on `docs/engineering-blueprint.md`:

| Concern | Use |
|---------|-----|
| Money / credits / inference | `@studio/effect-critical` + wallet / Autumn |
| Runtime agent work | `@studio/ai-runtime` + sandbox (**Port** until provider wired) |
| Auth / control plane | Clerk + Convex |
| Subscriptions | **Polar** (Shipped) and/or Stripe (Port) |
| Product / error truth | PostHog + Sentry |
| LLM traces | Langfuse |
| Design system | Utopia DS / designer pack / generate — `integrate-design-system` |
| AI placement | Workflow-embedded job (default) vs conversational UI — `docs/ai-in-workflow.md` |

Fill the full stack choices on **[docs/engineering-blueprint.md](../../../docs/engineering-blueprint.md)** before bootstrap.

## Commit checklist

- [ ] Job sentence filled
- [ ] ≥5 golden cases with artefacts
- [ ] Autonomy level declared
- [ ] Cost-per-outcome budget set
- [ ] AI placement declared (workflow-embedded default)
- [ ] Engineering blueprint started / linked
- [ ] Problem scorecard ≥32 and evidence ladder signed
- [ ] Human confirmed: invent/wedge is human-owned (agents do not invent the wedge)

Human sign-off (commit line): _______________
