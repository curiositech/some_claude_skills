# Evidence for connected public copy

Reviewed 2026-11-22. This note responds to the supplied Claude artifact,
"Why the prose reads clipped, and how to check for it." Its strongest diagnosis
is that shortening can remove the relation the reader needs. Several catalog
fixes encouraged that behavior, while the checker missed local runs inside
chapters. Both problems were confirmed in this checkout and repaired.

## What the sources support

[Reinhart et al., PNAS (2025)](https://arxiv.org/abs/2410.16107v2)
compare human writing with variants of GPT-4o and Llama 3. They find systematic
grammatical and rhetorical differences, including preferences for noun-heavy
forms and differences between models. Instruction tuning increases many of the
differences in their corpora. This supports reviewing syntax and register; it
does not calibrate the ten constructions in the artifact as automatic faults.

[Muñoz-Ortiz et al. (2024)](https://arxiv.org/abs/2308.09067v3)
find more scattered sentence-length distributions in their human English news
texts than in comparable model output. That describes a corpus. It supplies no
instruction to alternate sentence lengths or insert fragments. The former
catalog repair converted a descriptive result into a damaging drafting formula.

[Boggia (2026)](https://arxiv.org/abs/2607.21498v2) is a preliminary study of
epanorthosis in one instruction-tuned model family. Its results depend on
register: elevated rates in oratory, lower rates in informal questions and
answers, and roughly matched rates in several other registers. Its instruction
experiment is in Italian. The artifact's broad multiplier therefore needs that
qualification. Our preference for direct positive claims is a house editorial
default, not a universal prevalence finding.

[Prasad et al., Penn Discourse Treebank](https://catalog.ldc.upenn.edu/docs/LDC2008T05/papers/prasad-etal-unlg05.pdf)
represent both explicit and implicit discourse relations. Implicit relations
are an ordinary part of language. A count of sentence pairs without a connective
cannot decide whether a cause, consequence or premise is missing. Nor can
inserting a connective supply missing evidence. The editor must determine the
relation and whether this audience needs it stated.

[The Center for Plain Language](https://centerforplainlanguage.org/learning-training/getting-started-with-plain-language/)
starts with readers and their tasks, recommends connections between ideas,
and calls for evaluation with readers. This is practitioner guidance for the
review workflow, rather than evidence of an AI-specific habit. Model self-review
can propose a repair; actual reader comprehension needs reader evaluation.

## Additions beyond the artifact

[Clark, Martin and Mahowald (2026)](https://arxiv.org/abs/2610.29162) examine
processing-related features in recent model outputs. Their preprint reports
unusual word combinations and inanimate subjects with animate verbs across the
models studied, alongside model- and domain-dependent differences in noun stacks,
dependency lengths and reduced relative clauses. A length-penalty experiment
offers limited support for a compression hypothesis; it does not establish the
cause of every production model's style or measure comprehension for our readers.

This adds a useful editorial question: has shortening the text made the reader
unpack a dense noun phrase or hold a subject in memory while waiting for its
verb? Prefer an ordinary verb and a stated relation where they clarify the text.
Preserve established technical terms. The rubric also checks improvised compound
labels that add decoding work without naming a reusable concept.

Public copy needs an additional check at the point of action. Verify that the
promise beside a button matches what happens next, and keep material conditions
beside that promise. Name the next actor and a timeline only when verified. This
is an editorial and product-consistency requirement; these papers do not provide
an AI-prevalence measurement for it.

## Corrections and limits of the Claude proposal

The artifact is a useful editorial diagnosis, but several proposed rules are
too absolute for all public-facing copy:

- Two short sentences may be complete, clear steps. Paragraph-final placement
  is a reason to inspect them, not proof of a fault.
- A short recap can aid orientation. Word overlap cannot determine whether it
  adds a fact. "Each came too early" adds a timing diagnosis but leaves the
  relevant event unnamed; it need not be a metaphor.
- The pair "Neither review was wrong. Each came too early" does not repeat an
  opening, so it is not anaphora. Different predicate structures also make it a
  poor example of isocolon. The catalog uses clearer parallel examples.
- An expected value matters when it lets the reader interpret a result. A value
  established nearby need not be repeated, and no value should be fabricated.
- Colons, pseudo-clefts, clear demonstratives and mapped analogies can explain
  efficiently. Judge their work in context.
- "Now count" is an imperative with an understood subject. A short list of
  finite verbs cannot reliably distinguish grammatical sentences from fragments.
- Do not add every inference an editor can imagine. Supply the steps this
  audience needs for the claim or action, and retain the source's uncertainty.

The artifact's [classroom connective comparison](https://www.facultyfocus.com/articles/teaching-with-technology-articles/human-or-ai-connectives-hold-the-clues/)
does report the quoted differences for "because" and "so." It is a small,
task-specific comparison, not a universal connective baseline. We therefore
retain no numerical connective quota. The syndicated Atlantic claim was not
independently verified here, and supplies no threshold or catalog statistic.

## What changed mechanically

`humanize_review.py` now reports each local run of three or more sentences of
at most four words at the first sentence's source line. It does not use the
former whole-file share or require eight sentences. The finding is a low-severity
cadence candidate. Paragraphs and common non-prose boundaries interrupt runs;
headings, lists, quotes, code fences, proof labels and proof-end symbols are
excluded in supported source formats. HTML sentence runs are deferred to the
rendered or DOM-aware judge review, since the existing text extractor loses
paragraph boundaries and source lines. Common TeX environments and display math are masked while preserving
line numbers. This is a small source scanner, not a TeX engine, an abbreviation
resolver, a grammatical parser or a semantic checker.

The reference generator and validation summary now inventory calls that
emit findings through an AST scan, including IDs resolved from finite literal
loop rows and dictionary-key loops. Mentions in examples, comments and thresholds
no longer imply automation. Dynamic IDs that cannot be resolved are conservatively
left for manual review. An inventory confirms source wiring, not sensitivity or
specificity. `negation-contrast-frame` remains a judge rubric.

The other connected-prose checks remain judge rubrics, with counterexamples.
There is no implemented `--genre exposition` switch or automatic inference
detector. The mandatory paragraph review supplies the editorial step for every
public-facing genre. Proofs and tutorials require complete logical steps;
buttons, headings, reference entries, dialogue and literary passages have
different grammatical needs. Severity follows a demonstrated reader consequence.
