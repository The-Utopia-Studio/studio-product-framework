# Discovery artifacts (commit gate)

Fill these **before** a committed build (`bootstrap-ai-product` / major `scaffold-product-feature`).

Methodology lives in [Icarus](https://the-utopia-studio.github.io/Icarus/) (Utopia Studio playbook). This folder is the **actionable gate** — files agents and humans check, not another essay.

| File | Purpose | Required for commit |
|------|---------|---------------------|
| `problem-scorecard.md` | Eight-dimension problem quality (≥32/40) | Yes |
| `evidence-ladder.md` | Weighted evidence (money > opinion) | Yes |
| `eval-first-spec.md` | Scorable scope: job, golden cases, autonomy, cost | Yes |
| `pilot-term-sheet.md` | Six-term paid pilot | Yes for v1 launch |

**Status for this reference monorepo:** platform plumbing — discovery files stay as templates until a venture product is scoped.

Gate loop: `agents/loops/commit-v1.md`
