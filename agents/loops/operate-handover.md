---
name: operate-handover
description: >
  Handover / operate loop — teach operators to run Studio loops themselves after
  delivery. Aligns with delivery policy: 1–2 feedback iterations, then self-serve.
  Use at client handover or when reducing Studio tweak load.
---

# Loop: operate & handover

## Goal

Leave the operator (client or internal) able to **change the product themselves** via builder agents + loops — not dependent on Studio for endless minor tweaks.

## Delivery policy (explicit)

1. Take feedback; do **one or two** iterations.
2. Draw the line: further changes are **operator-owned**.
3. Handover = working system + this loop + env access + GitHub Apps installed.
4. Studio may still support **money/trust** incidents and platform upgrades — not polish tickets.

## Steps

### 1. Confirm the system is operable

- [ ] Repo access (org) + branch protection understood
- [ ] Greptile + Rams installed on the repo
- [ ] Env documented (`apps/web/.env.example`); secrets in their vault
- [ ] `pnpm typecheck` / `pnpm lint` / Convex dev path known
- [ ] Capability map shared: `docs/capabilities.md`

### 2. Teach the three loops they will use

| Need | Loop / skill |
|------|----------------|
| Change UI/feature | `scaffold-product-feature` → `ship-ready-pr` |
| Clear review debt | `greploop` + `rams` |
| Improve foundation | `research` → `improve-framework` (optional; usually Studio-led) |

Give them `agents/AGENTS.md` as the agent entrypoint. Prefer Cursor (or equivalent) with this repo open — agents read the same monorepo humans do.

### 3. Run one supervised change (optional but recommended)

Pick a **small**, non-billing tweak. Operator (or their agent) drives; Studio watches one time. Outcome: they see ship-ready + greploop work end-to-end.

### 4. Draw the line in writing

Paste into the handover note / Slack / ticket:

> We delivered a system you can operate. We will take feedback for one or two iterations. After that, product tweaks run through your team using the Studio agent loops (`agents/`). We remain available for platform / billing / security issues — not endless minor UI changes.

### 5. Artifacts

Write or update (in their project or this repo’s ops notes if internal):

- Handover checklist (this file, checked)
- Who owns merge rights
- Kill switch: who can stop improve loops / revoke agent tokens

## Done when

- [ ] Operator knows where `agents/` and `docs/` live
- [ ] Policy sentence delivered (draw the line)
- [ ] Apps installed; env ownership clear
- [ ] Studio not the default path for minor tweaks

## Forbidden

- Promising ongoing polish retainers as “handover”
- Skipping review apps “to make it easier”
- Handing over with Effect/wallet paths undocumented if they use credits
