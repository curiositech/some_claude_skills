# Mock Interview Rubrics

Scoring rubrics for each interview round type. Use after every mock interview (with `interview-simulator` or a human practice partner) and after real interviews for structured debrief.

---

## Universal Scoring Scale

All dimensions use a 1-5 scale:

| Score | Meaning | Signal |
|-------|---------|--------|
| 1 | Significantly below bar | Would not advance. Fundamental gaps. |
| 2 | Below bar | Concerning weakness. Needs focused remediation. |
| 3 | At bar | Adequate. Would pass but not impress. |
| 4 | Above bar | Strong performance. Clear competence demonstrated. |
| 5 | Exceptional | Would be talked about positively in debrief. Memorable. |

**Target for Anthropic and peers**: Average 4.0+ across all dimensions for hire recommendation. A single 2 in any dimension is usually disqualifying.

---

## Coding Round Rubric

**Duration**: 45-60 minutes (typically 1-2 problems)
**Evaluator focus**: Problem-solving approach, code quality, communication

| Dimension | 1 (Below) | 3 (At Bar) | 5 (Exceptional) |
|-----------|-----------|------------|-----------------|
| **Problem Decomposition** | Jumps to coding immediately. No clarifying questions. | Asks 2-3 clarifying questions. States approach before coding. | Identifies edge cases upfront. Discusses multiple approaches with tradeoff analysis before selecting. |
| **Algorithm Selection** | Brute force only. Doesn't recognize standard patterns. | Identifies correct algorithm class. Reasonable complexity. | Optimal solution with clear complexity analysis. Explains why this approach over alternatives. |
| **Code Quality** | Messy, hard to follow. Variable names like `x`, `temp`. | Clean, readable. Reasonable structure. | Production-quality: clear naming, helper functions extracted, defensive coding. |
| **Communication** | Silent coding. Only speaks when stuck. | Narrates approach. Explains major decisions. | Continuous narration. Thinks aloud naturally. Invites interviewer into the process. |
| **Debugging** | Panics when code doesn't work. Random changes. | Systematic debugging. Traces through examples. | Writes test cases. Isolates bug quickly. Explains root cause. |
| **Time Management** | Spends 30 min on approach with 10 min to code. | Reasonable pacing. Finishes core solution. | Completes solution with time for optimization and edge cases. |

### Coding Self-Evaluation Checklist

After each mock coding session:

- [ ] Did I ask at least 3 clarifying questions before starting?
- [ ] Did I discuss my approach and get interviewer buy-in before coding?
- [ ] Did I analyze time/space complexity without being asked?
- [ ] Did I talk through my thought process continuously?
- [ ] Did I test my solution with at least 2 examples (including an edge case)?
- [ ] Did I finish within the time limit?
- [ ] Could I explain every line of my code if asked?

### Common Coding Failure Modes

| Failure Mode | What Happens | Fix |
|-------------|-------------|-----|
| **Silence spiral** | Go quiet when thinking, interviewer can't assess | Practice thinking aloud -- narrate even dead ends |
| **Premature optimization** | Optimize before having a working solution | Get brute force working first, then optimize |
| **Scope creep** | Try to handle every edge case in initial implementation | Acknowledge edge cases verbally, handle after core works |
| **Panic freeze** | Blank out when stuck, stop communicating | Have a rehearsed recovery phrase: "Let me step back and think about what I know..." |
| **Overengineering** | Build class hierarchies for a function problem | Match abstraction level to problem scope |

---

## ML System Design Rubric

**Duration**: 45-60 minutes
**Evaluator focus**: End-to-end thinking, tradeoff awareness, practical experience

| Dimension | 1 (Below) | 3 (At Bar) | 5 (Exceptional) |
|-----------|-----------|------------|-----------------|
| **Requirements Gathering** | Accepts problem as stated. No clarifying questions. | Identifies key metrics (latency, throughput, accuracy). Asks about scale. | Quantifies requirements. Identifies business constraints. Discusses online vs offline tradeoffs. |
| **System Architecture** | Disconnected components. No data flow reasoning. | Coherent pipeline: data -> features -> model -> serving. | Clear separation of concerns. Addresses training and serving separately. Includes monitoring and feedback loops. |
| **ML Depth** | Mentions model names without understanding. "Just use BERT." | Justifies model choices. Discusses feature engineering. Reasonable training strategy. | Deep understanding of model tradeoffs. Discusses failure modes, data distribution shift, A/B testing methodology. |
| **Scale & Production** | Ignores scale. Assumes single machine. | Addresses basic scaling (batch vs stream, model serving). | Discusses caching strategies, model versioning, canary deployments, data pipeline reliability, cost optimization. |
| **Tradeoff Analysis** | Presents one solution as "the answer." | Acknowledges tradeoffs when asked. | Proactively presents alternatives with tradeoff matrices. "We could do X for lower latency or Y for better accuracy -- here's the decision framework." |
| **Communication** | Disorganized. Jumps between topics. | Structured presentation. Uses whiteboard/diagram effectively. | Clear narrative arc. Builds complexity progressively. Checks in with interviewer for direction. |

