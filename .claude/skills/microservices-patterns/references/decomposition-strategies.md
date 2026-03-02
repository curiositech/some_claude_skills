# Service Decomposition Strategies

How to identify service boundaries, decompose a monolith safely, and align technical structure with team structure.

---

## Bounded Context Identification

### Domain Language Mapping

Start by mapping where the same word means different things to different teams. Each language discontinuity is a bounded context boundary.

**Workshop technique**: Run an Event Storming session. Put domain experts, developers, and product people in a room with sticky notes. Map:
1. **Domain Events** (orange): things that happen — "OrderPlaced", "PaymentProcessed", "ItemShipped"
2. **Commands** (blue): what triggered the event — "Place Order", "Charge Card"
3. **Aggregates** (yellow): the thing that received the command — Order, Payment
4. **External Systems** (pink): third parties — Stripe, FedEx
5. **Hotspots** (red): confusion, disputes, unclear areas

Hotspots reveal bounded context boundaries. When two groups of people have different definitions of the same term or disagree about who owns a concept, you have found a boundary.

### Identifying Aggregate Roots

An aggregate is a cluster of objects treated as a unit for data changes. The aggregate root is the only object accessible from outside the aggregate — all operations go through it.

```
Order Aggregate Root:
  - Order (root)
    - OrderItems []
    - ShippingAddress
    - BillingAddress

  External references:
    - customerId (not the Customer object — just its ID)
    - productId (not the Product object — just its ID)

Rules enforced by the aggregate:
  - An order must have at least one item
  - Total quantity cannot exceed 100
  - Status transitions: PENDING → CONFIRMED → SHIPPED → DELIVERED
```

If you find yourself loading multiple aggregates in a single transaction to enforce a business rule, reconsider your aggregate boundaries — the rule might belong in one of the aggregates, or in a domain service.

### Context Map Patterns

When bounded contexts interact, document the relationship:

**Shared Kernel**: Two contexts share a small subset of the domain model. Both teams agree to maintain this shared model together. Use sparingly — it creates coupling.

**Customer/Supplier**: Upstream context (supplier) provides an API; downstream context (customer) conforms to it. Supplier owns the contract, but should consider customer needs.

**Anti-Corruption Layer (ACL)**: Downstream context translates upstream's model into its own. Used when integrating with a legacy system or a poorly-designed upstream context. The ACL shields the downstream from upstream's idiosyncrasies.

**Published Language**: A well-documented shared language (often via OpenAPI or event schema registry) that both sides agree to. Good for integrating with external systems.

---

## Strangler Fig: Step-by-Step

### Phase 1: Prepare the Monolith

Before extracting anything, make the monolith extraction-ready:

1. **Add a routing facade**: All external traffic goes through an API gateway or proxy. This is the strangler — it decides whether to route to the monolith or the new service.

2. **Identify the seam**: Find a module in the monolith with:
   - Clear, cohesive responsibility
   - Minimal dependencies on other monolith modules
   - A stable interface (the API will not change frequently)
   - Its own data (or data that can be owned exclusively)

3. **Instrument the seam**: Add metrics and logging to the existing code path. You will use this to validate behavior parity after extraction.

### Phase 2: Extract the Service

1. **Implement the new service**: Build it from scratch (do not copy-paste from monolith). Clean implementation using what you know about the domain now.

2. **Shadow traffic**: Send real traffic to both the monolith and the new service; compare responses. Do not serve new service responses to clients yet. Fix discrepancies.

3. **Route a small percentage**: Use feature flags or canary routing to send 1% → 5% → 10% → 50% → 100% of traffic to the new service. Monitor for errors, latency changes, and behavior differences.

4. **Validate with real load**: Run both for at least one traffic cycle (daily peak, monthly spike) before proceeding.

### Phase 3: Database Extraction

This is the hardest part. Options in order of risk:

**Option A: Replicate data temporarily**
- New service reads from the monolith's database (via API, not direct SQL)
- Gradually migrate to its own database with dual-write
- Eventually cut over

**Option B: Dual-write**
```js
// Monolith writes to both databases during migration
async function updateOrder(order) {
  await legacyDb.update(order);       // old database
  await newServiceDb.update(order);   // new service's database
  // Both must succeed, or roll back both
}
```

**Option C: Event-based migration**
- Set up Kafka Connect or Debezium to stream changes from the old database
- New service consumes these events and builds its own data store
- Run in parallel, verify consistency, then cut over

**Option D: Offline migration**
- For tables with low write volume, take a snapshot, migrate, validate, then cut over with brief downtime

Never share a database table between the old monolith and the new service at steady state — this creates tight coupling that defeats the purpose of extraction.

### Phase 4: Decommission

1. Route 100% of traffic to new service
2. Keep monolith code running for two weeks (rollback safety)
3. Delete the monolith code, tables, and related configuration
4. Update documentation and architectural diagrams

---

## Domain-Driven Decomposition

### Decompose by Business Capability

Business capabilities are what the business does, not what the software does. Each capability should correspond to one service.

```
E-commerce capabilities:
  Product Management     → Catalog Service
  Customer Management    → Customer Service
  Order Management       → Order Service
  Inventory Management   → Inventory Service
  Payment Processing     → Payment Service
  Shipping/Fulfillment   → Fulfillment Service
  Reviews & Ratings      → Reviews Service
  Notifications          → Notification Service
  Search                 → Search Service
  Pricing & Promotions   → Pricing Service
```

Each capability maps to one vertical slice of the business. Teams that own capabilities have end-to-end responsibility: backend, data, APIs, and often the frontend piece.

