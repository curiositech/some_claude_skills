---
title: Skill Scoring Rubric
sidebar_label: Skill Scoring Rubric
sidebar_position: 1
---
# Skill Scoring Rubric

## Overview

This rubric defines how skill invocations are scored for quality, enabling data-driven improvement of the skill ecosystem.

## Multi-Dimensional Scoring Model

### Score Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    SKILL QUALITY SCORE (0-100)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COMPLETION (25%)        EFFICIENCY (20%)                        │
│  ├─ Task completed?      ├─ Token economy                       │
│  ├─ No errors?           ├─ Tool call efficiency                │
│  └─ Graceful recovery?   └─ Response time                       │
│                                                                  │
│  OUTPUT QUALITY (30%)    USER SATISFACTION (25%)                 │
│  ├─ Accuracy             ├─ Accepted without edits?             │
│  ├─ Completeness         ├─ Follow-up needed?                   │
│  └─ Code quality (if applicable) └─ Explicit feedback           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Completion Score (25 points max)

| Outcome | Points | Description |
|---------|--------|-------------|
| Full completion, no errors | 25 | Task completed exactly as requested |
| Completion with recovery | 20 | Hit error but recovered gracefully |
| Partial completion | 15 | Some of the task accomplished |
| Completion with workaround | 10 | Achieved goal via alternative path |
| Failed but informative | 5 | Couldn't complete but explained why |
| Hard failure | 0 | Crashed, hung, or produced nothing |

```python
def score_completion(invocation: dict) -> int:
    """Score task completion (0-25 points)."""

    errors = invocation.get('errors', [])
    recovered = invocation.get('recovered', False)
    partial = invocation.get('partial_completion', False)

    if not errors:
        return 25  # Perfect completion

    if recovered:
        return 20  # Recovered from error

    if partial:
        return 15  # Partial completion

    if invocation.get('workaround_used'):
        return 10  # Alternative path

    if invocation.get('failure_explained'):
        return 5   # At least explained the issue

    return 0  # Hard failure
```

### 2. Efficiency Score (20 points max)

| Metric | Max Points | Calculation |
|--------|------------|-------------|
| Token efficiency | 8 | `8 * min(1, baseline_tokens / actual_tokens)` |
| Tool call efficiency | 6 | `6 * min(1, baseline_calls / actual_calls)` |
| Response time | 6 | `6 * min(1, baseline_time / actual_time)` |

```python
# Baseline values by skill category
EFFICIENCY_BASELINES = {
    'code_generation': {
        'tokens_per_loc': 50,      # Tokens per line of code generated
        'calls_per_file': 3,       # Tool calls per file modified
        'time_per_task': 30_000,   # Milliseconds per typical task
    },
    'analysis': {
        'tokens_per_insight': 200,
        'calls_per_analysis': 5,
        'time_per_task': 20_000,
    },
    'design': {
        'tokens_per_component': 150,
        'calls_per_design': 4,
        'time_per_task': 45_000,
    },
    'research': {
        'tokens_per_finding': 100,
        'calls_per_search': 8,
        'time_per_task': 60_000,
    },
}

def score_efficiency(invocation: dict, skill_category: str) -> int:
    """Score efficiency (0-20 points)."""

    baselines = EFFICIENCY_BASELINES.get(skill_category, EFFICIENCY_BASELINES['analysis'])

    # Token efficiency (0-8 points)
    actual_tokens = invocation['tokens_used']
    output_size = invocation.get('output_size', 1)  # LOC, components, etc.
    expected_tokens = baselines['tokens_per_loc'] * output_size
    token_score = 8 * min(1.0, expected_tokens / max(actual_tokens, 1))

    # Tool call efficiency (0-6 points)
    actual_calls = len(invocation.get('tool_calls', []))
    expected_calls = baselines['calls_per_file'] * invocation.get('files_changed', 1)
    call_score = 6 * min(1.0, expected_calls / max(actual_calls, 1))

    # Response time (0-6 points)
    actual_time = invocation['duration_ms']
    expected_time = baselines['time_per_task']
    time_score = 6 * min(1.0, expected_time / max(actual_time, 1))

    return int(token_score + call_score + time_score)
```

### 3. Output Quality Score (30 points max)

| Metric | Max Points | Description |
|--------|------------|-------------|
| Accuracy | 12 | Output is correct and appropriate |
| Completeness | 10 | All aspects of request addressed |
| Code quality | 8 | Clean, idiomatic, no obvious bugs |

