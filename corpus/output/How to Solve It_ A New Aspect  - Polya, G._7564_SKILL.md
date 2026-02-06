---
name: polya-problem-solving
description: Systematic heuristic approach to solving mathematical and logical problems through four-phase framework (understanding, planning, executing, reviewing). For problems requiring invention and discovery. NOT for rote calculation or memorized procedures.
allowed-tools: Read
---

# Polya Problem-Solving
Apply systematic heuristic reasoning to discover solutions through understanding, planning, execution, and reflection.

## When to Use
✅ Use for: Mathematical problems, logical puzzles, engineering challenges, novel situations requiring invention, educational contexts teaching discovery
❌ NOT for: Rote calculations, purely mechanical procedures, problems with memorized solutions, spectator learning

## Core Process

```
START: Facing a problem
│
├─ PHASE 1: Understanding
│  ├─ Can you state the problem clearly?
│  │  ├─ NO → Stop. "It is foolish to answer a question you do not understand"
│  │  └─ YES → Continue
│  │
│  ├─ Identify principal parts:
│  │  ├─ What is the UNKNOWN? (what you seek)
│  │  ├─ What is the DATA? (what you're given)
│  │  └─ What is the CONDITION? (relationship that must hold)
│  │
│  ├─ Can you draw a figure/diagram?
│  │  └─ YES → Draw it. Introduce suitable notation
│  │
│  ├─ Is the condition:
│  │  ├─ Insufficient? → Seek additional data
│  │  ├─ Contradictory? → Problem unsolvable as stated
│  │  ├─ Redundant? → Simplify by removing excess
│  │  └─ Sufficient? → Proceed to Phase 2
│  
├─ PHASE 2: Devising a Plan
│  ├─ Do you see immediate connection between data and unknown?
│  │  ├─ YES → Verify all data is used → Proceed to Phase 3
│  │  └─ NO → Seek connections via decision tree below
│  │
│  ├─ Have you solved a similar problem before?
│  │  ├─ YES → Can you use its METHOD?
│  │  │  ├─ Directly? → Adapt and proceed
│  │  │  └─ With modification? → Identify needed changes
│  │  └─ NO → Continue seeking
│  │
│  ├─ Try auxiliary problem strategy:
│  │  ├─ Can you solve a SIMPLER analogous problem?
│  │  │  ├─ Lower dimension? (3D→2D→1D)
│  │  │  ├─ Fewer constraints? (keep some, drop others)
│  │  │  └─ Special case? (specific values instead of general)
│  │  │
│  │  ├─ Can you solve a MORE GENERAL problem?
│  │  │  └─ Paradoxically easier: "If you can't solve a problem, 
│  │  │     find an easier one you can't solve"
│  │  │
│  │  ├─ Can you solve an ANALOGOUS problem?
│  │     └─ Same relations between parts, different domain
│  │
│  ├─ Vary your problem conception:
│  │  ├─ Restate in different words
│  │  ├─ Go back to definitions
│  │  ├─ Decompose condition into parts
│  │  └─ Introduce auxiliary elements
│  │
│  ├─ Do you have a CONFIDENT PREVISION of the solution path?
│  │  ├─ YES → This is your "bright idea" → Phase 3
│  │  └─ NO → Continue varying conception and seeking connections
│
├─ PHASE 3: Carrying Out the Plan
│  ├─ For each step in your plan:
│  │  ├─ Can you PROVE this step is correct?
│  │  │  ├─ Formal reasoning available? → Apply it
│  │  │  └─ Use intuitive insight? → Verify it convinces you
│  │  │
│  │  └─ Are you CERTAIN of this step?
│  │     ├─ NO → Return to Phase 2 (plan not ready)
│  │     └─ YES → Proceed to next step
│  │
│  ├─ For complex solutions:
│  │  ├─ Identify GREAT STEPS (structural leaps)
│  │  ├─ Verify great steps first
│  │  └─ Then verify small details
│  │
│  └─ Solution complete → Phase 4
│
└─ PHASE 4: Looking Back
   ├─ Can you CHECK the result?
   │  ├─ Substitute back into original conditions
   │  ├─ Verify from different angle
   │  └─ Does it satisfy common sense?
   │
   ├─ Can you derive result DIFFERENTLY?
   │  └─ Alternative approaches reveal deeper understanding
   │
   ├─ Reflection questions:
   │  ├─ Can you see the solution AT A GLANCE now?
   │  ├─ Can you make it more INTUITIVE?
   │  ├─ Can you use the METHOD for other problems?
   │  └─ Can you use the RESULT for other problems?
   │
   ├─ Generalization:
   │  ├─ What pattern emerges? (1D→2D→3D→nD?)
   │  ├─ What class of problems does this address?
   │  └─ What new problems does this suggest?
   │
   └─ Integration:
      └─ Fit solution into your existing knowledge structure
```

### Analogy-Based Solving (Special Path)

```
START: Problem seems intractable
│
├─ Identify STRUCTURE of original problem
│  └─ What are relations between principal parts?
│
├─ Find SIMPLER ANALOGOUS problem
│  ├─ Same relational structure
│  ├─ Lower complexity/dimension
│  └─ Example: tetrahedron→triangle, 3D→2D
│
├─ SOLVE the analogous problem completely
│  └─ Must fully understand simpler case
│
├─ Transfer to original:
│  ├─ Can you use the METHOD? (usually yes)
│  ├─ Can you use the RESULT? (adapt if applicable)
│  └─ What corresponds to what?
│
└─ VERIFY adapted solution independently
   └─ Don't assume analogy guarantees correctness
```

## Anti-Patterns

