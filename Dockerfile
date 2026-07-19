FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/
COPY packages/auth/package.json ./packages/auth/
COPY packages/billing/package.json ./packages/billing/
COPY packages/effect-critical/package.json ./packages/effect-critical/
COPY packages/ai-runtime/package.json ./packages/ai-runtime/
COPY packages/observability/package.json ./packages/observability/
COPY packages/email/package.json ./packages/email/
COPY packages/storage/package.json ./packages/storage/
COPY packages/flags/package.json ./packages/flags/
COPY packages/ratelimit/package.json ./packages/ratelimit/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter @studio/web build

FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
WORKDIR /app
COPY --from=build /app /app
WORKDIR /app/apps/web
CMD ["pnpm", "start"]
