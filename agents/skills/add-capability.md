---
name: add-capability
description: Add a new composable capability package to Studio Product Framework
---

# Add a capability package

## When

A reusable operational mechanic is needed by 2+ callers, or you are introducing a new provider boundary (billing, storage, inference, etc.).

## Steps

1. Confirm it is **mechanics** (how), not product policy (why/when).
2. Create `packages/<name>/` with:
   - `package.json` name `@studio/<name>`
   - `tsconfig.json` extending `../../tsconfig.base.json`
   - `src/index.ts` exporting capability blocks only
3. Add `"@studio/<name>": "workspace:*"` to consumers.
4. Keep functions:
   - Explicit inputs
   - Structured `Result` or Effect errors
   - No direct DB access
5. Document the capability in `docs/architecture.md` if it changes the map.
6. Run `pnpm typecheck`.

## Anti-patterns

- One giant `doEverything`
- Mutating Convex tables from the package
- Using Effect for non-critical paths
