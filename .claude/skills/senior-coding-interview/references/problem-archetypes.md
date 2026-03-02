# Problem Archetypes for Senior Coding Interviews

Consult this file when practicing specific problem types. Each archetype includes the problem statement, clarifying questions you should ask, a skeleton solution, and follow-up extensions interviewers commonly request.

All examples are in Python 3.10+ and assume a 40-minute interview window.

---

## 1. In-Memory Key-Value Store

### Problem Statement

Design and implement an in-memory key-value store that supports `get`, `set`, `delete`, and `exists` operations. Keys are strings, values can be any type.

### Clarifying Questions to Ask

1. "Should `get` on a missing key raise an exception or return None?"
2. "Do we need to support TTL (time-to-live) for entries?"
3. "Should operations be thread-safe?"
4. "Is there a maximum capacity? What happens when it's exceeded?"
5. "Do we need transaction support (begin/commit/rollback)?"

### Skeleton

```python
from dataclasses import dataclass, field
from typing import Any
import time


@dataclass
class Entry:
    value: Any
    expires_at: float | None = None

    @property
    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return time.monotonic() > self.expires_at


class KeyValueStore:
    def __init__(self) -> None:
        self._data: dict[str, Entry] = {}

    def set(self, key: str, value: Any, ttl_seconds: float | None = None) -> None:
        expires_at = None
        if ttl_seconds is not None:
            expires_at = time.monotonic() + ttl_seconds
        self._data[key] = Entry(value=value, expires_at=expires_at)

    def get(self, key: str) -> Any:
        entry = self._data.get(key)
        if entry is None:
            raise KeyError(f"Key not found: {key}")
        if entry.is_expired:
            del self._data[key]
            raise KeyError(f"Key expired: {key}")
        return entry.value

    def delete(self, key: str) -> bool:
        """Returns True if key existed and was deleted."""
        if key in self._data:
            del self._data[key]
            return True
        return False

    def exists(self, key: str) -> bool:
        entry = self._data.get(key)
        if entry is None:
            return False
        if entry.is_expired:
            del self._data[key]
            return False
        return True
```

### Follow-Up Extensions

**Extension 1: Transactions**

```python
class KeyValueStore:
    def __init__(self) -> None:
        self._data: dict[str, Entry] = {}
        self._transaction_stack: list[dict[str, Entry | None]] = []

    def begin(self) -> None:
        """Start a new transaction. Transactions can nest."""
        self._transaction_stack.append({})

    def commit(self) -> None:
        """Apply current transaction to parent (or main store)."""
        if not self._transaction_stack:
            raise RuntimeError("No active transaction")
        changes = self._transaction_stack.pop()
        if self._transaction_stack:
            # Merge into parent transaction
            self._transaction_stack[-1].update(changes)
        else:
            # Apply to main store
            for key, entry in changes.items():
                if entry is None:
                    self._data.pop(key, None)
                else:
                    self._data[key] = entry

    def rollback(self) -> None:
        """Discard current transaction."""
        if not self._transaction_stack:
            raise RuntimeError("No active transaction")
        self._transaction_stack.pop()

    def set(self, key: str, value: Any, ttl_seconds: float | None = None) -> None:
        expires_at = None
        if ttl_seconds is not None:
            expires_at = time.monotonic() + ttl_seconds
        entry = Entry(value=value, expires_at=expires_at)
        if self._transaction_stack:
            self._transaction_stack[-1][key] = entry
        else:
            self._data[key] = entry

    def get(self, key: str) -> Any:
        # Check transaction stack top-down (most recent first)
        for txn in reversed(self._transaction_stack):
            if key in txn:
                entry = txn[key]
                if entry is None:
                    raise KeyError(f"Key deleted in transaction: {key}")
                if entry.is_expired:
                    raise KeyError(f"Key expired: {key}")
                return entry.value
        # Fall back to main store
        entry = self._data.get(key)
        if entry is None:
            raise KeyError(f"Key not found: {key}")
        if entry.is_expired:
            del self._data[key]
            raise KeyError(f"Key expired: {key}")
        return entry.value
```

**Extension 2: Periodic Cleanup**

