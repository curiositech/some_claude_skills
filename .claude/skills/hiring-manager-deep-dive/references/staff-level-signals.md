# Staff-Level Signals: What Hiring Managers Actually Evaluate

This reference provides the detailed breakdown behind each of the 6 dimensions evaluated in HM rounds at L6/Staff+ level. Use it to calibrate your stories and understand what separates levels.

---

## Dimension 1: Scope of Impact

Scope is the single most important differentiator between L5 and L6+. It measures the blast radius of your work.

### Scope Ladder

| Level | Scope | Example |
|---|---|---|
| L4 (Mid) | Task-level | "I completed the assigned Jira tickets on time" |
| L5 (Senior) | Team-level | "I designed and shipped the feature that became our team's flagship product" |
| L6 (Staff) | Multi-team / Org-level | "I identified a platform gap affecting 4 teams, wrote the RFC, built consensus, and led the cross-team implementation" |
| L7 (Senior Staff) | Company-level | "I defined the technical strategy for our inference infrastructure, which became a competitive advantage cited in earnings calls" |
| L8 (Principal) | Industry-level | "I authored the paper/standard/framework that the industry adopted" |

### Signals HMs Look For

**Strong scope signals:**
- Your work created capabilities that other teams built on top of
- You were pulled into cross-team decisions because of your expertise
- Your design docs became the authoritative reference for an area
- Leadership cites your work when discussing strategy
- You chose WHAT to work on, not just HOW to do assigned work

**Weak scope signals:**
- All examples are within a single team
- Work was assigned, not self-directed
- Impact is measured only in code shipped, not outcomes achieved
- No mention of other teams, orgs, or business stakeholders

### How to Talk About Scope

Bad: "I built the ML pipeline."
Better: "I built the ML pipeline that reduced model deployment time from 2 weeks to 2 hours."
Best: "I identified that model deployment latency was our biggest bottleneck to research velocity. I proposed a self-serve ML pipeline, got buy-in from the ML platform team and the research org, led the design across both teams, and the resulting system reduced deployment time from 2 weeks to 2 hours. Three other teams adopted it within 6 months, and it's now the standard deployment path for the company."

---

## Dimension 2: Ambiguity Navigation

At L5, problems are well-defined. At L6+, you are expected to operate in ambiguity -- and create clarity for others.

### Ambiguity Ladder

| Level | Ambiguity | What You Do |
|---|---|---|
| L4 | Clear task, clear solution | Execute the plan |
| L5 | Clear problem, unclear solution | Explore solutions and pick the best one |
| L6 | Unclear problem, multiple possible framings | Define the problem correctly, then solve it |
| L7 | Unclear if there's even a problem | Identify that something needs to change before anyone else sees it |

### Signals HMs Look For

**Strong ambiguity signals:**
- "There was no roadmap for this area. I conducted a landscape analysis, identified the top 3 opportunities, and proposed a phased approach."
- "The team was debating symptoms. I stepped back and reframed the problem, which changed what we built."
- "We had conflicting signals from customers and data. I designed an experiment to resolve the ambiguity before committing engineering resources."

**Weak ambiguity signals:**
- All stories begin with "My manager asked me to..."
- Problems are always well-defined before the candidate engages
- No examples of reframing or problem discovery

### Red Flag Questions HMs Ask

- "How did you decide this was the right problem to solve?"
- "What other approaches did you consider?"
- "How did you know when you had enough information to commit?"
- "What would you have done if your first approach failed?"

If you cannot answer these fluently for each of your stories, your ambiguity signal is weak.

---

## Dimension 3: Influence Without Authority

This dimension tests whether you can move an organization without a reporting line. It is the hardest dimension to demonstrate and the one most correlated with Staff+ success.

### Influence Patterns

| Pattern | Description | When to Use |
|---|---|---|
| **Technical Authority** | Your expertise is so respected that people follow your lead | When you are the recognized expert in a domain |
| **RFC/Design Doc** | You write the definitive document that frames the discussion | When the problem needs alignment before action |
| **Working Prototype** | You build a proof of concept that makes the abstract concrete | When words alone cannot convince skeptics |
| **Coalition Building** | You identify allies, align incentives, and build momentum | When the change requires buy-in from multiple stakeholders |
| **Data-Driven Persuasion** | You gather evidence that makes the case undeniable | When there's resistance based on assumptions |
| **Facilitated Consensus** | You run the decision-making process itself | When the problem isn't that people disagree, but that nobody is driving a decision |

