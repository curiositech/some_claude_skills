---
title: Rate Limiting (Production-Grade)
sidebar_label: Rate Limiting (Production-G...
sidebar_position: 4
---
# Rate Limiting (Production-Grade)

Distributed and adaptive rate limiting implementations.

## Distributed Rate Limiter (Redis)

```python
import asyncio
import time
from dataclasses import dataclass
from collections import defaultdict
import redis.asyncio as redis

@dataclass
class RateLimitConfig:
    requests: int      # Number of requests
    window: int        # Time window in seconds
    burst: int = 0     # Additional burst allowance

class DistributedRateLimiter:
    """
    Token bucket rate limiter with Redis backend.
    Handles distributed deployments and provides consistent limiting
    across multiple bot instances.
    """

    def __init__(self, redis_client: redis.Redis, prefix: str = "ratelimit"):
        self.redis = redis_client
        self.prefix = prefix

    async def is_allowed(self, key: str, config: RateLimitConfig) -> tuple[bool, float]:
        """
        Check if request is allowed under rate limit.
        Returns: (allowed: bool, retry_after: float)
        Uses sliding window log algorithm for accuracy.
        """
        full_key = f"{self.prefix}:{key}"
        now = time.time()
        window_start = now - config.window

        async with self.redis.pipeline(transaction=True) as pipe:
            # Remove old entries
            await pipe.zremrangebyscore(full_key, 0, window_start)
            # Count current entries
            await pipe.zcard(full_key)
            # Add new entry
            await pipe.zadd(full_key, {str(now): now})
            # Set expiry
            await pipe.expire(full_key, config.window + 1)

            results = await pipe.execute()

        current_count = results[1]
        max_allowed = config.requests + config.burst

        if current_count < max_allowed:
            return True, 0

        # Calculate retry time
        oldest = await self.redis.zrange(full_key, 0, 0, withscores=True)
        if oldest:
            retry_after = oldest[0][1] + config.window - now
            return False, max(0, retry_after)

        return False, config.window
```

## Adaptive Rate Limiter (API Response-Based)

```python
class AdaptiveRateLimiter:
    """
    Rate limiter that adapts to API responses.
    Handles Discord's dynamic rate limits, 429s, and global limits.
    """

    def __init__(self):
        self.buckets: dict[str, dict] = defaultdict(lambda: {
            'remaining': float('inf'),
            'reset_at': 0,
            'limit': float('inf')
        })
        self.global_lock = asyncio.Lock()
        self.global_reset_at = 0

    async def acquire(self, bucket: str) -> None:
        """Wait until we can make a request to this bucket."""
        # Check global limit first
        if self.global_reset_at > time.time():
            await asyncio.sleep(self.global_reset_at - time.time())

        bucket_info = self.buckets[bucket]

        if bucket_info['remaining'] <= 0:
            wait_time = bucket_info['reset_at'] - time.time()
            if wait_time > 0:
                await asyncio.sleep(wait_time)

        bucket_info['remaining'] -= 1

    def update_from_headers(self, bucket: str, headers: dict) -> None:
        """Update rate limit info from API response headers."""
        if 'X-RateLimit-Remaining' in headers:
            self.buckets[bucket]['remaining'] = int(headers['X-RateLimit-Remaining'])
        if 'X-RateLimit-Reset' in headers:
            self.buckets[bucket]['reset_at'] = float(headers['X-RateLimit-Reset'])
        if 'X-RateLimit-Limit' in headers:
            self.buckets[bucket]['limit'] = int(headers['X-RateLimit-Limit'])

        # Handle global rate limit
        if headers.get('X-RateLimit-Global'):
            retry_after = float(headers.get('Retry-After', 1))
            self.global_reset_at = time.time() + retry_after
```

## Common Rate Limit Configurations

| Context | Requests | Window | Burst |
|---------|----------|--------|-------|
| User commands | 10 | 60s | 3 |
| API calls per user | 30 | 60s | 5 |
| Guild-wide actions | 100 | 60s | 10 |
| Message spam | 5 | 10s | 2 |
| DM operations | 5 | 30s | 1 |

## Best Practices

1. **Use distributed limiter** for multi-instance deployments
2. **Implement adaptive limits** that respect API response headers
3. **Separate buckets** for different action types (commands, API calls, moderation)
4. **Allow small burst** for bursty but legitimate use patterns
5. **Graceful degradation**: Inform users of retry time instead of silent failure
