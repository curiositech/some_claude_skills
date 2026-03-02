# Node.js Profiling Reference

Detailed reference for Node.js performance profiling tools and techniques.

---

## --inspect and V8 Inspector Protocol

### Flags Reference

| Flag | Use |
|------|-----|
| `--inspect` | Attach debugger/profiler; process continues immediately |
| `--inspect-brk` | Attach and pause before first line of user code |
| `--inspect=0.0.0.0:9229` | Listen on all interfaces (for Docker) |
| `--inspect-port=9229` | Set port explicitly |

### Remote Inspection in Docker

```yaml
# docker-compose.yml
services:
  app:
    command: node --inspect=0.0.0.0:9229 src/server.js
    ports:
      - "3000:3000"
      - "9229:9229"
```

Then open `chrome://inspect` and add the target host.

---

## clinic.js Deep Dive

### Install

```bash
npm install -g clinic
```

### clinic doctor — Triage

Runs the process and generates an HTML report highlighting anomalies.

```bash
# Basic usage (sends HTTP load automatically if http port detected)
clinic doctor -- node server.js

# With manual load (useful when load profile matters)
clinic doctor -- node server.js &
npx autocannon -d 20 -c 100 http://localhost:3000/api/endpoint
# Wait for autocannon to finish, then Ctrl+C the node process
```

Doctor checks: CPU usage patterns, event loop delay, memory growth, handle counts. It gives a "diagnosis" like "I/O-bound" or "CPU-saturated" with links to relevant tools.

### clinic flame — Flame Graph

Wraps 0x with a nicer HTML output and automatic load generation.

```bash
clinic flame -- node server.js
```

Read the flame graph:
- **X-axis**: proportion of time (wider = more time spent here)
- **Y-axis**: call stack depth (bottom = entry points, top = leaf functions)
- **Color**: by module (green = V8 internals, blue = node internals, user code varies)
- **Click**: zooms into that frame's subtree

What to look for:
1. Unexpectedly wide bars in library code (JSON.stringify, template engines)
2. Wide bars that are your code — those are the targets
3. Long stacks that terminate in I/O but should not block the event loop

### clinic bubbles — Event Loop Utilization

Visualizes what is occupying the event loop over time.

```bash
clinic bubbles -- node server.js
```

Shows "bubbles" for each type of activity. Large bubbles mean the event loop spends significant time in those operations. Look for bubbles from:
- Timer callbacks (setInterval/setTimeout)
- I/O callbacks
- Microtasks (Promise resolution)
- User code

---

## 0x Flame Graphs

### Install and Basic Use

```bash
npm install -g 0x

# Profile and generate flame graph
0x -- node src/server.js

# The flame graph opens in your default browser
# Or find it in: ./{pid}.0x/flamegraph.html
```

### 0x with Load Testing

```bash
# Start profiling server, send load, then Ctrl+C
0x -- node src/server.js &
SERVER_PID=$!
sleep 1

npx autocannon -d 30 -c 10 http://localhost:3000/api/endpoint

kill $SERVER_PID
# 0x generates flamegraph.html automatically on process exit
```

### Reading 0x Output

- **Stacks with `[idle]` at top**: process was waiting for I/O — this is NOT CPU time
- **Wide stacks ending in your code**: these are your bottlenecks
- **Wide stacks in `[eval]` or `[interpreted]`**: code not yet JIT-compiled (warm up first)
- **`node::internal` wide stacks**: check if you're doing synchronous crypto, path operations, or JSON in hot paths

### Filtering

0x accepts filtering flags:

```bash
# Show only JS frames (hide V8 internals)
0x --node-args="--perf-basic-prof" -- node server.js

# Generate SVG instead of interactive HTML
0x --svg -- node server.js
```

---

## Heap Profiling

### Three-Snapshot Protocol

