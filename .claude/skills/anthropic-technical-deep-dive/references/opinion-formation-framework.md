# Opinion Formation Framework

How to develop genuine, defensible technical opinions for Anthropic interviews -- not rehearsed talking points, but positions you actually hold and can defend under pressure.

---

## Why Opinions Matter More Than Knowledge

Anthropic interviewers are smart. They can tell the difference between "I read the paper" and "I have thought about this problem." Knowledge is table stakes; opinions demonstrate intellectual engagement. The candidate who says "I think Constitutional AI has an under-explored specification problem, and here is why based on my experience" is more compelling than the one who says "Constitutional AI is a technique where..."

---

## The Six-Step Opinion Development Process

### Step 1: Understand the Problem Being Solved

Before forming an opinion on a solution, understand the problem it addresses. Most weak opinions come from reacting to the solution without understanding the problem space.

**Exercise**: For any Anthropic research area, write one paragraph answering: "What problem does this solve, and why is the problem hard?"

**Example -- Constitutional AI**:
- **Problem**: RLHF requires extensive human labeling to make models safe. Labeling is expensive, slow, inconsistent, and hard to scale. Different labelers have different values. You cannot label enough examples to cover all possible situations.
- **Why it is hard**: Safety is not a single objective. "Be helpful" and "be harmless" conflict. You need a way to specify values that generalizes to novel situations without requiring exhaustive enumeration.

### Step 2: Identify the Key Assumptions

Every solution rests on assumptions. Identifying them is the fastest path to a genuine opinion because you can evaluate whether the assumptions hold.

**Exercise**: List 3-5 assumptions the approach makes. For each, ask: "When might this assumption fail?"

**Example -- Constitutional AI assumptions**:
1. Principles can be written clearly enough to resolve ambiguous cases (fails when principles are vague or conflict)
2. The model can accurately apply principles to its own outputs (fails if the model misunderstands the principle or its own output)
3. AI feedback is a reasonable proxy for human feedback (fails if AI feedback has systematic biases humans would catch)
4. The set of principles can be made complete enough to cover important cases (fails for novel situations the principle authors did not anticipate)
5. Principle-based self-critique scales better than human labeling (may fail if principle application becomes increasingly unreliable at scale)

### Step 3: Find Where Your Experience Intersects

This is the step that transforms a generic opinion into a personal one. Your 15 years of ML/CV/AI experience gives you concrete reference points.

**Exercise**: For each assumption, ask: "Have I seen something like this in my own work?" Be specific -- name the project, the technology, the outcome.

**Example bridges**:
- "Principles that resolve ambiguous cases" maps to multi-objective loss functions. In a content moderation system, I had to balance false positive rate against false negative rate, and no single threshold worked for all content types. We ended up with per-category thresholds -- Constitutional AI may need per-domain principle sets.
- "AI feedback as proxy for human feedback" maps to knowledge distillation. I have used larger models to generate labels for smaller models, and the systematic errors of the teacher propagate to the student. The same risk applies to RLAIF.
- "Scaling self-critique" maps to self-supervised learning. In CV, self-supervised methods plateau when the pretext task does not capture the right structure. Self-critique may plateau when the model cannot identify its own failure modes.

### Step 4: Formulate a Specific, Falsifiable Claim

A good interview opinion is specific enough to be wrong. "Constitutional AI is interesting" is not an opinion. "Constitutional AI's principle-based approach will need to evolve toward dynamic, context-dependent principle weighting, similar to how content moderation systems evolved from global rules to per-context policies" is an opinion.

**Template**: "I think [specific claim] because [evidence from your experience or reasoning]. I would update this belief if [specific counter-evidence]."

**Example**:
"I think Constitutional AI works well for cases where principles clearly apply but will struggle with edge cases where principles conflict or are ambiguous. My experience with multi-objective optimization in computer vision showed that ranked priority rules break down when you encounter situations the rule designers did not anticipate. I would update this belief if someone demonstrated a formal method for detecting and resolving principle conflicts at scale."

### Step 5: Anticipate the Strongest Counter-Argument

This is what separates a thoughtful opinion from a position paper. Interviewers will probe your claims. Having the counter-argument ready shows intellectual honesty.

**Exercise**: Ask yourself "What would a smart person who disagrees say?" Then decide whether you update or hold your position.

**Example counter-argument**:
"Someone could argue that principle conflicts are rare in practice and the system works well enough for the vast majority of cases -- the 99% case. They might point to empirical results showing Constitutional AI models are both more helpful and more harmless than RLHF baselines."

