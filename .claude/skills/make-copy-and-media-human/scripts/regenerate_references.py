#!/usr/bin/env python3
"""Regenerate reference Markdown views from references/catalog.json. Stdlib only.

The catalog is the source of truth; the markdown files are grouped, readable
views of it. Re-run after editing catalog.json.

Two guarantees this script now enforces, because their absence cost real items:

  1. NO ORPHANS. Every catalog item must land in at least one generated file.
     A dialect value of "groq" where the catalog said "grok" silently dropped an
     item out of every reference for months, and nothing noticed because nothing
     checked. This exits non-zero rather than writing a quietly lossy view.

  2. EVERY FIELD IS RENDERED. If you add a field to the catalog, add it here.
     A field that exists only in JSON is a field the model reading the reference
     will never see.
"""
import json
import sys
from pathlib import Path
from implemented_checks import implemented_ids

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "references"
cat = json.loads((REF / "catalog.json").read_text(encoding="utf-8"))
items, sources = cat["items"], cat["sources"]

# Which items these scripts actually implement, read from the scripts themselves
# so it cannot drift. detection_type says what KIND of evidence settles an item,
# never that this bundle automates it -- SKILL.md already tells the judge pass to
# ask the unimplemented ones by hand, and this is what makes that instruction
# actionable instead of a grep exercise.
IMPLEMENTED = implemented_ids(ROOT / "scripts")

PROSE_GENERIC = {"prose"}
VISUAL_MEDIA = {"web-ui", "typography", "color", "iconography", "layout"}
STRUCT_MEDIA = {"structure", "slide-deck", "marketing-copy"}
ENG_MEDIA = {"commit-message", "pr-description", "code-review", "code", "docs",
             "code-comments", "issue", "test"}
PLATFORM_MEDIA = {"social-post", "email", "listing", "resume"}
VISUAL_ASSET_MEDIA = {"image", "video", "audio", "chart", "brand-identity"}

