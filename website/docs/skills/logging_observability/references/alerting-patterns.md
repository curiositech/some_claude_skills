---
title: Alerting Patterns Reference
sidebar_label: Alerting Patterns Reference
sidebar_position: 2
---
# Alerting Patterns Reference

SLI/SLO design, alert routing, fatigue prevention, and PagerDuty integration.

## SLI/SLO Design

### Vocabulary

- **SLI** (Service Level Indicator): A measurement. "Our 99th percentile latency."
- **SLO** (Service Level Objective): A target. "99th percentile latency &lt; 500ms over 30 days."
- **SLA** (Service Level Agreement): A contract with consequences if the SLO is missed.
- **Error Budget**: How much failure your SLO allows. SLO of 99.9% = 43.8 minutes/month of allowed downtime.

### The Four Golden Signals (Google SRE Book)

Every service needs SLIs for these:

| Signal | Definition | Example Metric |
|--------|-----------|----------------|
| **Latency** | Time to serve requests | p99 request duration &lt; 500ms |
| **Traffic** | Volume of requests | requests per second |
| **Errors** | Rate of failed requests | HTTP 5xx rate &lt; 0.1% |
| **Saturation** | How full the service is | CPU &lt; 80%, queue depth &lt; 1000 |

### SLO Templates by Service Type

**HTTP API:**
```yaml
slos:
  - name: availability
    sli: http_requests_total{status!~"5.."}  /  http_requests_total
    target: 0.999  # 99.9% — 43.8 min/month budget
    window: 30d

  - name: latency_p99
    sli: histogram_quantile(0.99, http_request_duration_seconds_bucket)
    target: 0.5  # < 500ms at p99
    window: 30d

  - name: latency_p50
    sli: histogram_quantile(0.50, http_request_duration_seconds_bucket)
    target: 0.1  # < 100ms at p50
    window: 30d
```

**Async Worker / Queue Consumer:**
```yaml
slos:
  - name: job_success_rate
    sli: jobs_completed_total / (jobs_completed_total + jobs_failed_total)
    target: 0.995  # 99.5% — more lenient for async

  - name: queue_lag
    sli: queue_oldest_unprocessed_message_age_seconds
    target: 60  # < 60 seconds lag
    window: 1h  # shorter window for queue health
```

### Error Budget Burn Rate Alerting

Burn rate alerts are more actionable than threshold alerts. They tell you how fast you're consuming your budget.

**Formula**: If your SLO is 99.9% over 30 days, your error budget is 43.8 minutes.
- Burn rate 1x = consuming budget at exactly the pace it's refreshed (sustainable)
- Burn rate 14.4x = consuming 30-day budget in 2 days (page immediately)
- Burn rate 6x = consuming budget in ~5 days (page within 1 hour)

**Multi-window, multi-burn-rate alerts** (the recommended pattern from Google SRE Workbook):

```yaml
# Prometheus alerting rules
groups:
  - name: slo.payment-service
    rules:
      # Fast burn: 2% of budget in 1 hour (14.4x rate) — page now
      - alert: PaymentServiceFastBurn
        expr: |
          (
            rate(http_requests_total{service="payment",status=~"5.."}[1h]) /
            rate(http_requests_total{service="payment"}[1h])
          ) > 0.144
        for: 2m
        labels:
          severity: critical
          team: payments
        annotations:
          summary: "Fast error budget burn on payment-service"
          description: "Burning error budget at {{ $value | humanizePercentage }} error rate (14.4x)"
          runbook: "https://runbooks.internal/payment-service/fast-burn"

      # Slow burn: 5% of budget in 6 hours (6x rate) — ticket or Slack
      - alert: PaymentServiceSlowBurn
        expr: |
          (
            rate(http_requests_total{service="payment",status=~"5.."}[6h]) /
            rate(http_requests_total{service="payment"}[6h])
          ) > 0.06
        for: 15m
        labels:
          severity: warning
          team: payments
        annotations:
          summary: "Slow error budget burn on payment-service"
          runbook: "https://runbooks.internal/payment-service/slow-burn"
```

## Alert Routing and Severity

### Severity Taxonomy

Do not use ad-hoc severity labels. Define a taxonomy and stick to it.

| Severity | Definition | Response | Channel |
|----------|-----------|----------|---------|
| **critical** | SLO breaching now, users impacted | Page on-call immediately | PagerDuty High |
| **warning** | Budget burning, will breach if not fixed | Ticket + Slack | PagerDuty Low / Slack |
| **info** | Anomaly worth watching, no breach risk | Grafana annotation | Slack only |

### PagerDuty Integration

