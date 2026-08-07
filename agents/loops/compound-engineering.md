---
name: compound-engineering
description: >
  Run the Plan → Work → Review → Compound loop (Every) using SPF artifacts.
  Use for features and framework improve so each unit of work makes the next easier.
---

# Loop: compound engineering (SPF)

**Doctrine:** https://every.to/guides/compound-engineering  
**Plugin (optional):** https://github.com/EveryInc/compound-engineering-plugin  

Core idea: each unit of work should make subsequent units **easier**, not harder. The fourth step — **Compound** — is what traditional AI-assisted coding skips.

## Loop

### 1. Plan (most of the thinking)

- Requirement + constraints  
- Codebase research (patterns already here)  
- External research via **Parallel** (cited) + **Firecrawl** (page bodies) when needed  
- For ventures: `commit-v1` scorecard / evidence / eval-first spec  
- Design short enough to read; get human sign-off on non-trivial work  

Optional harness: Superpowers `brainstorming` + `writing-plans`.

### 2. Work

- Branch / worktree  
- Ponytail `full` — smallest correct diff  
- Implement against the plan; validate with `pnpm typecheck` / lint / tests as you go  
- Respect Convex / Effect / package boundaries  

Optional: Superpowers TDD + subagent-driven-development.

### 3. Review

- Local: Ponytail review of over-build  
- `ship-ready-pr`: Rams → Greptile greploop → Aikido  
- Capture P1/P2 findings; fix before merge  

### 4. Compound (required — do not skip)

Pick ≥1:

| Compound into | How |
|---------------|-----|
| Git skill / loop | New or updated `agents/skills/*` or `agents/loops/*` |
| Learnings | `agents/context/learnings.md` — category of bug prevented |
| Hivemind → git | Promote a keeper per `agents/skills/hivemind.md` |
| Research queue | Defer follow-ups via `research` skill (no silent TODOs) |
| Package port | Extract repeated mechanic into `packages/*` |

If you only merged the feature, you did **assisted** engineering, not compound engineering.

## Overlap note

- **Hivemind** compounds *session memory* across the team.  
- **This loop** compounds *process + repo artifacts*.  
Use both; do not treat Hivemind as a substitute for writing a skill.

## Done when

- [ ] Plan existed before large code  
- [ ] Ship-ready quality bar met  
- [ ] At least one Compound artifact landed in git (or explicit “nothing to compound” with reason)