### What Great Influence Stories Sound Like

"The ML team wanted to build a custom serving layer. The platform team wanted everyone on their standard infrastructure. Both had valid points. I wrote an RFC that acknowledged the ML team's latency requirements and the platform team's maintenance concerns, proposed a hybrid approach with a shared abstraction layer, and facilitated three design reviews. The final architecture was better than either original proposal. Two years later, it's still the serving architecture."

**Why this works**: Shows understanding of both sides, creative problem-solving, process ownership, and durable outcome.

### What Weak Influence Stories Sound Like

"I convinced my tech lead that we should use Kafka instead of RabbitMQ."

**Why this fails**: Small scope, simple persuasion within team, no organizational complexity.

---

## Dimension 4: Technical Leadership

At Staff+, technical leadership means setting direction, not just writing code.

### Technical Leadership Ladder

| Level | Leadership Mode | Example |
|---|---|---|
| L5 | Code review excellence | "I caught a subtle concurrency bug in a colleague's PR" |
| L6 | Design review ownership | "I led the design review for our new event system, identified 3 architectural risks, and proposed mitigations" |
| L6+ | Architectural direction | "I defined our team's technical strategy for the next 2 years and wrote the architecture vision document" |
| L7 | Technical vision | "I set the company's approach to real-time ML inference, which influenced hiring, tooling, and product strategy" |

### Signals HMs Look For

- You have written design docs that were adopted beyond your team
- Other engineers seek your review on designs, not just code
- You have killed projects or redirected efforts based on technical judgment
- You can explain why your system is designed the way it is at multiple levels of abstraction
- You have opinions about the right technical direction AND evidence for why

---

## Dimension 5: Mentorship & Team Growth

At L6+, mentoring is not optional -- it is a core expectation. The HM wants to know if you make others better.

### Mentorship Ladder

| Level | Mentoring Mode | Impact |
|---|---|---|
| L5 | Tactical help | "I helped them debug a tricky issue" |
| L6 | Career development | "I helped 3 engineers identify growth areas and they all got promoted within 18 months" |
| L6+ | Culture shaping | "I established the code review culture on our team, wrote the onboarding guide, and ran the weekly architecture review that became the team's main learning forum" |
| L7 | Hiring bar setting | "I redesigned our interview process, trained 12 interviewers, and our offer acceptance rate went from 60% to 85%" |

### Concrete Examples to Prepare

- **Stretch assignment**: "I identified that [engineer] was ready for more scope, advocated for them to own [project], and coached them through the ambiguous early stages."
- **Feedback that changed a trajectory**: "I gave [engineer] direct feedback about [specific behavior] and worked with them on a growth plan. Six months later, they were leading their own workstream."
- **Knowledge transfer at scale**: "I created [guide/training/forum] that benefited the whole team, not just one person."

---

## Dimension 6: Strategic Thinking

Strategic thinking means connecting technical decisions to business outcomes. Many strong ICs struggle here.

### What Strategic Thinking Sounds Like

- "We chose to invest in this platform capability because our product roadmap for the next 3 quarters depends on being able to iterate on models weekly, not monthly."
- "I argued against building this feature because the competitive landscape was shifting toward X, and our time was better spent on Y."
- "The build vs. buy decision came down to whether model serving is a core competency for us. I believed it was, because our differentiation depends on inference latency, and I presented that analysis to leadership."

### What It Does Not Sound Like

- "My manager told me this was a strategic priority." (Not YOUR strategic thinking)
- "We used microservices because that's the industry standard." (Following trends, not thinking strategically)
- "This was our top OKR." (Executing strategy someone else set, not formulating it)

---

## Level Calibration: Same Question, Three Levels

**Question**: "Tell me about a time you improved engineering productivity."

### Great L5 Answer
"Our CI pipeline was taking 45 minutes. I profiled it, identified that our integration tests were running sequentially, parallelized them with proper isolation, and cut the pipeline to 12 minutes. The team shipped 30% more PRs per week after that."

**Why it's L5**: Strong technical execution, clear metrics, team-level impact. But the problem was obvious (slow CI) and the scope was one team.

