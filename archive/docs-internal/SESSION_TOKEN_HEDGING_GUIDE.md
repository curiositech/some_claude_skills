# Session Token Hedging Guide

**For Use By**: 5 Parallel Claude Code Sessions (Session 1-5)  
**Budget Hedge**: TOKEN_OPTIMIZATION_STRATEGY.md + skill-architect enhancements  
**Goal**: Create necessary skills without exceeding budget

---

## Quick Reference: Token Budget

| Session | Duration | Token Budget | Contingency | Usable Budget |
|---------|----------|--------------|-------------|---------------|
| Session 1: Stop Controls | 4-6h | $40 | 10% ($4) | $36 |
| Session 2: Cost Verification | 3-4h | $30 | 10% ($3) | $27 |
| Session 3: Design Research | 8-12h | $80 | 10% ($8) | $72 |
| Session 4: Design Generator | 4-6h | $40 | 10% ($4) | $36 |
| Session 5: Magic Developer Demo | 4-5h | $40 | 10% ($4) | $36 |
| **TOTAL** | **25-35h** | **$230** | **$23** | **$207** |

**Cost per token at Haiku rates (~$0.80/1M input):**
- 1,000 tokens ≈ $0.001
- 10,000 tokens ≈ $0.008
- 100,000 tokens ≈ $0.08

**Your hedges** (to keep within budget):
1. Use compressed SKILL.md (target <2,000 tokens each)
2. Only create skills if reused 3+ times in same session
3. Defer deep documentation to post-session
4. Invoke skill-architect to validate cost before creating
5. Use TOKEN_OPTIMIZATION_STRATEGY as reference

---

## When Creating a Skill During Your Session

### Pre-Creation Check (5 minutes)

**Question 1**: Will this skill be used 3+ times in this session?
- If NO → Don't create (inline implementation is cheaper)
- If YES → Proceed to Question 2

**Question 2**: Does it encode expertise that's hard for LLMs to get right?
- If NO → Consider inline implementation
- If YES → Proceed to Question 3

**Question 3**: Can you create it in <30 minutes?
- If NO → Plan as post-session work
- If YES → Create it

### Estimated Cost of Skill Creation

**Express Skill Creation** (30 min):
- Time investment: 30 minutes
- Token investment: ~1,500 tokens (creation process)
- Tokens saved per invocation: ~1,300 tokens
- Break-even: 1-2 uses
- **Decision**: Generally worthwhile if used 3+ times

**Full Skill Creation** (2+ hours):
- Time investment: 2+ hours
- Token investment: ~3,000-5,000 tokens
- Break-even: 3-4 uses
- **Decision**: Only if critical to multiple sessions

### During Skill Creation: Token Optimization

**Compression Patterns** (from TOKEN_OPTIMIZATION_STRATEGY):

| Technique | Savings | Implementation |
|-----------|---------|----------------|
| Decision tree format | 30-40% | Use "If X then A, else B" not prose |
| Table format | 40-50% | Use tables for comparisons vs bullet lists |
| Anti-pattern by example | 25% | Show [WRONG] + [CORRECT] code, minimal explanation |
| Scripts as links | 20% | "See `scripts/tool.py`" not full code inline |
| References as deferred | 35% | "See `/references/deep-dive.md`" for complex topics |

**Target SKILL.md size**: <2,000 tokens (~400 lines)

**Example compression**:

❌ **VERBOSE** (500+ lines, 2,500+ tokens):
```markdown
## How to Use This Skill

There are several scenarios where this skill is useful. First, when you're working with data 
from an API, you'll want to extract certain fields and transform them. This is a common pattern 
and the skill helps with this. You might have JSON like {...} and want to transform it into 
{...}. The process involves several steps...
```

✅ **COMPRESSED** (100 lines, 600 tokens):
```markdown
## How to Use

**Scenario 1: Transform API response**
- Input: Raw JSON from API
- Process: Extract fields, normalize format
- Output: Transformed data structure

**Scenario 2: Validate schema**
- Input: Data object
- Check: Against schema definition
- Output: Validation report

See `scripts/transformer.py` for working examples.
See `/references/transformation-patterns.md` for deep dives.
```

### Real-Time Cost Tracking

As you create the skill, estimate tokens:

