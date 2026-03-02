# Serving Architecture Tradeoffs

Deep reference for ML serving decisions. Covers patterns, frameworks, caching, cost optimization, and deployment strategies.

---

## Serving Patterns

### Batch Prediction (Precomputation)

**How it works**: Run inference on all possible inputs (or likely inputs) on a schedule. Store predictions in a key-value store. Serve predictions via simple lookup.

**When to use**:
- Finite, enumerable input space (e.g., recommendations for all users)
- Prediction freshness tolerance is hours or days
- High-throughput, low-latency serving requirement (lookup is O(1))
- Limited GPU budget (amortize compute overnight)

**When NOT to use**:
- Input space is combinatorial (e.g., search queries are infinite)
- Real-time features are critical (user just added item to cart)
- Model updates must take effect immediately

**Architecture**:
```
Training pipeline -> Model artifact -> Batch job (Spark/Dataflow) ->
Prediction store (DynamoDB/Redis) -> Serving API (simple lookup)
```

**Latency**: &lt;5ms (key-value lookup)
**Freshness**: Hours to days (depends on batch frequency)
**Cost**: Low compute (off-peak GPU), high storage (precomputed predictions)

---

### Online Inference

**How it works**: Model loaded in memory on serving nodes. Each request triggers real-time inference with current features.

**When to use**:
- Input space is infinite or unpredictable (search queries, free text)
- Real-time features materially improve predictions
- Low-latency requirement (&lt;100ms) with fresh predictions
- Model must react to current context (time, location, session)

**When NOT to use**:
- Latency budget cannot accommodate inference time
- Input space is small enough for batch precomputation
- Cost of always-on GPU fleet is unjustifiable

**Architecture**:
```
Request -> Feature service (Redis) -> Model server (Triton/TorchServe) ->
Post-processing -> Response
```

**Latency**: 10-500ms (depends on model size and hardware)
**Freshness**: Real-time
**Cost**: High compute (always-on GPU/CPU fleet)

---

### Near-Real-Time (Micro-Batch)

**How it works**: Small batch jobs run every 1-60 minutes. Combines some freshness benefits of online with cost benefits of batch.

**When to use**:
- Minutes-stale predictions are acceptable
- Features change frequently but not per-request
- Cost-sensitive but need more freshness than daily batch

**Architecture**:
```
Streaming events (Kafka) -> Micro-batch processor (Flink/Spark Streaming) ->
Feature update -> Model inference -> Prediction store update
```

**Latency**: Minutes (depends on batch interval)
**Freshness**: 1-60 minutes
**Cost**: Medium (scheduled compute, smaller fleet than online)

---

### Streaming Inference

**How it works**: Model consumes events from a stream and produces predictions continuously. No request-response cycle -- predictions are pushed.

**When to use**:
- Event-driven systems (fraud detection, anomaly detection, bidding)
- Prediction must happen on every event without explicit request
- Complex event processing with temporal patterns

**Architecture**:
```
Event stream (Kafka) -> Stream processor (Flink) with embedded model ->
Feature computation + inference in same pipeline -> Output stream/alert
```

**Latency**: Sub-second
**Freshness**: Continuous
**Cost**: High (always-on stream processing infrastructure)

---

## Pattern Comparison Matrix

| Dimension | Batch | Online | Near-RT | Streaming |
|-----------|-------|--------|---------|-----------|
| Latency | &lt;5ms (lookup) | 10-500ms | 1-60 min | Sub-second |
| Freshness | Hours/days | Real-time | Minutes | Continuous |
| Compute cost | Low (scheduled) | High (always-on) | Medium | High (always-on) |
| Storage cost | High (all predictions) | Low (model only) | Medium | Low |
| Complexity | Low | Medium | Medium | High |
| Input space | Finite | Infinite | Finite/Infinite | Event-driven |
| Best for | Recommendations | Search, Q&A | Feed ranking | Fraud, anomaly |

---

## Feature Store Architectures

### Dual-Store Pattern (Industry Standard)

Most production ML systems use a dual-store architecture:

**Offline store** (batch training):
- Technology: Hive, S3/Parquet, BigQuery, Delta Lake
- Stores: historical feature values with timestamps (point-in-time correctness)
- Used for: training data generation, batch feature computation, backfill
- Access pattern: full table scans, time-range queries

**Online store** (low-latency serving):
- Technology: Redis, DynamoDB, Bigtable, Cassandra
- Stores: latest feature values per entity (user, item, etc.)
- Used for: real-time feature retrieval during inference
- Access pattern: key-value lookup by entity ID, &lt;5ms p99

**Synchronization**: batch job materializes offline features to online store, streaming job updates real-time features

### Feature Store Frameworks

