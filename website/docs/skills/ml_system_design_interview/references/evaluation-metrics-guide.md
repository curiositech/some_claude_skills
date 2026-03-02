---
title: Evaluation Metrics Guide
sidebar_label: Evaluation Metrics Guide
sidebar_position: 2
---
# Evaluation Metrics Guide

Comprehensive reference for choosing, computing, and aligning ML metrics. Covers offline metrics, online metrics, metric alignment problems, A/B testing, and generative AI evaluation.

---

## Offline Metrics

### Classification Metrics

| Metric | Formula | When to Use | Pitfall |
|--------|---------|-------------|---------|
| **Precision** | TP / (TP + FP) | Cost of false positive is high (spam filter, content moderation auto-remove) | Ignores false negatives entirely |
| **Recall** | TP / (TP + FN) | Cost of false negative is high (fraud detection, medical screening) | Can be gamed by predicting everything positive |
| **F1 Score** | 2 * (P * R) / (P + R) | Need single number balancing precision and recall | Assumes equal cost of FP and FN |
| **F-beta** | (1+B^2) * P * R / (B^2*P + R) | Unequal cost of FP vs FN (beta&gt;1 weights recall higher) | Must choose beta thoughtfully |
| **AUC-ROC** | Area under ROC curve | Compare models threshold-independently, balanced classes | Misleading with extreme class imbalance |
| **AUC-PR** | Area under Precision-Recall curve | Class imbalance (fraud, rare disease) | Harder to interpret than ROC |
| **Log Loss** | -mean(y*log(p) + (1-y)*log(1-p)) | Calibrated probabilities matter (bidding, risk scoring) | Sensitive to confident wrong predictions |
| **Accuracy** | (TP + TN) / Total | Balanced classes only | Useless with class imbalance (99% accuracy on 1% fraud) |

### Ranking Metrics

| Metric | What it Measures | When to Use | Pitfall |
|--------|-----------------|-------------|---------|
| **NDCG@K** | Quality of top-K ranked results, with graded relevance | Search, recommendations with graded relevance (highly relevant > somewhat relevant) | Requires graded relevance labels |
| **MAP** | Average precision across all recall levels | Information retrieval with binary relevance | Less useful with graded relevance |
| **MRR** | Reciprocal rank of first relevant result | Navigational queries, Q&A (one correct answer) | Only considers first hit |
| **Precision@K** | Fraction of top-K that are relevant | When user sees fixed number of results | Ignores ranking order within top-K |
| **Recall@K** | Fraction of all relevant items in top-K | Retrieval stage evaluation (did we find the needle?) | Requires knowing total relevant items |
| **Hit Rate@K** | Whether ANY relevant item appears in top-K | Retrieval stage binary evaluation | Coarse -- does not measure quality |

### Regression / Forecasting Metrics

| Metric | Formula | When to Use | Pitfall |
|--------|---------|-------------|---------|
| **MSE / RMSE** | mean((y - y_hat)^2) | When large errors are disproportionately bad | Sensitive to outliers |
| **MAE** | mean(abs(y - y_hat)) | When all errors are equally important | Less sensitive to outliers than MSE |
| **MAPE** | mean(abs((y - y_hat)/y)) | Need percentage error, interpretable | Undefined when y=0, asymmetric |
| **R-squared** | 1 - SS_res/SS_tot | Explaining variance, comparing models | Can be negative, does not imply causation |

### NLP / Generation Metrics

| Metric | What it Measures | When to Use | Pitfall |
|--------|-----------------|-------------|---------|
| **BLEU** | N-gram overlap with reference | Machine translation (corpus-level) | Poor correlation with human judgment for single sentences |
| **ROUGE-L** | Longest common subsequence | Summarization | Does not capture semantic similarity |
| **BERTScore** | Contextual embedding similarity | Any text generation (better than BLEU/ROUGE) | Requires model inference, not interpretable |
| **Perplexity** | exp(avg negative log-likelihood) | Language model quality (internal evaluation) | Not meaningful for comparing different tokenizers |
| **CIDEr** | TF-IDF weighted n-gram overlap | Image captioning | Requires multiple references |
| **METEOR** | Alignment with synonym/stem matching | Translation, generation | Better than BLEU but still n-gram based |

