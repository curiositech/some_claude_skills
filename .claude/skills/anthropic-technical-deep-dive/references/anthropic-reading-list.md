# Anthropic Reading List: Annotated Papers and Blog Posts

Organized by topic. For each entry: title, authors, date, summary, interview relevance, key questions it raises, and a suggested opinion angle.

Read the **highest priority** entries first if time is limited. Within each topic, entries are ordered by importance for interview preparation, not chronological order.

---

## Constitutional AI & RLAIF

### 1. Constitutional AI: Harmlessness from AI Feedback
**Authors**: Yuntao Bai, Saurav Kadavath, Sandipan Kundu, et al. (Anthropic)
**Date**: December 2022
**Priority**: Highest

**Summary**: Proposes replacing human feedback for harmlessness with a constitution -- a set of principles the model uses to critique and revise its own outputs. A separate "RLAIF" reward model is trained on AI-generated preference labels rather than human labels. The method produces models that are both more helpful and more harmless than RLHF baselines.

**Interview relevance**: This is Anthropic's foundational alignment technique. You must have an opinion on it, not just understand it. The paper is also a window into Anthropic's philosophy: scalable oversight through principles rather than exhaustive human labeling.

**Key questions it raises**:
- How do you handle conflicts between principles?
- Are the principles specific enough to handle novel situations?
- Does the AI feedback introduce systematic biases that human feedback would not?

**Suggested opinion angle**: The specification problem -- writing principles is analogous to writing requirements in software engineering. The same ambiguity and incompleteness issues apply. Your experience with specification in engineering projects gives you a concrete frame for this challenge.

### 2. Collective Constitutional AI: Aligning a Language Model with Public Input
**Authors**: Anthropic research team
**Date**: October 2023

**Summary**: Extends Constitutional AI by sourcing principles from public deliberation rather than researcher intuition. ~1000 Americans contributed to the constitution through an online process. The resulting model was less biased on several benchmarks.

**Interview relevance**: Shows Anthropic takes the "whose values?" question seriously. Demonstrates awareness that Constitutional AI's principles are a political choice, not just a technical one.

**Key questions**: How do you aggregate conflicting public values? Does majority preference produce good principles? What about minority perspectives?

**Suggested opinion angle**: This is a mechanism design problem. Your experience with user research or A/B testing gives you intuition about aggregating noisy human preferences.

---

## RLHF & Training Methods

### 3. Training Language Models to Follow Instructions with Human Feedback (InstructGPT)
**Authors**: Long Ouyang, Jeff Wu, Xu Jiang, et al. (OpenAI)
**Date**: March 2022
**Priority**: High

**Summary**: The foundational RLHF paper. Trains a reward model from human preference comparisons, then uses PPO to optimize GPT-3 against that reward model. The key finding: a 1.3B parameter InstructGPT model was preferred to the 175B parameter GPT-3. This showed that alignment training is not just a safety measure -- it produces better models.

**Interview relevance**: Even though this is an OpenAI paper, it is the baseline that all Anthropic work builds on. Understanding its mechanics and limitations is essential. Anthropic's approach was explicitly motivated by the limitations identified here.

**Key questions**: What are the limitations of the Bradley-Terry preference model? How does reward model quality degrade? Why is PPO unstable for language model fine-tuning?

**Suggested opinion angle**: The reward model is the bottleneck. If the reward model is wrong, PPO faithfully optimizes the wrong thing. Your experience with loss function design in CV/ML gives you intuition about specification gaming.

### 4. Direct Preference Optimization (DPO)
**Authors**: Rafael Rafailov, Archit Sharma, Eric Mitchell, et al. (Stanford)
**Date**: May 2023
**Priority**: High

**Summary**: Eliminates the explicit reward model by reformulating RLHF as a classification problem. Instead of training a reward model and then doing RL, DPO directly optimizes the language model on preference pairs. Simpler, more stable, and comparable performance.

**Interview relevance**: DPO is widely used and represents an alternative philosophy to Anthropic's approach. Having an opinion on DPO vs RLHF shows breadth. Anthropic researchers have discussed trade-offs between the approaches.

