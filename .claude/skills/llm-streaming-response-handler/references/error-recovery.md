# Stream Error Recovery Strategies

Production patterns for handling errors during LLM streaming and providing graceful recovery.

## Error Categories

### 1. Network Errors
- Connection timeouts
- DNS failures
- Lost connectivity mid-stream

### 2. API Errors
- Rate limits (429)
- Authentication (401, 403)
- Server errors (500, 503)
- Invalid requests (400)

### 3. Stream-Specific Errors
- Malformed SSE data
- Unexpected stream termination
- Backpressure overload
- Client-side cancellation

---

## Pattern 1: Retry with Exponential Backoff

```typescript
async function streamWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);

      // Don't retry on client errors (4xx except rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`Client error: ${response.status}`);
      }

      // Don't retry on success
      if (response.ok) {
        return response;
      }

      // Retry on server errors and rate limits
      throw new Error(`Server error: ${response.status}`);

    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
const response = await streamWithRetry('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ prompt })
});
```

---

## Pattern 2: Rate Limit Handling

```typescript
async function handleRateLimit(response: Response): Promise<void> {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');

    if (retryAfter) {
      const delay = parseInt(retryAfter) * 1000;
      console.log(`Rate limited. Retrying after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } else {
      // No Retry-After header, use default backoff
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute
    }
  }
}

// Usage
const response = await fetch('/api/chat', { ... });

if (response.status === 429) {
  await handleRateLimit(response);
  // Retry request
  return fetch('/api/chat', { ... });
}
```

---

## Pattern 3: Graceful Degradation

Show partial response if stream fails mid-way.

```typescript
function useStreamingWithFallback() {
  const [content, setContent] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const stream = async (prompt: string) => {
    setError(null);
    setIsComplete(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsComplete(true);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              setContent(prev => prev + data.content);
            }
          }
        }
      }
    } catch (err) {
      setError(err as Error);
      // Keep partial content visible
      console.error('Stream failed, showing partial response:', content);
    }
  };

  return { content, error, isComplete, stream };
}

// UI shows partial content + error
{content && (
  <div>
    {content}
    {error && !isComplete && (
      <div className="error-banner">
        ⚠️ Connection lost. Showing partial response.
        <button onClick={() => stream(lastPrompt)}>Resume</button>
      </div>
    )}
  </div>
)}
```

---

## Pattern 4: Resume from Last Token

For very long streams, save checkpoints.

```typescript
interface StreamCheckpoint {
  prompt: string;
  content: string;
  lastTokenIndex: number;
}

async function streamWithCheckpoints(prompt: string) {
  let checkpoint: StreamCheckpoint | null = loadCheckpoint(prompt);

  if (checkpoint) {
    console.log('Resuming from checkpoint:', checkpoint.lastTokenIndex);
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      resumeFrom: checkpoint?.lastTokenIndex || 0
    })
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  let tokenIndex = checkpoint?.lastTokenIndex || 0;
  let content = checkpoint?.content || '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      // Process chunk...

      content += newToken;
      tokenIndex++;

      // Save checkpoint every 100 tokens
      if (tokenIndex % 100 === 0) {
        saveCheckpoint({ prompt, content, lastTokenIndex: tokenIndex });
      }
    }
  } catch (error) {
    // Checkpoint saved, can resume later
    console.error('Stream interrupted at token', tokenIndex);
    throw error;
  }
}
```

---

## Pattern 5: Client-Side Timeout

Prevent infinite hanging.

```typescript
async function streamWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 30000
): Promise<void> {
  const controller = new AbortController();

  // Set timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    // Reset timeout on each chunk
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      // Clear and reset timeout
      clearTimeout(timeoutId);
      const chunkTimeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const { done, value } = await reader.read();

      clearTimeout(chunkTimeoutId);

      if (done) break;

      // Process chunk...
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## Pattern 6: User-Friendly Error Messages

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection.';
    }

    // Timeout
    if (error.name === 'AbortError') {
      return 'Request timed out. Please try again.';
    }

    // Generic
    return error.message;
  }

  // HTTP errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;

    switch (status) {
      case 400:
        return 'Invalid request. Please try rephrasing.';
      case 401:
        return 'Please log in to continue.';
      case 403:
        return 'You don\'t have permission to do this.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable.';
      default:
        return `Error ${status}: Something went wrong.`;
    }
  }

  return 'An unexpected error occurred.';
}

// UI
{error && (
  <div className="error-message">
    <span>{getErrorMessage(error)}</span>
    <button onClick={retry}>Try Again</button>
  </div>
)}
```

---

## Pattern 7: Fallback to Non-Streaming

If streaming fails repeatedly, fall back to standard request.

```typescript
async function adaptiveStream(prompt: string): Promise<string> {
  try {
    // Try streaming first
    return await streamResponse(prompt);
  } catch (error) {
    console.log('Streaming failed, falling back to standard request');

    // Fallback to non-streaming
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, stream: false })
    });

    const data = await response.json();
    return data.content;
  }
}
```

---

## Pattern 8: Error Logging & Monitoring

```typescript
async function streamWithMonitoring(prompt: string) {
  const startTime = Date.now();

  try {
    await streamResponse(prompt);

    // Log success
    await logMetric({
      event: 'stream_success',
      duration: Date.now() - startTime,
      prompt
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error with context
    await logError({
      event: 'stream_error',
      error: error.message,
      duration,
      prompt,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Send to error tracking (Sentry, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: 'chat-stream',
          duration
        }
      });
    }

    throw error;
  }
}
```

---

## Pattern 9: Circuit Breaker

Stop trying after repeated failures.

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Circuit open: reject immediately
    if (this.state === 'open') {
      const timeSinceFailure = Date.now() - this.lastFailureTime;

      if (timeSinceFailure < 60000) { // 1 minute cooldown
        throw new Error('Circuit breaker open. Try again later.');
      }

      // Try half-open
      this.state = 'half-open';
    }

    try {
      const result = await fn();

      // Success: reset
      this.failures = 0;
      this.state = 'closed';

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      // Trip circuit after 3 failures
      if (this.failures >= 3) {
        this.state = 'open';
      }

      throw error;
    }
  }
}

const breaker = new CircuitBreaker();

// Usage
try {
  await breaker.execute(() => streamResponse(prompt));
} catch (error) {
  // Handle error or show cached response
}
```

---

## Production Checklist

```
□ Retry logic with exponential backoff
□ Rate limit handling (Retry-After header)
□ Graceful degradation (show partial)
□ User-friendly error messages
□ Timeout enforcement
□ Error logging to monitoring service
□ Circuit breaker for repeated failures
□ Fallback to non-streaming
□ Checkpoint saving for long streams
□ Network status detection
□ Offline mode (show cached)
□ Cancel button always works
```

---

## Testing Error Scenarios

### Simulate Network Failure

```typescript
// Test: Network interruption
if (process.env.NODE_ENV === 'development') {
  // Randomly fail 10% of requests
  if (Math.random() < 0.1) {
    throw new Error('Simulated network failure');
  }
}
```

### Simulate Rate Limit

```typescript
// Test: Rate limit response
return new Response('Too many requests', {
  status: 429,
  headers: {
    'Retry-After': '5' // 5 seconds
  }
});
```

### Simulate Partial Stream

```typescript
// Test: Stream fails halfway
controller.enqueue(encoder.encode('data: First half\n\n'));
await new Promise(resolve => setTimeout(resolve, 1000));
controller.error(new Error('Connection lost'));
```

---

## Resources

- [MDN: Error Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Retry Best Practices](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
