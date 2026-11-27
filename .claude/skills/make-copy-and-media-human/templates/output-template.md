# Judge-Pass Finding + Delivery Template

Fill this in during step 3 (judge pass) and step 4 (delivery) of the process in `SKILL.md`.

## Judge-pass finding entry

One object per catalog item that fires, matching the schema documented in `scripts/humanize_review.py`'s docstring. Append these to a JSON array and pass it to `--findings`.

```json
{
  "file": "<path to the reviewed file>",
  "line": 0,
  "excerpt": "<the exact flagged span, trimmed to ~300 chars>",
  "ism": "<catalog item name from references/catalog.json, e.g. not-x-but-y>",
  "dialect": "<claude | chatgpt | codex | gemini | kimi | deepseek | qwen | llama | grok | generic-llm>",
  "severity": "<high | medium | low>",
  "explanation": "<why this reads as machine-authored, one or two sentences>",
  "rewrite": "<the surgical fix — mandatory for high severity>"
}
```

Rules:
- One entry per genuine finding — do not pad the list to look thorough, and do not skip a real finding because the catalog didn't name it exactly (a free-form "what else smells generated?" pass is part of step 3).
- `rewrite` must be a surgical edit to the flagged span only. If you can't state the fix in the rewrite field, the finding isn't ready to report.
- Leave `rewrite` empty only for `severity: low` items — those are taste calls the author may keep.

## Delivery summary (to the user)

After rendering the report, hand back a short, plain summary — not a certificate, not a score out of 100:

```markdown
Reviewed: <file(s)>
Findings: <N> total — <H> high, <M> medium, <L> low
Report: <path to report.html>

Top issues:
1. <ism> (<severity>) — <one-line what/why>
2. <ism> (<severity>) — <one-line what/why>
3. <ism> (<severity>) — <one-line what/why>

<If zero findings: say "clean" plainly. A zero-finding report is a valid result — do not manufacture a low-severity nitpick to seem thorough.>
```

If fixes were applied, re-run both layers and report the after-state the same way, explicitly noting it came from a re-run, not a claim.