# Tells that mark ANY machine output regardless of vendor. Documented in
# other-model-dialects.md by name; the Claude view defers to that claim so the
# two rules cannot both take them.
# Residue that is reproducible by opening the page, so web-build-defects.md
# claims it by name even though its medium would otherwise route it elsewhere.
# The visual and structure views defer, so the three rules cannot both take it.
DIAGRAMS = {
    "claudeisms.md": """flowchart TD
    A["Prose: essay, reply, README, doc"] --> B{"Do you have 2-3 samples<br/>of this author's prior writing?"}
    B -->|yes| C["--baseline glob<br/>rhythm can reach high"]
    B -->|no| D["No baseline<br/>every rhythm finding caps at LOW"]
    C --> E["Read form + shape items first"]
    D --> E
    E --> F{"Finding family?"}
    F -->|residue| G["Verify context and repair<br/>unconverted artifacts"]
    F -->|form / shape| H["Report as written. Humans do this too"]
    F -->|rhythm| I["Cue only. Never quote as evidence"]""",
    "gptisms-codexisms.md": """flowchart TD
    A["ChatGPT / Codex / Copilot / Cursor output"] --> B{"Prose or code?"}
    B -->|prose| C["Service voice: openers, signoffs,<br/>hedge stacks, FAQ tails"]
    B -->|code| D["Comment narration, hollow tests,<br/>try/except pass, stale APIs"]
    C --> E{"Literal assistant residue present?<br/>'As an AI', 'Certainly, here is'"}
    D --> E
    E -->|yes| F["HIGH, absolutely. Grep and delete,<br/>then re-read what it replaced"]
    E -->|no| G["Editing cues only.<br/>Check engineering-artifact-tells for code"]""",
    "other-model-dialects.md": """flowchart TD
    A["Output from a non-OpenAI, non-Claude model"] --> B{"Do you already KNOW<br/>which model produced it?"}
    B -->|no| C["STOP. These are notes about model<br/>defaults, not a way to identify one"]
    B -->|yes| D["Use the dialect section as an editing checklist"]
    D --> E{"Register or calque item?"}
    E -->|yes| F["Never an authorship signal.<br/>These are features of real<br/>second-language English"]
    E -->|no| G["Edit normally"]""",
    "visual-design-tells.md": """flowchart TD
    A["A UI, page or component"] --> B["Run: humanize_review.py page.html"]
    B --> C{"How many defaults cluster?"}
    C -->|one| D["Coincidence. Not a finding on its own"]
    C -->|three or more| E["The cluster is the finding:<br/>palette + typeface + radius + layout"]
    E --> F{"Is there a brand guideline<br/>that chose these?"}
    F -->|yes| G["Not a finding. A choice"]
    F -->|no / unknown| H["Report, and read the currency line:<br/>this is the fastest-ageing file here"]""",
    "generated-media-tells.md": """flowchart TD
    A["A generated-looking image, video or audio clip"] --> B["1. Provenance FIRST"]
    B --> C["C2PA manifest, EXIF, reverse image search"]
    C --> D{"Provenance answers it?"}
    D -->|yes| E["Done. Report what the manifest says"]
    D -->|no| F["2. Context: does the asset match<br/>what the page claims about it?"]
    F --> G["3. Pixel forensics LAST, if at all"]
    G --> H["Check the currency field before quoting<br/>any artifact heuristic. One entry here is<br/>already marked obsolete"]""",
    "document-and-deck-structure.md": """flowchart TD
    A["A long document, README or deck"] --> B["Strip the prose. Look only at the SHAPE"]
    B --> C{"Does any section restate another?"}
    C -->|yes| D["Summary/body/conclusion restatement"]
    C -->|no| E{"Heading every 1-2 paragraphs?"}
    E -->|yes| F["Check heading-spam.<br/>Reference docs are EXEMPT"]
    E -->|no| G{"Every list item the same<br/>shape and length?"}
    G -->|yes| H["Parallel overload. Note: style guides<br/>REQUIRE parallel lists"]
    G -->|no| I["Shape is fine. Review the prose instead"]""",
    "marketing-and-platform-tells.md": """flowchart TD
    A["Landing copy, social post, cold email, listing"] --> B["Identify the venue"]
    B --> C{"Venue base rate?"}
    C -->|"LinkedIn long-form, ~40% generated"| D["A tell here is weak evidence.<br/>Most of the venue reads this way"]
    C -->|"Reddit reply, ~2%"| E["Same tell is far more marked"]
    D --> F{"Does the copy name a mechanism?"}
    E --> F
    F -->|no| G["Transform-verb formula: the verb is fine,<br/>the missing HOW is the finding"]
    F -->|yes| H["Not this finding. Check structure"]""",
    "web-build-defects.md": """flowchart TD
    A["Any web page"] --> B["READ THIS FILE FIRST"]
    B --> C["Everything here is reproducible by opening the page.<br/>No fairness caveat. No authorship claim"]
    C --> D["Run: humanize_review.py page.html"]
    D --> E{"Findings marked rendered?"}
    E -->|yes| F["render_check.py page.html --viewports 390,768,1280"]
    E -->|no| G["Static findings are enough"]
    F --> H["Fix defects BEFORE judging style.<br/>A page that fails at 390px has a<br/>bigger problem than reading generated"]
    G --> H""",
    "fiction-and-narrative-tells.md": """flowchart TD
    A["Fiction or anything told as a story"] --> B["Ignore sentence style entirely"]
    B --> C["Read at the DISCOURSE level"]
    C --> D{"Does the narration state its own theme?"}
    D -->|yes| E["Narrated theme statement"]
    D -->|no| F{"Is every character's voice<br/>interchangeable?"}
    F -->|yes| G["Register levelling"]
    F -->|no| H["Structure holds. Edit at sentence level"]
    E --> I["Evidence note: discourse features separated<br/>human from generated fiction at 93.2% macro-F1<br/>with every stylistic cue stripped"]
    G --> I""",
    "engineering-artifact-tells.md": """flowchart TD
    A["Commit, PR, review, test or source file"] --> B["Run: humanize_review.py file.py"]
    B --> C{"Which artifact?"}
    C -->|commit / PR| D["Compare against THIS repo's norms,<br/>not against a general style"]
    C -->|test| E["Does any assertion actually fail<br/>when the code is wrong?"]
    C -->|source| F["Comment narrates the next line?<br/>Abstraction with one implementation?"]
    D --> G{"Does it restate the diff?"}
    G -->|yes| H["The diff is already there.<br/>Say WHY, not what"]
    E --> I["A test that cannot fail is not a test"]""",
    "unopened-surfaces.md": """flowchart TD
    A["A site with more than one page"] --> B{"Which surface?"}
    B -->|navigation| C["nav links over total routes.<br/>Near 1.0 means the IA is the file listing"]
    B -->|i18n| D["Switch locale. Does lang= follow?<br/>Do dates and money change shape?"]
    B -->|docs| E["Search for a string you KNOW is there"]
    B -->|email| F["Open in a client, images off"]
    B -->|print| G["Actually print it, or print-preview"]
    C --> H["The tell is not strangeness.<br/>It is that a whole class of output<br/>was never looked at"]
    D --> H
    E --> H
    F --> H
    G --> H""",
    "accessibility-beyond-the-checklist.md": """flowchart TD
    A["A web page or component"] --> B["Run an automated scan first"]
    B --> C{"Scan came back clean?"}
    C -->|yes| D["It covered roughly 30% of the<br/>success criteria a machine can verify.<br/>You are not done"]
    C -->|no| E["Fix those first"]
    D --> F["five-minute-manual-pass.md:<br/>eleven keyboard and screen-reader steps"]
    F --> G{"Item marked assistive?"}
    G -->|yes| H["A person must hear it.<br/>Do NOT write an assertion and<br/>call a pass evidence"]
    G -->|no| I["render_check.py --probe-a11y<br/>settles text-spacing and forced-colors"]""",
    "product-ux-writing.md": """flowchart TD
    A["Strings a logged-in user reads mid-task"] --> B["EXTRACT first, match second"]
    B --> C["i18n catalogs, JSX text, the render<br/>and error paths"]
    C --> D["Closed phrase sets run ONLY over<br/>the extracted strings"]
    D --> E{"Why is this the one lane<br/>where hard matching is allowed?"}
    E --> F["A product's string table is small,<br/>enumerable and extractable.<br/>Prose is none of those"]
    F --> G["Start with collapsed-empty-states:<br/>three different situations collapsing<br/>into one string is what makes users<br/>believe their data was deleted"]""",
    "typographic-craft-and-tokens.md": """flowchart TD
    A["A stylesheet or design system"] --> B["Read COMPUTED values, not declarations"]
    B --> C["Utility frameworks bundle line-height<br/>into the size scale, so a page with no<br/>explicit rule is usually correct"]
    C --> D{"For each property, ask one question"}
    D --> E["Does this vary with the thing<br/>it is supposed to vary with?"]
    E -->|no| F["One value where a function belonged"]
    E -->|yes| G["Craft is present. Not a finding"]
    F --> H{"Is it restraint or absence?"}
    H -->|"declares nothing, on defaults"| I["Not the finding"]
    H -->|"declares a scale that never varies"| J["Report"]""",
    "performance-as-a-design-tell.md": """flowchart TD
    A["A page whose source looks correct"] --> B["The source is not the delivery"]
    B --> C{"Check each in turn"}
    C --> D["Image: right format? right size for its box?"]
    C --> E["Fonts: how many weights actually USED?"]
    C --> F["Head: what blocks the first paint?"]
    C --> G["JS: did this need to be a framework?"]
    D --> H["REFUSAL: there is no published measurement<br/>that AI-generated sites are heavier.<br/>Say UNREVIEWED, not AI-generated"]
    E --> H
    F --> H
    G --> H""",
    "tool-fingerprints.md": """flowchart TD
    A["Asked: what built this page?"] --> B["Run: humanize_review.py page.html --provenance"]
    B --> C["Writes no report. Carries no severity"]
    C --> D{"How many signals for one tool?"}
    D -->|"3 or more"| E["Positive"]
    D -->|2| F["Probable"]
    D -->|1| G["Hint"]
    E --> H["A fingerprint says WHAT made the page.<br/>Never who wrote it. Never whether it is good"]
    F --> H
    G --> H
    H --> I{"Is the string ALSO a craft defect?"}
    I -->|yes| J["Report it as that defect.<br/>Fix what it points at,<br/>never just delete the string"]
    I -->|no| K["Provenance only. Stop here"]""",
    "dark-patterns-the-model-inherits.md": """flowchart TD
    A["Consent banner, countdown, checkout, cancellation"] --> B["A model producing one is NOT choosing to deceive"]
    B --> C["Princeton: 1,818 instances across<br/>1,254 of 11,000 shopping sites.<br/>This is the majority pattern"]
    C --> D{"Where does the violation live?"}
    D --> E["Usually NOT inside either component"]
    E --> F["It is the GAP between them"]
    F --> G["Load in a fresh profile and watch the network:<br/>does analytics fire before consent?"]
    G --> H["You are not telling an author they wrote<br/>something manipulative. You are telling them<br/>two innocent halves add up to a fine"]""",
    "interaction-and-motion.md": """flowchart TD
    A["A page with animation or hover styling"] --> B{"First: does content DEPEND on script?"}
    B -->|"opacity 0 until JS runs"| C["STOP. This loses content, not polish.<br/>Fix before anything else"]
    B -->|no| D{"Motion checks"}
    D --> E["One duration for every distance?"]
    D --> F["ease-in on an ENTRANCE?"]
    D --> G["Reduced-motion honoured in CSS<br/>but ignored by the JS library?"]
    D --> H{"Input device checks"}
    H --> I["hover styled with no hover guard:<br/>the state latches on tap"]
    H --> J["hover styled, focus-visible forgotten"]
    G --> K["35.4% of US adults 40+ showed vestibular<br/>dysfunction. This is not a preference"]""",
    "forms-and-input.md": """flowchart TD
    A["Any form"] --> B{"Is submit disabled until valid?"}
    B -->|yes| C["The headline finding. The control that would<br/>tell the user what is wrong is the one<br/>being withheld"]
    C --> D{"Is the gate driven by a KEY event?"}
    D -->|yes| E["Worst case: a password manager's fill<br/>fires no keypress. Complete form, dead button"]
    B -->|no| F["Check the operating properties"]
    D -->|no| F
    F --> G["autocomplete tokens present?"]
    F --> H["inputmode set on numeric fields?"]
    F --> I["errors tied with aria-describedby?"]
    F --> J["do values SURVIVE a failed submit?"]
    G --> K["Three items here are WCAG failures<br/>and carry no fairness caveat at all"]
    I --> K""",
    "research-papers.md": """flowchart TD
    A["A manuscript, preprint or referee report"] --> B["Point checks OUTWARD, at the world"]
    B --> C["Does this DOI resolve to THIS paper?"]
    B --> D["Does the body contain the abstract's number?"]
    B --> E["Does this review cite a line or figure?"]
    C --> F{"Which references do you check first?"}
    F --> G["Sort the bibliography ASCENDING<br/>by citation count. Verify from the bottom"]
    G --> H["Fidelity tracks citation count, saturating<br/>near verbatim recall above ~1,000 cites"]
    H --> I["Corollary: checking the famous<br/>references proves nothing"]
    E --> J["A fabricated reference does NOT mean<br/>a generated paper. 91% of affected<br/>papers had one or two"]""",
    "latex-source.md": """flowchart TD
    A["A .tex or .bib file"] --> B["It compiled. Nobody opened the PDF"]
    B --> C{"Which layer did it reach for?"}
    C -->|"VISUAL: backslash-backslash, vspace,<br/>textbf, a typed-out 'Figure 1'"| D["The tell. Only this layer is verifiable<br/>from the token stream alone"]
    C -->|"SEMANTIC: label/ref, emph, cite"| E["Correct"]
    D --> F{"Is the item family 'defect'?"}
    F -->|yes| G["Reproducible by compiling.<br/>No fairness caveat. Just fix it"]
    F -->|no| H["Craft, and contestable"]
    H --> I["NO CLAIM that any of this is commoner in<br/>generated than hand-written LaTeX.<br/>People break LaTeX in exactly these ways"]""",
    "scientific-figures.md": """flowchart TD
    A["A figure in a paper or poster"] --> B{"Do you have the plotting code?"}
    B -->|yes| C["Most of this lane is greppable there.<br/>Run: humanize_review.py plot.py"]
    B -->|no| D["Read the caption and the axes"]
    C --> E{"Which of three things is this?"}
    D --> E
    E -->|"image integrity: duplication, splicing"| F["NOT an AI question. Predates generative<br/>models. Goes to research integrity"]
    E -->|"generated imagery"| G["Provenance and publisher policy"]
    E -->|"unreviewed plotting"| H["The large majority. NO misconduct<br/>implication: real data, untouched defaults"]
    H --> I["savefig with no dpi wrote 640x480.<br/>10pt in a 12in figure is 2.9pt in print"]
    F --> J["There is NO detector for<br/>'is this figure generated'.<br/>Best zero-shot: 53.68%"]""",
}

