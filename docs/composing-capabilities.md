# Composing capabilities

Capabilities are **composable blocks**, not a god SDK.

## Good

```ts
import { createPolarCheckout } from "@studio/billing";
import { debitCredits, runInference } from "@studio/effect-critical";
import { startAgentRun } from "@studio/ai-runtime";
```

Each caller chooses which blocks to use and how strict to be.

## Bad

```ts
await studio.doEverything({ mode: "agent-saas" });
```

Hidden control flow and provider coupling make products harder to reason about — for humans and agents.

## Orchestration vs mechanics

**Convex action / app route (orchestration):**

- Auth / ownership
- Entitlement checks
- Status transitions
- User-facing errors
- When to debit credits vs allow free tier

**Package (mechanics):**

- Create checkout URL
- Debit wallet with typed errors
- Call OpenRouter
- Create sandbox session

## Effect boundary

Only enter `@studio/effect-critical` when the operation is money, inference, or trust-critical delivery. Call it from a Convex action; persist outcomes with a mutation afterward.

## AI placement

Compose inference **into the job** (trigger → action → structured result → domain UI). Reuse metered inference / wallet as mechanics. Do not compose a chat dashboard by default — see [ai-in-workflow.md](./ai-in-workflow.md).

## Design system

Visual composition starts from tokens (`integrate-design-system` / `plug-design-system`), not ad-hoc hex in features. Stack defaults live in [engineering-blueprint.md](./engineering-blueprint.md).