```markdown
## Skill Creation Cost Tracking

**Frontmatter + core content**: ~600 tokens (10 min)
**Anti-patterns section**: ~300 tokens (5 min)
**Working scripts**: ~400 tokens (10 min)
**Decision trees**: ~200 tokens (5 min)
**Total creation cost**: ~1,500 tokens ✅ (Under budget)

**Expected per-use cost**: ~400 tokens
**Expected to save per-use vs inline**: ~1,300 tokens
**Break-even**: 1.2 uses

**ROI if used 3x**: (3 × 1,300) - 1,500 = +2,400 tokens saved 🎯
```

---

## During Your Session: Inline vs Skill Decision

**Decision Tree**:

```
Need a capability?
│
├─ Simple implementation (<50 lines)
│  └─ Use inline (skill overhead not worth it)
│
├─ Medium implementation (50-200 lines)
│  └─ Will I use this 2+ times in this session?
│     ├─ NO → Use inline
│     └─ YES → Create express skill (30 min)
│
└─ Complex implementation (200+ lines)
   └─ Does this encode reusable expertise?
      ├─ NO → Use inline (or refactor task)
      └─ YES → Create express skill (30 min) OR defer to post-session
```

**Cost-effectiveness check**:

| Scenario | Action | Why |
|----------|--------|-----|
| Need a function once | Inline | Skill overhead > benefit |
| Need a function 2x in session | Inline | Break-even marginal |
| Need a function 3+ times | Express skill | Saves net tokens |
| Need a pattern 3+ times | Full skill | Reusable expertise |
| Encodes critical expertise | Full skill | Value multiplier across sessions |

---

## Post-Session: ROI Analysis & Deprecation

**After your session completes**, evaluate each skill created:

### ROI Tracking Template

```markdown
## Skill: [Skill Name]

**Created**: Session [#]  
**Creation cost**: X tokens  
**Per-invocation cost**: Y tokens  

### Usage
- Invoked: [count] times
- Total tokens saved: [calculation]
- Net ROI: [total saved - creation cost] tokens

### Decision
- [x] Keep (ROI positive, reusable)
- [ ] Iterate (ROI marginal, needs improvement)
- [ ] Deprecate (ROI negative, unused)
```

### Deprecation Rule

If a skill created during your session is:
- ❌ Used 0-1 times → Mark for deprecation
- ⚠️ Used 2 times with marginal savings → Mark for iteration
- ✅ Used 3+ times with positive ROI → Promote to full skill

**Cleanup**: Delete unused skills from `.claude/skills/` after session ends to keep context clean.

---

## Budget Tracking During Session

### Start of Session
```
Budget allocated: $36
Contingency (10%): $4 (reserved)
Usable budget: $32
```

### As You Work
```
# Mid-session checkpoint
Tokens used so far: 45,000
Estimated cost so far: $0.036
Remaining budget: $32 - $0.036 = $31.96 ✅

Skills created:
- skill-1: 1,500 tokens used, 3 uses planned
  ROI if all uses happen: +2,400 tokens saved

- skill-2: 1,200 tokens used, pending evaluation

Projected final cost: $0.18 (well under budget)
```

### End of Session
```
# Final accounting
Total tokens: 225,000
Final cost: $0.18
Under budget: ✅ ($36 - $0.18 = $35.82 remaining)

Skills that justified cost:
✅ skill-1 (used 3x, ROI positive)
⚠️ skill-2 (used 1x, ROI marginal)

Deprecation: Mark skill-2 for removal post-session
```

---

## Reference: TOKEN_OPTIMIZATION_STRATEGY Excerpt

**Key principles** (from ~/.claude/TOKEN_OPTIMIZATION_STRATEGY.md):

1. **Context efficiency**: Each session inherits previous context via documentation, not copy-paste
2. **Compression patterns**: Use tables, decision trees, linked references instead of prose
3. **Deferred loading**: Load /references/ only on-demand (Claude loads them if needed)
4. **Skill validation**: Only create skills that save net tokens (ROI positive)
5. **Post-session cleanup**: Delete low-ROI artifacts to keep future contexts lean

**Your hedges** (apply these in every session):

| Hedge | Implementation | Token Savings |
|-------|----------------|---------------|
| Compress SKILL.md | Use tables + links vs prose | 30-50% |
| Defer references | Load on-demand vs inline | 35% |
| Express workflows | 30-min skills vs polish | 40% |
| Validate ROI | Create only if 3+ uses | 50%+ |
| Cleanup unused | Delete at session end | Prevents bloat |

---

## Session-Specific Instructions

### Session 1: Stop Controls (4-6h, $36 budget)

