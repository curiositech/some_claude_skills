# CodeSignal Incremental Format Strategy

Consult this file when preparing for CodeSignal's pre-recorded, IDE-based incremental coding assessment. This format is used by Anthropic, Databricks, Roblox, and others for engineering roles at L5+.

---

## How It Differs from Standard Interviews

| Aspect | Live Interview | CodeSignal Incremental |
|--------|---------------|----------------------|
| Interviewer | Human present, can ask questions | Pre-recorded, no live interviewer |
| Clarification | Ask and get answers in real-time | Must self-clarify from problem text |
| Format | Single problem, open-ended | 4 stages building on each other |
| Time | ~45 min for one problem | ~70 min total, ~15-18 min per stage |
| IDE | Their choice or whiteboard | Full IDE with autocomplete, run button |
| Testing | Talk through test cases | Can actually run tests |
| Narration | Speak to interviewer | Not recorded (some variants record screen) |

### Key Implications

1. **No one to ask**: You must extract all constraints from the problem statement. Read it three times before coding.
2. **Incremental stages**: Each stage extends your previous code. If your stage 1 design is rigid, stages 2-4 become painful.
3. **You can run code**: Use this. Write a quick test after each stage. Don't just submit and hope.
4. **Time is yours to manage**: No one will say "let's move on." You must discipline yourself.

---

## The 4-Stage Structure

Typical CodeSignal incremental problems follow this pattern:

```
Stage 1: Basic CRUD operations on a simple data structure
Stage 2: Add a query/search capability or constraint
Stage 3: Add time-based behavior, complex queries, or state management
Stage 4: Add concurrency, optimization, or a fundamentally harder extension
```

### Example Progression (In-Memory Database)

- **Stage 1**: Implement `set(key, field, value)`, `get(key, field)`, `delete(key)`
- **Stage 2**: Add `scan(key)` to return all fields, `scan_prefix(prefix)` to find matching keys
- **Stage 3**: Add TTL support -- entries expire after a configurable time
- **Stage 4**: Add transaction support -- `begin()`, `commit()`, `rollback()` with isolation

### Example Progression (Task Manager)

- **Stage 1**: Add task, complete task, get task by ID
- **Stage 2**: Add priorities, return tasks in priority order
- **Stage 3**: Add task dependencies -- task B can't start until task A completes
- **Stage 4**: Add recurring tasks and time-based scheduling

---

## Time Management Per Stage

**Total time**: ~70 minutes for 4 stages.

| Stage | Time Budget | Strategy |
|-------|-------------|----------|
| 1 | 12-15 min | Get it right. This is your foundation. Invest in clean abstractions. |
| 2 | 12-15 min | Extend stage 1. Should feel natural if your design was good. |
| 3 | 15-18 min | This is where it gets hard. Read the problem twice. Take a breath. |
| 4 | 15-18 min | Partial credit is real. Get the structure right even if not all edge cases pass. |

### Time Allocation Within Each Stage

1. **Read the problem statement** (2-3 min) -- Read it completely. Highlight constraints. Identify what changed from the previous stage.
2. **Plan the extension** (2-3 min) -- How does this change your existing data model? What methods need to change? What new methods are needed?
3. **Implement** (8-10 min) -- Write the code. Start with the data model changes, then update existing methods, then add new ones.
4. **Test** (2-3 min) -- Run the provided test cases. Add one edge case test of your own.

### The 5-Minute Rule

If you've been stuck on a single stage for more than 5 minutes without making progress:

1. **Step back**: Re-read the problem statement. You probably missed a constraint.
2. **Simplify**: Can you solve a simpler version of this stage?
3. **Skip and return**: If stage 3 is blocking you, read stage 4. Sometimes stage 4 gives you insight into what stage 3 expects.
4. **Partial solution**: Submit what you have. Partial credit exists.

---

## Design for Extension from Stage 1

The most common trap is writing stage 1 code that's hard to extend. Here's how to avoid it.

### Bad: Rigid Stage 1

