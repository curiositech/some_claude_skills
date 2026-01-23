# HuggingFace Claude Research Report

**Generated**: December 2024
**Source**: HuggingFace Hub - models, datasets, spaces

## Executive Summary

While Anthropic does not host Claude models directly on HuggingFace (they remain proprietary API-only), there is a rich ecosystem of:
- **682 community models** referencing "Claude" (mostly distillations)
- **344 Spaces** with Claude integrations
- **9 official Anthropic datasets** for AI safety research

---

## 1. Official Anthropic Presence

### Organization Profile
- **Status**: Verified company account
- **Team Members**: 60+
- **Public Models**: 0 (Claude is API-only)
- **Datasets**: 9 public datasets

### Key Datasets

| Dataset | Downloads | Purpose |
|---------|-----------|---------|
| **hh-rlhf** | 26.8K | RLHF training with 169K preference pairs |
| **discrim-eval** | 490 | Discrimination testing (18.9K examples) |
| **persuasion** | 249 | Measuring model persuasiveness |
| **model-written-evals** | 1.54K | AI behavior evaluation questions |
| **values-in-the-wild** | 325 | Value alignment research |
| **AnthropicInterviewer** | 4.3K | Latest research dataset |
| **EconomicIndex** | 372 | Economic analysis research |
| **election_questions** | 874 | Political neutrality testing |
| **llm_global_opinions** | 969 | Cross-cultural opinion modeling |

---

## 2. Community Claude-Distilled Models

### Top Distillation Projects

| Model | Creator | Size | Downloads | Description |
|-------|---------|------|-----------|-------------|
| Qwen3-14B-Claude-Sonnet-4.5-Reasoning-Distill-GGUF | TeichAI | 15B | 28.9K | High reasoning distillation |
| claude-3.7-sonnet-reasoning-gemma3-12B | reedmayhew | 12B | 5.36K | Gemma3 + Claude reasoning |
| gpt-oss-20b-claude-4.5-sonnet-high-reasoning-distill | TeichAI | 21B | 5.07K | GPT-OSS distillation |
| Qwen3-30B-A3B-Thinking-Claude-4.5-Sonnet | TeichAI | 31B | 4.78K | MoE reasoning model |
| Mistral-7B-Claude-Chat-GGUF | TheBloke | 7B | 3.46K | Classic Claude-style chat |

### Key Distillation Creators

1. **TeichAI** - Non-profit (2 college students) specializing in Claude distillations
2. **TheBloke** - GGUF quantization expert
3. **reedmayhew** - Reasoning-focused fine-tuning
4. **Norquinal** - Early Claude-style LLaMA adapters

---

## 3. HuggingFace Spaces

### Notable Spaces (344 total)

| Space | Creator | Status | Purpose |
|-------|---------|--------|---------|
| Claude Reads Arxiv | taesiri | Paused | Paper summarization (63 likes) |
| Claude 3.7 Sonnet | Hudcao | Running | Chat interface |
| Gpt Claude Dialogue | ulasdilek | Error | Comparative testing |
| Claude Token Counter | onda | Running | Token estimation tool |

**Note**: Most Claude Spaces are paused or have runtime errors due to API costs/deprecation.

---

## 4. Integration Landscape

### HuggingFace Inference Providers

Claude/Anthropic is **NOT** available through HuggingFace Inference Providers. The platform supports:
- Cerebras, Cohere, Groq, Together AI, Replicate, etc.
- OpenAI-compatible endpoint at `router.huggingface.co`

### Why No Direct Claude Integration?
1. Claude is proprietary (closed weights)
2. Anthropic maintains exclusive API distribution
3. No partnership with HF inference providers

---

## 5. Research Value

### RLHF Training Data

The **hh-rlhf** dataset is foundational:
- 169K human preference pairs
- "Chosen" vs "Rejected" responses
- MIT licensed
- Used to train countless open-source models

### Safety Evaluation
- **discrim-eval**: Tests bias in decision-making
- **persuasion**: Measures manipulation potential
- **model-written-evals**: AI self-assessment questions

---

## 6. Integrations for Skills Project

### High Priority

| Type | Name | URL | Description | Priority |
|------|------|-----|-------------|----------|
| dataset | Anthropic/hh-rlhf | [Link](https://huggingface.co/datasets/Anthropic/hh-rlhf) | 169K preference pairs for RLHF | HIGH |
| model | TeichAI/Qwen3-14B-Claude-Distill | [Link](https://huggingface.co/TeichAI/Qwen3-14B-Claude-Sonnet-4.5-Reasoning-Distill-GGUF) | Claude 4.5 reasoning distilled | HIGH |
| model | reedmayhew/claude-3.7-gemma3-12B | [Link](https://huggingface.co/reedmayhew/claude-3.7-sonnet-reasoning-gemma3-12B) | Gemma3 + Claude reasoning | HIGH |
| org | Anthropic | [Link](https://huggingface.co/Anthropic) | Official org - 9 datasets | HIGH |

### Medium Priority

| Type | Name | Description | Priority |
|------|------|-------------|----------|
| dataset | Anthropic/discrim-eval | 18.9K discrimination examples | MEDIUM |
| dataset | Anthropic/model-written-evals | 3.25K evaluation questions | MEDIUM |
| model | TheBloke/Mistral-7B-Claude-Chat-GGUF | Multiple quantization formats | MEDIUM |

---

## Recommendations

### For Developers
1. Use Anthropic's official API for production Claude access
2. Leverage hh-rlhf for RLHF research
3. Consider TeichAI distillations for local Claude-like reasoning

### For Researchers
1. Explore discrim-eval for bias testing
2. Use model-written-evals for behavioral assessment
3. Reference persuasion dataset for safety research

### Integration Opportunities
1. Build HF Spaces using Claude API (costs apply)
2. Fine-tune open models on Anthropic datasets
3. Create evaluation pipelines using official benchmarks
