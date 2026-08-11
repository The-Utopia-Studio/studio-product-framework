# Fellow Day-0 — clone → env → design system → build

This is the **venture fellow** entry path. Goal: a non-author can take SPF + a design system + the right env vars and ship a 0→1 product in days — without re-deciding the stack.

If you are changing the framework itself, prefer [getting-started.md](./getting-started.md) + [agents/AGENTS.md](../agents/AGENTS.md).

## What “ready” means

| Ready | Not ready |
|-------|-----------|
| Commit gate signed (or platform exception) | Inventing wedge / autonomy mid-build |
| Env tier filled for your billing + AI shape | Blind-copy of every key in `.env.example` |
| Design system plugged (or generate path started) | Shipping on the Apple/shadcn starter look |
| First vertical = a **golden case job**, not a chat demo | Building a generic chat dashboard by imitation |
| Stack choices taken from the engineering blueprint | Re-picking Convex vs X, Polar vs Y ad hoc |

Honest capability status: [capabilities.md](./capabilities.md) · Scorecard: [production-readiness.md](./production-readiness.md).

## Day-0 sequence (do in order)

```
1. score-problem → commit-v1     (venture products; skip only for SPF plumbing)
2. Fill engineering blueprint    (docs/engineering-blueprint.md — do not re-decide 80/90)
3. Bootstrap env                 (tier matrix below → apps/web/.env.local + Convex dashboard)
4. integrate-design-system       (plug Utopia DS / designer pack, or generate tokens)
5. bootstrap-ai-product          (pnpm + convex + first golden case)
6. compound-engineering / scaffold-product-feature
7. ship-ready-pr                 (Ponytail → Rams → greploop → Aikido)
8. operate-handover              (after 1–2 Studio feedback iterations)
```

Loops live under `agents/loops/`. Skills under `agents/skills/`.

## Accounts & access (ask Studio ops once)

| Need | Who provides |
|------|----------------|
| GitHub access to venture / SPF fork | Studio |
| Clerk application | Fellow or Studio (one app per venture) |
| Convex project | Fellow (`npx convex dev` creates/links) |
| Polar / Stripe / Autumn | Match blueprint billing shape |
| Vercel project | Fellow after first green build |
| Greptile + Rams + Aikido on the repo | Studio org admin (RQ-003) |
| Hivemind workspace | Studio — see [hivemind.md](./hivemind.md); venture isolation = separate Deeplake workspace |
| Design system pack or Utopia DS URL | Designer / Studio |

## Env tiers (required vs optional)

Canonical template: `apps/web/.env.example` → copy to `apps/web/.env.local`.  
Also set **server** secrets in the Convex dashboard for actions (`OPENROUTER_*`, billing webhooks, Langfuse, web tools).

### Tier A — boot the app (Day-0 minimum)

| Var | Where |
|-----|--------|
| `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` | local + Convex |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Next.js |
| `FRONTEND_URL` | local (`http://localhost:3000`) |

**Also required, not an env var:** in the Clerk dashboard, create a JWT
template named exactly `convex` (JWT Templates → New template → Convex).
`apps/web/lib/convex-server.ts` requests this template by name for SSR auth;
without it, server-side auth calls silently get no token and the dashboard
looks broken with no error pointing at the cause.

Done when: sign-in works and dashboard loads.

### Tier B — money (pick from blueprint)

| Shape | Vars |
|-------|------|
| Polar subscriptions (reference path — **Shipped**) | `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER` (`sandbox`\|`production`, defaults to `sandbox`) |
| Stripe subscriptions (**Port** — package only until wired) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Autumn credits (component wired; needs keys) | `AUTUMN_SECRET_KEY` |

Wallet ledger works with starter credits without Autumn. Prefer **Polar** for 80/90 venture subscriptions until Stripe adapter is E2E.

**Important — the dashboard requires an active subscription.** `apps/web/app/dashboard/layout.tsx`
gates the entire dashboard (including chat/credits) behind
`subscriptions.checkUserSubscriptionStatus`. To reach the metered-chat or
pay-as-you-go credit vertical at all, you must first complete a real Polar
sandbox checkout (org + product + price + webhook secret configured, and the
`subscription.created` webhook delivered) — starter credits alone are not
enough to unlock the UI. If you want to test the wallet/credits path without
standing up Polar, that gate is the thing to change.

### Tier C — AI jobs (when golden cases need models)

| Var | Notes |
|-----|--------|
| `OPENROUTER_API_KEY` | Prefer over raw OpenAI for metered vertical |
| `OPENROUTER_MODEL` | Default `openai/gpt-4o-mini` |
| `LANGFUSE_*` | Recommended when metering inference |

Shipped verticals today: `inference.runMeteredInference` (wired to the
`/dashboard/chat` UI) and a second, parallel streaming implementation at
`/api/chat` (`convex/http.ts`) that has no frontend caller yet — a reference
pattern to build on, not a live product surface.
**Do not** treat chat UI as the product — see [ai-in-workflow.md](./ai-in-workflow.md).

### Tier D — recommended product ops

| Var | Tool |
|-----|------|
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | PostHog |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry |

### Tier E — only when the job needs them

| Vars | When |
|------|------|
| `FIRECRAWL_API_KEY` | URL → markdown scrape |
| `PARALLEL_API_KEY` | Cited research / search |
| `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` | Real browser act |
| `SANDBOX_API_KEY` | Runtime agents (**Port** — provider not wired) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email (**Port**) |

## Design system (mandatory for customer-facing ventures)

Starter UI is **not** the brand. Before feature polish:

1. Run `agents/loops/integrate-design-system.md`
2. Input: designer pack **or** [Utopia Design System](https://utopia-design-system.vercel.app/) **or** generate tokens from brand brief
3. Output: CSS variables in `apps/web/styles/globals.css` (+ component swaps if a package exists)
4. Rams on the first UI PR

## First vertical (anti-chat default)

1. Open the signed `eval-first-spec.md` — pick golden case #1.
2. Implement **that job** as auth → Convex action → UI (see [ai-in-workflow.md](./ai-in-workflow.md)).
3. Use chat / `runMeteredInference` only as the **metered inference mechanic**, not as the product surface — unless the job *is* conversational.
4. Prefer `agents/loops/compound-engineering.md`.

## Repo mode (pick one, write it on the blueprint)

| Mode | When |
|------|------|
| **Fork SPF** | Isolated venture; fellow owns the fork; promote keepers back via `improve-framework` |
| **App in monorepo** | Platform work or intentional multi-product — today only `apps/web` exists; treat “add `apps/<product>`” as advanced |

Default for outsourced fellows: **fork + rebrand `apps/web`**, then strip starter marketing.

## Done when (Day-0 exit)

- [ ] Commit gate signed (or platform exception noted)
- [ ] Engineering blueprint filled (billing shape, autonomy, deploy)
- [ ] Tier A env green; Tier B/C as required by blueprint
- [ ] Design system integrated (or generate PR open)
- [ ] First golden-case vertical sketched (not “build a chat app”)
- [ ] Hivemind on for the correct workspace
- [ ] Know who installs Greptile / Rams / Aikido if missing

## Related

- Blueprint template: [engineering-blueprint.md](./engineering-blueprint.md)
- AI placement doctrine: [ai-in-workflow.md](./ai-in-workflow.md)
- Bootstrap loop: `agents/loops/bootstrap-ai-product.md`
- Design system loop: `agents/loops/integrate-design-system.md`
- Discovery playbook (external): [Icarus](https://the-utopia-studio.github.io/Icarus/)
