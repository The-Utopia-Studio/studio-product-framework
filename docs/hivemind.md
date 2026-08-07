# Hivemind — team shared agent memory

**Share this doc with every engineer.** Goal: every coding agent on the team (Cursor, Claude Code, Codex, …) captures sessions into one Utopia Studio brain and recalls prior work automatically.

Product: [deeplake.ai/hivemind](https://deeplake.ai/hivemind) · Source: [activeloopai/hivemind](https://github.com/activeloopai/hivemind)

## Why we use it

| Layer | What it owns | Where |
|-------|----------------|-------|
| **Git (`agents/`, `docs/`)** | Hard rules, loops, durable skills | Versioned, reviewable |
| **Hivemind** | Session traces, wiki summaries, emergent skills from real work | Deeplake org/workspace |

Hivemind does **not** replace `AGENTS.md`, loops, or committed skills. It fills the gap git cannot: “what did we figure out last Tuesday across Cursor and Claude?”

## Team topology (do this once)

Think Slack: **one org, many workspaces**.

| Resource | Name | Who |
|----------|------|-----|
| Org | Utopia Studio (or The Utopia Studio) | Admin creates |
| Workspace | `studio-product-framework` | This monorepo — all SPF engineers |
| Workspace | `venture-<customer>` | Per customer product (optional, isolate leakage) |
| Roles | `ADMIN` (1–2), `WRITE` (engineers), `READ` (observers) | Invite carefully |

**Rule:** anything captured in a workspace is readable by everyone in that workspace. Do not mix personal side projects or unrelated client secrets into `studio-product-framework`.

---

## Admin checklist (one person)

1. Create account / org at [deeplake.ai](https://deeplake.ai).
2. Create workspace **`studio-product-framework`**.
3. Invite every engineer with **WRITE** (admins: **ADMIN**).
4. Copy the org id from the Deeplake UI / `hivemind whoami` after login.
5. Update the committed [`.hivemind`](../.hivemind) at the monorepo root:

```json
{
  "orgId": "<paste-org-id>",
  "workspaceId": "studio-product-framework",
  "collect": true
}
```

6. Commit and push that change so clones inherit routing.
7. Optional but recommended for Studio: enable **BYOC** (own S3 / GCS / Azure) if company policy requires data in our cloud — see [product security section](https://deeplake.ai/hivemind).
8. Ping the team: “Install Hivemind today — follow Engineer checklist below.”

---

## Engineer checklist (everyone)

**Prereqs:** Node **22+** preferred (20 often works with an engine warning). Cursor **1.7+** if using Cursor.

### 1. Install

```bash
# All assistants on this machine (recommended)
curl -fsSL https://deeplake.ai/hivemind.sh | sh

# Or npm:
npm i -g @deeplake/hivemind && hivemind install
```

Cursor-only:

```bash
hivemind cursor install
```

### 2. Sign in

Browser SSO opens during install, or:

```bash
hivemind login
```

Confirm identity and workspace:

```bash
hivemind status
hivemind whoami   # if available in your CLI version
```

You must land in org **Utopia Studio** / workspace **`studio-product-framework`** when working in this repo. The committed `.hivemind` pins workspace routing; after admin adds `orgId`, session start should show something like:

`org: … (workspace: studio-product-framework) · routed by ./.hivemind`

### 3. Restart assistants

Fully quit and reopen **Cursor** (and Claude Code / Codex if installed). Hooks do not load until restart.

### 4. Trust hooks

If Cursor/Codex prompts to review hooks → choose **Trust all and continue**. Without trust, Hivemind stays inactive.

### 5. Smoke test (required)

In this repo, start an agent session and ask:

> Search Hivemind / team memory: what workspace am I writing to? Summarize any prior sessions about Convex or shipping PRs.

Then run a short real task (e.g. “list hard rules from AGENTS.md”). End the session. Confirm:

```bash
hivemind status
# Optional: browse local virtual FS after sync
ls ~/.deeplake/memory/summaries/ 2>/dev/null || true
```

If capture is dead: re-run `hivemind cursor install`, restart Cursor, check `HIVEMIND_CAPTURE` is not `false`, and that hooks were trusted.

### 6. Stay on the shared brain

- Work inside this monorepo so `.hivemind` routes correctly.
- Personal opt-out for a tree: create **untracked** `.hivemind.local` with `{ "collect": false }` (gitignored).
- One-off sensitive session: `HIVEMIND_CAPTURE=false` before launching the agent.
- Do **not** `hivemind org switch` into a personal org and keep coding here expecting team memory — the pin may still apply, but mixed identities cause confusion. Prefer one Studio login.

---

## Day-to-day usage (keep it active)

Agents auto-capture prompts, tool calls, and responses. Prefer **asking** over re-deriving:

- “Have we seen this Convex / OOM / pagination issue before?”
- “What did we decide about Polar vs Autumn for this product?”
- “Pick up where yesterday’s session left the billing scaffold.”
- “What skills has the team codified for migrations?”

After hard incidents or architecture decisions, close with:

> Write a short team summary of what we decided and why.

That feeds the wiki worker and skill mining so the next engineer’s agent benefits.

### Promote durable patterns into git

Hivemind may auto-write emergent `SKILL.md` files from traces. If a pattern is **framework-true** (always apply), promote it into `agents/skills/` or `docs/` via a normal PR. Hivemind = compounding memory; git = source of truth.

### Disable / debug

| Need | Action |
|------|--------|
| No capture this session | `HIVEMIND_CAPTURE=false` |
| No capture this directory | `.hivemind` or `.hivemind.local` → `{ "collect": false }` |
| Verbose hooks | `HIVEMIND_DEBUG=1` |
| Quieter proactive recall | `HIVEMIND_PROACTIVE_RECALL_DISABLED=1` |
| Better search (optional) | `hivemind embeddings install` (~600 MB) |
| Uninstall | `hivemind uninstall` |

---

## Venture / client isolation

When building a customer product that must not leak into SPF memory:

1. Admin creates workspace `venture-<name>`.
2. At that product’s repo root, commit:

```json
{
  "orgId": "<utopia-org-id>",
  "workspaceId": "venture-<name>",
  "collect": true
}
```

3. Invite only people on that engagement.

Read-only borrow of SPF memory (advanced):

```json
{ "workspaceId": "studio-product-framework", "collect": false }
```

---

## Done definition (team is “live”)

- [ ] Org + `studio-product-framework` workspace exist
- [ ] `.hivemind` committed with `orgId` + `workspaceId`
- [ ] Every engineer: install → login → restart → trust hooks → smoke test
- [ ] At least two engineers can recall each other’s recent session summary
- [ ] Capture left **on** for normal SPF work (`collect: true`)

Questions / enterprise setup: [hello@activeloop.ai](mailto:hello@activeloop.ai) · Framework skill: `agents/skills/hivemind.md`
