# Rewrite Checklist — run after every humanizing pass

Work the report top-down, highest severity first, then verify each line below.

<!-- humanize:ignore-start
     A checklist is genuinely a list, so bullet-colonization and heading-spam are
     documented false positives here (see each item's false_positive_when line in
     catalog.json). The markers are the honest way to say so, rather than padding
     this file with prose it doesn't need. -->

## Surgical-edit verification
- [ ] Every fix touched only the flagged span; surrounding text is byte-identical
- [ ] No new tropes introduced (re-run both layers; report should be empty or low-only)
- [ ] Meaning preserved — claims, numbers, and commitments unchanged

## Voice restoration
- [ ] Contractions present where a person would use them
- [ ] Concrete details come from the source; no invented anecdote, metric or mechanism
- [ ] Sentence lengths follow the thought; no manufactured fragments or length alternation
- [ ] Opinions stated as opinions, not hedged into mush

## Specificity
- [ ] Claims have support; no fact was invented to make an adjective sound specific
- [ ] CTAs name what actually happens on click
- [ ] No audience trifectas ("whether you're a, b, or c")

## Connected prose (every public-facing draft)
- [ ] Necessary causes, conditions, consequences and proof steps are stated or already established
- [ ] Any added causal connective matches the evidence
- [ ] Results have the comparison needed to interpret them
- [ ] Claims lead directly; contrasts address a relevant distinction or plausible misconception
- [ ] Paragraph endings add useful information or action; no appended punchline or empty maxim
- [ ] Parallel clauses help comparison; no formulaic symmetry for emphasis alone
- [ ] Pronouns have clear referents; metaphors leave the literal mechanism understandable
- [ ] Noun stacks and improvised compound labels do not make ordinary actions harder to understand
- [ ] Material conditions stay beside promises; CTA labels agree with the next screen
- [ ] Short UI labels, grammatical imperatives and useful short sentences remain intact

## Composed web UI (if applicable)
- [ ] Inspect the whole rendered viewport, scroll sequence and relevant open tabs or drawers; mark the pass unverified if the render is unavailable.
- [ ] Compare page and embedded headers, navigation and helper copy by meaning; name the distinct fact, orientation, action, constraint or evidence each keeps.
- [ ] Inspect nested frames or cards, stacked toolbars and status rows, repeated badges, avatars, calls to action and controls, and layers explaining other layers; remove a redundant wrapper or control bar as well as its copy.
- [ ] Delete demonstrated repetition rather than merely substituting synonyms; retain working boundaries, useful grouping, independent actions, deliberate persistent navigation, accessible names, captions, functional art and independent-context cues.
- [ ] Judge whether card count follows real content and whether an eyebrow has a useful job; counts and word matches alone do not prove duplication, and a structural scan cannot decide it.

## Visual (if applicable)
- [ ] Typeface was chosen, not defaulted; accent color traceable to a decision
- [ ] Zero emoji in UI chrome; one icon system throughout
- [ ] Layout has at least one designed irregularity
- [ ] Text ≥14px / 0.875rem everywhere; zoom not locked

## Final
- [ ] Read the whole piece aloud once. Anywhere you stumble or cringe, fix it
- [ ] Report regenerated and archived next to the artifact
<!-- humanize:ignore-end -->

For lessons and research explanations:
- [ ] The hard step in each worked example is visible and independently checked.
- [ ] Prerequisites are taught or explicitly assumed before later use.
- [ ] At least one appropriate independent task can reveal misunderstanding.
- [ ] Synthetic data, illustration, empirical evidence, and conjecture remain distinct.
- [ ] Claims match the source's population, method, result and limits.
- [ ] Each surviving title layer contributes distinct information or orientation.
- [ ] No typography or style cue has been converted into an authorship accusation.