### ML Design Self-Evaluation Checklist

- [ ] Did I spend the first 5 minutes on requirements and scope?
- [ ] Did I draw a clear system diagram (even in text)?
- [ ] Did I discuss both training and serving pipelines?
- [ ] Did I address data collection, labeling, and quality?
- [ ] Did I discuss model evaluation metrics and how to measure success?
- [ ] Did I mention monitoring, drift detection, and feedback loops?
- [ ] Did I present at least one meaningful tradeoff with alternatives?
- [ ] Did I discuss what could go wrong and how to mitigate it?

### Common ML Design Failure Modes

| Failure Mode | What Happens | Fix |
|-------------|-------------|-----|
| **Model-first thinking** | Jump to "use GPT-4" without understanding the problem | Start with data and metrics, not models |
| **Ignoring data** | Beautiful architecture with no discussion of where data comes from | Always ask: "What data do we have? How is it labeled? What's the volume?" |
| **Academic idealism** | Propose cutting-edge approach that can't be built in 6 months | Ground designs in practical constraints: team size, timeline, existing infra |
| **Missing the serving story** | Great training pipeline, no plan for inference at scale | Explicitly address: latency requirements, throughput, model size, caching |
| **No failure modes** | Present a system that apparently never breaks | Discuss: data quality issues, model degradation, adversarial inputs, cold start |

---

## Technical Deep Dive Rubric

**Duration**: 45-60 minutes
**Evaluator focus**: Depth of understanding of your own work, intellectual honesty

| Dimension | 1 (Below) | 3 (At Bar) | 5 (Exceptional) |
|-----------|-----------|------------|-----------------|
| **Technical Depth** | Surface-level description. Can't explain decisions. | Explains key technical decisions with reasoning. | Deep understanding of every layer. Can discuss alternatives considered and why they were rejected. |
| **Ownership Clarity** | Vague about personal contribution vs team's. | Clearly delineates own work. | Precise about personal contribution while crediting team. "I designed X, my colleague Y built Z, and we collaborated on W." |
| **Failure & Learning** | Only discusses successes. Defensive about failures. | Acknowledges challenges when asked. | Proactively discusses failures, what was learned, and what would be done differently. |
| **Intellectual Honesty** | Bluffs when uncertain. Makes up plausible-sounding answers. | Admits uncertainty on tangential topics. | Comfortable saying "I don't know" on direct questions. Follows up with how they'd find out. |
| **Questioning Depth** | Crumbles under follow-up questions. | Handles 2-3 levels of "why" questions. | Handles arbitrary depth of questioning. Each answer reveals more understanding. |
| **Impact Articulation** | "We built X." No quantification. | Provides some metrics. Explains business impact. | Quantified impact with clear causation chain. Connects technical work to business/research outcomes. |

### Deep Dive Self-Evaluation Checklist

- [ ] Can I explain every major technical decision in my top 3 projects?
- [ ] Do I know what I would do differently with hindsight?
- [ ] Can I clearly separate my contributions from the team's?
- [ ] Am I comfortable saying "I don't know" and pivoting to how I'd learn?
- [ ] Can I handle 5 levels of "why" on any decision?
- [ ] Do I have quantified metrics for impact?

---

## Behavioral / Values Round Rubric

**Duration**: 30-45 minutes
**Evaluator focus**: Alignment with company values, self-awareness, collaboration patterns

| Dimension | 1 (Below) | 3 (At Bar) | 5 (Exceptional) |
|-----------|-----------|------------|-----------------|
| **Story Structure** | Rambling, no clear beginning/middle/end. | STAR format: Situation, Task, Action, Result. Under 3 minutes. | Crisp STAR delivery with emotional resonance. Result includes reflection/learning. |
| **Specificity** | "I generally handle conflict well." | Specific example with names (anonymized), dates, and context. | Vivid details that make the story memorable and verifiable. |
| **Self-Awareness** | Either arrogant or falsely humble. | Balanced view of strengths and growth areas. | Demonstrates genuine reflection. Connects past growth to current capabilities. |
| **Values Alignment** | Generic answers that could apply to any company. | References company values naturally. | Stories chosen specifically because they demonstrate the target company's values. Deep understanding of why those values matter. |
| **Conflict & Difficulty** | Avoids discussing real conflict. "Everyone got along." | Describes conflict honestly, explains resolution. | Shows comfort with ambiguity and disagreement. Demonstrates growing through conflict. |
| **Growth Mindset** | "I've always been good at this." | Shows learning from mistakes. | Pattern of deliberately seeking hard problems. Evidence of continuous improvement. |

### Behavioral Self-Evaluation Checklist

- [ ] Did each story stay under 3 minutes in the telling?
- [ ] Did I use STAR format (Situation, Task, Action, Result)?
- [ ] Did I include specific, verifiable details?
- [ ] Did I explain my reasoning, not just my actions?
- [ ] Did my stories align with the target company's stated values?
- [ ] Did I demonstrate self-awareness about my growth areas?
- [ ] Did I handle follow-up questions without contradicting my story?