```python
import threading

class KeyValueStore:
    def __init__(self, cleanup_interval: float = 60.0) -> None:
        self._data: dict[str, Entry] = {}
        self._lock = threading.Lock()
        self._cleanup_interval = cleanup_interval
        self._start_cleanup_thread()

    def _start_cleanup_thread(self) -> None:
        def cleanup_loop():
            while True:
                time.sleep(self._cleanup_interval)
                self._sweep_expired()

        thread = threading.Thread(target=cleanup_loop, daemon=True)
        thread.start()

    def _sweep_expired(self) -> None:
        now = time.monotonic()
        with self._lock:
            expired_keys = [
                k for k, v in self._data.items()
                if v.expires_at is not None and v.expires_at < now
            ]
            for key in expired_keys:
                del self._data[key]
```

**Complexity**: get/set/delete/exists are all O(1). Sweep is O(n) but runs on a background thread.

---

## 2. File System Abstraction

### Problem Statement

Implement an in-memory file system that supports `mkdir`, `create_file`, `read_file`, `write_file`, `ls`, and `find` operations.

### Clarifying Questions to Ask

1. "Are paths absolute (always start with `/`) or can they be relative?"
2. "Should `mkdir` create intermediate directories (like `mkdir -p`)?"
3. "Can files and directories have the same name at the same level?"
4. "What should `ls` return for an empty directory?"
5. "Does `find` support glob patterns or just exact names?"

### Skeleton

```python
from dataclasses import dataclass, field
from typing import Iterator
import fnmatch


@dataclass
class FSNode:
    name: str
    is_dir: bool
    content: str = ""
    children: dict[str, "FSNode"] = field(default_factory=dict)


class FileSystem:
    def __init__(self) -> None:
        self._root = FSNode(name="", is_dir=True)

    def _resolve(self, path: str) -> tuple[FSNode, str]:
        """Resolve path to (parent_node, final_name). Raises if parent missing."""
        parts = [p for p in path.strip("/").split("/") if p]
        if not parts:
            return self._root, ""
        node = self._root
        for part in parts[:-1]:
            if part not in node.children or not node.children[part].is_dir:
                raise FileNotFoundError(f"Directory not found: {part}")
            node = node.children[part]
        return node, parts[-1]

    def mkdir(self, path: str, parents: bool = False) -> None:
        parts = [p for p in path.strip("/").split("/") if p]
        node = self._root
        for i, part in enumerate(parts):
            if part not in node.children:
                if not parents and i < len(parts) - 1:
                    raise FileNotFoundError(f"Parent directory missing: {part}")
                node.children[part] = FSNode(name=part, is_dir=True)
            child = node.children[part]
            if not child.is_dir:
                raise FileExistsError(f"Path exists as file: {part}")
            node = child

    def create_file(self, path: str, content: str = "") -> None:
        parent, name = self._resolve(path)
        if name in parent.children:
            raise FileExistsError(f"Already exists: {name}")
        parent.children[name] = FSNode(name=name, is_dir=False, content=content)

    def read_file(self, path: str) -> str:
        parent, name = self._resolve(path)
        if name not in parent.children:
            raise FileNotFoundError(f"File not found: {name}")
        node = parent.children[name]
        if node.is_dir:
            raise IsADirectoryError(f"Is a directory: {name}")
        return node.content

    def write_file(self, path: str, content: str) -> None:
        parent, name = self._resolve(path)
        if name not in parent.children:
            raise FileNotFoundError(f"File not found: {name}")
        node = parent.children[name]
        if node.is_dir:
            raise IsADirectoryError(f"Is a directory: {name}")
        node.content = content

    def ls(self, path: str = "/") -> list[str]:
        if path == "/":
            node = self._root
        else:
            parent, name = self._resolve(path)
            if name and name in parent.children:
                node = parent.children[name]
            else:
                node = self._root
        if not node.is_dir:
            return [node.name]
        return sorted(node.children.keys())

    def find(self, pattern: str, start: str = "/") -> Iterator[str]:
        """Find files/dirs matching a glob pattern."""
        def _walk(node: FSNode, current_path: str) -> Iterator[str]:
            for name, child in node.children.items():
                child_path = f"{current_path}/{name}"
                if fnmatch.fnmatch(name, pattern):
                    yield child_path
                if child.is_dir:
                    yield from _walk(child, child_path)

        start_node = self._root
        if start != "/":
            parent, name = self._resolve(start)
            start_node = parent.children.get(name, self._root)
        yield from _walk(start_node, start.rstrip("/"))
```

