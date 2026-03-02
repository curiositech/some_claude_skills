# Senior Python Patterns for Coding Interviews

Consult this file when you need to demonstrate Python fluency that signals Staff+ experience. These are not tricks -- they are patterns that experienced Python engineers use instinctively, and their absence signals a candidate who codes Python but doesn't *think* in Python.

---

## 1. Dataclasses for Data Modeling

**The signal**: Using `@dataclass` instead of raw dicts or tuples for any structured data with more than 2 fields.

**Why it matters**: Shows you think about data contracts, not just data passing. Interviewers see raw dicts and think "junior scripting."

```python
from dataclasses import dataclass, field
from typing import Any

# Junior: raw dict
entry = {"key": "user:1", "value": "Alice", "ttl": 300, "created_at": time.time()}

# Senior: structured, type-safe, self-documenting
@dataclass
class CacheEntry:
    key: str
    value: Any
    ttl_seconds: float | None = None
    created_at: float = field(default_factory=time.monotonic)

    @property
    def is_expired(self) -> bool:
        if self.ttl_seconds is None:
            return False
        return time.monotonic() - self.created_at > self.ttl_seconds
```

### When to use `@dataclass` vs `NamedTuple`

| Use | When |
|-----|------|
| `@dataclass` | Mutable data, need methods/properties, complex defaults |
| `NamedTuple` | Immutable records, dict keys, need unpacking |
| `TypedDict` | Only when interfacing with JSON/dicts from external APIs |
| Plain `dict` | Never for domain models; only for truly dynamic key-value data |

```python
from typing import NamedTuple

# NamedTuple for immutable records
class Point(NamedTuple):
    x: float
    y: float

# Can be used as dict keys (hashable)
distances: dict[Point, float] = {Point(0, 0): 0.0, Point(1, 1): 1.414}

# Can be unpacked
x, y = Point(3, 4)
```

---

## 2. Context Managers for Resource Cleanup

**The signal**: Using `with` statements or writing custom context managers for any resource that needs cleanup.

```python
from contextlib import contextmanager
from typing import Iterator


# For database connections, file handles, locks, temporary state
@contextmanager
def transaction(store: "KeyValueStore") -> Iterator["KeyValueStore"]:
    """Context manager that auto-rolls back on exception."""
    store.begin()
    try:
        yield store
        store.commit()
    except Exception:
        store.rollback()
        raise


# Usage
with transaction(store) as txn:
    txn.set("balance:alice", 900)
    txn.set("balance:bob", 1100)
    # If anything raises, both changes roll back
```

### Class-Based Context Manager (for Stateful Resources)

```python
class Timer:
    """Measure execution time of a block."""
    def __init__(self, label: str = "") -> None:
        self.label = label
        self.elapsed: float = 0.0

    def __enter__(self) -> "Timer":
        self._start = time.monotonic()
        return self

    def __exit__(self, *exc_info: Any) -> None:
        self.elapsed = time.monotonic() - self._start
        if self.label:
            print(f"{self.label}: {self.elapsed:.3f}s")


# Usage
with Timer("cache_lookup") as t:
    result = cache.get("user:1")
print(f"Took {t.elapsed:.3f}s")
```

---

## 3. Generators for Streaming and Lazy Evaluation

**The signal**: Using `yield` instead of building a complete list when the data might be large or the consumer might stop early.

```python
from typing import Iterator


def parse_log_stream(filepath: str) -> Iterator[dict]:
    """Process arbitrarily large log files without loading into memory."""
    with open(filepath) as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                # Log and skip malformed lines
                continue


def filter_errors(entries: Iterator[dict]) -> Iterator[dict]:
    """Composable filter -- chains with other generators."""
    for entry in entries:
        if entry.get("level") == "ERROR":
            yield entry


def first_n(entries: Iterator[dict], n: int) -> list[dict]:
    """Take first N entries -- stops reading early."""
    results = []
    for entry in entries:
        results.append(entry)
        if len(results) >= n:
            break
    return results


# Compose: parse -> filter -> take 10 (reads only as much as needed)
errors = filter_errors(parse_log_stream("/var/log/app.log"))
recent_errors = first_n(errors, 10)
```

### Generator Expression vs List Comprehension

```python
# List comprehension: builds entire list in memory
total = sum([entry.size for entry in entries])  # Wastes memory

# Generator expression: streams values one at a time
total = sum(entry.size for entry in entries)  # O(1) memory
```

**Rule**: If you're only iterating once and don't need random access, use a generator expression (no brackets).

---

## 4. Collections Module Mastery

**The signal**: Reaching for `defaultdict`, `Counter`, `deque`, `OrderedDict` naturally, without importing them as an afterthought.

### defaultdict -- Eliminates Boilerplate Init Checks

