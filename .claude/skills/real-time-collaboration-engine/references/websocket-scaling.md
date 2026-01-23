# WebSocket Scaling Strategies

Production patterns for scaling WebSocket connections to millions of concurrent users.

## The Challenge

**Single server limits**:
- Node.js: ~10,000 concurrent WebSocket connections
- Memory: 1MB per connection
- CPU: Context switching overhead

**1 million users**:
- Requires: 100 servers (10k connections each)
- Memory: 1TB total
- Challenge: Cross-server communication

---

## Architecture Patterns

### Pattern 1: Horizontal Scaling with Redis Pub/Sub

**Problem**: Users on different servers can't communicate

**Solution**: Redis as message bus

```
User A (Server 1) → Redis → User B (Server 2)
```

**Implementation**:

```typescript
// Server setup
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const httpServer = createServer();
const io = new Server(httpServer);

// Redis clients
const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  // Use Redis adapter
  io.adapter(createAdapter(pubClient, subClient));
});

// Now rooms work across servers!
io.to('room-123').emit('message', { text: 'Hello' });
```

**Performance**:
- Redis throughput: ~100k messages/second
- Latency: &lt;5ms additional overhead
- Can scale to millions of connections

---

### Pattern 2: Sticky Sessions with Load Balancer

**Problem**: HTTP polling falls back requires same server

**Solution**: Route user to same server

**nginx config**:
```nginx
upstream websocket_servers {
  # Sticky sessions based on IP
  ip_hash;

  server ws1.example.com:3000;
  server ws2.example.com:3000;
  server ws3.example.com:3000;
}

server {
  listen 80;

  location /socket.io/ {
    proxy_pass http://websocket_servers;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;

    # Sticky sessions
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

**Alternatives to ip_hash**:
- Cookie-based (`sticky` module)
- Session ID-based
- Consistent hashing

---

### Pattern 3: Namespace/Room-Based Sharding

**Problem**: Not all users need to be connected

**Solution**: Shard by room/namespace

```typescript
// Shard by document ID
const documentId = 'doc-123';
const shard = Math.abs(hashCode(documentId)) % serverCount;

// Route to specific server
const serverUrl = `ws://shard-${shard}.example.com`;
const socket = io(serverUrl);
```

**Benefits**:
- Users only connect to servers with their documents
- Natural load distribution
- Can scale specific shards

**Implementation**:

```typescript
// Consistent hashing
import crypto from 'crypto';

function getShardForDocument(documentId: string, totalShards: number): number {
  const hash = crypto.createHash('md5').update(documentId).digest('hex');
  const hashInt = parseInt(hash.substring(0, 8), 16);
  return hashInt % totalShards;
}

// Client connects to correct shard
const shard = getShardForDocument('doc-123', 10);
const socket = io(`wss://shard-${shard}.example.com`);
```

---

### Pattern 4: Microservice-Based Architecture

**Problem**: Monolithic WebSocket server doing too much

**Solution**: Separate concerns

```
┌──────────────┐
│   Gateway    │  (WebSocket connections)
│   Servers    │
└──────┬───────┘
       │
       ├─→ Document Service (CRDT sync)
       ├─→ Presence Service (cursors, users)
       ├─→ Auth Service (authentication)
       └─→ Notification Service (toasts, alerts)
```

**Benefits**:
- Scale services independently
- Easier to maintain
- Can use different languages per service

**Example**:

```typescript
// Gateway server (handles connections)
io.on('connection', (socket) => {
  // Forward to appropriate service
  socket.on('document-change', async (data) => {
    const result = await documentService.applyChange(data);
    io.to(data.documentId).emit('document-updated', result);
  });

  socket.on('cursor-move', async (data) => {
    await presenceService.updateCursor(socket.id, data);
  });
});
```

---

## Connection Management

### Pattern 5: Connection Pooling

**Problem**: Creating new connections is expensive

**Solution**: Reuse connections

```typescript
class ConnectionPool {
  private connections: Map<string, Socket> = new Map();
  private maxIdleTime = 60000; // 1 minute