# Generated imagery claimed by name because its medium says web-ui: these are
# reviewed provenance-first, not as design defaults. visual-design-tells defers.
GENERATED_MEDIA_CLAIMED = {"ai-image-waxy-skin-mangled-hands",
                           "identical-face-different-people"}

WEB_DEFECT_CLAIMED = {"scaffold-title-residue", "placeholder-copy-residue"}

CROSS_MODEL_PROSE = {"zero-typo-zero-contraction-affect-flatness",
                     "tense-and-perspective-drift", "low-burstiness-uniform-rhythm",
                     "as-an-ai-leakage", "register-leveling"}

GROUPS = {
    "claudeisms.md": {
        "title": "Claudeisms — and the generic prose tells Claude amplifies",
        "intro": "Tells most associated with Claude-family output, plus the cross-model prose tells that show up strongest in Claude registers. Severity is how loudly the tell announces machine authorship — not how confident you should be about who wrote it.",
        "pick": lambda i: not i.get("lane") and i["name"] not in CROSS_MODEL_PROSE
                          and (i["dialect"] == "claude"
                               or (i["dialect"] == "generic-llm"
                                   and i["medium"] in PROSE_GENERIC)),
    },
    "gptisms-codexisms.md": {
        "title": "GPT-isms and Codexisms",
        "intro": "ChatGPT's service voice and README register, and the code-comment tells of Codex/Copilot-shaped generation.",
        "pick": lambda i: i["dialect"] in {"chatgpt", "codex", "copilot", "cursor"},
    },
    "other-model-dialects.md": {
        "title": "Other model dialects — Gemini, Kimi, DeepSeek, Qwen, Llama, Grok — and cross-model translationese",
        "intro": "Distinctive tics per model family, plus the affect and register tells that mark any machine output regardless of vendor.",
        "pick": lambda i: i["dialect"] in {"gemini", "kimi", "deepseek", "qwen", "llama", "grok"}
                          or i["name"] in CROSS_MODEL_PROSE,
    },
    "visual-design-tells.md": {
        "title": "Visual design tells \u2014 the v0/Lovable look",
        "intro": "What makes a UI read as generated: the defaults nobody chose, clustering together. A single default is a coincidence; the cluster is the finding, because choosing even one of them deliberately usually means choosing the others too. Read the currency line on every item \u2014 this is the fastest-ageing file in the catalog.",
        "pick": lambda i: not i.get("lane") and i.get("family") != "defect"
                          and i["name"] not in WEB_DEFECT_CLAIMED
                          and i["name"] not in GENERATED_MEDIA_CLAIMED
                          and (i["medium"] in VISUAL_MEDIA
                               or i["name"] == "stock-mesh-gradient-background"),
    },
    "generated-media-tells.md": {
        "title": "Generated images, video and audio \u2014 provenance first",
        "intro": "A separate file because the REVIEW ORDER is different. For a generated image, video or audio clip, provenance comes first \u2014 C2PA manifest, EXIF, reverse image search \u2014 and pixel forensics comes last if at all, because the artifact-based heuristics age in months. This catalog has already had to mark one obsolete: the mangled-hands entry was real and is now retired, and it is kept as a standing warning about how fast this file decays.",
        "pick": lambda i: not i.get("lane") and i.get("family") != "defect"
                          and i["name"] not in WEB_DEFECT_CLAIMED
                          and (i["medium"] in VISUAL_ASSET_MEDIA
                               or (i["name"].startswith("ai-image") and not i.get("lane"))
                               or i["name"] in GENERATED_MEDIA_CLAIMED)
                          and i["name"] != "stock-mesh-gradient-background",
    },
    "document-and-deck-structure.md": {
        "title": "Document and deck structure \u2014 how the thing was assembled",
        "intro": "Document-shape tells: how generated long-form docs, READMEs and slide decks are put together, independent of any sentence in them. These are findings about ASSEMBLY \u2014 what order the parts arrive in, which parts restate which \u2014 so they survive a full rewrite of the prose and they are the ones a reader feels without being able to name.",
        "pick": lambda i: not i.get("lane") and i.get("family") != "defect"
                          and i["name"] not in WEB_DEFECT_CLAIMED
                          and i["medium"] in {"structure", "slide-deck"},
    },
    "marketing-and-platform-tells.md": {
        "title": "Marketing copy and platform posts \u2014 written to a template",
        "intro": "Landing-page copy, social posts, cold email, listings and r\u00e9sum\u00e9s. One thing separates this file from document structure: these are venues with a HOUSE FORM, and the tell is the form arriving complete rather than any individual sentence. Severity follows demonstrated reader harm, not estimated AI prevalence. Check the genre before changing a familiar form.",
        "pick": lambda i: not i.get("lane") and i.get("family") != "defect"
                          and i["name"] not in WEB_DEFECT_CLAIMED
                          and i["medium"] in {"marketing-copy", "social-post", "email",
                                              "listing", "resume"},
    },
    "web-build-defects.md": {
        "title": "Web build defects \u2014 the half you can reproduce",
        "intro": "A different KIND of finding from the rest of this catalog. Everything here is a defect you can reproduce by opening the page: it scrolls sideways at 390px, the button is not a button, the grey text fails contrast. So none of it is an inference about who built the page, none of it carries the fairness caveat the rest of the skill insists on, and all of it can be acted on with full confidence \u2014 the same standing as a dead citation. Act on this file FIRST: a page that does not work on a phone has a bigger problem than a page that reads a bit generated.\n\nMost of these are decidable from source and run in the normal structural pass. The ones marked `rendered` need `scripts/render_check.py`, the one optional script in this bundle, which opens the page at real viewports and names the elements at fault.",
        "pick": lambda i: not i.get("lane")
                          and (i.get("family") == "defect"
                                    or i["name"] in WEB_DEFECT_CLAIMED),
    },
    "fiction-and-narrative-tells.md": {
        "title": "Fiction and narrative tells",
        "intro": "What generated fiction does at the level of story rather than sentence. This file matters out of proportion to its length: a 61,608-story study separated human from AI fiction at 93.2% macro-F1 using discourse-level narrative features ALONE, with every stylistic cue stripped out. Which means the tells here are stronger than any phrase in the rest of the catalog, and they survive a model that has learned not to say \"delve\".",
        "pick": lambda i: not i.get("lane") and i["medium"] == "fiction",
    },
    "engineering-artifact-tells.md": {
        "title": "Engineering-artifact tells — commits, PRs, reviews, code, tests, docs",
        "intro": "What generated engineering work looks like in the artifacts maintainers actually read. The highest-precision checks in this file are all RELATIVE — drift from the repo's own log, idiom, or PR norm — because those need no word list, do not age as models change, and a contributor who read the surrounding code passes them automatically.",
        "pick": lambda i: not i.get("lane") and i["medium"] in ENG_MEDIA,
    },
    "unopened-surfaces.md": {
        "title": "Unopened surfaces \u2014 navigation, i18n, docs, commerce, email, print",
        "intro": "Everything in this file is about a surface that was never opened. The model has no printer, no Outlook, no German tester, no screen reader, and no second page to navigate to \u2014 so the tell is rarely that it wrote something strange. The tell is that a whole class of output was never looked at, and the defect sat there because looking is the only thing that would have found it.\n\nThat makes this file read UNREVIEWED rather than AI, and the distinction matters when you report a finding: you are telling an author what they have not yet checked, not making a claim about who wrote it. The handful of genuinely model-flavoured entries say so in their own **Why it reads AI** line.\n\nOne structural finding runs through the navigation entries and is worth reading first: `ia-is-a-projection-of-the-filesystem`. The flat nav, the fat footer, the empty mega-menu and the four-deep docs sidebar are four symptoms of one cause \u2014 the information architecture is a rendering of the directory listing, because enumeration is free and prioritisation needs knowledge the generator does not have.\n\nTwo entries here share a fix, which is unusual enough to name: switching a PDF export from `screenshot()` to `page.pdf()` makes the invoice text-selectable AND makes it honour a print stylesheet, so twelve lines of `@media print` repair browser printing and turn a dead raster receipt into a real document at the same time.",
        "pick": lambda i: i.get("lane") in {"navigation-and-ia", "i18n", "docs",
                                            "commerce", "email", "print"},
    },
    "accessibility-beyond-the-checklist.md": {
        "title": "Accessibility beyond the checklist",
        "intro": "Everything in this file is in the part of accessibility that automation cannot reach. The most generous coverage number any vendor publishes is axe-core's own \u2014 57.38% of issues BY VOLUME, and that figure is high precisely because the things automation catches (missing alt, low contrast, unlabelled fields) are the most numerous. Counted as distinct success criteria a machine can fully verify, coverage is around 30%: roughly 15 of WCAG 2.1 AA's 50.\n\nSo a green automated scan is the START of an accessibility review and never the end. Note the `assistive` detection type, which exists only in this file: about a third of these cannot be settled by a headless browser, because the finding is what a person HEARS. Filing those as `rendered` would invite someone to write an assertion, watch it pass, and launder a manual check into a green tick \u2014 which is the exact failure this whole skill exists to name.\n\n**Most of this reads UNREVIEWED rather than machine-written.** A hand-built 2011 jQuery site fails most of it too, and saying so is part of reporting it honestly. What IS distinctively model-flavoured is a smaller set with one shape: the model produces the APPEARANCE of accessibility work. An `aria-label` on a div. A redundant role on a semantic element. A role promised with no behaviour behind it. A live region that is conditionally rendered and therefore silent. Alt text that describes the photograph instead of doing its job. An accessibility statement asserting a conformance level nobody measured. Those six are the ones to weight, and there is a number behind them: WebAIM's 2026 crawl found home pages WITH ARIA averaging 59.1 errors against 42 for pages without, with more ARIA correlating with more errors. That is not causal, but it is a 17-error penalty attached to exactly the behaviour a model performs when you ask it to make something accessible.\n\nBefore working through this file, do the eleven steps in `references/five-minute-manual-pass.md`. It is written for someone who has never used a screen reader, it finds the majority of what is here, and every step of it passes axe.",
        "pick": lambda i: i.get("lane") == "accessibility",
    },
    "product-ux-writing.md": {
        "title": "UX writing inside the product",
        "intro": "The strings a logged-in user reads mid-task: errors, empty states, button labels, confirmations, notifications, field hints. Their quality bar is not whether they read well \u2014 it is whether they unblock someone who is stuck.\n\n**The mechanism that runs through the whole file, and the reason its findings are legible.** Under uncertainty about what failed, every substantive clause a model could write risks being wrong, and exactly one clause carries zero risk: the one about how sorry everyone is. So the generated string is optimised for the WRITER'S UNCERTAINTY rather than for the READER'S BLOCKAGE \u2014 and the two are anti-correlated. The less the system knows about the failure, the warmer the copy gets. A person who does not know what went wrong writes something terse and slightly embarrassed; a model writes something fluent and kind.\n\n**Why hard string matching is defensible here and nowhere else in this skill.** In prose a closed phrase list is a bad detector: the words have honest uses and the list ages out in months. UI strings are different in kind. A product's user-facing string table is small, enumerable and extractable \u2014 from i18n catalogs, from string literals in the render path, from the error and empty and toast slots in the rendered DOM. Within that surface the phrase space is genuinely narrow, because there are only so many ways to say nothing. \"Something went wrong\" is not a phrase with a good use at a different frequency; it is a phrase with no good use at all in a product that knows what went wrong. So these sets are hard matches rather than frequency cues, and where a set does not close, the item says so and routes to a judge pass.\n\n**One entry is the headline.** `collapsed-empty-states` is not a wording problem and wording cannot repair it: three unrelated situations \u2014 the user has never had data, their filter matched nothing, the fetch failed \u2014 produce the same observable in the component and collapse into one string. It needs a three-way probe, because the defect is a missing branch rather than a present string, and the condition that matters most is the third: an empty list after a failed load is what makes users believe their data was deleted.",
        "pick": lambda i: i.get("lane") == "microcopy",
    },
    "typographic-craft-and-tokens.md": {
        "title": "Typographic craft and design-system structure",
        "intro": "**The governing mechanism, and the thing to say when you report any item here.** A generator emits a stylesheet that is internally consistent and has no craft in it. Craft in typography is almost entirely per-context judgement \u2014 this heading at this size on this measure needs 1.05 leading and slightly negative tracking, and the one three sections down does not. A default is by construction context-free.\n\nSo the tell is never a WRONG VALUE. Any individual number in this file is defensible somewhere. The tell is **one value where there should have been a function of context**, and every static check here is a variant of the same computation: does this property vary with the thing it is supposed to vary with? Leading varies with size and measure, tracking with size, weight with role, contrast with theme, and colour with surface.\n\nThat framing matters for how you say it. You are not telling an author their 1.6 line-height is wrong; you are telling them that a 64px headline and 16px body copy cannot both want it.\n\n**Two cautions that will otherwise generate noise.** Read COMPUTED values, not declaration counts \u2014 utility frameworks bundle a tightening line-height into their size scale, so a page with no explicit `line-height` anywhere is usually correct and flagging it is the error. And restraint is not absence: a deliberately single-weight, single-ratio system is a real tradition and a good one, so the tell is one value PLUS no other axis carrying the hierarchy, never a low count on its own.\n\nThe last section is the cause behind most of the rest. `value-named-tokens-no-semantic-layer` and `semantic-layer-bypassed` are where the colour and scale findings come from: a primitive ramp looks maximally systematic and encodes zero decisions, and a semantic layer that exists but is never used is one of the highest-precision structural tells available \u2014 because a person who bothered to write the token file would have used it.",
        "pick": lambda i: i.get("lane") == "typographic-craft",
    },
    "performance-as-a-design-tell.md": {
        "title": "Performance and payload as a design tell",
        "intro": "**The organising idea.** A generator can see the markup it is writing. It cannot see a network waterfall, a byte count, a decode time, or which element wins LCP. So the tells cluster precisely where correctness-in-source and correctness-in-delivery come apart: the `<img>` is valid and the format is wrong; the font stack is tasteful and six weights ship; the component is correct React and it did not need to be React.\n\n**Say UNREVIEWED, not AI-generated, and mean it.** None of this reads \"AI\" the way a triplet fragment does. Three or four entries here are genuinely model-flavoured and say so in their own line; the rest would look identical coming from a person who shipped without watching the page load once. Be especially careful with the population-level claim, because it is the one that will get repeated: the mechanism is well understood and every individual tell in this file is measurable on any given page, but **there is no published measurement that AI-generated sites are heavier**. What exists measures AI-adjacent signals \u2014 builder subdomains, the spread of the indigo palette \u2014 and explicitly does not measure page weight. The blog posts asserting otherwise carry no methodology and recycle a mutated statistic from 2017.\n\n**Before using this file, read `references/performance-budget-and-folklore.md`.** It carries the budget a designer can hold \u2014 eleven numbers you can check in a design review without opening a profiler \u2014 and ten pieces of circulating folklore to drop, including the Lighthouse score, the parse-time constant, the shared font cache and the weight claim above. The budget is the more useful half: a score tells you where you landed, a budget tells a designer what they can spend before they spend it.",
        "pick": lambda i: i.get("lane") == "performance",
    },
    "tool-fingerprints.md": {
        "title": "Tool fingerprints \u2014 provenance, and the few that are also defects",
        "intro": "Read the first two items in this file before the other nineteen, because they are the rules the rest depends on.\n\n**A fingerprint tells you what made the page. It never tells you who wrote it, and it never tells you whether the page is any good.** Three collapses to refuse. Provenance is not authorship: a scaffold dependency in a repo proves where a project STARTED and says nothing about six months of commits since. Provenance is not defect: a CDN host and a server header are infrastructure, and stripping them is either impossible or pointless. And absence proves nothing, because every badge in the table below is removable by paying, so \"no badge\" is never evidence of hand-building. Wix and Squarespace are the sharpest case \u2014 their AI flows now seed the ordinary editor, so AI-built and hand-built output are provably identical in markup, and any finding of the form \"this is AI-generated because it is on Wix\" is simply false.\n\nSo most of this file is NOT findings. `scripts/humanize_review.py --provenance` reports it as a separate mode that writes no report and carries no severity, and that separation is deliberate.\n\n**What earns this file its place is the overlap set**: a handful of cases where the provenance string and a craft problem are the same bytes. An unwritten meta description that reads `Generated by v0`. A share card that is the builder's logo, or an auto-screenshot of a preview build. A favicon that is a build tool's logo. A palette nobody chose, still at the library's exact default oklch values. A generated headshot on an author byline. For those, the fix is never to hide the string \u2014 it is to do the work the string is pointing at, after which the string disappears as a side effect. That is the only removal that is honest, and it is the only advice that survives contact with someone who has to defend the site to their boss.\n\nOne entry in this file is about honesty rather than craft: invented clients, unverifiable testimonials and generated headshots on team pages. Everything else here is a quality judgement where reasonable people differ and \"I used a tool\" is a complete defence. That one is different \u2014 not because you should accuse anyone, but because being specific about what is unverifiable is an edit, and \"an empty Trusted by section is better than a fabricated one\" happens to be true.",
        "pick": lambda i: i.get("lane") == "provenance",
    },
    "dark-patterns-the-model-inherits.md": {
        "title": "Dark patterns the model inherits",
        "intro": "A model that produces a fake countdown or an asymmetric cookie banner is not choosing to deceive. These patterns are statistically NORMAL on the commercial web \u2014 Princeton found 1,818 dark-pattern instances across 1,254 of 11,000 shopping sites \u2014 so they are what \"build me a product page\" or \"add a cookie banner\" retrieves. Treat every item here as a high-confidence finding the author must decide about, never as an inference about intent.\n\nThe surprising part, and the reason this file exists separately: the unlawful thing is usually not the generated component but the GAP between two generated components. `tracking-before-consent` is the clean case \u2014 the analytics snippet is correct, the consent banner is correct, nothing connects them, and the site ends up with a compliant-looking banner sitting on top of a completed violation that no static check of either half would find. `cancellation-has-no-path` and `cost-revealed-at-last-step` have the same shape. So the highest-value checks in this file are RELATIONAL and RENDERED: load the page in a fresh profile and watch the network, rather than grepping either component.\n\nWhich also makes the fairness framing different here from the rest of the catalog. You are not telling an author they wrote something manipulative. You are telling them that two innocent halves add up to a fine.",
        "pick": lambda i: i.get("lane") == "dark-patterns",
    },
    "interaction-and-motion.md": {
        "title": "Interaction and motion \u2014 the property a generator cannot watch",
        "intro": "Motion is the one design property whose entire quality lives in TIME, and a generator emits it as a static string it can never watch run. That single fact predicts most of this file. Duration, easing and stagger are judgements made by watching, so the value that arrives is the corpus median applied uniformly — 300ms for a 2px hover tint and for a full-height sheet alike. And uniform motion is decoration by definition, because decoration is the only use of motion that needs no knowledge of what is actually happening on the page.\n\nThe second half of the file is about input devices. Hover is the state the author sees while building; focus only exists if you put the mouse down, and on a touchscreen hover latches on tap and never releases. None of that is visible in the source, which is why `hover-styles-without-a-hover-guard` and `hover-styled-focus-forgotten` are among the most reliable findings here.\n\nTwo items carry evidence rather than taste. Scroll capture: Nielsen Norman Group's usability testing found most participants at least mildly disoriented, several reading it as a bug rather than a design. And reduced motion: 35.4% of US adults aged 40 and over showed vestibular dysfunction in the 2001-2004 NHANES data, about 69 million people, which is why `prefers-reduced-motion` is not a nicety. Note the specific failure `reduced-motion-honoured-in-css-ignored-in-script` describes — the media query is satisfied while the parallax keeps running, because the query and the animation are two separately correct answers to two separately given instructions.\n\nRead `initial-state-hidden-so-content-depends-on-script` first. It is the only item here that loses content rather than polish.",
        "pick": lambda i: i.get("lane") == "interaction-and-motion",
    },
    "forms-and-input.md": {
        "title": "Forms and input \u2014 where the output is the start of the user's work",
        "intro": "A form is the one surface where the model's output is the BEGINNING of the user's work rather than the end of it. Everything else a generator produces is read; a form is operated — on a phone keyboard, through a password manager, after an error, under time pressure. None of those conditions exist in the markup, so the tells cluster exactly at the properties that only come into being while somebody is using it: the keyboard that opens, the value autofill puts in, what survives a failed submit.\n\n`submit-disabled-until-valid` is the headline and deserves its own paragraph. It is the most reproduced form pattern in generated code, it comes from a clean and testable sentence — \"disable submit until the form is valid\" — and it produces an interface where the control that would tell the user what is wrong is the control being withheld. Practitioners have argued against it for over a decade. Its worst instance is `validity-gate-misses-the-password-manager`: the gate listens for keyup, a password manager's fill does not produce one, and the user is left with a visibly complete form and a dead button having done everything right.\n\nThree items here are WCAG failures in their own right and are not inferences about authorship at all: missing autocomplete tokens (1.3.5 Identify Input Purpose, Level AA), errors not programmatically tied to their fields, and paste blocked on a password field (3.3.8 Accessible Authentication). Act on those with full confidence.\n\nWhere this file gives numbers they come from published research rather than from this catalog: Google reports correct autocomplete cutting checkout time by up to about 30%, and Baymard attributes 18% of checkout abandonment to a long or complicated process against a tracked ~70% overall rate. The GOV.UK error-summary pattern is the reference implementation for the error half, built for people completing services under stress.",
        "pick": lambda i: i.get("lane") == "forms-and-input",
    },
    "research-papers.md": {
        "title": "Research papers \u2014 checks that point outward, at the world",
        "intro": "A paper's sentences and its checkable commitments come out of the same machinery at the same confidence, and nothing in the finished artifact marks which is which. A generator emits a reference, a sample size, a model version and a reviewer's objection in exactly the register it emits connective prose. So the characteristic failure is not that the writing sounds wrong — it is that the paper's verifiable claims were never verified by anyone, the author included.\n\nThat is why every honest check here points OUTWARD, at the world the manuscript claims to describe: does this DOI resolve to this paper, does the body contain the abstract's number, does this review's objection match anything in the submission. Those checks are about truth rather than authorship. They cost an accused author nothing when they come back clean, and they survive the fact that the population most likely to leave a style marker in a manuscript is the population writing in its second language.\n\n**Two numbers frame the lane.** Topaz and colleagues verified 97.1 million references across about 2.5 million PubMed-indexed papers: the share with at least one fabricated reference went from 1 in 2,828 in 2023 to 1 in 458 in 2025 to 1 in 277 in early 2026, review articles ran 57% higher than other types, and over 98% saw no publisher action. And the human baseline that keeps it honest: 16.9% of quotations in the medical literature already fail to support the sentence they are attached to. Citation checking finds a great deal of ordinary human error, and that is fine, because the fix is the same either way.\n\n**The most actionable item here is a triage rule, not a defect.** `unchecked-tail-of-the-bibliography` rests on a measured gradient: fidelity of model-generated citations correlates with the cited paper's citation count at r = 0.75, saturating near verbatim recall above roughly 1,000 citations. Citation count proxies training-corpus redundancy, so a model recites the famous and synthesises the rest. Sort the bibliography ascending by citation count and verify from the bottom — and note the corollary, that checking the canonical references proves nothing.\n\n**Three things this lane refuses to claim.** A p-value without an effect size is not a tell: 98.06% of 310 papers in Science, Nature and Nature Neuroscience in 2022 gave no confidence intervals. An abstract overstating its results is not one either: measured spin in human-written RCT abstracts runs 49.1% to 85.7% by field. And a fabricated reference does not mean a generated paper — 91% of affected PubMed papers had one or two. The modal case is a researcher who did not check one citation.\n\n**Tortured phrases are in this file and they are not an AI tell.** Cabanac and Labbe's mechanism is word-level machine paraphrasing used to evade text-matching plagiarism detection; instruction-tuned models preserve technical terms. Anyone citing them as proof of ChatGPT use is wrong about the tool and therefore wrong about the remedy.",
        "pick": lambda i: i.get("lane") == "research-papers",
    },
    "scientific-figures.md": {
        "title": "Scientific figures \u2014 checked in the code that drew them",
        "intro": "A figure is produced by code, and the render sits on the other side of a step the author never watched. The generator commits to `savefig(...)` without ever seeing that the legend landed on the data, that the tick labels are clipped, that 10pt became 2.9pt in an 89mm column, or that the two series print as the same grey. That is why the honest word here is UNREVIEWED rather than AI-generated — and why most of the lane is greppable in the `.py` or `.R` rather than in the pixels.\n\n**Three things get conflated constantly and are kept apart here.** *Image integrity* (duplication, splicing) is a research-integrity matter with its own literature and process, it predates generative models entirely, and the two items covering it say so in capitals. *Generated imagery* is three items. *Unreviewed plotting* is the other twenty-four, and it carries no misconduct implication at all — the data is real and the defaults were never adjusted.\n\n**The arithmetic that makes this structural.** Effective type size is the declared size times the ratio of printed width to figure width. Nature's single column is 89mm (3.50in) and wants 5-7pt; matplotlib's default 10pt in a `figsize=(12,8)` figure lands at 2.92pt. `savefig.dpi` defaults to `'figure'` and `figure.dpi` to 100, so the default figure is written at 640x480 — below PLOS's stated 789px minimum width outright. Neither is visible in the notebook preview.\n\n**The canonical case, with the usual telling corrected.** The Frontiers rat figure was published on 13 February 2024 and retracted on 16 February, three days later; Midjourney was disclosed by the authors. The widely repeated claim that no reviewer looked is wrong. Frontiers stated that one of the reviewers raised valid concerns about the figures and requested revisions, and that the authors failed to respond. The failure was editorial workflow, not reviewer inattention — which changes the fix.\n\n**There is no detector for “is this figure generated” and this file will not pretend otherwise.** Benchmarked against 72,965 real and 150,807 synthetic figures, the best zero-shot method reached 53.68% and most sat at chance, with the characteristic failure being near-100% on real images and 0-3% on synthetic. Cross-generator transfer collapses to 26.1%, and JPEG compression at q=30 takes the best method from 93.96% to 75.94% — and every figure in a PDF has been compressed.\n\n**Four entries elsewhere in this catalog INVERT here** and have been scoped accordingly: journals want vector and reject PNG/JPEG/TIFF for main figures, they want submitted SVG to retain its editing capability rather than be optimised, and a figure's accessible description is its caption, which is required to be long.",
        "pick": lambda i: i.get("lane") == "scientific-figures",
    },
    "latex-source.md": {
        "title": "LaTeX source \u2014 it compiled, and nobody opened the PDF",
        "intro": "LaTeX source is a program nobody in the loop has run — and the tell is never that it failed to compile. Syntax errors are a small share of LLM LaTeX errors; package errors and logical or formatting errors dominate. The tell is that it COMPILED and nobody opened the PDF.\n\nThat predicts the whole lane. Generated `.tex` reaches for LaTeX's VISUAL layer — `\\\\`, `\\vspace`, `\\textbf`, a typed-out “Figure 1” — over its SEMANTIC layer — `\\label`/`\\ref`, `\\emph`, `\\cite`, `\\section`, `\\qty` — because the visual layer is the only one verifiable from the token stream alone. A counter has no value until TeX assigns one, so a generator writes the number it can see.\n\n**Read the family field carefully here.** Ten of these are `defect`: they are reproducible by compiling, so they carry no fairness caveat at all — an undefined macro, a `\\ref` rendering `??`, unbalanced braces, a duplicate BibTeX key, a declaration used as a command. The rest are craft, and craft is contestable.\n\n**This lane makes no claim that any of it is commoner in generated than in hand-written LaTeX, and the honest reason is uncomfortable.** The largest mined corpus of real LaTeX faults is a taxonomy of HUMAN faults with the same top categories — undefined control sequence, brace group, math mode. People break LaTeX in exactly these ways. Every item here reads UNREVIEWED unless it says otherwise, and the value is that the finding is worth fixing either way.\n\n**Two items are about what the source reveals rather than what it renders.** arXiv publishes your `.tex`: one study of 600,000 submissions found 27% of uploaded bytes were residual, including comments about coauthors and over 1,500 Google Docs links, 200 of them open to anyone. And `hidden-instruction-to-machine-reader` is the inverse of everything else in this catalog — white text or a 1pt font carrying “give a positive review”, aimed at a referee's model. That is deliberate and adversarial, not residue, and it belongs to the venue's integrity process rather than to an editing pass.",
        "pick": lambda i: i.get("lane") == "latex",
    },
}

