# Multi-Stage Build Patterns

Advanced multi-stage Dockerfile patterns beyond the basics in SKILL.md.

---

## BuildKit Cache Mounts

BuildKit (Docker 18.09+) supports cache mounts that persist between builds — dramatically faster for package managers.

```dockerfile
# syntax=docker/dockerfile:1

# Node.js with persistent npm cache
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# Python with persistent pip cache
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
COPY . .

# Go with module cache
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -o /server ./cmd/server
```

**Anti-Pattern**: Not using BuildKit cache mounts. Without them, every `npm ci` downloads all packages from scratch. With them, only changed packages are re-downloaded.

---

## Cross-Compilation

### Go Cross-Compile in Docker

```dockerfile
FROM --platform=$BUILDPLATFORM golang:1.22-alpine AS build
ARG TARGETOS TARGETARCH

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -ldflags="-s -w" -o /server ./cmd/server

FROM gcr.io/distroless/static-debian12
COPY --from=build /server /server
ENTRYPOINT ["/server"]
```

Build for multiple platforms:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest .
```

### Rust Cross-Compile

```dockerfile
FROM --platform=$BUILDPLATFORM rust:1.76 AS build
ARG TARGETPLATFORM

RUN case "$TARGETPLATFORM" in \
    "linux/amd64") echo "x86_64-unknown-linux-musl" > /target ;; \
    "linux/arm64") echo "aarch64-unknown-linux-musl" > /target ;; \
    esac

RUN rustup target add $(cat /target)
WORKDIR /app
COPY . .
RUN cargo build --release --target $(cat /target)
RUN cp target/$(cat /target)/release/myapp /myapp

FROM scratch
COPY --from=build /myapp /myapp
ENTRYPOINT ["/myapp"]
```

---

## Monorepo Patterns

### Shared Dependencies, Per-Service Builds

```dockerfile
# Stage 1: Workspace root dependencies
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY services/api/package.json ./services/api/
COPY services/worker/package.json ./services/worker/
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Build shared library
FROM base AS shared-build
COPY packages/shared/ ./packages/shared/
RUN pnpm --filter shared build

# Stage 3: Build API service
FROM shared-build AS api-build
COPY services/api/ ./services/api/
RUN pnpm --filter api build

# Stage 4: Production API image
FROM node:22-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=api-build /app/services/api/dist ./dist
COPY --from=api-build /app/node_modules ./node_modules
RUN adduser -S appuser && chown -R appuser /app
USER appuser
CMD ["node", "dist/index.js"]
```

### Turborepo Docker Integration

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable

# Prune monorepo to only include the target package and its dependencies
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune api --docker

# Install dependencies for pruned subset
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build with full source
COPY --from=pruner /app/out/full/ .
RUN npx turbo build --filter=api

# Production
FROM node:22-alpine
WORKDIR /app
COPY --from=installer /app/services/api/dist ./dist
COPY --from=installer /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

---

## Bun and Deno Patterns

### Bun

```dockerfile
FROM oven/bun:1.1 AS build
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY . .
RUN bun build ./src/index.ts --target=bun --outdir=./dist

FROM oven/bun:1.1-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER bun
EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
```

### Deno

```dockerfile
FROM denoland/deno:2.0 AS build
WORKDIR /app
COPY . .
RUN deno compile --allow-net --allow-read --output=server src/main.ts

FROM gcr.io/distroless/cc-debian12
COPY --from=build /app/server /server
EXPOSE 8000
ENTRYPOINT ["/server"]
```

---

## Development Stage Pattern

Include a `development` target in your multi-stage build:

```dockerfile
# Shared base
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Development: all deps + dev tools
FROM base AS development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# Production deps only
FROM base AS deps
RUN npm ci --only=production

# Build
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
```

Use `target` in docker-compose to select the stage:
```yaml
services:
  app:
    build:
      context: .
      target: development    # Use dev stage
    volumes:
      - .:/app               # Hot reload
```

---

## Secret Handling in Builds

```dockerfile
# syntax=docker/dockerfile:1

# Mount secrets during build (never stored in image layers)
FROM node:22-alpine AS build
WORKDIR /app
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) \
    npm install --registry https://npm.company.com/

# Build with secret:
# docker build --secret id=npm_token,src=.npmrc .
```

**Anti-Pattern**: `COPY .npmrc .` or `ENV NPM_TOKEN=xxx` — these bake secrets into image layers that can be extracted with `docker history`.

---

## Static Analysis Images

### Hadolint (Dockerfile Linting)

```bash
# Lint your Dockerfile
docker run --rm -i hadolint/hadolint < Dockerfile

# With custom config
docker run --rm -i -v $(pwd)/.hadolint.yaml:/.config/hadolint.yaml \
  hadolint/hadolint < Dockerfile
```

### Dive (Image Size Analysis)

```bash
# Analyze layers and wasted space
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive myimage:latest
```
