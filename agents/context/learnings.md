# Learnings

Append-only log for builder agents. Written by research / improve / ship loops when something non-obvious was discovered or a loop stopped.

Format:

```
## YYYY-MM-DD · <loop> · <one-line title>
- **Context:** …
- **Learning:** …
- **Do not:** …
```

## 2026-07-20 · loop-engineering · bootstrap

- **Context:** Added loop doctrine + research/improve/operate loops.
- **Learning:** Humans own outcomes and merge gates; agents own iteration. Self-recursion max depth 3; no auto-merge. Delivery draws the line after 1–2 feedback iterations (`operate-handover`).
- **Do not:** Add always-on self-modifying agents or research without a queue artifact.