# Education and title chrome are independent review lanes, not model dialects.
GROUPS.update({
    "connected-prose.md": {
        "title": "Connected prose and public-copy cadence",
        "intro": "Review sentence relationships before polishing rhythm. These editorial rubrics cover missing causes, consequences, comparisons and referents, along with repetitive rhetoric and compressed syntax. Read connected-prose-research.md for evidence boundaries and examples/before-after-connected-prose.md for repairs. Meaning-based findings require a reader; numerical cutoffs locate candidates only.",
        "pick": lambda i: i.get("lane") == "connected-prose",
    },
    "educational-exposition.md": {
        "title": "Educational exposition and concept progression",
        "intro": "Audit what a reader can do with an idea before later material depends on it. These are pedagogical and editorial checks, not authorship tests. General learning research supports many repairs; evidence specific to AI tutoring is labeled and bounded in education-and-chrome-research.md. Learning-map checks validate reviewer annotations rather than learner mastery.",
        "pick": lambda i: i.get("lane") == "educational-exposition",
    },
    "content-chrome.md": {
        "title": "Title layers and content chrome",
        "intro": "Count visible layers, then ask what each contributes. A caption, heading and subtitle can all be useful. The defect is repeated meaning or lost orientation, not a particular font, number of lines or fashionable palette. The structural scanner emits candidates only; inspect the rendered page or PDF before editing.",
        "pick": lambda i: i.get("lane") == "content-chrome",
    },
    "instructional-media-and-notes.md": {
        "title": "Instructional media and source-bound notes",
        "intro": "Review generated diagrams, video, audio, notebooks and notes against the task they claim to serve. Visual polish, smooth motion and fluent narration do not establish factual fidelity. These checks require source comparison or actual playback; this bundle does not automate OCR, audio analysis or notebook execution.",
        "pick": lambda i: i.get("lane") == "instructional-media",
    },
})
DIAGRAMS.update({
    "connected-prose.md": """flowchart TD
    A[Read the paragraph for its intended reader] --> B{Missing relation or referent?}
    B -->|yes| C[Verify and state the missing step]
    B -->|no| D{Rhetorical pattern doing useful work?}
    D -->|yes| E[Keep it]
    D -->|no| F[State the claim directly]
    C --> G[Check meaning, facts and reader action]
    F --> G""",
    "educational-exposition.md": """flowchart TD
    A[State target task and prior knowledge] --> B{Prerequisites established?}
    B -->|no| C[Teach or explicitly declare them]
    B -->|yes| D{Hard decision visible in example?}
    D -->|no| E[Work the step and explain why]
    D -->|yes| F{Independent changed case available?}
    F -->|no| G[Add or link practice and feedback]
    F -->|yes| H[Assess retrieval later; do not infer mastery]""",
    "content-chrome.md": """flowchart TD
    A[Title stack candidate] --> B{Required by venue or useful taxonomy?}
    B -->|yes| C[Preserve its distinct function]
    B -->|no| D{What does deleting each layer lose?}
    D -->|scope or orientation| C
    D -->|nothing| E[Merge or remove the repeated layer]
    E --> F[Check rendered hierarchy and accessibility]
    C --> F""",
    "instructional-media-and-notes.md": """flowchart TD
    A[Identify teaching or source fidelity claim] --> B{Which medium?}
    B -->|diagram| C[Verify nodes edges and link meanings]
    B -->|video or audio| D[Play and compare labels sequence and narration]
    B -->|notes| E[Trace decisions and omissions to source spans]
    B -->|notebook| F[Check declared state and execution evidence]
    C --> G[Report observed mismatch and limitations]
    D --> G
    E --> G
    F --> G""",
})

