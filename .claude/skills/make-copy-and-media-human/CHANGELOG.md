# Changelog

<!-- humanize:ignore-start
     A changelog is heading-and-bullet dense by design, which is the documented
     false positive for heading-spam and bullet-colonization (see each item's
     false_positive_when in catalog.json). Marked rather than padded with prose.
     -->

## 0.5.0 — 2026-11-22

Moved detailed execution and evidence guidance into routed references, kept the
entrypoint below 500 lines, and normalized the runtime name to
`make-copy-and-media-human` while retaining the historical bundle directory.
Added the existing-artifact workflow for documents, web/native apps and books.

Added a required connected-prose drafting and review pass for all public copy,
with judge rubrics for missing reasoning, comparisons, referents, rhetorical
closers, compressed syntax and promises separated from material conditions.
The dated research note corroborates the Claude audit and qualifies its claims
by model, genre and evidence strength. Examples preserve clear short sentences,
imperatives, labels, contrasts and parallel cases.

Removed advice to manufacture fragments, alternate sentence lengths or force
one-line paragraphs. Repaired examples that dropped causal relations or invented
supporting facts. The staccato check now reports local runs and source lines,
excluding common non-prose blocks and proof labels; findings remain low-severity
candidates. Reference automation labels now use an AST inventory of literal
finding emissions rather than quoted mentions. Regression checks cover chapter
dilution, boundaries, TeX routing, line numbers and automation claims.

Preserved the installed whole-composition deletion pass, its semantic-duplication
catalog rule, the composed Team page example and the web UI rewrite checklist.

## 0.4.0 — 2026-09-19

Added educational exposition, title-chrome and instructional-media review lanes,
a cross-format title-stack scanner, and validation of explicit reviewer learning
maps. The research note records evidence boundaries and a dated source audit.
Before/after examples now cover learning progression and repeated title layers.

Removed the digit/acronym heuristic for supposedly empty eyebrows. Unicode format
characters now produce a low-severity typography cue without an authorship claim
or blanket deletion advice. Corrected cumulative time in the backoff example and
reduced unsupported style-pattern severity. New fixtures cover structural cues,
legitimate counterexamples and malformed annotation maps.

Fixed missed HTML title stacks inside ordinary `div` layout wrappers, including
nested hero copy. Wrapper boundaries remain separate so unrelated cards do not
combine into a title stack; prose and ignored-element regressions are covered.
Adversarial review also caught false positives for Markdown indented code and
mixed emphasis, inert HTML templates, media between headings, and declared
prior knowledge refreshed later in a lesson. Added regressions for each case.

## 0.3.0 — 2026-09-14

Rebuilt around measured evidence. The skill previously carried thresholds that
disagreed with its own rubric, and it failed the review it sells: `SKILL.md` ran
3.76 em dashes per 100 words against its own 1.2 threshold, and the examples
flagged the AI-isms they exist to demonstrate. The whole bundle now passes
`--fail-on medium` against itself.

### Added

- `references/fairness-and-false-positives.md`. Why findings are editing cues
  rather than evidence, who gets hurt when they're used as evidence, and the
  tells that do not work. Carries the base-rate argument: because detectors are
  biased toward "human", a flag is more likely to be an unusual person than a
  caught machine.
- `references/fiction-and-narrative-tells.md` and
  `references/engineering-artifact-tells.md`. Story-level tells, and tells for
  commits, PRs, review, code, tests and docs.
- Catalog grew from 70 items to 157. New media: fiction, social-post, email,
  listing, resume, image, video, audio, chart, commit-message, pr-description,
  code-review, code, docs.
- Every item now carries `false_positive_when`, `currency`, `family`, and where
  one exists, `evidence` with a citation. 15 new sources including the PNAS
  grammatical-feature study, the Science Advances excess-vocabulary study, the
  detector-bias literature, and Wikipedia's Signs of AI writing.
- `--baseline` compares rhythm signals against the author's own prior writing.
  `--fail-on` gates CI. `--validate` proves every emitted ism resolves to a
  catalog item.