### Follow-Up Extensions

**Extension 1: File watchers** -- Add callback registration for file changes. Use an observer pattern with `on_change(path, callback)`.

**Extension 2: Permissions** -- Add read/write/execute bits. Check permissions before operations. Introduces the concept of a "current user."

**Extension 3: Symbolic links** -- Add `symlink(target, link_path)`. Handle cycle detection in `_resolve`.

---

## 3. Rate Limiter

### Problem Statement

Implement a rate limiter that allows a configurable number of requests per time window. Support `allow(client_id)` that returns True if the request should be allowed.

### Clarifying Questions to Ask

1. "Fixed window or sliding window?"
2. "Is the limit per-client or global?"
3. "What's the expected number of unique clients?"
4. "Should we support different limits for different clients/tiers?"
5. "Thread-safe?"

### Skeleton: Sliding Window with Deque

```python
from collections import defaultdict, deque
import time


class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: float) -> None:
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, client_id: str) -> bool:
        now = time.monotonic()
        window = self._requests[client_id]

        # Evict expired timestamps
        cutoff = now - self._window_seconds
        while window and window[0] < cutoff:
            window.popleft()

        if len(window) >= self._max_requests:
            return False

        window.append(now)
        return True

    def remaining(self, client_id: str) -> int:
        """How many requests can this client still make in the current window?"""
        now = time.monotonic()
        window = self._requests[client_id]
        cutoff = now - self._window_seconds
        while window and window[0] < cutoff:
            window.popleft()
        return max(0, self._max_requests - len(window))
```

### Follow-Up: Token Bucket

```python
from dataclasses import dataclass


@dataclass
class Bucket:
    tokens: float
    last_refill: float


class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate: float) -> None:
        """
        capacity: max tokens in bucket
        refill_rate: tokens added per second
        """
        self._capacity = capacity
        self._refill_rate = refill_rate
        self._buckets: dict[str, Bucket] = {}

    def _get_bucket(self, client_id: str) -> Bucket:
        now = time.monotonic()
        if client_id not in self._buckets:
            self._buckets[client_id] = Bucket(tokens=self._capacity, last_refill=now)
        bucket = self._buckets[client_id]
        # Refill based on elapsed time
        elapsed = now - bucket.last_refill
        bucket.tokens = min(self._capacity, bucket.tokens + elapsed * self._refill_rate)
        bucket.last_refill = now
        return bucket

    def allow(self, client_id: str, cost: float = 1.0) -> bool:
        bucket = self._get_bucket(client_id)
        if bucket.tokens >= cost:
            bucket.tokens -= cost
            return True
        return False
```

**When to use which**: Sliding window is simpler and works for most interview problems. Token bucket is better when you need burst handling or variable-cost operations. Mention both, implement whichever fits.

---

## 4. LRU Cache

### Problem Statement

Implement a least-recently-used cache with `get`, `put`, and configurable max size. When the cache is full, evict the least recently used entry.

### Clarifying Questions to Ask

1. "Should `get` update the recency of an item?" (Yes -- this is what makes it LRU)
2. "Is there a TTL as well, or just capacity-based eviction?"
3. "Should we support a `peek` that doesn't update recency?"
4. "What types are keys and values?"

### Skeleton: Using OrderedDict

```python
from collections import OrderedDict
from typing import TypeVar, Generic

K = TypeVar("K")
V = TypeVar("V")


class LRUCache(Generic[K, V]):
    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("Capacity must be positive")
        self._capacity = capacity
        self._data: OrderedDict[K, V] = OrderedDict()

    def get(self, key: K) -> V:
        if key not in self._data:
            raise KeyError(f"Key not found: {key}")
        self._data.move_to_end(key)  # Mark as recently used
        return self._data[key]

    def put(self, key: K, value: V) -> None:
        if key in self._data:
            self._data.move_to_end(key)
            self._data[key] = value
        else:
            if len(self._data) >= self._capacity:
                self._data.popitem(last=False)  # Evict LRU (first item)
            self._data[key] = value

    def peek(self, key: K) -> V:
        """Get without updating recency."""
        if key not in self._data:
            raise KeyError(f"Key not found: {key}")
        return self._data[key]

    @property
    def size(self) -> int:
        return len(self._data)

    def __contains__(self, key: K) -> bool:
        return key in self._data

    def __repr__(self) -> str:
        items = list(self._data.items())
        return f"LRUCache(capacity={self._capacity}, items={items})"
```