```yaml
# Alertmanager config
global:
  resolve_timeout: 5m

receivers:
  - name: pagerduty-critical
    pagerduty_configs:
      - routing_key: ${PAGERDUTY_INTEGRATION_KEY}
        severity: critical
        description: '{{ .GroupLabels.alertname }}: {{ .Annotations.summary }}'
        details:
          runbook: '{{ .Annotations.runbook }}'
          service: '{{ .Labels.service }}'
          environment: '{{ .Labels.env }}'

  - name: slack-warning
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#alerts-warning'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ .Annotations.description }}'
        actions:
          - type: button
            text: 'Runbook'
            url: '{{ .Annotations.runbook }}'

  - name: slack-info
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#alerts-info'

route:
  group_by: ['alertname', 'service', 'env']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: slack-info  # default
  routes:
    - match:
        severity: critical
      receiver: pagerduty-critical
      repeat_interval: 1h  # re-page every hour if not resolved
    - match:
        severity: warning
      receiver: slack-warning
      repeat_interval: 8h
```

## Alert Fatigue Prevention

### The Alert Fatigue Death Spiral

1. Team adds alert for every possible condition
2. Alerts fire constantly, mostly for non-urgent things
3. Team starts ignoring alerts
4. Real incident fires, nobody notices
5. Outage

### Rules for Alert-Worthiness

An alert should only fire if:
1. **It requires human action** — can the system fix it automatically? If yes, it should.
2. **It cannot wait until morning** — if the on-call can sleep through it, it's not a page.
3. **It's actionable** — is there a runbook? If not, write one or don't alert.
4. **It's not already covered** — does a higher-level alert catch this?

**Audit question**: For each alert in the last 30 days, was there a runbook entry written? If an alert fires and nobody writes anything down, it's noise.

### Inhibition Rules

Suppress child alerts when parent is already firing:

```yaml
# alertmanager inhibition rules
inhibit_rules:
  # If the whole service is down, don't also alert on latency
  - source_match:
      alertname: ServiceDown
    target_match_re:
      alertname: (HighLatency|ErrorRateHigh|QueueLag)
    equal: [service, env]

  # If database is down, suppress application errors (they're caused by DB)
  - source_match:
      alertname: DatabaseDown
    target_match_re:
      alertname: (PaymentFailed|OrderCreateFailed)
    equal: [env]
```

### Alert Deduplication

Group alerts so the on-call gets one notification for a correlated event, not ten:

```yaml
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s      # collect related alerts for 30s before firing
  group_interval: 5m   # how often to send updates on ongoing group
  repeat_interval: 4h  # re-notify if still firing after 4h
```

## Runbook Template

Every paging alert must link to a runbook. Without this, the alert is not production-ready.

```markdown
# Runbook: PaymentServiceFastBurn

## Summary
Payment service is consuming its error budget at 14.4x the sustainable rate.

## Impact
Users are experiencing payment failures. Checkout is degraded.

## Immediate Steps (first 5 minutes)
1. Check Grafana dashboard: [link]
2. Look at recent deploys: `git log --oneline -10`
3. Check downstream dependencies: Stripe, database, fraud service

## Diagnosis

### Is it a deploy?
- Compare error rate before/after deploy
- If yes: rollback with `kubectl rollout undo deploy/payment-service`

### Is it a downstream dependency?
- Check Stripe status: https://status.stripe.com
- Check database: `kubectl exec -it postgres-0 -- psql -c "SELECT 1"`

### Is it traffic-related?
- Check traffic volume: unusual spike in requests?
- Rate limiting might need adjustment

## Escalation
- Exhaust the above steps within 15 minutes
- If unresolved: escalate to payment-team-lead
- If infrastructure: escalate to platform-team

## Resolution
Once resolved, write a postmortem in Notion: [link]
```

## Grafana Dashboard Design

### Four Golden Signals Dashboard Layout

```
Row 1: Service Health Overview
  [Availability SLO gauge] [Error Budget remaining gauge] [Current error rate]

Row 2: Traffic & Errors
  [Request rate time series]  [HTTP 5xx rate time series]

Row 3: Latency
  [p50/p95/p99 latency heatmap]  [Latency distribution histogram]

Row 4: Saturation
  [CPU/Memory usage]  [Queue depth]  [Connection pool usage]

Row 5: Downstream Dependencies
  [Database query latency]  [External API success rate]
```

### Key Grafana Panel Configs

```json
// Error rate panel — use a threshold annotation for SLO
{
  "type": "timeseries",
  "title": "HTTP Error Rate",
  "targets": [{
    "expr": "rate(http_requests_total{status=~'5..'}[5m]) / rate(http_requests_total[5m])",
    "legendFormat": "Error Rate"
  }],
  "thresholds": {
    "mode": "absolute",
    "steps": [
      { "color": "green", "value": 0 },
      { "color": "yellow", "value": 0.001 },  // 0.1% warning
      { "color": "red", "value": 0.01 }        // 1% critical
    ]
  }
}
```

### SLO Gauge Panel

```json
{
  "type": "gauge",
  "title": "30-Day Availability",
  "targets": [{
    "expr": "1 - (increase(http_requests_total{status=~'5..'}[30d]) / increase(http_requests_total[30d]))",
    "instant": true
  }],
  "options": {
    "minVizValue": 0.99,
    "maxVizValue": 1,
    "thresholds": [
      { "color": "red", "value": 0 },
      { "color": "yellow", "value": 0.999 },
      { "color": "green", "value": 0.9995 }
    ]
  }
}
```
