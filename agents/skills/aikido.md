---
name: aikido
description: >
  Clear Aikido Security findings (SAST, SCA, secrets, IaC, AI pentest).
  Use when the user asks for Aikido / pen test / security scan cleanup,
  or before ship-ready when Aikido is installed on the repo.
---

# Aikido Security

**Product:** https://www.aikido.dev — unified security from code → cloud → runtime, including AI-assisted pentesting.

SPF uses Aikido as the **security / pen-test lane** alongside Greptile (code review) and Rams (design).

## Install (once per org/repo)

1. Sign up at https://app.aikido.dev/login  
2. Connect the GitHub org / `studio-product-framework` (and venture repos)  
3. Enable scanning on PRs + default branch  
4. Optionally enable **Attack** (AI pentest) for staging URLs before major launches  

## Agent workflow

1. Open the latest Aikido findings for this PR or default branch (GitHub checks, Aikido dashboard, or PR comments).  
2. Prioritize **critical / high** reachable issues first (authz, injection, secrets, dependency CVEs with exploit path).  
3. Fix in the smallest correct diff — never “silence” by disabling scanners without a documented exception.  
4. Re-run / wait for Aikido check green.  
5. For launch gates: request an **Attack** pentest on staging; attach the report link in the PR or release notes.

## Hard rules (SPF)

- Do not weaken Convex auth, webhook verification, or Effect money paths to clear a false positive — fix the finding or document why it is not exploitable.  
- Secrets: rotate immediately; never commit “fixed by ignoring.”  
- Pair with `agents/skills/greploop.md` for review comments and `ship-ready-pr` before merge.

## Done when

- No unresolved **critical/high** Aikido findings on the change, **or** each remaining item has an owner + ticket + risk note.  
- Pentest (when requested) report linked and blockers fixed.
