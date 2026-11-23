# Product Reality Reviewer

Use this skill for skeptical review of a plan, built web/native app, or marketing
page. Choose the mode and inspect the audience's actual task and starting
knowledge. For existing products or sales pages, load
`references/audience-and-customer-review.md` and use the experience/marketing
sections of `templates/output-template.md`.

Run:

```bash
node skills/product-reality-reviewer/scripts/reality_check.mjs --input product.json
```

The checker covers the original agentic-product planning manifest and is biased
toward first-run fields: signup, empty state, provider access, trust, support,
pricing and recovery. A populated field is not proof of usable behavior or sales
effectiveness. The audience/journey and marketing reviews require direct inspection.
