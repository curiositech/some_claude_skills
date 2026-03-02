# Inter-Service Communication Patterns

Detailed reference for choosing and implementing communication patterns between microservices.

---

## Synchronous: REST vs gRPC Decision Matrix

| Dimension | REST/HTTP | gRPC |
|-----------|-----------|------|
| **Protocol** | HTTP/1.1, HTTP/2 | HTTP/2 |
| **Payload** | JSON (text, flexible) | Protocol Buffers (binary, efficient) |
| **Schema** | Optional (OpenAPI) | Mandatory (.proto file) |
| **Streaming** | Limited (SSE, chunked) | First-class (client, server, bidirectional) |
| **Browser support** | Native | Requires gRPC-Web proxy |
| **Tooling** | Ubiquitous | Good, but more setup |
| **Latency** | Higher (JSON parsing) | Lower (binary encoding) |
| **Bandwidth** | Higher | Lower (2-10x smaller payloads) |
| **Best for** | Public APIs, external partners | Internal service-to-service |

### REST Patterns Worth Knowing

**Idempotency Keys** — Prevent duplicate operations when retrying:

```http
POST /api/payments HTTP/1.1
Idempotency-Key: uuid-from-client-must-be-unique-per-operation
Content-Type: application/json

{ "amount": 5000, "currency": "USD" }
```

Server stores `(idempotency_key, response)` for some TTL (e.g., 24 hours). If same key arrives again, return stored response without re-executing.

**Optimistic Concurrency with ETags**:

```http
# Fetch resource
GET /api/orders/123
→ ETag: "v4"

# Update with precondition — fails if version changed
PUT /api/orders/123
If-Match: "v4"
→ 200 OK if version still v4
→ 412 Precondition Failed if someone else updated it
```

### gRPC Service Definition

```protobuf
// order_service.proto
syntax = "proto3";
package order.v1;

service OrderService {
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc ListOrders(ListOrdersRequest) returns (stream Order);  // Server streaming
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc WatchOrders(WatchOrdersRequest) returns (stream OrderEvent);  // Real-time updates
}

message Order {
  string id = 1;
  string customer_id = 2;
  OrderStatus status = 3;
  repeated OrderItem items = 4;
  google.protobuf.Timestamp created_at = 5;
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_CONFIRMED = 2;
  ORDER_STATUS_SHIPPED = 3;
  ORDER_STATUS_DELIVERED = 4;
  ORDER_STATUS_CANCELLED = 5;
}
```

**Version your proto packages** (`order.v1`, `order.v2`) — never make breaking changes to an existing package. Add a new package version instead, run both simultaneously during migration, then retire the old version.

---

## Asynchronous Messaging

### Kafka vs RabbitMQ vs SQS

| Dimension | Kafka | RabbitMQ | AWS SQS |
|-----------|-------|----------|---------|
| **Model** | Log / event stream | Message broker | Queue as a service |
| **Retention** | Configurable (days/forever) | Until consumed | Up to 14 days |
| **Replay** | Yes (consumer offset) | No | No |
| **Ordering** | Per partition | Per queue | Best-effort (FIFO queues: yes) |
| **Fan-out** | Consumer groups | Exchanges + bindings | SNS + SQS |
| **Throughput** | Very high (millions/sec) | High | High |
| **Operational complexity** | High | Medium | Low (managed) |
| **Best for** | Event sourcing, audit log, replay | Complex routing, RPC patterns | Simple queues in AWS |

### Kafka Topics and Consumer Groups

```
Topic: order-events
  Partition 0: [OrderPlaced, OrderShipped, OrderDelivered, ...]
  Partition 1: [OrderPlaced, OrderCancelled, ...]
  Partition 2: [OrderPlaced, ...]

Consumer Group A (Inventory Service):
  Consumer 0 → reads Partition 0
  Consumer 1 → reads Partition 1
  Consumer 2 → reads Partition 2
  (each partition consumed by one consumer in the group)

Consumer Group B (Analytics Service):
  Consumer 0 → reads all partitions independently
  (fully separate offset — Analytics gets its own replay of all events)
```

**Key design decisions**:
- **Partition key**: determines which partition receives a message. Use entity ID (order ID, user ID) to keep all events for an entity on one partition — guarantees ordering per entity.
- **Consumer group**: one logical subscriber. Multiple consumer groups mean multiple independent subscribers — each gets every message.
- **Retention**: set long enough to allow replay for new consumers. 7-30 days is common. Event sourcing systems set infinite retention.

### At-Least-Once vs At-Most-Once vs Exactly-Once

| Guarantee | Consumer behavior | Use case |
|-----------|------------------|---------|
| **At-most-once** | Ack before processing | High-throughput, loss acceptable (metrics, analytics) |
| **At-least-once** | Ack after processing | Default for business operations — requires idempotent handlers |
| **Exactly-once** | Transactional — complex, expensive | Financial transactions, inventory |

**Designing idempotent consumers** (at-least-once + idempotency = effectively exactly-once):

