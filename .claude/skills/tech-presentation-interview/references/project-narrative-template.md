# Project Narrative Template

Use this template to structure a technical presentation from raw project material into a polished, interview-ready narrative. Fill in each section, then rehearse the assembled narrative 3+ times before presenting.

---

## Part 1: Project Selection Checklist

Before investing preparation time, confirm this project passes the selection gate.

### Ownership Verification

Answer each honestly. If you answer "no" to more than one, pick a different project.

- [ ] I made at least 2 key architectural decisions on this project
- [ ] I can explain WHY we chose approach X over alternatives Y and Z
- [ ] I can describe a specific failure or surprise and how I responded
- [ ] I can quantify the project's impact with real numbers
- [ ] I can fill 30 minutes of technical depth without repeating myself
- [ ] I can clearly separate MY contributions from the team's

### Ownership Statement (Write This First)

Complete this sentence: "On this project, I was personally responsible for ________. I collaborated with the team on ________. My teammates owned ________."

This becomes your verbal anchor. When an interviewer asks "who did what?", you deliver this statement naturally.

---

## Part 2: Context Frame (2 minutes)

The context frame answers: "Why should I care about this project?" It is NOT a company overview. It is the setup that makes the problem interesting.

### Template

```
[Company/Team] serves [user type] who need to [core job].
At the time, we processed [scale metric] -- [X] requests per second /
[Y] GB of data daily / [Z] active users.

The business constraint was [what made this urgent or important]:
- [Revenue at risk / users impacted / regulatory deadline / competitive threat]

My role was [title/position], reporting to [who], on a team of [size].
I owned [specific scope].
```

### What to INCLUDE
- Scale numbers that ground the problem (not vanity metrics)
- Business stakes -- what happens if this project fails?
- Your specific position and scope

### What to EXCLUDE
- Company history or mission statement
- Team org chart beyond your immediate context
- Product features unrelated to your project

---

## Part 3: Problem Statement (3 minutes)

The problem statement answers: "What made this HARD?" It is the most underrated section. A well-framed problem makes the audience lean in. A poorly-framed problem makes the solution feel arbitrary.

### Template

```
The core challenge was [tension between competing requirements]:
- We needed [requirement A], which pushed us toward [approach type]
- But we also needed [requirement B], which conflicted because [reason]
- Existing solutions ([name them]) failed because [specific shortcoming]

The constraints were:
1. [Hard constraint: latency < X ms / budget < $Y / must use existing infra]
2. [Hard constraint: regulatory / compatibility / team skill limitations]
3. [Soft constraint: prefer familiar tech / minimize operational burden]

What made this non-trivial was [the key insight or tension]:
- Naive approach: [what most people would try first]
- Why naive fails: [specific failure mode with evidence]
- The real problem: [reframed understanding that leads to the solution]
```

### Problem Framing Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| **Tension** | "We needed sub-100ms latency AND 99.9% accuracy" | Conflicting requirements |
| **Scale break** | "Our approach worked at 1K QPS but collapsed at 100K" | Growth-driven problems |
| **Hidden complexity** | "It looked like a CRUD app but the consistency model was distributed" | Deceptively simple surfaces |
| **Domain mismatch** | "ML research papers assumed batch processing; we needed real-time" | Adapting solutions to new contexts |
| **Legacy constraint** | "We couldn't do a greenfield rewrite; 200 clients depended on the API" | Migration/evolution problems |

---

## Part 4: Approach & Why (5 minutes)

This is NOT "what I built." This is "how I decided what to build." Interviewers care about your decision-making process more than the decision itself.

### Template for Each Key Decision (Prepare 2-3)

```
Decision: [What you chose]

Alternatives considered:
1. [Alternative A]: Strong for [use case]. We rejected it because [specific reason
   in our context]. If [constraint] were different, this would have been better.
2. [Alternative B]: Industry standard for [similar problems]. Didn't fit because
   [specific technical mismatch].
3. [Alternative C]: We prototyped this for [duration]. Abandoned because
   [what we learned from the prototype].

What drove the final choice:
- Key constraint: [the one thing that tipped the decision]
- Key insight: [what we understood that others might not]
- What we knowingly sacrificed: [the tradeoff we accepted]

Validation:
- How we tested this decision: [prototype / benchmark / proof of concept]
- When we'd reverse it: [conditions under which this becomes wrong]
```