  getConnection(userId: string): Socket {
    if (this.connections.has(userId)) {
      return this.connections.get(userId)!;
    }

    const socket = this.createConnection(userId);
    this.connections.set(userId, socket);

    // Clean up idle connections
    setTimeout(() => {
      if (!this.isActive(socket)) {
        socket.disconnect();
        this.connections.delete(userId);
      }
    }, this.maxIdleTime);

    return socket;
  }
}
```

---

### Pattern 6: Heartbeat/Ping-Pong

**Problem**: Dead connections consuming resources

**Solution**: Detect and close dead connections

```typescript
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT = 5000;   // 5 seconds

io.on('connection', (socket) => {
  let lastPong = Date.now();

  // Send ping
  const interval = setInterval(() => {
    socket.emit('ping');
  }, HEARTBEAT_INTERVAL);

  // Receive pong
  socket.on('pong', () => {
    lastPong = Date.now();
  });

  // Check for timeout
  const timeoutCheck = setInterval(() => {
    if (Date.now() - lastPong > HEARTBEAT_TIMEOUT) {
      console.log('Connection timeout, closing');
      socket.disconnect();
    }
  }, HEARTBEAT_INTERVAL);

  socket.on('disconnect', () => {
    clearInterval(interval);
    clearInterval(timeoutCheck);
  });
});
```

---

## Message Optimization

### Pattern 7: Message Batching

**Problem**: Too many small messages

**Solution**: Batch messages

```typescript
class MessageBatcher {
  private batch: any[] = [];
  private batchInterval = 100; // ms
  private timer: NodeJS.Timeout | null = null;

  add(message: any): void {
    this.batch.push(message);

    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, this.batchInterval);
    }
  }

  private flush(): void {
    if (this.batch.length > 0) {
      socket.emit('batch', this.batch);
      this.batch = [];
    }
    this.timer = null;
  }
}
```

**Impact**: 1000 messages/sec → 10 batches/sec (100x reduction)

---

### Pattern 8: Message Compression

**Problem**: Large payloads waste bandwidth

**Solution**: Compress messages

```typescript
import pako from 'pako';

// Compression middleware
io.use((socket, next) => {
  // Compress outgoing
  const originalEmit = socket.emit.bind(socket);
  socket.emit = function (event: string, data: any) {
    const compressed = pako.deflate(JSON.stringify(data));
    return originalEmit(event, compressed);
  };

  // Decompress incoming
  socket.onAny((event, data) => {
    if (data instanceof Buffer) {
      const decompressed = pako.inflate(data, { to: 'string' });
      socket.emit(event, JSON.parse(decompressed));
    }
  });

  next();
});
```

**Impact**: 100KB payload → 20KB compressed (80% reduction)

---

## Monitoring and Metrics

### Pattern 9: Real-Time Metrics

**Track**:
- Active connections per server
- Messages per second
- Average latency
- Error rate

```typescript
import { register, Counter, Gauge, Histogram } from 'prom-client';

// Metrics
const connectionsGauge = new Gauge({
  name: 'websocket_connections',
  help: 'Number of active WebSocket connections'
});

const messagesCounter = new Counter({
  name: 'websocket_messages_total',
  help: 'Total WebSocket messages',
  labelNames: ['type', 'direction']
});

const latencyHistogram = new Histogram({
  name: 'websocket_message_latency_ms',
  help: 'Message round-trip latency',
  buckets: [10, 50, 100, 500, 1000, 5000]
});

// Update metrics
io.on('connection', (socket) => {
  connectionsGauge.inc();

  socket.on('message', (data) => {
    messagesCounter.inc({ type: 'message', direction: 'inbound' });
    const latency = Date.now() - data.timestamp;
    latencyHistogram.observe(latency);
  });

  socket.on('disconnect', () => {
    connectionsGauge.dec();
  });
});

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

---

## Cloud Scaling

### AWS Architecture

