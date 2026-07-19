# Tooling — reviews, analytics, errors

## Rams (design review)

- **Product:** https://www.rams.ai — GitHub App, reviews UI on every PR  
- **Local/agent skill:** `agents/skills/rams.md`  
- **When:** any UI change; always before merge via `ship-ready-pr` loop  

Install: Rams GitHub App → select this repo → open a PR.

## Greptile + greploop (code review)

- **Product:** https://www.greptile.com — GitHub App, full-repo context reviews  
- **Agent skill:** `agents/skills/greploop.md` (iterate to 5/5)  
- **Also:** `agents/skills/check-pr.md`  
- Upstream skills: https://github.com/greptileai/skills  

Install: Greptile GitHub App → enable repo → PRs auto-reviewed. Agents run `/greploop` (or follow the skill) to clear comments.

## PostHog (product analytics + flags)

- Env: `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`  
- Wired in `ObservabilityProvider`  
- Event names: `@studio/observability` → `StudioEvents`  
- Feature flags: evaluate server-side for billing/agent gates (`@studio/flags`)

## Sentry (errors)

- Env: `VITE_SENTRY_DSN` (browser); add server DSN in Convex when wiring Node actions  
- Error boundary reports via `captureAppException`  
- Use for production failures; pair with PostHog for product funnels

## Vercel Analytics

Still mounted in `root.tsx` for web vitals. PostHog owns product analytics; Sentry owns exceptions.
