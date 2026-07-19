---
name: add-convex-component
description: Add a Convex component from convex.dev/components into Studio Product Framework
---

# Add a Convex component

Prefer [Convex Components](https://www.convex.dev/components) over custom infra for rate limits, workflows, storage, RAG, billing, agents.

## Steps

1. Pick a component from https://www.convex.dev/components
2. Install into the reference app:
   ```bash
   pnpm --filter @studio/web add <package>
   ```
3. Register in `apps/web/convex/convex.config.ts`:
   ```ts
   import widget from "<package>/convex.config";
   app.use(widget);
   ```
4. Run `npx convex dev` to generate `components` types
5. Add a thin wrapper under `apps/web/convex/` (orchestration)
6. If the mechanic is reusable across products, also expose a port in `packages/*`
7. Update `docs/convex-components.md` and `docs/capabilities.md`

## Rules

- Components are siblings — don’t call sibling internals from another component
- Auth / policy stays in app Convex functions
- Money paths still go through `@studio/effect-critical` when debiting the ledger
