# Before / After — Learning, Research, and Title Chrome

These specimens are synthetic teaching data and editorial demonstrations. They are not transcripts of a real class, manuscript, or generated page. The `humanize:ignore` markers fence the deliberately weak **Before** blocks so a linter does not mistake an exhibit for the surrounding guidance; the explanatory prose remains subject to review.

## 1. A novice lesson that earns its scaffolding

The learner knows whole-number multiplication and can read a percentage. The lesson's target is one narrow claim: a positive test does not by itself tell us the probability that a person has the condition. The numbers below are invented for instruction. They are chosen to make the arithmetic transparent, not to estimate any real disease or test.

### Before: definition first, then a slogan

<!-- humanize:ignore-start -->

> **Conditional probability** is the probability of an event given that another event has occurred. Bayes' theorem allows us to update prior beliefs based on new evidence. In medical diagnosis, sensitivity, specificity, and prevalence are important. Consider a disease with a prevalence of 1%, a sensitivity of 90%, and a specificity of 95%. What is the probability that a patient with a positive test has the disease?
>
> **Key takeaway:** Positive predictive value depends on prevalence.
>
> **Practice:** Apply Bayes' theorem to a similar example.

<!-- humanize:ignore-end -->

This version names the right terms but leaves a novice to decide which probability is being asked for, when to multiply, and how the false positives enter the denominator. “Apply Bayes' theorem” is a task label, not practice. The takeaway repeats a claim before the reader has seen it computed. The problem also hides the unit of the population, so the base-rate intuition never gets a chance to form.

### After: definition → natural frequencies → checked arithmetic → near-miss → faded practice → transfer

**1. Start with the question in plain language.** We want `P(disease | positive test)`: among people whose test is positive, what fraction actually have the disease? That is different from `P(positive test | disease)`, the sensitivity.

**2. Convert the percentages to a classroom-sized population.** Use 10,000 synthetic patients.

- Prevalence 1%: `100` have the disease and `9,900` do not.
- Sensitivity 90%: of the `100` with disease, `90` test positive and `10` test negative.
- Specificity 95%: of the `9,900` without disease, `95%` test negative, so `5%` test positive: `495` false positives.

**3. Count the positive tests before taking a fraction.** There are `90` true positives + `495` false positives = `585` positive tests. Therefore:

```text
P(disease | positive) = true positives / all positive tests
                       = 90 / 585
                       = 0.153846...
                       ≈ 15.4%
```

**Arithmetic check.** `9,900 × 0.05 = 495`; `90 + 495 = 585`; `90 ÷ 585 = 0.153846...`. The answer is about 15%, not 90%. The 90% was the chance of a positive result *when disease is already present*.