### Great L6 Answer
"I noticed that 3 teams in our org were all spending 20%+ of their time on deployment-related issues. I proposed a shared deployment platform, wrote an RFC that analyzed the common failure modes across teams, built a working prototype over 2 weeks, and presented it at the org-wide engineering review. After getting funding for a 2-person team, I led the initial design and onboarded the team. Within 6 months, deployment failures dropped 70% across the org and engineers reclaimed ~15% of their time."

**Why it's L6**: Problem discovery, cross-team scope, RFC-driven consensus, organizational impact, sustainable outcome.

### Great L7 Answer
"I identified that engineering productivity was our biggest strategic risk -- we were hiring 50 engineers per year but our productivity per engineer was declining. I presented a data-driven analysis to the VP of Engineering showing that our tooling investment had not kept pace with team growth. This led to the creation of a Developer Experience team (which I helped scope and hire for), a company-wide initiative to reduce build times, and a quarterly developer survey that became a key engineering health metric. Over 18 months, our deploy frequency doubled while incident rate stayed flat."

**Why it's L7**: Company-level problem identification, executive influence, organizational change, metrics that matter at the company level.

---

## Company-Specific Staff+ Expectations

### Anthropic
- **Heavy emphasis on**: Technical depth in ML/AI, safety-conscious decision-making, first-principles reasoning
- **Unique expectation**: Can you reason about novel problems where there is no established playbook? Anthropic values intellectual honesty about uncertainty
- **Staff signal**: "I identified a risk that nobody else was worried about yet, and I was right"
- **Culture note**: Flat hierarchy means influence without authority is table stakes, not bonus. Everyone is expected to lead through ideas

### Google
- **Heavy emphasis on**: Scale, design for billions, consensus-driven culture (design docs are sacred)
- **Unique expectation**: L6 at Google means you have driven a project that is used by multiple product areas. Perf reviews require cross-team impact evidence
- **Staff signal**: "My design doc was the basis for how 5 teams built their systems"
- **Culture note**: The promotion committee reviews your packet without you in the room. Your written artifacts (design docs, postmortems, PRD contributions) ARE your case

### Meta
- **Heavy emphasis on**: Speed of execution, impact metrics, move fast culture
- **Unique expectation**: E6 at Meta expects you to have shipped something that moved a top-line metric. Impact is quantified aggressively
- **Staff signal**: "I shipped X which moved metric Y by Z%"
- **Culture note**: Less emphasis on consensus, more on bias to action. "I made the call and here's what happened" is valued over "I built consensus"

### OpenAI
- **Heavy emphasis on**: Research taste, ability to operate at the frontier, comfort with rapid change
- **Unique expectation**: Can you make judgment calls about technical direction when the field is moving weekly?
- **Staff signal**: "I made a technical bet that paid off because I understood where the field was heading"
- **Culture note**: Small teams, high ownership, research-engineering hybrid roles. Staff engineers are expected to have research-informed technical judgment

---

## How 15 Years of Experience Maps to Staff+ Expectations

Experience duration alone does not equal level. HMs evaluate the *shape* of your experience.

| Experience Pattern | HM Interpretation |
|---|---|
| 15 years, increasing scope each role | Strong -- shows growth trajectory and readiness for Staff+ |
| 15 years, same scope different companies | Concern -- may be a very experienced L5, not a natural L6+ |
| 8 years with rapid scope expansion | Strong -- trajectory matters more than years |
| 15 years, recent shift from IC to manager and back | Depends on WHY -- if they gained perspective, positive; if they struggled with management, neutral |
| 15 years including startup founding | Very strong if they can articulate lessons learned and show they can operate in a large org too |

### The Experience Trap

Many candidates with 15+ years default to telling their oldest, most impressive stories. This is a mistake. HMs care most about your **last 3-5 years** because that is the best predictor of what you will do in the role. Lead with recent work. Reference older work only to show trajectory or pattern.

### Navigating "You're Overqualified" Concerns

If you have 15+ years and are interviewing for L6 (not L7), the HM may worry about:
- Will you be satisfied at this scope?
- Will you try to immediately manage people?
- Are you set in your ways?

Address these proactively:
- "I'm excited about this scope because [specific technical challenge] is where I want to go deep"
- "I've managed teams and I know that's not where my highest leverage is -- I want to be the technical leader, not the people manager"
- "My experience gives me judgment about what NOT to build, which I think is my biggest asset at this level"