```python
def score_output_quality(invocation: dict, feedback: dict = None) -> int:
    """Score output quality (0-30 points)."""

    total = 0

    # Accuracy (0-12 points)
    if feedback:
        # Direct user feedback
        if feedback.get('accurate') == True:
            total += 12
        elif feedback.get('mostly_accurate'):
            total += 9
        elif feedback.get('partially_accurate'):
            total += 6
    else:
        # Heuristic scoring
        if invocation.get('output_validated'):
            total += 12
        elif not invocation.get('errors'):
            total += 8  # Assume reasonable accuracy if no errors

    # Completeness (0-10 points)
    requested_items = invocation.get('requested_items', 1)
    delivered_items = invocation.get('delivered_items', 1)
    completeness_ratio = delivered_items / max(requested_items, 1)
    total += int(10 * min(1.0, completeness_ratio))

    # Code quality (0-8 points) - if applicable
    if invocation.get('output_type') == 'code':
        quality_signals = invocation.get('code_quality', {})

        # Linter passed
        if quality_signals.get('linter_passed', True):
            total += 3

        # Type safe
        if quality_signals.get('types_valid', True):
            total += 2

        # Tests pass (if tests were run)
        if quality_signals.get('tests_passed'):
            total += 3
    else:
        total += 8  # Full points for non-code output

    return total
```

### 4. User Satisfaction Score (25 points max)

| Signal | Max Points | Description |
|--------|------------|-------------|
| Accepted as-is | 10 | User used output without modification |
| Edit ratio | 8 | `8 * (1 - edit_ratio)` |
| No follow-up | 7 | User didn't need to ask for fixes |

```python
def score_user_satisfaction(invocation: dict, follow_ups: list = None) -> int:
    """Score user satisfaction (0-25 points)."""

    total = 0

    # Accepted without changes (0-10 points)
    if invocation.get('user_accepted'):
        if invocation.get('user_edit_ratio', 0) < 0.05:
            total += 10  # Accepted as-is
        else:
            total += 7   # Accepted with minor edits
    elif invocation.get('user_used_output'):
        total += 5       # Used but modified

    # Edit ratio (0-8 points)
    edit_ratio = invocation.get('user_edit_ratio', 0.5)
    total += int(8 * (1 - min(edit_ratio, 1.0)))

    # No follow-up needed (0-7 points)
    if follow_ups is None or len(follow_ups) == 0:
        total += 7
    elif len(follow_ups) == 1:
        total += 4  # One clarifying question is okay
    elif all(f.get('resolved') for f in follow_ups):
        total += 2  # Follow-ups were resolved

    return total
```

## Score Interpretation

### Quality Tiers

| Score Range | Tier | Description | Action |
|-------------|------|-------------|--------|
| 90-100 | Excellent | Exceptional performance | Document as exemplar |
| 75-89 | Good | Meets expectations | Monitor for consistency |
| 60-74 | Acceptable | Room for improvement | Review for patterns |
| 40-59 | Below Average | Significant issues | Prioritize improvements |
| 20-39 | Poor | Major problems | Immediate attention needed |
| 0-19 | Failing | Critical failure | Investigate root cause |

### Trend Analysis

