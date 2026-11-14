# syntax=docker/dockerfile:1
# Build context must be the repository root (monorepo).
# In CapRover, set the Dockerfile path to `apps/api/Dockerfile`.

FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN corepack prepare pnpm@9.10.0 --activate \
  && pnpm install --frozen-lockfile=false
RUN pnpm --filter @repo/api build

FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]