- New detectors: invisible codepoints, vendor markup residue, chat tracking
  params, unfilled merge-tag placeholders, participial tails, nominalization
  density, copula avoidance, the deontic gap, pronoun evacuation, specificity
  starvation, paragraph-length monoculture, horizontal-rule spam, heading-level
  skips, title-case uniformity, markdown leaking into unrendered media, and a
  code-comment analyzer for narrating comments, swallowed exceptions,
  placeholder stubs and signature-restating docstrings.

### Changed

- Detection is restructured into five families: residue, form, rhythm, shape,
  code. The family, not the severity, says how much to trust a finding.
- Rhythm signals cap at low severity without `--baseline`. Em-dash rate, comma
  rate, contraction rate and sentence variance are fluency proxies that overlap
  badly between people and models; one anti-slop linter measured its em-dash
  rule warning on roughly 64% of legitimate technical blog posts.
- Thresholds moved into `catalog.json` and are read from there, so the rubric
  and the code cannot drift apart again.
- Burstiness now measured as coefficient of variation rather than absolute
  standard deviation, which was scale-dependent and simply wrong.
- Law 1 clarified: no topical keyword lists, with three narrow exceptions for
  machine artifacts, closed grammatical classes measured as rates, and the
  era-versioned excess-vocabulary list.
- Ignore markers now work in the code path, not just the prose path.

### Fixed

- Two catalog entries were wrong and are corrected rather than deleted. The
  mangled-hands image heuristic is marked obsolete and points at provenance
  instead, because current models render hands and text correctly. The
  invisible-codepoint entry is downgraded: U+202F was a real tell for about a
  week in April 2025 before the vendor removed it, and Word, LaTeX and French
  typography all emit it routinely.
- The Inter/indigo entry drops its implied study, because none exists. The
  origin is one designer's public remark, and the entry now says so.
- HTML injection through an unescaped `line` field in the report renderer.
- A `groq` typo that silently dropped the Grok item from every generated
  reference. The generator now fails on any orphaned item.
- An attribution regex containing U+2014 twice and no en dash, so an en-dashed
  byline never counted as attribution.
- Code fences, YAML frontmatter, blockquotes and `<style>` bodies were all
  counted against the author's prose.
- Report CSS shipped 13px text while the skill demanded 14px everywhere.
- A malformed `--findings` file crashed with a raw traceback; zero input files
  produced a report that read as "clean".
- `examples/before-after-landing-page.md` claimed seven structural detections
  where the script makes four, and three of its ism names no longer existed.

## 0.2.0 — 2026-07-04

Upgraded to the port-daddy agentic-family bundle standard. Frontmatter-only
upgrade — `scripts/humanize_review.py` already is this skill's deterministic
auditor (structural checks + merge point for judge-pass findings), so no
second `.mjs` scorer was added.

- Frontmatter: added `metadata.io-contract` (consumes draft copy/media +
  judge findings; produces humanized copy/media, audit findings, and the
  HTML fix-plan report).
- Frontmatter: replaced dangling `pairs-with` entries (`vibe-matcher`,
  `design-critic`, `seo-content-blogging` — none exist under `skills/` in
  this repo) with verified in-repo skills: `port-daddy-marketing-copy`,
  `port-daddy-expository-writer`, `web-design-expert`.
- Confirmed `metadata.provenance` was already block-style (compliant).
- Added `README.md`, `agents/openai.yaml`, and
  `templates/output-template.md` for bundle completeness; cross-referenced
  both new template/agent files from `SKILL.md`.

## 0.1.0 — 2026-06-12

Initial release. Catalog of 70 AI-isms across 10 model dialects and 10 media,
built by a six-lens research team (Claude prose tropes; GPT/Codex; Gemini,
Kimi, DeepSeek, Qwen, Llama, Grok dialects; visual design; document/deck
structure; published stylometry catalogs — 66 cited sources).

- `skills/make_copy_and_media_human/scripts/humanize_review.py`: structural detector layer + static HTML
  line-item fix-plan renderer, stdlib only, selftested.
- `skills/make_copy_and_media_human/scripts/regenerate_references.py`: generated reference views derive from catalog.json.
- Two-layer detection honors the no-keyword-NLP rule: scripts measure,
  the model judges.

<!-- humanize:ignore-end -->