1. Start process, wait for it to fully initialize
2. **Snapshot 1**: baseline after initialization
3. Send N requests (e.g., 100 requests to your endpoint)
4. **Snapshot 2**: after N requests
5. Send another N requests
6. **Snapshot 3**: after 2N requests

In Chrome DevTools Memory tab, use "Comparison" view between Snapshot 2 and Snapshot 3. Objects that grew in proportion to request count are leaking.

### Heap Snapshot via Node.js API

```js
const { writeHeapSnapshot } = require('v8');

// Trigger on SIGUSR2 signal
process.on('SIGUSR2', () => {
  const filename = writeHeapSnapshot();
  console.log(`Heap snapshot written to ${filename}`);
});

// Send signal from another terminal:
// kill -USR2 <pid>
```

### heapdump Package

```bash
npm install heapdump
```

```js
const heapdump = require('heapdump');

// Take snapshot and save to file
heapdump.writeSnapshot('/tmp/myapp.' + Date.now() + '.heapsnapshot', (err, filename) => {
  console.log(`Snapshot written to ${filename}`);
});
```

Load `.heapsnapshot` files in Chrome DevTools → Memory tab → "Load" button.

### Interpreting Heap Snapshots

- **Shallow size**: memory used by the object itself (not including what it references)
- **Retained size**: total memory that would be freed if this object were GC'd (including all exclusively referenced objects)
- **Distance**: how many hops from the GC root — high distance means deeply nested

Sort by **Retained Size** to find the objects holding the most memory hostage.

---

## Event Loop Monitoring in Production

### perf_hooks EventLoopUtilization

```js
const { performance } = require('perf_hooks');

let lastELU = performance.eventLoopUtilization();

setInterval(() => {
  const elu = performance.eventLoopUtilization(performance.eventLoopUtilization(), lastELU);
  lastELU = performance.eventLoopUtilization();

  if (elu.utilization > 0.8) {
    console.warn(`High ELU: ${(elu.utilization * 100).toFixed(1)}% — event loop may be saturated`);
  }
}, 10_000);
```

### Event Loop Delay with perf_hooks

```js
const { monitorEventLoopDelay } = require('perf_hooks');

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  console.log({
    min: (h.min / 1e6).toFixed(2) + 'ms',
    max: (h.max / 1e6).toFixed(2) + 'ms',
    mean: (h.mean / 1e6).toFixed(2) + 'ms',
    p99: (h.percentile(99) / 1e6).toFixed(2) + 'ms',
  });
  h.reset();
}, 10_000);
```

p99 event loop delay above 100ms will cause perceptible latency spikes. Above 1000ms indicates a blocking operation in the event loop.

---

## Stream Backpressure Diagnosis

When a transform stream or pipeline slows down, backpressure builds. Symptoms: memory grows proportionally to input rate, process seems "stuck."

```js
// Correct: respect backpressure return value
const writable = fs.createWriteStream('output.txt');

readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    readable.pause();
    writable.once('drain', () => readable.resume());
  }
});

// Better: use pipeline (handles backpressure and cleanup automatically)
const { pipeline } = require('stream/promises');
await pipeline(readable, transform, writable);
```

Use clinic bubbles to visualize when the event loop is occupied by stream callbacks — a flat bubble for stream I/O that grows over time indicates backpressure accumulation.

---

## Autocannon — HTTP Load Tool

```bash
npm install -g autocannon

# 100 connections, 30-second run
npx autocannon -c 100 -d 30 http://localhost:3000/api/endpoint

# POST with body
npx autocannon -c 50 -d 20 \
  -m POST \
  -H "content-type=application/json" \
  -b '{"userId":1}' \
  http://localhost:3000/api/process

# Output: latency percentiles, req/sec, throughput
# Key metrics: p99 latency, throughput (req/sec), error rate
```

Pair autocannon with clinic or 0x: start the profiling tool, let autocannon warm up the JIT (first 5 seconds), then measure steady-state performance.
