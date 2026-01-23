# Advanced Caching Strategies

Production patterns for dramatically faster GitHub Actions workflows using intelligent caching.

## Why Caching Matters

**Impact**: Reduces build times by 50-90%
- Typical `npm install`: 2-5 minutes → 30 seconds with cache
- Docker builds: 10 minutes → 2 minutes with layer caching
- Test databases: 1 minute setup → 5 seconds from cache

---

## Pattern 1: npm Dependencies (Basic)

```yaml
- name: Cache npm dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**How it works**:
- `key`: Exact cache match (hash of package-lock.json)
- `restore-keys`: Fallback if exact match fails
- Cache invalidated when package-lock.json changes

**Alternative**: Use setup-node built-in caching
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: 'npm'  # Automatic caching
```

---

## Pattern 2: Multiple Cache Paths

Cache multiple directories for monorepos.

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ~/.cache
      node_modules
      **/node_modules
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-deps-
```

---

## Pattern 3: Docker Layer Caching

Dramatically speed up Docker builds.

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myapp:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**mode=max**: Cache all layers (not just final image)

**Impact**:
- First build: 10 minutes
- Cached build (no changes): 20 seconds
- Cached build (code changes): 2 minutes

---

## Pattern 4: Conditional Caching (Cache Only on Main)

Save cache space by only caching on main branch.

```yaml
- uses: actions/cache@v4
  id: cache
  with:
    path: node_modules
    key: ${{ runner.os }}-deps-${{ hashFiles('package-lock.json') }}

- name: Install dependencies
  if: steps.cache.outputs.cache-hit != 'true'
  run: npm ci

- name: Save cache
  if: github.ref == 'refs/heads/main' && steps.cache.outputs.cache-hit != 'true'
  uses: actions/cache/save@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-deps-${{ hashFiles('package-lock.json') }}
```

---

## Pattern 5: Build Output Caching

Cache compiled assets across jobs.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Check if build exists in cache
      - uses: actions/cache@v4
        id: build-cache
        with:
          path: dist/
          key: build-${{ hashFiles('src/**') }}

      # Only build if cache miss
      - name: Build
        if: steps.build-cache.outputs.cache-hit != 'true'
        run: npm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Restore build from cache
      - uses: actions/cache@v4
        with:
          path: dist/
          key: build-${{ hashFiles('src/**') }}

      - run: npm test
```

---

## Pattern 6: Test Database Caching

Cache test database setup.

```yaml
- name: Cache PostgreSQL data
  uses: actions/cache@v4
  with:
    path: |
      /var/lib/postgresql/data
      ~/.pgdata
    key: postgres-${{ hashFiles('**/schema.sql') }}

- name: Start PostgreSQL
  run: |
    if [ ! -d "$HOME/.pgdata" ]; then
      # First time: initialize and seed
      docker run -d -p 5432:5432 \
        -e POSTGRES_PASSWORD=test \
        -v $HOME/.pgdata:/var/lib/postgresql/data \
        postgres:15
      sleep 5
      psql -f schema.sql
      psql -f seeds.sql
    else
      # Cached: just start
      docker run -d -p 5432:5432 \
        -v $HOME/.pgdata:/var/lib/postgresql/data \
        postgres:15
    fi
```

---

## Pattern 7: Turbo/Nx Incremental Builds

Cache build outputs for monorepo tools.

```yaml
# Turborepo
- uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      turbo-${{ runner.os }}-

- run: npx turbo build --cache-dir=.turbo

# Nx
- uses: actions/cache@v4
  with:
    path: |
      node_modules/.cache/nx
      .nx/cache
    key: nx-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      nx-${{ runner.os }}-

- run: npx nx run-many --target=build --all
```

---

## Pattern 8: Pip Dependencies (Python)

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'

# Or manual:
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```

---

## Pattern 9: Cargo Dependencies (Rust)

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.cargo/bin/
      ~/.cargo/registry/index/
      ~/.cargo/registry/cache/
      ~/.cargo/git/db/
      target/
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
```

---

## Pattern 10: Gradle Dependencies (Java)

```yaml
- uses: actions/setup-java@v4
  with:
    java-version: '17'
    distribution: 'temurin'
    cache: 'gradle'

# Or manual:
- uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
```

---

## Cache Management

### Cache Limits

- **Per repository**: 10 GB total
- **Per cache entry**: No hard limit (but slow if &gt;1 GB)
- **Retention**: 7 days if not accessed

### Monitoring Cache Usage

```bash
# List caches
gh api repos/{owner}/{repo}/actions/caches

# Delete specific cache
gh api -X DELETE repos/{owner}/{repo}/actions/caches/{cache_id}
```

### Cache Eviction Strategy

Oldest caches are deleted first when limit reached.

**Best practices**:
- Use specific cache keys (include hash)
- Clean up old caches regularly
- Limit cache size (compress if needed)

---

## Advanced Patterns

### Pattern 11: Parallel Job Caching

Share cache between parallel matrix jobs.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [16, 18, 20]
    steps:
      - uses: actions/cache@v4
        with:
          path: ~/.npm
          key: npm-${{ matrix.node }}-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            npm-${{ matrix.node }}-
            npm-  # Fallback to any Node version
```

### Pattern 12: Compression Before Caching

For large directories.

```yaml
- name: Compress node_modules
  run: tar -czf node_modules.tar.gz node_modules

- uses: actions/cache@v4
  with:
    path: node_modules.tar.gz
    key: deps-${{ hashFiles('package-lock.json') }}

- name: Extract if cache hit
  if: steps.cache.outputs.cache-hit == 'true'
  run: tar -xzf node_modules.tar.gz
```

### Pattern 13: Warm Cache (Pre-populate)

Run a scheduled workflow to keep caches warm.

```yaml
name: Warm Cache

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  warm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/cache@v4
        with:
          path: ~/.npm
          key: warm-${{ hashFiles('package-lock.json') }}

      - run: npm ci
```

---

## Troubleshooting

### Cache Not Restored

**Symptom**: Build always slow, cache never hits

**Fixes**:
1. Check cache key matches exactly
2. Verify path exists
3. Ensure cache was saved in previous run

**Debug**:
```yaml
- name: Debug cache
  run: |
    echo "Cache key: ${{ runner.os }}-deps-${{ hashFiles('package-lock.json') }}"
    ls -la ~/.npm || echo "Cache directory doesn't exist"
```

### Cache Too Large

**Symptom**: Warning "Cache size exceeds limit"

**Fixes**:
1. Compress before caching
2. Exclude unnecessary files
3. Split into multiple caches

### Stale Cache

**Symptom**: Using old dependencies despite package-lock.json change

**Fix**: Clear caches manually or change cache key format

---

## Production Checklist

```
□ Dependencies cached (npm/pip/cargo/etc.)
□ Build outputs cached between jobs
□ Docker layer caching enabled
□ Cache keys include file hashes
□ Restore-keys provide fallbacks
□ Cache size monitored (< 1 GB per entry)
□ Conditional saving (main branch only)
□ Cache invalidation strategy defined
□ Compression used for large caches
□ Warm cache scheduled for main branch
```

---

## Performance Metrics

Track cache effectiveness:

```yaml
- name: Cache metrics
  run: |
    if [ "${{ steps.cache.outputs.cache-hit }}" == "true" ]; then
      echo "✅ Cache hit - saved time"
    else
      echo "⚠️  Cache miss - will save for next run"
    fi
```

---

## Resources

- [GitHub Actions Cache Docs](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [actions/cache README](https://github.com/actions/cache)
- [Cache Limits](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows#usage-limits-and-eviction-policy)
