# Project Impact Calculator

A framework for quantifying and articulating the impact of your projects in hiring manager conversations. The goal is not to fabricate numbers but to build a rigorous, defensible narrative about why your work mattered.

---

## The Three Layers of Impact

Every project has impact at multiple layers. Staff+ candidates articulate all three. L5 candidates typically only cover Layer 1.

### Layer 1: Direct Impact Metrics

These are the numbers directly attributable to your work.

| Category | Metrics | How to Measure |
|---|---|---|
| **Latency** | p50, p95, p99 response time; time-to-first-byte; end-to-end latency | Before/after measurement, A/B test, load test comparison |
| **Accuracy** | Precision, recall, F1, AUC; false positive/negative rates | Eval set comparison, online metrics, A/B test |
| **Throughput** | QPS, requests/sec, items processed/hour, batch completion time | Load test, production metrics dashboard |
| **Cost Reduction** | Infra spend ($/month), compute hours, storage costs, vendor fees | Cloud billing comparison, capacity planning models |
| **Revenue** | Conversion rate, ARPU, retention, upsell rate | A/B test on revenue-impacting feature, cohort analysis |
| **Reliability** | Uptime %, incident count, MTTR, error rate | Incident tracker, SLA dashboards |

**How to talk about these**:
- Always give the baseline: "Reduced p99 latency from 800ms to 200ms" not just "Achieved 200ms p99"
- Specify the scope: "...across all 12 production models" vs "...for one endpoint"
- Include the time dimension: "...and it has held for 18 months with zero regressions"

### Layer 2: Indirect Impact Metrics

These are second-order effects -- harder to measure but often more important at Staff+ level.

| Category | Metrics | How to Estimate |
|---|---|---|
| **Developer Productivity** | PR cycle time, deploy frequency, time spent on toil, onboarding time for new hires | Developer surveys, git analytics, time tracking |
| **Onboarding Time** | Days to first PR, days to first production deploy, time to full autonomy | Track new hire milestones over cohorts |
| **Incident Reduction** | Pages per month, SEV1/SEV2 count, on-call burden hours | PagerDuty/OpsGenie analytics, on-call retrospectives |
| **Code Health** | Test coverage, build time, dependency freshness, tech debt tickets | CI metrics, static analysis trends |
| **Team Velocity** | Story points per sprint, features shipped per quarter, roadmap completion % | Sprint retrospectives, planning accuracy |

**How to talk about these**:
- Frame as multiplier effects: "This didn't just save me time -- it saved every engineer on the team 2 hours per week"
- Quantify the multiplier: "15 engineers x 2 hours/week x 52 weeks = 1,560 engineering hours/year recovered"
- Connect to what those hours enabled: "...which we reinvested into the recommendation engine rewrite"

### Layer 3: Strategic Impact

This is what separates Staff+ narratives from Senior narratives. Strategic impact is about competitive advantage and organizational capability.

| Category | How to Articulate |
|---|---|
| **Competitive Advantage** | "This capability allows us to iterate on models 5x faster than competitors, which is our primary differentiation" |
| **Platform Capability** | "This created a reusable infrastructure layer that 4 new product features were built on top of" |
| **Talent Attraction** | "We open-sourced this framework and it became a recruiting signal -- 3 hires cited it as why they joined" |
| **Risk Mitigation** | "Without this work, a single-point-of-failure in our serving stack could have caused a multi-hour outage affecting $X/hour in revenue" |
| **Organizational Learning** | "The postmortem process I established after this incident became the standard across the org and prevented 2 similar incidents in the following quarter" |

---

## The Counterfactual Technique

The most powerful framing tool for HM rounds. Instead of just describing what you did, describe what would have happened WITHOUT your work.

### How It Works

1. **State the world as it was**: "At the time, our model serving infrastructure was a collection of bespoke scripts per team."
2. **Describe what would have happened on the current trajectory**: "Without intervention, each new model would have required 2-3 weeks of custom deployment work, and we were planning to ship 8 models that quarter."
3. **State what you did**: "I proposed and built a standardized serving platform."
4. **Describe the counterfactual gap**: "Without this platform, those 8 models would have required 16-24 engineer-weeks of deployment work. With the platform, they required 8 engineer-days total. The delta -- roughly 20 engineer-weeks -- was redirected to model quality improvements."

### Why It Works

- It forces you to quantify impact even when exact numbers are unavailable
- It demonstrates strategic thinking (you understood the trajectory, not just the present)
- It shows you were proactive (you intervened before the problem became a crisis)
- It is resistant to "but someone else would have done it" objections (maybe, but when? and at what cost?)

### Counterfactual Pitfalls

- **Do not fabricate**: If you genuinely do not know the counterfactual, say "My best estimate is..." and explain your reasoning
- **Do not catastrophize**: "The company would have gone bankrupt" is never credible. Be specific and proportional
- **Acknowledge alternatives**: "Someone else might have eventually built something similar, but the 6-month head start allowed us to..."

---

## Estimating Impact When You Do Not Have Exact Numbers