```python
# This will be painful to extend with TTL, transactions, etc.
class Database:
    def __init__(self):
        self.data = {}  # key -> value (flat)

    def set(self, key, value):
        self.data[key] = value

    def get(self, key):
        return self.data.get(key)
```

### Good: Extensible Stage 1

```python
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Record:
    """Wrap values in a record -- easy to add metadata later (TTL, version, etc.)."""
    fields: dict[str, Any] = field(default_factory=dict)


class Database:
    def __init__(self) -> None:
        self._records: dict[str, Record] = {}

    def set(self, key: str, field_name: str, value: Any) -> None:
        if key not in self._records:
            self._records[key] = Record()
        self._records[key].fields[field_name] = value

    def get(self, key: str, field_name: str) -> Any | None:
        record = self._records.get(key)
        if record is None:
            return None
        return record.fields.get(field_name)

    def delete(self, key: str) -> bool:
        if key in self._records:
            del self._records[key]
            return True
        return False
```

**Why this is better**: When stage 3 asks for TTL, you just add `expires_at: float | None = None` to the `Record` dataclass. When stage 4 asks for transactions, you can snapshot `_records` or layer a transaction dict on top. The `Record` wrapper is the key -- it's where metadata lives.

### Extension Pattern: Layer, Don't Rewrite

When a new stage arrives:

