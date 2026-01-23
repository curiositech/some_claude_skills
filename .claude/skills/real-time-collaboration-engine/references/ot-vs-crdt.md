# Operational Transform vs CRDTs

Deep comparison of the two main conflict resolution strategies for real-time collaboration.

## Executive Summary

| Factor | Operational Transform (OT) | CRDTs |
|--------|---------------------------|-------|
| **Best for** | Text editing, sequential data | JSON objects, sets, maps |
| **Complexity** | High | Medium |
| **Offline support** | Limited | Excellent |
| **Latency tolerance** | Low (requires frequent sync) | High (can sync infrequently) |
| **Memory overhead** | Low | Higher (stores metadata) |
| **Network topology** | Requires central server | Peer-to-peer or server |
| **Convergence** | Guaranteed with proper transforms | Mathematically proven |

**Rule of thumb**:
- Google Docs-style text editing → OT
- Figma-style object editing → CRDTs

---

## Operational Transform (OT)

### How It Works

OT transforms concurrent operations so they can be applied in any order and produce the same result.

**Example**:

```
Initial: "Hello"

User A: Insert "!" at position 5 → "Hello!"
User B: Insert "World" at position 5 → "HelloWorld"
```

Without OT:
```
A applies locally: "Hello!"
B applies locally: "HelloWorld"
A receives B's op: Insert "World" at 5 → "HelloWorld!" ❌ Wrong!
```

With OT:
```
A applies locally: "Hello!"
B applies locally: "HelloWorld"
A receives B's op, transforms it:
  - Original: Insert "World" at 5
  - Transformed: Insert "World" at 5 (before "!")
  - Result: "HelloWorld!" ✅ Correct!
```

### Transformation Rules

For text operations:

```typescript
function transform(op1: Operation, op2: Operation): [Operation, Operation] {
  if (op1.type === 'insert' && op2.type === 'insert') {
    if (op1.position < op2.position) {
      // op2 position shifts right
      return [op1, { ...op2, position: op2.position + op1.length }];
    } else if (op1.position > op2.position) {
      // op1 position shifts right
      return [{ ...op1, position: op1.position + op2.length }, op2];
    } else {
      // Same position - use tie-breaker (user ID)
      if (op1.userId < op2.userId) {
        return [op1, { ...op2, position: op2.position + op1.length }];
      } else {
        return [{ ...op1, position: op1.position + op2.length }, op2];
      }
    }
  }

  if (op1.type === 'delete' && op2.type === 'insert') {
    // ... more rules
  }

  // ... handle all operation type combinations
}
```

### Challenges

**Challenge 1: All operation pairs must be defined**

For `n` operation types, you need `n²` transformation functions. Text has 3 types (insert, delete, replace) = 9 combinations.

**Challenge 2: Transformation must be commutative**

```
transform(transform(op1, op2), op3) === transform(op1, transform(op2, op3))
```

**Challenge 3: Undo/redo is complex**

Undoing an operation requires transforming it against all subsequent operations.

### When OT Shines

✅ Text editing (Google Docs, Etherpad)
✅ Code editors (Codeshare, CodeSandbox)
✅ Low latency environments
✅ Central server architecture

### When OT Struggles