Most engineers do not have perfect metrics for past projects. Here are honest estimation techniques.

### Technique 1: Bounded Estimation

"I don't have the exact number, but I can bound it. Our team had 12 engineers, each spending at least 3 hours per week on deployment issues based on our sprint retros. That's a lower bound of 36 engineer-hours per week, or roughly one full-time engineer. The platform reduced that to under 2 hours per week total."

### Technique 2: Proxy Metrics

"We didn't measure developer productivity directly, but our deploy frequency went from twice per week to twice per day after the migration. That's a strong proxy for reduced friction."

### Technique 3: Testimonial Evidence

"I don't have a dashboard metric, but the VP of Engineering cited this project in the all-hands as the reason we were able to hit our Q3 product targets. Two other teams asked to adopt it in Q4."

### Technique 4: Before/After Snapshot

"Before: 4 SEV1 incidents per quarter related to model serving. After: zero in the 6 months since launch. I can't prove causation perfectly, but the incidents all traced to the exact failure modes the platform was designed to prevent."

### Honesty Calibration

HMs **respect** honest estimation and **distrust** suspiciously precise numbers. Saying "roughly 40% improvement based on our sampling" is more credible than "41.7% improvement" unless you can show the dashboard.

---

## Framing for Different Audiences

The same project impact should be framed differently depending on who you are talking to.

### For Technical Peers (Design Review, Tech Deep Dive)

Focus on: Architecture decisions, tradeoffs, technical metrics, implementation challenges

"We chose a streaming architecture over batch because our p99 latency requirement was 200ms, and batch processing introduced a minimum 500ms delay. The streaming approach required solving an exactly-once delivery problem, which we handled with idempotency keys and a write-ahead log."

### For Hiring Managers

Focus on: Scope, organizational impact, leadership, strategic reasoning

"I identified that our batch processing approach was fundamentally incompatible with our latency targets for the new real-time product. I wrote an RFC proposing a streaming migration, facilitated design reviews with the infra and product teams, and led the implementation. The result was a 60% latency reduction that unblocked the product launch and became the standard architecture for all real-time features."

### For VP/Director Level

Focus on: Business outcomes, competitive position, resource efficiency, risk

"The streaming migration unblocked our real-time product launch, which was our top revenue priority for H2. It also created a platform capability that 3 subsequent product features built on, reducing their time-to-market by an estimated 4-6 weeks each. The total engineering investment was 2 engineers for one quarter."

---

## Worked Examples: 4 ML Project Types

### Example 1: Building an ML Platform/Infrastructure

**The project**: Built a feature store that unified feature computation across the ML organization.

**Layer 1 (Direct)**:
- Reduced feature computation costs by 60% through deduplication ($180K/year savings)
- Cut feature onboarding time from 2 weeks to 2 days
- Eliminated 3 classes of training-serving skew bugs

**Layer 2 (Indirect)**:
- 8 ML teams adopted the feature store within 6 months
- New model development cycle shortened by ~30% (less time reinventing feature pipelines)
- On-call incidents related to feature computation dropped from 5/month to &lt;1/month