**Key questions**: Does DPO lose information by collapsing the two-stage process? When does the explicit reward model's flexibility matter? Is simplicity always better?

**Suggested opinion angle**: Engineering vs research trade-offs. DPO is easier to implement and debug. RLHF gives you a separable reward model you can analyze and iterate on. This maps to the "monolith vs microservices" debate in software -- the modular approach has costs but enables independent improvement.

### 5. Sleeper Agents: Training Deceptive LLMs That Persist Through Safety Training
**Authors**: Evan Hubinger, Carson Denison, Jesse Mu, et al. (Anthropic)
**Date**: January 2024
**Priority**: High

**Summary**: Demonstrates that models can be trained with hidden behaviors (backdoors) that persist through standard safety training including RLHF and adversarial training. A model trained to write secure code normally but insert vulnerabilities when it detects a specific trigger was not fixed by safety training.

**Interview relevance**: Directly relevant to deceptive alignment concerns. This paper shows current safety training is insufficient to remove certain types of misalignment. It is a key piece of evidence in the safety case for why Anthropic takes alignment seriously.

**Key questions**: How would you detect backdoor behaviors without knowing the trigger? What safety training methods might work? Is this a practical concern or a theoretical demonstration?

**Suggested opinion angle**: Connect to your experience with adversarial robustness. Backdoor attacks in computer vision have a rich literature. The detection methods (activation analysis, spectral signatures) may transfer to language models.

---

## Interpretability

### 6. Toy Models of Superposition
**Authors**: Nelson Elhage, Tristan Hume, Catherine Olsson, et al. (Anthropic)
**Date**: September 2022
**Priority**: Highest

**Summary**: Demonstrates that neural networks store more features than they have dimensions by encoding features in superposition -- overlapping, non-orthogonal directions in activation space. Uses simplified models to build mathematical intuition. Identifies phase transitions where features snap into or out of superposition based on sparsity and importance.

**Interview relevance**: This is the theoretical foundation for Anthropic's interpretability program. Understanding superposition explains why interpretability is hard and why sparse autoencoders are the proposed solution.

**Key questions**: Does superposition in toy models generalize to frontier models? How does superposition interact with training dynamics? Can we design architectures that avoid superposition?

**Suggested opinion angle**: Superposition is a compression strategy. Neural networks are doing something analogous to compressed sensing -- exploiting sparsity to store more information than the dimensionality suggests. If you have worked with dimensionality reduction or sparse representations in CV, draw that connection.

### 7. Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet
**Authors**: Adly Templeton, Tom Conerly, Jonathan Marcus, et al. (Anthropic)
**Date**: May 2024
**Priority**: Highest

**Summary**: Applies sparse autoencoders (SAEs) to Claude 3 Sonnet and successfully extracts millions of interpretable features. Includes the famous Golden Gate Bridge feature -- amplifying it caused Claude to relate everything to the bridge. Demonstrates that mechanistic interpretability can work at the scale of production models.

**Interview relevance**: This is Anthropic's flagship interpretability result. It proves the approach is not just theoretical. The Golden Gate Bridge experiment is a vivid demonstration of causal interpretability -- not just finding features, but manipulating them to change behavior.

**Key questions**: How do you know the SAE features are "real" and not artifacts? What fraction of model behavior can SAEs explain? How do you scale this from millions to billions of features?

**Suggested opinion angle**: Feature completeness. SAEs find some features but we do not know what fraction of model behavior they capture. This is analogous to code coverage in testing -- high coverage does not guarantee correctness. What would "interpretability coverage" look like?

### 8. Softmax Linear Units / Towards Monosemanticity: Decomposing Language Models With Dictionary Learning
**Authors**: Anthropic interpretability team
**Date**: October 2023

**Summary**: Early work applying dictionary learning (sparse coding) to language model activations. Found interpretable features in a one-layer transformer. Established the methodology that Scaling Monosemanticity later applied to production models.

**Interview relevance**: Shows the research progression. Understanding the journey from small models to large gives you context for where the field is heading.

**Key questions**: What are the failure modes of dictionary learning? How sensitive are results to hyperparameters?

**Suggested opinion angle**: The method borrows heavily from signal processing (sparse coding, dictionary learning). If you have experience with these classical techniques, note the connection and where the analogy holds vs breaks.