| Framework | Offline Store | Online Store | Streaming | Managed |
|-----------|-------------|-------------|-----------|---------|
| Feast | File/BQ/Redshift | Redis/DynamoDB | Limited | Self-hosted |
| Tecton | Spark/Snowflake | DynamoDB | Flink/Spark | Managed |
| Hopsworks | Hudi/Delta | RonDB | Kafka/Spark | Both |
| Databricks Feature Store | Delta Lake | Cosmos DB | Delta Live | Managed |
| Vertex AI Feature Store | BigQuery | Bigtable | Dataflow | Managed |
| SageMaker Feature Store | S3/Glue | DynamoDB | Kinesis | Managed |

### Feature Freshness Categories

| Category | Update Frequency | Examples | Store |
|----------|-----------------|----------|-------|
| Static | Rarely changes | User demographics, item metadata | Offline + online |
| Slowly changing | Daily/weekly | User preferences, item popularity | Batch -> online |
| Fast-changing | Minutes/hours | Trending items, session count | Micro-batch -> online |
| Real-time | Per event | Current cart, last click, velocity | Streaming -> online |

---

## Model Serving Frameworks

### Framework Comparison

| Framework | Best For | GPU Support | Batching | Quantization | Language |
|-----------|---------|------------|----------|--------------|----------|
| TorchServe | PyTorch models | Yes | Dynamic | TorchScript | Python/Java |
| Triton Inference Server | Multi-framework, high throughput | Yes (optimized) | Dynamic + concurrent | TensorRT, ONNX | C++/Python |
| TF Serving | TensorFlow models | Yes | Built-in | TF-Lite | C++ |
| vLLM | LLM serving | Yes (optimized) | Continuous, PagedAttention | AWQ, GPTQ, FP8 | Python |
| TGI (HuggingFace) | LLM serving | Yes | Continuous | BitsAndBytes, GPTQ | Rust/Python |
| ONNX Runtime | Cross-framework portability | Yes | Manual | ONNX quantization | C++/Python |
| BentoML | End-to-end ML service | Yes | Adaptive | Via runners | Python |
| Ray Serve | Complex pipelines, multi-model | Yes | Via batching decorator | Via underlying framework | Python |

### When to Use What

**Triton**: You need maximum throughput, serve multiple model types (PyTorch + TensorFlow + ONNX), or need concurrent model execution. Industry standard for high-scale.

**TorchServe**: Pure PyTorch shop, want tight integration with PyTorch ecosystem, simpler setup than Triton.

**vLLM**: Serving LLMs specifically. PagedAttention gives 2-4x throughput over naive serving. Best for text generation workloads.

**TGI**: HuggingFace models, want production-ready LLM serving with minimal configuration. Good default for transformer models.

**Ray Serve**: Complex serving graphs (multiple models in a pipeline), need autoscaling, want Python-native composition.

---

## Caching Strategies for ML

### Embedding Cache

**What**: Cache computed embeddings for items/users/queries.
**Hit rate**: High for items (millions of items, reusable), medium for queries (power-law distribution).
**Invalidation**: TTL-based (1-24 hours) + event-based (item metadata change, user activity).
**Storage**: Redis with vector support, or dedicated vector cache.
**Impact**: Skip embedding computation (50-200ms saved per cache hit).

### Prediction Cache

**What**: Cache final predictions for exact input combinations.
**Hit rate**: High for popular queries/items, low for long-tail.
**Invalidation**: TTL (15 min - 24 hours) + model version change.
**Storage**: Redis or Memcached.
**Impact**: Skip entire inference pipeline (10-500ms saved per cache hit).
**Risk**: Stale predictions for fast-changing contexts (user just bought the item).

### Feature Cache

**What**: Cache precomputed features for entities.
**Hit rate**: Very high (features change slowly relative to request rate).
**Invalidation**: Event-driven (user action triggers feature update) + periodic refresh.
**Storage**: Online feature store (Redis/DynamoDB) IS the cache.
**Impact**: Skip feature computation (10-100ms saved).

### Cache Hierarchy

```
Request -> Prediction cache (hit? return) ->
Feature cache (hit? compute prediction) ->
Feature computation -> Model inference ->
Cache prediction -> Return
```

---

## Cost Optimization Strategies

### Model-Level Optimization

| Technique | Latency Reduction | Quality Impact | Effort |
|-----------|------------------|----------------|--------|
| Quantization (INT8) | 2-4x speedup | &lt;1% accuracy loss (usually) | Low (automated tooling) |
| Quantization (INT4/FP4) | 3-6x speedup | 1-3% accuracy loss | Medium |
| Knowledge distillation | Model-dependent | Teacher-dependent | High |
| Pruning (structured) | 1.5-3x speedup | &lt;2% accuracy loss | Medium |
| ONNX conversion | 1.2-2x speedup | None (lossless) | Low |
| TensorRT optimization | 2-5x speedup | &lt;0.5% accuracy loss | Low-Medium |

### Infrastructure-Level Optimization