# Which axis each generated reference sits on. The files are VIEWS over one
# catalog, not a partition: by model dialect, and by artifact medium. An item
# may appear once on each axis -- "what Codex does" and "what is wrong with your
# commits" are both true of the same tell, and a reader arrives from either
# direction. Two homes on the SAME axis is a bug, and a lane item belongs to
# exactly one file, full stop.
AXIS = {
    "claudeisms.md": "dialect",
    "gptisms-codexisms.md": "dialect",
    "other-model-dialects.md": "dialect",
    "visual-design-tells.md": "medium",
    "generated-media-tells.md": "medium",
    "document-and-deck-structure.md": "medium",
    "marketing-and-platform-tells.md": "medium",
    "web-build-defects.md": "medium",
    "engineering-artifact-tells.md": "medium",
    "fiction-and-narrative-tells.md": "medium",
}

SEV_RANK = {"high": 0, "medium": 1, "low": 2}
CURRENCY_NOTE = {
    "obsolete": "⚠ OBSOLETE — retained as a caution, not as a test.",
    "fading": "Fading — still seen, but vendors have patched toward it and it is weakening.",
    "current": "",
}


SEV_MARK = {"high": "HIGH", "medium": "med", "low": "low"}


def contents_table(picked):
    """A scannable index of one reference file.

    14,934 lines of reference across the bundle is unreadable front to back, and
    an agent invoking this skill needs to find the three items that apply to the
    artifact in front of it. Severity, family and whether the scripts already
    check it are the three facts that decide whether an entry is worth opening.
    """
    rows = ["## What is in this file", "",
            "Severity reflects the consequence for the intended reader, never how sure you should "
            "be about who wrote it. **Automated** means these scripts implement the check; "
            "*no* means it is yours to ask in the judge pass.", "",
            "| item | severity | family | automated |",
            "| --- | --- | --- | --- |"]
    for i in picked:
        auto = "yes" if i["name"] in IMPLEMENTED else (
            "n/a" if i["detection_type"] in ("llm-judge", "assistive") else "**no**")
        rows.append(f"| [`{i['name']}`](#{i['name']}) | {SEV_MARK.get(i['severity'], i['severity'])} "
                    f"| {i.get('family', '')} | {auto} |")
    rows.append("")
    return rows