---

## Hiring Manager Screen Rubric

**Duration**: 30-45 minutes
**Evaluator focus**: Leadership, team fit, technical judgment, motivation

| Dimension | 1 (Below) | 3 (At Bar) | 5 (Exceptional) |
|-----------|-----------|------------|-----------------|
| **Leadership Evidence** | Claims leadership without examples. | Provides concrete examples of leading teams or initiatives. | Demonstrates leadership philosophy with evidence of evolving approach. |
| **Technical Judgment** | Can't articulate how they make technical decisions. | Explains decision-making framework. Gives examples of good tradeoffs. | Shows pattern of making correct bets. Explains reasoning that led to non-obvious choices. |
| **Team Dynamics** | "I work well with everyone." | Specific examples of collaboration, mentoring, or conflict resolution. | Evidence of building high-performing teams. Understands team chemistry at a deep level. |
| **Motivation & Fit** | Generic "excited about AI" answer. | Specific reasons for this company and this role. | Deep understanding of the team's problems. Articulates how their skills uniquely address those problems. |
| **Questions Asked** | No questions, or only about compensation/perks. | Thoughtful questions about team, product, and challenges. | Questions reveal deep research and genuine strategic thinking about the role. |

---

## Tech Presentation Rubric

**Duration**: 45 minutes (30 min talk + 15 min Q&A)
**Evaluator focus**: Communication, technical depth, audience calibration

| Dimension | 1 (Below) | 3 (At Bar) | 5 (Exceptional) |
|-----------|-----------|------------|-----------------|
| **Structure** | No clear narrative. Jumps between topics. | Clear introduction, body, conclusion. Logical flow. | Compelling narrative arc. Audience knows where they are at every moment. |
| **Audience Calibration** | Too basic or too advanced for the audience. | Appropriate level for a senior ML team. | Adjusts level dynamically based on audience reactions. Layers depth progressively. |
| **Technical Substance** | All high-level, no depth. Or all details, no context. | Balance of big picture and technical depth. | Deep technical content made accessible. Novel insights or approaches highlighted. |
| **Visual Aids** | Walls of text. Unreadable diagrams. | Clean slides that support (not replace) narration. | Diagrams, charts, and code snippets that genuinely enhance understanding. |
| **Q&A Handling** | Defensive. Avoids hard questions. | Answers directly. Admits when uncertain. | Uses questions to deepen the conversation. Connects answers back to broader themes. |
| **Time Management** | Runs 10+ min over or finishes 10+ min early. | Within 2 minutes of target time. | Hits target time precisely. Natural pacing throughout. |

### Presentation Self-Evaluation Checklist

- [ ] Did I finish within 2 minutes of the target time?
- [ ] Did I start with a hook that made the audience want to listen?
- [ ] Did I clearly explain why this work matters?
- [ ] Were my slides readable from the back of the room (or on a small video call)?
- [ ] Did I handle Q&A questions directly without getting defensive?
- [ ] Did I end with a clear takeaway?

---

## Peer/AI Evaluator Guidelines

When using `[interview-simulator]` or a human practice partner as evaluator:

### Before the Mock
1. Share the relevant rubric with the evaluator
2. Specify which round type you're practicing
3. Ask them to take timestamped notes during the mock
4. Request they score each dimension immediately after (not days later)

### During the Mock
- Evaluator should simulate realistic interview pressure (time limits, follow-up questions)
- Evaluator should NOT help or coach during the mock -- only evaluate
- If the candidate is stuck, the evaluator can provide a small hint (as a real interviewer would) but should note that a hint was needed

### After the Mock
1. Evaluator shares scores (1-5 per dimension) with brief justification
2. Evaluator identifies top 2 strengths and top 2 improvement areas
3. Candidate and evaluator discuss specific moments (use timestamps)
4. Agree on 2-3 concrete action items for next practice session

### Calibration Notes
- A score of 3 means "would pass at Anthropic" -- this is a high bar
- First-time mock scores are typically 2-3. This is normal and expected.
- Focus on trend, not absolute score. Going from 2.5 to 3.5 over 4 weeks is excellent progress.
- If scores plateau, change practice approach (different problem types, different evaluator, different round structure)

---

## Aggregate Score Tracking

After each mock, compute:

```
Round Score = average of all dimensions for that round
Overall Score = weighted average across all rounds

Weights (Anthropic):
  Coding:          0.15
  ML Design:       0.20
  Technical Depth: 0.25
  Behavioral:      0.15
  HM Screen:       0.10
  Presentation:    0.15
```

**Target trajectory**:
- Week 1: Overall 2.5 (baseline)
- Week 2: Overall 3.0 (foundations)
- Week 3: Overall 3.5 (integration)
- Week 4: Overall 4.0+ (ready)

If you're not tracking toward 4.0 by interview week, consider requesting a timeline extension or focusing exclusively on your lowest-scoring round.