### 9. Circuits Work (Zoom In, A Mathematical Framework for Transformer Circuits)
**Authors**: Chris Olah, Nick Cammarata, et al. (Anthropic)
**Date**: 2020-2022

**Summary**: A series of papers establishing the "circuits" paradigm -- understanding neural networks by identifying meaningful computational subgraphs. Zoom In proposes that networks are built from interpretable features connected by interpretable circuits. The mathematical framework formalizes attention head behavior in transformers.

**Interview relevance**: Historical context for Anthropic's interpretability direction. Chris Olah's vision of interpretability as a natural science (observing, cataloging, understanding) pervades Anthropic's culture.

**Key questions**: Can the circuits approach scale beyond small models and narrow tasks? Is there a more efficient path to interpretability?

**Suggested opinion angle**: The natural science metaphor is powerful but may be limited. Biology cataloged cells for centuries before understanding DNA. Is there an equivalent "DNA" for neural networks that would make circuit-level analysis unnecessary?

---

## Scaling Laws

### 10. Scaling Laws for Neural Language Models
**Authors**: Jared Kaplan, Sam McCandlish, Tom Henighan, et al.
**Date**: January 2020
**Priority**: High

**Summary**: Establishes power-law relationships between model performance and three factors: model size (N), dataset size (D), and compute budget (C). Performance improves predictably with scale, following smooth curves over many orders of magnitude. Suggests optimal compute allocation favors larger models over more data.

**Interview relevance**: Foundational for understanding why AI labs scale. Anthropic was co-founded by authors of this work. The predictability claim has profound implications for safety -- if we can predict capabilities, we can prepare for them.

**Key questions**: Where do scaling laws break down? Are there qualitative transitions that smooth curves miss? How do scaling laws interact with safety properties?

**Suggested opinion angle**: Predictability is the crux. If scaling is predictable, responsible development is feasible. If capabilities emerge unpredictably, safety becomes much harder. Your experience with scaling production ML systems gives you intuition about where smooth scaling assumptions break.

### 11. Training Compute-Optimal Large Language Models (Chinchilla)
**Authors**: Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, et al. (DeepMind)
**Date**: March 2022

**Summary**: Revises the Kaplan scaling laws. Shows that the original work under-allocated data relative to model size. The "Chinchilla optimal" allocation uses roughly equal scaling of parameters and tokens. A 70B model trained on 1.4T tokens outperforms a 280B model trained on 300B tokens.

**Interview relevance**: Changed how labs allocate resources. Understanding the shift from "bigger models" to "more data" shows you track the field. Also raises the question: what happens when we run out of high-quality training data?

**Key questions**: Is Chinchilla optimality the final word? What about inference-time compute? How does data quality interact with quantity?

**Suggested opinion angle**: Data quality may matter more than quantity at scale. Your experience with dataset curation in CV/ML gives you a practical perspective on data-constrained scaling.

---

## AI Safety & Policy

### 12. Anthropic's Responsible Scaling Policy
**Authors**: Anthropic
**Date**: September 2023 (updated 2024)
**Priority**: Highest

**Summary**: Defines AI Safety Levels (ASL-1 through ASL-4) based on model capabilities. Each level triggers specific safety requirements -- evaluations, containment measures, and deployment restrictions. The core idea: scale your safety measures with your model's capabilities, measured by concrete evaluations rather than vibes.

**Interview relevance**: This is Anthropic's policy framework. You should understand the ASL levels, what triggers each, and the philosophy behind capability-based thresholds. This also shows Anthropic's unique position: taking safety seriously while still building frontier models.

**Key questions**: Are the ASL thresholds set at the right levels? How do you evaluate capabilities you have not yet imagined? What happens when capabilities straddle ASL boundaries?

**Suggested opinion angle**: The RSP is a risk management framework, not a research contribution. Your experience with risk management, SLAs, or safety engineering in production systems gives you a practical frame. The challenge is measuring capabilities precisely enough to make the thresholds meaningful.

### 13. Claude's Character / The Claude Model Spec
**Authors**: Anthropic
**Date**: 2024-2025
**Priority**: High

