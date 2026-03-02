# Process Design: Why Recursive Synthesis Works

This document explains the design decisions behind the 6-phase recursive synthesis process.

---

## Why 6 Phases (Not 3, Not 10)

### The Problem with Fewer Phases

**3-Phase Model (Write → Review → Edit)**:
- Insufficient adversarial pressure
- No time for positions to crystallize
- Critiques come too early (before ideas are fully formed)
- No fresh-eyes check

**4-Phase Model (Write → Synthesize → Review → Edit)**:
- Better, but commentary happens once
- No consolidation step between commentary and final edit
- Reality Check is combined with editing (contamination)

### The Problem with More Phases

**8+ Phase Models**:
- Diminishing returns on quality
- Context window degradation (agents lose track of earlier phases)
- Human orchestration overhead becomes prohibitive
- Risk of "complexity theater" (process > output)

### Why 6 Is Right

The 6-phase model provides:

| Phase | What It Accomplishes |
|-------|---------------------|
| 0 (Setup) | Scoping, agent selection, rules |
| 1 (Divergence) | Maximum intellectual diversity |
| 2 (Synthesis) | First integration, principle hierarchy |
| 3 (Commentary) | Adversarial review, catch misrepresentations |
| 4 (Consolidation) | Second integration, unified voice |
| 5 (Reality Check) | Fresh eyes, practitioner skepticism |
| 6 (Final Merge) | Polish, multiple output formats |

**Key insight**: The process has two synthesis steps (Phase 2 and Phase 4) and two adversarial review steps (Phase 3 and Phase 5). This creates a "write-review-write-review" rhythm that catches errors without over-iterating.

---

## Why Steel-Man Requirements Work

### The Problem with Pure Critique

When agents are allowed to criticize freely:
- They focus on weaknesses, miss strengths
- Critiques become adversarial, not constructive
- Good ideas get discarded with bad framing
- No incentive to engage deeply with opposing views

### The Steel-Man Requirement

**Rule**: Before ANY critique, an agent MUST:
1. Identify 3 things the synthesis got RIGHT about their position
2. Acknowledge where the synthesis improved on their original thinking
3. Note surprising connections to other agents' positions

### Why This Works

1. **Forces engagement**: Can't dismiss without understanding
2. **Reveals blindspots**: "I didn't realize my position implied X"
3. **Builds credibility**: Critique carries weight when you've shown you understood
4. **Reduces tribalism**: Acknowledging others' strengths breaks down us-vs-them
5. **Improves final document**: Steel-manned strengths get preserved

### Implementation Note

The steel-man section must be MANDATORY and FIRST. If agents can write critique first, they'll retrofit steel-manning. The order matters.

---

## Why Practitioner Agents Are Excluded from Philosophical Phases

### The Problem

Phases 1-4 involve deep philosophical reasoning:
- Articulating first principles
- Resolving fundamental tensions
- Creating principle hierarchies
- Developing shared vocabulary

Including PM/EM/Design in these phases creates:

1. **Premature practicality**: "But can we actually build this?" interrupts principle development
2. **Context contamination**: By Phase 5, they've absorbed the jargon
3. **Groupthink risk**: They become part of the in-group
4. **Lost fresh-eyes value**: The most valuable thing they offer is outsider skepticism

### The Fresh Eyes Design

By deliberately EXCLUDING PM/EM/Design from Phases 1-4:

| What They Miss | What They Gain |
|----------------|----------------|
| Shared vocabulary development | Ability to spot undefined terms |
| Principle hierarchy reasoning | Ability to question hierarchy |
| Tension resolution discussions | Ability to see unresolved tensions |
| Group consensus building | Immunity to groupthink |

### The Reality Check Value

When PM/EM/Design arrive in Phase 5:
- They read the Soul Document cold
- They don't know why decisions were made
- They experience it as an outsider would
- Their confusion IS the signal

This is invaluable. It catches:
- Jargon that became invisible to insiders
- Assumptions that feel obvious but aren't
- Implementation gaps that philosophers glossed over
- Stakeholder objections that weren't considered

---

## Why Ranked Choice Voting for Principles

### The Problem with Binary Consensus

Binary voting ("agree/disagree") creates problems:
- Forces artificial agreement
- Loses information about intensity
- Can't distinguish "weak prefer" from "strong prefer"
- Leads to lowest-common-denominator outcomes

### The Problem with Raw Averaging

Simple averaging ("rate 1-10") creates problems:
- Strategic voting (exaggerate to move average)
- Anchoring effects (first number influences others)
- Doesn't handle incomparable principles well

### Why Ranked Choice Works

Each agent provides a RANKED LIST of principles:
1. Most important
2. Second most important
3. ...
N. Least important

**Benefits**:
1. **Forces prioritization**: Can't rate everything "10"
2. **Reveals structure**: Shows which principles subsume others
3. **Handles ties gracefully**: "Both are important" becomes "in what order?"
4. **Resistant to gaming**: Hard to strategically manipulate rankings
5. **Produces hierarchy naturally**: Aggregated rankings = principle hierarchy

### Aggregation Method

Use instant-runoff or Borda count:
1. Collect all rankings from all agents
2. Assign points (1st place = N points, 2nd = N-1, etc.)
3. Sum across agents
4. Result: Aggregate principle ranking

**Tie-breaking**: When principles tie, the Synthesizer uses judgment about which principle subsumes the other.

---

## Why the Dissenting Appendix Is Essential

### The Problem with Forced Consensus

Documents that require unanimous agreement:
- Bury genuine disagreements
- Use weasel words to hide tensions
- Create false confidence in unity
- Fail when hidden tensions surface later

### The Dissenting Appendix Design

Some tensions are FUNDAMENTAL. They cannot be resolved by:
- Better wording
- More discussion
- Clever reframing

