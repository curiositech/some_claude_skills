# Education, semantic progression, and chrome

This memo adds an education and interface-structure lens to the humanization
research. It does not treat a familiar visual style, a French narrow no-break
space, or a semantic heading hierarchy as evidence that a person or model made
the work. The useful question is whether the artifact helps its intended reader
learn, orient, decide, or act.

The evidence has two deliberately opposite education results. The PNAS
randomized field experiment, [Generative AI without guardrails can harm
learning](https://doi.org/10.1073/pnas.2422633122), compared control,
GPT Base, and a GPT Tutor during high-school mathematics practice, then tested
students without AI access. AI access improved performance during assisted
practice, but the preregistered unassisted exam analysis found that relying on
the technology could reduce skill acquisition. The authors are explicit about
the limits: one topic, one high school in Turkey, a Fall 2023 deployment, and
short-term outcomes. The result therefore supports a probe for independent
transfer after assistance, not the claim that AI tutoring is intrinsically
harmful.

The counterexample is [AI tutoring outperforms in-class active
learning](https://doi.org/10.1038/s41598-025-97652-6). Its crossover
randomized trial in an introductory Harvard physics course used a custom tutor
designed around content-rich prompts and established pedagogy. The abstract
reports higher learning gains in less time and higher engagement than the
active-learning comparison. The direct Nature PDF was blocked in this pass, so
the claim is limited to the searchable abstract and publisher metadata. The
study is one course, one institution, and one carefully engineered tutor. It
does not justify treating a generic chatbot as equivalent. Together the studies
support a stronger rule: evaluate the pedagogical mechanism and the transfer
task, not the presence of AI.

The IES/WWC guide, [Organizing Instruction and Study to Improve Student
Learning](https://ies.ed.gov/ncee/wwc/practiceguide/1), gives the applied
baseline. Its recommendations include spacing learning over time, interleaving
worked examples with problem solving, combining graphics with verbal
descriptions, connecting abstract and concrete representations, retrieval
practice, delayed judgments of learning, and deep explanatory questions. These
are not AI tells. They are design requirements that a generated lesson, deck,
note, or explainer may satisfy or violate. A practical evaluation should
therefore ask whether the artifact contains semantic progression: orientation,
one concrete instance, an explanation of why the instance matters, a chance to
retrieve or apply the idea, and a check that the learner can transfer it after
the support is removed.

“Semantic progression before concept reuse” is the main proposed ordering rule.
Before later reasoning depends on a concept, the artifact should establish
what the concept means and how it applies. A title or advance organizer can
name a concept before teaching it. One editorial hypothesis is that generic
assembly encourages repeated abstract nouns:
“alignment,” “clarity,” “scalability,” or “feedback” appears in the title,
dek, feature card, chart caption, and conclusion without any new operation.
Repetition is useful only when each occurrence changes the reader’s task:
name, example, comparison, procedure, or consequence. This is a purpose and
learning criterion, not a detection claim.

The IES recommendation to combine graphics with verbal descriptions also
provides a better test for diagrams than “does this look designed?” A diagram
should carry a readable relation, and nearby text should explain the process
or decision the relation supports. The [From Text to
Map](https://arxiv.org/pdf/2402.11400) study found 56% recovery of human-coded
causal relationships in one systems-dynamics task and says every relationship
and link sign needs human review. A diagram rubric should therefore compare
source entities and edges against the rendered artifact, then ask a subject
matter reviewer whether the sign and direction are meaningful. Layout
regularity is only a warning that this check may be needed.

## Title, dek, heading, and caption chrome

The title/dek pair deserves its own “deletion test.” Delete the headline and
dek, then read the page, slide, or note. If the remaining body has no concrete
subject, mechanism, or next action, the chrome was carrying an unsupported
promise. If the title names a real object and the dek adds a different
constraint, audience, or consequence, the pair is doing useful work. The test
does not prohibit a title and dek; it checks whether they add information or
merely repeat a category phrase.

This is consistent with [WCAG 2.2 SC
2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html):
headings and labels should describe topic or purpose so users can orient
themselves and understand relationships among sections. WCAG separates
descriptive content from semantic markup. A page can have correctly marked-up
headings that say little, or clear text that is not marked up as a heading.
Both dimensions need testing.

The [GOV.UK Design System heading
guidance](https://design-system.service.gov.uk/styles/headings/) is a useful
counterexample to the catalog’s suspicion of captions. It recommends heading
tags, a consistent hierarchy, sentence case, and captions that can identify a
larger section or group. It allows a deliberate hierarchy change for visual
balance only after accessibility testing. A caption is therefore legitimate
chrome when it locates the page in an information structure; it becomes
decorative residue when it says “INTRODUCING,” “FOR MODERN TEAMS,” or “AI
POWERED” without narrowing the content.

Two review steps follow. First, inspect the heading tree and compare it with
the visible content: every heading should predict the section’s topic or
purpose, and the title/dek should not be the only place where the product,
mechanism, or claim appears. Second, judge semantic overlap between title,
dek, first paragraph, and section headings. High overlap is not itself a defect;
flag only when the repeated phrase introduces no new example, action,
constraint, or consequence. These are semantic judgments; the bundled scanner counts structural candidates
and does not compute semantic similarity. Human review decides whether repetition supports
orientation or wastes the reader’s scarce first screen.

Locale formatting is another important false-positive boundary. [CLDR
34](https://cldr.unicode.org/downloads/cldr-34) documents that French number
grouping changed from U+00A0 no-break space to U+202F narrow no-break space,
including short-unit patterns. The glyph difference can look like a spacing
quirk or an authoring fingerprint, but it is locale data. A humanization
rubric must inspect and preserve meaningful locale-sensitive spacing. Do not
normalize it blindly or infer authorship from its presence. The same caution applies to sentence case, legal headings,
technical abbreviations, and disciplinary notation.

## What recent generation studies add

[Interrogating Design Homogenization in Web Vibe
Coding](https://www.microsoft.com/en-us/research/publication/interrogating-design-homogenization-in-web-vibe-coding/)
frames frictionless generation as a risk to design diversity and recommends
productive friction. It is a research framework and case analysis, not a
population measurement. Use it to motivate a deliberate-variation probe:
ask for the default treatment, then ask the author to reject one default based
on audience, content, or interaction needs. Record the reason, not merely the
novel color.

For images, [What Makes a Good Generated
Image?](https://ojs.aaai.org/index.php/AAAI/article/view/39666) separates
aesthetics, artifact absence, anatomy, composition, object adherence, and
style. It reports weaker relationships among these attributes for multimodal
LLM judgments than for human judgments. This argues against one scalar visual
judge. For video, [T2VTextBench](https://arxiv.org/abs/2505.04946) finds
legibility and temporal consistency failures across ten systems, while
[DEVIL](https://arxiv.org/abs/2407.01094) shows that low-motion clips can
benefit from conventional consistency metrics. Use OCR, frame checks, and
prompt-to-motion probes before asking a person whether the clip feels honest.

For notes, [What’s Wrong? Refining Meeting
Summaries](https://aclanthology.org/2025.coling-main.143/) supplies a
human-annotated 200-summary error set covering omission, irrelevance, and
structural errors. [Re-FRAME](https://arxiv.org/abs/2509.15901) reports
improvements from extracting salient facts before abstractive generation.
The practical contract should preserve transcript spans, uncertainty, action
owners, dates, and unresolved disagreement. A fluent summary without those
links is a reading aid, not an authoritative record.

For writing, [How LLMs Distort Our Written
Language](https://arxiv.org/abs/2603.18161) reports semantic changes under
grammar-only prompts. [Voice Under Revision](https://arxiv.org/abs/2604.22142)
describes a pull toward a polished, less situated register. These support
author-baseline comparison and claim-preservation tests. They do not support
universal bans on em dashes, “delve,” contractions, or formal vocabulary.
[When AI Writes, Who Gets Cited?](https://arxiv.org/abs/2608.19230) adds a
content-level concern: models can converge on shared citation preferences even
when all candidate papers are real and equally visible. A research-writing
review should test omitted relevant work and cross-model overlap, not only
whether each DOI resolves.

## Confidence and evaluation plan

Record source type separately from confidence in a claim. A standard can
establish a design requirement; a controlled study can estimate an effect in
its studied setting. A preprint, benchmark, expert essay or vendor analysis has
different limitations. Check methods, directness and external validity rather
than ranking claims solely by publication venue. The accompanying JSON records
source-note review and live access status for all 258 original entries. It does
not supply a calibrated confidence score or certify unvisited claims.

The original catalog snapshot contains 573 items, 507 without an item-level
evidence field. That is an auditability gap, not a finding that all 507
claims are false. High-severity items should acquire a source, a confidence
category, and a false-positive boundary before becoming hard gates.

Build an evaluation corpus with paired artifacts: raw generation, human-edited
version, human-authored control, and deliberately flawed control. Include
landing pages, long-form articles, meeting notes, diagrams, instructional
slides, short videos with text, and narrated audio. Vary language and locale,
including French U+202F formatting, to expose false attribution. Include
audience tasks: find a section, explain a concept, solve a transfer problem,
recover an action item, identify a chart comparison, and make a decision.

Possible future automated probes include heading structure, source-span
coverage, OCR persistence, frame continuity and citation resolution. They are
not implemented by the new scanner. Semantic overlap, omission and factual
alignment still need source-aware judgment; preserve legitimate locale formatting.
Human reviewers should judge purpose fit, pedagogical progression, narrative
coherence, relation correctness, authenticity, and whether a variation is
intentional. Report defects as task consequences. Report provenance as a
separate uncertainty label. A familiar purple gradient or a narrow no-break
space may be worth inspecting; neither is a verdict.
