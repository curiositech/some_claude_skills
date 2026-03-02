# Retry Patterns Reference

Consult this file when implementing retry logic, backoff strategies, circuit breakers, or dead letter queue handling.

---

## Exponential Backoff Formulas

### Basic Exponential Backoff

```
delay = base * (multiplier ^ attempt)
```

- `base`: Starting delay (e.g., 100ms)
- `multiplier`: Growth factor (typically 2)
- `attempt`: Zero-indexed attempt number

Example: 100ms, 200ms, 400ms, 800ms, 1600ms...

**Problem**: All retrying clients synchronize on the same delay, causing thundering herd when a service recovers.

### Full Jitter (Recommended for Most Cases)

```
delay = random(0, min(cap, base * (2 ^ attempt)))
```

Adds full randomization across the entire range. Produces the best throughput distribution when many clients retry simultaneously.

```typescript
function retryDelay(attempt: number, base = 100, cap = 30_000): number {
  const exponential = Math.min(cap, base * Math.pow(2, attempt));
  return Math.random() * exponential; // full jitter
}
```

### Equal Jitter

```
temp = min(cap, base * (2 ^ attempt))
delay = temp/2 + random(0, temp/2)
```

Guarantees a minimum wait (temp/2) while adding jitter. Useful when you want some delay guaranteed but still want distribution.

### Decorrelated Jitter (AWS Recommendation)

```
delay = min(cap, random(base, prev_delay * 3))
```

Each retry is uncorrelated from the previous. Best when clients have different base delays or retry independently.

```typescript
function* decorrelatedBackoff(base = 100, cap = 30_000) {
  let prev = base;
  while (true) {
    const next = Math.min(cap, base + Math.random() * (prev * 3 - base));
    prev = next;
    yield next;
  }
}
```

---

## Retry Decision Matrix

| Error Type | HTTP Status | Retry? | Strategy |
|---|---|---|---|
| Transient network | 0, ECONNRESET | Yes | Full jitter backoff |
| Rate limit | 429 | Yes | Use `Retry-After` header |
| Service unavailable | 503 | Yes | Full jitter backoff |
| Gateway timeout | 504 | Yes | Full jitter backoff |
| Bad request | 400 | No | Permanent failure |
| Unauthorized | 401 | No | Refresh token first, then retry once |
| Forbidden | 403 | No | Permanent failure |
| Not found | 404 | No | Permanent failure |
| Conflict | 409 | Maybe | Depends on idempotency |
| Internal server error | 500 | Maybe | Once with delay; escalate if persists |

---

## Circuit Breaker Pattern

The circuit breaker prevents cascading failures by stopping requests to a failing dependency before it overwhelms or queues endlessly.

### States

```
CLOSED ──(failure threshold exceeded)──► OPEN
  ▲                                        │
  │                                        │ (timeout elapsed)
  └──(probe succeeds)──── HALF-OPEN ◄──────┘
                               │
                      (probe fails)
                               │
                               ▼
                             OPEN (reset timeout)
```

### Implementation (TypeScript)

```typescript
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number;     // failures before opening
  successThreshold: number;     // successes in HALF_OPEN before closing
  openTimeoutMs: number;        // how long to stay OPEN before probing
  requestTimeoutMs: number;     // individual request timeout
}

class CircuitBreaker<T> {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private openedAt: number | null = null;

  constructor(
    private fn: () => Promise<T>,
    private config: CircuitBreakerConfig
  ) {}

  async call(): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt! < this.config.openTimeoutMs) {
        throw new CircuitOpenError('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
      this.successes = 0;
    }

    try {
      const result = await Promise.race([
        this.fn(),
        this.timeout(),
      ]);
      this.onSuccess();
      return result;
    } catch (e) {
      this.onFailure();
      throw e;
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = 'CLOSED';
      }
    }
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
    }
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.openedAt = Date.now();
    }
  }

  private timeout(): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new TimeoutError('Request timed out')), this.config.requestTimeoutMs)
    );
  }
}
```

### Configuration Guidelines

| Dependency Type | Failure Threshold | Open Timeout | Notes |
|---|---|---|---|
| External payment API | 5 | 60s | Low tolerance, long recovery |
| Internal microservice | 10 | 30s | Higher tolerance |
| Database primary | 3 | 10s | Fail fast, failover fast |
| Cache (Redis) | 20 | 5s | Degrade gracefully without cache |
| Email provider | 5 | 120s | External SLA, long cool-down |

