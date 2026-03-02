# Company-Specific Interview Loops

Detailed interview loop structures for top AI companies, tailored for senior ML/AI/CV/NLP engineers (Staff/Principal level, 10-15+ years experience). Information reflects 2025-2026 practices.

**Caveat**: Interview processes change. Always verify current structure with your recruiter. This document provides a strong baseline for preparation focus.

---

## Anthropic

### Loop Structure (2026)

Anthropic's process for senior technical roles typically follows this sequence:

```
Application/Referral
    |
    v
Recruiter Screen (30 min, phone)
    |
    v
CodeSignal Assessment (70 min, async)
    |
    v
Hiring Manager Screen (45 min, video)
    |
    v
Full Loop - Virtual Onsite (4-5 hours, single day)
  ├── Coding Interview (60 min)
  ├── ML System Design (60 min)
  ├── Technical Deep Dive (60 min)
  ├── Tech Presentation (45-60 min)
  └── Values & Culture Fit (45 min)
    |
    v
Team Match Conversations (1-2 calls, 30 min each)
    |
    v
Offer / Debrief
```

**Typical timeline**: 3-6 weeks from application to offer.

### Recruiter Screen

**Duration**: 30 minutes
**Format**: Phone or video call with talent team member
**What they evaluate**:
- Motivation for Anthropic specifically (not just "AI is cool")
- High-level technical background confirmation
- Role fit / level calibration
- Logistics: visa, location, timeline, compensation expectations

**Preparation priorities**:
- Know Anthropic's mission (safety-first AI development) cold. Reference specific things: Constitutional AI, Claude's character training, interpretability research, Responsible Scaling Policy.
- Have a crisp 2-minute pitch: who you are, what you've built, why Anthropic now.
- Know your compensation expectations. Research levels (IC3-IC5 for engineers) and corresponding bands.
- Have thoughtful questions about the team and role.

**Common pitfall**: Saying "I'm excited about AI" without demonstrating specific knowledge of Anthropic's approach. Every AI company candidate says this. What makes Anthropic different to you?

### CodeSignal Assessment

**Duration**: 70 minutes
**Format**: Async, completed on your schedule within a 7-day window
**Content**: 2-4 algorithmic coding problems, general programming assessment
**Language**: Choice of Python, Java, JavaScript, C++, or similar

**What they evaluate**:
- Algorithmic problem-solving ability
- Code quality and correctness
- Time management under pressure

**Preparation priorities**:
- Practice LeetCode medium-to-hard problems (not easy -- the bar is senior)
- Focus on: trees/graphs, dynamic programming, string manipulation, system design components
- Practice in CodeSignal's UI (it's different from your IDE -- test it)
- Time yourself: average 15-20 min per problem

**Common pitfall**: Treating this as a formality. Senior candidates sometimes underperform on algorithmic coding because they haven't done it recently. Dedicate real prep time here.

### Hiring Manager Screen

**Duration**: 45 minutes
**Format**: Video call with the hiring manager (your potential direct manager)
**What they evaluate**:
- Technical judgment and decision-making
- Leadership style and team collaboration evidence
- Culture add (not culture fit -- they want diversity of thought)
- Motivation for this specific team and role

