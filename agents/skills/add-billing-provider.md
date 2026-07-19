---
name: add-billing-provider
description: Wire or extend Polar, Stripe, or Autumn billing capability blocks
---

# Add / extend a billing provider

## Providers

| Provider | Use for |
|----------|---------|
| Polar | Subscriptions |
| Stripe | Subscriptions / payments |
| Autumn | Credits |

## Steps

1. Add or extend a client interface in `packages/billing/src/providers/<provider>.ts`.
2. Export capability blocks from `packages/billing/src/index.ts`.
3. Implement the real SDK calls in a Convex **action** (orchestration), injecting the client.
4. For credit debits that can lose money, call `@studio/effect-critical` wallet helpers — do not debit only in a fire-and-forget mutation.
5. Persist durable entitlement/ledger outcomes via Convex **mutations**.
6. Never trust the client for price, balance, or entitlement.

## Checklist

- [ ] Webhook signature verification (server-side)
- [ ] Idempotency keys on debit/credit
- [ ] Entitlement check before gated features
- [ ] `pnpm typecheck`
