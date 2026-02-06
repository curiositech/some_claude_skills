# Unix Process Signals Reference

## Signal Types for Execution Control

| Signal | Number | Catchable | Purpose |
|--------|--------|-----------|---------|
| SIGTERM | 15 | Yes | Graceful termination request |
| SIGKILL | 9 | No | Immediate termination (cannot be caught) |
| SIGINT | 2 | Yes | Interrupt (Ctrl+C) |
| SIGHUP | 1 | Yes | Hangup (terminal closed) |
| SIGSTOP | 19 | No | Pause process |
| SIGCONT | 18 | Yes | Resume paused process |

## Best Practices

### 1. Always Try SIGTERM First

```typescript
// Give process time to clean up
proc.kill('SIGTERM');

// Wait for graceful exit
await Promise.race([
  waitForExit(proc),
  sleep(TIMEOUT_MS),
]);

// Only force kill if still running
if (!proc.killed) {
  proc.kill('SIGKILL');
}
```

### 2. Handle Signals in Your Process

```typescript
// In spawned process
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, cleaning up...');

  // Flush pending writes
  await flushBuffers();

  // Close connections
  await closeConnections();

  // Save progress
  await saveCheckpoint();

  process.exit(0);
});
```

### 3. Child Process Groups

When spawning with `detached: false` (default), children die with parent.

For independent children, use `detached: true` and track PIDs manually:
```typescript
const proc = spawn(cmd, args, { detached: true });
proc.unref(); // Parent can exit without waiting

// To kill later:
process.kill(-proc.pid, 'SIGTERM'); // Negative PID = process group
```

## Node.js Specifics

### spawn() is Preferred

Always use `spawn()` for execution control:
- Signals go directly to the process
- No shell injection vulnerabilities
- Streams available for real-time output

```typescript
// CORRECT: Use spawn with shell: false
const proc = spawn('claude', ['-p', prompt], {
  shell: false,  // Direct execution, no shell
});
```

### AbortSignal Integration

```typescript
const controller = new AbortController();

const proc = spawn('claude', ['-p', prompt], {
  signal: controller.signal, // Node 15+
});

// Later:
controller.abort(); // Sends SIGTERM
```

## Timeout Recommendations

| Scenario | Graceful Timeout | Notes |
|----------|------------------|-------|
| API request in flight | 5s | Allow request to complete |
| File I/O | 2s | Flush buffers |
| Claude CLI execution | 5s | May be mid-generation |
| Database transaction | 10s | Must commit or rollback |

## Debugging Orphaned Processes

```bash
# Find processes by name
ps aux | grep claude

# Find processes by parent PID
pstree -p <parent-pid>

# Kill process group
kill -TERM -<pgid>

# List all node processes
pgrep -a node
```

## Common Issues

### 1. Process Doesn't Die on SIGTERM

**Cause**: Process ignores or doesn't handle SIGTERM
**Solution**: Use SIGKILL after timeout

### 2. Zombie Processes

**Cause**: Parent doesn't `wait()` for child exit
**Solution**: Always handle `close` event:
```typescript
proc.on('close', (code) => {
  cleanup(proc.pid);
});
```

### 3. Shell Absorbs Signal

**Cause**: Using shell execution which spawns an intermediate shell
**Solution**: Use `spawn()` with `shell: false`