---

## Online Metrics

### Engagement Metrics

| Metric | Definition | Use Case | Measurement |
|--------|-----------|----------|-------------|
| **CTR** | Clicks / Impressions | Search, ads, recommendations | Per-position, debiased |
| **Engagement Time** | Time spent interacting | Content recommendation, social | Session-level, exclude idle time |
| **Session Length** | Number of actions per session | Product engagement | Count meaningful actions, not page loads |
| **Return Rate** | Users returning within N days | Long-term satisfaction | D1, D7, D30 cohort analysis |
| **Completion Rate** | Finished / Started | Video, articles, courses | Critical for content quality |

### Business Metrics

| Metric | Definition | Use Case | Measurement |
|--------|-----------|----------|-------------|
| **Conversion Rate** | Purchases / Visits | E-commerce, SaaS | Segment by traffic source |
| **Revenue Per Session** | Total revenue / Sessions | E-commerce | Sensitive to outliers (high-value purchases) |
| **Average Order Value** | Revenue / Orders | E-commerce | Can increase while conversion drops |
| **LTV (Lifetime Value)** | Predicted total revenue per user | Subscription, marketplace | Long measurement horizon, use proxies |
| **Churn Rate** | Users leaving / Total users | Subscription | Define "leaving" precisely |

### System Metrics (Guardrails)

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **Latency p50** | Varies by use case | &gt;2x baseline |
| **Latency p99** | Varies by use case | &gt;3x baseline |
| **Error Rate** | &lt;0.1% | &gt;1% |
| **Cache Hit Rate** | &gt;80% | &lt;60% |
| **Throughput (QPS)** | At capacity target | &gt;90% capacity |

---

## Metric Alignment Problem

The gap between offline metrics and online metrics is the central challenge of ML evaluation. Improving offline metrics does NOT guarantee online metric improvement.

### Why Offline Metrics Fail to Predict Online Performance

| Cause | Example | Mitigation |
|-------|---------|------------|
| **Position bias** | Users click top results regardless of relevance. Offline data trained on biased clicks. | Inverse propensity scoring, unbiased learning-to-rank |
| **Novelty effect** | New model serves unfamiliar recommendations. Users click from curiosity, not relevance. | Run A/B test long enough (&gt;2 weeks) to normalize |
| **Presentation bias** | Offline evaluation ignores how results are displayed (thumbnails, snippets) | Include presentation features in evaluation |
| **Distribution shift** | Training data distribution differs from serving distribution | Monitor feature distributions, retrain frequently |
| **Proxy metric gap** | Optimizing CTR reduces time-on-site (users leave after clicking) | Use composite metrics, add guardrails |
| **Selection bias** | Models only see outcomes for items they recommended, not random items | Exploration, counterfactual evaluation |
| **Feedback loops** | Model reinforces its own biases (popularity bias in recommendations) | Inject exploration, evaluate on fresh data |

### Closing the Alignment Gap

1. **Use multiple offline metrics**: Never rely on a single metric. Track precision AND recall AND NDCG.
2. **Evaluate on fresh data**: Use time-based splits (train on past, evaluate on future) not random splits.
3. **Counterfactual evaluation**: Use logged data with inverse propensity weighting to estimate what would happen with a different policy.
4. **Interleaving tests**: Faster signal than A/B testing for ranking comparisons. Requires less traffic.
5. **Guardrail metrics**: Define metrics that must NOT regress even if primary metric improves.
6. **Composite metrics**: Combine multiple signals into a single optimization target (e.g., 0.6*watch_time + 0.3*satisfaction - 0.1*regret).

---

## A/B Testing for ML

### Sample Size Calculation

Before running any A/B test, calculate required sample size:

**Inputs needed**:
- Baseline metric value (e.g., 3.5% conversion rate)
- Minimum detectable effect (MDE) (e.g., 0.2% absolute lift = ~5.7% relative lift)
- Significance level (alpha, typically 0.05)
- Power (1-beta, typically 0.80)

**Rule of thumb**: For a 1% relative lift in a metric with 5% baseline, you need ~1.6M samples per variant. For a 5% relative lift, ~64K samples per variant.

