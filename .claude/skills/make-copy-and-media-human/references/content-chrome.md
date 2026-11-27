# Title layers and content chrome

Count visible layers, then ask what each contributes. A caption, heading and subtitle can all be useful. The defect is repeated meaning or lost orientation, not a particular font, number of lines or fashionable palette. The structural scanner emits candidates only; inspect the rendered page or PDF before editing.

_5 items. Generated from catalog.json — edit there, then re-run `scripts/regenerate_references.py`. Do not hand-edit this file._

_Every item carries a **False positive when** line. Read it before you act on the item: these are cues for an editor, not evidence about an author._

<!-- humanize:ignore-start
     The diagram and index below quote the tells they document, and a
     mermaid label is not a sentence. -->

## When this file applies

```mermaid
flowchart TD
    A[Title stack candidate] --> B{Required by venue or useful taxonomy?}
    B -->|yes| C[Preserve its distinct function]
    B -->|no| D{What does deleting each layer lose?}
    D -->|scope or orientation| C
    D -->|nothing| E[Merge or remove the repeated layer]
    E --> F[Check rendered hierarchy and accessibility]
    C --> F
```

## What is in this file

Severity reflects the consequence for the intended reader, never how sure you should be about who wrote it. **Automated** means these scripts implement the check; *no* means it is yours to ask in the judge pass.

| item | severity | family | automated |
| --- | --- | --- | --- |
| [`callout-saturation`](#callout-saturation) | med | shape | n/a |
| [`composed-ui-semantic-duplication`](#composed-ui-semantic-duplication) | med | shape | n/a |
| [`section-preface-justifies-existence`](#section-preface-justifies-existence) | med | shape | n/a |
| [`title-stack-redundancy`](#title-stack-redundancy) | med | shape | n/a |
| [`title-stack-candidate`](#title-stack-candidate) | low | shape | yes |

<!-- humanize:ignore-end -->

<!-- humanize:ignore-start
     Everything below is a specimen catalog. It quotes the tells it documents,
     including literal machine residue, so reviewing it with humanize_review.py
     would flag the exhibits rather than the writing. -->

<a id="callout-saturation"></a>
### `callout-saturation`  ·  medium · generic-llm · structure · llm-judge · family: shape · lane: content-chrome

Every small idea is boxed, labeled, badged or followed by a takeaway so the page no longer distinguishes main argument from exceptions.

**Why it reads AI:** Review hypothesis about unexamined assembly or task mismatch. This pattern can occur in human work and does not establish authorship.

**Detect:** Read only the main text, then only the callouts; identify whether emphasis still selects anything important.

**Fix:** Return ordinary explanation to paragraphs and reserve callouts for genuine exceptions, definitions or tasks.

**False positive when:** A workbook or reference card may intentionally consist of individually addressable units.

**Evidence:** Editorial application of https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html. This source supports the mechanism or repair within its studied setting, not AI authorship detection or prevalence of this exact pattern.

<a id="composed-ui-semantic-duplication"></a>
### `composed-ui-semantic-duplication`  ·  medium · generic-llm · structure · llm-judge · family: shape · lane: content-chrome

A composed interface repeats meaning or presentational chrome across page and component boundaries: nested frames, stacked bars or repeated badges, avatars, calls to action and controls add layers without distinct jobs.

**Why it reads AI:** An assembly can repeat a premise across individually reasonable components. This is an editorial task mismatch that can occur in human work and does not establish authorship.

**Detect:** Inspect the whole rendered viewport, scroll sequence and relevant open states. Compare page and component headings, navigation, tabs, drawers, helper copy, frames, toolbars, status rows, badges, avatars and controls by meaning and purpose. For each layer name the fact, orientation, action, constraint or evidence lost if removed. A lexical match, panel count or structural scan cannot decide this.

**Fix:** Remove or merge a demonstrated redundant wrapper, control bar or copy layer rather than paraphrasing its label. Preserve working boundaries, useful grouping, independent actions, persistent navigation and distinct information or constraints; verify the surviving hierarchy and behavior in the rendered composition.

**False positive when:** Working boundaries, useful grouping, independent controls, deliberate persistent navigation, current-location cues, accessible names, captions, functional art, and repeated safety or task instructions can serve distinct users or states despite similar appearance or meaning.

**Evidence:** Editorial application of https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html. This source supports descriptive headings and labels for navigation, not authorship detection or a measured prevalence of semantic duplication.

<a id="section-preface-justifies-existence"></a>
### `section-preface-justifies-existence`  ·  medium · generic-llm · structure · llm-judge · family: shape · lane: content-chrome

A repeated prefatory label explains why each section exists instead of helping the reader use its content.

**Why it reads AI:** Review hypothesis about unexamined assembly or task mismatch. This pattern can occur in human work and does not establish authorship.

**Detect:** Does the rationale supply a prerequisite or consequence, or simply announce that the topic matters?

**Fix:** Remove generic motivation, preserve a concrete consequence, and move straight to the example or argument.

**False positive when:** A curriculum rationale or research-design justification can itself be necessary content.

**Evidence:** Editorial application of https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html. This source supports the mechanism or repair within its studied setting, not AI authorship detection or prevalence of this exact pattern.

<a id="title-stack-redundancy"></a>
### `title-stack-redundancy`  ·  medium · generic-llm · structure · llm-judge · family: shape · lane: content-chrome

Eyebrow, title, subtitle and lead repeat the same proposition rather than adding scope or orientation.

**Why it reads AI:** Review hypothesis about unexamined assembly or task mismatch. This pattern can occur in human work and does not establish authorship.

**Detect:** Temporarily delete each layer; name the information or navigation lost. A count alone cannot settle this.

**Fix:** Retain one subject heading and any distinct constraint; start the content at the first useful sentence.

**False positive when:** News decks, chapter subtitles and taxonomy captions often add essential scope.

**Evidence:** Editorial application of https://design-system.service.gov.uk/styles/headings/. This source supports the mechanism or repair within its studied setting, not AI authorship detection or prevalence of this exact pattern.

<a id="title-stack-candidate"></a>
### `title-stack-candidate`  ·  low · generic-llm · structure · structural · family: shape · lane: content-chrome

**Automated here:** yes, these scripts implement it.

Three or more consecutive explicitly styled title-like blocks appear before substantive content.

**Why it reads AI:** Review hypothesis about unexamined assembly or task mismatch. This pattern can occur in human work and does not establish authorship.

**Detect:** Count supported markup blocks with review_learning_structure.py; this candidate requires rendered and semantic review.

**Fix:** Name each layer's distinct job; keep useful orientation and merge only demonstrated repetition.

**False positive when:** A chapter caption, title and meaningful subtitle may all carry distinct information.

**Evidence:** Editorial application of https://design-system.service.gov.uk/styles/headings/. This source supports the mechanism or repair within its studied setting, not AI authorship detection or prevalence of this exact pattern.

<!-- humanize:ignore-end -->
