# Principles (short context pack)

1. Name what can't fail (framework: composition; credit apps: money + inference).
2. Stay high on the abstraction ladder (Convex/Clerk/Vercel) by default.
3. Monorepo is agent infrastructure — one context window.
4. Client never touches the database.
5. Convex is the married backend + DB control plane.
6. Effect only for money, inference, delivery.
7. Runtime agents run in sandboxes; builder agents use `agents/`.
8. Actions orchestrate; packages expose composable capability blocks.
9. PostHog for product truth; Sentry for failure truth; Langfuse for LLM trace/cost truth.
10. Rams reviews design; Greptile + greploop reviews code; Aikido owns security/pentest — before merge.
11. Ponytail ladder for builder agents — smallest correct diff; never cut validation or security.
12. Loops are bounded and recursive; research writes a queue; improve consumes it; humans merge.
13. After delivery: 1–2 feedback iterations, then operators run the loops themselves (`operate-handover`).
14. Venture products: `commit-v1` (scorecard + evidence + eval-first spec) before bootstrap — Icarus thinking, SPF artifacts.
15. Hivemind is the team’s shared agent memory (capture on by default); git (`agents/`, `docs/`) remains durable truth — promote keepers; isolate venture workspaces.
16. Compound engineering: Plan → Work → Review → **Compound** (`agents/loops/compound-engineering.md`) — each change should make the next easier.
17. Web tools: Parallel (cited research) → Firecrawl (page body) → Browserbase (act); do not overlap jobs.
18. Superpowers is the optional day-to-day coding harness; SPF ship-ready + Convex rules still win.
