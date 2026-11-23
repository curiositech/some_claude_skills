# Review decisions — learning sequence and title chrome

This reference turns two high-confusion findings into editorial decisions. It is about reader fit and evidence, not about identifying an author. A visual or structural resemblance to common model output is a low-confidence review lead; a broken interaction, unsupported claim, incorrect calculation, or inaccessible hierarchy is a defect to repair regardless of provenance.

## Decision tree: educational sequencing

```text
What must the learner be able to do after this material?
├─ The learner must recall a name, fact, or symbol
│  ├─ Is the item defined in the learner's language before first use?
│  │  ├─ no -> define it, then ask for retrieval without showing the answer
│  │  └─ yes -> continue
│  └─ Is there a delayed retrieval opportunity with feedback?
│     ├─ no -> add one; do not count rereading or a recap box as retrieval
│     └─ yes -> inspect the feedback for the error's next operation
├─ The learner must perform a procedure or calculation
│  ├─ Can a novice see the target, the inputs, and the unit of the answer?
│  │  ├─ no -> state the target and units; choose a small, checked example
│  │  └─ yes -> continue
│  ├─ Is there one complete worked example with arithmetic or state transitions visible?
│  │  ├─ no -> add it; a definition plus "apply the method" is not a worked example
│  │  └─ yes -> continue
│  ├─ Does the learner attempt a near-miss that differs by one conceptual error?
│  │  ├─ no -> add a diagnosis task and explain the denominator/assumption/state that changes
│  │  └─ yes -> continue
│  ├─ Can faded support move across attempts (full path -> partial cues -> no cues)?
│  │  ├─ no -> stage the prompts; do not jump from demonstration to blank test
│  │  └─ yes -> continue
│  └─ Is there a no-answer-visible transfer problem in a changed context?
│     ├─ no -> add one, then collect the response before revealing feedback
│     └─ yes -> verify the transfer preserves the deep structure and changes the surface story
└─ The learner must explain, compare, or critique
   ├─ Is there a concrete case or artifact to inspect?
   │  ├─ no -> replace abstractions with a bounded case, excerpt, diagram, or data table
   │  └─ yes -> continue
   ├─ Is the response prompt asking for evidence and reasoning, rather than a slogan?
   │  ├─ no -> rewrite the prompt to require a cited observation or calculation
   │  └─ yes -> continue
   └─ Does feedback distinguish missing evidence, misapplied concept, and scope error?
      ├─ no -> write those feedback branches
      └─ yes -> ship the sequence after accessibility and rendering checks
```

