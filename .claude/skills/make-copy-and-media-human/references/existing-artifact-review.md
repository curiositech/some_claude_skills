# Reviewing an existing document, app or manuscript

Use this workflow when the artifact already has a structure, voice, design or
reader journey. The first deliverable is a located audit and a small calibration
edit. Once the edit direction is established, apply it in bounded units and
verify each unit in context. An instruction to fix the artifact authorizes those
edits; do not introduce a new approval gate. An audit-only request ends with the
findings and proposed repairs.

## Establish what the reader actually encounters

Record the version or commit being reviewed, intended audience, reader task and
publication surface. Preserve a recoverable original. For repository changes,
use a dedicated linked worktree and feature branch; never edit a primary checkout.
Collect a few existing passages that the author considers successful, when
available. Use them to preserve voice. Do not assume every passage in an existing
AI-assisted artifact is a reliable style baseline.

Inspect both editable source and rendered output. Extracted text makes patterns
searchable, but can lose reading order, paragraph boundaries, hidden conditions,
figure relationships and the state in which a string appears. Link each finding
back to a stable location in the source and the visible artifact. A file-wide
rhythm score is insufficient evidence for an individual edit.

| Artifact | Collect and inspect | Useful review unit |
| --- | --- | --- |
| Document or report | Editable source plus the rendered PDF or document; captions, tables, footnotes, links and reading order | A section and its surrounding argument |
| Web app | Main user journeys, rendered pages and important UI states; source or string catalog where available | One task from entry through completion or recovery |
| Native app | Running app or available recordings/screenshots; visible strings, localization resources, accessibility labels and system dialogs | One screen sequence, including its states and return path |
| Book manuscript | Chapter map, editable manuscript, rendered pages, terminology list, claims and cross-references | One chapter, reviewed within the book's argument |

For apps, inspect representative loading, empty, error, success, permission and
destructive-action states when they apply. Test whether labels describe what the
action actually does. On the web, inspect relevant narrow and wide viewports.
In native apps, inspect supported text sizes and relevant platform layouts.
Record inaccessible or unvisited states as unreviewed. Screenshots establish
appearance, not working interaction, accessibility behavior or factual accuracy.

`render_check.py` is a web-browser tool. It does not inspect native controls.
Use the applicable platform tools and direct inspection for a native app; if
only screenshots are available, explicitly bound the review to those screens.
The new local sentence-run checker also excludes HTML streams because the
existing text extractor loses block boundaries. Review web prose in its DOM or
rendered paragraph context rather than accepting a flattened sentence run.

## Inspect the whole rendered composition

For every web UI review, perform a deletion pass on the **whole rendered
composition**: inspect the viewport, scroll sequence and relevant open states.
Compare page and embedded headers, navigation, tabs, drawers and helper copy by
meaning, even when they use synonyms. Also inspect nested frames or cards within
cards, stacked toolbars and status rows, repeated badges, avatars, calls to action
and controls, and layers that merely explain other layers. Name the distinct fact,
orientation, action, constraint or evidence the reader would lose if each layer
disappeared. Remove a demonstrated redundant wrapper or control bar as well as
redundant copy; paraphrasing the same claim does not repair duplication. Preserve
working boundaries, useful grouping, independent actions, deliberate persistent
navigation and current-location cues, accessible names, captions, functional art,
and text that supplies a necessary constraint or serves an independent context.
A repeated word, three cards, or an eyebrow alone is not a finding. Check whether
cardinality follows real content and whether the eyebrow adds a useful cue; remove
arbitrary filler when it has no reader-facing job. Inspect the real rendered
composition when available; if it cannot be opened, report the
rendered pass as unverified rather than claiming the source scan settled it. The
structural scanner finds candidates and cannot judge semantic duplication.

## Audit structure and claims before polishing sentences

First trace what the reader is trying to understand or do. Locate missing
prerequisites, unsupported promises, contradictions, repeated sections, broken
transitions and missing outcomes. Then apply `connected-prose.md` paragraph by
paragraph: identify the actor, action, needed relation, comparison and consequence.
Finish with rhetorical habits, compressed noun phrases and surface rhythm.

For a book, start with the chapter map and a representative chapter to calibrate
the review. Include definitions, proofs, worked examples, captions and exercise
solutions in that chapter. Carry the resulting terminology and style decisions
across chapters. Sampling establishes the approach; it does not establish that
unread chapters pass. Complete the chapter-by-chapter pass before claiming a
whole-book review. Recheck global references after local edits.

For an app, follow the reader's whole task across screens. A polished individual
label can still contradict its destination. Check conditions beside a promise,
the consequences of an action, and who acts next. Preserve meaningful differences
between platform conventions, user roles and states.

## Make the audit actionable

For each confirmed finding, record the exact location, excerpt or screenshot,
what the reader would misunderstand or fail to do, the proposed repair and the
evidence needed to verify it. Group repeated habits under one explanation but
retain their affected locations. Separate reproduced defects from editorial
candidates and from unreviewed behavior. Prioritize reader harm over the number
of stylistic cues.

Use the standard findings JSON and HTML report. App findings should also name
the screen, state, action and a capture when available; use `line: 0` for a
rendered location with no source line rather than inventing a line number. Keep
a coverage list of reviewed and unreviewed sections, screens and states.

## Edit, render and verify

Apply the highest-impact repairs first, then adjust cadence only where it helps.
Keep edits bounded to the relevant paragraph or screen sequence. Inspect the diff
for changed claims, numbers, names, conditions, mathematical assumptions and
product commitments. Verify any new causal explanation against the owning source.

Render the revised section or run the affected app journey again. Check wrapping,
truncation, nearby headings, captions and whether the reader can still find the
next step. Run the structural checker on supported text files, repeat the judge
review and verify behavior separately. A clean script run does not prove the
prose makes sense, the app works or the reader learned the argument.

Finish with a concise account of what changed, the important retained choices,
what was actually inspected and any remaining uncertainty. Leave the edited
artifact and report easy to compare with the original.

## Reusable request

<!-- humanize:ignore-start -->

> Use make-copy-and-media-human to review this existing [artifact/version] for
> [audience] trying to [task]. Inspect its source and rendered form. Audit the
> reader journey, claims and missing reasoning before sentence style. Preserve
> the successful voice shown in [samples]. Record located findings with concrete
> repairs, and track reviewed versus unreviewed sections or states. Apply repairs
> in bounded units, then inspect the diff and rendered result. Verify factual and
> behavioral claims; flag anything you cannot establish. Deliver the revision,
> the HTML findings report and a short account of validation and remaining gaps.

For an audit without edits, replace the last two sentences with: "Deliver the
audit, a proposed calibration edit and a prioritized fix plan. Leave the original
artifact unchanged."

<!-- humanize:ignore-end -->
