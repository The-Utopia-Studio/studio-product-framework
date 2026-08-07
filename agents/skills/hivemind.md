# Skill: Hivemind (shared agent memory)

Use when setting up, debugging, or deciding what belongs in Hivemind vs git. Full team runbook: [docs/hivemind.md](../../docs/hivemind.md).

## Doctrine

1. **Hivemind is active by default** in this monorepo (`.hivemind` → workspace `studio-product-framework`).
2. **Git remains source of truth** for hard rules, loops, and durable skills under `agents/` and `docs/`.
3. **Promote, don’t dual-write forever** — if a Hivemind-mined pattern should always apply, open a PR into `agents/skills/` or `docs/`.
4. **Workspace isolation** — venture/client work gets its own Deeplake workspace; never dump secrets or unrelated repos into SPF memory.
5. **Opt out deliberately** — `HIVEMIND_CAPTURE=false` or `{ "collect": false }` for sensitive trees; do not leave capture off as a habit.

## When to lean on recall

- Debugging something that may have been solved before
- Onboarding / “why did we choose X?”
- Multi-session or multi-agent handoffs
- Incident response (“have we seen this error?”)

Ask the agent explicitly if proactive recall misses: *search team memory / Hivemind for …*

## When not to rely on it

- Auth, Effect fences, Convex client rules → already in `agents/AGENTS.md`
- Merge/deploy gates → loops + humans
- Customer PII / credentials → never capture; use opt-out

## Install (engineer)

```bash
curl -fsSL https://deeplake.ai/hivemind.sh | sh
# or: npm i -g @deeplake/hivemind && hivemind install
hivemind cursor install   # if Cursor-only
# restart Cursor; trust hooks; then:
hivemind status
```

## Related

- Team setup guide: `docs/hivemind.md`
- Tooling index: `docs/tooling.md`
- Loop memory (git-audited): `agents/context/learnings.md`