The tree is a design aid. It does not impose a fixed number of examples or claim that every learner needs identical fading. [*How People Learn II*](https://www.nationalacademies.org/read/24783/chapter/7) reviews retrieval and spacing evidence across materials and learners; its transfer discussion explains why context-bound examples may fail to support flexible application ([chapter 15](https://www.nationalacademies.org/read/9853/chapter/15)). For conditional probability, a natural-frequency representation is a defensible novice choice because [Gigerenzer and Hoffrage's study](https://doi.org/10.1037/0033-295X.102.4.684) and later work such as [Hoffrage et al.](https://doi.org/10.3389/fpsyg.2015.01473) examine why counts can make Bayesian reasoning easier. These sources justify instructional options, not a universal lesson template.

### Genre exceptions and content-measured constraints

- **Expert books and reference notes:** a definition, notation table, theorem statement, or short recap may be intentionally compressed. Do not add a novice worked example when the reader is expected to consult a reference. Check whether the surrounding book supplies prerequisites and examples elsewhere.
- **Research papers:** an abstract, methods, results, limitations, and conclusion repeat selected information by design. Judge whether each section performs its reporting role and whether the claim's population, measure, and causal scope match the evidence. A conclusion that repeats the result while adding a limitation is not empty recap.
- **Class materials:** novices need more explicit sequencing, but inspect the actual objective and response path. A “key takeaway” box is useful when it compresses a lesson after reasoning; it is redundant when it precedes and repeats the same sentence without supporting an action.
- **Venue templates and accessibility patterns:** a caption above an H1 can be a legitimate group/page relation. [GOV.UK's heading guidance](https://design-system.service.gov.uk/styles/headings/) documents this pattern. A chapter title, running head, section heading, and figure caption can coexist when their referents differ.
- **Content-measured constraint:** ask what the learner must produce, what evidence is available, where the error can occur, and how feedback will be delivered. Do not replace these questions with a fixed “three layers,” “one example,” or “no summary” rule.

### Structural scanner versus model judgment

**Safe structural candidates** are observable and reversible:

- Count explicit heading levels and report a contiguous stack of three or more heading-like blocks as `title-stack-candidate`; include the text and line locations. Do not label it redundant.
- Compute heading-to-paragraph ratio, section length, repeated normalized title/dek strings, duplicate list labels, and whether a figure has a caption/label. Exclude code fences, front matter, templates, and declared examples.
- In HTML, extract the accessibility tree or DOM relations: one `h1` is a useful signal, but multiple `h1`s can be valid in componentized documents; report rather than fail closed. Check heading rank jumps as a navigability warning, not an authorship clue. Use [W3C heading guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/) and [WCAG 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels) as the semantic baseline.
- Detect exact or near-exact title/dek/summary repetition with a similarity score, and show the compared strings. Do not delete a lead paragraph solely because it resembles a title; [GOV.UK paragraph guidance](https://design-system.service.gov.uk/styles/paragraphs/) allows a one-time lead summary.
- Measure card count, token variance, repeated border/radius/padding values, and color/type defaults. Report a uniformity cluster only when there is no content-driven emphasis; a documented design system is an expected false positive.
- For motion, detect animation declarations and test `prefers-reduced-motion`; the [W3C technique](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html) requires checking whether nonessential motion is suppressed. This is a behavior/accessibility check, not a style accusation.

**Model-judged or human editorial claims** require context:

- whether an eyebrow is empty, useful, or a legitimate section caption;
- whether a subtitle adds a promise, scope, audience, or method rather than echoing the title;
- whether a summary is necessary for a long document, genre-required, or a redundant restatement;
- whether card uniformity flattens meaning or provides an intentional comparison grammar;
- whether typography, color, and motion serve an interaction and content hierarchy;
- whether a worked example is mathematically correct, uses the right denominator, and gives feedback that changes the next attempt;
- whether a cited source supports claim existence, aligns to the measured population/variable, and warrants the sentence's causal scope.

Use a low-severity candidate to route a judge pass. Do not convert an absolute count into “AI-written,” and do not use a fixed font, palette, spacing scale, subtitle count, or title-layer count as an authorship rule.

## Decision tree: title chrome and hierarchy

```text
Does each visible layer answer a different reader question?
├─ no, two layers make the same claim
│  ├─ Is one required by the venue/template or accessibility pattern?
│  │  ├─ yes -> keep the required semantic layer; shorten or remove the decorative echo
│  │  └─ no -> keep the clearer line and delete the duplicate
├─ yes -> name the jobs
│  ├─ Is the eyebrow a real genre, section, date, audience, or navigable context?
│  │  ├─ no -> remove it or replace it with a useful caption
│  │  └─ yes -> keep it visually subordinate and semantically available
│  ├─ Does the H1 name the page's distinct subject or question?
│  │  ├─ no -> rewrite the H1; do not solve a weak title with more labels
│  │  └─ yes -> continue
│  ├─ Does the dek add scope, method, audience, or an immediate promise?
│  │  ├─ no -> remove it; a title repeated as a sentence is chrome
│  │  └─ yes -> continue
│  ├─ Does the next heading begin a distinct section with content of its own?
│  │  ├─ no -> delete the heading or merge the short section
│  │  └─ yes -> continue
│  └─ Does every figure/table caption describe its own evidence?
│     ├─ no -> rewrite the caption and alternative text; preserve the figure relation
│     └─ yes -> retain the stack and test the rendered outline
└─ uncertain -> ask the genre and reader task before changing the artifact
```

No fixed three-layer limit follows from these checks. Four layers can be right when they are, for example, a section caption, a page H1, a useful dek, and a figure caption. Two layers can be wrong when both merely say “Key insights.” [GOV.UK's labels and legends guidance](https://design-system.service.gov.uk/get-started/labels-legends-headings/) is a practical warning about duplicate visible and assistive labels: if the same name is announced twice, consolidate the semantic relation rather than flatten every heading.

## What counts as evidence

The 2025 [Kobak et al. study](https://doi.org/10.1126/sciadv.adt3813) found population-level changes in excess vocabulary across millions of PubMed abstracts and estimated LLM-assisted processing under its method. That is empirical AI-specific evidence about a corpus-level language signal. It is not evidence that a particular title stack, card grid, font, or author was machine-produced. Editorial claims about redundant chrome are hypotheses until tested against reader comprehension, task success, semantic outline, or a documented content requirement.

Keep the scopes separate:

1. **Existence:** did the cited source report the phenomenon or recommendation?
2. **Alignment:** did it measure this medium, audience, population, variable, and outcome?
3. **Causal scope:** does it support “causes,” or only “co-occurs with,” “is recommended,” or “can be associated with”?

The repair target is the artifact's reader value: remove repeated announcements, repair wrong hierarchy, expose checked reasoning, preserve useful orientation, and verify behavior. Never infer authorship from a design choice.
