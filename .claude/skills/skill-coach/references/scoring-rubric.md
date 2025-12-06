# Skill Scoring Rubric

Quantitative metrics for evaluating skill quality. Score each category 0-10.

## Scoring Categories

### 1. Activation Precision (0-10)
How accurately does the skill activate?

| Score | Criteria |
|-------|----------|
| 0-2 | No keywords, vague description, activates randomly |
| 3-4 | Some keywords, missing NOT clause, many false positives |
| 5-6 | Good keywords + NOT clause, occasional misfires |
| 7-8 | Precise activation, clear boundaries, &lt;10% false positives |
| 9-10 | Perfect activation, comprehensive exclusions, &lt;2% false positives |

**Quick check**: Count (correct activations) / (total queries) for 10 test queries

### 2. Domain Expertise Depth (0-10)
How much expert knowledge is encoded?

| Score | Criteria |
|-------|----------|
| 0-2 | Generic advice, could be Googled easily |
| 3-4 | Some domain knowledge, no anti-patterns |
| 5-6 | Good expertise, 1-2 anti-patterns, some shibboleths |
| 7-8 | Deep expertise, 3+ anti-patterns, decision trees |
| 9-10 | Expert-level with temporal knowledge, edge cases, and shibboleths |

**Quick check**: Count shibboleths + anti-patterns + decision trees

### 3. Progressive Disclosure (0-10)
How well is information layered?

| Score | Criteria |
|-------|----------|
| 0-2 | Everything in one file, &gt;500 lines, no structure |
| 3-4 | Some structure, still too dense |
| 5-6 | Core in SKILL.md, some refs, ~300-500 lines |
| 7-8 | Clean SKILL.md &lt;300 lines, refs for deep dives |
| 9-10 | Optimal: &lt;200 line core, refs load on-demand |

**Quick check**: `wc -l SKILL.md` → Target &lt;300

### 4. Self-Containment (0-10)
Does the skill ship working tools?

| Score | Criteria |
|-------|----------|
| 0-2 | Instructions only, user must implement everything |
| 3-4 | Mentions tools but doesn't include them |
| 5-6 | Has scripts but they're templates |
| 7-8 | Working scripts, no phantom tools |
| 9-10 | Complete tooling: scripts, validation, maybe MCP |

**Quick check**: Run `check_self_contained.py`

### 5. Maintainability (0-10)
How easy is the skill to update?

| Score | Criteria |
|-------|----------|
| 0-2 | No CHANGELOG, no versioning, no structure |
| 3-4 | Basic structure, no versioning |
| 5-6 | Has CHANGELOG, some documentation |
| 7-8 | Versioned, documented, modular references |
| 9-10 | SemVer, complete changelog, validation scripts |

**Quick check**: Has CHANGELOG.md? Uses semantic versioning?

---

## Composite Score

**Formula**: (Σ category scores) / 5

| Total | Grade | Meaning |
|-------|-------|---------|
| 9-10 | A | Production-ready, exemplary |
| 7-8.9 | B | Good quality, minor improvements possible |
| 5-6.9 | C | Functional but needs work |
| 3-4.9 | D | Significant issues, needs revision |
| 0-2.9 | F | Not ready for use |

## Example Evaluation

```
Skill: clip-aware-embeddings
------------------------------
Activation Precision:    9/10 (clear NOT clause, specific triggers)
Domain Expertise Depth:  8/10 (shibboleths, anti-patterns, temporal)
Progressive Disclosure:  8/10 (~150 line core, refs for details)
Self-Containment:        7/10 (working scripts, no MCP)
Maintainability:         7/10 (versioned, has CHANGELOG)
------------------------------
Composite Score:         7.8/10 (Grade: B)
```

## Automation

Run validation scripts for automated scoring:
```bash
# Structure + content checks
python scripts/validate_skill.py /path/to/skill

# Self-containment check
python scripts/check_self_contained.py /path/to/skill
```
