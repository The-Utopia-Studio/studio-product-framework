# Studio Product Framework

Builder-agent entrypoint. Full guide: [agents/AGENTS.md](./agents/AGENTS.md)

Quick context:
- [agents/context/principles.md](./agents/context/principles.md)
- [docs/architecture.md](./docs/architecture.md)
- [docs/capabilities.md](./docs/capabilities.md)
- [docs/fellow-day-0.md](./docs/fellow-day-0.md) — venture fellow entry (env tiers → DS → build)
- [docs/engineering-blueprint.md](./docs/engineering-blueprint.md) — 80/90 stack defaults template
- [docs/ai-in-workflow.md](./docs/ai-in-workflow.md) — AI in jobs vs chat/workflow UIs
- [docs/loop-engineering.md](./docs/loop-engineering.md) — bounded self-improve + research + handover
- [docs/tooling.md](./docs/tooling.md) — Rams, Greptile, Aikido, Langfuse, Ponytail, Superpowers, Firecrawl/Parallel/Browserbase, Hivemind
- [docs/hivemind.md](./docs/hivemind.md) — team shared agent memory (install + keep active)
- [docs/production-readiness.md](./docs/production-readiness.md) — architecture verdict + scorecard

Ship: [agents/loops/ship-ready-pr.md](./agents/loops/ship-ready-pr.md) · Improve: [agents/loops/improve-framework.md](./agents/loops/improve-framework.md) · Handover: [agents/loops/operate-handover.md](./agents/loops/operate-handover.md)

Venture commit: [agents/loops/commit-v1.md](./agents/loops/commit-v1.md) · Design system: [agents/loops/integrate-design-system.md](./agents/loops/integrate-design-system.md) · Discovery templates: [agents/context/discovery/](./agents/context/discovery/)

## Agent vocabulary (read before adding a field)

The words for what an agent *is* are owned by the **AgentManifest** —
`schemas/agent-manifest.schema.json` in
[studio-agent-framework](https://github.com/The-Utopia-Studio/studio-agent-framework).
That framework is planned to move into this repo, so the manifest becomes this
repo's own vocabulary. **Do not define a field here that the manifest already
declares** — carry it through verbatim.

Three repos independently invented this vocabulary, and the word "status" now
means three unrelated things, all three of which carry a terminal
`failed`-style value:

| Concept | Field | Owner |
|---|---|---|
| How one run went | `AgentRunStatus` in `packages/ai-runtime` | here |
| Whether the agent is healthy | `operations.health_statuses` | AgentManifest |
| Where a listing sits in the directory | `agents.status` | Agent Inventory |

`AgentRunStatus` keeps its name: it is the only one genuinely about a run. Its
`awaiting_tool` member is still to be renamed `awaiting_human` per the standard
— three files move together (`packages/ai-runtime/src/types.ts`,
`event-log.ts`, and the Convex validator in `apps/web/convex/agentRunsShape.ts`),
and the bidirectional `Infer` assertion in that third file fails the build if
one is missed.

## Learned User Preferences

- Optimize for lift-and-use: production-grade, composable, and easy for both humans and coding agents.
- Build a shared Studio Product Framework for a range of AI-native company apps, not a single product.
- Treat Polar, Stripe, and Autumn as first-class billing paths (subscriptions + credits).
- Keep Effect and runtime agents in scope now; do not defer them.
- Prefer a cleaner shell when it clarifies the framework; evolving the existing tree is also fine.
- Use Rams for design review, Greptile + greploop for code review, Aikido for security/pentest, Langfuse for LLM traces, Ponytail for token-efficient codegen, Superpowers for plan/TDD harness, Parallel/Firecrawl/Browserbase for web jobs, compound-engineering for features, PostHog + Sentry for product/error observability, and Hivemind for shared agent memory across the team.
- Prefer Convex components when they make adding capabilities easier.
- Be critical of framework additions—only keep loop or self-improve pieces that clearly belong.
- Continuous improvement via loop engineering should not depend on a human owning the research/improve cycle.
- After 1–2 Studio feedback iterations, hand operational tweaks to the customer/operator.
- Fellows should be able to take a design system + env tiers + this framework and build without re-deciding the 80/90 stack; AI belongs in domain workflows by default, not chat-dashboard clones.

## Learned Workspace Facts

- This repo is the Studio Product Framework monorepo; GitHub origin is `The-Utopia-Studio/studio-product-framework`.
- The monorepo is intentionally agent-native so web, packages, and agents stay in one context.
- Client never talks to the database—Convex only; Effect fences money, inference, and delivery.
- Builder agents live under `agents/`; runtime agents require sandboxes via `@studio/ai-runtime`.
- Core agent loops include commit-v1 (venture gate), integrate-design-system, bootstrap-ai-product, ship-ready-pr, improve-framework + research queue, and operate-handover.
- Discovery commit artifacts live under `agents/context/discovery/`; Icarus is the external playbook, not duplicated in-repo.
- Fellows use `docs/fellow-day-0.md` + engineering blueprint; AI defaults to workflow-embedded jobs, not chat UI clones.
- Hivemind (Deeplake) is the session/team memory layer; `.hivemind` pins workspace `studio-product-framework`; durable rules stay in git.
- `site/` is the self-contained static GitHub Pages showcase; deployed via `.github/workflows/pages.yml` on push to main/master.
- `agents/loops/compound-engineering.md` is the preferred loop for features and framework-improve (Plan → Work → Review → Compound via Every).