Examples:
- "Move fast" vs. "Don't break things" (tension is real)
- "Centralized control" vs. "Distributed autonomy" (incompatible at extremes)
- "Optimize for users" vs. "Optimize for revenue" (sometimes conflict)

### What Goes in the Dissenting Appendix

For each irreconcilable tension:

1. **State the tension clearly**: "Principle A conflicts with Principle B"
2. **Present both sides' strongest arguments**: Steel-man each position
3. **Document the document's choice**: "This Constitution prioritizes A over B because..."
4. **Acknowledge the cost**: "This means we sacrifice X, which advocates of B correctly value"
5. **Define revisitation conditions**: "If Y changes, this should be reconsidered"

### Why This Works

1. **Intellectual honesty**: Readers know what was traded off
2. **Minority protection**: Losing positions are documented respectfully
3. **Future flexibility**: When conditions change, guidance exists
4. **Credibility**: Admitting tensions increases trust in rest of document
5. **Prevents revisionism**: Can't pretend tension never existed

---

## Scaling Guidance

### Small Documents (3-5 Agents)

For simpler documents (team charter, project principles):

- **Phase 1**: 3-5 agents (not 10)
- **Phase 2**: Same
- **Phase 3**: Same, but shorter commentaries (500 words, not 1500)
- **Phase 4**: Same
- **Phase 5**: 1-2 practitioners (not 3)
- **Phase 6**: Same

**Total agents**: 5-8 (vs. 14 for full process)
**Total documents**: ~15 (vs. 31)
**Time**: 2-3 hours (vs. full day)

### Large Documents (15-20 Agents)

For complex documents (org-wide constitution, multi-team architecture):

- **Phase 1**: 15-20 agents, grouped into 3-4 "traditions"
- **Phase 2**: 3-4 sub-synthesizers, then one meta-synthesizer
- **Phase 3**: All agents, but grouped by tradition
- **Phase 4**: Lead Architect with sub-architects per tradition
- **Phase 5**: 5-6 practitioners (PM, EM, Design, Legal, Finance, Ops)
- **Phase 6**: Polymath Editor with domain editors

**Total agents**: 20-30
**Total documents**: 50-80
**Time**: Multiple days, possibly with human checkpoints

### Scaling Heuristics

| Problem Complexity | Agents | Phases | Time Estimate |
|-------------------|--------|--------|---------------|
| Simple (team charter) | 5-8 | 6 | 2-3 hours |
| Medium (architecture decision) | 10-14 | 6 | 4-8 hours |
| Complex (org constitution) | 15-20 | 6 (with sub-phases) | 1-2 days |
| Very Complex (multi-org) | 20-30 | 8-10 | 3-5 days |

---

## Known Failure Modes

### 1. Agent Echo-Chambering

**Symptom**: By Phase 3, all agents sound the same
**Cause**: Agents weren't sufficiently differentiated in Phase 1
**Prevention**:
- Use radically different system prompts
- Enforce no-cross-talk strictly
- Choose agents from genuinely opposing traditions

**Recovery**: If detected, discard Phase 1-3 and restart with more differentiated agents

### 2. Context Window Collapse

**Symptom**: Phase 4+ agents ignore nuances from Phase 1
**Cause**: Too much context, agents lose details
**Prevention**:
- Use explicit summaries at phase transitions
- Reference specific sections, not whole documents
- Keep individual documents under 3000 words

**Recovery**: Create "context refresh" summaries for later phases

### 3. Stale Notifications

**Symptom**: Process stalls waiting for human approval
**Cause**: Quality gates require human review that doesn't happen
**Prevention**:
- Define automated quality checks where possible
- Set explicit SLAs for human reviews
- Allow "proceed with risk" after timeout

**Recovery**: Audit where process stalled, fix that gate

### 4. Complexity Theater

**Symptom**: Process documentation exceeds Constitution length
**Cause**: Process became more important than output
**Prevention**:
- Hard rule: Constitution must be shorter than total process docs
- Kill scope if process is exceeding value
- Regularly ask: "Is this making the output better?"

**Recovery**: Simplify ruthlessly, cut phases if needed

### 5. Quality Collapse in Later Phases

**Symptom**: Phase 6 output is worse than Phase 4 Soul Document
**Cause**: Over-editing, death by a thousand cuts
**Prevention**:
- Phase 6 has limited mandate (address Reality Check, polish)
- Preserve Phase 4 as "original intent" reference
- Don't let Editor overrule Architect on substance

**Recovery**: Revert to Phase 4 Soul Document, apply only P0 changes

---

## The Meta-Risk of Complexity

**The Biggest Risk**: The synthesis process is itself too complex to be useful.

### Warning Signs

- Process takes longer to explain than to run
- Agents spend more time on process than content
- Output requires process documentation to understand
- Non-participants can't engage with the output

### The Test

**Ask**: Could someone who wasn't part of the process read the Constitution and find it valuable?

If the answer is no, the process failed. The Constitution must stand alone.

### Design Principle

The process exists to CREATE the Constitution.
The Constitution must work WITHOUT the process.
If they're inseparable, simplify until they're not.

---

## Summary: Why This Works

1. **Divergence before convergence**: Generate diversity, then synthesize
2. **Adversarial but constructive**: Steel-man requirement prevents pure criticism
3. **Multiple synthesis passes**: Two integration points catch more errors
4. **Fresh eyes at the end**: Reality Check prevents insider blindness
5. **Honest about tensions**: Dissenting Appendix preserves intellectual honesty
6. **Multiple output formats**: Constitution for principles, Guide for practice
7. **Scalable structure**: Same phases work at different scales
8. **Failure mode awareness**: Known risks have mitigations

The process is complex because the problem is complex. But the OUTPUT must be simple. That's the goal.