**Skills you may create**:
- `execution-lifecycle-manager` (1-2h) — If reused in stop controls + cost tracking
- `graceful-shutdown-patterns` (0.5-1h) — Reference pattern, minimal skill needed
- `cost-accrual-tracker` (1-1.5h) — Used in Session 1 + Session 2 (JUSTIFY)

**ROI check before creating**:
- execution-lifecycle-manager: Used in Session 1 (stop button) + Session 5 (demo)? → 2x = marginal, but enables both
- graceful-shutdown-patterns: Used in Session 1 only? → Inline is cheaper
- cost-accrual-tracker: Used in Session 1 + Session 2 + Session 5? → 3x = justified

**Budget strategy**: Create only `execution-lifecycle-manager` (1.5h, ~1,500 tokens). Inline others to stay under budget.

### Session 2: Cost Verification (3-4h, $27 budget)

**Skills you may create**:
- `cost-verification-auditor` (1.5h) — Main task of this session
- `token-estimator-tuner` (1-1.5h) — If verification finds errors >20%

**ROI check**:
- cost-verification-auditor: One-time use in Session 2? → Inline cheaper
- token-estimator-tuner: Reused if adjustments needed repeatedly? → If yes, create; if no, inline

**Budget strategy**: Inline verification logic, defer tuner skill unless actually needed (create on-demand if findings warrant it).

### Session 3: Design Research (8-12h, $72 budget)

**Skills you may create** (highest skill-creation budget):
- `design-trend-analyzer` (1.5-2h) — Used for research + Session 4 design system generator
- `design-accessibility-auditor` (1.5-2h) — Used for catalog validation
- `design-palette-extractor` (1-1.5h) — Optional, only if image analysis helps

**ROI check**:
- design-trend-analyzer: Used in Session 3 + Session 4? → 2x = marginal but enables core feature
- design-accessibility-auditor: Used for every palette/system? → High reuse in session = justified
- design-palette-extractor: Used once for image analysis? → Inline is cheaper

**Budget strategy**: Create trend-analyzer + accessibility-auditor (3-4h, ~3,000 tokens). Inline palette-extractor.

### Session 4: Design System Generator (4-6h, $36 budget)

**Skills you may create**:
- `tailwind-config-validator` (0.5-1h) — Validates generated configs
- `design-system-documenter` (1-1.5h) — Documents output
- `component-template-generator` (1-1.5h) — Generates React components

**ROI check**:
- tailwind-config-validator: Used in Session 4? → Single session, marginal ROI but enables core feature
- design-system-documenter: Used for every generated system? → High reuse = justified
- component-template-generator: Used for component generation? → Yes = justified

**Budget strategy**: Create design-system-documenter + component-template-generator (2.5-3h). Inline validator or defer to post-session.

### Session 5: Magic Developer Demo (4-5h, $36 budget)

**Skills you may create**:
- `execution-streamer` (1-1.5h) — Real-time WebSocket events
- `code-metrics-calculator` (1.5-2h) — Measure before/after
- `before-after-comparison` (1-1.5h) — Display improvements

**ROI check** (this is a demo, so ROI is impact, not reuse):
- execution-streamer: Only used in demo? → But enables real-time UI, critical for demo impact
- code-metrics-calculator: Used for metrics in demo? → Yes, creates impressive visuals
- before-after-comparison: Used for visual comparison? → Yes, key to demo wow factor

**Budget strategy**: Create all three if demo impact justifies cost (~4-5h, ~4,000 tokens). Demo ROI = user engagement, not token savings.

---

## Remember

**Token hedging is your safety net**:

1. ✅ Check TOKEN_OPTIMIZATION_STRATEGY before creating skills
2. ✅ Use express (30-min) workflow when time is tight
3. ✅ Validate ROI before creating (break-even analysis)
4. ✅ Compress SKILL.md using decision trees + tables
5. ✅ Defer references to `/references/` for on-demand loading
6. ✅ Track costs in real-time during session
7. ✅ Analyze ROI post-session before promoting to full skill

**Your budget is sufficient** ($207 usable) but **requires discipline**. Each session should:
- Create only skills that are reused 3+ times OR encode critical expertise
- Use express workflow to minimize overhead
- Defer nice-to-haves to post-session
- Clean up low-ROI skills when done

**The goal**: Launch with great skills AND stay under budget.

---

**Ready to execute?** Each session gets these instructions + links to:
- `docs/SKILL_ARCHITECT_AUDIT.md` (how to create efficiently)
- `~/.claude/TOKEN_OPTIMIZATION_STRATEGY.md` (cost principles)
- `docs/DETAILED_SESSION_BREAKDOWNS.md` (what to build)
