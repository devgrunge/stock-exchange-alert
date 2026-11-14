# syntax=docker/dockerfile:1
# Build context must be the repository root (monorepo).
# In CapRover, set the Dockerfile path to `apps/web/Dockerfile`.

FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN corepack prepare pnpm@9.10.0 --activate \
  && pnpm install --frozen-lockfile=false
RUN pnpm --filter @repo/web build

FROM nginx:alpine AS runner
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