### Follow-Up: Manual Doubly-Linked List

If the interviewer asks you to implement without `OrderedDict` (rare but possible):

```python
@dataclass
class Node(Generic[K, V]):
    key: K
    value: V
    prev: "Node[K, V] | None" = None
    next: "Node[K, V] | None" = None


class LRUCacheManual(Generic[K, V]):
    def __init__(self, capacity: int) -> None:
        self._capacity = capacity
        self._map: dict[K, Node[K, V]] = {}
        # Sentinel nodes simplify edge cases
        self._head: Node = Node(key=None, value=None)  # type: ignore
        self._tail: Node = Node(key=None, value=None)  # type: ignore
        self._head.next = self._tail
        self._tail.prev = self._head

    def _remove(self, node: Node[K, V]) -> None:
        node.prev.next = node.next  # type: ignore
        node.next.prev = node.prev  # type: ignore

    def _add_to_end(self, node: Node[K, V]) -> None:
        node.prev = self._tail.prev
        node.next = self._tail
        self._tail.prev.next = node  # type: ignore
        self._tail.prev = node

    def get(self, key: K) -> V:
        if key not in self._map:
            raise KeyError(key)
        node = self._map[key]
        self._remove(node)
        self._add_to_end(node)
        return node.value

    def put(self, key: K, value: V) -> None:
        if key in self._map:
            self._remove(self._map[key])
            del self._map[key]
        if len(self._map) >= self._capacity:
            lru = self._head.next  # type: ignore
            self._remove(lru)
            del self._map[lru.key]
        node = Node(key=key, value=value)
        self._add_to_end(node)
        self._map[key] = node
```

**Senior signal**: Start with `OrderedDict`. Mention you know the underlying implementation uses a doubly-linked list. Only implement manually if explicitly asked. This shows pragmatism.

---

## 5. Task Scheduler

### Problem Statement

Implement a task scheduler that supports adding tasks with priorities, executing the highest-priority task, and cancelling pending tasks.

### Clarifying Questions to Ask

1. "Is lower number = higher priority, or higher number = higher priority?"
2. "Should tasks with the same priority run FIFO?"
3. "Can tasks have dependencies (task B runs only after task A completes)?"
4. "Should we support recurring tasks?"
5. "What happens if we try to cancel an already-running task?"

### Skeleton

```python
from dataclasses import dataclass, field
from typing import Callable, Any
import heapq
import itertools


@dataclass(order=True)
class Task:
    priority: int
    sequence: int  # Tiebreaker for FIFO within same priority
    name: str = field(compare=False)
    fn: Callable[[], Any] = field(compare=False)
    cancelled: bool = field(default=False, compare=False)


class TaskScheduler:
    def __init__(self) -> None:
        self._heap: list[Task] = []
        self._counter = itertools.count()
        self._tasks: dict[str, Task] = {}

    def add_task(self, name: str, fn: Callable[[], Any], priority: int = 0) -> None:
        """Lower priority number = higher priority (runs first)."""
        if name in self._tasks and not self._tasks[name].cancelled:
            raise ValueError(f"Task already exists: {name}")
        task = Task(
            priority=priority,
            sequence=next(self._counter),
            name=name,
            fn=fn,
        )
        self._tasks[name] = task
        heapq.heappush(self._heap, task)

    def cancel(self, name: str) -> bool:
        """Mark task as cancelled. Returns True if task was pending."""
        if name in self._tasks:
            task = self._tasks[name]
            if not task.cancelled:
                task.cancelled = True
                return True
        return False

    def run_next(self) -> Any:
        """Execute and remove the highest-priority non-cancelled task."""
        while self._heap:
            task = heapq.heappop(self._heap)
            if not task.cancelled:
                del self._tasks[task.name]
                return task.fn()
        raise RuntimeError("No pending tasks")

    def pending_count(self) -> int:
        return sum(1 for t in self._tasks.values() if not t.cancelled)
```

### Follow-Up: Task Dependencies