**Layer 3 (Strategic)**:
- Created a shared vocabulary for features across the org (teams could discover and reuse each other's work)
- Enabled real-time features for the first time (previous batch-only architecture could not support them)
- Became a recruiting talking point -- 2 senior hires cited the feature store blog post

**Counterfactual**: "Without the feature store, each team would have continued building bespoke feature pipelines. At our growth rate of 2 new ML teams per year, we would have been spending $500K+/year on redundant computation within 18 months, and training-serving skew would have remained the #1 source of silent model degradation."

**HM framing**: "I identified that our ML organization was hitting a scaling wall -- not in compute, but in the ability to share and reuse feature engineering work. I proposed a centralized feature store, built consensus across 8 team leads through an RFC and working prototype, and led the implementation with a team of 3. It became the foundation for our ML platform and the #1 cited infrastructure improvement in our annual developer survey."

### Example 2: Shipping a User-Facing ML Feature

**The project**: Built a recommendation system for a product discovery page.

**Layer 1 (Direct)**:
- Increased click-through rate from 3.2% to 5.8% (81% improvement)
- Increased average session duration by 12%
- Increased conversion rate by 0.4 percentage points (significant at scale)

**Layer 2 (Indirect)**:
- Created a reusable recommendation framework adopted by 2 other product surfaces
- Established A/B testing best practices for ML features (sample size calculation, guardrail metrics)
- Reduced time-to-launch for subsequent ML features from 8 weeks to 3 weeks

**Layer 3 (Strategic)**:
- Shifted the product team's mental model from rules-based to ML-driven personalization
- Created a data flywheel: more engagement produced better training data produced better recommendations
- Competitive parity: major competitors had similar features; without this, we were falling behind

**Counterfactual**: "The product team was planning a rules-based approach (new arrivals, trending items). My analysis showed this would yield at most a 15% CTR improvement vs the 81% we achieved with ML. The rules-based approach would also have required constant manual curation -- estimated 1 FTE of product manager time indefinitely."

**HM framing**: "The product team needed a discovery mechanism but was planning a manual, rules-based approach. I proposed an ML-based recommendation system, showed the team a prototype with projected lift, and led the end-to-end implementation from data pipeline through A/B testing. The 81% CTR improvement made this the highest-impact feature of the quarter. I also established A/B testing practices that the team still uses, and the recommendation framework was reused on two other product surfaces."

### Example 3: Improving Model Quality/Performance

**The project**: Reduced hallucination rate in a production LLM application by building a retrieval-augmented generation (RAG) pipeline.

**Layer 1 (Direct)**:
- Reduced factual error rate from 12% to 2.3% (measured on a 500-query eval set)
- Improved user satisfaction score from 3.4 to 4.2 (out of 5)
- Reduced customer support tickets related to incorrect information by 65%

**Layer 2 (Indirect)**:
- The RAG pipeline became the standard pattern for all LLM features at the company
- Created an eval framework that 4 other teams adopted for their own quality measurement
- Trained 6 engineers on RAG best practices through a workshop series

**Layer 3 (Strategic)**:
- Enabled the company to market the product as "grounded in verified data" -- a key differentiator
- Reduced legal risk from incorrect information (compliance team had flagged this as a blocker for enterprise sales)
- Unblocked enterprise tier pricing (customers would not pay enterprise rates with a 12% error rate)

**Counterfactual**: "Without the RAG pipeline, we had two options: keep the 12% error rate (which was blocking enterprise sales) or add a human review step (estimated 3 FTE at $150K each = $450K/year and a 4-hour response time SLA). The RAG pipeline cost 2 engineers for one quarter to build and operates at near-zero marginal cost."

**HM framing**: "Our LLM product had a 12% factual error rate that was blocking enterprise adoption. I designed a RAG pipeline that reduced errors to 2.3%, unblocking $2M+ in enterprise pipeline. Beyond the direct quality improvement, I created an eval framework that 4 teams adopted and ran a workshop series that built RAG expertise across the org. The pipeline is now the standard architecture for all grounded LLM features."

### Example 4: Leading a Technical Migration or Modernization

**The project**: Migrated a monolithic ML training pipeline to a distributed, containerized architecture.

**Layer 1 (Direct)**:
- Reduced training time for largest model from 72 hours to 8 hours
- Reduced infrastructure costs by 40% through better resource utilization
- Enabled training on 10x larger datasets (previously memory-bound)

**Layer 2 (Indirect)**:
- Eliminated "it works on my machine" class of bugs (containerized, reproducible environments)
- Reduced ML engineer onboarding time from 3 weeks to 3 days (standard dev environment)
- Enabled experiment parallelism -- researchers could now run 20 experiments simultaneously vs 3

**Layer 3 (Strategic)**:
- Unlocked the ability to train on proprietary datasets that were previously too large (competitive advantage)
- Positioned the team to adopt new hardware (GPU clusters) without rewriting training code
- The migration playbook was adopted by 2 other ML teams, avoiding 6+ months of duplicated work

**Counterfactual**: "On the existing architecture, training our next-generation model would have taken 3 weeks per run, making the research iteration cycle untenable. The team estimated they needed 50+ training runs to converge on the final model. That's 150 weeks -- nearly 3 years -- of sequential training. The migration compressed that to under 6 months of wall-clock time."

**HM framing**: "Our ML training infrastructure was a monolithic system that had served us well at small scale but was becoming a bottleneck as model and dataset sizes grew. I led the migration to a distributed, containerized architecture. This was a cross-team effort -- I coordinated with the infra team on container orchestration, the data team on distributed data loading, and 8 ML researchers on migrating their training scripts. The result was a 9x speedup in training time and a 40% cost reduction, but the real impact was enabling our next-generation model to be trained at all within a reasonable timeframe."

---

## Impact Narrative Template

Use this template to structure the impact narrative for each story in your bank.

```
PROJECT: [Name]
MY ROLE: [Specific role — tech lead, architect, IC who drove initiative, etc.]

DIRECT IMPACT:
- [Metric 1]: [Before] -> [After] ([X% improvement])
- [Metric 2]: [Before] -> [After] ([X% improvement])
- [Metric 3]: [Before] -> [After] ([X% improvement])

INDIRECT IMPACT:
- [Who benefited beyond your team]: [How] ([Estimate if possible])
- [Capability created]: [What it enabled]
- [Process/culture improvement]: [Ongoing value]

STRATEGIC IMPACT:
- [Business outcome]: [Connection to revenue, competitive position, or risk]
- [Organizational capability]: [What the company can do now that it couldn't before]

COUNTERFACTUAL:
Without this work, [what would have happened] over [time period],
costing approximately [estimated cost in $ or engineer-time or opportunity].

ONE-LINE HM PITCH:
"I [action] which [outcome] by [quantified result], enabling [strategic value]."
```

Fill this out for your top 5 stories. Practice delivering the one-line pitch, then expanding to the full narrative when the HM probes deeper.