**Your response**: "That is fair for the current evaluation benchmarks. My concern is about the long tail -- the 1% of cases where principles genuinely conflict are often the highest-stakes situations. Content moderation systems also looked good on average metrics while failing badly on edge cases. I would want to see evaluation specifically targeting principle conflict scenarios."

### Step 6: Practice Articulating at Three Timescales

Interviews have different rhythms. Sometimes you get 30 seconds, sometimes 5 minutes. Practice both.

**30-second version** (elevator pitch):
"I think Constitutional AI elegantly solves the scaling problem for alignment but introduces a specification problem. Writing principles that handle edge cases is hard -- I have seen the same challenge in multi-objective optimization. I am curious about formal methods for detecting principle conflicts."

**2-minute version** (standard answer):
The 30-second version plus: specific example from your experience, the key assumption you think is most vulnerable, and one open question you would want to investigate.

**5-minute version** (deep discussion):
The 2-minute version plus: engagement with counter-arguments, connection to broader trends in AI safety, and a concrete proposal for how you would test your claim.

---

## Worked Examples

### Developing an Opinion on Interpretability

**Step 1 -- The problem**: We do not understand how neural networks represent and process information. This matters for safety because you cannot trust a system you cannot inspect. It matters for capability because understanding mechanisms could enable targeted improvement.

**Step 2 -- Key assumptions of the SAE approach**:
1. Meaningful features exist as linear directions in activation space
2. Features are sparse (most features are inactive for most inputs)
3. Sparse autoencoders can recover these features from superposition
4. The recovered features are causally relevant to model behavior
5. This approach scales to frontier model size

**Step 3 -- Experience intersection**:
- Feature visualization in CNNs (Grad-CAM, saliency maps) is the ancestor. I used these for model debugging in production CV systems. They were useful for finding obvious failures but unreliable for understanding subtle behavior. SAEs may face the same limitation.
- Dimensionality reduction (PCA, t-SNE, UMAP) for understanding embedding spaces. The key lesson: the representation you find depends on the method you use. Different SAE architectures may find different features.
- Sparse coding in signal processing. I studied this in grad school. The theory is well-understood for linear systems but neural networks are non-linear. How much of the theory transfers?

**Step 4 -- Specific claim**:
"I think sparse autoencoders are the right starting point for interpretability but will need to evolve toward methods that capture feature interactions, not just individual features. In my experience with feature visualization in CV, understanding individual features was necessary but insufficient -- the interesting behavior emerged from feature combinations. I would update this belief if someone demonstrated that individual SAE features account for a large fraction of model behavior in causal intervention experiments."

**Step 5 -- Counter-argument**:
"The Golden Gate Bridge experiment showed that amplifying a single feature dramatically changed behavior. This suggests individual features are more causally powerful than I am giving credit for."

**Response**: "That is a compelling example for a highly monosemantic feature. My concern is about polysemantic features and feature interactions. The Golden Gate Bridge feature is unusual precisely because it is so clean. Most important model behaviors probably involve combinations of features. I would want to see similar causal experiments on more abstract or compositional behaviors."

**Step 6 -- 30-second version**:
"SAEs are an exciting approach to interpretability, and the Golden Gate Bridge experiment proved they can find causally relevant features. But I think we need to go beyond individual features to feature interactions. My experience with feature visualization in computer vision showed that interesting behavior emerges from feature combinations, not individual activations. I am curious about how to scale interaction analysis."

---

### Developing an Opinion on Scaling Laws

**Step 1 -- The problem**: We need to predict how model capabilities scale with compute, data, and parameters so we can plan training runs (billions of dollars) and anticipate safety implications.

**Step 2 -- Key assumptions**:
1. Performance follows smooth power laws across many orders of magnitude
2. The relevant metric (cross-entropy loss) captures capability well
3. Optimal compute allocation is predictable
4. There are no qualitative transitions (emergent capabilities) that break smooth scaling
5. Current trends will continue into the future

**Step 3 -- Experience intersection**:
- Scaling production ML systems: I have seen diminishing returns in data augmentation, model size, and training time. The smooth curves in research papers often hide messy plateaus and phase transitions in practice.
- Transfer learning: I have observed that transfer learning benefits scale with model size, but the relationship is not always smooth. There are minimum viable scales below which transfer does not work.
- Data quality: In every production ML project I have worked on, data quality eventually mattered more than data quantity. The Chinchilla correction (more data, smaller model) partially captures this, but data quality is a separate dimension.