def block(i):
    def quote(text):
        return "\n".join("> " + line if line else ">" for line in text.split("\n"))

    L = [f"<a id=\"{i['name']}\"></a>",
         (f"### `{i['name']}`  ·  {i['severity']} · {i['dialect']} · {i['medium']} · "
          + f"{i.get('detection_type','')} · family: {i.get('family','')}"
          + (f" · lane: {i['lane']}" if i.get("lane") else "")), ""]
    if i.get("detection_type") in ("structural", "rendered"):
        L += [("**Automated here:** yes, these scripts implement it."
               if i["name"] in IMPLEMENTED else
               "**Automated here:** no \u2014 decidable mechanically, but this bundle "
               "does not implement it. Ask it yourself in the judge pass."), ""]
    note = CURRENCY_NOTE.get(i.get("currency", "current"), "")
    if note:
        L += [f"**Currency:** {note}", ""]
    L += [i["description"], ""]
    if i.get("why_it_reads_ai"):
        L += [f"**Why it reads AI:** {i['why_it_reads_ai']}", ""]
    L += [f"**Detect:** {i['detection']}", ""]
    if i.get("thresholds"):
        pairs = ", ".join(f"`{k}` = {v}" for k, v in i["thresholds"].items())
        L += [f"**Thresholds** (read by `scripts/humanize_review.py`): {pairs}", ""]
    L += [f"**Fix:** {i['fix']}", ""]
    if i.get("false_positive_when"):
        L += [f"**False positive when:** {i['false_positive_when']}", ""]
    if i.get("confidence"):
        L += [f"**Confidence:** {i['confidence']}", ""]
    if i.get("evidence"):
        L += [f"**Evidence:** {i['evidence']}", ""]
    if i.get("before"):
        L += ["**Before**", "", quote(i["before"]), ""]
    if i.get("after"):
        L += ["**After**", "", quote(i["after"]), ""]
    return "\n".join(L)