| Strategy | Cost Reduction | Tradeoff |
|----------|---------------|----------|
| Spot/preemptible instances | 60-90% compute cost | Interruption risk (use for batch, not serving) |
| GPU sharing (MIG/MPS) | 2-7x GPU utilization | Latency isolation concerns |
| Autoscaling | 30-60% average cost | Cold-start latency on scale-up |
| Regional deployment | 20-40% cost | Data residency constraints |
| Reserved instances | 30-50% vs on-demand | Commitment, less flexibility |
| ARM instances (Graviton/Axion) | 20-40% cost | CPU inference only, model compatibility |

### Architecture-Level Optimization

| Strategy | Cost Reduction | Implementation |
|----------|---------------|----------------|
| Cascade ranking (L1 cheap -> L2 expensive) | 5-10x fewer GPU inferences | Lightweight L1 filters 90% of candidates |
| Batch precomputation for stable inputs | Eliminate per-request GPU cost | Precompute for all users/items, serve via lookup |
| Embedding precomputation | Skip encoder at serving time | Precompute item embeddings, cache user embeddings |
| Model routing (simple -> complex) | 50-80% cheaper on easy inputs | Route easy inputs to small model, hard inputs to large |
| Feature store (avoid recomputation) | 70-90% feature compute savings | Compute once, serve many times |

---

## Latency Targets by Use Case

| Use Case | Total Latency Target | Model Budget | Notes |
|----------|---------------------|-------------|-------|
| Search ranking | &lt;50ms | &lt;30ms | Users notice &gt;200ms delays |
| Recommendation (feed) | &lt;200ms | &lt;100ms | Amortized over feed load |
| Recommendation (email) | N/A (batch) | N/A | Precomputed overnight |
| Content moderation (text) | &lt;100ms | &lt;50ms | Before content is visible |
| Content moderation (image) | &lt;500ms | &lt;300ms | Async acceptable for some platforms |
| Fraud detection | &lt;100ms | &lt;30ms | Must decide before authorization |
| Autonomous driving | &lt;100ms | &lt;80ms | Safety-critical, hard real-time |
| Chatbot / RAG | &lt;3s (total) | &lt;500ms (first token) | Streaming acceptable |
| Ad bidding | &lt;10ms | &lt;5ms | Auction deadline is hard |
| Speech recognition | &lt;300ms | &lt;200ms | Real-time conversation feel |

---

## Deployment Strategies for ML

### Shadow Mode

**What**: New model runs alongside production model. Both receive same traffic. New model predictions are logged but not served.
**When**: First deployment of a new model architecture. Want to verify predictions are reasonable before serving.
**Duration**: 1-7 days depending on traffic volume.
**Success criteria**: New model predictions are comparable to production, no latency regression, no error spikes.

### Canary Deployment

**What**: Route a small percentage of traffic to new model. Monitor metrics closely.
**Progression**: 1% -> 5% -> 25% -> 50% -> 100% (each step 1-3 days)
**Rollback trigger**: Online metric regression beyond threshold (e.g., CTR drops &gt;1%)
**Gotcha**: 1% traffic may not be enough to detect small metric changes. Use statistical power analysis.

### A/B Testing

**What**: Controlled experiment with random user assignment to control (old model) vs treatment (new model).
**Duration**: Determined by sample size calculation. Typical: 1-4 weeks.
**Pitfalls**:
- Novelty effect: users interact differently with new things initially
- Network effects: treatment users influence control users (social platforms)
- Multiple testing: running too many experiments inflates false positive rate
- Interference: seasonal effects, external events confound results

### Interleaving (for Ranking)

**What**: Merge results from two ranking models into a single list. Measure which model's results users prefer via clicks.
**When**: Faster than A/B testing for ranking (needs 10x less traffic to detect differences).
**How**: Team-Draft Interleaving -- alternate placing results from each model, credit clicks to the contributing model.
**Limitation**: Only works for ranking/recommendation, not classification or generation.

### Blue-Green Deployment

**What**: Two identical environments. One serves traffic (blue), one is idle (green). Deploy to green, switch traffic, keep blue as instant rollback.
**When**: Model serving infrastructure changes (not just model weights). Need zero-downtime deployment.
**Cost**: 2x infrastructure during deployment window.

---

## Model Versioning and Rollback

### Version Everything
- Model weights (with hash)
- Training data snapshot (or pointer to immutable dataset version)
- Feature pipeline code and configuration
- Serving configuration (batch size, timeout, device)
- Preprocessing/postprocessing code

### Rollback Checklist
1. Feature flag to switch between model versions (instant rollback)
2. Previous model version always loaded (warm standby) or loadable within SLA
3. Monitoring alert triggers automatic rollback consideration
4. Rollback preserves prediction logs for post-mortem analysis
5. Feature pipeline backward-compatible (new model features should not break old model)

### Model Registry

Use a model registry (MLflow, Weights & Biases, Vertex AI Model Registry) to track:
- Model version, training date, training data version
- Offline metrics at training time
- Promotion history: staging -> canary -> production
- Rollback history with reasons
- Associated feature pipeline version
