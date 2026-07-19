---
name: check-pr
description: >
  Check a PR for unresolved review comments (incl. Greptile/Rams), failing
  checks, and incomplete description. Fix and resolve when asked.
---

# Check PR

Requires `gh` authenticated.

## Steps

1. Detect PR: `gh pr view --json number,title,body,state,statusCheckRollup`
2. Wait for pending checks to finish
3. Collect:
   - Failing CI checks
   - Greptile comments / score
   - Rams design-review comments (if present)
   - Human review threads
   - Description TODOs
4. Categorize: actionable / informational / already addressed
5. Report a table; offer to fix actionable items
6. After fixes: commit, push, resolve threads

## Done when

- CI green
- No unresolved actionable Greptile/Rams/human comments (or explicitly deferred)
- Description complete