---

## Dead Letter Queue (DLQ) Patterns

Messages that have exhausted retries go to a DLQ rather than being discarded.

### When to Use DLQ

- Background job failed all retries (permanent or unknown failure)
- Message processing is non-idempotent and failed partway through
- You need auditability of all failures
- Human review or manual replay may be needed later

### DLQ Message Schema

```typescript
interface DLQMessage<T> {
  // Original message
  originalMessage: T;
  originalQueue: string;

  // Failure metadata
  failureReason: string;
  failureCode: string;
  lastAttemptAt: string;        // ISO 8601
  totalAttempts: number;
  errorStack?: string;          // sanitized — no secrets

  // Routing metadata
  messageId: string;
  correlationId: string;
  enqueuedAt: string;
  dlqEnqueuedAt: string;

  // Replay support
  replayable: boolean;          // false if side effects partially applied
  replayInstructions?: string;  // human-readable notes for operators
}
```

### DLQ Strategies

**Alarm on DLQ depth**: Alert when DLQ grows beyond expected volume. Silence on DLQ growth = hidden failures accumulating.

**Replay pipeline**: Build a separate process to inspect DLQ messages and replay them to the original queue after root cause is fixed. Never replay blindly — check idempotency first.

**DLQ TTL**: Set expiration on DLQ messages (7-30 days). After expiry, log a final failure metric and discard. Indefinite DLQ retention causes storage bloat and operational debt.

**Separate DLQs per severity**: High-value failures (payment processing) → monitored DLQ with pager. Low-value (analytics events) → silent DLQ with daily review.

---

## Python Retry Implementation

```python
import asyncio
import random
import logging
from functools import wraps
from typing import TypeVar, Callable, Awaitable

T = TypeVar('T')
logger = logging.getLogger(__name__)


def with_retry(
    max_attempts: int = 3,
    base_delay: float = 0.1,       # seconds
    max_delay: float = 30.0,
    retryable_exceptions: tuple = (Exception,),
    jitter: bool = True,
):
    """Decorator for async functions with exponential backoff + full jitter."""
    def decorator(fn: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
        @wraps(fn)
        async def wrapper(*args, **kwargs) -> T:
            for attempt in range(max_attempts):
                try:
                    return await fn(*args, **kwargs)
                except retryable_exceptions as e:
                    if attempt == max_attempts - 1:
                        logger.error(
                            "Max retries exceeded",
                            extra={"function": fn.__name__, "attempts": attempt + 1, "error": str(e)}
                        )
                        raise

                    delay = min(max_delay, base_delay * (2 ** attempt))
                    if jitter:
                        delay = random.uniform(0, delay)

                    logger.warning(
                        "Retrying after error",
                        extra={"function": fn.__name__, "attempt": attempt + 1, "delay": delay, "error": str(e)}
                    )
                    await asyncio.sleep(delay)
            raise RuntimeError("Unreachable")  # type checker satisfaction
        return wrapper
    return decorator


# Usage
@with_retry(max_attempts=3, retryable_exceptions=(aiohttp.ClientError, asyncio.TimeoutError))
async def fetch_user(user_id: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(f"/api/users/{user_id}", timeout=aiohttp.ClientTimeout(total=5)) as resp:
            resp.raise_for_status()
            return await resp.json()
```

---

## Idempotency and Retry Safety

Before retrying any operation, confirm it is idempotent or make it idempotent:

**Naturally idempotent**: GET, PUT (full replacement), DELETE (on already-deleted resource)
**Not idempotent by default**: POST (creates new record), PATCH (incremental update), financial debits

**Making POST idempotent**: Idempotency keys. Send a client-generated UUID with every request. Server stores the key and returns the same response for duplicate requests within a TTL window.

```typescript
// Client sends idempotency key
await fetch('/api/payments', {
  method: 'POST',
  headers: {
    'Idempotency-Key': crypto.randomUUID(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(paymentData),
});

// Server checks key in Redis before processing
const existing = await redis.get(`idempotency:${key}`);
if (existing) return JSON.parse(existing); // replay cached response
```

Store idempotency results for 24-48 hours. Use a key namespace that includes the operation type to prevent cross-operation collisions.