### Common Decomposition Mistakes

**Too fine-grained too early**: "User Profile Service" + "User Preferences Service" + "User Address Service" as three separate services. These are all part of one bounded context (User Management) and create gratuitous complexity. Start with one "User Service" and split only if concrete operational reasons emerge (different scaling, different teams, different technologies).

**Not fine-grained enough**: "Backend Service" that does everything. This is just the monolith given a new name.

**Functional decomposition instead of domain decomposition**: Splitting by technology layer ("API Layer", "Business Logic Layer", "Data Layer") instead of by domain. This creates distributed coupling — a single feature change touches all three services simultaneously.

**Right size heuristic**: A service should be large enough to be deployed independently (has its own CI/CD pipeline, its own database, its own team ownership) and small enough to be understood by one team in one sprint.

---

## Team Topology Alignment

### Conway's Law

> Organizations which design systems are constrained to produce designs which are copies of the communication structures of those organizations.

Your architecture will reflect your org chart whether you intend it to or not. Use this intentionally: design your team structure first, then let the service structure follow.

### Team Topologies for Microservices

**Stream-Aligned Teams**: Own end-to-end delivery for a domain (a product area, a business capability). Each stream-aligned team owns 1-3 microservices aligned to their domain.

```
Order Team    → Order Service, Order History Service
Checkout Team → Cart Service, Payment Service, Pricing Service
Catalog Team  → Catalog Service, Search Service, Reviews Service
```

**Platform Teams**: Own shared capabilities that stream-aligned teams consume as self-service: infrastructure, observability, CI/CD pipelines, service mesh. Platform teams reduce cognitive load for stream-aligned teams.

**Enabling Teams**: Temporary teams that help stream-aligned teams adopt new practices (event sourcing, new testing framework). They teach and leave — they do not own services.

**Warning signs of wrong alignment**:
- Two teams must coordinate to release a single feature → their services are in the wrong places
- A team has to ask another team for help every sprint → there may be a missing internal platform service
- One team "owns" 15 services → too many; hard to maintain and evolve

---

## Data Migration Strategies

### Strangler Data Pattern (Parallel Run)

```
Phase 1: Monolith owns all data, new service reads from monolith
  Client → [Monolith] → [New Service reads via Monolith API]

Phase 2: Dual write — new service also writes to its own store
  Client → [New Service] ──writes─→ [New Service DB]
                         └─writes─→ [Monolith DB] (backwards compat)

Phase 3: New service is authoritative; monolith reads from new service
  Client → [New Service] → [New Service DB]
  Monolith reads from New Service API (reversed dependency)

Phase 4: Monolith references removed
  Client → [New Service] → [New Service DB]
```

### Debezium for Change Data Capture (CDC)

Stream changes from an existing database without modifying application code:

```yaml
# Debezium Kafka Connect configuration
{
  "name": "orders-cdc-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "legacy-db.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.dbname": "monolith",
    "table.include.list": "public.orders,public.order_items",
    "topic.prefix": "cdc",
    "plugin.name": "pgoutput"
  }
}
```

CDC events appear on Kafka topics: `cdc.public.orders`, `cdc.public.order_items`. The new service consumes these to build its own data store without any code changes to the monolith.

### Testing Data Migration

1. **Snapshot comparison**: At a point in time, take a snapshot from both old and new databases. Compare row counts, checksums, or sampled records.

2. **Shadow traffic validation**: Run both systems in parallel under real load. Compare responses for sampled requests.

3. **Canary by entity**: Migrate a percentage of entity IDs (orders, customers) to the new service. Old IDs stay in monolith. Monitor for differences in behavior.

```js
function routeRequest(entityId) {
  // Route a percentage of entities to new service (stable, not random)
  const hash = crc32(entityId) % 100;
  if (hash < CANARY_PERCENTAGE) {
    return 'new-service';
  }
  return 'monolith';
}
```

---

## Versioning and Backward Compatibility

### API Versioning Strategies

**URL versioning** (`/v1/orders`, `/v2/orders`): Most explicit. Clients know exactly what they are calling. Old versions remain until deprecated.

**Header versioning** (`Accept: application/vnd.myapp+json;version=2`): Cleaner URLs, but requires headers on every request. Harder to test in a browser.

**No versioning (evolutionary)**: Additive-only changes. New fields are optional, with defaults. Old consumers continue working without changes. Removals require a deprecation period. This is the most practical for internal services — coordinate with consumers rather than maintaining multiple versions.

### Event Schema Evolution

Events are harder to version than APIs because consumers are often decoupled and catch up asynchronously.

**Additive changes only (strongly preferred)**:
- Add optional fields with defaults
- Never remove fields
- Never change field types
- Never change field meanings (rename semantics)

**Schema registry**: Use Confluent Schema Registry or AWS Glue Schema Registry to enforce compatibility. Register schemas; new versions must pass compatibility checks (backward, forward, or full) before publishing.

```json
// Order v1 event
{ "orderId": "123", "customerId": "456", "total": 99.99 }

// Order v2 event — backward compatible (v1 consumers ignore new fields)
{ "orderId": "123", "customerId": "456", "total": 99.99, "currency": "USD" }

// BREAKING — do not do this:
{ "id": "123", "buyer": "456", "amount": 99.99 }  // Renamed fields
```

When a breaking change is truly unavoidable: publish to a new topic (`order-events-v2`), run consumers for both topics simultaneously during migration, deprecate the old topic with a sunset date.