for _fname, _g in GROUPS.items():
    if _fname in DIAGRAMS:
        _g["diagram"] = DIAGRAMS[_fname]
_missing_diagram = sorted(set(GROUPS) - set(DIAGRAMS) - {"sources.md"})
if _missing_diagram:
    print(f"note: no decision diagram for {', '.join(_missing_diagram)}", file=sys.stderr)

placed = set()
# name -> the files that claimed it. The orphan guard below catches an item that
# lands in NO file; it cannot catch one that lands in several, which is the bug
# that actually happened: a single entry appeared in three generated references
# and every per-file count stopped meaning anything. Track homes, not membership.
homes = {}
for fname, g in GROUPS.items():
    picked = sorted((i for i in items if g["pick"](i)),
                    key=lambda i: (SEV_RANK.get(i["severity"], 3), i["name"]))
    placed |= {i["name"] for i in picked}
    for i in picked:
        homes.setdefault(i["name"], []).append(fname)
    doc = [f"# {g['title']}", "", g["intro"], "",
           (f"_{len(picked)} items. Generated from catalog.json — edit there, then re-run "
            + "`scripts/regenerate_references.py`. Do not hand-edit this file._"), "",
           ("_Every item carries a **False positive when** line. Read it before you act on "
            + "the item: these are cues for an editor, not evidence about an author._"), ""]
    # The diagram and the index go INSIDE the ignore block. A decision diagram
    # legitimately QUOTES the residue it tells you to look for -- one of them
    # contains the literal string "Certainly, here is" -- and mermaid node labels
    # are not sentences, so scoring them as prose reads a diagram as staccato
    # fragments. Both were real findings against this bundle before the boundary
    # moved. The intro above stays reviewed, which is where Law 2 has teeth.
    doc += ["<!-- humanize:ignore-start",
            "     The diagram and index below quote the tells they document, and a",
            "     mermaid label is not a sentence. -->", ""]
    if g.get("diagram"):
        doc += ["## When this file applies", "", "```mermaid", g["diagram"].strip(),
                "```", ""]
    doc += contents_table(picked)
    doc += ["<!-- humanize:ignore-end -->", "",
            "<!-- humanize:ignore-start",
           "     Everything below is a specimen catalog. It quotes the tells it documents,",
           "     including literal machine residue, so reviewing it with humanize_review.py",
           "     would flag the exhibits rather than the writing. -->", ""]
    doc += [block(i) for i in picked]
    doc += ["<!-- humanize:ignore-end -->", ""]
    (REF / fname).write_text("\n".join(doc), encoding="utf-8")
    print(f"{fname}: {len(picked)} items")