❌ High latency (satellite, mobile)
❌ Offline editing (can't transform without server)
❌ Complex data structures (requires more transformation rules)

---

## CRDTs (Conflict-free Replicated Data Types)

### How They Work

CRDTs use unique identifiers for each element, making order-independent merges possible.

**Example**: Yjs (a CRDT library)

```
Initial: "Hello"

User A: Insert "!" → "Hello!"
User B: Insert "World" → "HelloWorld"
```

Under the hood:
```
"Hello" = [
  { id: "1.0", char: "H" },
  { id: "1.1", char: "e" },
  { id: "1.2", char: "l" },
  { id: "1.3", char: "l" },
  { id: "1.4", char: "o" }
]

User A inserts "!":
  { id: "1.4.A1", char: "!" }

User B inserts "World":
  { id: "1.4.B1", char: "W" },
  { id: "1.4.B2", char: "o" },
  { id: "1.4.B3", char: "r" },
  { id: "1.4.B4", char: "l" },
  { id: "1.4.B5", char: "d" }

Merge (sort by ID):
  "Hello" + "World" + "!" = "HelloWorld!"
```

### CRDT Types

**1. G-Counter (Grow-only Counter)**

```typescript
class GCounter {
  private counters: Map<string, number> = new Map();

  increment(userId: string, amount: number = 1): void {
    const current = this.counters.get(userId) || 0;
    this.counters.set(userId, current + amount);
  }

  get value(): number {
    return Array.from(this.counters.values()).reduce((sum, v) => sum + v, 0);
  }

  merge(other: GCounter): void {
    other.counters.forEach((value, userId) => {
      const current = this.counters.get(userId) || 0;
      this.counters.set(userId, Math.max(current, value));
    });
  }
}
```

**2. LWW-Element-Set (Last-Write-Wins Set)**

```typescript
class LWWSet<T> {
  private addSet: Map<T, number> = new Map();
  private removeSet: Map<T, number> = new Map();

  add(element: T, timestamp: number = Date.now()): void {
    this.addSet.set(element, timestamp);
  }

  remove(element: T, timestamp: number = Date.now()): void {
    this.removeSet.set(element, timestamp);
  }

  has(element: T): boolean {
    const addTime = this.addSet.get(element) || 0;
    const removeTime = this.removeSet.get(element) || 0;
    return addTime > removeTime;
  }

  merge(other: LWWSet<T>): void {
    other.addSet.forEach((timestamp, element) => {
      const current = this.addSet.get(element) || 0;
      this.addSet.set(element, Math.max(current, timestamp));
    });

    other.removeSet.forEach((timestamp, element) => {
      const current = this.removeSet.get(element) || 0;
      this.removeSet.set(element, Math.max(current, timestamp));
    });
  }
}
```

**3. Y.Text (Yjs Text CRDT)**

```typescript
import * as Y from 'yjs';

const ydoc = new Y.Doc();
const ytext = ydoc.getText('document');

// Insert
ytext.insert(0, 'Hello');
ytext.insert(5, ' World');

// Delete
ytext.delete(5, 6);  // Remove " World"

// Automatic conflict resolution
// No transformation needed!
```

### When CRDTs Shine

✅ Offline-first apps (sync when reconnected)
✅ Peer-to-peer collaboration (no central server)
✅ High latency environments
✅ Complex data structures (JSON, maps, sets)

### When CRDTs Struggle

❌ Memory overhead (stores tombstones for deletes)
❌ Garbage collection complexity
❌ Learning curve (new mental model)

---

## Performance Comparison

### Memory Usage

**Text: "Hello World"** (11 characters)

OT:
```
String: 11 bytes
Operations buffer: ~100 bytes
Total: ~111 bytes
```

CRDT (Yjs):
```
String: 11 bytes
IDs per char: 11 × 16 bytes = 176 bytes
Metadata: ~50 bytes
Total: ~237 bytes (2× overhead)
```

**Verdict**: OT uses 50% less memory for text.

---

### Network Traffic

**Scenario**: User types "Hello" (5 keystrokes)

OT with batching (200ms):
```
Batch 1: ["H", "e"]
Batch 2: ["l", "l"]
Batch 3: ["o"]
Total: 3 messages
```

CRDT:
```
Message 1: "H" with ID
Message 2: "e" with ID
... (can batch too)
Total: Similar with batching
```

**Verdict**: Comparable with batching.

---

### Convergence Time

**Scenario**: 100 concurrent edits, 200ms latency

OT:
```
Server receives ops sequentially
Transforms each against prior ops
Total time: ~20 seconds
```

CRDT:
```
Peers can merge independently
Parallel processing
Total time: ~5 seconds
```

**Verdict**: CRDTs converge 4× faster in high-concurrency scenarios.

---

## Real-World Examples

### Google Docs (OT)

**Why OT**:
- Text-focused
- Central server (Google's infrastructure)
- Low latency (Google's network)
- Complex transformation logic is worth it for text quality

**Implementation**:
- Custom OT algorithm
- Operational transforms for rich text
- Server authority for conflict resolution

---

### Figma (CRDT)

**Why CRDT**:
- JSON-based (layers, properties, styles)
- Needs offline support
- Complex nested structures
- Peer-to-peer multiplayer

**Implementation**:
- Custom CRDT for design objects
- Yjs for some text fields
- Operational transforms for specific operations

---

### Linear (Hybrid)

**Why Hybrid**:
- Issue descriptions use CRDTs (offline editing)
- Comments use simpler append-only (no conflicts)
- Timestamps use Last-Write-Wins

**Implementation**:
- Multiple strategies for different data types
- CRDTs where needed, simpler approaches elsewhere

---

## Choosing a Strategy

### Decision Tree

```
Does your data need offline editing?
├── Yes → CRDT
└── No → Continue

Is your primary data type text?
├── Yes → OT (Google Docs-style)
└── No → Continue

Do you have a central server?
├── Yes → OT is viable
└── No → CRDT (peer-to-peer)

Is latency low (&lt;50ms)?
├── Yes → OT works well
└── No → CRDT handles better

Are you editing JSON objects?
├── Yes → CRDT (easier for objects)
└── No → Either works
```

### Hybrid Approach

Many apps use both:

```typescript
// Text fields: OT
const textEditor = new OTEditor();

// Object properties: CRDT
const properties = new Y.Map();

// Simple fields: Last-Write-Wins
const title = new LWWRegister();
```

---

## Libraries

### OT Libraries

| Library | Language | Maturity | Use Case |
|---------|----------|----------|----------|
| [ot.js](https://github.com/Operational-Transformation/ot.js) | JavaScript | Stable | Text editing |
| [ShareDB](https://github.com/share/sharedb) | JavaScript | Mature | Real-time database with OT |
| [CodeMirror](https://codemirror.net/) | JavaScript | Mature | Code editor with OT support |

### CRDT Libraries

| Library | Language | Maturity | Use Case |
|---------|----------|----------|----------|
| [Yjs](https://github.com/yjs/yjs) | JavaScript | Mature | Text, maps, arrays |
| [Automerge](https://github.com/automerge/automerge) | JavaScript | Mature | JSON documents |
| [Diamond Types](https://github.com/josephg/diamond-types) | Rust/JS | Experimental | Fast text CRDTs |
| [LORO](https://github.com/loro-dev/loro) | Rust/JS | New (2023) | Rich text + objects |

---

## Performance Tips

### OT Optimization

```typescript
// Batch operations
const batchedOps: Operation[] = [];
const flushInterval = 200; // ms

function queueOperation(op: Operation): void {
  batchedOps.push(op);
}

setInterval(() => {
  if (batchedOps.length > 0) {
    socket.emit('operations', batchedOps);
    batchedOps.length = 0;
  }
}, flushInterval);
```

### CRDT Optimization

```typescript
// Garbage collection (remove tombstones)
import * as Y from 'yjs';

const ydoc = new Y.Doc({ gc: true });

// Compact document periodically
setInterval(() => {
  // Remove deleted content older than 30 days
  ydoc.gc = true;
}, 86400000);  // Daily
```

---

## Conclusion

**Choose OT if**:
- Primary data is text
- You have central server infrastructure
- Latency is low
- You can invest in proper transformation logic

**Choose CRDT if**:
- You need offline support
- Data is JSON/objects/sets
- Peer-to-peer architecture
- High latency or unreliable network

**Choose Hybrid if**:
- Different data types have different needs
- You want best of both worlds
- You can manage complexity

---

## Resources

- [OT Visualization](https://operational-transformation.github.io/)
- [Yjs Demos](https://demos.yjs.dev/)
- [Automerge Docs](https://automerge.org/docs/)
- [Figma's Multiplayer Tech](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- [CRDT Research Papers](https://crdt.tech/)
