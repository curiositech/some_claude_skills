---
title: OpenTelemetry Setup Reference
sidebar_label: OpenTelemetry Setup Reference
sidebar_position: 2
---
# OpenTelemetry Setup Reference

Complete configuration for OTel SDK initialization, collector deployment, and trace propagation.

## SDK Initialization by Language

### Node.js

Install:
```bash
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions
```

`src/telemetry.ts` — must be the first import in your entrypoint:
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME ?? 'unknown-service',
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION ?? '0.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? 'development',
});

const sdk = new NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter({
    url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    headers: {
      'Authorization': `Bearer ${process.env.OTEL_EXPORTER_TOKEN}`,
    },
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
    }),
    exportIntervalMillis: 15000, // match Prometheus scrape interval
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // too noisy
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => req.url?.includes('/health'),
      },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', async () => {
  await sdk.shutdown();
});
```

`src/index.ts` — always import telemetry first:
```typescript
import './telemetry';  // Must be first
import express from 'express';
// ... rest of app
```

### Python

Install:
```bash
pip install opentelemetry-sdk \
  opentelemetry-exporter-otlp \
  opentelemetry-instrumentation-fastapi \
  opentelemetry-instrumentation-requests \
  opentelemetry-instrumentation-sqlalchemy
```

`app/telemetry.py`:
```python
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
import os

def init_telemetry():
    resource = Resource.create({
        SERVICE_NAME: os.getenv("SERVICE_NAME", "unknown-service"),
        SERVICE_VERSION: os.getenv("SERVICE_VERSION", "0.0.0"),
        "deployment.environment": os.getenv("ENVIRONMENT", "development"),
    })

    otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4318")

    # Traces
    tracer_provider = TracerProvider(resource=resource)
    tracer_provider.add_span_processor(
        BatchSpanProcessor(
            OTLPSpanExporter(endpoint=f"{otlp_endpoint}/v1/traces")
        )
    )
    trace.set_tracer_provider(tracer_provider)

    # Metrics
    metric_reader = PeriodicExportingMetricReader(
        OTLPMetricExporter(endpoint=f"{otlp_endpoint}/v1/metrics"),
        export_interval_millis=15000,
    )
    meter_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
    metrics.set_meter_provider(meter_provider)

# FastAPI app setup
from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

app = FastAPI()
init_telemetry()
FastAPIInstrumentor.instrument_app(app)
RequestsInstrumentor().instrument()
```

### Go

Install:
```bash
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp \
  go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

```go
// telemetry/setup.go
package telemetry

import (
    "context"
    "os"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
    "go.opentelemetry.io/otel/sdk/resource"
    "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

func InitTracer(ctx context.Context) (func(context.Context) error, error) {
    exporter, err := otlptracehttp.New(ctx,
        otlptracehttp.WithEndpoint(os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")),
    )
    if err != nil {
        return nil, err
    }

    res := resource.NewWithAttributes(
        semconv.SchemaURL,
        semconv.ServiceName(os.Getenv("SERVICE_NAME")),
        semconv.ServiceVersion(os.Getenv("SERVICE_VERSION")),
    )

    tp := trace.NewTracerProvider(
        trace.WithBatcher(exporter),
        trace.WithResource(res),
        trace.WithSampler(trace.ParentBased(trace.TraceIDRatioBased(0.1))), // 10% sampling
    )
    otel.SetTracerProvider(tp)

    return tp.Shutdown, nil
}
```

## OTel Collector Config

Deploy the OTel Collector as a sidecar or daemonset. It receives from your services and fans out to Jaeger, Prometheus, and your cloud provider.

`otel-collector-config.yaml`:
```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 5s
    send_batch_size: 512

  memory_limiter:
    limit_mib: 512
    spike_limit_mib: 128
    check_interval: 5s

  # Add environment and cluster metadata
  resource:
    attributes:
      - key: k8s.cluster.name
        value: ${CLUSTER_NAME}
        action: upsert

  # Filter health check spans
  filter:
    traces:
      exclude:
        match_type: regexp
        span_names: [".*health.*", ".*readiness.*", ".*liveness.*"]

exporters:
  # Jaeger (for trace visualization)
  otlp/jaeger:
    endpoint: jaeger-collector:4317
    tls:
      insecure: true

  # Prometheus (for metrics scraping)
  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: otel

  # Grafana Tempo (alternative to Jaeger)
  otlp/tempo:
    endpoint: tempo:4317
    tls:
      insecure: true

  # Cloud providers (pick one)
  otlp/datadog:
    endpoint: https://trace.agent.datadoghq.com
    headers:
      DD-API-KEY: ${DD_API_KEY}

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, filter, resource, batch]
      exporters: [otlp/jaeger]

    metrics:
      receivers: [otlp]
      processors: [memory_limiter, resource, batch]
      exporters: [prometheus]
```

## Span Attributes — Semantic Conventions

Use the OpenTelemetry semantic conventions for span attributes. Do not invent your own attribute names.

**HTTP spans** (auto-instrumented, but good to know):
```
http.method        = "POST"
http.url           = "https://api.example.com/payment"
http.status_code   = 200
http.route         = "/payment/:id"
```

**Database spans** (auto-instrumented with sqlalchemy/pg):
```
db.system          = "postgresql"
db.name            = "payments"
db.operation       = "INSERT"
db.sql.table       = "orders"
```

**Custom business spans** — add to your code:
```typescript
const tracer = trace.getTracer('payment-service');

async function processPayment(orderId: string, amountCents: number) {
  return tracer.startActiveSpan('payment.process', async (span) => {
    span.setAttributes({
      'payment.order_id': orderId,
      'payment.amount_cents': amountCents,
      'payment.currency': 'USD',
      // Never set: cardNumber, cvv, or any PII
    });

    try {
      const result = await chargeCard(orderId, amountCents);
      span.setStatus({ code: SpanStatusCode.OK });
      span.setAttribute('payment.transaction_id', result.transactionId);
      return result;
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

## Context Propagation

The W3C `traceparent` header propagates trace context across service boundaries.

Format: `00-{traceId-32hex}-{spanId-16hex}-{flags-2hex}`
Example: `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`

**Propagation in fetch/axios:**
```typescript
import { context, propagation } from '@opentelemetry/api';

async function callDownstreamService(url: string, body: object) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // OTel injects traceparent/tracestate automatically if using auto-instrumentation
  // Manual injection if needed:
  propagation.inject(context.active(), headers);

  return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
}
```

With `getNodeAutoInstrumentations()`, the `http` and `undici` instrumentations handle this automatically for all outbound calls.

## Sampling Strategy

Full trace sampling at 100% is expensive and often unnecessary. Use head-based sampling:

| Traffic Volume | Recommended Strategy |
|---------------|---------------------|
| &lt; 10 req/s | 100% sampling |
| 10-1000 req/s | 10% TraceIDRatioBased |
| > 1000 req/s | 1% + always-on for errors |
| Any | Always sample errors, never sample health checks |

```typescript
// Always sample errors, sample 10% of successes
class ErrorAlwaysSampler implements Sampler {
  shouldSample(context, traceId, spanName, spanKind, attributes) {
    if (attributes['http.status_code'] >= 400) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLED };
    }
    // 10% of everything else
    if (Math.random() < 0.1) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLED };
    }
    return { decision: SamplingDecision.NOT_RECORD };
  }
}
```