```
                     ┌──────────────────┐
                     │  Application     │
                     │  Load Balancer   │
                     │  (ALB)           │
                     └────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐   ┌────▼──────┐  ┌────▼──────┐
        │ WebSocket │   │ WebSocket │  │ WebSocket │
        │ Server 1  │   │ Server 2  │  │ Server 3  │
        │ (EC2)     │   │ (EC2)     │  │ (EC2)     │
        └─────┬─────┘   └────┬──────┘  └────┬──────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │  ElastiCache    │
                    │  (Redis)        │
                    └─────────────────┘
```

**Auto-scaling**:

```yaml
# EC2 Auto Scaling Group
ScalingPolicy:
  MetricType: Custom
  Metric: WebSocketConnections
  TargetValue: 8000  # Scale at 80% of 10k limit
  ScaleUp: Add 1 instance
  ScaleDown: Remove 1 instance (drain connections first)
```

---

### Kubernetes Architecture

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: websocket-server
spec:
  replicas: 5
  selector:
    matchLabels:
      app: websocket
  template:
    metadata:
      labels:
        app: websocket
    spec:
      containers:
      - name: server
        image: myapp/websocket:latest
        ports:
        - containerPort: 3000
        env:
        - name: REDIS_URL
          value: redis://redis-service:6379
---
apiVersion: v1
kind: Service
metadata:
  name: websocket-service
spec:
  type: LoadBalancer
  selector:
    app: websocket
  ports:
  - port: 80
    targetPort: 3000
  sessionAffinity: ClientIP  # Sticky sessions
```

**Horizontal Pod Autoscaler**:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: websocket-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: websocket-server
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: websocket_connections
      target:
        type: AverageValue
        averageValue: "8000"
```

---

## Cost Optimization

### Pattern 10: Regional Sharding

**Problem**: Global latency

**Solution**: Deploy regionally

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  US-East   │     │  EU-West   │     │  AP-South  │
│  Cluster   │     │  Cluster   │     │  Cluster   │
└────────────┘     └────────────┘     └────────────┘
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
                  ┌──────▼──────┐
                  │   Global    │
                  │   Redis     │
                  └─────────────┘
```

**Latency reduction**: 200ms → 20ms for nearby users

---

## Capacity Planning

### Formulas

**Connections per server**:
```
Max Connections = (Available RAM - OS Overhead) / Memory per Connection
                = (16 GB - 2 GB) / 1 MB
                = 14,000 connections
```

**Servers needed**:
```
Servers = Total Users / Connections per Server
        = 1,000,000 / 10,000
        = 100 servers
```

**Monthly cost** (AWS t3.large, $0.0832/hour):
```
Cost = Servers × Hours per Month × Rate
     = 100 × 730 × $0.0832
     = $6,074 per month
```

---

## Production Checklist

```
□ Redis Pub/Sub for cross-server communication
□ Sticky sessions configured
□ Heartbeat/ping-pong to detect dead connections
□ Message batching (100-200ms)
□ Message compression for large payloads
□ Monitoring (connections, messages/sec, latency)
□ Auto-scaling based on connection count
□ Regional deployment for low latency
□ Load testing (simulate peak load)
□ Graceful shutdown (drain connections)
□ Circuit breaker for downstream services
□ Rate limiting per user
```

---

## Load Testing

### Using Artillery

```yaml
# load-test.yml
config:
  target: "wss://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 100  # 100 connections/sec
      name: "Ramp up"
    - duration: 300
      arrivalRate: 1000  # 1000 connections/sec
      name: "Sustained load"
  engines:
    socketio: {}

scenarios:
  - engine: socketio
    flow:
      - emit:
          channel: "join-room"
          data:
            roomId: "{{ $randomString() }}"
      - think: 5
      - loop:
          - emit:
              channel: "message"
              data:
                text: "Hello {{ $randomString() }}"
          - think: 2
        count: 10
```

**Run**:
```bash
artillery run load-test.yml
```

---

## Resources

- [Socket.IO Scaling](https://socket.io/docs/v4/using-multiple-nodes/)
- [Redis Adapter](https://github.com/socketio/socket.io-redis-adapter)
- [AWS ALB WebSocket](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html#websockets)
- [Kubernetes HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