### Decision Documentation Table

Prepare this for your top 3 decisions:

| Decision | Chose | Over | Because | Sacrificed | Would Reverse If |
|----------|-------|------|---------|------------|-----------------|
| Storage | Cassandra | PostgreSQL | Write throughput at 50K ops/sec | Ad-hoc queries; join performance | Read patterns shifted to analytical |
| Model | Custom CNN | YOLO v5 | Needed sub-10ms on edge device | Training complexity; community support | Latency budget relaxed to 50ms |
| Queue | Kafka | SQS | Replay capability for model retraining | Operational simplicity | Team shrank below 3 engineers |

---

## Part 5: Architecture Deep Dive (10 minutes)

The deep dive is where you demonstrate genuine understanding. You will NOT cover the entire system. You will pick 2-3 components and go deep enough that the interviewer says "okay, you clearly built this."

### Component Selection

From your system architecture, pick components using this priority:

1. **Components where YOU made a non-obvious decision** (highest priority)
2. **Components that broke or surprised you** (high priority)
3. **Components at the intersection of multiple concerns** (good)
4. **Components using interesting algorithms or data structures** (good)
5. **Standard infrastructure components** (skip unless heavily customized)

### Deep Dive Template (Per Component)

```
What it does: [1 sentence functional description]

Why it exists: [What problem does this component solve that couldn't be
solved by a simpler approach?]

How it works (key details only):
- [Internal mechanism 1]: [Why this way, not the obvious way]
- [Internal mechanism 2]: [The tricky part and how you solved it]
- [Performance characteristics]: [Big-O, latency, throughput]

What breaks:
- Failure mode 1: [What triggers it] -> [Impact] -> [Mitigation]
- Failure mode 2: [What triggers it] -> [Impact] -> [Mitigation]

What I learned:
- [Specific lesson from building/operating this component]
```

### Depth Markers (How Interviewers Assess Depth)

| Depth Level | What You Say | Interviewer Assessment |
|-------------|-------------|----------------------|
| Surface | "We used Redis for caching" | Tourist -- doesn't know why |
| Medium | "We used Redis with LRU eviction and a 15-min TTL because our access pattern was read-heavy with a 12-min staleness tolerance" | Competent -- understands the config |
| Deep | "We started with Redis LRU but switched to a custom two-tier cache after discovering that our access pattern was bimodal -- 80% of requests hit the same 200 keys, but the remaining 20% had a uniform distribution that thrashed the LRU. The two-tier approach gave us 94% hit rate vs 71% with pure LRU." | Builder -- this person debugged real problems |

Aim for "deep" on your 2-3 chosen components and "surface" on everything else.

---

## Part 6: Results & Impact (3 minutes)

### Metrics Template

```
Performance:
- [Metric]: [Before] -> [After] ([improvement %])
- [Metric]: [Before] -> [After] ([improvement %])

Business impact:
- [Revenue / cost / efficiency metric]: [Quantified change]
- [User metric]: [Quantified change]

Operational impact:
- [Reliability]: [Uptime / error rate improvement]
- [Developer experience]: [Deploy time / oncall burden change]
- [Adoption]: [Teams / services / users that adopted your work]
```

### Impact Credibility Rules

- **Use absolute numbers AND percentages**: "Reduced latency from 340ms to 45ms (87% reduction)" -- the absolute numbers ground the claim.
- **Distinguish correlation from causation**: "Revenue increased 35% in the quarter after launch" is honest. "Our system drove 35% revenue growth" may not be -- attribution is hard. Be precise about what you can claim.
- **Include negative results if they're interesting**: "Accuracy improved 12% but training cost increased 3x, which led us to invest in model distillation."
- **Scope your impact**: "Within the detection pipeline" not "across the company" unless it truly was company-wide.

