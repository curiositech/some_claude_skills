# Server-Sent Events (SSE) Protocol

Deep dive into the SSE specification and implementation details for LLM streaming.

## Protocol Basics

SSE is a simple HTTP-based protocol for server-to-client streaming.

**Request**:
```http
GET /api/stream HTTP/1.1
Accept: text/event-stream
Cache-Control: no-cache
```

**Response**:
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: First message

data: Second message

data: {"type":"completion","text":"Token"}

```

## Message Format

### Data Field

The only required field. Can span multiple lines.

```
data: Simple message

data: Multi-line
data: message
data: here

data: {"json":"works too"}

```

### Event Field

Custom event types (default is "message").

```
event: status
data: {"state":"processing"}

event: completion
data: {"content":"Hello"}

```

### ID Field

Event identifier for reconnection.

```
id: 1
data: First event

id: 2
data: Second event

```

Client can reconnect with `Last-Event-ID` header:
```http
GET /api/stream HTTP/1.1
Last-Event-ID: 2
```

### Retry Field

Reconnection delay in milliseconds.

```
retry: 3000
data: Reconnect after 3 seconds if disconnected

```

## Client Implementation

### EventSource API (Browser)

```typescript
const eventSource = new EventSource('/api/stream');

eventSource.onmessage = (event) => {
  console.log('Data:', event.data);
};

eventSource.addEventListener('status', (event) => {
  console.log('Status:', JSON.parse(event.data));
});

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};

// Close connection
eventSource.close();
```

**Limitations**:
- No custom headers (can't send Authorization)
- No POST requests (GET only)
- Limited error handling

### Fetch API (More Control)

```typescript
const response = await fetch('/api/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ prompt: 'Hello' })
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

**Advantages**:
- Custom headers
- POST requests
- AbortController support
- Better error handling

## Server Implementation

### Node.js (Express)

```typescript
import express from 'express';

app.get('/api/stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial message
  res.write('data: Connected\n\n');

  // Send periodic updates
  const interval = setInterval(() => {
    res.write(`data: ${Date.now()}\n\n`);
  }, 1000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});
```

### Next.js (App Router)

```typescript
// app/api/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send messages
      controller.enqueue(encoder.encode('data: Hello\n\n'));
      controller.enqueue(encoder.encode('data: World\n\n'));

      // Close stream
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### Edge Runtime (Vercel/Cloudflare)

```typescript
export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Stream from LLM
      for await (const chunk of llmStream(prompt)) {
        const message = `data: ${JSON.stringify({ content: chunk })}\n\n`;
        controller.enqueue(encoder.encode(message));
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
}
```

## Reconnection Logic

SSE has built-in reconnection, but Fetch API requires manual implementation.

```typescript
class SSEClient {
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private reconnectAttempts = 0;

  async connect(url: string, onMessage: (data: string) => void) {
    try {
      const response = await fetch(url);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      // Reset reconnect state on successful connection
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            onMessage(line.slice(6));
          }
        }
      }
    } catch (error) {
      // Exponential backoff
      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.maxReconnectDelay
      );

      console.log(`Reconnecting in ${this.reconnectDelay}ms...`);

      setTimeout(() => {
        this.connect(url, onMessage);
      }, this.reconnectDelay);
    }
  }
}
```

## CORS Configuration

SSE requires proper CORS headers.

```typescript
// Server-side
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

## Heartbeat Pattern

Send periodic pings to keep connection alive.

```typescript
// Server
const heartbeat = setInterval(() => {
  res.write(': heartbeat\n\n'); // Comment, ignored by client
}, 15000);

req.on('close', () => {
  clearInterval(heartbeat);
});
```

**Why**: Some proxies close idle connections after 30 seconds.

## Error Handling

### Client-Side Errors

```typescript
try {
  const response = await fetch('/api/stream');

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  // Stream handling...
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Stream cancelled');
  } else if (error.message.includes('Failed to fetch')) {
    console.error('Network error');
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Server-Side Errors

```typescript
// Send error as SSE event
async start(controller) {
  try {
    // Streaming logic...
  } catch (error) {
    const errorMessage = `event: error\ndata: ${JSON.stringify({
      message: error.message
    })}\n\n`;
    controller.enqueue(encoder.encode(errorMessage));
    controller.close();
  }
}
```

## Performance Considerations

### Backpressure

Slow clients can overwhelm server. Handle backpressure:

```typescript
const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of dataSource) {
      // Wait if client is slow
      if (controller.desiredSize !== null && controller.desiredSize <= 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
    }
  }
});
```

### Memory Management

Close connections when done:

```typescript
// Client
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/stream', { signal: controller.signal })
    .then(/* ... */);

  return () => {
    controller.abort();
  };
}, []);
```

## Security

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests'
});

app.get('/api/stream', limiter, (req, res) => {
  // Stream handler...
});
```

### Authentication

```typescript
// Server
const token = req.headers.authorization?.split(' ')[1];
if (!verifyToken(token)) {
  return res.status(401).send('Unauthorized');
}
```

## Production Checklist

```
□ Content-Type: text/event-stream header set
□ Cache-Control: no-cache header set
□ CORS configured correctly
□ Heartbeat implemented (for proxies)
□ Reconnection logic with exponential backoff
□ Error events sent to client
□ Rate limiting enabled
□ Authentication required
□ Memory cleanup on disconnect
□ Timeout for long-running streams
```

## Resources

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
