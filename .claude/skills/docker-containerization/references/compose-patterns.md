# Docker Compose Advanced Patterns

Patterns beyond basic service definitions — profiles, overrides, networking, secrets, and GPU passthrough.

---

## Compose Profiles

Run subsets of services for different workflows:

```yaml
services:
  app:
    build: .
    profiles: []                    # Always runs (no profile = default)

  db:
    image: postgres:16-alpine
    profiles: []                    # Always runs

  redis:
    image: redis:7-alpine
    profiles: ["cache"]             # Only with --profile cache

  worker:
    build: .
    command: ["node", "worker.js"]
    profiles: ["worker"]            # Only with --profile worker

  monitoring:
    image: grafana/grafana
    profiles: ["observability"]     # Only with --profile observability

  prometheus:
    image: prom/prometheus
    profiles: ["observability"]
```

Usage:
```bash
docker compose up                              # app + db only
docker compose --profile cache up              # app + db + redis
docker compose --profile worker --profile cache up  # app + db + redis + worker
docker compose --profile observability up      # app + db + monitoring stack
```

---

## Override Files

Layer configuration for different environments:

```yaml
# docker-compose.yml (base)
services:
  app:
    build: .
    environment:
      NODE_ENV: production

# docker-compose.override.yml (auto-loaded in dev)
services:
  app:
    build:
      target: development
    volumes:
      - .:/app
    environment:
      NODE_ENV: development
      DEBUG: "app:*"

# docker-compose.staging.yml (explicit)
services:
  app:
    image: registry.example.com/app:staging
    environment:
      NODE_ENV: staging
```

Usage:
```bash
# Dev (auto-loads override)
docker compose up

# Staging (explicit file)
docker compose -f docker-compose.yml -f docker-compose.staging.yml up

# Production (skip override)
docker compose -f docker-compose.yml up
```

---

## Service Extensions (DRY)

```yaml
x-common: &common
  restart: unless-stopped
  logging:
    driver: json-file
    options:
      max-size: "10m"
      max-file: "3"
  networks:
    - app-network

x-healthcheck-defaults: &healthcheck-defaults
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 10s

services:
  api:
    <<: *common
    build: ./services/api
    healthcheck:
      <<: *healthcheck-defaults
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]

  worker:
    <<: *common
    build: ./services/worker
    healthcheck:
      <<: *healthcheck-defaults
      test: ["CMD", "node", "-e", "process.exit(0)"]
```

---

## Networking

### Service Discovery

```yaml
services:
  api:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend          # Only reachable from backend network

  nginx:
    networks:
      - frontend         # Only reachable from frontend network
    ports:
      - "80:80"          # Exposed to host

networks:
  frontend:
  backend:
    internal: true       # No internet access
```

Services on the same network can reach each other by service name (e.g., `http://api:3000`).

### External Networks

```yaml
# Connect to a network created outside compose
networks:
  shared:
    external: true
    name: my-shared-network
```

---

## Docker Compose Secrets

### File-Based Secrets

```yaml
services:
  app:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    environment: "API_KEY"         # From env var (Compose v2.23+)
```

Inside the container, secrets are mounted at `/run/secrets/<name>`:
```python
# Read secret in app
with open('/run/secrets/db_password') as f:
    db_password = f.read().strip()
```

### Anti-Pattern: Secrets in Environment

**Wrong**:
```yaml
environment:
  DB_PASSWORD: "hunter2"           # Visible in docker inspect
```

**Right**: Use `secrets:` — they're mounted as files, not visible in container metadata.

---

## GPU Passthrough

### NVIDIA GPU

```yaml
services:
  ml-worker:
    image: pytorch/pytorch:2.0-cuda11.7
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1              # or "all"
              capabilities: [gpu]
    environment:
      NVIDIA_VISIBLE_DEVICES: all
```

Requires: `nvidia-container-toolkit` installed on host.

### Apple Silicon (MPS)

Docker on macOS does NOT pass through Metal/MPS. For GPU workloads on Apple Silicon, run natively or use a VM with GPU passthrough.

---

## Init Containers Pattern

Run setup tasks before the main service:

```yaml
services:
  db-migrate:
    build: .
    command: ["npx", "prisma", "migrate", "deploy"]
    depends_on:
      db:
        condition: service_healthy

  app:
    build: .
    depends_on:
      db-migrate:
        condition: service_completed_successfully
      db:
        condition: service_healthy
```

---

## Volume Patterns

```yaml
services:
  app:
    volumes:
      # Named volume (persistent)
      - pgdata:/var/lib/postgresql/data

      # Bind mount (development hot reload)
      - ./src:/app/src

      # Anonymous volume (prevent host override)
      - /app/node_modules

      # tmpfs (in-memory, not persisted)
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100000000          # 100MB

volumes:
  pgdata:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/postgres       # Specific host path
```

---

## Docker Compose Watch (2024+)

Faster than bind mounts for development:

```yaml
services:
  app:
    build: .
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
          ignore:
            - "**/*.test.ts"

        - action: rebuild
          path: package.json

        - action: sync+restart
          path: ./config
          target: /app/config
```

| Action | When |
|--------|------|
| `sync` | File changes synced to container (hot reload) |
| `rebuild` | Container rebuilt from scratch |
| `sync+restart` | File synced, then container process restarted |

Usage:
```bash
docker compose watch
# or
docker compose up --watch
```

---

## Environment Variable Patterns

```yaml
services:
  app:
    environment:
      # Direct value
      NODE_ENV: production

      # From shell environment (required)
      DATABASE_URL: ${DATABASE_URL}

      # With default
      PORT: ${PORT:-3000}

      # From .env file (auto-loaded)
      API_KEY: ${API_KEY}

    env_file:
      - .env                       # Always loaded
      - .env.local                 # Overrides (gitignored)
```

`.env` file is auto-loaded by Compose. Variables defined in `environment:` take precedence over `env_file:`.

---

## Debugging Compose

```bash
# Show resolved configuration
docker compose config

# Show service logs
docker compose logs -f app

# Execute command in running container
docker compose exec app sh

# Show resource usage
docker compose top

# Rebuild without cache
docker compose build --no-cache

# Remove everything (containers, volumes, networks)
docker compose down -v --remove-orphans
```
