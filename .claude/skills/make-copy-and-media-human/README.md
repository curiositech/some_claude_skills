# Make Copy and Media Human

Strip the machine accent from copy, web UI, slides, READMEs, commits, PRs,
marketing pages, lessons, academic books, notebooks, and generated media before anything outward-facing ships.

Reach for this skill when text or design reads like AI, before you publish
anything customer-facing, or when you're auditing a property for machine tells:
Claudeisms, GPT-isms, Codexisms, Gemini caveat stacks, engineering-artifact slop,
and the v0/Lovable design look.

It will not tell you whether a person used AI. That question has bad answers and
worse consequences, and `references/fairness-and-false-positives.md` lays out
why: a study of seven detectors found high false-positive rates on one corpus
of non-native English essays; those rates do not transfer to every detector or author. So this is an editing tool. Every fix in
the catalog improves writing regardless of who or what produced it, which is what
lets you skip the authorship question entirely.

## Quick start

Read `SKILL.md` first for the three laws, the six finding families, and the
process. Then collect two or three pieces of the author's own earlier writing,
because comparing against their baseline is what turns the weakest half of the
catalog into the strongest.

```bash
python3 scripts/humanize_review.py FILE... --baseline 'posts/*.md' \
    --out report.html --json structural.json
```

Next, run the judge pass yourself against `references/catalog.json`. Every item
marked `llm-judge` needs an editor's read rather than a checklist tick, and so do
the `structural` items the script doesn't implement. Write your findings to JSON
matching `templates/output-template.md`, then merge them:

```bash
python3 scripts/humanize_review.py FILE... --findings judge.json --out report.html
```

For every public-facing draft, load [connected-prose.md](references/connected-prose.md)
and review the relations inside each paragraph even when the script reports no
findings. State the causes, conditions, comparisons and consequences the intended
reader needs; remove formulaic reveals and empty punchline endings. Let length
follow the thought. Never insert fragments, invent facts or force sentence-length
variation to sound human. The [research note](references/connected-prose-research.md)
records what is supported and where the Claude proposal needed qualification.

The short-sentence checker reports paragraph-local runs with source lines. It
cannot decide whether a premise, cause or consequence is missing. Those remain
judge checks. Run `python3 scripts/test_connected_prose.py` for their mechanical
boundaries and the automation-inventory regressions.

If you're asked to apply fixes, work `templates/rewrite-checklist.md` top-down
and re-run both layers afterward. A clean result has to come from a re-run and
never from a claim. Use `--fail-on high` to gate this in CI, and `--validate` to
confirm the script and the catalog still agree about every ism and threshold.

## How the two layers split the work

`scripts/humanize_review.py` is the structural layer. It measures only countable
things: densities, variances, ratios, codepoints, hex values, font names, and
identifier overlap between a comment and the line beneath it. It is stdlib-only
and carries a `--selftest` that checks both that it catches known tells and that
it stays silent on a sample of real human prose.

For web pages there is a second, optional layer. `scripts/render_check.py` opens
the page at real viewports and reports horizontal overflow with the offending
elements named, undersized tap targets, unreadable type, and contrast failures.
It is the only script here with a dependency, on Playwright, and it emits the
same findings JSON so it merges through `--findings` like any judge-pass result.

It deliberately does not implement every structural item in the catalog. Several
of them need a diff, a repo history, or a resolver that this script has no
business owning, so they're marked structural for you to check with the tools
that do. Thresholds live in `references/catalog.json` rather than in the code,
which is what stopped the rubric and the implementation from drifting apart.

`scripts/regenerate_references.py` rebuilds the per-dialect markdown views from the catalog.
It refuses to write if any item would land in no file. An earlier typo silently dropped an item
out of every reference for months and nothing noticed, which is the kind of failure a generator
should make impossible rather than merely unlikely.

## Bundle contents

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Three laws, six families, decision tree, process, shibboleths, failure modes |
| `references/fairness-and-false-positives.md` | Why findings are cues and not evidence; read before your first review |
| `references/catalog.json` | Source of truth: the complete rule set with thresholds, false-positive notes, currency, and evidence |
| `references/web-build-defects.md` | Web pages that are broken rather than merely generic; act on these first |
| `references/fiction-and-narrative-tells.md` | Story-level tells; the strongest in the catalog |
| the generated reference views | Generated per-dialect and per-medium views of the catalog |
| `scripts/humanize_review.py` | Structural detector and report renderer |
| `scripts/render_check.py` | Optional. Opens a page at 390/768/1280 and reports what breaks; needs Playwright |
| `scripts/regenerate_references.py` | Regenerates the generated reference views; fails on orphaned items |
| `templates/rewrite-checklist.md` | Checklist to run after every humanizing pass |
| `templates/output-template.md` | Shape of a judge-pass finding and the delivery summary |
| `examples/` | Before and after pairs for prose and a landing page, plus a rendered report |
| `agents/openai.yaml` | Subagent descriptor for a delegated review |

## Educational and title-structure review

Read `references/review-decisions.md` for concept progression and title-layer
triage, and `references/education-and-chrome-research.md` for evidence boundaries.
The dated source audit distinguishes a review of the existing source notes from
live verification; it does not certify every inherited claim.

```bash
python3 scripts/review_learning_structure.py chapter.md page.html chapter.tex --out candidates.json
python3 scripts/humanize_review.py chapter.md --findings candidates.json --out report.html
python3 scripts/test_learning_structure.py
python3 scripts/test_review_regressions.py
```

A title-stack finding is a low-severity candidate. Read the layers and inspect
rendered output before deciding whether they repeat meaning. HTML scanning includes
ordinary `div` wrappers as separate scopes; sibling wrappers do not combine into
one title stack. Optional learning
maps record reviewer annotations, not automatically inferred mastery. See
`templates/learning-map.json` and the scanner's `--help`.
