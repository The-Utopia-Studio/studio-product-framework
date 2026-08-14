# AI in workflow vs workflow UIs

SPF embeds AI as a **product capability** (metered, observed, policy-gated). It does **not** mean every venture ships a chat dashboard.

The reference app’s `/dashboard/chat` and `/api/chat` are a **metered inference demo**, not the recommended product shape.

## Two placements

| Placement | What the user does | When to use |
|-----------|-------------------|-------------|
| **A. AI in the workflow** (default) | Completes a domain job; AI runs on triggers / actions inside that job | 80/90 venture products |
| **B. Workflow UI for AI** | Operates an agent/chat/canvas as the primary surface | Job *is* conversation, copilot, or agent ops |

Most Studio builds should be **A**. Choose **B** only when the eval-first job sentence is conversational.

## Default product shape (A)

```
Trigger (user action, schedule, webhook, upload)
  → Convex action (auth, entitlement, rate limit)
    → Effect fence if money / inference / delivery
      → model / tools / sandbox
    → mutation (persist structured result)
  → UI shows the job outcome (table, doc, status, queue)
```

UI is the **job console**, not a generic chat. Inference may still use OpenRouter + Langfuse; the user may never see a message list.

### Examples

| Good (workflow-embedded) | Weak (chat-first by habit) |
|--------------------------|----------------------------|
| “Parse RFP → scored checklist” button + result panel | Chat: “please score this RFP” |
| Inbox row → “draft reply” → editable draft in thread | Separate chat app for email |
| Crawl finished → agent summarizes → fields on the record | Dump summary into a chatbot |

## When to build a workflow UI (B)

Build chat / agent-run UI when **all** are true:

1. Eval-first job is conversational or multi-turn agent operation  
2. Autonomy level needs a human-in-the-loop transcript or tool trace  
3. Golden cases are dialogue-shaped (not form → artefact)

Then reuse SPF mechanics: wallet debit, `runMeteredInference` or streaming chat, Langfuse, rate limits — behind that UI.

## Builder agents vs runtime agents (do not conflate)

| Kind | Lives in | User |
|------|----------|------|
| **Builder** | `agents/` skills & loops | Fellow / engineer shipping code |
| **Runtime** | `@studio/ai-runtime` + sandbox | End customer of the product |

Fellows use builder loops to *embed* AI into the product. Runtime agents are a **product feature** (Port until sandbox is wired) — not the fellow’s coding agent.

## AI defacto in the *builder* workflow

AI is already the default **how we build**, not a separate “AI settings” screen for fellows:

| Layer | Mechanism |
|-------|-----------|
| Discovery → commit | `score-problem`, `commit-v1`, Icarus artefacts |
| Build | Ponytail + Superpowers + `compound-engineering` |
| Review | Rams, Greptile/greploop, Aikido |
| Memory | Hivemind (session) + git `agents/`/`docs/` (durable) |
| Improve | `research` → queue → `improve-framework` (depth ≤3) |
| Operate | `operate-handover` — operators run the same loops |

Do **not** invent a parallel “workflow UI” for Studio delivery process — the loops *are* the workflow. Product UIs are for customers.

## Metered inference: mechanic, not product

| Mechanic (reuse) | Product surface (choose per venture) |
|------------------|--------------------------------------|
| `inference.runMeteredInference` | Domain result UI |
| HTTP `/api/chat` streaming | Only if placement B |
| Langfuse traces | Ops / cost — not a user feature |
| Autumn + wallet | Entitlement — not a chat widget |

## Checklist (every feature PR that touches AI)

- [ ] Job sentence still true; placement A or B declared on blueprint
- [ ] Auth + entitlement + rate limit on the server
- [ ] Money/inference through Effect / wallet when billed
- [ ] Langfuse on new metered entry points
- [ ] UI shows **job outcome**; chat only if placement B
- [ ] No untrusted runtime agent code in Convex isolate (sandbox required)

## Related

- Fellow path: [fellow-day-0.md](./fellow-day-0.md)
- Blueprint: [engineering-blueprint.md](./engineering-blueprint.md)
- Compose: [composing-capabilities.md](./composing-capabilities.md)
- Runtime package: `packages/ai-runtime`
- Shipped demo (do not copy as product): `apps/web/app/dashboard/chat`