**Preparation priorities**:
- Research the hiring manager (publications, talks, team's recent work)
- Prepare 3-4 stories demonstrating: technical leadership, navigating ambiguity, mentoring, disagreeing and committing
- Have a clear answer for "Why this team?" that references their specific projects
- Prepare 3+ thoughtful questions about team dynamics, technical challenges, and growth

**Common pitfall**: Treating this like a behavioral interview. The HM is evaluating you as a potential team member and direct report. They want to see how you think, not just hear polished stories.

### Full Loop: Coding Interview

**Duration**: 60 minutes
**Format**: Live coding with a senior engineer, shared editor or whiteboard
**Content**: 1-2 algorithmic/systems problems, harder than CodeSignal

**What they evaluate**:
- Problem decomposition and approach articulation
- Code quality under pressure
- Communication during problem-solving
- Ability to handle hints and pivot when stuck

**Anthropic-specific notes**:
- Interviewers are collaborative. They will hint and guide -- this is intentional. Take hints gracefully.
- They care as much about how you communicate your approach as the solution itself.
- Python is the dominant language internally. Using Python is slightly advantageous.

### Full Loop: ML System Design

**Duration**: 60 minutes
**Format**: Whiteboard/video discussion with a senior ML engineer
**Content**: Design an end-to-end ML system for a realistic problem

**What they evaluate**:
- End-to-end systems thinking (data -> training -> serving -> monitoring)
- Awareness of ML-specific production challenges (drift, feedback loops, evaluation)
- Tradeoff analysis and decision-making under ambiguity
- Practical experience with real ML systems at scale

**Anthropic-specific notes**:
- Problems may relate to language model training, RLHF, evaluation, or safety
- Deep understanding of LLM architectures, training dynamics, and evaluation is expected at the senior level
- They value practical experience over theoretical knowledge
- Discussing failure modes and safety considerations is a strong signal

### Full Loop: Technical Deep Dive

**Duration**: 60 minutes
**Format**: Discussion-based with senior technical staff
**Content**: Deep forensic examination of 1-2 of your past projects

**What they evaluate**:
- True depth of technical understanding
- Intellectual honesty (what you don't know, what went wrong)
- Ability to explain complex systems clearly
- Quality of technical judgment in past decisions

**Anthropic-specific notes**:
- This is often the most heavily weighted round for senior candidates
- They will go extremely deep. Expect questions about decisions you made 3-5 levels deep: "Why that architecture? What alternatives did you consider? What would you do differently? What were the failure modes?"
- Prepare to discuss one project for the full 60 minutes. They will exhaust your knowledge.
- Intellectual honesty is paramount. Bluffing is the fastest way to a rejection.

### Full Loop: Tech Presentation

**Duration**: 45-60 minutes (30 min presentation + 15-30 min Q&A)
**Format**: You present a technical topic to 3-5 engineers
**Content**: A talk about your most significant technical work

**What they evaluate**:
- Communication ability (can you explain complex ideas clearly?)
- Technical substance (is this real work with real depth?)
- Audience calibration (appropriate level for senior ML engineers?)
- Q&A handling (how do you respond to challenges and curiosity?)

**Anthropic-specific notes**:
- Pick work that genuinely excites you. Enthusiasm is visible and valued.
- Audience is extremely technical. Don't oversimplify -- they can handle it.
- Expect hard questions. The Q&A is evaluative, not just polite interest.
- Connecting your work to AI safety or responsible development (where genuine) is a positive signal.

### Full Loop: Values & Culture Fit

**Duration**: 45 minutes
**Format**: Conversation with a cross-functional team member (possibly non-engineering)
**Content**: Behavioral questions focused on values alignment

**What they evaluate**:
- Alignment with Anthropic's values: safety, honesty, humility, collaboration
- How you handle ethical dilemmas and ambiguity
- Genuine interest in the mission (beyond compensation)
- How you treat people, especially under pressure

**Anthropic-specific notes**:
- This is not a checkbox exercise. Anthropic takes values fit very seriously.
- Be prepared to discuss: AI safety concerns you have, times you prioritized safety over speed, how you handle disagreements about technical direction
- They want to see genuine engagement with hard questions, not rehearsed answers
- Reference the Responsible Scaling Policy and Claude's character if relevant (but only if you've actually read them)

### Team Match

**Duration**: 1-2 calls, 30 minutes each
**Format**: Informal conversations with potential team members
**Purpose**: Mutual evaluation of team fit (not scored in the traditional sense)

**What to do**:
- Be yourself. This is genuinely bidirectional.
- Ask about day-to-day work, team dynamics, biggest challenges
- Evaluate if this is a team where you'd thrive
- It's okay to express preferences if you're matched with multiple teams

---

## Google DeepMind

### Loop Structure (2025-2026)

```
Application/Referral
    |
    v
Recruiter Screen (30 min)
    |
    v
Phone Screen: Coding (45 min) OR Research Discussion (45 min)
    |
    v
Full Loop - Virtual or Onsite (5-6 hours)
  ├── Coding Interview #1 (45 min)
  ├── Coding Interview #2 (45 min)
  ├── ML/Research Design (60 min)
  ├── Technical Deep Dive / Past Work (45 min)
  └── Googliness & Leadership (45 min)
    |
    v
Hiring Committee Review
    |
    v
Team Match
    |
    v
Senior Leadership Review (L6+)
    |
    v
Offer
```

**Typical timeline**: 6-12 weeks (notoriously slow -- hiring committee adds weeks).

### Key Differences from Anthropic

| Dimension | Anthropic | Google DeepMind |
|-----------|-----------|----------------|
| Coding weight | Moderate (1 round) | Heavy (2 rounds) |
| Presentation | Required | Not standard (varies) |
| Values emphasis | Very high (dedicated round) | Moderate ("Googliness") |
| Research depth | Expected but practical | Can be deeply theoretical |
| Hiring committee | No (manager + loop feedback) | Yes (adds 2-4 weeks) |
| Level calibration | During recruiter screen | During committee review |

### Preparation Adjustments

- **Double down on coding**: Two dedicated coding rounds means algorithmic weaknesses are more likely to surface. Spend 40%+ of prep on coding.
- **Research fluency**: If targeting research roles, be prepared to discuss recent papers, propose new research directions, and critique methodologies.
- **Googliness**: Emphasize collaboration over individual heroism. "How did you help others succeed?" is a common theme.
- **Publication record**: Not required for applied roles, but a strong publication record significantly strengthens research track applications.

---

## OpenAI

### Loop Structure (2025-2026)

```
Application/Referral
    |
    v
Recruiter Screen (30 min)
    |
    v
Technical Phone Screen (60 min) -- coding + ML discussion
    |
    v
Full Loop - Typically Virtual (4-5 hours)
  ├── Coding (60 min)
  ├── System Design / ML Design (60 min)
  ├── Technical Depth / Past Work (60 min)
  └── Manager / Culture Fit (45 min)
    |
    v
Debrief & Decision
    |
    v
Offer
```

**Typical timeline**: 3-5 weeks (faster than DeepMind, similar to Anthropic).

### Key Differences from Anthropic

| Dimension | Anthropic | OpenAI |
|-----------|-----------|--------|
| Mission emphasis | Safety-first, explicit values round | "Beneficial AGI" but less structured values eval |
| Applied vs Research | Unified track | Distinct Applied vs Research tracks |
| Coding bar | High | Very high (especially Applied) |
| Presentation | Required round | Not standard |
| Speed | 3-6 weeks | 3-5 weeks |
| Compensation | Competitive, equity-heavy | Top-of-market cash + equity |

### Track Differences

**Applied Research / Engineering**:
- Heavier coding emphasis
- System design focuses on production systems (inference, APIs, scale)
- Past work discussion emphasizes shipping products
- ML knowledge tested at applied level (how to use, not how to derive)

**Research**:
- Lighter coding (but still tested)
- Research design: propose experiments, discuss methodology, critique papers
- Past work: deep dive into publications and research contributions
- ML knowledge at theoretical depth (loss landscapes, optimization theory, architecture design)

### Preparation Adjustments

- **Applied track**: Focus on coding (LeetCode hard), production ML systems, and shipping under pressure.
- **Research track**: Focus on paper discussion ability, experiment design, and research taste (which problems are worth solving?).
- **Both tracks**: Know GPT architecture details. Be prepared to discuss transformer variants, scaling laws, and RLHF at depth.

---

## Meta FAIR

### Loop Structure (2025-2026)

```
Application/Referral
    |
    v
Recruiter Screen (30 min)
    |
    v
Phone Screen: Coding (45 min)
    |
    v
Full Loop - Onsite or Virtual (5-6 hours)
  ├── Coding #1 (45 min)
  ├── Coding #2 (45 min)
  ├── ML System Design (60 min)
  ├── Research Discussion / Past Work (60 min)
  └── Behavioral / Leadership (45 min)
    |
    v
Debrief & Decision
    |
    v
Offer
```

**Typical timeline**: 4-8 weeks.

### Key Differences from Anthropic

| Dimension | Anthropic | Meta FAIR |
|-----------|-----------|-----------|
| Coding rounds | 1 | 2 (same as DeepMind) |
| Open source emphasis | Moderate | Very high (open source is cultural) |
| Publication expectation | Helpful but not required | Strongly expected for Research |
| System design | ML-focused | Can be pure systems (infra, distributed) |
| Values round | Dedicated round | Embedded in behavioral |
| Research independence | Collaborative culture | High independence valued |

### Preparation Adjustments

- **Coding bar is high**: Two coding rounds. Practice on Codeforces/LeetCode hard. Meta's coding interviews trend toward harder algorithmic problems.
- **Open source record**: Having meaningful open source contributions (especially in ML frameworks like PyTorch) is a significant advantage. Prepare to discuss contributions.
- **System design breadth**: FAIR interviews may include pure distributed systems design (not just ML pipelines). Know sharding, replication, consensus, and large-scale training infrastructure.
- **Publication discussion**: Be prepared to present and defend a paper in conversational format. "Walk me through your best paper. What would you do differently?"
- **Move fast culture**: Stories should emphasize speed, iteration, and impact. "We shipped in X weeks" resonates more than "We spent 6 months perfecting Y."

---

## Cross-Company Comparison

### Difficulty by Round Type

| Round | Anthropic | DeepMind | OpenAI | Meta FAIR |
|-------|-----------|----------|--------|-----------|
| Coding | Medium-Hard | Hard | Hard-Very Hard | Hard-Very Hard |
| ML Design | Hard | Hard | Hard | Medium-Hard |
| Technical Depth | Very Hard | Hard | Hard | Hard |
| Behavioral | Hard (values) | Medium | Medium | Medium |
| Presentation | Hard | N/A usually | N/A usually | N/A usually |

### What Each Company Values Most

| Company | Top Priority | Second Priority | Third Priority |
|---------|-------------|----------------|---------------|
| Anthropic | Technical depth + safety awareness | Intellectual honesty | Collaborative problem-solving |
| DeepMind | Research quality + coding | Publication record | Collaboration |
| OpenAI | Shipping ability + coding | ML depth | Speed & iteration |
| Meta FAIR | Coding + research independence | Open source contribution | Publication record |

### Negotiation Leverage Between Offers

If you receive multiple offers, use this knowledge:

- Anthropic and OpenAI compete most directly. An offer from one provides strong leverage with the other.
- DeepMind offers tend to be lower base (Google pay bands) but strong RSUs. Anthropic/OpenAI often counter with higher base + equity.
- Meta FAIR offers are typically highest total comp. Useful as a ceiling anchor in negotiations.
- All four companies respect the other three. A competing offer from any of them is taken seriously.

---

## Preparation Priority Matrix

Given limited prep time, how to allocate across companies:

| If Target is... | Spend Most Time On | Spend Moderate Time On | Spend Least Time On |
|----------------|-------------------|----------------------|-------------------|
| Anthropic | Technical depth, values, presentation | ML design, coding | (nothing can be skipped) |
| DeepMind | Coding (2 rounds!), research depth | ML design, Googliness | Presentation (usually N/A) |
| OpenAI Applied | Coding, production ML systems | Technical depth | Research theory |
| OpenAI Research | Research design, paper discussion | Coding | Production systems |
| Meta FAIR | Coding (2 rounds!), publications | System design (broad) | Values (embedded) |
| Multiple companies | Coding (universal), ML design | Company-specific prep last 2 weeks | Niche topics |
