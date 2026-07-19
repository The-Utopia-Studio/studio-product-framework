# Convex components

Studio Product Framework uses [Convex Components](https://www.convex.dev/components) as the preferred way to add durable platform capabilities — queues, rate limits, billing, storage, agents — without reinventing them.

## Registered in `apps/web/convex/convex.config.ts`

| Component | Package | Purpose |
|-----------|---------|---------|
| **Polar** | `@convex-dev/polar` | Subscription billing (reference path) |
| **Rate Limiter** | `@convex-dev/rate-limiter` | Chat + metered inference limits |
| **Autumn** | `@useautumn/convex` | Credits / usage / Stripe abstraction |

## How to add another component

1. Browse https://www.convex.dev/components  
2. `pnpm --filter @studio/web add <package>`  
3. Register in `convex.config.ts`:

```ts
import widget from "@convex-dev/some-component/convex.config";
app.use(widget);
```

4. Run `npx convex dev` (generates `components` API)  
5. Wrap usage in `apps/web/convex/` orchestration — keep `@studio/*` packages as ports when the mechanic is reusable  
6. Document in this file + `docs/capabilities.md`

## Recommended next components

| Need | Component |
|------|-----------|
| Long-running agent jobs | Workflow |
| Parallel work / queues | Workpool |
| Object storage | R2 |
| RAG | RAG / Agent |
| Persistent AI agents | `@convex-dev/agent` |

## Metered inference vertical

```
Client → inference.runMeteredInference (action)
       → rateLimitGuard (Rate Limiter component)
       → optional Autumn.check(ai_messages)
       → Effect debitAndInfer (wallet ledger + OpenRouter)
       → inferenceStore.recordRun
       → optional Autumn.track
```

Local **wallet** tables are the Effect source of truth. Autumn is the commercial meter when `AUTUMN_SECRET_KEY` is set — reconcile intentionally.
