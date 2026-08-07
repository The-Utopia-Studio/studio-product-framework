# Studio Product Framework

Builder-agent entrypoint. Full guide: [agents/AGENTS.md](./agents/AGENTS.md)

Quick context:
- [agents/context/principles.md](./agents/context/principles.md)
- [docs/architecture.md](./docs/architecture.md)
- [docs/capabilities.md](./docs/capabilities.md)
- [docs/loop-engineering.md](./docs/loop-engineering.md) — bounded self-improve + research + handover
- [docs/tooling.md](./docs/tooling.md) — Rams, Greptile/greploop, PostHog, Sentry, Hivemind
- [docs/hivemind.md](./docs/hivemind.md) — team shared agent memory (install + keep active)
- [docs/production-readiness.md](./docs/production-readiness.md) — architecture verdict + scorecard

Ship: [agents/loops/ship-ready-pr.md](./agents/loops/ship-ready-pr.md) · Improve: [agents/loops/improve-framework.md](./agents/loops/improve-framework.md) · Handover: [agents/loops/operate-handover.md](./agents/loops/operate-handover.md)

Venture commit: [agents/loops/commit-v1.md](./agents/loops/commit-v1.md) · Discovery templates: [agents/context/discovery/](./agents/context/discovery/)

## Learned User Preferences

- Optimize for lift-and-use: production-grade, composable, and easy for both humans and coding agents.
- Build a shared Studio Product Framework for a range of AI-native company apps, not a single product.
- Treat Polar, Stripe, and Autumn as first-class billing paths (subscriptions + credits).
- Keep Effect and runtime agents in scope now; do not defer them.
- Prefer a cleaner shell when it clarifies the framework; evolving the existing tree is also fine.
- Use Rams for design review, Greptile + greploop for code review, PostHog + Sentry for observability, and Hivemind for shared agent memory across the team.
- Prefer Convex components when they make adding capabilities easier.
- Be critical of framework additions—only keep loop or self-improve pieces that clearly belong.
- Continuous improvement via loop engineering should not depend on a human owning the research/improve cycle.
- After 1–2 Studio feedback iterations, hand operational tweaks to the customer/operator.

## Learned Workspace Facts

- This repo is the Studio Product Framework monorepo; GitHub origin is `The-Utopia-Studio/studio-product-framework`.
- The monorepo is intentionally agent-native so web, packages, and agents stay in one context.
- Client never talks to the database—Convex only; Effect fences money, inference, and delivery.
- Builder agents live under `agents/`; runtime agents require sandboxes via `@studio/ai-runtime`.
- Core agent loops include commit-v1 (venture gate), ship-ready-pr, improve-framework + research queue, and operate-handover.
- Discovery commit artifacts live under `agents/context/discovery/`; Icarus is the external playbook, not duplicated in-repo.
- Hivemind (Deeplake) is the session/team memory layer; `.hivemind` pins workspace `studio-product-framework`; durable rules stay in git.
