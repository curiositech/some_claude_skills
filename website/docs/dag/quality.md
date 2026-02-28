---
title: Quality Assurance
description: Output validation, confidence scoring, and hallucination detection in the DAG framework
sidebar_position: 3
---

# Quality Assurance

The DAG framework includes a quality assurance layer that runs after each node completes. It validates outputs against expected schemas, scores confidence in the result, and flags potential hallucinations before propagating outputs to downstream nodes.

## Output Validation

Each node can declare an `outputSchema` using JSON Schema. The validator checks the node's output against this schema before marking the node as completed:

```yaml
nodes:
  - id: extract-entities
    type: skill
    skillId: ai-engineer
    description: "Extract named entities from the document"
    outputSchema:
      type: object
      required: [entities, confidence]
      properties:
        entities:
          type: array
          items:
            type: object
            required: [name, type]
            properties:
              name: { type: string }
              type: { enum: [person, org, location, date] }
        confidence:
          type: number
          minimum: 0
          maximum: 1
```

If validation fails, the node is marked as `failed` with error code `OUTPUT_VALIDATION_FAILED`, triggering any configured retry policy.

## Confidence Scoring

The confidence scorer assigns a 0–1 score to each node output based on:

| Signal | Description |
|--------|-------------|
| Schema compliance | Did the output match the declared schema? |
| Completeness | Did the output fill all required fields with non-empty values? |
| Consistency | Does the output contradict itself internally? |
| Citation check | Are factual claims accompanied by verifiable references? |
| Length heuristic | Is the response suspiciously short or truncated? |

```typescript
import { ConfidenceScorer } from '@site/src/dag/quality';

const scorer = new ConfidenceScorer();
const score = await scorer.score(nodeOutput, {
  schema: node.outputSchema,
  taskDescription: node.description,
  expectedLength: { min: 50, max: 2000 },
});

console.log(score); // { overall: 0.84, breakdown: { schema: 1.0, completeness: 0.9, ... } }
```

Nodes with a confidence score below `0.5` are automatically flagged for review.

## Hallucination Detection

The hallucination detector checks for common failure modes in LLM outputs:

### Pattern-Based Detection

Flags outputs that contain:
- Invented dates, statistics, or citations that don't match any context provided
- Confident assertions about things not mentioned in the input
- Self-contradictions within the same response
- Templated non-answers (e.g. "As an AI I cannot...")

### Cross-Validation

For critical nodes, you can enable cross-validation: the same task is run twice with slightly different prompts, and the outputs are compared for consistency:

```yaml
nodes:
  - id: legal-review
    type: skill
    skillId: 2026-legal-research-agent
    description: "Check if this clause is enforceable in California"
    qualityConfig:
      enableCrossValidation: true
      crossValidationThreshold: 0.8  # outputs must agree 80%
      onLowConfidence: retry          # retry | skip | fail | warn
```

### Configuring Detection Sensitivity

```typescript
import { HallucinationDetector } from '@site/src/dag/quality';

const detector = new HallucinationDetector({
  sensitivityLevel: 'medium',   // low | medium | high
  checkInventedFacts: true,
  checkSelfContradictions: true,
  checkTemplatePhrases: true,
  allowedConfidenceFloor: 0.6,
});
```

## Quality Gates

You can configure quality thresholds that block the pipeline if not met:

```yaml
config:
  qualityGates:
    - stage: after-each-node
      minConfidence: 0.6
      onFail: retry-once-then-fail
    - stage: before-final-output
      minConfidence: 0.75
      onFail: alert-and-continue
```

## Viewing Quality Reports

After a workflow completes, the full quality report is available in the execution result:

```json
{
  "jobId": "job-abc123",
  "status": "completed",
  "quality": {
    "overallConfidence": 0.87,
    "nodeScores": {
      "extract-entities": { "score": 0.92, "hallucinationFlags": [] },
      "summarize": { "score": 0.81, "hallucinationFlags": ["low_citation_density"] }
    },
    "validationErrors": []
  }
}
```

Monitor quality metrics over time in the [Execution Monitor](/dag/monitor).