```python
from collections import defaultdict


class DependencyScheduler:
    def __init__(self) -> None:
        self._tasks: dict[str, Task] = {}
        self._dependencies: dict[str, set[str]] = defaultdict(set)
        self._dependents: dict[str, set[str]] = defaultdict(set)
        self._ready: list[Task] = []
        self._counter = itertools.count()
        self._completed: set[str] = set()

    def add_task(
        self, name: str, fn: Callable[[], Any],
        priority: int = 0, depends_on: list[str] | None = None,
    ) -> None:
        task = Task(priority=priority, sequence=next(self._counter), name=name, fn=fn)
        self._tasks[name] = task

        deps = set(depends_on or [])
        # Only wait on dependencies that haven't completed yet
        unmet = deps - self._completed
        self._dependencies[name] = unmet

        for dep in unmet:
            self._dependents[dep].add(name)

        if not unmet:
            heapq.heappush(self._ready, task)

    def run_next(self) -> Any:
        while self._ready:
            task = heapq.heappop(self._ready)
            if task.cancelled:
                continue
            result = task.fn()
            self._completed.add(task.name)
            # Unblock dependents
            for dependent_name in self._dependents.get(task.name, set()):
                self._dependencies[dependent_name].discard(task.name)
                if not self._dependencies[dependent_name]:
                    dep_task = self._tasks[dependent_name]
                    if not dep_task.cancelled:
                        heapq.heappush(self._ready, dep_task)
            return result
        raise RuntimeError("No ready tasks (possible cycle or empty)")
```

**Complexity**: add_task is O(log n) for heap push. run_next is O(log n) for heap pop plus O(d) for unblocking dependents where d is the number of direct dependents.

---

## 6. Event/Pub-Sub System

### Problem Statement

Implement an event system where components can subscribe to events and publish events. Support typed events and wildcard subscriptions.

### Clarifying Questions to Ask

1. "Are events strings, or should they be typed (enum, class)?"
2. "Should subscribers receive events synchronously or asynchronously?"
3. "Do we need wildcard subscriptions (e.g., subscribe to `user.*`)?"
4. "Can a subscriber unsubscribe?"
5. "What happens if a subscriber raises an exception?"

### Skeleton

```python
from collections import defaultdict
from dataclasses import dataclass
from typing import Callable, Any
import fnmatch


@dataclass
class Subscription:
    callback: Callable[[str, Any], None]
    pattern: str
    is_wildcard: bool


class EventBus:
    def __init__(self) -> None:
        self._exact: dict[str, list[Subscription]] = defaultdict(list)
        self._wildcards: list[Subscription] = []
        self._next_id = 0
        self._sub_map: dict[int, Subscription] = {}

    def subscribe(self, pattern: str, callback: Callable[[str, Any], None]) -> int:
        """Subscribe to events matching pattern. Returns subscription ID."""
        sub = Subscription(callback=callback, pattern=pattern, is_wildcard="*" in pattern or "?" in pattern)
        sub_id = self._next_id
        self._next_id += 1
        self._sub_map[sub_id] = sub

        if sub.is_wildcard:
            self._wildcards.append(sub)
        else:
            self._exact[pattern].append(sub)

        return sub_id

    def unsubscribe(self, sub_id: int) -> bool:
        sub = self._sub_map.pop(sub_id, None)
        if sub is None:
            return False
        if sub.is_wildcard:
            self._wildcards.remove(sub)
        else:
            self._exact[sub.pattern].remove(sub)
        return True

    def publish(self, event: str, data: Any = None) -> int:
        """Publish event. Returns number of subscribers notified."""
        notified = 0
        errors: list[tuple[Subscription, Exception]] = []

        # Exact matches
        for sub in self._exact.get(event, []):
            try:
                sub.callback(event, data)
                notified += 1
            except Exception as e:
                errors.append((sub, e))

        # Wildcard matches
        for sub in self._wildcards:
            if fnmatch.fnmatch(event, sub.pattern):
                try:
                    sub.callback(event, data)
                    notified += 1
                except Exception as e:
                    errors.append((sub, e))

        # Don't let one bad subscriber break others, but surface errors
        if errors:
            for sub, err in errors:
                print(f"Subscriber error for pattern '{sub.pattern}': {err}")

        return notified
```

### Follow-Up Extensions