```python
from collections import defaultdict

# Junior: manual key existence check
graph = {}
def add_edge(src, dst):
    if src not in graph:
        graph[src] = []
    graph[src].append(dst)

# Senior: defaultdict handles missing keys
graph: defaultdict[str, list[str]] = defaultdict(list)
def add_edge(src: str, dst: str) -> None:
    graph[src].append(dst)
```

### Counter -- Frequency Analysis in One Line

```python
from collections import Counter

# Count anything hashable
words = ["error", "warn", "error", "info", "error"]
counts = Counter(words)
# Counter({"error": 3, "warn": 1, "info": 1})

# Top N
counts.most_common(2)  # [("error", 3), ("warn", 1)]

# Combine counters
total = counter_a + counter_b
difference = counter_a - counter_b  # Only positive counts
```

### deque -- O(1) Operations at Both Ends

```python
from collections import deque

# Sliding window pattern
class SlidingWindow:
    def __init__(self, window_size: int) -> None:
        self._window: deque[float] = deque()
        self._window_size = window_size

    def add(self, value: float) -> None:
        self._window.append(value)
        while len(self._window) > self._window_size:
            self._window.popleft()  # O(1), not O(n) like list.pop(0)

    @property
    def average(self) -> float:
        if not self._window:
            return 0.0
        return sum(self._window) / len(self._window)

# Also great for BFS
def bfs(graph: dict[str, list[str]], start: str) -> list[str]:
    visited = set()
    queue: deque[str] = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        queue.extend(graph.get(node, []))
    return order
```

---

## 5. Type Hints in Interview Context

**The signal**: Type hints on public method signatures. Skip them on internal helpers when time is short.

### What to Type

```python
# Always type: class __init__, public methods, return types
class Cache:
    def __init__(self, capacity: int) -> None: ...
    def get(self, key: str) -> Any: ...
    def put(self, key: str, value: Any, ttl: float | None = None) -> None: ...

# Skip typing on: private helpers, local variables, lambda bodies
def _cleanup(self):  # Fine without types in an interview
    expired = [k for k, v in self._data.items() if v.is_expired]
    for k in expired:
        del self._data[k]
```

### Modern Python Type Syntax (3.10+)

```python
# Use | instead of Union (3.10+)
def get(self, key: str) -> str | None: ...

# Use list, dict, tuple directly (3.9+)
def items(self) -> list[tuple[str, Any]]: ...

# Use X | None instead of Optional[X]
def find(self, name: str) -> "Node | None": ...
```

**Interview tip**: If you're not sure which Python version the environment supports, ask. If they say "any," use modern syntax -- it shows currency.

---

## 6. Exception Hierarchy Design

**The signal**: Defining domain-specific exceptions instead of raising bare `Exception` or `ValueError` for everything.

```python
class StoreError(Exception):
    """Base error for all store operations."""
    pass

class KeyNotFoundError(StoreError):
    """Raised when a key doesn't exist in the store."""
    def __init__(self, key: str) -> None:
        self.key = key
        super().__init__(f"Key not found: {key}")

class KeyExpiredError(StoreError):
    """Raised when a key exists but has expired."""
    def __init__(self, key: str) -> None:
        self.key = key
        super().__init__(f"Key expired: {key}")

class TransactionError(StoreError):
    """Raised for transaction-related failures."""
    pass

class CapacityExceededError(StoreError):
    """Raised when store is at capacity and no eviction policy is set."""
    def __init__(self, capacity: int) -> None:
        self.capacity = capacity
        super().__init__(f"Store at capacity: {capacity}")
```

**Why this matters in interviews**: It shows you think about error handling as part of API design. Callers can catch `StoreError` for broad handling or specific subclasses for fine-grained control.

---

## 7. `__slots__` for Performance-Critical Classes

**The signal**: Knowing when and why to use `__slots__`, and not using it everywhere.

```python
# Without __slots__: each instance has a __dict__ (40+ bytes overhead)
class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

# With __slots__: no __dict__, fixed attribute set, ~40% less memory
class Point:
    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
```

**When to use**: Only when you're creating millions of instances (cache entries, graph nodes, event records). Mention it verbally in an interview ("If we had millions of entries, I'd add `__slots__` to reduce memory overhead") -- don't actually do it unless the problem demands it.

**When NOT to use**: Regular classes with &lt;1000 instances. Classes that need dynamic attribute assignment. Classes that use inheritance heavily (slots + inheritance is tricky).

---

## 8. `functools.lru_cache` vs Manual Caching

**The signal**: Using the stdlib cache for pure functions, writing manual caches for stateful/time-dependent data.

```python
from functools import lru_cache

# Good use of lru_cache: pure computation with repeated inputs
@lru_cache(maxsize=256)
def parse_path(path: str) -> list[str]:
    """Split and normalize a filesystem path. Pure function."""
    return [p for p in path.strip("/").split("/") if p]


# BAD use of lru_cache: function with side effects or time-dependency
@lru_cache(maxsize=100)  # DON'T DO THIS
def get_user(user_id: str) -> dict:
    """Fetches from database -- result can change over time."""
    return db.query(f"SELECT * FROM users WHERE id = {user_id}")
```