---

## Part 7: What I Would Change (2 minutes)

This is the credibility section. Interviewers trust candidates who can critique their own work.

### Template

```
If I were starting this project today, I would change [number] things:

1. [Decision]: I chose [X] because [rational reason at the time].
   Since then, [what changed -- new tooling, scale shift, team change, lesson learned].
   Today I would choose [Y] because [specific advantage in current context].

2. [Decision]: This was the right call at [scale/team/timeline] we had.
   At our current scale of [larger numbers], the bottleneck is now
   [specific problem]. I would redesign [component] to [specific change].

What I would NOT change:
- [Decision that aged well]: Despite [concern at the time], this has held up
  because [reason]. I'd make the same call again.
```

### Common "What I'd Change" Categories

| Category | Example |
|----------|---------|
| Technology choice | "I'd use ClickHouse instead of Elasticsearch for the analytics workload" |
| Architecture pattern | "I'd separate the write path from the read path earlier" |
| Testing strategy | "I'd invest in integration tests over unit tests given the distributed nature" |
| Team structure | "I'd have a dedicated data quality engineer from day one" |
| Scope management | "I'd ship the MVP without feature X and validate demand first" |
| Monitoring | "I'd instrument model confidence distributions before launch, not after the first incident" |

---

## Part 8: Q&A Preparation

### 10 Likely Questions (Prepare Answers for All)

1. **"Walk me through a request end-to-end."**
   Prepare a 3-minute trace through the system for a single request. Include: entry point, key processing steps, data store interactions, response path. Mention error handling at each step.

2. **"What was the hardest bug you encountered?"**
   Pick a real bug. Structure: Symptom -> Investigation -> Root cause -> Fix -> Prevention. The investigation process matters more than the fix.

3. **"How did you handle [specific challenge related to your project]?"**
   For each component you go deep on, prepare the "how did you handle [obvious challenge]?" answer.

4. **"What happens when [component X] goes down?"**
   For each critical component, know: detection mechanism, impact blast radius, mitigation (circuit breaker, fallback, retry), and recovery procedure.

5. **"Why this scale? What changes at 10x?"**
   Know the scaling limits of your current design. Identify the first bottleneck at 10x load and the architectural change required.

6. **"How did you test this?"**
   Testing strategy: unit, integration, load, chaos. Be specific about what you tested and what you didn't. Acknowledge gaps honestly.

7. **"What would a v2 look like?"**
   Have a specific v2 vision that addresses current limitations. Not a fantasy rewrite -- a grounded evolution.

8. **"How did you onboard new team members to this system?"**
   Documentation, runbooks, pair programming, architecture diagrams. This reveals operational maturity.

9. **"What's the operational cost?"**
   Know your infrastructure cost (compute, storage, network), developer time for maintenance, and oncall burden. Even rough numbers show operational ownership.

10. **"Tell me about a disagreement on the team about a technical decision."**
    Pick a real disagreement. Structure: What was the disagreement, what was each side's argument, how was it resolved, what was the outcome, what did you learn.

---

## Worked Example: Real-Time CV/Object Detection Pipeline at Scale

This example shows how a 15-year ML/systems engineer might structure a presentation about a production computer vision pipeline.

### Context (2 min)
"I was a senior ML engineer at [Company], where we built autonomous inspection systems for industrial facilities. Our system processed video feeds from 2,000+ cameras across 40 sites, running real-time object detection to identify safety violations, equipment anomalies, and process deviations. We processed approximately 60,000 frames per second aggregate, with a hard constraint of 200ms end-to-end latency from frame capture to alert."

### Problem (3 min)
"The core tension was between detection accuracy and edge deployment constraints. Our cameras were connected to edge devices with limited GPU memory -- NVIDIA Jetson units with 8GB shared memory. Research-grade detection models (Detectron2, large YOLOs) delivered 94% mAP but required 12GB VRAM. Models that fit on-device dropped to 78% mAP, which was below our contractual 85% threshold.