This frequency format follows a well-established instructional finding: natural frequencies can make Bayesian reasoning easier than conditional-probability notation alone ([Gigerenzer and Hoffrage, 1995](https://doi.org/10.1037/0033-295X.102.4.684); a later replication includes simple and complex tasks at [Frontiers in Psychology](https://doi.org/10.3389/fpsyg.2015.01473)). It is a design choice for this novice lesson, not a universal replacement for probability notation.

**4. Near-miss with feedback.** A learner says: “The answer is 90%, because the test catches 90% of cases.” Ask them to point to the denominator. The 90% starts with the 100 people who have disease. The question starts with the 585 people who tested positive. Keep the learner's sentence visible, then repair only the denominator:

```text
near-miss: 90 / 100  -> answers P(positive | disease)
question:  90 / 585  -> answers P(disease | positive)
```

The repair is concrete: name the population under the bar, recalculate, and say what changed. Do not praise the wrong answer as “almost there” when its denominator answers a different question.

**5. Fade the support.** The first practice item supplies the frequency table; the learner fills only the final fraction. The second supplies the four counts but omits the labels “true” and “false,” so the learner must classify them. The third supplies only the prevalence, sensitivity, and specificity; the learner chooses a convenient population and builds the counts. This is a proposed lesson sequence, not a claim that every learner needs exactly three steps.

**6. Near transfer without an answer showing through.** On a later page, show only this prompt:

> A spam filter checks 2,000 synthetic emails. Two percent are spam. It flags 80% of spam emails and correctly leaves 90% of nonspam emails unflagged. An email is flagged. Estimate the chance it is spam. Explain which emails belong in the denominator.

Use a no-answer-visible transfer prompt: do not print a worked result beside the question or in a collapsed “answer” box. Collect the learner's response before feedback. The instructor or system can then reveal the checked path: 40 are spam; 32 are correctly flagged; 1,960 are nonspam; 196 are incorrectly flagged; 32 / (32 + 196) = 32 / 228 ≈ 14.0%. If a learner answers 80%, classify the error as a conditional-direction mistake; if they use `32 / 2,000`, classify it as the wrong reference population. Feedback should name the error and give the next operation, not merely mark “incorrect.”

The sequence is grounded in general learning evidence, not an AI-authorship theory. The National Academies' [*How People Learn II*](https://www.nationalacademies.org/read/24783/chapter/7) summarizes benefits of retrieval and spacing across materials and learners; the earlier *How People Learn* transfer discussion warns that context-bound examples do not automatically produce flexible application ([chapter 15](https://www.nationalacademies.org/read/9853/chapter/15)). A lesson can therefore be more useful when it exposes the worked path, asks for retrieval after a delay, and changes the surface story while preserving the underlying structure. None of those features proves who wrote the lesson.

## 2. Title chrome: four layers can be four jobs, or four announcements

A title stack should be evaluated by function and reader task, not by a fixed layer count. A section caption can orient a reader, an H1 can name the page, a dek can state the immediate promise, and a figure caption can identify evidence. The [GOV.UK heading guidance](https://design-system.service.gov.uk/styles/headings/) explicitly supports a caption above an H1 when a page belongs to a larger group; the [WCAG heading guidance](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels) asks for descriptive headings that help users navigate. The problem is duplicated meaning or decorative labels that have no referent.

### Before: the same chrome rendered four ways

<!-- humanize:ignore-start -->

```html
<article class="rounded-2xl border p-8">
  <p class="eyebrow uppercase tracking-[.2em] text-indigo-500">Research</p>
  <h1 class="text-5xl font-extrabold">How AI Changes Learning</h1>
  <p class="dek text-gray-500">A practical guide to how AI changes learning</p>
  <p class="label">Key insights</p>
  <ul><li>AI changes learning.</li><li>Practice matters.</li><li>Feedback helps.</li></ul>
</article>
```

```markdown
# How AI Changes Learning

## How AI Changes Learning: Key Insights

### What This Means for Practice

AI changes learning by changing how practice happens.
```

```latex
\chapter{How AI Changes Learning}
\section{How AI Changes Learning: Key Insights}
\subsection{What This Means for Practice}
\begin{figure}
  \caption{How AI Changes Learning}
\end{figure}
```

<!-- humanize:ignore-end -->

The defect is not “four layers.” In the HTML specimen, the eyebrow says only “Research,” the dek repeats the H1, “Key insights” announces a list whose bullets repeat the same abstraction, and the card has no evidence. In the Markdown and LaTeX specimens, the chapter, section, subsection, and caption all compete to name the same object. The reader cannot tell whether the section is a new argument, a summary, or a label for the figure. A structural scanner can report a **title-stack candidate**; it cannot decide the semantic job of each line.

### After: preserve the jobs, remove the echoes

<!-- humanize:ignore-start -->

```html
<article>
  <p class="eyebrow">Teaching note · probability</p>
  <h1>Why a positive test is not a 90% diagnosis</h1>
  <p class="dek">A worked natural-frequency example, a denominator near-miss, and a delayed transfer problem.</p>
  <figure>
    <img src="frequency-tree.svg" alt="A frequency tree showing 90 true positives and 495 false positives among 10,000 synthetic patients">
    <figcaption>In this synthetic example, 90 of 585 positive tests are true positives.</figcaption>
  </figure>
</article>
```

```markdown
# Why a positive test is not a 90% diagnosis

A worked natural-frequency example, a denominator near-miss, and a delayed transfer problem.

## Build the denominator

The positive-test group contains 90 true positives and 495 false positives.
```

```latex
\chapter{Why a positive test is not a 90\% diagnosis}
\chaptermark{Positive tests and denominators}

A worked natural-frequency example, a denominator near-miss, and a delayed transfer problem.

\section{Build the denominator}

The positive-test group contains 90 true positives and 495 false positives.

\begin{figure}
  \centering
  \includegraphics{frequency-tree}
  \caption{Synthetic data: 90 of 585 positive tests are true positives.}
  \label{fig:frequency-tree}
\end{figure}
```

<!-- humanize:ignore-end -->

Now each layer earns its place: the eyebrow identifies the genre and topic; the H1 makes a falsifiable promise; the dek previews the route; the H2 names a distinct reasoning step; the figure caption describes the displayed evidence and carries the synthetic-data qualifier. The accessibility semantics remain explicit: one page H1, nested section headings, useful alternative text, and a caption associated with the figure. The [GOV.UK paragraph guidance](https://design-system.service.gov.uk/styles/paragraphs/) is a useful counterexample to “every lead is redundant”: a lead paragraph can summarize the page when it is used once and does not merely echo the title. Conversely, [GOV.UK's labels/legends guidance](https://design-system.service.gov.uk/get-started/labels-legends-headings/) warns that duplicated visible and assistive labels can be announced twice; consolidate when the second layer adds no information.

## Composed Team page: remove the duplicate component introduction

The navigation and page title have separate jobs: the link lets a visitor reach
Team from elsewhere, and the H1 names the destination. The embedded component's
heading and lead repeat that same proposition without adding information.

### Before: each component is reasonable alone

<!-- humanize:ignore-start -->
```html
<nav aria-label="Main"><a href="/team/" aria-current="page">Team</a></nav>
<main>
  <h1>Meet the team</h1>
  <div class="decorative-panel"><!-- adds no grouping or interaction -->
    <section aria-label="Team members">
      <h2>Meet your team</h2>
      <p>Get to know the people on your team.</p>
      <ul><li>Edie — Career story</li><li>Iris — Design</li></ul>
    </section>
  </div>
</main>
```
<!-- humanize:ignore-end -->

### After: retain navigation and the page heading

```html
<nav aria-label="Main"><a href="/team/" aria-current="page">Team</a></nav>
<main>
  <h1>Meet the team</h1>
  <section aria-label="Team members">
    <ul><li>Edie — Career story</li><li>Iris — Design</li></ul>
  </section>
</main>
```

The component heading, lead and redundant decorative panel were deleted, not
restated or merely relabeled. The section's
accessible name still identifies its independent region, while the link and H1
preserve navigation and page orientation. If the component also appeared alone
on another page, review that context before removing its local heading. A safety
instruction, a caption explaining an image, or a tab naming an action may need
repetition even beside related copy; inspect the actual state and reader task.

## 3. Research prose: existence, alignment, causal scope

A citation is not a magic stamp. A reviewer should ask three separate questions: **does the claim exist in the source, does the source align with the exact population and measure, and does the study support the causal scope of the sentence?** The following synthetic paragraph demonstrates the repair.

### Before: a real source stretched past its design

<!-- humanize:ignore-start -->

> Researchers proved that AI writing has taken over academic publishing and that decorative heading stacks cause readers to misunderstand papers (Kobak et al., 2025). Therefore, removing every subtitle is necessary for human writing.

<!-- humanize:ignore-end -->

### After: claim, alignment, and scope kept separate

<!-- humanize:ignore-start -->

> Kobak and colleagues analyzed 15.1 million PubMed abstracts and reported a sharp post-2022 rise in several excess vocabulary markers; their population-level method estimates LLM-assisted processing, not individual authorship, and it does not test website heading stacks. Separately, accessibility guidance recommends descriptive headings for orientation ([WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)), while GOV.UK documents a legitimate caption-plus-H1 pattern. The editorial question is therefore narrower: where a caption, title, subtitle, and summary repeat one proposition, remove the duplicate; where each layer names a different job, retain it and verify the rendered hierarchy.

<!-- humanize:ignore-end -->

The source for the first sentence is [Kobak et al. in *Science Advances*](https://doi.org/10.1126/sciadv.adt3813) (the open article is also available through [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12219543/)). It supports existence of a population-level lexical shift and a model-assisted-writing estimate under the study's method. It does not establish a causal effect on comprehension, a universal visual pattern, or an individual author's use. That boundary is the repair: align the source with its measured object, then phrase the conclusion at the same scope.

## Medium coverage checklist

Use the same questions across media, then adapt the evidence you can actually inspect. “Inspect” means open the artifact in its delivery mode; “verify” means test the relevant behavior, citation, arithmetic, or semantic relation rather than infer intent from style.

| Medium | Inspect | Verify |
|---|---|---|
| Web apps | rendered scan path, heading tree, card repetition, color/motion defaults, responsive states | keyboard/focus behavior, contrast, reduced motion, content-to-layout fit, real controls and labels |
| Notes | title depth, callouts, backlinks, duplicated summaries | whether labels point to a real note or source; whether the note's claims have dates and provenance |
| Essays | heading density, paragraph rhythm, title/dek/summary overlap | thesis-to-evidence alignment, specific examples, ending contribution, audience assumptions |
| Papers | venue template, abstract/introduction/conclusion roles, figure captions | references open and support claims, methods/data scope, arithmetic, accessibility of PDF/source |
| Class materials | objective, prerequisite, worked example, practice, transfer, feedback path | answer-hidden retrieval, checked arithmetic, spacing, accessible headings, learner response evidence |
| Books | part/chapter/section hierarchy, running heads, front matter, figure/table captions | navigability in print/PDF, cross-references, index, genre conventions, whether repetition serves memory |
| Notebooks | cell order, output visibility, narrative comments, plot defaults | clean-run reproducibility, stale outputs, units/labels, claims matched to executed data |
| Podcasts/video | title cards, chapter markers, repeated verbal signposts, lower thirds | transcript accuracy, audio/visual timing, source disclosure, whether repetition supports orientation |
| Interactive explanation | progressive disclosure, controls, state labels, animation, alternative route | keyboard and screen-reader path, reduced motion, error recovery, exact claim/data behavior |

This table is an inspection plan, not an authorship detector. A uniform card grid, a serif/sage palette, an all-caps eyebrow, or a four-layer heading stack may be an appropriate design system or venue template. Change it when the reader loses hierarchy, content is duplicated, a control fails, or an evidence relationship is false.
