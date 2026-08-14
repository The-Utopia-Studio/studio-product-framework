# Engineering blueprint — 80/90 stack defaults

Fill **one blueprint per venture** before bootstrap. Fellows do **not** re-pick the platform stack unless a hard constraint is written below.

Copy this file into the venture repo as `docs/engineering-blueprint.md` (or keep a filled copy under `agents/context/discovery/` next to the eval-first spec).

Venture / product: _______________  
Date: _______________ · Fellow: _______________ · Studio lead: _______________

---

## 1. Defaults (use these unless overridden)

| Layer | Default (80/90) | Override only if… |
|-------|-----------------|-------------------|
| Product shell | Next.js App Router · Vercel | Hard SSR/hosting constraint |
| Auth | Clerk | Customer mandates Auth0/WorkOS/etc. |
| Control plane / DB | Convex | Explicit non-Convex mandate (rare) |
| Subscriptions | **Polar** (Shipped reference path) | Customer already on Stripe → use Stripe **Port** + wire E2E |
| Credits | Autumn component + Effect wallet ledger | Credits not in scope → wallet-only / none |
| Critical money / inference / delivery | `@studio/effect-critical` | Never skip for billed AI |
| Metered models | OpenRouter | Customer-locked model vendor |
| LLM traces | Langfuse | — |
| Product analytics / flags | PostHog | — |
| Errors | Sentry | — |
| Design review | Rams | — |
| Code review | Greptile + greploop | — |
| Security | Aikido | — |
| Builder codegen | Ponytail (`full`) + Superpowers (optional) | — |
| Web research / scrape / act | Parallel → Firecrawl → Browserbase | Job needs none |
| Runtime agents | `@studio/ai-runtime` + sandbox | Autonomy L0–L1 only → defer (**sandbox Port**) |
| Shared agent memory | Hivemind (venture workspace) | Sensitive isolation rules |
| Deploy | Vercel + Convex prod | — |

Doctrine: [architecture.md](./architecture.md) · Capability honesty: [capabilities.md](./capabilities.md).

---

## 2. Venture choices (fill)

### Job & autonomy

| Field | Value |
|-------|--------|
| Job sentence (from eval-first) | |
| Autonomy launch level (L0–L4) | L___ |
| AI placement | ☐ Workflow-embedded · ☐ Conversational product · ☐ Both (justify) |
| First golden case # | |

See [ai-in-workflow.md](./ai-in-workflow.md). Default: **workflow-embedded**.

### Billing shape (pick one primary)

| Option | Select | Notes |
|--------|--------|-------|
| Polar subscriptions only | ☐ | Fastest on SPF |
| Polar + Autumn credits | ☐ | Typical AI-metered SaaS |
| Stripe subscriptions | ☐ | Requires wiring Port → E2E |
| Stripe + Autumn | ☐ | |
| Credits-only (Autumn + wallet) | ☐ | |
| None for pilot | ☐ | Still use wallet if metering demos |

### Design system

| Field | Value |
|-------|--------|
| Source | ☐ Utopia DS ([utopia-design-system.vercel.app](https://utopia-design-system.vercel.app/)) · ☐ Designer pack URL/path · ☐ Generate from brand brief |
| Token owner | |
| Component package? (npm / local path) | none / _______________ |
| Rams required on first UI PR | ☑ yes |

### Repo & deploy

| Field | Value |
|-------|--------|
| Repo mode | ☐ Fork SPF · ☐ App in monorepo (advanced) |
| GitHub repo | |
| Vercel project | |
| Convex deployment | dev: _______________ · prod: _______________ |
| Hivemind workspace | ☐ SPF shared · ☐ Venture-isolated: _______________ |

### Env tiers enabled

| Tier | Enabled |
|------|---------|
| A — boot | ☑ |
| B — money | ☐ |
| C — AI jobs | ☐ |
| D — PostHog/Sentry | ☐ (recommended) |
| E — web tools / sandbox / email | ☐ (list): _______________ |

Details: [fellow-day-0.md](./fellow-day-0.md).

---

## 3. Hard constraints (only place for stack deviation)

Write evidence, not taste:

| Constraint | Forced choice | Evidence |
|------------|---------------|----------|
| | | |

If empty → **defaults stand**.

---

## 4. Out of scope for v1 (fence Ports)

Do not block Day-0 on these unless the golden case requires them:

- Stripe E2E (package Port)
- Runtime sandbox provider (Port)
- `@studio/email` / `storage` / `flags` package SDK wiring (Ports)
- Migrating Polar app code into `@studio/billing` adapters (cleanup, not blocker)

---

## 5. Commit checklist

- [ ] Defaults accepted or constraints table filled
- [ ] Billing shape selected
- [ ] Design system source selected
- [ ] AI placement = workflow-embedded unless job is conversational
- [ ] Env tiers marked; secrets plan clear (local + Convex + Vercel)
- [ ] Matches signed `eval-first-spec.md` autonomy + cost budget
- [ ] Human sign-off: _______________

## Related loops

`commit-v1` → fill this blueprint → `integrate-design-system` → `bootstrap-ai-product` → `compound-engineering` → `ship-ready-pr` → `operate-handover`