- **Event history**: Store last N events for replay when new subscribers join
- **Once subscriptions**: Subscribe to an event once, auto-unsubscribe after first delivery
- **Async delivery**: Use `asyncio.create_task` for non-blocking subscriber notification
- **Event filtering**: Subscribers can provide a predicate in addition to the pattern

---

## 7. Log Parser/Analyzer

### Problem Statement

Implement a log analyzer that can parse structured log lines, filter by criteria, and compute aggregations (count by level, errors per minute, top endpoints).

### Clarifying Questions to Ask

1. "What's the log format? JSON, key=value, or free-form?"
2. "Do logs fit in memory, or should we stream?"
3. "What aggregations are needed?"
4. "Should we support time-range queries?"

### Skeleton

```python
from dataclasses import dataclass
from collections import Counter, defaultdict
from datetime import datetime
from typing import Iterator, TextIO
import json


@dataclass
class LogEntry:
    timestamp: datetime
    level: str
    message: str
    metadata: dict[str, str]


class LogAnalyzer:
    def __init__(self) -> None:
        self._entries: list[LogEntry] = []

    def parse_line(self, line: str) -> LogEntry:
        """Parse a JSON log line. Adapt for your format."""
        data = json.loads(line.strip())
        return LogEntry(
            timestamp=datetime.fromisoformat(data["timestamp"]),
            level=data.get("level", "INFO").upper(),
            message=data.get("message", ""),
            metadata={k: v for k, v in data.items()
                      if k not in ("timestamp", "level", "message")},
        )

    def ingest(self, source: TextIO) -> int:
        """Stream log lines from a file-like object. Returns count ingested."""
        count = 0
        for line in source:
            line = line.strip()
            if not line:
                continue
            try:
                entry = self.parse_line(line)
                self._entries.append(entry)
                count += 1
            except (json.JSONDecodeError, KeyError):
                continue  # Skip malformed lines
        return count

    def filter(
        self,
        level: str | None = None,
        start: datetime | None = None,
        end: datetime | None = None,
        message_contains: str | None = None,
    ) -> Iterator[LogEntry]:
        """Lazily filter log entries."""
        for entry in self._entries:
            if level and entry.level != level.upper():
                continue
            if start and entry.timestamp < start:
                continue
            if end and entry.timestamp > end:
                continue
            if message_contains and message_contains not in entry.message:
                continue
            yield entry

    def count_by_level(self) -> dict[str, int]:
        return dict(Counter(e.level for e in self._entries))

    def errors_per_minute(self) -> dict[str, int]:
        """Returns a dict of 'YYYY-MM-DD HH:MM' -> error count."""
        buckets: dict[str, int] = defaultdict(int)
        for entry in self._entries:
            if entry.level == "ERROR":
                minute_key = entry.timestamp.strftime("%Y-%m-%d %H:%M")
                buckets[minute_key] += 1
        return dict(sorted(buckets.items()))

    def top_values(self, metadata_key: str, n: int = 10) -> list[tuple[str, int]]:
        """Top N most common values for a metadata field."""
        counter = Counter(
            e.metadata[metadata_key]
            for e in self._entries
            if metadata_key in e.metadata
        )
        return counter.most_common(n)
```

### Follow-Up Extensions

- **Streaming mode**: Process logs without storing all entries in memory (use generators, running counters)
- **Alerting**: Trigger callback when error rate exceeds threshold in a rolling window
- **Pattern detection**: Find repeated error messages using substring clustering

---

## 8. API Client with Retry Logic

### Problem Statement

Implement an HTTP API client wrapper that supports automatic retries with exponential backoff, circuit breaking, and request/response logging.

### Clarifying Questions to Ask

1. "Which HTTP errors should trigger retries? Just 5xx, or also 429?"
2. "Should we support different retry strategies per endpoint?"
3. "Do we need idempotency keys for POST requests?"
4. "Should the circuit breaker be per-endpoint or global?"

### Skeleton