```js
async function handleOrderShipped(event) {
  const { orderId, messageId } = event;

  // Idempotency check: have we processed this message before?
  const alreadyProcessed = await db.query(
    'SELECT 1 FROM processed_messages WHERE message_id = $1',
    [messageId]
  );
  if (alreadyProcessed.rows.length > 0) return;

  // Process in a transaction that also records the message ID
  await db.transaction(async (trx) => {
    await trx.query('UPDATE orders SET status = $1 WHERE id = $2', ['shipped', orderId]);
    await trx.query('INSERT INTO processed_messages (message_id) VALUES ($1)', [messageId]);
  });
}
```

---

## Saga Patterns: Orchestration vs Choreography Tradeoffs

### Orchestration

**Pros**:
- Explicit: you can look at the orchestrator and understand the entire saga flow
- Centralized error handling and compensation logic
- Easier to add steps, change order, or modify compensation
- Observable: one place to check saga state

**Cons**:
- Central coordinator becomes a coupling point (though it only sends commands, not business logic)
- Single point of failure for the saga (mitigated by durable execution)
- Can grow into a "god service" if not carefully scoped

**Implementation**: Use Temporal.io, AWS Step Functions, or Conductor for durable execution. These handle coordinator crashes, timeouts, and retries automatically.

### Choreography

**Pros**:
- Services are fully decoupled — no service knows about the overall flow
- Naturally fault-tolerant: events are persisted, services catch up independently
- No central coordinator to scale or fail

**Cons**:
- Difficult to understand: you must trace events across services to understand the flow
- Harder to add steps: each new step requires modifying multiple services to emit/consume new events
- Cyclic dependencies possible: Service A emits event that B consumes, which emits event that A consumes — subtle ordering bugs
- Compensation in choreography is complex: each service must listen for failure events and decide when to compensate

**Rule of thumb**: Use choreography for simple 2-3 step sagas. Use orchestration for complex multi-step workflows with branching logic, timeouts, and parallel steps.

---

## CQRS Read Model Patterns

### Materialized View from Events

```js
// Event handler that builds a read model
async function handleOrderEvent(event) {
  switch (event.type) {
    case 'OrderPlaced':
      await db.query(`
        INSERT INTO order_summaries (id, customer_id, status, total, created_at)
        VALUES ($1, $2, 'PENDING', $3, $4)
      `, [event.orderId, event.customerId, event.total, event.timestamp]);
      break;

    case 'OrderShipped':
      await db.query(`
        UPDATE order_summaries
        SET status = 'SHIPPED', shipped_at = $2, tracking_number = $3
        WHERE id = $1
      `, [event.orderId, event.timestamp, event.trackingNumber]);
      break;

    case 'OrderDelivered':
      await db.query(`
        UPDATE order_summaries SET status = 'DELIVERED', delivered_at = $2
        WHERE id = $1
      `, [event.orderId, event.timestamp]);
      break;
  }
}
```

The read model (`order_summaries`) is denormalized and optimized for queries. It can be rebuilt from scratch by replaying all events from the event store — this is the "time travel" benefit of event sourcing.

### Multiple Read Models from the Same Events

The same event stream feeds different read models for different use cases:

```
Order Events
  ├─→ order_summaries (status, dates, tracking)    — customer-facing order status
  ├─→ order_analytics (revenue, product counts)    — finance dashboard
  ├─→ customer_order_history (per-customer view)   — account page
  └─→ fulfillment_queue (items to pick and ship)   — warehouse system
```

Each read model is a projection of the same events, optimized differently.

### Eventual Consistency Lag

After a command, the read model is updated asynchronously. If the client immediately queries after a write, they might see stale data.

Solutions:
1. **Read your own writes**: After a write, poll until the read model reflects the change (optimistic — works most of the time)
2. **Version-based reads**: Write returns the version written; client requests that version or later (`GET /orders/123?min_version=42`)
3. **Accept eventual consistency**: Show "Your order is being processed" instead of the final state immediately

---

## Retry and Backoff Patterns

```js
// Exponential backoff with jitter — prevents thundering herd
async function callWithRetry(fn, { maxRetries = 3, baseDelayMs = 100 } = {}) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      if (!isRetryable(err)) throw err;  // Don't retry 4xx client errors

      const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * baseDelayMs;
      const delay = exponentialDelay + jitter;

      await sleep(delay);
    }
  }
}

function isRetryable(err) {
  // Retry: network errors, 429 (rate limit), 503 (service unavailable), 504 (gateway timeout)
  // Don't retry: 400 (bad request), 401 (unauthorized), 404 (not found)
  const retryableStatuses = [429, 503, 504];
  return !err.status || retryableStatuses.includes(err.status);
}
```

**Always combine retry with circuit breaker**: retry handles transient failures; circuit breaker handles sustained outages. Without a circuit breaker, retries during an outage amplify load on a struggling service.

---

## Dead Letter Queues

When a message fails processing repeatedly, move it to a Dead Letter Queue (DLQ) instead of losing it or blocking the main queue.

```yaml
# AWS SQS with DLQ
Resources:
  OrderEventsQueue:
    Type: AWS::SQS::Queue
    Properties:
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt OrderEventsDLQ.Arn
        maxReceiveCount: 3  # After 3 failures, move to DLQ

  OrderEventsDLQ:
    Type: AWS::SQS::Queue
    Properties:
      MessageRetentionPeriod: 1209600  # 14 days
```

Monitor DLQ depth as an alert: messages in the DLQ mean your consumer has a bug or received data it cannot process. Investigate and replay from DLQ after fixing.