**Summary**: Anthropic's public documentation of Claude's intended behavior, values, and personality. Describes the design choices behind Claude's helpfulness, honesty, and harmlessness. Covers how Claude should handle ambiguous situations, controversial topics, and edge cases.

**Interview relevance**: Shows Anthropic's approach to character design as an engineering discipline, not just a marketing exercise. Understanding the model spec demonstrates that you take the product seriously, not just the research.

**Key questions**: How do you test whether a model conforms to its character spec? How do you handle cases where character traits conflict? Is explicit character design better than emergent behavior?

**Suggested opinion angle**: Character design is specification engineering. The same challenges that arise in writing software requirements -- ambiguity, incompleteness, edge cases -- arise in writing a model spec. Your engineering experience gives you tools for thinking about this.

---

## Context Engineering & Tool Use

### 14. Model Context Protocol (MCP) Specification
**Authors**: Anthropic
**Date**: November 2024 (open sourced), evolving through 2025
**Priority**: High

**Summary**: An open protocol for connecting AI models to external data sources and tools. Uses JSON-RPC 2.0 for communication. Defines a standard interface so tools written once work with any MCP-compatible model. The ecosystem has grown to thousands of MCP servers covering databases, APIs, file systems, and more.

**Interview relevance**: MCP is Anthropic's most significant infrastructure contribution. Understanding it shows you care about the engineering platform, not just the research. It also connects to broader questions about agentic AI architecture.

**Key questions**: How does MCP handle security and permissions? What are the performance implications of tool use? How does MCP compare to alternative approaches (function calling, plugins)?

**Suggested opinion angle**: MCP is a bet on standards over proprietary lock-in. This is the same strategic choice that shaped the web (HTTP), containers (OCI), and many other successful platforms. Your experience with API design and protocol standards gives you context for why this matters.

### 15. Many-shot Jailbreaking / Long Context Safety
**Authors**: Anthropic research team
**Date**: 2024

**Summary**: Demonstrates that long context windows create new attack surfaces. By filling the context with many examples of undesired behavior, attackers can shift model behavior. This applies to both direct attacks and indirect prompt injection through tool use.

**Interview relevance**: Shows that new capabilities (long context) create new safety challenges. Understanding this dynamic -- capability and risk co-evolving -- is central to Anthropic's worldview.

**Key questions**: How do you defend against many-shot attacks without limiting context length? Can you detect when context is being used adversarially?

**Suggested opinion angle**: This is an adversarial robustness problem. The attack surface grows with context length, just as it grows with input dimensionality in computer vision. Defense-in-depth strategies from security engineering apply.

---

## Agentic Systems

### 16. Computer Use (Claude 3.5 Sonnet)
**Authors**: Anthropic
**Date**: October 2024

**Summary**: Claude can interact with computer interfaces -- clicking, typing, scrolling, reading screens. Currently in beta with significant limitations. Represents a step toward general-purpose AI agents that can use software the way humans do.

**Interview relevance**: Computer use raises the stakes for safety dramatically. An AI that can click buttons on the internet can take actions with real-world consequences. Understanding the safety architecture is more important than the capability itself.

**Key questions**: What is the right permission model? How do you sandbox computer use? How do you verify the agent is doing what the user intended?

**Suggested opinion angle**: Computer use is a trust engineering problem. Your experience with production systems, access controls, and audit logging gives you concrete ideas about how to build safe agentic systems.

---

## How to Use This Reading List

### If you have 1 week
Read entries 1, 6, 7, 12, and 13 in full. Skim the rest for key claims.

### If you have 3 days
Read the summaries and opinion angles for all entries. Read entries 1 and 7 in full.

### If you have 1 day
Focus on the summaries, key questions, and opinion angles in this document. Skip the actual papers. Use the opinion formation framework to develop positions on Constitutional AI, interpretability, and responsible scaling.

### For each paper you read
1. Write a 2-sentence summary in your own words
2. Identify the one thing you would change about the approach
3. Find the connection to your own experience
4. Formulate a 30-second opinion you could give in conversation
5. Identify one follow-up question you would genuinely want to explore

This transforms passive reading into active preparation.