**Manual cache when**: Data expires, cache needs invalidation, cache needs size limits with custom eviction, or values depend on time/external state.

---

## 9. Protocol Classes for Structural Typing

**The signal**: Using `Protocol` for duck-typing interfaces instead of ABC when you want structural subtyping.

```python
from typing import Protocol, runtime_checkable


@runtime_checkable
class Serializable(Protocol):
    def to_dict(self) -> dict: ...
    def from_dict(cls, data: dict) -> "Serializable": ...


class Storable(Protocol):
    """Any object that can be stored in our cache."""
    @property
    def key(self) -> str: ...
    @property
    def size_bytes(self) -> int: ...


# Any class that has these methods/properties works -- no inheritance needed
class User:
    @property
    def key(self) -> str:
        return f"user:{self.id}"

    @property
    def size_bytes(self) -> int:
        return len(json.dumps(self.__dict__))


def store(item: Storable, cache: "Cache") -> None:
    """Works with any object matching the Storable protocol."""
    if item.size_bytes > cache.max_entry_size:
        raise ValueError(f"Item too large: {item.size_bytes}")
    cache.put(item.key, item)
```

**Interview use**: Mention Protocol when the interviewer asks "how would you make this extensible?" It shows you know Python's structural typing beyond just ABCs.

---

## 10. Testing Hooks: Dependency Injection

**The signal**: Designing classes so they're testable without mocking frameworks.

```python
from typing import Callable
import time


class RateLimiter:
    def __init__(
        self,
        max_requests: int,
        window_seconds: float,
        clock: Callable[[], float] = time.monotonic,  # Injectable clock
    ) -> None:
        self._max = max_requests
        self._window = window_seconds
        self._clock = clock  # Test can inject a fake clock
        self._requests: dict[str, list[float]] = defaultdict(list)

    def allow(self, client_id: str) -> bool:
        now = self._clock()
        # ... use self._clock() instead of time.monotonic() everywhere


# In tests: inject a controllable clock
class FakeClock:
    def __init__(self, start: float = 0.0):
        self._now = start

    def __call__(self) -> float:
        return self._now

    def advance(self, seconds: float) -> None:
        self._now += seconds


def test_rate_limiter_window_expiry():
    clock = FakeClock(start=0.0)
    limiter = RateLimiter(max_requests=2, window_seconds=60.0, clock=clock)

    assert limiter.allow("client_1") is True
    assert limiter.allow("client_1") is True
    assert limiter.allow("client_1") is False  # Over limit

    clock.advance(61.0)  # Move past the window

    assert limiter.allow("client_1") is True  # Window expired, allowed again
```

**Why this matters**: Shows you think about testability as part of design, not as an afterthought. Interviewers at Staff+ level expect this.

---

## 11. Enum for State Machines

**The signal**: Using `Enum` or `StrEnum` for states instead of string literals.

```python
from enum import Enum, auto


class TaskState(Enum):
    PENDING = auto()
    RUNNING = auto()
    COMPLETED = auto()
    FAILED = auto()
    CANCELLED = auto()

    @property
    def is_terminal(self) -> bool:
        return self in (TaskState.COMPLETED, TaskState.FAILED, TaskState.CANCELLED)

    @property
    def can_cancel(self) -> bool:
        return self in (TaskState.PENDING, TaskState.RUNNING)


# Prevents typos, enables IDE completion, makes invalid states unrepresentable
task.state = TaskState.PENDING  # Type-safe
task.state = "pneding"  # Would be silently wrong with strings
```

---

## 12. Patterns to Avoid in Interviews

These patterns are technically valid Python but signal inexperience:

| Pattern | Problem | Better |
|---------|---------|--------|
| `isinstance(x, (int, float, str))` chains | Stringly-typed dispatch | `match`/`case` (3.10+) or visitor pattern |
| `try/except Exception: pass` | Silences all errors | Catch specific exceptions, re-raise unknown |
| `global` variables | Shared mutable state | Pass as constructor arguments |
| Mutable default arguments | `def f(items=[])` shares list | `def f(items=None)` with `items = items or []` |
| `time.time()` for durations | Can go backwards (NTP) | `time.monotonic()` |
| `os.path` for path manipulation | Verbose, error-prone | `pathlib.Path` |
| `string.format()` | Verbose | f-strings |
| `lambda` for named functions | Unreadable, untestable | Named `def` |
| Bare `dict` for structured data | No type safety, no autocomplete | `@dataclass` or `NamedTuple` |
| `list.pop(0)` in a loop | O(n) per pop | `collections.deque.popleft()` |