**Practical implication**: Small metric improvements require massive traffic. A 0.1% CTR improvement on 2% CTR baseline needs millions of impressions to detect.

### Duration Considerations

| Factor | Impact | Guideline |
|--------|--------|-----------|
| **Minimum duration** | Day-of-week effects | Always run at least 1 full week |
| **Novelty effect** | Inflates early metrics | Ignore first 3 days, run 2+ weeks |
| **Primacy effect** | Users habituate to changes | Extended observation period (4+ weeks) |
| **Seasonal effects** | Holidays, events | Avoid starting during anomalous periods |
| **Network effects** | Treatment affects control | Use cluster-based randomization |

### Common A/B Testing Mistakes in ML

**1. Peeking at results**
Checking results daily and stopping when significant inflates false positive rate from 5% to 20-30%. Use sequential testing (always-valid p-values) if you must peek.

**2. Running too many experiments simultaneously**
Multiple experiments on the same users create interaction effects. Use layer-based experimentation (Google's Overlapping Experiment Infrastructure).

**3. Wrong randomization unit**
For ML systems: randomize by user, not by request. Same user should always see the same variant. Exception: latency experiments can randomize by request.

**4. Ignoring long-term effects**
ML model improves short-term CTR but degrades long-term user satisfaction. Run holdback groups (1% of users never see new model) for long-term measurement.

**5. Survivorship bias**
Only measuring users who complete a session ignores users who bounced. Include all randomized users in analysis.

**6. Multiple comparison correction**
Testing 20 segments for significance without correction means ~1 will be "significant" by chance. Use Bonferroni correction or FDR control.

### ML-Specific A/B Testing Challenges

**Label delay**: For fraud detection, true labels arrive 30-90 days after prediction. Cannot measure model quality in real-time. Use proxy metrics (review rate, rule trigger rate) with known correlation to true fraud rate.

**Cold-start interaction**: New model has no personalization for existing users. First-session performance may not reflect steady-state. Use burn-in period.

**Model-data feedback loop**: A/B testing a new recommendation model changes what data you collect. Control model's data quality degrades over time if fewer users see it. Time-bound experiments.

---

## Evaluating Generative AI

### Human Evaluation Frameworks

**Side-by-Side Comparison (SxS)**
Show human raters output from Model A and Model B for same input. Rater chooses: A better, B better, or tie. Requires 200-500 comparisons for statistical significance. Expensive but gold standard.

**Likert Scale Rating**
Rate each output independently on 1-5 scale across dimensions:
- Relevance (does it answer the question?)
- Faithfulness (is it supported by the context?)
- Completeness (does it cover all aspects?)
- Coherence (is it well-organized and readable?)
- Harmlessness (does it avoid harmful content?)

**Task Completion**
Measure whether the generated output actually solves the task. Most objective but requires well-defined tasks with verifiable outcomes.

### LLM-as-Judge

Use a capable LLM to evaluate another model's output. Faster and cheaper than human evaluation. Increasingly standard.

**Setup**:
- Judge model should be more capable than evaluated model (or at least different)
- Provide clear evaluation criteria in the judge prompt
- Use structured output (1-5 score + reasoning)
- Calibrate against human judgments on a sample

**Biases to mitigate**:
- Position bias: judge prefers the first response in SxS. Randomize order.
- Verbosity bias: judge prefers longer responses. Instruct to evaluate quality, not length.
- Self-preference bias: judge prefers outputs similar to its own style. Use different model families.

**Validation**:
- Compute agreement rate between LLM-judge and human judges
- Expect 70-85% agreement for well-calibrated judges
- Track cases where LLM-judge disagrees with humans -- these are your blind spots

### Factuality and Hallucination Metrics

| Method | How it Works | Cost | Accuracy |
|--------|-------------|------|----------|
| **Claim extraction + verification** | Extract atomic claims, verify each against source | High (LLM calls per claim) | High |
| **NLI-based** | Use NLI model to check entailment between output and source | Medium | Medium |
| **BERTScore vs source** | Embedding similarity between output and source | Low | Low (semantic not factual) |
| **Self-consistency** | Generate multiple responses, check agreement | Medium | Medium |
| **Citation verification** | Check that cited sources support the claims | Medium | High for cited claims |

**Recommended approach for RAG systems**:
1. Extract claims from the generated answer (LLM call)
2. For each claim, check if any retrieved chunk supports it (NLI model or LLM)
3. Compute faithfulness score = supported claims / total claims
4. Flag unsupported claims for human review

### RAG-Specific Evaluation

| Metric | What it Measures | How to Compute |
|--------|-----------------|----------------|
| **Context Relevance** | Are retrieved chunks relevant to the query? | LLM-judge or embedding similarity |
| **Faithfulness** | Is the answer supported by retrieved context? | Claim extraction + NLI |
| **Answer Relevance** | Does the answer address the query? | LLM-judge |
| **Context Precision** | Of retrieved chunks, how many are relevant? | Human annotation or LLM-judge |
| **Context Recall** | Of all relevant chunks, how many were retrieved? | Requires gold standard set |
| **Noise Robustness** | Does model ignore irrelevant retrieved chunks? | Inject irrelevant chunks, measure faithfulness |

**Evaluation frameworks**: RAGAS, TruLens, DeepEval, Phoenix (Arize). All automate the above metrics.

---

## Metric Decision Tree

Use this to choose metrics for your ML system design interview answer.

```mermaid
flowchart TD
    Start[What is the task?] --> Class{Classification?}
    Class -->|Yes| Imbalance{Class Imbalance?}
    Imbalance -->|Yes| AUCPR[AUC-PR + F-beta]
    Imbalance -->|No| AUCROC[AUC-ROC + F1]
    Class -->|No| Rank{Ranking?}
    Rank -->|Yes| Graded{Graded Relevance?}
    Graded -->|Yes| NDCG[NDCG@K]
    Graded -->|No| SingleAnswer{Single Correct Answer?}
    SingleAnswer -->|Yes| MRR_M[MRR]
    SingleAnswer -->|No| MAP_M[MAP + Precision@K]
    Rank -->|No| Gen{Generation?}
    Gen -->|Yes| HasRef{Has Reference Text?}
    HasRef -->|Yes| RefMetrics[BERTScore + ROUGE]
    HasRef -->|No| RAG{RAG / Grounded?}
    RAG -->|Yes| RAGMetrics[Faithfulness + Context Relevance\n+ Human Eval SxS]
    RAG -->|No| HumanEval[LLM-as-Judge + Human SxS]
    Gen -->|No| Regression{Regression?}
    Regression -->|Yes| Outliers{Outliers Matter?}
    Outliers -->|Yes| RMSE_M[RMSE]
    Outliers -->|No| MAE_M[MAE]
```

### Pairing Offline with Online Metrics

| System | Primary Offline | Primary Online | Guardrail |
|--------|----------------|---------------|-----------|
| Recommendation | NDCG, Recall@K | Watch time, engagement | Diversity, freshness |
| Search ranking | NDCG@10, MRR | CTR, conversion rate | Latency p99, zero-result rate |
| Content moderation | Precision, Recall | Appeal rate, time-to-action | Human review load |
| Fraud detection | AUC-PR, Precision@recall=85% | Fraud loss rate | False positive rate, latency |
| RAG | Faithfulness, Context Recall | User satisfaction, resolution rate | Hallucination rate, latency |
| Ad ranking | AUC-ROC | Revenue per 1000 impressions | User satisfaction, ad load |

---

## Quick Reference: Formulas

**Precision**: TP / (TP + FP)

**Recall**: TP / (TP + FN)

**F1**: 2 * Precision * Recall / (Precision + Recall)

**NDCG@K**: DCG@K / IDCG@K, where DCG@K = sum(rel_i / log2(i+1)) for i in 1..K

**MRR**: 1/|Q| * sum(1/rank_i) for each query

**MAP**: mean of average precisions across queries

**AUC-ROC**: Probability that model scores a random positive higher than a random negative

**Log Loss**: -1/N * sum(y*log(p) + (1-y)*log(1-p))

**PSI (Population Stability Index)**: sum((actual% - expected%) * ln(actual% / expected%)) -- used for data drift detection. PSI &lt; 0.1 = no significant shift, 0.1-0.2 = moderate, &gt;0.2 = significant.
