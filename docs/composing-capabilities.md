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