```python
def analyze_skill_trends(skill_name: str, days: int = 30) -> dict:
    """Analyze quality trends for a skill."""

    # Get recent invocations
    invocations = get_invocations(skill_name, days=days)

    if len(invocations) < 10:
        return {'status': 'insufficient_data'}

    # Calculate rolling averages
    scores = [inv['quality_score'] for inv in invocations]
    recent_avg = np.mean(scores[-7:])    # Last week
    previous_avg = np.mean(scores[:-7])  # Before that

    # Trend detection
    trend = 'stable'
    change_pct = (recent_avg - previous_avg) / max(previous_avg, 1) * 100

    if change_pct > 10:
        trend = 'improving'
    elif change_pct < -10:
        trend = 'declining'

    # Identify weak components
    component_avgs = {
        'completion': np.mean([inv['scores']['completion'] for inv in invocations]),
        'efficiency': np.mean([inv['scores']['efficiency'] for inv in invocations]),
        'quality': np.mean([inv['scores']['quality'] for inv in invocations]),
        'satisfaction': np.mean([inv['scores']['satisfaction'] for inv in invocations]),
    }

    weak_component = min(component_avgs, key=lambda k: component_avgs[k] / COMPONENT_MAX[k])

    return {
        'current_avg': recent_avg,
        'previous_avg': previous_avg,
        'trend': trend,
        'change_percent': change_pct,
        'weak_component': weak_component,
        'component_scores': component_avgs,
        'recommendation': get_improvement_recommendation(weak_component, component_avgs[weak_component])
    }

def get_improvement_recommendation(component: str, score: float) -> str:
    """Get specific improvement recommendation based on weak component."""

    recommendations = {
        'completion': {
            'low': 'Add more error handling and recovery patterns to SKILL.md',
            'medium': 'Review common failure cases and add guidance',
        },
        'efficiency': {
            'low': 'Reduce context size, consider progressive disclosure',
            'medium': 'Optimize tool call patterns, reduce unnecessary reads',
        },
        'quality': {
            'low': 'Add more examples and anti-patterns to skill',
            'medium': 'Include validation steps in skill workflow',
        },
        'satisfaction': {
            'low': 'Gather user feedback, analyze edit patterns',
            'medium': 'Add clarifying questions to skill workflow',
        },
    }

    level = 'low' if score < 50 else 'medium'
    return recommendations.get(component, {}).get(level, 'Review skill performance')
```

## Automated Quality Gates

```python
QUALITY_GATES = {
    'publish': {
        'min_score': 70,
        'min_invocations': 10,
        'max_error_rate': 0.1,
        'description': 'Minimum requirements to publish a skill'
    },
    'feature': {
        'min_score': 85,
        'min_invocations': 50,
        'max_error_rate': 0.05,
        'description': 'Requirements to be featured in showcase'
    },
    'deprecation': {
        'max_score': 40,
        'min_invocations': 20,
        'max_age_without_improvement': 90,
        'description': 'Triggers deprecation review'
    }
}

def check_quality_gate(skill_name: str, gate: str) -> dict:
    """Check if skill passes a quality gate."""

    gate_config = QUALITY_GATES[gate]
    stats = get_skill_stats(skill_name)

    passed = True
    failures = []

    if stats['avg_score'] < gate_config.get('min_score', 0):
        passed = False
        failures.append(f"Score {stats['avg_score']:.1f} < {gate_config['min_score']}")

    if stats['invocation_count'] < gate_config.get('min_invocations', 0):
        passed = False
        failures.append(f"Invocations {stats['invocation_count']} < {gate_config['min_invocations']}")

    if stats['error_rate'] > gate_config.get('max_error_rate', 1.0):
        passed = False
        failures.append(f"Error rate {stats['error_rate']:.2%} > {gate_config['max_error_rate']:.2%}")

    return {
        'gate': gate,
        'passed': passed,
        'failures': failures,
        'stats': stats
    }
```

## Dashboard Queries

```sql
-- Skill leaderboard
SELECT
    skill_name,
    COUNT(*) as uses,
    AVG(quality_score) as avg_score,
    AVG(completion_score) as avg_completion,
    AVG(efficiency_score) as avg_efficiency,
    AVG(quality_score_component) as avg_quality,
    AVG(satisfaction_score) as avg_satisfaction
FROM skill_invocations
WHERE timestamp > datetime('now', '-30 days')
GROUP BY skill_name
HAVING uses >= 5
ORDER BY avg_score DESC;

-- Quality distribution
SELECT
    skill_name,
    CASE
        WHEN quality_score >= 90 THEN 'Excellent'
        WHEN quality_score >= 75 THEN 'Good'
        WHEN quality_score >= 60 THEN 'Acceptable'
        WHEN quality_score >= 40 THEN 'Below Average'
        ELSE 'Poor'
    END as tier,
    COUNT(*) as count
FROM skill_invocations
WHERE timestamp > datetime('now', '-30 days')
GROUP BY skill_name, tier;

-- Improvement opportunities
SELECT
    skill_name,
    'completion' as weak_area,
    AVG(completion_score) / 25.0 as normalized_score
FROM skill_invocations
WHERE timestamp > datetime('now', '-30 days')
GROUP BY skill_name
HAVING normalized_score < 0.7

UNION ALL

SELECT
    skill_name,
    'efficiency' as weak_area,
    AVG(efficiency_score) / 20.0 as normalized_score
FROM skill_invocations
WHERE timestamp > datetime('now', '-30 days')
GROUP BY skill_name
HAVING normalized_score < 0.7

ORDER BY normalized_score ASC;
```