**Step 4 -- Specific claim**:
"I think scaling laws are descriptive, not prescriptive -- they describe what has happened but do not guarantee what will happen. The smooth power law curves are an artifact of measuring loss, which is a coarse average. Capability-specific scaling may be much less smooth. I would update this belief if someone demonstrated power-law scaling for specific capabilities (not just aggregate loss) across many orders of magnitude."

**Step 5 -- Counter-argument**:
"Scaling laws have been remarkably predictive for multiple generations of models across different architectures and datasets. The empirical evidence is strong."

**Response**: "The evidence for loss scaling is strong. But loss is not what we care about for safety -- we care about specific capabilities and behaviors. The emergent abilities debate shows that capability scaling may not follow the same smooth curves. I think the predictability of loss scaling is somewhat illusory comfort for safety purposes."

---

### Developing an Opinion on the Responsible Scaling Policy

**Step 1 -- The problem**: How do you develop increasingly powerful AI systems safely? You need a framework that scales safety measures with capability, measured by concrete evaluations rather than intuition.

**Step 2 -- Key assumptions**:
1. You can identify meaningful capability thresholds
2. You can evaluate capabilities reliably before deployment
3. Safety measures can be defined in advance for each threshold
4. The framework is flexible enough to adapt as understanding improves
5. The organization will actually follow the policy under competitive pressure

**Step 3 -- Experience intersection**:
- SLA and risk management: I have designed tiered risk management frameworks for production ML systems. The challenge is always defining thresholds -- too conservative and you never ship, too aggressive and you have incidents. RSP faces the same calibration challenge.
- Evaluation infrastructure: I have built evaluation pipelines for ML models. The hardest part is evaluating capabilities you have not seen yet. Red teaming helps but is limited by the imagination of the red teamers.
- Organizational incentives: I have seen safety processes undermined by competitive pressure. The RSP is only as strong as the organization's commitment to following it when it is inconvenient.

**Step 4 -- Specific claim**:
"I think the RSP is the right framework but the ASL thresholds are necessarily imprecise. The hardest challenge is not defining the levels -- it is building evaluation infrastructure that can reliably detect when a model crosses a threshold, especially for capabilities that emerge unexpectedly. I would update this belief if someone demonstrated a comprehensive capability evaluation suite that reliably predicted model behavior."

---

## Opinion Templates That Avoid Sounding Rehearsed

### The Bridge Template
"In my work on [specific project/domain], I encountered [analogous problem]. We found that [specific outcome]. I think the same dynamic applies to [Anthropic topic] because [reasoning]. The key difference is [where the analogy breaks]."

### The Trade-off Template
"I see [topic] as fundamentally a trade-off between [A] and [B]. Most discussions focus on [A], but in my experience [B] is actually the harder problem because [reasoning]. Here is how I would approach the trade-off: [specific proposal]."

### The Evolution Template
"I think [current approach] is the right starting point but will need to evolve toward [future direction]. In [my domain], we saw a similar evolution from [early approach] to [mature approach]. The trigger for evolution was [specific limitation]. I expect [topic] to hit the same limitation when [condition]."

### The Measurement Template
"The key question about [topic] is how to measure [specific thing]. Without good measurement, we are relying on intuition. In my experience with [measurement challenge], we learned that [specific lesson]. I would apply the same approach to [topic] by [specific proposal]."

### The Skepticism Template
"I am excited about [topic] but specifically skeptical about [narrow aspect]. The reason is [evidence or reasoning]. I would be convinced otherwise if [specific counter-evidence]. This is not a fundamental objection -- it is a concern about [scope/scale/generalization]."

---

## Common Pitfalls in Opinion Formation

### The Hedge Trap
Hedging too much makes you sound uncertain about everything. "It is an interesting approach with some limitations" is not an opinion. Pick a side and defend it, while being honest about uncertainty.

### The Recency Trap
Forming opinions based only on the most recent paper or blog post. Interviewers can tell when your opinion is 48 hours old. Genuine opinions are built over time from multiple sources.

### The Agreement Trap
Agreeing with everything Anthropic does is suspicious. They know their work has limitations. A candidate who identifies real limitations demonstrates deeper understanding than one who enthusiastically agrees with everything.

### The Irrelevance Trap
Connecting your experience to every topic, even when the connection is weak. A strong "I do not have direct experience with this, but here is how I think about it from first principles" beats a weak analogy.

### The Jargon Trap
Using technical terms without understanding them. Interviewers will follow up on any term you use. Only use terms you can define and discuss in depth.