```python
from dataclasses import dataclass
from enum import Enum
from typing import Any
import time
import random


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


@dataclass
class RetryConfig:
    max_attempts: int = 3
    base_delay: float = 0.5
    max_delay: float = 30.0
    retryable_status_codes: frozenset[int] = frozenset({429, 500, 502, 503, 504})


@dataclass
class CircuitBreakerConfig:
    failure_threshold: int = 5
    recovery_timeout: float = 30.0
    success_threshold: int = 2


@dataclass
class Response:
    status_code: int
    body: Any
    headers: dict[str, str]


class APIClient:
    def __init__(
        self,
        base_url: str,
        retry_config: RetryConfig | None = None,
        circuit_config: CircuitBreakerConfig | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._retry = retry_config or RetryConfig()
        self._circuit = circuit_config or CircuitBreakerConfig()
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: float | None = None

    def _check_circuit(self) -> None:
        if self._state == CircuitState.OPEN:
            if self._last_failure_time is None:
                return
            elapsed = time.monotonic() - self._last_failure_time
            if elapsed >= self._circuit.recovery_timeout:
                self._state = CircuitState.HALF_OPEN
                self._success_count = 0
            else:
                raise ConnectionError(
                    f"Circuit breaker OPEN. Retry after {self._circuit.recovery_timeout - elapsed:.1f}s"
                )

    def _record_success(self) -> None:
        if self._state == CircuitState.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= self._circuit.success_threshold:
                self._state = CircuitState.CLOSED
                self._failure_count = 0
        else:
            self._failure_count = 0

    def _record_failure(self) -> None:
        self._failure_count += 1
        self._last_failure_time = time.monotonic()
        if self._failure_count >= self._circuit.failure_threshold:
            self._state = CircuitState.OPEN

    def _calculate_delay(self, attempt: int) -> float:
        """Exponential backoff with full jitter."""
        exponential = min(self._retry.max_delay, self._retry.base_delay * (2 ** attempt))
        return random.uniform(0, exponential)

    def request(self, method: str, path: str, **kwargs: Any) -> Response:
        """Make an HTTP request with retry and circuit breaker logic.

        In a real implementation, this would use httpx or requests.
        For the interview, we demonstrate the retry/circuit logic.
        """
        self._check_circuit()
        url = f"{self._base_url}/{path.lstrip('/')}"
        last_error: Exception | None = None

        for attempt in range(self._retry.max_attempts):
            try:
                # In real code: response = httpx.request(method, url, **kwargs)
                response = self._make_request(method, url, **kwargs)

                if response.status_code in self._retry.retryable_status_codes:
                    self._record_failure()
                    if attempt < self._retry.max_attempts - 1:
                        delay = self._calculate_delay(attempt)
                        # Handle Retry-After header for 429
                        if response.status_code == 429 and "Retry-After" in response.headers:
                            delay = max(delay, float(response.headers["Retry-After"]))
                        time.sleep(delay)
                        continue
                    return response

                self._record_success()
                return response

            except ConnectionError as e:
                self._record_failure()
                last_error = e
                if attempt < self._retry.max_attempts - 1:
                    delay = self._calculate_delay(attempt)
                    time.sleep(delay)
                    continue

        raise last_error or ConnectionError("All retry attempts failed")

    def _make_request(self, method: str, url: str, **kwargs: Any) -> Response:
        """Placeholder for actual HTTP call. Replace with httpx/requests."""
        raise NotImplementedError("Wire up your HTTP library here")

    def get(self, path: str, **kwargs: Any) -> Response:
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs: Any) -> Response:
        return self.request("POST", path, **kwargs)
```

### Follow-Up Extensions

- **Idempotency keys**: Auto-generate UUID for POST/PUT requests, store in header
- **Request logging**: Log method, URL, status, latency for every request
- **Per-endpoint config**: Different retry/circuit settings based on path pattern
- **Async version**: Convert to `async/await` with `httpx.AsyncClient`

---

## General Tips Across All Archetypes

1. **Start with the data model**. Before writing any methods, define your `@dataclass` or core data structures. This grounds the rest of the solution.

2. **Write the public API first**. Method signatures with type hints and docstrings. Then fill in implementations. This shows top-down design.

3. **Use `time.monotonic()`** for all timing. Never `time.time()` -- it can go backwards during NTP adjustments.

4. **Generators for streaming**. Whenever the follow-up mentions "what if the data doesn't fit in memory?", convert to generators with `yield`.

5. **Mention tests you'd write** even if you don't write them: "I'd test the edge case where TTL expires exactly at read time" or "I'd test the race condition where two threads cancel the same task."

6. **Name your complexity**. After completing each method, state its time and space complexity. Don't wait to be asked.