### 1. Premature Calculation
**Novice Approach**: Immediately begin calculations and manipulations without understanding what the unknown is, what data is given, or what the problem actually asks.

**Expert Approach**: Never proceed until problem is clearly understood. State it multiple times, identify all principal parts, visualize the whole structure, and genuinely desire the solution.

**Timeline**: Understanding phase may take 30-50% of total problem-solving time for experts; novices skip it entirely and waste hours on aimless calculations.

**Shibboleth**: "It is foolish to answer a question you do not understand"

---

### 2. Single-Conception Fixation
**Novice Approach**: Get stuck on one formulation of the problem. When no immediate solution appears, become discouraged and abandon the problem.

**Expert Approach**: Systematically vary the problem conception from multiple angles. Restate it, consider analogous problems, try special cases, decompose conditions, go back to definitions. Mode of conception changes until connections emerge.

**Timeline**: Experts may try 5-10 different problem formulations within minutes; novices stay stuck on the original wording for the entire session.

**Shibboleth**: "Mobilization and organization are inseparable"—recalling facts and arranging them in new combinations happens simultaneously as you vary your outlook.

---

### 3. Solution Abandonment
**Novice Approach**: Once an answer is obtained, immediately move to the next problem without reflection or verification.

**Expert Approach**: Looking back phase is where the best learning occurs. Check the result, seek alternative derivations, extract generalizable methods, consider applicability to other problems, discover new facts.

**Timeline**: Experts spend 20-30% of problem-solving time in reflection after finding solutions; novices spend 0%.

**Shibboleth**: "Mathematics 'in statu nascendi'"—understanding how solutions are invented, not just the finished products.

---

### 4. Vague Analogy
**Novice Approach**: Notice superficial similarities between problems and assume solutions transfer directly. Use any vaguely related problem without examining structural correspondence.

**Expert Approach**: Recognize that analogous objects agree in *relations between parts*, not mere appearance. Quality over quantity—one clear-cut analogy outweighs many vague ones. Always verify adapted solutions independently.

**Timeline**: Poor analogies reveal themselves within 1-2 solution steps; experts spot structural mismatches before attempting transfer.

**Shibboleth**: "Analogous objects agree in certain relations of their respective parts"

---

### 5. Certainty Paralysis
**Novice Approach**: Demand immediate certainty and rigorous proof at every stage. Become paralyzed when direct paths aren't visible. Reject heuristic reasoning as "not real mathematics."

**Expert Approach**: Comfortable with plausible conjecture before achieving certainty. Use auxiliary problems as stepping stones. Accept that mathematics has two faces—rigorous Euclidean deduction AND experimental inductive discovery.

**Timeline**: Heuristic phase (conjecture, testing) may last hours or days before achieving formal proof; refusing to engage with plausible reasoning prevents any progress.

**Shibboleth**: "We must be ready to revise any one of them [our opinions]. None of our present opinions is perfectly safe, but some are safer than others"

---

### 6. Passive Observation
**Novice Approach**: Treat mathematics as spectator sport—watch teacher solve problems without personally struggling with them.

**Expert Approach**: Problem-solving is a practical skill like swimming, acquired through imitation and practice. Must actively attempt, fail, and develop technique through repeated engagement.

**Timeline**: Skills develop over months/years of active practice; observation alone produces zero capability.

**Shibboleth**: "Mathematics is not a spectator sport. To understand mathematics means to be able to do mathematics."

---

### 7. Teaching Extremes (for educators)
**Novice Teaching**: Either solve problems completely for students (helping too much) or provide no guidance when they're genuinely stuck (helping too little).

**Expert Teaching**: Ask questions students could ask themselves. Provide hints suggesting directions without revealing complete solutions. Let students have a reasonable share of the work and experience discovery.

**Timeline**: Natural help produces breakthrough within minutes while preserving student agency; extreme approaches either prevent learning or create dependency.

**Shibboleth**: "The teacher should put himself in the student's place"—questions should be natural, things the student themselves could have thought of.

## Mental Models

### The Two Faces of Mathematics
Mathematics appears as rigorous Euclidean deduction (finished theorems and proofs) but is created through experimental, inductive discovery (guessing, testing, refining). Teaching only the first face is like teaching swimming through geometry—students never learn to actually do it.

### Stepping Stones
When no direct path from data to unknown exists, don't give up—find intermediate problems that serve as stepping stones. These auxiliary problems create paths where none were visible.

### The Bright Idea as Gestalt Shift
Progress accumulates gradually through mobilization and organization until an "abrupt reorganization of outlook" occurs—sudden confident prevision of the solution path. Like a figure suddenly emerging from noise.

### Problem-Solving as Practical Skill
Like swimming or tennis, acquired through imitation and practice, not mere observation. Must be desirable as mental exercise, not drudgery.

### Fibers in Geometry
Conceiving continuous objects (triangle, tetrahedron) as composed of parallel strips/fibers makes properties like center of gravity accessible through simpler reasoning.

## Key Questions (Shibboleths)

These questions distinguish systematic problem-solvers from novices:

- "What is the unknown? What are the data? What is the condition?"
- "Have you seen a problem with the same unknown? With a similar unknown?"
- "Could you use its result? Could you use its method?"
- "If you cannot solve the proposed problem, have you solved a related one?"
- "Could you solve part of the problem?"
- "Did you use all the data? Did you use the whole condition?"
- "Can you check the result? Can you derive it differently?"
- "Can you use the result or method for some other problem?"

## References
- Source: *How to Solve It: A New Aspect of Mathematical Method* by George Polya (1945)
- Translated from German work developed in the 1930s
- Context: Revolutionary shift in mathematics education—from viewing problem-solving as innate talent to recognizing it as teachable systematic skill