The naive approach was cloud inference: stream frames to a central GPU cluster. We prototyped this and hit two walls: (1) bandwidth cost at 60K FPS was $180K/month, and (2) network latency variability (50-400ms) broke our 200ms SLA at the P95.

The real problem wasn't 'make the model smaller.' It was 'redesign the pipeline so the edge device does less work but the overall system still meets accuracy and latency requirements.'"

### Approach (5 min)
"We designed a two-tier inference architecture. The edge device runs a lightweight model (custom MobileNet-SSD variant, 82% mAP, 15ms inference) that acts as a first-pass filter. It classifies frames as 'interesting' or 'routine.' Only 'interesting' frames -- about 8% of total volume -- get sent to the cloud tier for high-accuracy inference.

We considered three alternatives:
1. **Model distillation only**: Distill the large model into a Jetson-compatible student. We prototyped this for 6 weeks. Got to 86% mAP but inference time was 45ms, which left too little headroom for the rest of the pipeline.
2. **Temporal subsampling**: Process every 5th frame, interpolate detections. Failed because industrial anomalies are often single-frame events (a spark, a pressure gauge spike).
3. **Split inference**: Run early layers on-edge, send intermediate features to cloud. Bandwidth was still too high for the feature maps (3x worse than just sending JPEG frames).

The two-tier approach won because it decoupled the accuracy problem from the latency problem. Edge handles latency (always responds in 15ms). Cloud handles accuracy (processes 8% of frames at 94% mAP within a relaxed 500ms window). The business logic merges both tiers' results."

### Architecture Deep Dive -- Two Components (10 min)

**Component 1: Edge Frame Classifier**
"The edge model needed to be fast, small, and biased toward recall over precision -- missing an interesting frame is worse than sending a boring frame to cloud. We modified MobileNet-SSD's confidence threshold to 0.3 (standard is 0.5), accepting more false positives. We then added a temporal smoothing layer: if 3 consecutive frames are 'interesting,' boost confidence. If an isolated frame triggers, require higher raw confidence (0.6). This reduced false positive cloud sends by 40% while maintaining 97% recall on actual anomalies.

The non-obvious part was calibrating per-camera. Factory floor cameras had different baseline activity than outdoor perimeter cameras. We built a per-camera calibration pipeline that ran the first 24 hours in 'learn mode,' establishing normal activity distribution, then set camera-specific thresholds."

**Component 2: Cloud-Edge Result Fusion**
"When both tiers produce detections for the same timeframe, we need to merge them without double-counting or dropping either tier's unique detections. We implemented a spatial-temporal matching algorithm: detections within 50 pixels and 500ms are considered the same object. Cloud detection takes priority for classification confidence; edge detection takes priority for temporal localization (since it processes every frame).

The hardest bug was clock drift between edge and cloud. Edge devices ran NTP but could drift 200ms over hours. This caused the matcher to either duplicate detections or drop edge-only detections that arrived 'too late.' We solved it with a per-device clock offset estimator that used the cloud inference results as ground truth timestamps."

### Results (3 min)
"End-to-end accuracy: 91% mAP (up from 78% edge-only, within 3% of cloud-only 94%).
Latency: P50 = 22ms, P95 = 180ms, P99 = 350ms (within 200ms SLA at P95).
Bandwidth cost: $14K/month (down from $180K projected for full cloud).
Detection coverage: 97% recall on safety-critical events (up from 89% edge-only).

The system processed production traffic for 14 months with 99.7% uptime. Three major incidents, all related to edge hardware failures (GPU thermal throttling in desert installations), not software."

### What I Would Change (2 min)
"Two things. First, the per-camera calibration pipeline was too manual. It required 24 hours of 'learn mode' and a human to verify the thresholds. Today I would use an online learning approach that continuously adapts thresholds using cloud inference results as a supervisory signal. We had the data for this but not the engineering time.

Second, I would invest in model versioning infrastructure from day one. We deployed 6 model versions over 14 months, and each deployment was a manual, site-by-site process. I'd build an OTA model update system with canary deployments and automatic rollback. The operational burden of coordinating 2,000 edge devices manually was the single biggest time sink on the team."