HANDWRITTEN = {"fairness-and-false-positives.md", "five-minute-manual-pass.md",
               "connected-prose-research.md",
               "existing-artifact-review.md",
               "review-workflow.md", "reader-context-and-evidence.md",
               "activation-examples.md",
               "structure-and-deck-tells.md",  # compatibility navigation, no stale rules
               "performance-budget-and-folklore.md", "education-and-chrome-research.md",
               "review-decisions.md", "INDEX.md"}
_on_disk = {p.name for p in REF.glob("*.md")}
_orphan_files = sorted(_on_disk - set(GROUPS) - HANDWRITTEN - {"sources.md"})
if _orphan_files:
    print("\nERROR: these reference files are on disk but no longer generated:",
          file=sys.stderr)
    for o in _orphan_files:
        print(f"  references/{o}", file=sys.stderr)
    print("A split or rename leaves the old file behind, still indexed and still "
          "citable, with content that goes stale silently. Delete it, or add its "
          "GROUPS entry back.", file=sys.stderr)
    sys.exit(1)

bad_homes = {}
for n, files in homes.items():
    it = next(x for x in items if x["name"] == n)
    if it.get("lane"):
        # A lane item is documented in its lane file and nowhere else. Without
        # this, one entry appeared in three files and every count was inflated.
        if len(files) > 1:
            bad_homes[n] = (files, "lane item with more than one home")
        continue
    per_axis = {}
    for f in files:
        per_axis.setdefault(AXIS.get(f, f"lane:{f}"), []).append(f)
    for axis, fs in per_axis.items():
        if len(fs) > 1:
            bad_homes[n] = (fs, f"listed twice on the {axis} axis")
if bad_homes:
    print("\nERROR: these catalog items are documented in the wrong number of places:",
          file=sys.stderr)
    for n, (files, why) in sorted(bad_homes.items()):
        it = next(x for x in items if x["name"] == n)
        print(f"  {n}  -> {', '.join(files)}"
              f"   ({why}; lane={it.get('lane') or '-'} medium={it['medium']})",
              file=sys.stderr)
    print("Cross-listing across the dialect and medium axes is fine and intended. "
          "Twice on ONE axis is not, and a lane item needs exactly one home -- a "
          "medium-based pick almost always needs `not i.get(\"lane\")`.", file=sys.stderr)
    sys.exit(1)

orphans = [i["name"] for i in items if i["name"] not in placed]
if orphans:
    print("\nERROR: these catalog items land in no generated reference:", file=sys.stderr)
    for o in orphans:
        it = next(x for x in items if x["name"] == o)
        print(f"  {o}  (dialect={it['dialect']} medium={it['medium']})", file=sys.stderr)
    print("Add a GROUPS rule that covers them, or fix the item's dialect/medium.",
          file=sys.stderr)
    sys.exit(1)

# The fingerprint table is the script's, not a copy of it: importing it means a
# string added to one is in the other, and neither can quietly go stale.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from humanize_review import FINGERPRINTS                      # noqa: E402

fp_rows = {}
for tool, tier, pat, what in FINGERPRINTS:
    fp_rows.setdefault((tool, tier), []).append((what, pat))
fp_doc = ["", "---", "", "## The greppable table",
          "",
          ("Every literal below was verified against a live production page or by code search "
           "with a hit count. This table is generated from `FINGERPRINTS` in "
           "`scripts/humanize_review.py`, which is what `--provenance` scans, so the two cannot "
           "drift apart."),
          "",
          ("Tier A is a near-unique literal. Tier B is strong but shared or removable. Band your "
           "confidence: three or more signals for one tool is a positive, two is probable, one "
           "is a hint."),
          "",
          "| Tool | Tier | What it marks | Pattern |", "|---|---|---|---|"]
for (tool, tier), rows in sorted(fp_rows.items(), key=lambda kv: (kv[0][1], kv[0][0].lower())):
    for what, pat in rows:
        esc = pat.replace("|", "\\|")
        fp_doc.append(f"| {tool} | {tier} | {what} | `{esc}` |")
fp_doc += ["",
           ("**Two implementation warnings.** Attribute order is not stable \u2014 Webflow "
            "ships `<meta content=\"Webflow\" name=\"generator\"/>` while others put `name` "
            "first, so parse the tag rather than matching it whole. And never probe for leaked "
            "agent files by HTTP status alone: `/CLAUDE.md`, `/AGENTS.md`, `/.cursorrules`, "
            "`/.env` and `/package.json` all return 200 on single-page-app hosts, because they "
            "serve `index.html` for every unknown path."),
           ""]
fp_path = REF / "tool-fingerprints.md"
fp_path.write_text(fp_path.read_text(encoding="utf-8").rstrip("\n")
                   + "\n" + "\n".join(fp_doc), encoding="utf-8")
print(f"tool-fingerprints.md: + greppable table ({len(FINGERPRINTS)} patterns)")

src_doc = ["# Sources", "",
           "Published catalogs, stylometry research, and essays the catalog draws on.",
           "", "_Generated from catalog.json. Do not hand-edit._", "",
           "<!-- humanize:ignore-start -- source titles and notes quote machine artifacts. -->", ""]
for s in sorted(sources, key=lambda s: s["title"].lower()):
    note = f" — {s['note']}" if s.get("note") else ""
    src_doc.append(f"- [{s['title']}]({s['url']}){note}")
src_doc.append("\n<!-- humanize:ignore-end -->")
(REF / "sources.md").write_text("\n".join(src_doc) + "\n", encoding="utf-8")
print(f"sources.md: {len(sources)} sources")
print(f"\nall {len(items)} items placed, exactly one home each")
