# Style Guide — Utopia Studio (project)

Customized from [Icarus](https://the-utopia-studio.github.io/Icarus/) for Studio Product Framework diagrams.

Source: `https://the-utopia-studio.github.io/Icarus/` — CSS vars `--brick-red`, `--black`, `--light-grey`, `--white`, `--black-80/60`.

## Tokens

| Role | Value | Notes |
|---|---|---|
| `paper` | `#F8F8F8` | Icarus `--white` |
| `paper-2` | `#EEEEEE` | Icarus `--light-grey` |
| `ink` | `#3C3235` | Icarus `--black` |
| `muted` | `#635B5E` | Icarus `--black-80` |
| `soft` | `#8F898B` | Icarus `--black-60` |
| `rule` | `rgba(60,50,53,0.12)` | ink @ 0.12 |
| `rule-solid` | `rgba(143,137,139,0.25)` | |
| `accent` | `#CC5536` | Icarus `--brick-red` |
| `accent-tint` | `rgba(204,85,54,0.08)` | |
| `link` | `#3A5F8A` | External/API (no brand blue; cool complement) |

## Typography

| Role | Family | Fallback |
|---|---|---|
| `title` | Instrument Serif | Editorial H1 (Icarus has no serif) |
| `node-name` | Geist | TWK Lausanne unavailable on Google Fonts |
| `sublabel` / `eyebrow` | JetBrains Mono | Icarus `--font-mono` (intentional brand match) |

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

Accent gate: this file’s `accent` is `#CC5536` (not the skill default `#b5523a`) — treat as customized.