1. **Add fields to your dataclass** (don't change the shape of `_records`)
2. **Add a check method** (e.g., `_is_valid(record)` that checks TTL)
3. **Modify existing methods to call the check** (e.g., `get` calls `_is_valid` before returning)
4. **Add new methods** for new operations

```python
# Stage 3: Adding TTL -- extend Record, don't restructure
@dataclass
class Record:
    fields: dict[str, Any] = field(default_factory=dict)
    expires_at: float | None = None  # NEW

    @property
    def is_expired(self) -> bool:  # NEW
        if self.expires_at is None:
            return False
        return time.monotonic() > self.expires_at


class Database:
    # ... existing methods ...

    def set_with_ttl(self, key: str, field_name: str, value: Any, ttl: float) -> None:
        if key not in self._records:
            self._records[key] = Record(expires_at=time.monotonic() + ttl)
        record = self._records[key]
        record.fields[field_name] = value
        record.expires_at = time.monotonic() + ttl  # Reset TTL on write

    def get(self, key: str, field_name: str) -> Any | None:
        record = self._records.get(key)
        if record is None:
            return None
        if record.is_expired:  # NEW CHECK
            del self._records[key]
            return None
        return record.fields.get(field_name)
```

---

## Common Traps

### Trap 1: Breaking Earlier Stages

**Problem**: Your stage 3 changes cause stage 1 and 2 test cases to fail.

**Prevention**:
- Run ALL test cases after each stage, not just the new ones.
- Make new features opt-in: `set_with_ttl` is a new method, `set` still works without TTL.
- Use default values: `expires_at: float | None = None` means existing records without TTL still work.

### Trap 2: Over-Engineering for Later Stages

**Problem**: You read all 4 stages at once, then try to build the stage 4 architecture from stage 1.

**Prevention**:
- Read only the current stage's problem statement.
- Build the simplest correct solution for the current stage.
- Trust that a clean, well-structured stage 1 solution will be extensible.
- If you must peek ahead, only look at stage 2 to avoid obvious design dead ends.

### Trap 3: Not Running Tests

**Problem**: You submit code that has syntax errors or fails basic test cases because you never ran it.

**Prevention**:
- CodeSignal gives you a Run button. Use it after every stage.
- Write a minimal test before the provided ones: `db = Database(); db.set("k", "f", "v"); assert db.get("k", "f") == "v"`
- Check return types: does the problem say return `None` or raise an exception for missing keys?

### Trap 4: Spending Too Long on Stage 1

**Problem**: You spend 25 minutes perfecting stage 1 and have 45 minutes for 3 harder stages.

**Prevention**:
- Stage 1 should take 12-15 minutes max. It's the warm-up.
- Don't add features that aren't asked for in stage 1. No TTL, no transactions, no thread safety.
- Write the dataclass + 3-4 methods + run tests. Done.

### Trap 5: Copy-Paste Errors

**Problem**: You duplicate code between stages and introduce subtle bugs when modifying one copy but not the other.

**Prevention**:
- Extract shared logic into methods: `_get_record(key)` that handles existence check + expiry check.
- When you find yourself copying code, make a helper.

---

## Self-Testing Without an Interviewer

In a live interview, the interviewer validates your understanding. In CodeSignal, you must validate yourself.

### Before Writing Code

Ask yourself these questions (write answers as comments if it helps):

```python
# Q: What are the inputs and their types?
# A: key is str, field is str, value is Any

# Q: What should happen for invalid input?
# A: Problem says "assume valid input" -- no need for validation

# Q: What should get() return for a missing key?
# A: Problem says "return empty string" -- NOT None, NOT raise

# Q: Are operations case-sensitive?
# A: Problem doesn't specify -- assume yes (case-sensitive)
```

### After Writing Code

Run through this mental checklist:

1. **Empty state**: Does your code work on a fresh instance with no data?
2. **Single item**: Does set + get work for one item?
3. **Overwrite**: Does setting the same key twice keep the latest value?
4. **Delete nonexistent**: Does deleting a key that doesn't exist crash or return gracefully?
5. **Order**: If the problem mentions ordering, is your output sorted correctly?

### Quick Smoke Test Template

```python
def smoke_test():
    db = Database()

    # Basic CRUD
    db.set("user:1", "name", "Alice")
    assert db.get("user:1", "name") == "Alice"

    # Overwrite
    db.set("user:1", "name", "Bob")
    assert db.get("user:1", "name") == "Bob"

    # Missing key
    assert db.get("user:999", "name") is None  # or whatever the spec says

    # Delete
    assert db.delete("user:1") is True
    assert db.delete("user:1") is False  # Already deleted
    assert db.get("user:1", "name") is None

    print("All smoke tests passed")

smoke_test()
```

---

## Stage-by-Stage Mindset

| Stage | Mindset | Risk |
|-------|---------|------|
| 1 | "Build a foundation" | Over-engineering, perfectionism |
| 2 | "Extend naturally" | Not reading new constraints carefully |
| 3 | "This is the real test" | Panic, time crunch, rewriting stage 1 |
| 4 | "Partial credit counts" | All-or-nothing thinking, not submitting |

### Stage 4 Survival Strategy

Stage 4 is intentionally hard. Many candidates don't finish it. Your goal is to demonstrate understanding, not necessarily pass all test cases.

1. **Read the full problem statement** -- understand what's being asked
2. **Write the data model changes** -- show you know what the solution looks like
3. **Implement the core path** -- handle the happy case
4. **Add comments for edge cases you'd handle** -- "TODO: handle rollback of nested transactions"
5. **Submit what you have** -- partial implementations score points

A stage 4 solution that handles 70% of cases and has clear comments about the remaining 30% scores better than no submission.

---

## Anthropic-Specific Notes

Anthropic uses CodeSignal for engineering roles. Based on public information and candidate reports:

- Problems tend toward **real-world systems** (key-value stores, text processors, scheduling systems) rather than algorithm puzzles
- Python is the most common language choice; TypeScript is also well-supported
- The incremental format tests **design thinking** as much as implementation ability
- Clean code and good abstractions matter -- the evaluator reads your code, not just runs tests
- There is typically a human review of your code in addition to automated test scoring

**Preparation priority**:
1. Practice the 8 archetypes in `problem-archetypes.md` under time pressure (70 min, 4 stages)
2. Internalize the Python patterns from `python-patterns-senior.md` so they're automatic
3. Do 2-3 full timed practice sessions before the real assessment
4. Get comfortable with the CodeSignal IDE -- practice in it at least once before your assessment
