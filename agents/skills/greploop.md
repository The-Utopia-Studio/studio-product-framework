---
name: greploop
description: >
  Iteratively improve a PR until Greptile gives 5/5 confidence with zero
  unresolved comments. Triggers Greptile review, fixes actionable comments,
  pushes, re-triggers. Use when the user wants greploop / Greptile clean PR.
---

# Greploop

Requires: `git`, `gh` authenticated, Greptile GitHub App installed on the repo.

Upstream skill: https://github.com/greptileai/skills (keep this in sync when updating).

## Inputs

Optional PR number. If omitted, detect via `gh pr view`.

## Loop (max 5 iterations)

### 1. Identify PR

```bash
gh pr view --json number,headRefName -q '{number: .number, branch: .headRefName}'
```

### 2. Trigger Greptile (if not already running)

```bash
GREPTILE_STATE=$(gh pr checks <PR_NUMBER> --json name,state | jq -r '.[] | select(.name | test("greptile"; "i")) | .state')
if [ "$GREPTILE_STATE" != "PENDING" ] && [ "$GREPTILE_STATE" != "IN_PROGRESS" ]; then
  gh pr comment <PR_NUMBER> --body "@greptile review"
fi
```

Poll until the Greptile check completes.

### 3. Fetch results

- PR body + issue comments (prefer latest Greptile comment by `updated_at`)
- PR reviews from `greptile-apps[bot]`
- Inline comments via `gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments`
- Parse confidence like `3/5` or `5/5`

### 4. Exit if done

Stop when **5/5** and **zero unresolved actionable comments**, or max iterations.

### 5. Fix + resolve

For each actionable comment: read file, fix, commit, push.

```bash
git add -A
git commit -m "address greptile review feedback (greploop iteration N)"
git push
```

Resolve addressed GitHub review threads via GraphQL `resolveReviewThread`.

### 6. Report

```
Greploop complete.
  Platform:      GitHub
  Iterations:    N
  Confidence:    X/5
  Resolved:      N comments
  Remaining:     N
```

## Studio notes

- Prefer framework patterns in `docs/architecture.md` when Greptile suggests alternatives
- Money/inference paths stay behind `@studio/effect-critical`
- Do not “fix” by weakening auth, validators, or rate limits
