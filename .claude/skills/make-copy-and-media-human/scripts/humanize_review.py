#!/usr/bin/env python3
"""humanize_review.py — flag AI-isms in copy/media and emit a static HTML fix plan.

Stdlib only. Two detection layers:

  1. STRUCTURAL (this script): countable signals only — densities, variances,
     ratios, codepoints, hex values, font names, identifier overlap.
  2. LLM-JUDGE (the agent running the skill): phrase-level tropes are judged
     by the model against references/catalog.json, written to a findings JSON,
     and merged into the report via --findings.

THREE THINGS THIS SCRIPT BELIEVES, each of which cost someone a false accusation
to learn:

  (a) Unconverted citation tokens are editing defects in ordinary prose.
      Unicode spaces also have legitimate locale and typography uses; their
      presence does not establish copying, AI use, or a need for normalization.

  (b) Rhythm is not evidence. Em-dash rate, comma rate, contraction rate and
      sentence-length variance all overlap heavily between models and humans.
      Melville runs 8.1 em dashes per 1,000 words; Llama runs zero. The gptme
      anti-slop detector measured its em-dash rule flagging ~64% of legitimate
      technical blog posts. So this family is capped at LOW severity on its own
      and only escalates when --baseline shows a jump against THIS author's own
      prior writing.

  (c) The catalog owns the numbers. Thresholds live in references/catalog.json
      under each item's "thresholds" key. DEFAULT_THRESHOLDS below is only the
      fallback for a copy of this script living outside its bundle. Previously
      the catalog said 5/1000 words and the code said 12/1000; nobody noticed
      because nothing tied them together.

Every ism id emitted here is a real key in catalog.json; --validate proves it.
That is what lets a finding be joined back to its rubric, fix, and sources.

Usage:
  python3 scripts/humanize_review.py FILE [FILE...] --out report.html
  python3 scripts/humanize_review.py FILE --baseline 'posts/*.md' --out report.html
  python3 scripts/humanize_review.py FILE --findings judge.json --out report.html
  python3 scripts/humanize_review.py FILE --fail-on high          # CI gate
  python3 scripts/humanize_review.py --selftest
  python3 scripts/humanize_review.py --validate

Suppression: wrap quoted or demonstrative material in
  <!-- humanize:ignore-start --> ... <!-- humanize:ignore-end -->
A document that exhibits AI-isms on purpose needs this, or it flags its own
evidence. This skill's own examples do.

Findings JSON (from the agent's judge pass):
  [{"file": "...", "line": 12, "excerpt": "...", "ism": "negation-contrast-frame",
    "dialect": "claude", "severity": "high", "explanation": "...",
    "rewrite": "..."}]
"""

import argparse
import glob as globmod
import html
import json
import re
import statistics
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from implemented_checks import implemented_ids

CATALOG_PATH = Path(__file__).resolve().parent.parent / "references" / "catalog.json"

# Fallback only. The catalog overrides every one of these when present.
DEFAULT_THRESHOLDS = {
    "em-dash-density": {"min_words": 120, "cue": 1.0, "baseline_ratio": 2.5},
    "comma-inflation": {"min_words": 200, "cue": 9.0, "baseline_ratio": 1.5},
    "staccato-fragment-triplet": {"min_run": 3, "max_words": 4},
    "low-burstiness-uniform-rhythm": {"min_sentences": 12, "cue_cv": 0.42, "baseline_ratio": 0.7},
    "zero-typo-zero-contraction-affect-flatness": {"min_words": 250, "baseline_ratio": 0.5},
    "deontic-softening": {"min_modals": 4, "cue_ratio": 0.8},
    "participial-tail": {"min_words": 150, "cue_per_100w": 0.7},
    "nominalization-density": {"min_words": 150, "cue_per_100w": 7.0},
    "copula-avoidance": {"min_copular": 6, "cue_share": 0.35},
    "pronoun-evacuation": {"min_words": 250, "cue_per_100w": 0.8},
    "specificity-starvation": {"min_words": 300, "cue_per_100w": 2.0},
    "repo-context-leak": {"min_count": 4, "cue_per_1000w": 3.0},
    "definition-after-use": {"min_terms": 2, "max_gap_lines": 12},
    "signposting-without-structure": {"min_count": 3},
    "linkedin-broetry-one-line-runs": {"min_run": 4, "max_words_per_line": 14},
    "paragraph-length-monoculture": {"min_paragraphs": 8, "cue_cv": 0.25},
    "heading-spam": {"min_headings": 5, "ratio": 0.5},
    "bullet-colonization-of-prose": {"min_bullets": 10, "cue_share": 0.45},
    "bold-label-colon-bullet": {"min_count": 4},
    "arrow-chain-as-explanation": {"min_arrows": 2},
    "emoji-section-headers": {"min_count": 2},
    "checkmark-bullet-grid": {"min_count": 3},
    "horizontal-rule-spam": {"min_count": 3},
    "title-case-heading-uniformity": {"min_headings": 4, "share": 0.8},
    "heading-level-skip": {"min_headings": 3},
    "challenges-and-future-directions": {"min_count": 1},
    "invisible-unicode-artifacts": {"min_count": 1},
    "curly-straight-quote-mixing": {"min_of_each": 2},
    "markdown-leak-in-unrendered-medium": {"min_count": 3},
    "tracking-param-residue": {"min_count": 1},
    "unfilled-placeholder-residue": {"min_count": 1},
    "model-markup-residue": {"min_count": 1},
    "ai-default-token-repetition": {"min_count": 3},
    "pull-quote-that-quotes-nothing": {"min_count": 1},
    "hero-with-nothing-to-look-at": {"min_count": 1},
    "undifferentiated-section-padding": {"min_sections": 4},
    "obligatory-dual-cta": {"min_count": 1},
    "triplicate-grid": {"min_sections": 3},
    "magnitudes-without-a-baseline": {"min_count": 1},
    "testimonial-with-no-traceable-source": {"min_count": 1},
    "one-family-no-contrast": {"min_count": 1},
    "centred-body-copy": {"min_count": 6},
    "untouched-default-icon-set": {"min_count": 1},
    "reveal-animation-on-everything": {"min_count": 8},
    "hand-rolled-div-dialog": {"min_count": 1},
    "escape-and-focus-declared-not-wired": {"min_count": 1},
    "missing-autofill-attributes": {"min_inputs": 3},
    "table-without-sort-filter-paging": {"min_columns": 4},
    "sort-header-not-button-no-aria-sort": {"min_count": 1},
    "unbounded-spinner-no-error-path": {"min_count": 1},
    "settings-flat-toggle-wall": {"min_toggles": 8},
    "nav-without-active-state": {"min_links": 3},
    "hamburger-at-desktop-width": {"min_count": 1},
    "decorative-site-search": {"min_count": 1},
    "footer-sitemap-dump": {"min_links": 12, "dead_share": 0.3},
    "lang-frozen-on-locale-switch": {"min_count": 1},
    "rtl-unsupported-physical-properties": {"phys_ratio": 5.0},
    "name-and-address-shape-assumed": {"min_markers": 2},
    "text-baked-into-image": {"min_alt_words": 8},
    "flag-as-language-selector": {"min_flags": 2},
    "consent-choice-asymmetry": {"area_ratio": 1.5},
    "tracking-before-consent": {"min_count": 1},
    "prechecked-optin": {"min_count": 1},
    "confirmshaming-decline-label": {"min_count": 1},
    "no-print-stylesheet": {"min_hostile": 2},
    "docs-generator-defaults-unmodified": {"min_markers": 3},
    "docs-search-indexes-nothing": {"min_count": 1},
    "hardcoded-locale-formats": {"min_count": 1},
    "sentence-assembled-from-fragments": {"min_count": 1},
    "countdown-that-resets": {"min_count": 1},
    "fabricated-live-activity-counter": {"min_count": 1},
    "modal-on-first-paint": {"min_count": 1},
    "cancellation-has-no-path": {"min_count": 1},
    "checkout-without-guest-option": {"min_count": 1},
    "no-plain-text-part": {"min_count": 1},
    "email-built-with-web-css": {"min_count": 1},
    "preheader-never-set": {"min_count": 1},
    "receipt-generated-as-screenshot": {"min_count": 1},
    "code-sample-not-runnable": {"min_blocks": 4, "untagged_share": 0.5},
    "every-page-opens-with-in-this-guide": {"min_consecutive": 3},
    "scaffold-title-and-favicon-residue": {"min_count": 1},
    "builder-default-og-image": {"min_count": 1},
    "shadcn-default-tokens-untouched": {"min_count": 1},
    "ai-image-default-filenames": {"min_count": 1},
    "agent-instruction-shipped-to-production": {"min_count": 1},
    "keywords-meta-placeholder": {"min_count": 1},
    "per-character-text-spans": {"min_runs": 6},
    "aria-label-on-a-generic-element": {"min_count": 1},
    "redundant-role-on-a-semantic-element": {"min_count": 1},
    "conditionally-rendered-live-region": {"min_count": 1},
    "aria-label-cloaks-the-text-that-was-already-there": {"min_extra_chars": 8},
    "accessible-name-does-not-match-the-visible-label": {"min_count": 1},
    "promised-role-with-no-behaviour": {"min_count": 1},
    "narrating-alt-text": {"max_chars": 125},
    "heading-levels-chosen-for-size": {"min_count": 1},
    "landmarks-duplicated-and-unnamed": {"min_landmarks": 2},
    "link-text-that-only-works-next-to-its-picture": {"min_repeats": 3},
    "data-rendered-as-divs-with-no-header-association": {"min_count": 1},
    "type-sized-in-viewport-units": {"min_count": 1},
    "forced-colors-mode-erases-the-interface": {"min_count": 1},
    "auto-advancing-content-with-no-pause": {"min_count": 1},
    "instructions-live-only-in-the-placeholder": {"min_chars": 16},
    "accessibility-overlay-installed": {"min_count": 1},
    "exclamation-in-system-strings": {"max_rate": 0.083},
    "global-line-height-never-scaled": {"min_display_rem": 2.0},
    "line-height-in-fixed-units": {"min_count": 1},
    "heading-space-symmetric": {"tolerance": 0.2},
    "no-balance-on-headings": {"min_display_rem": 2.0},
    "proportional-figures-in-data-tables": {"min_count": 1},
    "live-numbers-without-tabular-nums": {"min_count": 1},
    "type-scale-step-inflation": {"max_sizes": 9},
    "type-scale-with-no-ratio": {"max_ratio_spread": 1.4},
    "off-scale-one-off-sizes": {"min_count": 1},
    "root-font-size-locked-in-px": {"min_count": 1},
    "opsz-axis-unused": {"min_count": 1},
    "faux-bold-from-missing-weight": {"min_count": 1},
    "two-weights-five-jobs": {"min_roles": 5},
    "pure-black-on-pure-white": {"min_count": 1},
    "opacity-as-text-hierarchy": {"min_count": 1},
    "text-colour-proliferation": {"max_colors": 8},
    "semantic-layer-bypassed": {"min_primitives": 5},
    "dark-mode-by-inversion": {"min_count": 1},
    "hero-image-as-full-resolution-png": {"min_count": 1},
    "gradient-mesh-shipped-as-raster": {"min_count": 1},
    "no-modern-image-format-anywhere": {"min_images": 5},
    "single-source-full-bleed-image": {"min_count": 1},
    "lazy-loaded-lcp-image": {"min_count": 1},
    "lcp-image-without-fetchpriority": {"min_images": 3},
    "stock-photo-at-source-resolution": {"min_count": 1},
    "autoplay-background-video-no-poster": {"min_count": 1},
    "font-weights-ordered-not-used": {"min_declared": 4},
    "google-fonts-cdn-render-blocking": {"min_count": 1},
    "font-display-absent-or-block": {"min_count": 1},
    "icon-webfont-for-a-handful-of-icons": {"min_count": 1},
    "webgl-library-for-decoration": {"min_count": 1},
    "animation-library-for-css-effects": {"min_count": 1},
    "smooth-scroll-library-on-a-brochure": {"min_count": 1},
    "use-client-on-a-static-page": {"min_count": 1},
    "spa-shell-for-a-brochure-site": {"min_count": 1},
    "render-blocking-head-stack": {"min_blocking": 3},
    "default-third-party-stack": {"min_origins": 4},
    "framework-look-without-responsive": {"min_idiom": 25},
    "missing-viewport-meta": {"min_count": 1},
    "div-soup-no-semantics": {"min_divs": 20, "max_semantic_share": 0.08},
    "clickable-div-not-button": {"min_count": 1},
    "dead-anchor-href": {"min_count": 3},
    "scaffold-title-residue": {"min_count": 1},
    "placeholder-copy-residue": {"min_count": 1},
    "missing-or-placeholder-alt": {"min_count": 2},
    "focus-outline-removed": {"min_count": 1},
    "no-reduced-motion-guard": {"min_animations": 6},
    "important-escalation": {"min_count": 8},
    "z-index-escalation": {"max_z": 100},
    "hundred-vw-overflow": {"min_count": 1},
    "static-vh-full-height": {"min_count": 1},
    "missing-html-lang": {"min_count": 1},
    "tailwind-play-cdn-in-production": {"min_count": 1},
    "h1-absent-or-competing": {"min_count": 1},
    "no-meta-description-or-og-image": {"min_count": 1},
    "input-without-label": {"min_count": 1},
    "form-without-destination": {"min_count": 1},
    "debug-residue-in-production": {"min_count": 3},
    "barrel-icon-import": {"min_count": 1},
    "comment-narrates-next-line": {"min_count": 2, "overlap": 0.6},
    "docstring-restates-signature": {"min_count": 1},
    "swallow-exception-pass": {"min_count": 1},
    "placeholder-stub-residue": {"min_count": 2},
    "decorative-section-divider": {"min_count": 2},
    "emoji-in-code": {"min_count": 1},
}


def load_catalog():
    try:
        return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"items": [], "sources": []}


CATALOG = load_catalog()
CATALOG_NAMES = {i["name"] for i in CATALOG.get("items", [])}
_CAT_TH = {i["name"]: i.get("thresholds", {}) for i in CATALOG.get("items", [])}


def th(ism, key, fallback=None):
    """Threshold lookup: catalog first, bundled fallback second."""
    v = _CAT_TH.get(ism, {}).get(key)
    if v is None:
        v = DEFAULT_THRESHOLDS.get(ism, {}).get(key, fallback)
    return v


# ---------------------------------------------------------------- constants

AI_DEFAULT_HEXES = {
    "6366f1": "indigo-500 — the v0/Lovable/artifact default accent",
    "8b5cf6": "violet-500 — the AI gradient partner",
    "7c3aed": "violet-600",
    "4f46e5": "indigo-600",
    "a855f7": "purple-500",
    "3b82f6": "blue-500 — the other default accent",
    "2563eb": "blue-600",
}

AI_DEFAULT_FONTS = {
    "inter": "Inter — the unchosen default of AI-generated UI",
    "geist": "Geist — Vercel default, marks v0 output",
    "sora": "Sora — AI-landing-page cliché",
    "manrope": "Manrope — AI-landing-page cliché",
    "space grotesk": "Space Grotesk — AI-landing-page cliché",
    "plus jakarta sans": "Plus Jakarta Sans — the newer unchosen default",
    "outfit": "Outfit — AI-landing-page cliché",
}

AI_DEFAULT_TOKENS = {
    "backdrop-blur": "glassmorphism applied rather than chosen",
    "rounded-2xl": "the generated card radius",
    "bg-gradient-to-r": "the gradient headline nobody asked for",
    "bg-clip-text": "gradient text — the generated-hero signature",
    "from-indigo": "the indigo gradient stop",
    "from-purple": "the purple gradient stop",
    "bg-grid-": "the dot/line grid hero background",
    "animate-pulse": "skeleton shimmer used as decoration",
}

# CLOSED SET of machine artifacts. Not a keyword list about topics or style —
# these strings have no human source outside quotation, and quoted regions are
# excluded before this runs. Reported high, absolutely.
LEAKAGE_SIGNATURES = (
    "as an ai language model", "as a large language model",
    "i cannot fulfill that request", "i'm sorry, but as an ai",
    "i do not have access to real-time", "as of my last update",
    "i cannot browse the internet", "i don't have personal opinions",
)

# Vendor scaffolding that leaks into pasted output. Sourced from Wikipedia's
# WikiProject AI Cleanup, which catalogs these per vendor.
MARKUP_RESIDUE = {
    "oaicite": "ChatGPT citation token",
    "contentreference": "ChatGPT citation token",
    "turn0search": "ChatGPT search-result token",
    "attributableindex": "ChatGPT attribution token",
    "grok_render_citation_card_json": "Grok citation card",
    "ppl-ai-file-upload": "Perplexity upload artifact",
    ":::writing": "unclassified model wrapper",
    "[cite_start]": "Gemini citation token",
    "(start_span)": "Gemini span token",
}

TRACKING_PARAMS = re.compile(
    r"utm_source=(chatgpt|openai|perplexity|copilot|claude)[.\w]*", re.I)

# humanize:ignore-start -- the lines below ARE the specimens this script
# detects, so reviewing this file with this file flags its own patterns.
EMOJI_RANGES = (
    (0x1F300, 0x1FAFF), (0x2600, 0x27BF), (0x2B00, 0x2BFF), (0xFE0F, 0xFE0F),
)

# Structure-marking dingbats, kept separate from decorative emoji: "✓ done" in a
# checklist is a milder tell than "🚀 Features" as an H2, and conflating the two
# made a single ✓ fire at high severity.
CHECK_GLYPHS = "✅✔✓☑❌✗✖⚠🔴🟢🟡➡▶🎯💡🔥⭐"

# Unicode format characters may be intentional. Inspect rendering and language.
INVISIBLE_CODEPOINTS = {
    " ": "U+202F narrow no-break space",
    "​": "U+200B zero-width space",
    "‌": "U+200C zero-width non-joiner",
    "﻿": "U+FEFF byte-order mark mid-document",
    "⁠": "U+2060 word joiner",
    "­": "U+00AD soft hyphen",
}

# Closed set of GRAMMATICAL FORMS, measured as a rate. Not a topic list: these
# are the participles Reinhart et al. (PNAS 2025) measured GPT-4o emitting at
# 5.3x the human rate, the top-ranked feature across a 66-feature Biber tagset.
PARTICIPLE_TAILS = (
    "highlighting", "underscoring", "emphasizing", "reflecting", "showcasing",
    "demonstrating", "symbolizing", "positioning", "signaling", "cementing",
    "solidifying", "fostering", "cultivating", "encompassing", "enhancing",
    "contributing", "ensuring", "marking", "illustrating", "reinforcing",
)

# Copula substitutes. Wikipedia's AI Cleanup project lists avoidance of basic
# copulas as a top-level sign; it survives synonym-swapping because it is
# grammatical rather than lexical.
COPULA_SUBSTITUTES = (
    "serves as", "stands as", "functions as", "operates as", "acts as",
    "represents a", "represents the", "boasts", "features a", "features the",
    "maintains a", "offers a", "refers to a",
)

POSITIVE_DEONTIC = ("should", "have to", "has to", "had to", "ought to")
FORMAL_DEONTIC = ("must", "need to", "needs to", "cannot", "is required to")

# humanize:ignore-end

FIRST_SECOND_PRONOUN = re.compile(
    r"\b(i|me|my|mine|myself|we|us|our|ours|you|your|yours)\b", re.I)

NOMINALIZATION = re.compile(
    r"\b\w{4,}(tion|sion|ment|ance|ence|ization|isation)s?\b", re.I)

CHALLENGES_HEADING = re.compile(
    r"^\s*#{1,6}\s*(challenges and (future directions|legacy|opportunities)"
    r"|future (directions|outlook|prospects)|looking ahead)\s*$", re.I | re.M)

RENDERS_MARKDOWN = {".md", ".markdown", ".mdx", ".rst"}
MARKUP_EXT = {".html", ".htm", ".css", ".jsx", ".tsx", ".vue", ".svelte"}
CODE_EXT = {".py", ".rs", ".go", ".js", ".ts", ".jsx", ".tsx", ".java", ".rb",
            ".c", ".h", ".cpp", ".swift", ".kt", ".sh"}

COMMENT_PREFIX = re.compile(r"^\s*(?://|#|--)\s?(.*)$")
SEV_ORDER = {"high": 0, "medium": 1, "low": 2}
VALID_SEV = ("high", "medium", "low")

STOPWORDS = {
    "the", "a", "an", "this", "that", "these", "those", "and", "or", "but",
    "for", "to", "of", "in", "on", "at", "by", "with", "from", "into", "then",
    "here", "there", "it", "its", "is", "are", "was", "were", "be", "been",
    "we", "you", "our", "your", "if", "as", "so", "not", "no", "all", "each",
    "new", "now", "use", "using", "used", "will", "can", "may", "should",
}


# ------------------------------------------------------------- segmentation

def classify_lines(text, suffix=".md"):
    """Tag every line: prose | code | quote | meta | ignored.

    Density detectors read `prose` only. Counting an em dash inside a code
    fence, a YAML description, or a deliberately-quoted Before sample against
    the author was the single largest false-positive source in the previous
    version: this skill's own examples flagged the AI-isms they exist to show.
    """
    lines = text.splitlines()
    tags = ["prose"] * len(lines)
    in_fence = in_front = in_ignore = False
    fence_mark = ""

    for i, raw in enumerate(lines):
        s = raw.strip()
        if "humanize:ignore-start" in s:
            in_ignore = True
        if in_ignore:
            tags[i] = "ignored"
            if "humanize:ignore-end" in s:
                in_ignore = False
            continue
        if i == 0 and s == "---" and suffix in RENDERS_MARKDOWN:
            in_front = True
            tags[i] = "meta"
            continue
        if in_front:
            tags[i] = "meta"
            if s == "---":
                in_front = False
            continue
        m = re.match(r"^(`{3,}|~{3,})", s)
        if m:
            if not in_fence:
                in_fence, fence_mark = True, m.group(1)[0]
            elif m.group(1)[0] == fence_mark:
                in_fence = False
            tags[i] = "code"
            continue
        if in_fence:
            tags[i] = "code"
            continue
        if re.match(r"^\s*>", raw):
            tags[i] = "quote"
        elif re.match(r"^\s*(\||<!--)", s) or s.startswith("[//]:"):
            tags[i] = "meta"
    return lines, tags


def blank_markup(match):
    """Replace a markup span with a separator and keep its source newlines."""
    return " " + "\n" * match.group().count("\n")


def mask_markup_ignored(text, opener="<!--", closer="-->"):
    """Keep the source lines and any text on either side of the region."""
    start, end = re.escape(opener), re.escape(closer)
    return re.sub(
        rf"{start}\s*humanize:ignore-start\b.*?{end}.*?"
        rf"(?:{start}\s*humanize:ignore-end\b.*?{end}|\Z)",
        blank_markup, text, flags=re.S,
    )


def strip_markup(text):
    """Remove HTML markup and script/style bodies while retaining source lines."""
    text = mask_markup_ignored(text)
    text = re.sub(r"<(style|script)\b[^>]*>.*?</\1>", blank_markup, text, flags=re.S | re.I)
    text = re.sub(r"<!--.*?-->", blank_markup, text, flags=re.S)
    return re.sub(r"<[^>]+>", blank_markup, text)


def strip_code_comments(text):
    """Drop comment bodies before scanning structured values, so a hex named in
    a comment, a changelog, or a doc about this very tell is not a finding."""
    text = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    text = re.sub(r"(?m)^\s*(//|#).*$", " ", text)
    return re.sub(r"<!--.*?-->", " ", text, flags=re.S)


def mask_ignored(lines):
    """Blank out humanize:ignore regions while preserving line numbering.

    The markers used to work only in the prose path, so a source file that
    defines the very patterns this script detects flagged itself. Any analyzer
    that reads raw lines has to go through here.
    """
    out, in_ignore = [], False
    for raw in lines:
        if "humanize:ignore-start" in raw:
            in_ignore = True
        if in_ignore:
            out.append("")
            if "humanize:ignore-end" in raw:
                in_ignore = False
        else:
            out.append(raw)
    return out


def split_sentences(text):
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if p.strip()]


def word_count(text):
    return len(re.findall(r"[A-Za-z0-9'’-]+", text))


def prose_sentence_groups(text, suffix=".md"):
    """Paragraph-local sentence candidates with original source lines.

    A small source scanner, not a grammar parser or TeX engine. Excludes common
    non-prose blocks; does not infer fragments from a missing verb-list match.
    """
    def blank(match):
        return re.sub(r"[^\n]", " ", match.group())

    if suffix in {".tex", ".latex"}:
        envs = (r"thebibliography|tabular\*?|table\*?|figure\*?|lstlisting|"
                r"verbatim\*?|minted|equation\*?|align\*?|gather\*?|displaymath|tikzpicture")
        text = re.sub(r"\\begin\{(" + envs + r")\}.*?\\end\{\1\}",
                      blank, text, flags=re.S)
        text = re.sub(r"\\\[.*?\\\]|\$\$.*?\$\$", blank, text, flags=re.S)
        text = re.sub(r"(?m)(?<!\\)%.*$", blank, text)
        text = re.sub(r"\\(?:label|cite\w*|(?:eq|auto|c|C)?ref)\*?(?:\[[^\]]*\])?\{[^}]*\}",
                      blank, text)
        text = re.sub(r"\\(?:qedhere|qed)\b|[∎□]", " ", text)
        text = re.sub(r"\\(?:begin|end)\{(?:proof|theorem|corollary|lemma|remark)\}(?:\[[^\]]*\])?",
                      blank, text)
        text = re.sub(r"\\(?:textit|textbf|emph|texttt)\{([^{}]*)\}", r"\1", text)
    lines, tags = classify_lines(text, suffix)
    paragraph, start_line, in_list = [], 1, False

    def sentences():
        joined = "\n".join(paragraph)
        spans, cursor = [], 0
        for boundary in re.finditer(r"(?<=[.!?])\s+", joined):
            spans.append((cursor, boundary.start()))
            cursor = boundary.end()
        spans.append((cursor, len(joined)))
        group = []
        for begin, end in spans:
            raw = joined[begin:end]
            leading = len(raw) - len(raw.lstrip())
            sentence = raw.strip().strip("*_ ")
            if not sentence or re.fullmatch(r"(?:Proof|Solution|Remark)\.?", sentence, re.I):
                if group:
                    yield group
                    group = []
                continue
            line = start_line + joined.count("\n", 0, begin + leading)
            group.append((line, sentence))
        if group:
            yield group

    for index, (raw, tag) in enumerate(zip(lines, tags), 1):
        s = raw.strip()
        next_line = lines[index].strip() if index < len(lines) else ""
        markdown_nonprose = False
        if suffix in RENDERS_MARKDOWN:
            if re.match(r"(?:[-*+]\s|\d+[.)]\s)", s):
                in_list = True
                markdown_nonprose = True
            elif s and not raw[0].isspace():
                in_list = False
            markdown_nonprose |= (raw.startswith(("    ", "\t"))
                                  or (in_list and bool(s) and raw[0].isspace()))
        boundary = (tag != "prose" or not s
                    or markdown_nonprose
                    or (suffix in RENDERS_MARKDOWN
                        and bool(re.fullmatch(r"={2,}|-{2,}", next_line)))
                    or bool(re.match(r"(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|=+$|-+$)", s))
                    or (suffix in {".tex", ".latex"}
                        and s.startswith(("\\", "}"))))
        if boundary:
            if paragraph:
                yield from sentences()
                paragraph = []
            continue
        if not paragraph:
            start_line = index
        paragraph.append(re.sub(r"(`+).*?\1", "\x00", raw))
    if paragraph:
        yield from sentences()


def staccato_findings(path, text, suffix=".md"):
    # strip_markup() loses block boundaries and source lines. HTML needs a
    # rendered/DOM-aware editorial pass; never infer local runs from that stream.
    if suffix in {".html", ".htm"}:
        return
    cap = th("staccato-fragment-triplet", "max_words", 4)
    minimum = th("staccato-fragment-triplet", "min_run", 3)
    for group in prose_sentence_groups(text, suffix):
        run = []
        for candidate in group + [(0, "")]:
            line, sentence = candidate
            if sentence.endswith(".") and "\x00" not in sentence and 0 < word_count(sentence) <= cap:
                run.append(candidate)
                continue
            if len(run) >= minimum:
                yield finding(
                    path, run[0][0], " ".join(s for _, s in run),
                    "staccato-fragment-triplet", "low",
                    f"Local run of {len(run)} sentences of at most {cap} words. "
                    "Review whether the chopping hides a relation or adds false emphasis; "
                    "sentence length alone cannot establish a defect or authorship.",
                    "Keep complete useful steps. Join clauses where needed to state "
                    "their actual relation, and remove emphasis-only fragments.",
                    family="rhythm")
            run = []


def is_emoji(ch):
    cp = ord(ch)
    return any(lo <= cp <= hi for lo, hi in EMOJI_RANGES)


def ident_words(s):
    """camelCase, snake_case, kebab-case and PascalCase to comparable tokens."""
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", s)
    return {w.lower() for w in re.findall(r"[A-Za-z]{3,}", s)}


def finding(file, line, excerpt, ism, severity, explanation, rewrite="",
            dialect="generic-llm", family="form"):
    if severity not in VALID_SEV:
        severity = "low"
    return {
        "file": str(file), "line": line, "excerpt": str(excerpt)[:300], "ism": ism,
        "dialect": dialect, "severity": severity, "explanation": explanation,
        "rewrite": rewrite, "layer": "structural", "family": family,
    }


# --------------------------------------------------------------- baselining

def prose_metrics(text, suffix=".md"):
    """The countable rhythm signals, as rates. Used both for the target file and
    for a --baseline corpus of the author's own known-human writing."""
    lines, tags = classify_lines(text, suffix)
    body = "\n".join(l for l, t in zip(lines, tags) if t == "prose")
    words = word_count(body)
    if words < 50:
        return None
    sents = split_sentences(body)
    lens = [word_count(s) for s in sents] or [1]
    mean = statistics.mean(lens)
    dashes = sum(l.count("—") for l in body.splitlines()) \
        + len(re.findall(r"(?<=\w)--(?=\w)", body))
    return {
        "words": words,
        "em_dash_per_100w": dashes / words * 100,
        "comma_per_100w": body.count(",") / words * 100,
        "contraction_per_100w":
            len(re.findall(r"\b\w+[’'](?:t|s|re|ve|ll|d|m)\b", body)) / words * 100,
        "sentence_cv": (statistics.pstdev(lens) / mean) if mean else 1.0,
        "pronoun_per_100w": len(FIRST_SECOND_PRONOUN.findall(body)) / words * 100,
    }


def build_baseline(paths):
    """Pool the author's own writing into one metric set. A writer's baseline is
    their own: this is what makes the rhythm family fair to a non-native
    speaker, an autistic writer, or anyone who simply loves dashes."""
    mets = []
    for p in paths:
        try:
            m = prose_metrics(Path(p).read_text(encoding="utf-8", errors="replace"),
                              Path(p).suffix.lower())
        except Exception:
            continue
        if m:
            mets.append(m)
    if not mets:
        return None
    keys = [k for k in mets[0] if k != "words"]
    total = sum(m["words"] for m in mets)
    return {"files": len(mets), "words": total,
            **{k: sum(m[k] * m["words"] for m in mets) / total for k in keys}}


def rhythm_finding(path, line, excerpt, ism, explanation, rewrite, dialect,
                   observed, base_value, direction, ratio_key):
    """Rhythm signals are LOW on their own and escalate only against the
    author's own baseline. Absolute punctuation thresholds tuned on model text
    flag most careful human text too: the gptme anti-slop detector measured its
    em-dash rule warning on ~64% of legitimate technical blog posts."""
    sev, note = "low", " (cue only — no baseline supplied, so this is not evidence of anything)"
    if base_value is not None:
        # A baseline of zero is a real baseline, not a missing one, and it means
        # different things in each direction. Upward: this author never does
        # this, so any material presence is the strongest possible delta \u2014 floor
        # the divisor so the ratio stays computable. Downward: there is nothing
        # to decrease from, so the comparison is meaningless and must not fire.
        # Getting this wrong made a text score findings against its own baseline.
        if direction == "down" and base_value < 0.05:
            return None
        ratio = observed / max(base_value, 0.05)
        want = th(ism, ratio_key, 2.0)
        crossed = ratio >= want if direction == "up" else ratio <= want
        if crossed:
            sev = "high"
            note = (f" — {ratio:.1f}x this author's own baseline of "
                    f"{base_value:.2f}, which is the signal that matters")
        else:
            return None
    return finding(path, line, excerpt + note, ism, sev, explanation, rewrite,
                   dialect, family="rhythm")


# ------------------------------------------------------------ prose signals

def tracking_param_finding(path, line, count):
    return finding(
        path, line, f"{count} chat-attribution tracking param(s)",
        "tracking-param-residue", "high",
        "The shipped URL includes a chat-attribution tracking parameter.",
        "Remove the chat-attribution parameter and keep query values the destination needs.",
        "chatgpt", family="residue",
    )


class HtmlUrlTracking(HTMLParser):
    """Find tracking parameters carried by links and other URL attributes."""

    URL_ATTRIBUTES = {"action", "cite", "formaction", "href", "poster", "src", "srcset"}

    def __init__(self):
        super().__init__()
        self.count = 0
        self.first_line = None

    def handle_starttag(self, tag, attrs):
        count = sum(len(TRACKING_PARAMS.findall(value)) for name, value in attrs
                    if name in self.URL_ATTRIBUTES and value)
        if count and self.first_line is None:
            self.first_line = self.getpos()[0]
        self.count += count


def analyze_prose(path, text, suffix=".md", base=None, from_markup=False):
    """from_markup: text came from strip_markup(). Line structure is then an
    artifact of tag removal rather than an authoring choice, so the detectors
    that read line and paragraph shape are meaningless and were firing on it."""
    out = []
    lines, tags = classify_lines(text, suffix)
    prose_lines = [l for l, t in zip(lines, tags) if t == "prose"]
    body = "\n".join(prose_lines)
    words = word_count(body)

    def where(pred, default=1):
        return next((i + 1 for i, (l, t) in enumerate(zip(lines, tags))
                     if t == "prose" and pred(l)), default)

    # ---------------------------------------------- RESIDUE. High, absolutely.
    scan = "".join(l for l, t in zip(lines, tags) if t != "ignored")
    invis = {ch: (scan.count(ch), lab) for ch, lab in INVISIBLE_CODEPOINTS.items()
             if scan.count(ch)}
    if invis:
        out.append(finding(
            path, where(lambda l: any(c in l for c in invis), 1),
            "; ".join(f"{n}x {lab}" for n, lab in invis.values()),
            "invisible-unicode-artifacts",
            "low",
            "Unicode spacing or formatting characters are present. These have "
            "legitimate locale, line-breaking, and script uses; this is only a "
            "typography inspection cue, not evidence of copying or AI authorship.",
            "Inspect the rendered text and language before changing anything. "
            "Preserve meaningful non-breaking spaces and script joiners; repair "
            "only a demonstrated formatting defect.",
            "generic-llm", family="form"))

    for tok, label in MARKUP_RESIDUE.items():
        if tok in scan.lower():
            out.append(finding(
                path, where(lambda l: tok in l.lower()), tok, "model-markup-residue",
                "high", f"{label} left in the text. This is the model's own "
                "scaffolding, not a style choice.",
                "Grep and delete. Then check whether the citation it was attached "
                "to points at anything real.", "chatgpt", family="residue"))
            break

    # humanize:ignore-start -- the placeholder patterns below are specimens
    # Both braces are REQUIRED. The first version made each optional, so a single
    # brace group of lowercase letters matched -- and that is one of the
    # commonest constructs in text there is. A clean, hand-written LaTeX paper
    # scored a HIGH finding off `\usepackage{amsmath}`, which is the exact
    # failure this catalog exists to prevent: a confident accusation on the most
    # ordinary possible input. No templating language needs the loose form.
    PLACEHOLDER = re.compile(
        r"\{\{\s*[a-z_][a-z_ ]{1,30}\s*\}\}|%%\w+%%|\*\|\w+\|\*"
        r"|\b(FNAME|LNAME|FIRSTNAME)\b|\[(?:Job Title|Company Name|Your Name|"
        r"insert [^\]]{2,30}|specific [^\]]{2,30})\]", re.I)
    # humanize:ignore-end
    ph = [l for l, t in zip(lines, tags) if t == "prose" and PLACEHOLDER.search(l)]
    if ph:
        out.append(finding(
            path, where(lambda l: PLACEHOLDER.search(l)),
            f"{len(ph)} unfilled placeholder(s), e.g. {PLACEHOLDER.search(ph[0]).group(0)}",
            "unfilled-placeholder-residue", "high",
            "Template scaffolding shipped live. This is the one finding in the whole "
            "catalog that is proof rather than inference: unreviewed output reached a "
            "reader.",
            "Block publish on any placeholder pattern. Set fallbacks on every merge "
            "field and grep the artifact before it leaves.", family="residue"))

    trk = TRACKING_PARAMS.findall(scan)
    if trk:
        out.append(tracking_param_finding(
            path, where(lambda l: TRACKING_PARAMS.search(l)), len(trk)))

    low_body = body.lower()
    for sig in LEAKAGE_SIGNATURES:
        if sig in low_body:
            out.append(finding(
                path, where(lambda l: sig in l.lower()), sig, "as-an-ai-leakage", "high",
                "Raw model artifact in shipped copy. Not a stylistic tell — the seam "
                "showing.",
                "Delete the sentence and write what it was meant to say.",
                family="residue"))
            break

    if words == 0:
        return out

    # ------------------------------------------- RHYTHM. Low without a baseline.
    m = prose_metrics(text, suffix)
    if m and m["words"] > th("em-dash-density", "min_words", 120):
        if m["em_dash_per_100w"] > th("em-dash-density", "cue", 1.0):
            f = rhythm_finding(
                path, where(lambda l: "—" in l),
                f"{m['em_dash_per_100w']:.2f} em dashes/100w",
                "em-dash-density",
                "Em-dash rate is a cue, not evidence. Human means cluster near "
                "0.32/100w and GPT-4-class near 1.06, but Melville runs 0.81 and "
                "Llama runs zero — the distributions overlap badly.",
                "Replace most with periods, commas, or parentheses. Keep the ones "
                "doing work no other mark can do.",
                "claude", m["em_dash_per_100w"],
                base and base.get("em_dash_per_100w"), "up", "baseline_ratio")
            if f:
                out.append(f)
        if m["comma_per_100w"] > th("comma-inflation", "cue", 9.0):
            f = rhythm_finding(
                path, 1, f"{m['comma_per_100w']:.1f} commas/100w", "comma-inflation",
                "Parenthetical smoothing: every clause gets an appositive. Measured "
                "at +66% under LLM revision, but weak on its own.",
                "Remove needless asides. If splitting helps, keep the cause, condition "
                "or consequence explicit across the resulting sentences.",
                "generic-llm", m["comma_per_100w"],
                base and base.get("comma_per_100w"), "up", "baseline_ratio")
            if f:
                out.append(f)
        if m["contraction_per_100w"] < 0.4 and m["words"] > th(
                "zero-typo-zero-contraction-affect-flatness", "min_words", 250):
            f = rhythm_finding(
                path, 1, f"{m['contraction_per_100w']:.2f} contractions/100w",
                "zero-typo-zero-contraction-affect-flatness",
                "A register with no relaxed setting. Note the real finding is "
                "directional: models pull formal sources slightly MORE casual and "
                "casual sources much more formal.",
                "Use contractions where a person saying this sentence aloud would.",
                "chatgpt", m["contraction_per_100w"],
                base and base.get("contraction_per_100w"), "down", "baseline_ratio")
            if f:
                out.append(f)
        if m["pronoun_per_100w"] < th("pronoun-evacuation", "cue_per_100w", 0.8):
            f = rhythm_finding(
                path, 1, f"{m['pronoun_per_100w']:.2f} first/second-person pronouns/100w",
                "pronoun-evacuation",
                "The writer has disappeared from their own sentences. LLM editing "
                "removes 40-61% of pronouns, and voice-preserving prompts recover "
                "only 10-15% of that.",
                "Put the person back. If the sentence describes something someone "
                "did, decided, or saw, name them as the subject.",
                "generic-llm", m["pronoun_per_100w"],
                base and base.get("pronoun_per_100w"), "down", "baseline_ratio")
            if f:
                out.append(f)

    if not from_markup:
        out.extend(staccato_findings(path, text, suffix))
    sents = split_sentences(body)
    if m and len(sents) >= th("low-burstiness-uniform-rhythm", "min_sentences", 12) \
       and m["sentence_cv"] < th("low-burstiness-uniform-rhythm", "cue_cv", 0.42):
        f = rhythm_finding(
            path, 1, f"sentence-length CV {m['sentence_cv']:.2f} over {len(sents)} sentences",
            "low-burstiness-uniform-rhythm",
            "Near-constant sentence length is a weak review cue. Corpus differences "
            "do not establish a desirable rhythm for this passage or genre.",
            "Let sentence length follow the reasoning. Join dependent clauses with "
            "their actual relation; split only where each resulting step remains clear. "
            "Do not insert fragments or alternate lengths to hit a rhythm target.",
            "generic-llm", m["sentence_cv"],
            base and base.get("sentence_cv"), "down", "baseline_ratio")
        if f:
            out.append(f)

    # ------------------------------------ FORM. Closed grammatical classes.
    if words > th("participial-tail", "min_words", 150):
        tails = re.findall(
            r",\s+(" + "|".join(PARTICIPLE_TAILS) + r")\b[^.!?]*[.!?]", body, re.I)
        rate = len(tails) / words * 100
        if rate > th("participial-tail", "cue_per_100w", 0.7):
            out.append(finding(
                path, where(lambda l: re.search(
                    r",\s+(" + "|".join(PARTICIPLE_TAILS) + r")\b", l, re.I)),
                f"{len(tails)} sentence-final participial clauses ({rate:.2f}/100w)",
                "participial-tail", "high",
                "The commentary clause bolted onto a finished sentence — "
                "'..., underscoring its importance'. GPT-4o emits these at 5.3x the "
                "human rate, the top-ranked discriminating feature in a 66-feature "
                "grammatical study.",
                "Delete the clause, or promote it to its own sentence with a subject "
                "and a claim someone could check. If it cannot survive that, it was "
                "filler.", family="form"))

        noms = NOMINALIZATION.findall(body)
        nrate = len(noms) / words * 100
        if nrate > th("nominalization-density", "cue_per_100w", 7.0):
            out.append(finding(
                path, 1, f"{len(noms)} nominalizations in {words} words ({nrate:.1f}/100w)",
                "nominalization-density", "medium",
                "Verbs converted to abstract nouns and propped up with a weak verb — "
                "'the implementation of', 'provides an enhancement to'. Measured at "
                "roughly 2x the human rate; instruction tuning specifically rewards "
                "this noun-heavy register.",
                "Give the action a subject. 'Repeated reads reached the cache, so callers "
                "spent less time waiting for a response.'", family="form"))

    copula_subs = sum(low_body.count(c) for c in COPULA_SUBSTITUTES)
    copulas = len(re.findall(r"\b(is|are|was|were)\b", low_body))
    if copula_subs + copulas >= th("copula-avoidance", "min_copular", 6) \
       and copula_subs / max(copula_subs + copulas, 1) > th("copula-avoidance", "cue_share", 0.35):
        out.append(finding(
            path, where(lambda l: any(c in l.lower() for c in COPULA_SUBSTITUTES)),
            f"{copula_subs} copula substitutes vs {copulas} plain copulas",
            "copula-avoidance", "medium",
            "'Serves as', 'stands as', 'boasts' standing in for 'is'. Grammatical "
            "rather than lexical, so it survives synonym-swapping — which is exactly "
            "why it is a better signal than any single word.",
            "Restore the copula. If the sentence feels thin with 'is', the problem is "
            "the claim, not the verb.", family="form"))

    pos_d = sum(len(re.findall(r"\b" + re.escape(w) + r"\b", low_body)) for w in POSITIVE_DEONTIC)
    fml_d = sum(len(re.findall(r"\b" + re.escape(w) + r"\b", low_body)) for w in FORMAL_DEONTIC)
    if pos_d + fml_d >= th("deontic-softening", "min_modals", 4) \
       and pos_d / max(fml_d, 1) < th("deontic-softening", "cue_ratio", 0.8):
        out.append(finding(
            path, where(lambda l: any(w in l.lower() for w in FORMAL_DEONTIC)),
            f"{fml_d} procedural modals (must/need to/cannot) vs {pos_d} personal "
            f"(should/have to)", "deontic-softening", "medium",
            "Obligation expressed procedurally rather than personally. Across eleven "
            "models the personal deontic modals sit near the 4th percentile of "
            "underuse — more underused than 96% of common vocabulary.",
            "Use the modal a person would say out loud: 'can't' not 'cannot', "
            "'have to' not 'need to'. Say 'should' when you mean should.",
            family="form"))

    if words > th("specificity-starvation", "min_words", 300):
        mid_caps = len(re.findall(r"(?<![.!?]\s)(?<!^)\b[A-Z][a-z]{2,}", body, flags=re.M))
        numbers = len(re.findall(r"\b\d[\d,.]*\b", body))
        # Spelled-out quantities are specifics too. Counting only digits marked
        # "forty thousand jobs a week" as vague, which is backwards.
        numbers += len(re.findall(
            r"\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
            r"fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|"
            r"thousand|million|billion|half|third|quarter|dozen|once|twice)\b",
            body, re.I))
        rate = (mid_caps + numbers) / words * 100
        if rate < th("specificity-starvation", "cue_per_100w", 2.0):
            out.append(finding(
                path, 1, f"{mid_caps} proper nouns + {numbers} numerals in {words} "
                         f"words ({rate:.1f}/100w)",
                "specificity-starvation", "medium",
                "Almost nothing here could be checked, dated, or attributed. People "
                "write from particulars — a name, a number, a Tuesday. A model writes "
                "from the average of everything, and the average has no particulars "
                "in it.",
                "Add the specifics you know: who, how many, when, which version. If "
                "you can't, you may not have anything to say yet.", family="form"))

    # ------------------------------------------------------- DOCUMENT SHAPE
    # paragraph-length monoculture: people break where the idea breaks, which is
    # irregular. A model paragraphs on a rhythm.
    # Join each paragraph's lines BEFORE counting sentences. Counting per line
    # measures the author's hard-wrap width, not their rhythm: a README wrapped
    # at 80 characters then reads as perfectly uniform, which is how this
    # detector first fired on this skill's own README.
    paras_sent, buf = [], []
    for l, t in zip(lines, tags):
        if t != "prose":
            continue
        if l.strip():
            if not re.match(r"\s*([-*+#>|]|\d+\.)", l):
                buf.append(l.strip())
        elif buf:
            paras_sent.append(len(split_sentences(" ".join(buf)))); buf = []
    if buf:
        paras_sent.append(len(split_sentences(" ".join(buf))))
    if len(paras_sent) >= th("paragraph-length-monoculture", "min_paragraphs", 6) \
       and not from_markup:
        mu = statistics.mean(paras_sent)
        cv = statistics.pstdev(paras_sent) / mu if mu else 1.0
        if cv < th("paragraph-length-monoculture", "cue_cv", 0.35):
            out.append(finding(
                path, 1, f"paragraph-length CV {cv:.2f} over {len(paras_sent)} paragraphs "
                         f"(mean {mu:.1f} sentences)",
                "paragraph-length-monoculture", "low",
                "Every paragraph the same length. People break where the idea breaks, "
                "which is irregular; a model breaks on a rhythm. Unlike sentence-length "
                "variation this has no published baseline behind it, so the threshold is "
                "a judgment call and the severity is capped accordingly.",
                "Break paragraphs where their subject or reasoning changes. Keep a "
                "complete explanation together and preserve its links.", family="rhythm"))

    run = best_run = run_line = 0
    max_w = th("linkedin-broetry-one-line-runs", "max_words_per_line", 14)
    for i, (l, t) in enumerate(zip(lines, tags)):
        s = l.strip()
        if t == "prose" and s and not s.startswith(("#", "-", "*", ">", "|")) \
           and len(s.split()) <= max_w and i + 1 < len(lines) and not lines[i + 1].strip():
            run += 1
            if run > best_run:
                best_run, run_line = run, i + 1
        elif s:
            run = 0
    if best_run >= th("linkedin-broetry-one-line-runs", "min_run", 4) and not from_markup:
        out.append(finding(
            path, run_line, f"run of {best_run} consecutive one-line paragraphs",
            "linkedin-broetry-one-line-runs", "medium",
            "Line breaks doing the work that emphasis should do.",
            "Group related lines into real paragraphs. Keep the break for the one "
            "line that earns it.", "chatgpt"))

    heads = [(i + 1, l) for i, (l, t) in enumerate(zip(lines, tags))
             if t == "prose" and re.match(r"\s{0,3}#{1,6}\s", l)]
    bullets = [(i + 1, l) for i, (l, t) in enumerate(zip(lines, tags))
               if t == "prose" and re.match(r"\s*([-*+]|\d+\.)\s", l)]
    paras = sum(1 for i, (l, t) in enumerate(zip(lines, tags))
                if t == "prose" and l.strip()
                and not re.match(r"\s*([-*+#>|]|\d+\.)", l)
                and (i == 0 or not lines[i - 1].strip()))
    nonblank = sum(1 for l, t in zip(lines, tags) if t == "prose" and l.strip())

    # This item's own false_positive_when says "Reference documentation and API
    # docs are legitimately heading-dense, because readers arrive by search and
    # leave immediately. Scope to narrative prose." The detector did not scope to
    # anything, so a well-formed CLI reference -- short label headings, a code
    # block under most of them -- scored medium. Implement the caveat instead of
    # only printing it: reference structure is short labels PLUS code, and both
    # have to be present before the finding is suppressed.
    head_words = [len(re.sub(r"^\s{0,3}#{1,6}\s+", "", l).split()) for _, l in heads]
    short_share = (sum(1 for w in head_words if w <= 5) / len(head_words)) if head_words else 0
    has_code = bool(re.search(r"^\s*```|^ {4,}\S", "\n".join(lines), re.M))
    reference_shaped = short_share >= 0.6 and has_code

    if len(heads) >= th("heading-spam", "min_headings", 5) and paras \
       and len(heads) / paras > th("heading-spam", "ratio", 0.5) \
       and not reference_shaped:
        out.append(finding(
            path, heads[0][0], f"{len(heads)} headings vs {paras} paragraphs",
            "heading-spam", "medium",
            "A heading every paragraph or two is the outline the model was given, "
            "left in place.",
            "Cut headings that label a single paragraph. Let prose carry transitions."))

    if nonblank and len(bullets) >= th("bullet-colonization-of-prose", "min_bullets", 10) \
       and len(bullets) / nonblank > th("bullet-colonization-of-prose", "cue_share", 0.45):
        out.append(finding(
            path, bullets[0][0],
            f"{len(bullets)} of {nonblank} content lines are bullets "
            f"({len(bullets) / nonblank:.0%})",
            "bullet-colonization-of-prose", "medium",
            "Bullets taking over a document mean nothing is being argued. A list "
            "asserts items; prose asserts relationships between them.",
            "Convert bullet runs that narrate or argue into paragraphs. Keep bullets "
            "for things that are genuinely a list."))

    bpc = [(i + 1, l.strip()) for i, (l, t) in enumerate(zip(lines, tags))
           if t == "prose" and re.match(r"\s*[-*+]?\s*\*\*[^*]{1,60}?:?\*\*\s*[:—]?\s+\S", l)
           and re.search(r":\*\*|\*\*\s*[:—]", l)]
    if len(bpc) >= th("bold-label-colon-bullet", "min_count", 4):
        out.append(finding(
            path, bpc[0][0], f"{len(bpc)} '**Label:** text' bullets, e.g. {bpc[0][1][:80]}",
            "bold-label-colon-bullet", "medium",
            "Every item forced into one grammatical mold — the generated-doc grid.",
            "Keep at most one such list per document. Rewrite the rest as prose."))

    rules = [i + 1 for i, (l, t) in enumerate(zip(lines, tags))
             if t == "prose" and re.match(r"^\s*(-{3,}|\*{3,}|_{3,})\s*$", l)]
    if len(rules) >= th("horizontal-rule-spam", "min_count", 3) and not from_markup:
        out.append(finding(
            path, rules[0], f"{len(rules)} horizontal rules",
            "horizontal-rule-spam", "medium",
            "A rule between every section signals a boundary the model does not "
            "trust the prose to signal.",
            "Delete them. If two sections need separating, the heading does it."))

    if len(heads) >= th("title-case-heading-uniformity", "min_headings", 4) and not from_markup:
        def title_cased(h):
            b = re.sub(r"[^\w\s]", "", re.sub(r"^\s*#{1,6}\s*", "", h).strip())
            ws = [w for w in b.split() if len(w) > 3]
            return len(ws) >= 2 and all(w[0].isupper() for w in ws)
        tc = sum(1 for _, h in heads if title_cased(h))
        if tc / len(heads) >= th("title-case-heading-uniformity", "share", 0.8):
            out.append(finding(
                path, heads[0][0], f"{tc}/{len(heads)} headings in Title Case",
                "title-case-heading-uniformity", "low",
                "Uniform Title Case is a house style nobody chose. Writers drift "
                "between sentence and title case; generators do not.",
                "Pick sentence case and use it. It reads faster and dates less."))

    if len(heads) >= th("heading-level-skip", "min_headings", 3) and not from_markup:
        levels = [len(re.match(r"\s*(#+)", h).group(1)) for _, h in heads]
        skips = sum(1 for a, b in zip(levels, levels[1:]) if b - a >= 2)
        if skips:
            out.append(finding(
                path, heads[0][0], f"{skips} heading-level skip(s), e.g. H{levels[0]} to "
                                   f"H{max(levels)}",
                "heading-level-skip", "low",
                "Levels jumped rather than nested — the model emitted a document "
                "template rather than a document, and nobody read the outline back.",
                "Renumber the headings contiguously."))

    ch = CHALLENGES_HEADING.findall(text)
    if ch:
        out.append(finding(
            path, where(lambda l: CHALLENGES_HEADING.match(l)),
            f"heading: {ch[0] if isinstance(ch[0], str) else ch[0][0]}",
            "challenges-and-future-directions", "high",
            "The obligatory penultimate move: 'Despite its X, it faces challenges… "
            "Despite these challenges, it continues to…'. A formula that ends in "
            "speculative optimism regardless of subject.",
            "Delete the section. If a real open problem exists, state it as a "
            "specific unresolved question with a name attached to it."))

    for i, (l, t) in enumerate(zip(lines, tags)):
        if t == "quote" and re.match(r"\s*>\s*\S", l):
            tail = "\n".join(lines[i:i + 4])
            if not (re.search(r"(?m)[—–-]\s*[A-Z][\w.\s,'-]{2,50}\s*$", tail)
                    or re.search(r"\b(said|wrote|per|via|according to)\b", tail, re.I)):
                out.append(finding(
                    path, i + 1, l.strip()[:120], "unattributed-floating-quote", "high",
                    "A quote with no source is manufactured gravitas. A real pull "
                    "quote excerpts the document; an italicized aphorism from nobody "
                    "is set dressing.",
                    "Attribute it, or delete it. If nobody said it, it is not a quote.",
                    "claude"))
                break

    q = th("curly-straight-quote-mixing", "min_of_each", 2)
    if (body.count("'") >= q and body.count("’") >= q) or \
       (body.count('"') >= q and (body.count("“") + body.count("”")) >= q):
        out.append(finding(
            path, 1, f"straight/curly mixed: '{body.count(chr(39))} "
                     f"curly-single {body.count(chr(8217))} "
                     f'straight-double {body.count(chr(34))}',
            "curly-straight-quote-mixing", "medium",
            "Both quote styles in one document means two sources were pasted "
            "together — typed text uses one, model output the other.",
            "Normalize to one style across the document, then keep it."))

    arrows = [(i + 1, l.strip()) for i, (l, t) in enumerate(zip(lines, tags))
              if t == "prose" and l.count("→") >= th("arrow-chain-as-explanation", "min_arrows", 2)
              and not re.match(r"^\s*\(.*\)\s*$", l.strip())
              and not re.match(r"^\s*[-*+|]", l.strip())]
    if arrows:
        out.append(finding(
            path, arrows[0][0], arrows[0][1][:120], "arrow-chain-as-explanation", "medium",
            "A to B to C compresses out the causation the reader came for. The arrow "
            "asserts a relationship without naming it.",
            "Write the chain as a sentence and name each link."))

    emoji_heads, check_bullets = [], []
    for i, (l, t) in enumerate(zip(lines, tags)):
        if t != "prose":
            continue
        s = l.strip()
        if not s:
            continue
        mm = re.match(r"(#{1,6}\s+|[-*+]\s+|\d+\.\s+)?(.*)", s)
        prefix, txt = mm.group(1), mm.group(2)
        if not txt:
            continue
        if txt[0] in CHECK_GLYPHS:
            check_bullets.append((i + 1, s))
        elif is_emoji(txt[0]) and (bool(prefix) or s.startswith("#")):
            emoji_heads.append((i + 1, s))
    if len(emoji_heads) >= th("emoji-section-headers", "min_count", 2):
        out.append(finding(
            path, emoji_heads[0][0],
            f"{len(emoji_heads)} emoji-led headings, e.g. {emoji_heads[0][1][:70]}",
            "emoji-section-headers", "high",
            "Decoration standing in for hierarchy — the README-generator look.",
            "Delete the emoji. If a glyph is needed, use a real icon system.",
            "chatgpt"))
    if len(check_bullets) >= th("checkmark-bullet-grid", "min_count", 3):
        out.append(finding(
            path, check_bullets[0][0], f"{len(check_bullets)} glyph-led list items",
            "checkmark-bullet-grid", "medium",
            "The checkmark grid turns every claim into a satisfied requirement. It "
            "reads as a compliance table, not as writing.",
            "Use a plain list, or a real table if the items genuinely compare.",
            "chatgpt"))

    if not from_markup:
        out += analyze_exposition(path, lines, tags, body)

    if suffix not in RENDERS_MARKDOWN and suffix not in MARKUP_EXT and suffix not in CODE_EXT:
        leaks = len(re.findall(r"\*\*[^*\n]{2,60}\*\*", body)) \
            + len(re.findall(r"(?m)^\s*#{1,6}\s+\S", body))
        if leaks >= th("markdown-leak-in-unrendered-medium", "min_count", 3):
            out.append(finding(
                path, where(lambda l: "**" in l), f"{leaks} markdown constructs in a "
                f"{suffix or 'plain-text'} file",
                "markdown-leak-in-unrendered-medium", "high",
                "Markdown pasted where nothing renders it — LinkedIn, email, a "
                "plain-text field — shows literal asterisks to the reader. Nobody "
                "typing in that box would produce them.",
                "Strip the syntax and carry the emphasis in the words.", "chatgpt"))
    return out


# ----------------------------------------------------------- markup signals

def analyze_markup(path, text):
    out = []
    lines = text.splitlines()
    scan = strip_code_comments(text).lower()

    hits = [h for h in AI_DEFAULT_HEXES if h in scan]
    if hits:
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines)
                        if any(h in l.lower() for h in hits)), 1),
            ", ".join("#" + h for h in hits), "tailwind-indigo-default-palette", "high",
            "The accent nobody picked: " + "; ".join(AI_DEFAULT_HEXES[h] for h in hits) +
            ". One is a coincidence; the cluster is a default. (Origin is anecdotal, "
            "not measured: Tailwind's creator has said publicly that making every "
            "Tailwind UI button indigo-500 is why every generated UI is indigo.)",
            "Choose an accent from the brand or the imagery. If you have neither, pick "
            "a color you can defend in one sentence."))

    for fam, label in AI_DEFAULT_FONTS.items():
        if re.search(r"font(?:-family)?\s*[:=][^;}\n]*\b" + re.escape(fam) + r"\b", scan) or \
           re.search(r"fonts\.googleapis[^\"']*" + re.escape(fam.replace(" ", "+")), scan):
            out.append(finding(
                path, next((i + 1 for i, l in enumerate(lines) if fam in l.lower()), 1),
                fam, "inter-geist-default-typeface", "high", label + ".",
                "Pick a typeface as a decision: name the voice, then match it."))

    reps = {t: scan.count(t) for t in AI_DEFAULT_TOKENS
            if scan.count(t) >= th("ai-default-token-repetition", "min_count", 3)}
    if reps:
        tok = max(reps, key=reps.get)
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines) if tok in l.lower()), 1),
            ", ".join(f"{k} x{v}" for k, v in sorted(reps.items(), key=lambda kv: -kv[1])),
            "ai-default-token-repetition", "medium",
            "Utility tokens repeated across every surface are the unstyled style of "
            "generated UI: the treatment was applied, not designed.",
            "Keep each effect where it earns its place. Design one deliberate surface "
            "treatment and reuse that."))


    # Eyebrow usefulness is a semantic decision, not a digit/acronym test.
    # review_learning_structure.py emits title-stack candidates; the judge pass
    # decides whether each label adds orientation or scope.

    # ---- the pull quote that quotes nothing. A pull quote is BY DEFINITION an
    # excerpt of the document it sits in, so this is a provenance check, not taste.
    body_text = re.sub(r"\s+", " ", strip_markup(text)).lower()
    orphan_quotes = []
    for m in re.finditer(r"<(blockquote|aside|figure)\b([^>]*)>(.*?)</\1>", text, re.S | re.I):
        attrs, inner = m.group(2), m.group(3)
        if re.search(r"<cite\b|<figcaption\b", inner, re.I):
            continue
        qt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", inner)).strip(' "\u201c\u201d')
        words = qt.split()
        if len(words) < 6:
            continue
        # Does a six-word window of it occur anywhere else on the page?
        window = " ".join(words[:6]).lower()
        if body_text.count(window) <= 1 and not re.search(
                r"[\u2014\u2013-]\s*[A-Z][\w.\s,'-]{2,40}\s*$", qt):
            orphan_quotes.append((text[:m.start()].count("\n") + 1, qt[:70]))
    if orphan_quotes:
        out.append(finding(
            path, orphan_quotes[0][0],
            f"{len(orphan_quotes)} pull quote(s) quoting nothing on the page, "
            f'e.g. "{orphan_quotes[0][1]}"',
            "pull-quote-that-quotes-nothing", "high",
            "A pull quote is defined by a provenance relation: it is text PULLED from the "
            "document it decorates. This one appears nowhere else and names no source, so "
            "the form makes a promise the content cannot keep. A reader who goes looking "
            "for the speaker and finds none has learned something true about the page.",
            "In an article, replace it with the sharpest eight to fifteen words already in "
            "your body copy, and leave them in the body too \u2014 the pull quote is a trailer, "
            "not a scene. On a landing page there is no document to pull from, so it is a "
            "testimonial with a full name, role and company, or it is deleted. Make the "
            "component require a source and fail the build without one.",
            family="form"))

    # ---- the hero with nothing to look at
    hero_m = re.search(r"<(?:section|header|main|div)\b[^>]*>(.{0,4000}?)</(?:section|header|main|div)>",
                       text, re.S | re.I)
    if hero_m and re.search(r"<h1\b", hero_m.group(1), re.I):
        hero = hero_m.group(1)
        visuals = len(re.findall(r"<(?:img|picture|video|canvas|iframe)\b", hero, re.I))
        # A logo or an icon is not a look at the product; require a real <svg>.
        visuals += len([g for g in re.findall(r"<svg\b[^>]*>.*?</svg>", hero, re.S | re.I)
                        if g.count("<path") > 2 or len(g) > 600])
        if visuals == 0:
            out.append(finding(
                path, text[:hero_m.start()].count("\n") + 1,
                "hero contains an h1 and no screenshot, photograph, diagram or video",
                "hero-with-nothing-to-look-at", "high",
                "An image-less hero is a claim that there is nothing worth showing, and "
                "for a working product that claim is always false. A generator cannot "
                "screenshot software it has never run, so the visual slot resolves to the "
                "one thing it can synthesise from CSS: a gradient. The reader correctly "
                "infers the product does not exist, is ugly, or has not been used by "
                "anyone involved.",
                "Show the product. In descending order of what it proves: a real "
                "screenshot of a real screen with real data in it, cropped to the one "
                "view that makes the value legible; a five-to-fifteen second silent loop "
                "of it doing its one thing; or a diagram of the mechanism, which is the "
                "honest answer for infrastructure with no UI. If there genuinely is no "
                "product yet, say so and make the hero the argument for the waitlist \u2014 "
                "that is not a tell. Hiding pre-product status behind a gradient is.",
                family="form"))

    # ---- every section padded identically
    pads = re.findall(r"\bp[yt]-(\d{1,2})\b", scan) + \
        re.findall(r"padding(?:-block|-top)?\s*:\s*(\d{2,3})px", scan)
    if len(pads) >= th("undifferentiated-section-padding", "min_sections", 4) \
       and len(set(pads)) == 1:
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines)
                        if re.search(r"\bp[yt]-\d|padding", l, re.I)), 1),
            f"{len(pads)} sections all padded {pads[0]}",
            "undifferentiated-section-padding", "medium",
            "Spacing used as a constant rather than as a relationship. Nothing is grouped "
            "with anything and nothing is separated from anything, so the page is a stack "
            "of equally weighted slabs and the reader gets no signal about what belongs "
            "together.",
            "Vary it by role. Give the hero more room than it needs and the rest less, "
            "tighten the gap between a heading and the thing it introduces, and widen the "
            "gap between unrelated sections. A three-step scale used deliberately reads as "
            "designed; one value used everywhere reads as a default.",
            family="form"))


    # analyze_markup names the comment-stripped lowercase text `scan`; the checks
    # below were written against `low`, the web-build analyzer's name for the same
    # thing. Alias, and carry the same first-matching-line helper, rather than
    # letting the two analyzers drift apart.
    low = scan

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l, re.I)), default)


    # ================= app interiors: declared-but-unwired =================
    # The signature the empirical work isolates: a model emits the recognisable,
    # visible half of a pattern and drops the half that only matters under
    # failure or assistive technology. Escape handlers were present in 79% of
    # generated modals and worked in 59%, and 1,031 of 1,032 failures threw no
    # console error. So these checks hunt for a label without its behaviour.

    # ---- the hand-rolled dialog. 673 of 720 generated modals used a div with
    # role="dialog"; about 2% used native <dialog>. Near-deterministic.
    if re.search(r'role=["\'](?:dialog|alertdialog)["\']', text, re.I) \
       and not re.search(r"<dialog\b", low) \
       and not re.search(r"@radix-ui/react-dialog|react-aria|headlessui", low):
        out.append(finding(
            path, first(r'role=["\'](?:dialog|alertdialog)'),
            'role="dialog" with no native <dialog> and no dialog primitive',
            "hand-rolled-div-dialog", "high",
            "A modal built as a div wearing a dialog role. It looks correct and behaves "
            "wrongly: no free focus trap, no free Escape, no top layer, no background "
            "inertness. The web's modal corpus is overwhelmingly pre-<dialog> overlays, "
            "so a model reproduces the majority pattern; measured, native dialogs closed "
            "on Escape 98% of the time against 31% for hand-rolled ones.",
            "Use native <dialog> opened with showModal(), or a maintained primitive "
            "(Radix Dialog, React Aria). Both give focus trap, Escape, top-layer stacking "
            "and background inertness with no hand-written code, so delete the overlay, "
            "the keydown listener and the tab-cycling logic. Note that with native "
            "<dialog> you should NOT hand-trap focus \u2014 absent trap code there is correct.",
            family="defect"))

    # ---- the behaviour is declared; only a browser can say whether it runs.
    if re.search(r'\bkey(?:down|up)\b[^)\n]{0,60}Escape|e\.key\s*===\s*["\']Escape', text):
        out.append(finding(
            path, first(r"Escape"),
            "Escape handling is declared in source; presence does not mean it runs",
            "escape-and-focus-declared-not-wired", "medium",
            "Source review provably does not settle this one. Across roughly three "
            "thousand driven trials, Escape handlers were written in 79% of generated "
            "modals and actually closed the dialog in 59%, and 1,031 of 1,032 failures "
            "threw no console error \u2014 so every non-interactive check, including this "
            "one, reports success.",
            "Drive it in a browser: open by keyboard, press Escape, assert closed; "
            "reopen, Tab past the last control, assert focus never leaves the dialog; "
            "close, assert focus returned to the trigger. Better, stop hand-writing it "
            "and use <dialog> or a primitive. Counterintuitively, asking a model for "
            "accessibility can reduce basic function: 'make it accessible using <dialog>' "
            "scored 80% working opens against 98% for the plainer instruction.",
            family="defect"))

    # ---- forms the browser cannot help with
    inputs_all = re.findall(r"<input\b[^>]*>", text, re.I)
    typed = [i for i in inputs_all
             if not re.search(r'type=["\'](?:hidden|submit|button|checkbox|radio|reset)', i, re.I)]
    # analyze_forms runs a purpose-matching version of this check that names the
    # token each field wanted. This broader count-based one is the fallback for
    # fields whose purpose it could not identify; it defers so that a single
    # file never reports the same gap under the same id twice.
    named_purpose = any(re.search(pat, " ".join(typed), re.I)
                        for pat, _ in AUTOFILL_PURPOSE)
    if len(typed) >= th("missing-autofill-attributes", "min_inputs", 3) \
       and not named_purpose:
        with_ac = [i for i in typed if re.search(r"\bautocomplete=", i, re.I)]
        if len(with_ac) * 2 < len(typed):
            out.append(finding(
                path, first(r"<input"),
                f"{len(typed) - len(with_ac)} of {len(typed)} inputs have no autocomplete attribute",
                "missing-autofill-attributes", "medium",
                "Without autocomplete tokens the browser cannot fill a form it could "
                "otherwise complete in one tap. This costs everyone and costs people with "
                "motor and cognitive disabilities most, and it is invisible in a "
                "screenshot, which is where the generation loop looks.",
                "Add the standard tokens: autocomplete=\"email\", \"given-name\", "
                "\"family-name\", \"street-address\", \"postal-code\", \"tel\", "
                "\"current-password\", \"new-password\", \"one-time-code\". Pair with "
                "inputmode and the right type so mobile keyboards match the field.",
                family="defect"))

    # ---- tables that render the schema rather than a view
    if re.search(r"<table\b", low) or re.search(r'role=["\']table["\']', low):
        ths = len(re.findall(r"<th\b", low))
        has_sort = bool(re.search(r"aria-sort|onSort|sortBy|sortable", text, re.I))
        has_page = bool(re.search(r"pagination|page-?size|nextPage|aria-label=[\"']Pagination", text, re.I))
        if ths >= th("table-without-sort-filter-paging", "min_columns", 4) \
           and not has_sort and not has_page:
            out.append(finding(
                path, first(r"<table|role=[\"']table"),
                f"table with {ths} columns, no sort and no pagination",
                "table-without-sort-filter-paging", "medium",
                "A table is the one component whose usefulness depends entirely on "
                "behaviour, and a generated one arrives with the markup and none of it. "
                "It renders correctly with the eight rows in the mock and becomes unusable "
                "at eight hundred.",
                "Decide what a user does with this table and build that: sort on the "
                "columns people actually order by, a filter for the field they scan, and "
                "pagination or virtualisation past a few hundred rows. Show the row count "
                "so people know what they are looking at.",
                family="defect"))
        if re.search(r"aria-sort", text, re.I) and not re.search(r"<th[^>]*>\s*<button", text, re.I):
            out.append(finding(
                path, first(r"aria-sort"),
                "aria-sort present but the header is not a button",
                "sort-header-not-button-no-aria-sort", "medium",
                "The sort affordance is announced and cannot be operated from a keyboard. "
                "The visible half of the pattern shipped and the interactive half did not.",
                "Put a real <button> inside the <th> and keep aria-sort on the th, "
                "updating it between ascending, descending and none as the state changes.",
                family="defect"))

    # ---- states that only exist on the happy path
    if re.search(r"\bisLoading\b|\bloading\b|<Spinner|animate-spin", text) \
       and not re.search(r"\bisError\b|onError|catch\s*\(|errorMessage|\berror\b", text, re.I):
        out.append(finding(
            path, first(r"isLoading|animate-spin|<Spinner"),
            "a loading state with no error path",
            "unbounded-spinner-no-error-path", "medium",
            "A spinner that can spin forever. The request that never returns is the "
            "commonest real-world failure and the one a mock never shows, so the "
            "generated component has a state for waiting and none for having waited too "
            "long.",
            "Give every async surface three states, not two: loading, loaded, and failed "
            "with a message naming what failed and a control to retry. Add a timeout so "
            "the failed state is reachable without a server error.",
            family="defect"))

    # ---- settings as a rendering of the config schema
    toggles = len(re.findall(r'type=["\']checkbox["\']|role=["\']switch["\']|<Switch\b', text, re.I))
    if toggles >= th("settings-flat-toggle-wall", "min_toggles", 8) \
       and not re.search(r"<fieldset|<legend|role=[\"']group", text, re.I):
        out.append(finding(
            path, first(r'type=["\']checkbox|role=["\']switch|<Switch'),
            f"{toggles} toggles with no grouping",
            "settings-flat-toggle-wall", "medium",
            "Every configuration key became a switch, in schema order, with no grouping "
            "and no indication of defaults. The screen is a faithful rendering of the "
            "data model rather than a designed view, which is what you get when the model "
            "is the only thing available to design from.",
            "Group by what a person came to change, label each group, and say which "
            "values are defaults. Most settings screens shrink by half once you ask which "
            "of these anyone has ever needed to touch.",
            family="defect"))

    # ---- the two-button hero. Not two audiences with two next steps; two slots.
    hero_src = hero_m.group(1) if (hero_m and re.search(r"<h1\b", hero_m.group(1), re.I)) else ""
    if hero_src:
        btns = re.findall(r"<(?:a|button)\b[^>]*>", hero_src, re.I)
        ghosty = [b for b in btns if re.search(r"outline|ghost|border|transparent|secondary", b, re.I)]
        if len(btns) == 2 and len(ghosty) == 1:
            out.append(finding(
                path, text[:hero_m.start()].count("\n") + 1,
                "hero has exactly one solid and one ghost button",
                "obligatory-dual-cta", "low",
                "The solid-plus-ghost pair turns up because the hero component has two "
                "button slots, not because the page has two audiences with two next "
                "steps. The second button usually says Learn More and goes to the "
                "section immediately below it.",
                "Decide what the one next step is and offer that. Keep a second action "
                "only when it serves a genuinely different reader, and then make its "
                "label name that reader's outcome rather than 'Learn more'.",
                family="form"))

    # ---- one grid answering every content shape
    grid3 = len(re.findall(r"grid-cols-3\b", low)) + \
        len(re.findall(r"grid-template-columns\s*:\s*repeat\(\s*3", low))
    if grid3 >= th("triplicate-grid", "min_sections", 3):
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines)
                        if re.search(r"grid-cols-3|repeat\(\s*3", l, re.I)), 1),
            f"{grid3} three-column grids on one page",
            "triplicate-grid", "medium",
            "One layout answering features, then benefits, then testimonials, then "
            "pricing. The grid was not chosen for any of them; it was chosen once.",
            "Let each content shape pick its own layout. Two features with screenshots "
            "want a different container from five testimonials, and a pricing table is "
            "not a card grid at all. If every section looks the same the reader stops "
            "distinguishing them.",
            family="form"))

    # ---- a number doing the work of evidence
    # A bare percentage is a proportion, not a claim: "flags the 2% that need a
    # human" is grounded prose. The tell is a COMPARATIVE improvement with no
    # comparand, so require a multiplier or an improvement frame around the number.
    mags = re.findall(
        r"\b\d+(?:\.\d+)?x\b"
        r"|\b\d{1,3}%\s*(?:faster|slower|more|less|fewer|cheaper|improvement|increase|reduction|better)"
        r"|\b(?:save|cut|reduce|increase|boost|improve|slash|double|triple)s?\b"
        r"[^.!?\n]{0,24}?\b\d+(?:\.\d+)?\s*(?:%|x|hours?|days?|weeks?|minutes?)\b", low)
    if mags:
        has_ground = re.search(r"\b(?:compared (?:to|with)|versus|vs\.?|measured|benchmark|"
                               r"n\s*=|median|average of|baseline|according to|source:)\b", low)
        if not has_ground:
            out.append(finding(
                path, next((i + 1 for i, l in enumerate(lines)
                            if re.search(r"\d+x\b|\d{1,3}%", l, re.I)), 1),
                f"{len(mags)} magnitude claim(s) with no comparison, method or source: "
                + ", ".join(sorted(set(mags))[:4]),
                "magnitudes-without-a-baseline", "high",
                "A number with no denominator. 10x faster than what, measured how, "
                "against which workload? The figure does the rhetorical work of evidence "
                "while carrying none of the risk, which is why a generator reaches for it "
                "when it has no measurement to report.",
                "Give every number its denominator and its method, or delete it. "
                "'Median build time fell from 4m12s to 1m50s across our own CI over "
                "March' beats '3x faster' and cannot be doubted the same way.",
                family="form"))

    # ---- attribution that cannot be checked
    fake_av = re.findall(r"(?:pravatar\.cc|randomuser\.me|ui-avatars\.com|"
                         r"thispersondoesnotexist|avatar\.vercel\.sh|i\.pravatar)", low)
    initials = re.findall(r">\s*([A-Z][a-z]+ [A-Z]\.?)\s*,", text)
    if fake_av or len(initials) >= 2:
        detail = (f"{len(fake_av)} placeholder avatar URL(s)" if fake_av else "") + \
                 (f"{'; ' if fake_av else ''}{len(initials)} first-name-plus-initial attributions"
                  if len(initials) >= 2 else "")
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines)
                        if re.search(r"pravatar|randomuser|ui-avatars|[A-Z][a-z]+ [A-Z]\.,", l)), 1),
            detail, "testimonial-with-no-traceable-source", "high",
            "A quote from 'Sarah C., Product Manager' with a generated face. Nothing in "
            "the attribution can be checked, which is the design rather than an "
            "oversight. Placeholder avatar services are the clearest form: no real "
            "customer has a portrait served from a random-face API.",
            "Get a real name, role, company and a link, or take the testimonial down. "
            "One checkable quote outperforms five unfalsifiable ones, and a page with no "
            "testimonials is more credible than a page with invented ones.",
            family="form"))

    # ---- one typeface doing every job
    fams = set(re.findall(r"font-family\s*:\s*([^;}\n]+)", scan))
    fams = {f.strip().strip('"\'') for f in fams
            if "mono" not in f and "icon" not in f}
    if len(fams) == 1 and re.search(r"<h1\b", low):
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines)
                        if "font-family" in l.lower()), 1),
            f"one typeface for everything: {list(fams)[0][:50]}",
            "one-family-no-contrast", "low",
            "Display and body are the same face, differentiated only by size and weight. "
            "Headlines are body text made large. There is no pairing and no contrast of "
            "voice, because pairing is a decision and a single family is a default.",
            "Pair a display face with the text face, or at minimum set an optical size "
            "axis so the headline is drawn for headline sizes. One well-chosen pairing "
            "does more for a page than any amount of spacing work.",
            family="form"))

    # ---- centred paragraphs
    centred = len(re.findall(r"text-align\s*:\s*center", scan)) + \
        len(re.findall(r"\btext-center\b", scan))
    if centred >= th("centred-body-copy", "min_count", 6):
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines)
                        if re.search(r"text-center|text-align\s*:\s*center", l, re.I)), 1),
            f"{centred} centred text blocks",
            "centred-body-copy", "medium",
            "Centring applied to paragraphs and not just headings, so every block has a "
            "ragged left edge and the eye has to find the start of each line. It looks "
            "balanced in a thumbnail and reads badly at full size.",
            "Centre headings if you like; left-align anything over two lines. The left "
            "edge is what the eye returns to, and a ragged one costs the reader on every "
            "line.",
            family="form"))

    # ---- the untouched icon set
    if re.search(r"lucide", low) and re.search(r"\bSparkles\b", text) and \
       (re.search(r"\bZap\b", text) or re.search(r"\bArrowRight\b", text)):
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines) if "lucide" in l.lower()), 1),
            "default icon set with the worn glyph set (Sparkles, Zap, ArrowRight)",
            "untouched-default-icon-set", "low",
            "Not the library, which is good, but the specific glyphs: Sparkles beside "
            "anything AI, Zap beside anything fast, ArrowRight on every button. These "
            "are the icons a generator picks because they are the icons the training "
            "data picks.",
            "Choose glyphs that name the actual thing rather than the adjective. If the "
            "feature is scheduling, the icon is a calendar, not a lightning bolt. And "
            "drop Sparkles entirely, which now reads as a label saying 'AI went here'.",
            family="form"))

    # ---- motion applied by rule
    reveals = len(re.findall(r"whileInView|data-aos|animate-fade-?in-?up|\bfade-up\b", low))
    if reveals >= th("reveal-animation-on-everything", "min_count", 8):
        out.append(finding(
            path, next((i + 1 for i, l in enumerate(lines)
                        if re.search(r"whileInView|data-aos|fade-?in-?up", l, re.I)), 1),
            f"{reveals} scroll-entrance animations",
            "reveal-animation-on-everything", "medium",
            "Every element fades and rises into view, so the motion directs attention to "
            "nothing and delays all of it. Motion applied by rule rather than to mark "
            "the one thing that matters.",
            "Animate the one element whose arrival is the point and let the rest be "
            "present when the page is. Then add the prefers-reduced-motion guard, which "
            "a page with this much motion needs and almost never has.",
            family="form"))

    for i, l in enumerate(lines):
        if re.search(r"<(button|a|h[1-6]|th|label|summary)\b[^>]*>[^<]*", l):
            seg = re.findall(r">([^<]+)<", l)
            if any(is_emoji(c) or c in CHECK_GLYPHS for s in seg for c in s):
                out.append(finding(
                    path, i + 1, l.strip()[:120], "emoji-as-ui-icons", "high",
                    "Emoji inside UI chrome renders differently on every platform and "
                    "reads as a placeholder nobody replaced.",
                    "Use SF Symbols, Lucide, Heroicons, or bespoke SVG."))
                break
    return out




# ------------------------------------------------------- exposition signals

# Meta-navigation: the shape of structure, announced instead of enacted.
SIGNPOST = re.compile(
    r"\b(?:first|next|then|finally|lastly|now)\b[^.!?\n]{0,40}\b"
    r"(?:we(?:'ll| will| are going to)?|let's|I'll|this (?:post|article|section))\b"
    r"[^.!?\n]{0,40}\b(?:explore|examine|look at|dive into|discuss|cover|"
    r"walk through|review|consider|see|understand)\b", re.I)

# Artifacts of the repo the writer had open, in prose meant for someone who
# does not have it open.
REPO_TOKEN = re.compile(
    r"(?:(?<![\w/])[\w.-]+/[\w.-]+/[\w.-]+\.\w{1,5}\b)"          # a/b/c.ext
    r"|(?:\b[a-z_][a-z0-9_]{3,}\(\))"                                 # snake_case()
    r"|(?:\b[A-Z]{2,6}-\d{1,6}\b)"                                    # ABC-123
    r"|(?:\b(?:feat|fix|chore|refactor)/[\w.-]+\b)")                   # branch names

# The leading `?` matters more than it looks: a term of art is almost always
# code-formatted, so the definition that follows it is separated from it by a
# closing backtick. Without that, this check reported "never defined" on writing
# that had defined the term in the very next clause. The dash alternative is the
# other common appositive form and was missing outright.
DEF_HINT = r"`?(?:\s*\(|,\s*(?:which|a|an|the)\b|\s*:\s" \
           r"|\s*[\u2014\u2013]\s*(?:which|a|an|the|one|it|and|but)\b" \
           r"|\s+is\s+(?:a|an|the|our|" \
           r"what|how|when)\b|\s+are\s+(?:a|an|the|our)\b|\s+refers?\s+to\b|" \
           r"\s+means\b|\s+stands\s+for\b|\s+covers?\b|\s+denotes?\b|" \
           r"\s+describes?\b)"


def candidate_terms(body):
    """Terms of art a reader would need defined: backticked identifiers and
    Capitalised Multi-Word Phrases. Ordinary nouns are excluded by requiring
    either the backticks or the capitalisation pattern."""
    terms = {}
    for m in re.finditer(r"`([A-Za-z][\w .-]{2,30})`", body):
        t = m.group(1).strip()
        if re.search(r"[(){}=;/]", t):
            continue
        # An ordinary lowercase word in backticks is a label, not a term of art.
        # Require an identifier shape: a separator, an internal capital, or more
        # than one word.
        if not (re.search(r"[_.\-]", t) or re.search(r"[a-z][A-Z]", t)
                or " " in t or t[0].isupper()):
            continue
        terms.setdefault(t, 0)
    for m in re.finditer(r"(?<![.!?]\s)(?<!^)\b((?:[A-Z][a-z]{2,}\s){1,3}[A-Z][a-z]{2,})\b",
                         body, flags=re.M):
        terms.setdefault(m.group(1).strip(), 0)
    for t in list(terms):
        terms[t] = len(re.findall(r"\b" + re.escape(t) + r"\b", body))
        if terms[t] < 3:
            del terms[t]
    return terms


def analyze_exposition(path, lines, tags, body):
    """Does the piece model what its reader knows?

    These findings are about the gap between the writer's context and the
    reader's. A model writes from its context window, which holds the repo, the
    prior conversation and the internal docs, and nothing in that loop marks
    which parts the reader was present for.
    """
    out = []
    words = word_count(body)
    if words < 250:
        return out

    prose_idx = [i for i, t in enumerate(tags) if t == "prose" and lines[i].strip()]
    if not prose_idx:
        return out

    # ---- repo artifacts in outward prose
    # URL path components are source citations, not repository context.
    def without_urls(value):
        return re.sub(r"https?://[^\s<>)]+", "", value)

    toks = REPO_TOKEN.findall(without_urls(body))
    rate = len(toks) / words * 1000
    if len(toks) >= th("repo-context-leak", "min_count", 4) \
       and rate > th("repo-context-leak", "cue_per_1000w", 3.0):
        ex = ", ".join(sorted(set(toks))[:4])
        out.append(finding(
            path, next((i + 1 for i in prose_idx if REPO_TOKEN.search(without_urls(lines[i]))), 1),
            f"{len(toks)} repo artifacts in prose ({rate:.1f}/1000w): {ex}",
            "repo-context-leak", "medium",
            "File paths, function names, ticket ids and branch names outside a code "
            "block, addressed to someone who does not have the repo open. The writer "
            "had it open; the reader does not.",
            "Name the thing by what it does, and put the identifier in a code block or "
            "a link if it is genuinely needed. \"The scheduler\" beats "
            "\"lib/fleet/conductor.ts\" in a sentence someone reads on a phone.",
            family="form"))

    # ---- terms used long before they are defined, or never defined
    undefined = []
    for term, n in sorted(candidate_terms(body).items(), key=lambda kv: -kv[1])[:12]:
        uses = [m.start() for m in re.finditer(r"\b" + re.escape(term) + r"\b", body)]
        if not uses:
            continue
        # Match across singular and plural: "Soft Leases" used, then "A Soft
        # Lease is a lease that..." defining it, is a definition and not a miss.
        stem = (re.escape(term[:-1]) + "s?") if term.endswith("s") \
            else (re.escape(term) + "e?s?")
        # A term is often defined under a near form rather than the exact token:
        # "ARIA is a set of attributes, all beginning `aria-`" defines `aria-`,
        # and refusing to see that made the check fire on writing that HAD done
        # the work. Accept the bare form with separators and case stripped.
        bare = re.sub(r"^[-_.]+|[-_.]+$", "", term)
        if bare and bare.lower() != term.lower():
            stem = f"(?:{stem}|{re.escape(bare)}e?s?)"
        dm = re.search(r"\b" + stem + r"\b" + DEF_HINT, body, re.I) \
            or re.search(r"\b(?:call(?:ed)?|known as|term|what we mean by)\b[^.]{0,24}"
                         + stem, body, re.I)
        first_use = body[:uses[0]].count("\n")
        if dm is None:
            undefined.append((term, n, first_use, None))
        else:
            first_def = body[:dm.start()].count("\n")
            gap = first_def - first_use
            if gap > th("definition-after-use", "max_gap_lines", 12):
                undefined.append((term, n, first_use, gap))
    never = [u for u in undefined if u[3] is None]
    late = [u for u in undefined if u[3] is not None]
    if len(undefined) >= th("definition-after-use", "min_terms", 2):
        detail = "; ".join(
            f"{t} ({n}x, never defined)" if g is None else f"{t} ({n}x, defined {g} lines late)"
            for t, n, _, g in undefined[:4])
        out.append(finding(
            path, 1, f"{len(never)} term(s) never defined, {len(late)} defined after "
                     f"first use: {detail}",
            "definition-after-use", "high" if never else "medium",
            "Terms of art arriving before the reader has anything to attach them to. "
            "The writer already holds the concept, so the sentence reads fine to them "
            "and reads as noise to everyone else. This is the curse of knowledge with a "
            "context window behind it.",
            "Define a term at or before its first substantive use, in the sentence that "
            "uses it: an appositive is usually enough. Introduce one new idea at a time "
            "and let each one earn the next. If a term appears three times and you never "
            "define it, either define it or stop using it.",
            family="form"))

    # ---- announced structure
    sign = [(i + 1, lines[i].strip()[:80]) for i in prose_idx if SIGNPOST.search(lines[i])]
    if len(sign) >= th("signposting-without-structure", "min_count", 3):
        out.append(finding(
            path, sign[0][0], f"{len(sign)} meta-navigation sentences, e.g. "
                              f"\"{sign[0][1]}\"",
            "signposting-without-structure", "medium",
            "The shape of an argument announced rather than enacted. \"First we'll "
            "explore, then we'll examine, finally we'll conclude\" is an outline read "
            "aloud, and it costs the reader a paragraph before anything is said.",
            "Delete the announcements and let the headings and the prose do the work. If "
            "a transition is genuinely needed, make it carry information: say what "
            "changed, not that a section is beginning.",
            family="shape"))
    return out

# --------------------------------------------------------- web build signals

# Utility-class prefixes that mark the modern-framework idiom. Their PRESENCE is
# not a tell; their presence WITHOUT any responsive variant is, because it means
# the page wears the look of a framework without using the part that does work.
UTILITY_IDIOM = re.compile(
    r"\b(?:flex|grid|items-center|justify-between|rounded-\w+|px-\d|py-\d|"
    r"gap-\d|text-(?:xs|sm|base|lg|xl|\dxl)|bg-\w+-\d{2,3}|shadow-\w+)\b")
RESPONSIVE_VARIANT = re.compile(r"\b(?:sm|md|lg|xl|2xl):[a-z]", re.I)
SEMANTIC_TAGS = ("main", "nav", "header", "footer", "section", "article",
                 "aside", "figure", "figcaption")
SCAFFOLD_TITLES = ("create next app", "vite + react", "vite app", "react app",
                   "untitled", "document", "my app", "next.js app", "svelte app")
PLACEHOLDER_COPY = ("lorem ipsum", "your company", "acme inc", "acme corp",
                    "company name here", "your logo here", "product name")


def analyze_web_build(path, text):
    """Static build-quality checks over HTML/JSX/CSS.

    These are a different KIND of finding from the rest of this skill. They are
    not inferences about who wrote the page; they are defects you can reproduce
    by opening it. A page that horizontally scrolls at 390px scrolls for
    everyone, whoever built it. So they carry no fairness caveat and no dialect,
    and they are reported at the severity the defect deserves rather than the
    severity the suspicion deserves.
    """
    out = []
    lines = text.splitlines()
    low = text.lower()
    ext = path.suffix.lower()

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l, re.I)), default)

    # ---- the headline defect: framework look, no responsive implementation
    idiom = len(UTILITY_IDIOM.findall(text))
    variants = len(RESPONSIVE_VARIANT.findall(text))
    media = len(re.findall(r"@media[^{]*\((?:min|max)-width", low))
    if idiom >= th("framework-look-without-responsive", "min_idiom", 25) \
       and variants + media == 0:
        out.append(finding(
            path, first(r"class(?:Name)?="),
            f"{idiom} utility-class tokens, 0 responsive variants, 0 width media queries",
            "framework-look-without-responsive", "high",
            "The page wears the idiom of a modern framework and uses none of the part "
            "that does the work. Utility classes were copied for their look; the "
            "breakpoint prefixes that make the layout survive a phone were not.",
            "Pick the three widths that matter (about 390, 768, 1200) and make the page "
            "correct at each. Every multi-column grid needs a single-column form; every "
            "fixed width needs a max-width; horizontal padding belongs on a container, "
            "not on each child.", family="defect"))

    if ext in {".html", ".htm"} and "<head" in low and "name=\"viewport\"" not in low.replace("'", '"'):
        out.append(finding(
            path, first(r"<head"), "no viewport meta tag", "missing-viewport-meta", "high",
            "Without a viewport meta, a phone renders the page at desktop width and "
            "scales it down, so every text size and tap target is wrong. This is one "
            "line, and its absence means nobody opened the page on a phone.",
            'Add <meta name="viewport" content="width=device-width, initial-scale=1"> '
            "to <head>, then actually look at the result on a phone.", family="defect"))

    # ---- div soup
    divs = len(re.findall(r"<div\b", low))
    sem = sum(len(re.findall(r"<" + t + r"\b", low)) for t in SEMANTIC_TAGS)
    if divs >= th("div-soup-no-semantics", "min_divs", 20) \
       and sem <= divs * th("div-soup-no-semantics", "max_semantic_share", 0.08):
        out.append(finding(
            path, first(r"<div"), f"{divs} <div> vs {sem} semantic elements",
            "div-soup-no-semantics", "medium",
            "Everything is a div. Screen readers navigate by landmark and heading, so a "
            "page with no main, nav, header or footer has no structure to navigate by, "
            "however clear it looks on screen.",
            "Name the regions: one <main>, a <nav> for the nav, <header>/<footer>, and "
            "<section> where a heading introduces a region. It is a rename, not a "
            "rewrite, and it is usually twenty minutes.", family="defect"))

    clickable = [i + 1 for i, l in enumerate(lines)
                 if re.search(r"<(?:div|span)\b[^>]*\bon[Cc]lick", l)
                 and not re.search(r'role=["\']button|tabIndex|tabindex', l)]
    if clickable:
        out.append(finding(
            path, clickable[0], f"{len(clickable)} clickable <div>/<span> with no button role",
            "clickable-div-not-button", "high",
            "A div with a click handler is not reachable by keyboard, not announced as "
            "a control, and does not fire on Enter or Space. It looks identical and "
            "works for a subset of people.",
            "Use <button type=\"button\">. If it must stay a div, it needs role=\"button\", "
            "tabIndex={0}, and key handlers for Enter and Space — which is why you "
            "should use a button.", family="defect"))

    dead = len(re.findall(r'href=["\']#["\']', low)) + len(re.findall(r'href=["\']["\']', low))
    if dead >= th("dead-anchor-href", "min_count", 3):
        out.append(finding(
            path, first(r'href=["\']#?["\']'), f"{dead} anchors with href=\"#\" or empty",
            "dead-anchor-href", "medium",
            "Navigation that goes nowhere. On a real site these are the links a visitor "
            "tries first, and the generator emitted the shape of a nav without any "
            "destinations behind it.",
            "Point each link at a real destination, or remove it. A nav with three real "
            "links beats one with eight dead ones.", family="defect"))

    # ---- scaffold residue
    tm = re.search(r"<title[^>]*>([^<]{0,80})</title>", low)
    if tm and any(t in tm.group(1).strip() for t in SCAFFOLD_TITLES):
        out.append(finding(
            path, first(r"<title"), f"<title>{tm.group(1).strip()}</title>",
            "scaffold-title-residue", "high",
            "The framework's default title shipped. It is what a browser tab, a search "
            "result, and every shared link will say.",
            "Write the title: the product name, then what it is, under about 60 "
            "characters.", family="defect"))

    ph = [w for w in PLACEHOLDER_COPY if w in low]
    if ph:
        out.append(finding(
            path, first(re.escape(ph[0])), f"placeholder copy: {', '.join(ph)}",
            "placeholder-copy-residue", "high",
            "Template filler that reached a reader. Like an unfilled merge tag, this is "
            "proof rather than inference.",
            "Replace with real copy, or delete the section until you have some.",
            family="defect"))

    # ---- accessibility
    imgs = re.findall(r"<img\b[^>]*>", text, re.I)
    bad_alt = [g for g in imgs
               if not re.search(r"\balt=", g, re.I)
               or re.search(r'alt=["\'](?:image|photo|picture|screenshot)[^"\']*["\']', g, re.I)
               or re.search(r'alt=["\'][^"\']*\.(?:png|jpe?g|svg|webp)["\']', g, re.I)]
    if imgs and len(bad_alt) >= th("missing-or-placeholder-alt", "min_count", 2):
        out.append(finding(
            path, first(r"<img"), f"{len(bad_alt)} of {len(imgs)} <img> with missing or "
                                  f"placeholder alt text",
            "missing-or-placeholder-alt", "medium",
            "Alt text that says 'image of a person using a laptop' describes the file "
            "rather than its job on the page. Decorative images want alt=\"\"; "
            "informative ones want the information.",
            "For each image ask what a reader loses if it does not load. Write that. If "
            "nothing is lost, use alt=\"\" so it is skipped.", family="defect"))

    if re.search(r"outline\s*:\s*(?:none|0)", low) and ":focus-visible" not in low:
        out.append(finding(
            path, first(r"outline\s*:\s*(?:none|0)"),
            "outline removed with no :focus-visible replacement",
            "focus-outline-removed", "high",
            "Keyboard users navigate by the focus ring. Removing it without a "
            "replacement makes the page unusable without a mouse while looking tidier "
            "in a screenshot.",
            "Replace it rather than remove it: :focus-visible { outline: 2px solid "
            "<accent>; outline-offset: 2px }. Tab through the page and confirm you can "
            "always see where you are.", family="defect"))

    anim = len(re.findall(r"@keyframes|animation\s*:|transition\s*:|framer-motion|"
                          r"animate-\w+", low))
    if anim >= th("no-reduced-motion-guard", "min_animations", 6) \
       and "prefers-reduced-motion" not in low:
        out.append(finding(
            path, first(r"@keyframes|animation\s*:|animate-"),
            f"{anim} animation/transition declarations, no prefers-reduced-motion guard",
            "no-reduced-motion-guard", "medium",
            "Motion that cannot be turned off. For people with vestibular disorders "
            "this is not a preference, and the guard is four lines.",
            "@media (prefers-reduced-motion: reduce) { *, *::before, *::after { "
            "animation-duration: .01ms !important; transition-duration: .01ms "
            "!important } }", family="defect"))

    # ---- CSS hygiene
    bangs = low.count("!important")
    if bangs >= th("important-escalation", "min_count", 8):
        out.append(finding(
            path, first(r"!important"), f"{bangs} uses of !important",
            "important-escalation", "low",
            "Specificity fought rather than designed. It is what happens when styles are "
            "added without reading the ones already there.",
            "Find the rule being overridden and change it. Keep !important for utility "
            "overrides and print styles.", family="defect"))


    # ---- 100vw and the full-bleed hack: the most common single cause of the
    # sideways scroll, because 100vw includes the scrollbar and 100% does not.
    vw = len(re.findall(r"\b(?:width|min-width|max-width)\s*:\s*100vw\b", low)) \
        + len(re.findall(r"\bw-screen\b|\bw-\[100vw\]", low))
    bleed = len(re.findall(r"margin-(?:left|inline-start)\s*:\s*calc\(\s*-?50vw", low)) \
        + len(re.findall(r"margin-left\s*:\s*-50vw", low))
    if vw or bleed:
        out.append(finding(
            path, first(r"100vw|w-screen"),
            f"{vw} use(s) of 100vw/w-screen" + (f" plus {bleed} -50vw full-bleed hack(s)" if bleed else ""),
            "hundred-vw-overflow", "high" if bleed else "medium",
            "100vw is the viewport including its scrollbar, so on any desktop browser "
            "that reserves scrollbar space it is wider than the space available. Paired "
            "with the -50vw full-bleed trick it overflows twice.",
            "Use width:100% and let the element fill its container, or `100dvw` where you "
            "genuinely mean the dynamic viewport. For a full-bleed section inside a padded "
            "container, the modern form is `margin-inline: calc(50% - 50vw)` with "
            "`overflow-x: clip` on a wrapper \u2014 and verify it at 390px either way.",
            family="defect"))

    if re.search(r"\b(?:height|min-height)\s*:\s*100vh\b", low) or "h-screen" in low:
        out.append(finding(
            path, first(r"100vh|h-screen"), "100vh used for full-height layout",
            "static-vh-full-height", "low",
            "On mobile browsers 100vh is the viewport with the URL bar hidden, so a "
            "100vh hero is taller than the screen until you scroll, and the bottom of it "
            "is cut off on first paint.",
            "Use 100dvh (dynamic viewport height) with a 100vh fallback: "
            "`min-height: 100vh; min-height: 100dvh`. Or stop pinning the hero to the "
            "viewport at all, which is usually the better answer.",
            family="defect"))

    # A lang bound to a template expression — lang="{{ locale }}", lang={locale},
    # :lang — is the CORRECT shape, not a missing attribute. Treating it as missing
    # sent every properly internationalised root layout a false positive.
    if ext in {".html", ".htm"} and re.search(r"<html\b", low) \
       and not re.search(r"<html\b[^>]*\blang\s*=\s*[\"']\s*[a-z]", low) \
       and not re.search(r"<html\b[^>]*\b:?lang\s*=\s*[\"']?\s*[{<]", low):
        out.append(finding(
            path, first(r"<html"), "<html> has no lang attribute",
            "missing-html-lang", "medium",
            "Without a language, screen readers pick a voice by guess and often read the "
            "page in the wrong accent or phonology. It is one attribute.",
            'Set it on the root element: <html lang="en">. Use the real language, and a '
            "region subtag only where it changes pronunciation or formatting.",
            family="defect"))

    if re.search(r"<script[^>]+src=[\"'][^\"']*(?:cdn\.tailwindcss\.com|@tailwindcss/browser)", low) \
       or re.search(r"<script[^>]+src=[\"'][^\"']*(?:babel-standalone|@babel/standalone)", low):
        out.append(finding(
            path, first(r"cdn\.tailwindcss\.com|babel-standalone|@babel/standalone"),
            "runtime-compiled CSS/JS CDN on a shipped page",
            "tailwind-play-cdn-in-production", "medium",
            "The Play CDN compiles your stylesheet in the visitor's browser on every "
            "page load. It exists for prototypes and says so in its own documentation. "
            "Shipping it means the build step was never set up.",
            "Install the framework as a build dependency and ship a compiled stylesheet. "
            "For Tailwind that is the CLI or the Vite/PostCSS plugin; the output is "
            "usually a few kilobytes against the CDN's several hundred, and it stops the "
            "flash of unstyled content.",
            family="defect"))

    h1s = len(re.findall(r"<h1\b", low))
    if ext in {".html", ".htm"} and "<body" in low and h1s != 1:
        out.append(finding(
            path, first(r"<h1|<body"), f"{h1s} <h1> elements",
            "h1-absent-or-competing", "medium",
            "Either nothing states what the page is, or several things claim to. The h1 "
            "is what a screen reader announces first and what search results lean on.",
            "Exactly one h1 per page, naming the page rather than the brand. Everything "
            "below it steps down by one level without skipping.",
            family="defect"))

    if ext in {".html", ".htm"} and "<head" in low:
        miss = []
        if not re.search(r'<meta[^>]+name=[\"\']description[\"\']', low):
            miss.append("meta description")
        if not re.search(r'<meta[^>]+(?:property|name)=[\"\']og:image', low):
            miss.append("og:image")
        if miss:
            out.append(finding(
                path, first(r"<head"), "missing: " + ", ".join(miss),
                "no-meta-description-or-og-image", "low",
                "What the page looks like when someone shares it or finds it. Without an "
                "og:image a link unfurls as a grey box, which reads as abandoned.",
                "Write a meta description that says what the page offers in about 150 "
                "characters, and set an og:image at 1200x630 showing the actual product "
                "rather than the logo on a gradient.",
                family="defect"))

    inputs = re.findall(r"<input\b[^>]*>", text, re.I)
    real = [i for i in inputs
            if not re.search(r'type=[\"\'](?:hidden|submit|button|image|reset)', i, re.I)]
    labelled = len(re.findall(r"<label\b", low)) + \
        len([i for i in real if re.search(r"aria-label|aria-labelledby", i, re.I)])
    if len(real) >= 2 and labelled < len(real):
        out.append(finding(
            path, first(r"<input"), f"{len(real)} real inputs, {labelled} with a label",
            "input-without-label", "medium",
            "A placeholder is not a label: it disappears the moment someone types, and "
            "screen readers do not reliably announce it. Unlabelled fields are the most "
            "common reason a form cannot be completed without sight.",
            "Give every input a <label for> pointing at its id, or an aria-label where a "
            "visible label genuinely does not fit. Keep the placeholder for an example of "
            "the format, not for the field name.",
            family="defect"))

    forms = re.findall(r"<form\b[^>]*>", text, re.I)
    orphan = [f for f in forms
              if not re.search(r"\baction\s*=", f, re.I)
              and not re.search(r"onSubmit|on-submit|@submit", f, re.I)]
    if orphan:
        out.append(finding(
            path, first(r"<form"), f"{len(orphan)} form(s) with no action and no submit handler",
            "form-without-destination", "high",
            "A form that goes nowhere. This one IS model-flavoured: a generator produces "
            "a complete, convincing front end for a back end that was never asked for, "
            "and the failure is invisible until a real person types into it and presses "
            "send.",
            "Wire it to something and then submit it yourself and confirm the message "
            "arrives. If there is no destination yet, replace the form with a mailto link "
            "so the page makes an honest promise.",
            family="defect"))


    # =============== unopened surfaces: navigation and wayfinding ===============
    # The umbrella diagnosis for this cluster is ia-is-a-projection-of-the-filesystem:
    # the nav lists every route, the footer lists every page, because enumeration is
    # free and prioritisation needs knowledge the generator does not have. Each
    # symptom below is decidable from one file; the cluster is the diagnosis.

    nav_anchor = re.search(r"<nav\b", low) or re.search(r'role=["\']navigation["\']', low)
    if nav_anchor:
        nav_links = len(re.findall(r"<a\b|<Link\b", text))
        if nav_links >= 3 \
           and not re.search(r"aria-current", text, re.I) \
           and not re.search(r"usePathname|useRouter|\bisActive\b|activeClass|"
                             r"aria-selected|data-active|router\.pathname|\$page\.url", text) \
           and not re.search(r'class(?:Name)?=["\'][^"\']*\bactive\b', text, re.I):
            out.append(finding(
                path, first(r"<nav|role=[\"']navigation"),
                f"nav with {nav_links} links and no current-page indicator",
                "nav-without-active-state", "high",
                "Nothing marks the page you are on. The nav is authored once as a stateless "
                "component and page two is never rendered, so there is no moment at which the "
                "missing state is visible. NN/g calls this the commonest menu mistake, and "
                "conveying location visually only is a WCAG 1.3.1 failure — here it is not "
                "conveyed at all.",
                "Set aria-current=\"page\" on the matching link and style "
                "[aria-current=\"page\"]. Do both: the attribute is what assistive technology "
                "reads, the style is what everyone else reads. Do not use colour alone.",
                family="defect"))

    toggle = re.search(r"<button[^>]*(?:aria-expanded|aria-label=[\"'][^\"']*"
                       r"(?:menu|navigation)[^\"']*[\"'])", text, re.I)
    if toggle and re.search(r'class(?:Name)?=["\'][^"\']*\bhidden\b', text) \
       and not re.search(r"\b(?:sm|md|lg|xl|2xl):(?:flex|block|grid|inline-flex)\b", text):
        out.append(finding(
            path, first(r"aria-expanded|aria-label=[\"'][^\"']*(menu|navigation)"),
            "nav toggle present, nav list hidden with no breakpoint that reveals it",
            "hamburger-at-desktop-width", "high",
            "The list is hidden and nothing brings it back at any width, so the full nav is "
            "behind a toggle on a 1440px screen. The responsive nav pattern was written from "
            "memory and the breakpoint pair came out wrong; nobody opened a desktop viewport. "
            "NN/g measured the cost — discoverability roughly halves.",
            "Reveal it from md or lg up: `hidden md:flex` on the list, `md:hidden` on the "
            "toggle. Then load the page at 1280 and at 1440 and look.",
            family="defect"))

    if re.search(r'type=["\']search["\']|role=["\']searchbox["\']', text, re.I) \
       and not re.search(r"<form[^>]*action=", text, re.I) \
       and not re.search(r"onSubmit|handleSearch|\bsearch\(|/search", text, re.I) \
       and not re.search(r"fuse\.js|lunr|flexsearch|minisearch|pagefind|docsearch|"
                         r"algoliasearch|typesense", low):
        out.append(finding(
            path, first(r'type=["\']search|role=["\']searchbox'),
            "search input with no form action, no handler and no index",
            "decorative-site-search", "high",
            "A search box that submits nowhere. Same family as form-without-destination: "
            "search is a component the model can render convincingly and a backend it was not "
            "asked to build. It is worse than no search, because the control makes a promise "
            "and then tells the visitor their content does not exist.",
            "Wire it — Pagefind or Fuse.js index a static build in minutes — or "
            "delete the input. Under about a dozen pages, deleting it and fixing the menu is "
            "the right answer. Then search for a string you know is on the page.",
            family="defect"))

    fm = re.search(r"<footer\b", low)
    if fm:
        foot = text[fm.start():]
        fl = re.findall(r"<(?:a|Link)\b[^>]*?(?:href|to)=[\"']([^\"']*)[\"']", foot, re.I)
        dead = [h for h in fl if h.strip() in {"#", ""} or h.startswith("javascript:")]
        if len(fl) >= th("footer-sitemap-dump", "min_links", 12) \
           and len(dead) >= len(fl) * th("footer-sitemap-dump", "dead_share", 0.3):
            out.append(finding(
                path, first(r"<footer"),
                f"{len(fl)} footer links, {len(dead)} of them going nowhere",
                "footer-sitemap-dump", "medium",
                "The four-column corporate footer, on a site with one product and no company. "
                "This is where the generator puts the IDEA of an organisation: a real company "
                "has a Press page, so the link appears. The dead href is the symptom; the "
                "shape is the finding.",
                "List only what exists. Legally required links stay; the rest go when the page "
                "does. If two labels point at one page, pick one and use it in both places so "
                "visited-link state and recall work.",
                family="shape"))

    # ======================= unopened surfaces: i18n =======================
    # Every check here is gated on the site CLAIMING more than one locale. A
    # single-locale site is not defective for being single-locale, and firing on
    # one would be the kind of false positive that gets a tool switched off.
    i18n_claim = bool(re.search(r"hreflang|\blocales\b|useTranslation|i18n|next-intl|"
                                r"react-i18next|\{\s*t\(|formatMessage", text, re.I))

    if i18n_claim and re.search(r'<html[^>]*\blang=["\']en["\']', text, re.I) \
       and not re.search(r"lang=\{|:lang=|lang=\"\{", text):
        out.append(finding(
            path, first(r"<html"), 'literal lang="en" on a site that claims other locales',
            "lang-frozen-on-locale-switch", "high",
            "The attribute is present and wrong, which is why no \"is it there\" check finds "
            "it. The switcher and the strings are the visible half of i18n; the half only "
            "assistive technology observes was not wired, so a screen reader reads Spanish "
            "with an English voice.",
            "Bind lang to the active locale in the root layout and set dir from the same "
            "source. Wrap inline other-language passages in <span lang=\"…\">.",
            family="defect"))

    if re.search(r"[\"'](?:ar|he|fa|ur|yi|dv|ps|ckb)[\"']|[\"']ar-|[\"']he-", text) \
       and i18n_claim and not re.search(r"\bdir=", text, re.I):
        phys = len(re.findall(r"margin-left|margin-right|padding-left|padding-right|"
                              r"text-align\s*:\s*(?:left|right)|border-left|border-right", low))
        phys += len(re.findall(r"\b(?:ml|mr|pl|pr|text-left|text-right|rounded-l|rounded-r|"
                               r"border-l|border-r)-", text))
        logi = len(re.findall(r"margin-inline|padding-inline|inset-inline|"
                              r"text-align\s*:\s*(?:start|end)|border-inline", low))
        logi += len(re.findall(r"\b(?:ms|me|ps|pe|text-start|text-end|rounded-s|rounded-e|"
                               r"border-s|border-e)-", text))
        if phys >= 5 and phys >= (logi + 1) * th("rtl-unsupported-physical-properties",
                                                 "phys_ratio", 5.0):
            out.append(finding(
                path, first(r"margin-left|padding-left|\bml-|\bpl-"),
                f"an RTL locale is offered; {phys} physical spacing rules against {logi} "
                f"logical ones, and no dir attribute",
                "rtl-unsupported-physical-properties", "high",
                "Arabic or Hebrew is on the menu and the layout cannot mirror. Physical "
                "properties are what the corpus is made of, so they are what gets generated; "
                "logical properties require someone to have thought about a reader who is not "
                "the author.",
                "Set dir on <html> from the locale and convert spacing and alignment to "
                "logical properties — margin-inline-start, text-align:start, "
                "border-inline-start. Mirror directional icons, and do NOT mirror icons of "
                "real-world objects: a clock, a play button, a logo.",
                family="defect"))

    us_form = sum(bool(x) for x in (
        re.search(r'name=["\'](?:firstName|first_name|fname)["\']', text, re.I)
        and not re.search(r'name=["\'](?:name|fullName|full_name)["\']', text, re.I),
        re.search(r'pattern=["\']\^?\\\\?d\{5\}|maxlength=["\']5["\'][^>]*zip', text, re.I),
        re.search(r'name=["\']state["\'][^>]*required|<option[^>]*>\s*Alabama', text, re.I),
        re.search(r"\\\(\\\\?d\{3\}\\\)|\(\d{3}\)\s*\d{3}-\d{4}", text),
    ))
    if us_form >= 2:
        out.append(finding(
            path, first(r"firstName|first_name|pattern=[\"']\^?\\\\?d\{5\}|name=[\"']state"),
            "a form shaped for one country: split names, US states, five-digit postal, "
            "US phone mask",
            "name-and-address-shape-assumed", "medium",
            "The US address form is the overwhelming majority shape in the training data, so "
            "it is the default produced — including for a product whose stated market is "
            "somewhere else. Several of these fields describe nobody in Ireland, Hong Kong or "
            "Iceland.",
            "One Full name field with autocomplete=\"name\" unless you have a concrete reason "
            "to split. Make the address field set depend on the country, and make state and "
            "postcode optional where the country does not use them. Never validate phone "
            "numbers with a country-specific regex.",
            family="defect"))

    for m in re.finditer(r"<img\b[^>]*\balt=[\"']([^\"']{40,})[\"']", text, re.I):
        alt = m.group(1)
        if len(alt.split()) >= 8 and re.search(r"[.!—]|\$\d|\d+%|free trial|per month|"
                                               r"no card required", alt, re.I):
            out.append(finding(
                path, text[:m.start()].count("\n") + 1,
                f'alt text carrying the marketing copy: "{alt[:70]}…"',
                "text-baked-into-image", "medium",
                "The headline moved into the image and its words survive only in the alt "
                "attribute — so they cannot be translated, selected, searched, resized "
                "or reflowed. Generated hero imagery increasingly contains generated text, "
                "which is why this now appears for a model-specific reason and not only the "
                "old designer-hands-over-a-PNG one. WCAG 1.4.5.",
                "Live text over the image, positioned with CSS: an <h2> and a <p> over an "
                "<img alt=\"\">. For diagrams use inline SVG with real <text> nodes so labels "
                "stay translatable and selectable.",
                family="defect"))
            break

    flags = len(re.findall(r"[\U0001F1E6-\U0001F1FF]{2}", text)) \
        + len(re.findall(r'class(?:Name)?=["\'][^"\']*(?:flag-icon|fi fi-|country-flag)', text))
    if flags >= 2 and i18n_claim \
       and not re.search(r"Español|Deutsch|Français|Português|Italiano|"
                         r"日本語|العربية|"
                         r"中文|한국어", text):
        out.append(finding(
            path, first(r"[\U0001F1E6-\U0001F1FF]{2}|flag-icon|fi fi-|country-flag"),
            f"{flags} flags used as a language selector, with no language named",
            "flag-as-language-selector", "low",
            "Languages are not countries and the mapping is many-to-many. Flags are the most "
            "visually available representation of \"language\" in the corpus and cost nothing "
            "to emit. The compounding failure is that the control is usually labelled only in "
            "the CURRENT language, so a visitor who landed on the wrong locale cannot read the "
            "way out.",
            "Label each option with its endonym — English, Español, Deutsch, "
            "日本語 — plus the BCP-47 tag in lang and hreflang. Never use a "
            "flag as the sole cue.",
            family="shape"))

    # ============ dark patterns the corpus supplies by default ============
    # None of this is an inference about intent. These shapes are statistically
    # normal on the commercial web, so they are what "add a cookie banner" or
    # "add a product page" retrieves. The output is still deceptive, and in
    # several cases below unlawful, which is the author's decision to make.
    consent_ctx = bool(re.search(r"cookie|consent|gdpr|ccpa", low))
    if consent_ctx and re.search(r">\s*(?:Accept|Allow|Agree|Got it|I understand)\b", text, re.I) \
       and not re.search(r">\s*(?:Reject|Decline|Deny|Refuse|Only necessary|Necessary only|"
                         r"Essential only)\b", text, re.I):
        out.append(finding(
            path, first(r">\s*(Accept|Allow|Agree|Got it)"),
            "consent banner with an accept control and no reject control",
            "consent-choice-asymmetry", "high",
            "The asymmetric banner is close to universal on the commercial web, so it is what "
            "the corpus supplies. It is nonetheless non-compliant: the EDPB taskforce and the "
            "CPPA both require symmetry of choice, and the privacy-protective path may not be "
            "longer or harder than the permissive one.",
            "Put \"Reject all\" on the first layer: same element, same size, same weight as "
            "\"Accept all\". A third \"Manage\" option may be a link. Default every "
            "non-essential category to off.",
            family="defect"))

    tracker = re.search(r"googletagmanager|google-analytics|connect\.facebook\.net|"
                        r"hotjar|clarity\.ms|/analytics\.js", low)
    if tracker and consent_ctx \
       and not re.search(r"text/plain|consent[\"']?\s*,|analytics_storage|ad_storage|"
                         r"granted|denied|CookieConsent|cookieyes|onetrust|klaro", text, re.I):
        out.append(finding(
            path, first(r"googletagmanager|google-analytics|connect\.facebook\.net|hotjar|clarity"),
            "a tracking tag and a consent banner in the same file, with nothing connecting them",
            "tracking-before-consent", "high",
            "The purest declared-but-not-wired defect in this lane, and the clearest case of "
            "two correct halves adding up to a violation. Each vendor documents a "
            "paste-into-head snippet; the banner is a separate component; both are generated "
            "correctly in isolation and nothing gates one on the other. The banner ends up "
            "sitting on top of a completed violation.",
            "Initialise Consent Mode with every storage denied BEFORE the tag loads, and flip "
            "it in the banner's accept handler — or let a CMP rewrite the script tags. "
            "Then verify in a fresh profile with devtools open, not by reading the code.",
            family="defect"))

    for m in re.finditer(r"<input\b[^>]*type=[\"']checkbox[\"'][^>]*>", text, re.I):
        tag = m.group(0)
        if not re.search(r"\bchecked\b|defaultChecked", tag, re.I):
            continue
        ctx = text[m.start():m.start() + 400]
        if re.search(r"newsletter|marketing|updates|offers|promotions|partners|"
                     r"third[- ]part|share my|keep me posted", ctx, re.I):
            out.append(finding(
                path, text[:m.start()].count("\n") + 1,
                "a marketing checkbox that ships already ticked",
                "prechecked-optin", "high",
                "Consent obtained by inattention. Pre-ticked boxes are the majority shape in "
                "the corpus of signup forms, so they are the default produced. CJEU "
                "C-673/17 Planet49: consent is not validly constituted by a pre-ticked box the "
                "user must deselect to refuse.",
                "Ship it unchecked. Separate consents get separate boxes — never bundle "
                "marketing consent with terms acceptance. Phrase the label positively so the "
                "checked state means yes.",
                family="defect"))
            break

    cs = re.search(r">\s*(No,?\s*thanks?,?\s+I\b[^<]{0,70}|I'?d rather[^<]{0,60}|"
                   r"No,?\s*I (?:don'?t|do not) (?:want|need)[^<]{0,60})<", text, re.I)
    if cs:
        out.append(finding(
            path, text[:cs.start()].count("\n") + 1,
            f'decline label written as a confession: "{cs.group(1).strip()[:60]}"',
            "confirmshaming-decline-label", "medium",
            "The decline control judges the person using it. This is a copywriting convention "
            "in the corpus — the model has read thousands of these and produces them as "
            "the house style for a dismiss link — which makes it the most easily removed "
            "item in this lane and the one most likely to be pure imitation.",
            "Label the action, not the person: \"No thanks\", \"Not now\", \"Close\". Keep the "
            "decline as findable and as clickable as the accept.",
            family="form"))

    # ------------------------------------------------- print: nobody pressed Ctrl-P
    # An email template is not a printed web page, and it is full of exactly the
    # signals this check reads as print-hostile. Skip it.
    is_email_tpl = bool(re.search(r"mso-hide|<!--\[if mso\]|role=[\"']presentation[\"']|"
                                  r"view (?:this )?(?:email|message) (?:in|on)", low))
    if ext in {".css", ".html", ".htm"} and not is_email_tpl \
       and "@media print" not in low \
       and not re.search(r'media=["\']print', low):
        hostile = sum(bool(x) for x in (
            re.search(r"position\s*:\s*(?:fixed|sticky)", low),
            re.search(r"100vh|min-h-screen|height\s*:\s*100vh", low),
            re.search(r"overflow\s*:\s*hidden", low),
        ))
        doc_like = bool(re.search(r"invoice|receipt|ticket|itinerary|boarding|statement|"
                                  r"packing slip", low))
        if hostile >= 2 or doc_like:
            out.append(finding(
                path, first(r"position\s*:\s*(fixed|sticky)|100vh|invoice|receipt"),
                "no @media print rule, on a page with fixed chrome or a printable document",
                "no-print-stylesheet", "high" if doc_like else "medium",
                "The page prints as a fixed header, a hamburger button and three blank sheets, "
                "with every link destination invisible. Print is not in the generation loop at "
                "all — the least-visited surface here — and the things people "
                "actually print are invoices, tickets and itineraries.",
                "Add a print block: hide the chrome, unpin fixed positioning, reset "
                "viewport-height sections, avoid breaking inside headings, tables and figures, "
                "print link destinations after external anchors with a[href^=\"http\"]::after, "
                "and set @page { margin: 15mm }. Then actually print it.",
                family="defect"))


    # ============ the overlap set: fingerprints that are ALSO defects ============
    # Most tool fingerprints are neutral infrastructure and belong in --provenance,
    # not here. These are the ones where the provenance string and a craft problem
    # are the SAME BYTES, so the fix is to do the work, not to hide the string.

    scaffold = []
    if re.search(r'href=["\']/vite\.svg["\']', text, re.I):
        scaffold.append("the Vite logo is still the favicon")
    if re.search(r"<title>\s*(?:Vite \+ React|Create Next App|React App|v0 App)\s*</title>",
                 text, re.I):
        scaffold.append("the scaffold's title is still the page title")
    if re.search(r"Generated by v0|Created with v0|Generated by create next app", text, re.I):
        scaffold.append("the meta description names the tool that made the page")
    if re.search(r"%PUBLIC_URL%", text):
        scaffold.append("an unsubstituted %PUBLIC_URL% token shipped")
    if scaffold:
        out.append(finding(
            path, first(r"vite\.svg|<title>|Generated by|%PUBLIC_URL%"),
            "; ".join(scaffold), "scaffold-title-and-favicon-residue", "high",
            "The favicon and the share card are the two most-seen bytes of any site, and the "
            "two nobody looks at during a chat-driven build, because the preview pane renders "
            "neither. This is a defect first and a provenance string second: search results and "
            "browser tabs currently describe the build tool instead of the product.",
            "Four lines: a real title, a real meta description, a real favicon, and a real "
            "og:image on your own domain. Check the DEPLOYED HTML rather than the builder's "
            "preview — on some platforms the metadata change appears only in the deploy.",
            family="residue"))

    og = re.search(r"bolt\.new/static/og_default\.png"
                   r"|pub-[0-9a-f]{32}\.r2\.dev/[0-9a-f]{32}/id-preview-[0-9a-f-]+"
                   r"\.lovable\.app-\d{13}\.png", text, re.I)
    if og:
        auto = "lovable.app-" in og.group(0)
        out.append(finding(
            path, text[:og.start()].count("\n") + 1,
            ("the share card is an auto-screenshot of a preview build"
             if auto else "the share card is the builder's own logo"),
            "builder-default-og-image", "high",
            ("Every link to this site posts a robot's snapshot of an unfinished preview. The "
             "card was never authored, and this URL survives badge removal and a custom domain, "
             "so it outlives every other trace."
             if auto else
             "Every share of this business's site posts the builder's logo. The share card is "
             "invisible in the preview pane, so nothing in the build loop surfaces it."),
            "Ship a real 1200x630 og:image on your own domain. One change fixes the card and "
            "removes the fingerprint, which is the right order to do it in.",
            family="defect"))

    tokens = re.findall(r"oklch\(0\.769 0\.188 70\.08\)|oklch\(0\.828 0\.189 84\.429\)"
                        r"|oklch\(0\.398 0\.07 227\.392\)|oklch\(0\.6 0\.118 184\.704\)"
                        r"|--sidebar-ring:\s*oklch\(0\.708 0 0\)", text)
    if tokens:
        out.append(finding(
            path, first(r"oklch\(0\.769|oklch\(0\.828|oklch\(0\.398|--sidebar-ring"),
            f"{len(tokens)} unmodified shadcn/ui default theme token(s)",
            "shadcn-default-tokens-untouched", "medium",
            "This is the mechanism behind \"every generated site is the same purple\", and it "
            "is measurable as exact constants rather than as a vibe: the values are identical "
            "across thousands of sites because nobody replaced them. Swapping the hue does not "
            "change the system — the palette is a default whichever colour it defaults to.",
            "Replace the whole token block with brand values, including --chart-* and "
            "--sidebar-*, which are the ones people forget. Changing only --primary leaves five "
            "default chart colours that surface the first time anyone renders a graph. Using "
            "shadcn/ui is not the problem; not choosing is.",
            family="residue"))

    img = re.search(r"Gemini_Generated_Image_|ChatGPTImage[A-Z][a-z]{2}\d"
                    r"|ChatGPT-Image-[A-Z][a-z]{2}-\d", text)
    if img:
        ln = text[:img.start()].count("\n") + 1
        ctx = text[max(0, img.start() - 400):img.start() + 400]
        proof = bool(re.search(r"author|byline|team|founder|testimonial|review|headshot|"
                               r"about us|our people|client", ctx, re.I))
        out.append(finding(
            path, ln, f"generated-image filename in the markup: {img.group(0)}",
            "ai-image-default-filenames", "high" if proof else "low",
            ("This one sits next to a byline, a team member or a testimonial, which is the "
             "case that matters: the picture of the person was generated. Published reporting "
             "has used exactly this filename check to establish that a network of author "
             "profiles was fabricated."
             if proof else
             "The generator's default filename survived upload. Generated imagery is routine "
             "for illustration and background art, so on its own this is information rather "
             "than a defect — it matters where a human or a proof is implied."),
            ("Replace the image. Renaming the file hides the tell and leaves the claim, and the "
             "claim is the problem."
             if proof else
             "Rename images to descriptive slugs before upload — worth doing for search "
             "regardless. Absence of this tell proves nothing in the other direction."),
            family="residue"))

    if re.search(r"DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT"
                 r"|This is a replit script which adds a banner", text, re.I):
        out.append(finding(
            path, first(r"DO NOT REMOVE THIS SCRIPT TAG|This is a replit script"),
            "a comment addressed to a language model, shipped to production",
            "agent-instruction-shipped-to-production", "medium",
            "Nothing announces machine authorship more plainly than a literal instruction to a "
            "machine, left in the artifact a visitor downloads. Both known forms of this also "
            "load a third-party script on every pageview of a live site, so there is a real "
            "cost as well as a tell.",
            "Delete the comment and the script from the production template. Confirm the "
            "builder's editor still works first if you still use it.",
            family="residue"))

    if re.search(r'<meta[^>]+name=["\']keywords["\'][^>]+content=["\']keyword["\']', text, re.I):
        out.append(finding(
            path, first(r"name=[\"']keywords"),
            'meta keywords shipped with the literal placeholder value "keyword"',
            "keywords-meta-placeholder", "low",
            "A tag search engines have ignored since 2009, carrying the builder's own "
            "placeholder. Worth reading anyway: where the tag is populated it is a fossil of "
            "the generation prompt, and the repetition-without-variation in it usually repeats "
            "in the visible copy.",
            "Delete the tag. Then check whether the visible section headings are that same list "
            "in sentence form; if they are, rewrite so each section makes one claim the others "
            "do not.",
            family="residue"))

    glyphs = re.findall(r"(?:<span[^>]*>.</span>\s*){6,}", text)
    if glyphs:
        out.append(finding(
            path, first(r"(?:<span[^>]*>.</span>\s*){6,}"),
            f"{len(glyphs)} run(s) of one-span-per-character text",
            "per-character-text-spans", "high",
            "Per-character animation shreds the text semantically while leaving it visually "
            "fine. Screen readers, copy-paste, text extraction and search engines all get "
            "letter-spaced garbage — one live template extracted as \"W e   B u i l d\". "
            "It reads effect-first: the animation was chosen before the content was considered. "
            "Several libraries produce this shape, so it names a defect, not a tool.",
            "Turn per-character animation off for anything that is real page copy. Reserve it "
            "for decorative marquees and give those aria-hidden with a plain-text sibling. If it "
            "must stay on a heading, add a visually hidden un-split copy of the same string.",
            family="defect"))


    # =============== accessibility: the part automation cannot reach ===============
    # Automated engines cover about 30% of WCAG criteria, so everything here is
    # chosen because a scanner does NOT catch it. Most of it reads UNREVIEWED
    # rather than machine-written -- a hand-built 2011 site fails it too -- and
    # the explanations say so. The exceptions are the ones where the model
    # produces the APPEARANCE of accessibility work, which is its own signature.

    # ---- the flagship: a label on an element that cannot carry one
    gen_label = re.findall(
        r"<(?:div|span|p|em|strong|code)\b(?![^>]*\brole=)[^>]*\saria-label(?:ledby)?=", text, re.I)
    if gen_label:
        out.append(finding(
            path, first(r"<(div|span|p|em|strong|code)\b(?![^>]*role=)[^>]*aria-label"),
            f"{len(gen_label)} aria-label(s) on an element whose role cannot carry a name",
            "aria-label-on-a-generic-element", "medium",
            "The generic role is on ARIA's name-prohibited list, so depending on the screen "
            "reader the label is ignored entirely or announced as a spurious \"group\" — "
            "either nothing or noise. This is the flagship model-flavoured tell of the "
            "accessibility lane: aria-label=\"hero section\" is not something a person who has "
            "used a screen reader writes. It is what pattern completion produces when the "
            "prompt contains the word \"accessible\".",
            "If the region is worth naming, make it one: <section aria-label=\"Testimonials\">, "
            "where the label turns the role from generic into a real landmark. If it is not "
            "worth naming, delete the attribute. Never name a div in place.",
            family="residue"))

    redundant = re.findall(
        r'<(button|nav|main|header|footer|aside|form|table|ol)\b[^>]*\brole=["\']'
        r'(button|navigation|main|banner|contentinfo|complementary|form|table|list)["\']',
        text, re.I)
    redundant = [m for m in redundant if
                 (m[0].lower(), m[1].lower()) in {
                     ("button", "button"), ("nav", "navigation"), ("main", "main"),
                     ("header", "banner"), ("footer", "contentinfo"),
                     ("aside", "complementary"), ("form", "form"), ("table", "table"),
                     ("ol", "list")}]
    if redundant:
        out.append(finding(
            path, first(r'<(button|nav|main|header|footer|aside|form|table)\b[^>]*role='),
            f"{len(redundant)} element(s) carrying their own implicit role explicitly",
            "redundant-role-on-a-semantic-element", "low",
            "Harmless in isolation, and as a population the clearest possible fingerprint of "
            "ARIA added by someone who does not know what ARIA is for. It is exactly what the "
            "First Rule of ARIA Use forbids. Weight this as a SIGNAL rather than a defect: a "
            "page with several of these will have real ARIA bugs, and it is worth running the "
            "expensive checks on.",
            "Delete them all — it is one search and replace. Then look at what ARIA "
            "remains, because that is now the interesting part. Note <ul role=\"list\"> is a "
            "deliberate and correct workaround for a browser that strips list semantics, and is "
            "excluded here on purpose.",
            family="residue"))

    # ---- a live region that can never announce, because it arrives with its text
    if re.search(r"(?:&&|\?)\s*\(?\s*<[A-Za-z][^>]{0,200}?aria-live", text) \
       or re.search(r"<[a-z][^>]*\bv-if=[^>]*aria-live|<[a-z][^>]*aria-live[^>]*\bv-if=",
                    text, re.I) \
       or re.search(r"\{#if[^}]{0,120}\}\s*<[^>]*aria-live", text):
        out.append(finding(
            path, first(r"aria-live"),
            "a live region that is conditionally rendered, so it never announces",
            "conditionally-rendered-live-region", "high",
            "The container and its text arrive in the DOM in the same tick, so the screen "
            "reader never observes a CHANGE to a region it was watching, and says nothing. The "
            "markup is textbook-correct and the behaviour is silence — which no static and "
            "no rendered-DOM check can see, because the attribute is present and the text is "
            "present. The purest case in this lane of a model producing the appearance of "
            "accessibility: conditional rendering is the idiomatic component shape, aria-live is "
            "what gets added when you ask for accessibility, and together they do nothing.",
            "One persistent, always-mounted, visually hidden live region per page, whose TEXT "
            "CONTENT is updated. Clear and re-set after a short delay so repeated identical "
            "messages still announce.",
            family="defect"))

    # ---- names that replace, or contradict, the visible text
    cloak = mismatch = None
    for m in re.finditer(r"<(a|button)\b([^>]*\saria-label=[\"']([^\"']+)[\"'][^>]*)>([^<]{3,200})</\1>",
                         text, re.I):
        label, visible = m.group(3).strip(), re.sub(r"\s+", " ", m.group(4)).strip()
        if not visible or visible.startswith("{"):
            continue
        norm = lambda x: re.sub(r"[^a-z0-9 ]", "", x.lower()).strip()
        if cloak is None and len(visible) > len(label) + 8:
            cloak = (m.start(), label, visible)
        if mismatch is None and norm(visible) and norm(visible) not in norm(label):
            mismatch = (m.start(), label, visible)
    if cloak:
        pos, label, visible = cloak
        out.append(finding(
            path, text[:pos].count("\n") + 1,
            f'aria-label "{label}" replaces longer visible text "{visible[:50]}…"',
            "aria-label-cloaks-the-text-that-was-already-there", "medium",
            "aria-label does not add; it REPLACES. The screen reader user now gets a shorter, "
            "vaguer control than the sighted user, and the author believed they were helping. "
            "The authoring practices name the mechanism: ARIA cloaks as readily as it enhances.",
            "Delete it. If the visible text is genuinely inadequate, fix the visible text "
            "— that helps the sighted reader who also cannot tell what it means. Reach for "
            "aria-describedby when you want to ADD.",
            family="defect"))
    if mismatch and mismatch is not cloak:
        pos, label, visible = mismatch
        out.append(finding(
            path, text[:pos].count("\n") + 1,
            f'visible text "{visible[:40]}" is not contained in accessible name "{label[:40]}"',
            "accessible-name-does-not-match-the-visible-label", "high",
            "A voice-control user says the words on the screen and nothing happens, because the "
            "name the machine knows is not the name on the button. WCAG 2.2 SC 2.5.3, and the "
            "most overlooked criterion in generated code because everyone assumes aria-label can "
            "only help. The failure is caused BY the accessibility effort.",
            "The accessible name must contain the visible text, ideally starting with it. If you "
            "need more context, extend rather than replace, or put it in aria-describedby.",
            family="defect"))

    # ---- a role is a promise
    promises = []
    if re.search(r'role=["\']tablist["\']', text, re.I) \
       and not re.search(r"onKeyDown|keydown|ArrowRight|aria-selected", text, re.I):
        promises.append("role=\"tablist\" with no arrow-key handling and no aria-selected")
    if re.search(r'role=["\'](?:switch|checkbox)["\']', text, re.I) \
       and not re.search(r"aria-checked", text, re.I):
        promises.append("role=\"switch\"/\"checkbox\" with no aria-checked")
    if re.search(r'role=["\']menu["\']', text, re.I) \
       and not re.search(r"aria-haspopup|aria-expanded", text, re.I):
        promises.append("role=\"menu\" with no aria-haspopup or aria-expanded on a trigger")
    if re.search(r'role=["\']combobox["\']', text, re.I) \
       and not re.search(r"aria-expanded", text, re.I):
        promises.append("role=\"combobox\" with no aria-expanded")
    if promises:
        out.append(finding(
            path, first(r'role=["\'](tablist|switch|checkbox|menu|combobox)'),
            "; ".join(promises), "promised-role-with-no-behaviour", "high",
            "A role is a promise to assistive technology about how the widget will behave. The "
            "promise is broken, and the user is worse off than if it had never been made, "
            "because their screen reader has switched them into an interaction mode the widget "
            "does not support. This is the mechanism behind the finding that pages with more "
            "ARIA have more errors: a generator produces the role vocabulary fluently and the "
            "interaction code sporadically.",
            "Delete the role, implement the full pattern, or adopt a primitive that already "
            "has. If you are not going to do all of it, plain buttons and headings are strictly "
            "better than a half-built widget.",
            family="defect"))

    # ---- alt that describes the picture instead of doing its job
    for m in re.finditer(r"<img\b[^>]*\balt=[\"']([^\"']+)[\"']", text, re.I):
        alt = m.group(1).strip()
        narrating = (len(alt) > th("narrating-alt-text", "max_chars", 125)
                     or re.match(r"^(?:an?\s+)?(?:image|picture|photo|graphic|screenshot|"
                                 r"illustration)\s+of\b", alt, re.I))
        if narrating:
            out.append(finding(
                path, text[:m.start()].count("\n") + 1,
                f'alt text of {len(alt)} chars: "{alt[:60]}…"',
                "narrating-alt-text", "medium",
                "A vision model DESCRIBES an image; alt text NAMES ITS FUNCTION. The gap between "
                "those two is exactly the gap between a generated description and an authored "
                "one, and it is one of the few nearly diagnostic tells here. Starting with "
                "\"image of\" is redundant besides — the screen reader already said "
                "\"graphic\".",
                "Ask what the image is doing. Decorative gets alt=\"\". Functional names the "
                "destination, not the glyph. Informative gets the shortest sentence carrying "
                "what the sighted reader gets. If adjacent text already describes it, alt=\"\". "
                "Long alt IS correct for charts, diagrams and maps, where the description is the "
                "content.",
                family="form"))
            break

    # ---- headings picked for size
    levels = [int(m) for m in re.findall(r"<h([1-6])\b", low)]
    skipped = [(a, b) for a, b in zip(levels, levels[1:]) if b > a + 1]
    if skipped:
        out.append(finding(
            path, first(r"<h[1-6]\b"),
            f"heading level jumps from h{skipped[0][0]} to h{skipped[0][1]}",
            "heading-levels-chosen-for-size", "high",
            "Headings picked by how big they should look rather than by position in the "
            "outline. The visual page has a structure; the NAVIGABLE page does not — and "
            "71.6% of screen reader users navigate a long page by headings as their primary "
            "method, against 3.7% for landmarks. Skipped levels appear on 41.8% of home pages, "
            "so this is unreviewed rather than machine-written, but generated app interiors "
            "produce it reliably because the visual hierarchy lives in utility classes.",
            "Set the level by position in the outline and the size with CSS. One h1, no skipped "
            "levels, and a real heading for every visually distinct section even if it is "
            "visually hidden. Jumping back UP a level is fine and normal; only skipping DOWN is "
            "the violation.",
            family="defect"))

    navs = re.findall(r"<nav\b[^>]*>", text, re.I)
    if len(navs) >= 2:
        named = sum(1 for n in navs if re.search(r"aria-label(?:ledby)?=", n, re.I))
        if named < len(navs):
            out.append(finding(
                path, first(r"<nav\b"),
                f"{len(navs)} <nav> landmarks, {len(navs) - named} of them unnamed",
                "landmarks-duplicated-and-unnamed", "medium",
                "The landmarks list reads \"navigation, navigation, navigation\" and is useless "
                "for the thing it exists to do. Measured on generated UI code, \"all page "
                "content must be contained by landmarks\" was violated an average of 894 times "
                "per base-model output, so this is a quantified property of generated markup "
                "rather than an impression.",
                "Name each one — Main, Breadcrumb, Legal — without including the word "
                "\"navigation\", because screen readers append the role themselves and \"Main "
                "navigation navigation\" is what the unedited version announces. Two landmarks "
                "with identical content should share ONE label, not two different ones.",
                family="defect"))

    link_names = {}
    for m in re.finditer(r"<a\b[^>]*href=[\"']([^\"']+)[\"'][^>]*>([^<]{2,60})</a>", text, re.I):
        nm = re.sub(r"\s+", " ", m.group(2)).strip().lower()
        if nm and not nm.startswith("{"):
            link_names.setdefault(nm, set()).add(m.group(1))
    vague = {n: h for n, h in link_names.items()
             if len(h) >= th("link-text-that-only-works-next-to-its-picture", "min_repeats", 3)}
    if vague:
        worst = max(vague, key=lambda n: len(vague[n]))
        out.append(finding(
            path, first(re.escape(worst)),
            f'"{worst}" is the text of {len(vague[worst])} links going to different places',
            "link-text-that-only-works-next-to-its-picture", "medium",
            "Screen reader users pull up a links list to scan a page, and this page's list is "
            "the same entry repeated. An automated engine will never flag it — the link "
            "has text, the text is non-empty, the rule passes. Generated card grids produce the "
            "uniform-CTA shape by construction, so the base rate is high.",
            "Make the link text the destination. If the design demands a uniform \"Learn "
            "more\", wrap the card HEADING in the link and make the rest of the card clickable "
            "in CSS — do not paper over it with aria-label, which then breaks Label in "
            "Name.",
            family="shape"))

    # A layout table marked role="presentation" is explicitly NOT a data table
    # -- it is the correct shape for an email template, and demanding headers of
    # it is the opposite of the advice.
    if re.search(r"<table\b", low) and not re.search(r"<th\b", low) \
       and not re.search(r'<table\b[^>]*role=["\']presentation', low):
        out.append(finding(
            path, first(r"<table\b"), "a <table> with no header cells",
            "data-rendered-as-divs-with-no-header-association", "medium",
            "A screen reader user reads \"Acme, 4,200, Active\" with no idea which column is "
            "which, and the ability to ask \"what column am I in?\" is gone. Overlaps "
            "div-soup-no-semantics but is narrower and more consequential: a div nav is "
            "annoying, a table with no header associations is unreadable.",
            "Use <th scope=\"col\"> and <th scope=\"row\">. If responsive collapse is needed, "
            "keep the table element and inject header text via CSS rather than destroying the "
            "semantics with display:block.",
            family="defect"))

    # ---- zoom, spacing, forced colors
    # \bvw\b does not match "5vw": there is no word boundary between a digit and a
    # letter, so the leading boundary has to go.
    vw_type = re.search(r"font-size\s*:\s*[^;]*[\d.]\s*vw\b|text-\[[\d.]+vw\]", low)
    if vw_type and not re.search(r"clamp\([^)]*rem[^)]*\+", low):
        out.append(finding(
            path, text[:vw_type.start()].count("\n") + 1,
            "type sized in viewport units with no rem term",
            "type-sized-in-viewport-units", "medium",
            "Fluid type looks sophisticated and quietly opts the user out of controlling their "
            "own text size: at a fixed viewport, raising the browser's default font size does "
            "nothing. The technique circulated widely as \"modern\" with the accessibility "
            "caveat detached from it in transit.",
            "Always include a rem term inside clamp() so user font-size preference still moves "
            "the result — clamp(1rem, 0.9rem + 0.5vw, 1.25rem). Reserve pure viewport "
            "sizing for display type where a user override does not matter.",
            family="defect"))

    if re.search(r"(?:linear-gradient|box-shadow)", low) \
       and re.search(r"<svg|fill=[\"']#", text, re.I) \
       and "forced-colors" not in low and "forced-color-adjust" not in low:
        out.append(finding(
            path, first(r"linear-gradient|box-shadow"),
            "gradients and shadows carrying structure, with no forced-colors handling",
            "forced-colors-mode-erases-the-interface", "medium",
            "In forced-colors mode the OS reverts every non-url background-image, so gradients "
            "vanish, shadow-only card boundaries disappear, hard-coded SVG fills go invisible "
            "and a selected tab loses its only indicator. It is invisible unless you are on the "
            "platform with the setting on, which nobody on the team is — and generated UI "
            "leans entirely on shadow and gradient for structure, which is precisely what "
            "forced colors strips.",
            "Use currentColor on SVG fills. Convey state with something forced colors preserves "
            "— a border, an underline, text. Add one @media (forced-colors: active) block "
            "using system colour keywords. Use outline for focus rings, which is preserved, not "
            "box-shadow, which is not.",
            family="defect"))

    # ---- motion and timing
    if re.search(r"autoplay\s*[:=]\s*(?:true|\{)|autoplay\b[^,}]*delay", text, re.I) \
       and not re.search(r">\s*(?:Pause|Stop|Play)\b|aria-label=[\"'][^\"']*(?:pause|stop)",
                         text, re.I):
        out.append(finding(
            path, first(r"autoplay"),
            "auto-advancing content with no pause control",
            "auto-advancing-content-with-no-pause", "medium",
            "WCAG 2.2.2 is Level A, not AA: anything moving for more than five seconds must be "
            "pausable, stoppable or hideable. Autoplay is the library default and nobody turns "
            "it off. Note that a reduced-motion guard does NOT satisfy this — a user who "
            "has not set that preference still needs a control, and vestibular-safe is a "
            "different requirement from attention-safe.",
            "Turn autoplay off. If it must stay: a visible, keyboard-reachable Pause button "
            "that is not hover-only, pausing on focus as well as hover, with the state "
            "persisted.",
            family="defect"))

    # ---- placeholders doing a label's job
    ph = re.search(r'placeholder=["\']([^"\']{16,})["\']', text)
    if ph and re.search(r"\d|MM|YYYY|DD|/", ph.group(1)) \
       and not re.search(r"aria-describedby", text, re.I):
        out.append(finding(
            path, text[:ph.start()].count("\n") + 1,
            f'format instructions live only in a placeholder: "{ph.group(1)[:40]}"',
            "instructions-live-only-in-the-placeholder", "medium",
            "The rule vanishes the moment the user starts typing — exactly when they need "
            "it. It also fails anyone returning to a half-filled form. And people with "
            "cognitive disabilities tend to read placeholder text as pre-populated content "
            "rather than as a hint.",
            "A persistent hint element between label and input, wired with aria-describedby. "
            "Keep the placeholder only for a genuine example value.",
            family="defect"))

    # ---- the receipt
    ovl = re.search(r"acsbapp\.com|accessibe\.com|userway\.org|audioeye\.com|equalweb\.com"
                    r"|reciteme\.com|aioa-adawidget|allinoneaccessibility|eye-able|allyable",
                    low)
    if ovl:
        out.append(finding(
            path, text[:ovl.start()].count("\n") + 1,
            f"an accessibility overlay is installed ({ovl.group(0)})",
            "accessibility-overlay-installed", "high",
            "A widget added in place of fixing anything. Its presence is a receipt: the "
            "accessibility problem was recognised and outsourced to a script. It belongs in "
            "this catalog for the same reason unmodified design tokens do — it is evidence "
            "about PROCESS, not authorship. And there is a specific technical reason it cannot "
            "work here: component-based interfaces change state independently of the overlay, "
            "so it is least effective on exactly the architecture generated sites use.",
            "Remove it and fix the source. Be fair when you report it — the owner was often "
            "sold this in good faith, and two class actions have been filed by exactly such "
            "businesses after they bought a widget and were sued anyway. A preference panel you "
            "built yourself is not an overlay and is often genuinely good.",
            family="residue"))


    # ================ typographic craft: one value, no function ================
    # Every check here is the same computation: does this property vary with the
    # thing it is supposed to vary with? The tell is never a wrong value -- any
    # number here is defensible somewhere -- it is ONE VALUE WHERE THERE SHOULD
    # HAVE BEEN A FUNCTION OF CONTEXT.
    #
    # The standing caution: utility frameworks bundle a tightening line-height
    # into their size scale, so a page with no explicit line-height anywhere is
    # usually CORRECT. These checks fire on explicit declarations only.

    lh_all = re.findall(r"line-height\s*:\s*([^;}\s]+)", low)
    lh_root = re.search(r"(?:^|[,{}\s])(?:body|:root|html|\*)\s*\{[^}]*line-height\s*:"
                        r"\s*([\d.]+(?:px|rem|em|%)?)\s*[;}]", low)
    head_sizes = [float(m) for m in
                  re.findall(r"h[1-3][^{}]*\{[^}]*font-size\s*:\s*([\d.]+)rem", low)]
    head_sizes += [float(m) / 16 for m in
                   re.findall(r"h[1-3][^{}]*\{[^}]*font-size\s*:\s*([\d.]+)px", low)]
    head_lh = re.search(r"h[1-6][^{}]*\{[^}]*line-height", low) \
        or re.search(r"\.(?:display|hero|headline)[^{}]*\{[^}]*line-height", low)
    if lh_root and head_sizes and max(head_sizes) >= 2.0 and not head_lh:
        out.append(finding(
            path, first(r"line-height"),
            f"one line-height ({lh_root.group(1)}) inherited by a "
            f"{max(head_sizes):.1f}rem heading",
            "global-line-height-never-scaled", "high",
            "Leading is a function of typeface, size AND measure, and this sheet made one "
            "decision. At 16px, 1.6 is the gap that lets the eye find the next line across a "
            "68-character measure; at 64px with four words per line it is a hundred pixels of "
            "air between two halves of one sentence, and the headline reads as two unrelated "
            "lines.",
            "Tighten with size. The compact answer is one calc — :is(h1,h2,h3,h4) "
            "{ line-height: calc(1em + 0.35rem) } — because absolute leading grows while "
            "the RATIO shrinks, which is what the tradition describes and what the utility "
            "frameworks already implement.",
            family="defect"))

    lh_len = re.search(r"(?:body|:root|html|\*)\s*\{[^}]*line-height\s*:\s*[\d.]+(?:px|rem|em|pt|%)",
                       low)
    if lh_len:
        out.append(finding(
            path, first(r"line-height\s*:\s*[\d.]+(px|rem|em|pt|%)"),
            "line-height set as a length on an inherited selector",
            "line-height-in-fixed-units", "medium",
            "A length inherits as a COMPUTED LENGTH, so every descendant with a different "
            "font-size gets the parent's absolute leading rather than a proportional one "
            "— 12px small print inside a card inherits 24px leading, a ratio of 2.0. This "
            "is what you get when a generator transcribes a design tool's inspect panel, which "
            "reports line-height in px. Note em and % carry the same bug; only unitless "
            "inherits as a ratio.",
            "Use a unitless multiplier. Lengths only where you are deliberately pinning to a "
            "baseline grid and have set font-size on the same rule.",
            family="defect"))

    def _vertical_margins(decl):
        """Top and bottom from a margin declaration, or None.

        The shorthand is the trap: `margin: A B` is VERTICAL then HORIZONTAL, so
        it sets top and bottom to the same value -- it is the symmetric case, not
        an asymmetric one. Three and four values put bottom third. `margin-block`
        is start then end, which really is top then bottom.
        """
        m = re.search(r"margin-block\s*:\s*([^;}]+)", decl)
        if m:
            parts = m.group(1).split()
            if len(parts) == 1:
                return parts[0], parts[0]
            if len(parts) >= 2:
                return parts[0], parts[1]
        mt = re.search(r"margin-top\s*:\s*([^;}\s]+)", decl)
        mb = re.search(r"margin-bottom\s*:\s*([^;}\s]+)", decl)
        if mt and mb:
            return mt.group(1), mb.group(1)
        m = re.search(r"(?<!-)\bmargin\s*:\s*([^;}]+)", decl)
        if m:
            parts = m.group(1).split()
            if len(parts) in (1, 2):
                return parts[0], parts[0]          # top == bottom
            if len(parts) in (3, 4):
                return parts[0], parts[2]
        return None

    def _px(v):
        m = re.match(r"([\d.]+)(rem|em|px)?$", v)
        if not m:
            return None
        n = float(m.group(1))
        return n * 16 if m.group(2) in ("rem", "em") else n

    for m in re.finditer(r"\bh[1-6][^{}]*\{([^}]*)\}", low):
        vm = _vertical_margins(m.group(1))
        if not vm:
            continue
        top, bot = _px(vm[0]), _px(vm[1])
        if top is None or bot is None or top <= 0:
            continue
        if abs(top - bot) <= top * th("heading-space-symmetric", "tolerance", 0.2):
            out.append(finding(
                path, text[:m.start()].count("\n") + 1,
                f"heading with symmetric vertical space ({vm[0]} above, {vm[1]} below)",
                "heading-space-symmetric", "high",
                "The heading floats between the section it ends and the section it starts, "
                "belonging to neither. Proximity is the only grouping cue prose has: a heading "
                "is a LABEL FOR WHAT FOLLOWS, so the gap below must be visibly smaller than the "
                "gap above. Symmetry is what looks even when you are not reading, and what looks "
                "wrong the moment you are.",
                "Roughly twice the space above as below, set on the heading so it travels with "
                "the element: margin-block: 3rem 1rem. Note margin: 2rem 0 is NOT the fix "
                "— the two-value shorthand is vertical then horizontal, so it sets top and "
                "bottom to the same value.",
                family="defect"))
            break

    # ---- line breaking: the thing a person always hand-fixes and a generator never sees
    if head_sizes and max(head_sizes) >= 2.0 and "text-wrap" not in low \
       and not re.search(r"<br\s*/?>|&nbsp;", text, re.I):
        out.append(finding(
            path, first(r"h1|font-size"),
            f"no text-wrap handling on a {max(head_sizes):.1f}rem heading",
            "no-balance-on-headings", "high",
            "Multi-line headlines break wherever the line box runs out — one word alone on "
            "line two, an article separated from its noun — and somewhere different at "
            "every viewport width. A headline is the one piece of type a person always "
            "hand-breaks; generated CSS never touches line breaking, because breaking is a "
            "rendered-output concern and the generator only ever produced source.",
            "text-wrap: balance on headings. One declaration, degrades to nothing where "
            "unsupported, and capped at a few lines by design, which is why it belongs on "
            "headings rather than paragraphs. Hand-breaking with explicit markup is the stronger "
            "answer and is not this finding.",
            family="defect"))

    # ---- numerals
    if re.search(r"<t[dh]\b[^>]*>\s*[\$£€]?[\d,]+(?:\.\d+)?\s*%?\s*</t[dh]>", text) \
       and "tabular-nums" not in low and "monospace" not in low:
        out.append(finding(
            path, first(r"<table|<td"),
            "a table of numbers with no tabular figures",
            "proportional-figures-in-data-tables", "high",
            "In a proportional-figure face the ones are narrow and the zeros are wide, so no "
            "column of numbers aligns and currency visibly wanders. Tabular figures are the "
            "single most consequential OpenType feature on the web and cost one declaration; a "
            "generator does not use them because it has never compared two rows. Invisible in a "
            "one-row example and glaring in a twelve-row table — the shape of a thing "
            "verified against a stub.",
            "font-variant-numeric: tabular-nums on the table, or on a numeric-cell class. Note "
            "it is correctly a no-op on faces with no tabular set, and that proportional figures "
            "are RIGHT for numbers in running prose.",
            family="defect"))

    if re.search(r"counter|timer|clock|countdown|elapsed|\bstat\b", low) \
       and re.search(r"setInterval|requestAnimationFrame", text) \
       and "tabular-nums" not in low and "monospace" not in low:
        out.append(finding(
            path, first(r"setInterval|counter|timer|clock"),
            "a live-updating number with no tabular figures",
            "live-numbers-without-tabular-nums", "medium",
            "The digits change width as they change, so the element jitters left and right every "
            "tick. It only manifests in MOTION, and everything a generator verifies is static "
            "— so the whole class of motion-visible typographic defects survives to "
            "production. Finding one predicts the rest of the class.",
            "font-variant-numeric: tabular-nums on the element, or a monospace face for the "
            "digits.",
            family="defect"))

    # ---- the scale
    sizes = set()
    for m in re.finditer(r"font-size\s*:\s*([\d.]+)(px|rem)", low):
        v = float(m.group(1)) * (16 if m.group(2) == "rem" else 1)
        if 8 <= v <= 200:
            sizes.add(round(v, 1))
    for m in re.finditer(r"\btext-\[([\d.]+)(px|rem)\]", low):
        v = float(m.group(1)) * (16 if m.group(2) == "rem" else 1)
        if 8 <= v <= 200:
            sizes.add(round(v, 1))
    if len(sizes) >= th("type-scale-step-inflation", "max_sizes", 9):
        ss = sorted(sizes)
        close = [(a, b) for a, b in zip(ss, ss[1:]) if b - a <= 1.5]
        out.append(finding(
            path, first(r"font-size"),
            f"{len(sizes)} distinct font sizes"
            + (f", {len(close)} pair(s) under 1.5px apart" if close else ""),
            "type-scale-step-inflation", "medium",
            "Each component was sized in isolation, so the page ACCUMULATES sizes rather than "
            "choosing them. Two sizes a pixel apart carry no information and cost the reader a "
            "comparison. A designed page usually runs five to seven sizes and can name what each "
            "one is FOR.",
            "Collapse to five to seven steps and give each a role rather than a number: caption, "
            "body, lead, section, page, display.",
            family="shape"))
    elif len(sizes) >= 4:
        ss = sorted(sizes)
        ratios = [b / a for a, b in zip(ss, ss[1:]) if a]
        if ratios and max(ratios) / min(ratios) >= th("type-scale-with-no-ratio",
                                                      "max_ratio_spread", 2.0):
            out.append(finding(
                path, first(r"font-size"),
                f"{len(sizes)} font sizes with no consistent step "
                f"(ratios {min(ratios):.2f}–{max(ratios):.2f})",
                "type-scale-with-no-ratio", "high",
                "A type scale is a RULE; what this page has is a LIST. Each size was chosen to "
                "make one component look right, so the set encodes no relationship and hierarchy "
                "degrades into bigger and biggest.",
                "Pick a base and a ratio, generate the scale, emit it as tokens, and forbid "
                "off-scale sizes. Analyse a dense UI scale and an editorial display scale "
                "separately — a mixed set fails a check it should pass.",
                family="shape"))

    arb = re.findall(r"\btext-\[[\d.]+(?:px|rem)\]", low)
    if arb and re.search(r"--text-|\btext-(?:xs|sm|base|lg|xl|2xl)\b", low):
        out.append(finding(
            path, first(r"text-\[[\d.]+(px|rem)\]"),
            f"{len(arb)} arbitrary font size(s) beside a declared scale",
            "off-scale-one-off-sizes", "medium",
            "The CO-OCCURRENCE is the diagnostic pair: a scale exists in the stylesheet and is "
            "not what the page is using. The generator builds each component as a self-contained "
            "unit and sizes its text by eye against that unit — the same shape as a "
            "semantic token layer being bypassed.",
            "Delete every arbitrary size and snap to the nearest step. If a component genuinely "
            "needs a size between two steps, that is evidence THE SCALE IS WRONG — fix the "
            "scale once, not the component.",
            family="residue"))

    if re.search(r"(?:^|[,{}\s])(?:html|:root)\s*\{[^}]*font-size\s*:\s*\d+px", low):
        out.append(finding(
            path, first(r"(html|:root)[^{]*\{[^}]*font-size"),
            "a pixel font-size on the root element",
            "root-font-size-locked-in-px", "high",
            "This overrides the reader's browser font-size preference, so every rem on the page "
            "is anchored to a number the author chose instead of the one the reader chose. The "
            "cost is invisible to anyone with default settings — which is everyone who "
            "builds the page, and not the substantial share of readers who have raised theirs.",
            "Leave the root alone and size everything in rem. If you want the 10px convenience, "
            "use a percentage, which is a proportion of the READER'S size. Note modern browsers "
            "do still zoom px text — this is a preference-override finding, not a zoom "
            "one.",
            family="defect"))

    # ---- weight and optical size
    if re.search(r"font-variation-settings\s*:\s*[\"'][^\"']*wght", low) \
       and "font-optical-sizing" not in low:
        out.append(finding(
            path, first(r"font-variation-settings"),
            "weight set through font-variation-settings, which disables optical sizing",
            "opsz-axis-unused", "medium",
            "An unusually crisp static check. font-optical-sizing: auto is the INITIAL value, so "
            "the axis normally works by default — but font-variation-settings is the "
            "low-level property and resets it to have no effect. So a generator sets weight "
            "through the wrong property and silently disables optical sizing as a side effect, "
            "and the 14px caption and the 96px hero are drawn with identical stems and "
            "apertures.",
            "Set weight with font-weight and leave optical sizing on. Reach for "
            "font-variation-settings only for axes with no high-level equivalent.",
            family="defect"))

    gf = re.search(r"fonts\.googleapis\.com/css2\?[^\"'\s>]*", text)
    if gf:
        declared = {int(w) for w in re.findall(r"wght@([\d;.,]+)", gf.group(0))
                    for w in re.split(r"[;,]", w) if w.isdigit()}
        declared |= {int(w) for w in re.findall(r"(?<![\d.])([1-9]00)(?![\d.])", gf.group(0))}
        used = {int(w) for w in re.findall(r"font-weight\s*:\s*([1-9]00)\b", low)}
        used |= {700 if b == "bold" else 400
                 for b in re.findall(r"font-weight\s*:\s*(bold|normal)\b", low)}
        missing = sorted(w for w in used if declared and w not in declared)
        if missing:
            out.append(finding(
                path, text[:gf.start()].count("\n") + 1,
                f"CSS uses font-weight {', '.join(map(str, missing))}; the font request declares "
                f"only {', '.join(map(str, sorted(declared)))}",
                "faux-bold-from-missing-weight", "high",
                "The browser smears the loaded weight wider to fake the missing one. Letterfit "
                "widens, counters fill in, and the type looks blurry without anyone being able "
                "to say why. The font loader and the stylesheet were produced by different "
                "passes and nothing reconciles them — and it renders \"fine\", which is the "
                "whole problem.",
                "Load the weights you use. Adding font-synthesis: none WITHOUT first loading the "
                "missing weights makes the page look worse, so fix the loading first.",
                family="defect"))

    weights = {m for m in re.findall(r"font-weight\s*:\s*([1-9]00|bold|normal)\b", low)}
    weights |= {m for m in re.findall(r"\bfont-(?:thin|light|normal|medium|semibold|bold|"
                                      r"extrabold|black)\b", low)}
    text_roles = len(re.findall(r"<h[1-6]\b|<button\b|<label\b|<th\b|<caption\b", low))
    # Zero declared weights is not this finding: the page is on framework or
    # browser defaults and the check has nothing to say about it. The defect is
    # having made a weight decision and made only one or two of them.
    if 1 <= len(weights) <= 2 and text_roles >= th("two-weights-five-jobs", "min_roles", 5) \
       and "font-variation-settings" not in low:
        out.append(finding(
            path, first(r"font-weight|font-(semibold|bold|medium)"),
            f"{len(weights)} font weight(s) carrying {text_roles} distinct text roles",
            "two-weights-five-jobs", "medium",
            "The semibold utility is the default \"this is important\", so it gets applied to "
            "everything important — which means nothing is. Weight is one of the four axes "
            "of hierarchy (size, weight, colour, space), and a page using two values of it has "
            "thrown away most of an axis and compensates with size, which is why scale inflation "
            "usually travels with this.",
            "Assign weights to roles and skip a step so the contrast reads as intentional: 400 "
            "body, 500 UI labels, 700 section headings, 800 display. Restraint is not the "
            "finding — two weights PLUS no other axis carrying the hierarchy is.",
            family="shape"))

    # ---- colour of type
    if re.search(r"color\s*:\s*(?:#000(?:000)?|black|rgb\(0,\s*0,\s*0\))\b", low) \
       and re.search(r"background(?:-color)?\s*:\s*(?:#fff(?:fff)?|white|rgb\(255,\s*255,\s*255\))",
                     low):
        out.append(finding(
            path, first(r"color\s*:\s*(#000|black)"),
            "pure black on pure white",
            "pure-black-on-pure-white", "medium",
            "Maximum contrast, which is not the same as maximum readability — the halation "
            "makes the type appear to glow and long-form reading is measurably harder. These are "
            "the two values you reach for when you have not thought about colour at all, and "
            "they are also what a contrast checker rewards, so the defect survives an automated "
            "accessibility pass with a perfect score. A check passed, a judgement skipped.",
            "Back off a little at both ends — a very dark grey on a very slightly warm "
            "white — staying well above the contrast minimum. This is a TASTE finding: "
            "never report it as a contrast failure, and never apply it to high-contrast modes, "
            "e-ink or print.",
            family="shape"))

    alpha_text = re.findall(r"\btext-(?:white|black|gray-\d+|slate-\d+|zinc-\d+)/\d{1,2}\b", low)
    alpha_text += re.findall(r"color\s*:\s*rgba\([^)]*,\s*0?\.\d+\s*\)", low)
    if alpha_text and not re.search(r"--(?:text-)?muted|--muted-foreground|--text-secondary", low):
        out.append(finding(
            path, first(r"text-\w+/\d|color\s*:\s*rgba"),
            f"{len(alpha_text)} text colour(s) expressed as alpha, with no muted token defined",
            "opacity-as-text-hierarchy", "high",
            "The alpha utility is one token shorter than defining a real muted colour, so it is "
            "what gets reached for. Three consequences: the value means something different on "
            "every surface it lands on, contrast is uncheckable without resolving the stack, and "
            "opacity on a container fades the borders, icons and focus rings inside it too. This "
            "is the structural cause behind a large share of contrast failures on generated "
            "pages, and patching them element by element never fixes it.",
            "Resolve alpha at authoring time into solid role tokens, one per surface, and "
            "contrast-check each once. Transitions and decorative scrims are correctly alpha and "
            "are not this finding.",
            family="defect"))

    text_colors = set(re.findall(r"color\s*:\s*(#[0-9a-f]{6}|#[0-9a-f]{3})\b", low))
    if len(text_colors) >= th("text-colour-proliferation", "max_colors", 8) \
       and not re.search(r"<pre\b|hljs|shiki|prism", low):
        out.append(finding(
            path, first(r"color\s*:\s*#"),
            f"{len(text_colors)} distinct text colours",
            "text-colour-proliferation", "medium",
            "Each component chose its own grey, and the greys came from whichever example was "
            "nearest to hand. A designed page has three or four text colours and can say what "
            "each one is FOR. The near-duplicate pairs are the signature — nobody picks two "
            "greys that close for two different things on purpose.",
            "Three or four roles on one ramp: primary, secondary, muted, and one for links. "
            "Count status colours separately, because those are roles rather than "
            "proliferation, and measure each theme on its own.",
            family="shape"))

    # ---- design-system structure
    semantic = re.findall(r"--(?:background|foreground|muted|border|ring|destructive|accent|"
                          r"card|popover|primary|secondary)(?:-foreground)?\s*:", low)
    primitives = re.findall(r"\b(?:text|bg|border)-(?:gray|zinc|slate|neutral|stone)-\d{2,3}\b",
                            low)
    if semantic and len(primitives) >= th("semantic-layer-bypassed", "min_primitives", 5):
        out.append(finding(
            path, first(r"\b(text|bg|border)-(gray|zinc|slate|neutral|stone)-\d"),
            f"{len(semantic)} semantic token(s) defined and {len(primitives)} raw primitive "
            f"utilities used alongside them",
            "semantic-layer-bypassed", "high",
            "Two colour systems, neither authoritative, drifting apart. Components are generated "
            "one at a time, each self-contained, each reaching for whatever utility is nearest "
            "— and the token file was generated in a different pass. A scaffold gives you "
            "the semantic layer for free, so its PRESENCE proves nothing; only its USE does. "
            "That mismatch is one of the highest-precision structural tells available, because "
            "a person who bothered to write the token file would have used it.",
            "Map every primitive utility to its role, replace, and forbid the primitives at lint "
            "time. Data-visualisation and syntax-highlighting palettes legitimately use "
            "primitives and are not this finding.",
            family="residue"))

    if re.search(r"filter\s*:\s*invert\(\s*1|filter\s*:\s*invert\(\s*100%", low) \
       and re.search(r"\bdark\b|prefers-color-scheme", low):
        out.append(finding(
            path, first(r"filter\s*:\s*invert"),
            "dark mode produced by inverting the light theme",
            "dark-mode-by-inversion", "high",
            "Inversion is an ALGORITHM, which is precisely what a generator can do and a "
            "designer cannot accept. Photographs go negative, shadows stop expressing elevation, "
            "saturated hues vibrate, and the brand colour that was readable on white is "
            "unreadable on near-black. Dark mode is a second design: elevation reverses — "
            "raised surfaces get LIGHTER, not more shadowed — and saturated colours must be "
            "desaturated and lightened.",
            "Re-decide the semantic layer for the dark theme, keeping the roles and changing the "
            "values, and declare color-scheme so form controls and scrollbars follow.",
            family="defect"))


    # ================= performance: the source was optimised, the delivery was not =================
    # A generator can see the markup it is writing. It cannot see a waterfall, a
    # byte count, or which element wins LCP. So these checks look where
    # correctness-in-source and correctness-in-delivery come apart.
    #
    # Say UNREVIEWED, not AI-generated. Most of this would look identical coming
    # from a person who shipped without watching the page load once, and there is
    # NO published measurement that generated sites are heavier -- only that the
    # palette spread. The entries that ARE model-flavoured say so themselves.

    imgs = re.findall(r"<img\b[^>]*>", text, re.I)
    first_img = imgs[0] if imgs else ""

    hero_png = re.search(r"<img\b[^>]*src=[\"'][^\"']*\.png[\"']", text[:4000], re.I) \
        or re.search(r"rel=[\"']preload[\"'][^>]*as=[\"']image[\"'][^>]*\.png", text, re.I)
    if hero_png:
        out.append(finding(
            path, text[:hero_png.start()].count("\n") + 1,
            "the first large image on the page is a PNG",
            "hero-image-as-full-resolution-png", "high",
            "PNG is lossless and has no chroma subsampling, so a photographic hero lands at many "
            "times the bytes of the same image in a modern format — and the LCP element is "
            "an image on 85% of desktop pages. This reads UNREVIEWED rather than "
            "model-flavoured: a designer who exported a PNG would still have watched it load "
            "once. The narrowly model-shaped part is that a generator writing an image tag has "
            "no way to know whether the file is 40 KB or 4 MB, so it never has the thought.",
            "AVIF first with WebP and JPEG fallbacks inside a <picture>, budgeted at 200 KB, "
            "re-exported at twice the largest CSS width it will occupy. PNG stays correct for "
            "screenshots, logos, pixel art and genuine transparency — check what the image "
            "IS before converting it.",
            family="defect"))

    grad = re.search(r"<img\b[^>]*src=[\"'][^\"']*(?:gradient|mesh|blob|aurora|glow|hero-?bg)"
                     r"[^\"']*\.(?:png|jpe?g)[\"'][^>]*alt=[\"'][\"']", text, re.I)
    if grad:
        out.append(finding(
            path, text[:grad.start()].count("\n") + 1,
            "a decorative gradient shipped as a raster image",
            "gradient-mesh-shipped-as-raster", "high",
            "The blurred wash behind the hero is pure decoration, it is frequently the LCP "
            "element, and a gradient carries no detail that a raster is needed to preserve. This "
            "one IS model-flavoured: the indigo-violet wash is the signature ornament of a "
            "palette whose spread has been measured — Tailwind's indigo-500 went from 0.03% "
            "of all sites in late 2022 to 0.54% in late 2025. When it arrives as a "
            "multi-megabyte raster you have the taste tell and the delivery tell in one element.",
            "CSS. A radial-gradient costs zero bytes and zero requests. If the shape is genuinely "
            "irregular, export it small, blur it in CSS and scale it up.",
            family="defect"))

    if len(imgs) >= 5 and not re.search(r"\.avif|\.webp|type=[\"']image/(?:avif|webp)", low):
        out.append(finding(
            path, first(r"<img"), f"{len(imgs)} images, none in a modern format",
            "no-modern-image-format-anywhere", "medium",
            "A site-level absence rather than a per-image mistake: nobody ever set up the "
            "pipeline. Format negotiation is a build decision, invisible in the markup a "
            "generator writes, and exactly the class of thing a model omits because omitting it "
            "produces working output.",
            "Put an image CDN or a build step in front of every raster, targeting modern formats "
            "for at least 80% of image bytes. Check the response content type first — a CDN "
            "negotiating by Accept header will serve AVIF from a .jpg URL.",
            family="shape"))

    fullbleed = [i for i in imgs
                 if re.search(r"w-full|object-cover|width\s*:\s*100%", i, re.I)
                 and "srcset" not in i.lower() and not re.search(r"\.svg", i, re.I)]
    if fullbleed:
        out.append(finding(
            path, text[:text.index(fullbleed[0])].count("\n") + 1,
            f"{len(fullbleed)} full-width image(s) with a single source",
            "single-source-full-bleed-image", "high",
            "Every visitor gets the desktop file, so a phone on cellular downloads a 2400px asset "
            "to paint it 390px wide. srcset requires knowing the layout's breakpoints and the "
            "asset's variants — two facts a generator writing a single component does not "
            "have, so it writes the valid single-source tag.",
            "srcset with width descriptors at the widths the layout actually uses, plus an honest "
            "sizes. Three widths is usually enough. An image CDN doing server-side device "
            "detection achieves the same thing without srcset.",
            family="defect"))

    # "The first image" is the wrong target twice over: a decorative background
    # often sits above the hero in source order, and a byte window flags images
    # that are correctly lazy simply because the document is short. The LCP
    # candidate is the first image carrying real alt text -- if THAT one is lazy,
    # the request cannot start until layout proves it is in view.
    def _is_decorative(tag):
        return bool(re.search(r'alt=["\']["\']', tag)) or "alt=" not in tag.lower()

    lcp_candidate = next((i for i in imgs if not _is_decorative(i)), "")
    lazy_first = bool(lcp_candidate and re.search(r'loading=["\']lazy', lcp_candidate, re.I))
    lazy_all = len([i for i in imgs if re.search(r'loading=["\']lazy', i, re.I)])
    if lazy_first or (imgs and lazy_all == len(imgs) and lazy_all >= 3):
        out.append(finding(
            path, first(r'loading=["\']lazy'),
            ("the first image on the page is lazy-loaded" if lazy_first
             else f"all {lazy_all} images are lazy-loaded, including the first"),
            "lazy-loaded-lcp-image", "high",
            "This unconditionally delays LCP: the browser will not even START the request until "
            "layout proves the element is in view. PARTLY MODEL-FLAVOURED, and the uniformity is "
            "the signature — a person applies lazy loading where they remember to, a "
            "generator applies a rule everywhere it syntactically fits. \"Add lazy loading to "
            "images\" is stated without its exception roughly as often as with it.",
            "Delete loading, or set it eager, on the LCP candidate and add fetchpriority=\"high\". "
            "Keep lazy for everything below the fold. Nothing in the first viewport is lazy.",
            family="defect"))

    if imgs and "fetchpriority" not in low and "rel=\"preload\"" not in low.replace("'", '"') \
       and len(imgs) >= 3:
        out.append(finding(
            path, first(r"<img"), "no image is marked as the priority fetch",
            "lcp-image-without-fetchpriority", "medium",
            "The hero is discovered late and fetched at default priority, behind stylesheets and "
            "scripts, because nothing told the browser it was the most important byte on the "
            "page. fetchpriority requires knowing which element wins LCP — a rendered fact "
            "a generator cannot compute.",
            "fetchpriority=\"high\" on exactly one image, the LCP candidate; a preload link for "
            "a CSS background. More than one or two and the signal is worthless. On a page whose "
            "LCP is a headline, preload the font instead.",
            family="defect"))

    if re.search(r"images\.unsplash\.com/[^\"'?\s]+[\"'\s]", text) \
       or re.search(r"images\.pexels\.com/[^\"'?\s]+[\"'\s]", text):
        out.append(finding(
            path, first(r"images\.(unsplash|pexels)\.com"),
            "a stock photo referenced at source resolution with no resize parameters",
            "stock-photo-at-source-resolution", "high",
            "The download went in at four to six thousand pixels and got referenced directly. It "
            "looks fine — it always looks fine, that is the trap. Combine this with the "
            "stock-photography taste tell and you get a compound finding much stronger than "
            "either alone: a generic stock photo, shipped at source resolution.",
            "The stock host is itself an image CDN — add its width, quality and format "
            "parameters. For local assets, nothing enters the public directory above twice its "
            "largest display width.",
            family="defect"))

    vid = re.search(r"<video\b[^>]*>", text, re.I)
    if vid and re.search(r"\bautoplay\b", vid.group(0), re.I) \
       and not re.search(r"\bposter=", vid.group(0), re.I):
        out.append(finding(
            path, text[:vid.start()].count("\n") + 1,
            "an autoplaying background video with no poster",
            "autoplay-background-video-no-poster", "high",
            "The most expensive decoration on the web: a ten-second 1080p loop is routinely eight "
            "to fifteen megabytes, it downloads before anything the visitor asked for, and on "
            "mobile it frequently does not even play. Generators reach for background video "
            "because it is a well-represented premium-landing-page pattern, and they emit the "
            "minimal correct element — which is the maximally expensive one, because poster "
            "and preload are the attributes you add AFTER watching it load.",
            "A poster image is the default and the video is the upgrade: poster set, preload "
            "none, playback started on readiness, skipped on slow connections and under a "
            "reduced-motion preference. Budget a decorative loop at 2 MB, ten seconds, 720p.",
            family="defect"))

    gf_url = re.search(r"fonts\.googleapis\.com/css2\?[^\"'\s>]*", text)
    if gf_url:
        declared = {int(w) for grp in re.findall(r"wght@([\d;.,]+)", gf_url.group(0))
                    for w in re.split(r"[;,]", grp) if w.isdigit()
                    for w in [w]} | {int(w) for w in
                                     re.findall(r"(?<![\d.])([1-9]00)(?![\d.])", gf_url.group(0))}
        used = {int(w) for w in re.findall(r"font-weight\s*:\s*([1-9]00)\b", low)}
        used |= {700 for _ in re.findall(r"font-weight\s*:\s*bold\b", low)}
        used |= {400 for _ in re.findall(r"font-weight\s*:\s*normal\b", low)}
        if len(declared) >= th("font-weights-ordered-not-used", "min_declared", 4) \
           and len(used) <= 2:
            out.append(finding(
                path, text[:gf_url.start()].count("\n") + 1,
                f"{len(declared)} font weights requested, {len(used) or 'none'} used in the CSS",
                "font-weights-ordered-not-used", "medium",
                "Each unused weight is a separate file, and in a hosted-font URL they are all in "
                "one render-blocking request. PARTLY MODEL-FLAVOURED: the specific weight list is "
                "a copy-paste artefact that appears verbatim across generated pages — the "
                "shape of a well-represented snippet, not a decision. A designer who chose six "
                "weights would have used six.",
                "Request only the weights the CSS uses. Two is usually right for a marketing "
                "page. Check the WHOLE stylesheet, not the rendered page — weights used in "
                "components absent here are a false positive of page-scoped auditing.",
                family="residue"))
        if "preconnect" not in low:
            out.append(finding(
                path, text[:gf_url.start()].count("\n") + 1,
                "a hosted-font stylesheet with no preconnect to the font origin",
                "google-fonts-cdn-render-blocking", "medium",
                "A render-blocking stylesheet on a third-party origin whose font files live on a "
                "SECOND origin — so the critical path is DNS, TCP, TLS and CSS on one host, "
                "then DNS, TCP, TLS and the font on another, before a glyph paints. This link is "
                "one of the highest-frequency single lines in the HTML training corpus: it is "
                "what a model emits when asked for nice typography, without the preconnect that "
                "makes it tolerable.",
                "Self-host the WOFF2 subsets and the second-origin chain disappears. If the CDN "
                "must stay, preconnect to the font origin as the FIRST element in the head. The "
                "shared-cache argument died when browsers partitioned the cache in 2020.",
                family="defect"))

    if re.search(r"@font-face", low) and "font-display" not in low:
        out.append(finding(
            path, first(r"@font-face"), "@font-face with no font-display descriptor",
            "font-display-absent-or-block", "medium",
            "The default produces a flash of invisible text — the page is blank where the "
            "headline should be for up to three seconds, which reads as \"the site is broken\" "
            "rather than \"the font is loading\". A one-line descriptor that only matters on a "
            "slow connection, and a generator is never on one.",
            "swap for body and display faces, paired with metric overrides on the fallback so the "
            "swap does not move the layout. ICON fonts genuinely want block, because a swapped-in "
            "fallback renders as garbage letters.",
            family="defect"))

    if re.search(r"font-awesome|fontawesome|material-icons|glyphicons", low):
        out.append(finding(
            path, first(r"font-awesome|fontawesome|material-icons|glyphicons"),
            "an icon webfont loaded",
            "icon-webfont-for-a-handful-of-icons", "medium",
            "The whole glyph set downloads — often a hundred kilobytes plus a "
            "render-blocking stylesheet — and until it arrives the icons are invisible or "
            "render as tofu. UNREVIEWED and TEMPLATE-INHERITED: icon fonts are the 2015 pattern, "
            "and their persistence in new output signals that a template or a corpus snippet, "
            "rather than a decision, chose the icon strategy.",
            "Inline SVG for the icons you actually use — six sprites are a kilobyte or two "
            "total, paint with the first HTML byte, inherit currentColor and are addressable by "
            "assistive technology. An application with hundreds of icons is the real exception.",
            family="shape"))

    for lib, ism, sev, why, fix in (
        (r"\bthree(?:\.min)?\.js\b|from\s+[\"']three[\"']|@react-three/fiber|babylonjs",
         "webgl-library-for-decoration", "high",
         "A hundred and fifty kilobytes gzipped before any scene code, plus a WebGL context and a "
         "continuous animation loop that runs whether or not anyone is looking at it. The honest "
         "framing is that this is an agency aesthetic generators reproduce because it is "
         "well-represented in impressive-landing-page training data. What IS model-shaped is the "
         "mismatch: a generator imports a 3D engine for an effect CSS can do, because the engine "
         "version is the one it has seen more examples of.",
         "Ask what the effect actually is — a rotating blob is CSS keyframes on a gradient, "
         "a particle field is a canvas and forty lines. If you genuinely need WebGL, import from "
         "the source paths, code-split behind an observer, and stop the loop when the tab is "
         "hidden."),
        (r"framer-motion|from\s+[\"']motion|\bgsap\b|aos\.js|animate-on-scroll",
         "animation-library-for-css-effects", "medium",
         "Every entrance animation is a CSS transition plus an intersection observer, under a "
         "kilobyte. The library costs tens of kilobytes gzipped and runs its orchestration on the "
         "main thread, where it competes with event handlers; compositor-driven CSS transforms do "
         "not. PARTLY MODEL-FLAVOURED, and this is the payload half of "
         "reveal-animation-on-everything — the uniformity is the tell.",
         "A reveal class with a CSS transition behind a reduced-motion guard plus a six-line "
         "observer. Keep the library only for layout animation, shared-element transitions, drag "
         "or exit animations, which CSS genuinely cannot do."),
        (r"\blenis\b|locomotive-scroll|smooth-scrollbar",
         "smooth-scroll-library-on-a-brochure", "medium",
         "A per-frame JavaScript interpolation layer between the visitor's input and the page's "
         "response. UNREVIEWED and AESTHETIC-INHERITED: a portfolio convention reproduced without "
         "the context that justified it.",
         "Native smooth scroll behaviour is free for anchor navigation and respects a "
         "reduced-motion preference automatically. Take the library only for a genuine "
         "scroll-driven narrative. Note the better modern implementations keep native scroll "
         "alive, which is a materially smaller finding."),
    ):
        m = re.search(lib, text, re.I)
        if m:
            out.append(finding(
                path, text[:m.start()].count("\n") + 1,
                f"{m.group(0)} loaded on a page with no matching need",
                ism, sev, why, fix, family="shape"))

    if re.search(r'^\s*[\'"]use client[\'"]', text, re.M) \
       and not re.search(r"useState|useEffect|useReducer|useRef|onClick|onChange|onSubmit"
                         r"|window\.|document\.|localStorage", text):
        out.append(finding(
            path, first(r"use client"),
            "a client boundary on a component with no client-only API beneath it",
            "use-client-on-a-static-page", "high",
            "Everything below that boundary ships to the browser and is re-executed there to "
            "produce markup the server already produced. GENUINELY MODEL-FLAVOURED: the "
            "directive is the fastest way to make a build error go away, and generators reach "
            "for it as an error-suppression move rather than an architecture decision. The "
            "signature is exactly that — a fix applied to a symptom the model COULD see (a "
            "build error) rather than a cost it could not (the shipped bundle).",
            "Move the boundary down: keep the page a server component and mark only the "
            "interactive leaf as a client component, interleaving through children so the "
            "server-rendered content stays server-rendered.",
            family="defect"))

    if ext in {".html", ".htm"} and re.search(r"<body[^>]*>\s*<div id=[\"'](?:root|app)[\"']>"
                                              r"\s*</div>\s*(?:<script)", text, re.I):
        out.append(finding(
            path, first(r"<div id=[\"'](root|app)"),
            "the document body is an empty mount point",
            "spa-shell-for-a-brochure-site", "high",
            "Every word on the page exists only after a JavaScript bundle downloads, parses, "
            "executes and renders. UNREVIEWED and mostly TOOL-FLAVOURED rather than "
            "model-flavoured — it is what a default client-side scaffold produces. Worth "
            "flagging precisely because it is invisible in the rendered page and visible only in "
            "the delivery, which is the theme of this whole lane.",
            "Prerender. Any static-site generator turns the same components into HTML at build "
            "time. For a brochure site the honest answer is often that no framework was needed. "
            "An application behind a login is correctly client-rendered and is not this finding.",
            family="defect"))

    if ext in {".html", ".htm"} and "<head" in low:
        head = text[:low.find("</head>")] if "</head>" in low else text[:6000]
        origins = set(re.findall(r"<script[^>]*src=[\"']https?://([^/\"']+)", head, re.I))
        blocking = len([x for x in re.findall(r"<script\b[^>]*src=[^>]*>", head, re.I)
                        if not re.search(r"\basync\b|\bdefer\b|type=[\"']module", x, re.I)])
        blocking += len([x for x in re.findall(r"<link\b[^>]*rel=[\"']stylesheet[\"'][^>]*>",
                                               head, re.I)
                         if not re.search(r"\bmedia=", x, re.I)])
        if blocking >= th("render-blocking-head-stack", "min_blocking", 3):
            out.append(finding(
                path, first(r"<head"),
                f"{blocking} render-blocking resources in <head>"
                + (f" across {len(origins)} third-party origin(s)" if origins else ""),
                "render-blocking-head-stack", "high",
                "Nothing paints until all of them arrive. Nothing about the head order is visible "
                "in the design, and a generator assembling a head from remembered snippets has no "
                "model of the critical path. This is the roll-up finding that several others "
                "contribute to, and the one a reviewer can most easily act on — only "
                "13–15% of pages pass the render-blocking audit, so \"one, same-origin\" "
                "puts a page in the top sixth of the web.",
                "Inline the critical CSS for the first viewport and load the rest asynchronously. "
                "Defer every script not needed for first paint. Self-host fonts to remove the "
                "cross-origin blocking stylesheet. A single small same-origin stylesheet is the "
                "correct shape and is not this finding.",
                family="defect"))
        if len(origins) >= th("default-third-party-stack", "min_origins", 4):
            out.append(finding(
                path, first(r"<script[^>]*src=[\"']https?://"),
                f"{len(origins)} third-party script origins: {', '.join(sorted(origins)[:5])}",
                "default-third-party-stack", "high",
                "Each is a third-party origin — DNS, TCP, TLS — most execute on the "
                "main thread, and several load further scripts after they run. UNREVIEWED, "
                "EXPLICITLY: this is not an AI tell at all. No generator installs six SaaS "
                "widgets; people do. It belongs here because the audit is of the shipped "
                "artefact, and because it is very often the largest controllable cost on a "
                "marketing page after the hero image. Report it as an operational finding, never "
                "an authorship one.",
                "Budget third parties as a countable design constraint — three origins on a "
                "marketing page. Load everything non-essential deferred, after consent, or on "
                "interaction. Delete anything nobody has opened a dashboard for in ninety days.",
                family="shape"))

    dbg = len(re.findall(r"\bconsole\.(?:log|debug|warn)\s*\(", text)) \
        + len(re.findall(r"\bdebugger\s*;", text))
    if dbg >= th("debug-residue-in-production", "min_count", 3):
        out.append(finding(
            path, first(r"console\.(log|debug|warn)|debugger"),
            f"{dbg} console/debugger statements",
            "debug-residue-in-production", "low",
            "Working notes shipped to visitors. Harmless on its own, and a reliable sign "
            "nothing was reviewed on the way out.",
            "Strip them, or route them through a logger that compiles out in production. "
            "Check for logged request or user objects while you are there.",
            family="defect"))

    if re.search(r"import\s+\*\s+as\s+\w+\s+from\s+[\"\'](?:lucide-react|react-icons"
                 r"|@heroicons/react|@mui/icons-material)", text):
        out.append(finding(
            path, first(r"import\s+\*\s+as"), "whole icon library imported as a namespace",
            "barrel-icon-import", "medium",
            "Pulling the entire icon set for the handful actually used. Tree-shaking "
            "usually cannot help a namespace import, so the bundle carries thousands of "
            "components.",
            "Import the icons by name: `import { Check, X } from 'lucide-react'`. Then "
            "check the bundle actually shrank, because some of these packages need a "
            "per-icon path import to shake at all.",
            family="defect"))

    zs = [int(m) for m in re.findall(r"z-index\s*:\s*(\d{3,})", low)]
    zs += [int(m) for m in re.findall(r"\bz-\[(\d{3,})\]", low)]
    if zs and max(zs) >= th("z-index-escalation", "max_z", 100):
        out.append(finding(
            path, first(r"z-index|z-\["), f"z-index up to {max(zs)}",
            "z-index-escalation", "low",
            "Stacking resolved by bidding. A z-index of 9999 means nobody knows what it "
            "is competing with.",
            "Define a small scale (base 0, sticky 10, overlay 20, modal 30, toast 40) as "
            "tokens and use only those.", family="defect"))

    return out

# ------------------------------------------------------------- code signals

# ------------------------------------------------- app surfaces (markup AND script)

JS_FAMILY = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue", ".svelte"}


def analyze_app_surfaces(path, text):
    """Checks that live in script and config as often as in markup.

    These run for stylesheets, templates AND plain .js/.ts, because the surfaces
    they cover — the send call, the PDF export, the price formatter, the
    countdown — are usually nowhere near the markup. Everything here is a
    defect you can reproduce, not an inference about who wrote it.
    """
    out = []
    lines = mask_ignored(text.splitlines())
    text = "\n".join(lines)
    low = text.lower()

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l, re.I)), default)

    # ---- scaffold residue: the docs site that is still the starter
    markers = []
    if re.search(r"--ifm-color-primary\s*:\s*#2e8555", low):
        markers.append("the Docusaurus scaffold green")
    if "dinosaurs are cool" in low:
        markers.append("the scaffold tagline")
    if re.search(r"YOUR_APP_ID|YOUR_SEARCH_API_KEY|YOUR_INDEX_NAME", text):
        markers.append("placeholder Algolia credentials")
    if re.search(r"tutorial-basics|docs/intro\.md|MDX Blog Post", text):
        markers.append("scaffold pages still present")
    if re.search(r"Stack Overflow[\s\S]{0,200}Discord", text) and "footer" in low:
        markers.append("the scaffold footer link groups")
    if len(markers) >= th("docs-generator-defaults-unmodified", "min_markers", 3):
        out.append(finding(
            path, first(r"2e8555|Dinosaurs are cool|YOUR_APP_ID|tutorial-basics"),
            "; ".join(markers), "docs-generator-defaults-unmodified", "medium",
            "The docs site is the starter with the content swapped. \"Set up a docs site\" "
            "resolves to running the scaffolder, and the scaffolder's output is already a "
            "complete, good-looking site — so the loop terminates. The tell is not "
            "ugliness; it is being indistinguishable from the template.",
            "Change four things at minimum: the primary colour tokens, the logo and favicon, "
            "the footer link groups, and the landing page. Delete every scaffold page.",
            family="residue"))
    elif re.search(r"YOUR_APP_ID|YOUR_SEARCH_API_KEY|YOUR_INDEX_NAME", text):
        out.append(finding(
            path, first(r"YOUR_APP_ID|YOUR_SEARCH_API_KEY|YOUR_INDEX_NAME"),
            "search configured with placeholder credentials",
            "docs-search-indexes-nothing", "high",
            "The theme renders a search box whether or not you supply an index, so the "
            "generator gets the UI for free and never discovers it is hollow. Search is the "
            "primary navigation mode for documentation; a hollow one is worse than none.",
            "Wire a local index — docusaurus-search-local or Pagefind: no external "
            "service, works offline, indexes at build. Then search for a string you know is on "
            "the page and confirm it comes back.",
            family="defect"))

    # ---- money and dates written for exactly one place
    if re.search(r"[$€£¥][\s'\"}+]*\s*[\w.$\[\]()]*\.toFixed\(\s*2\s*\)"
                 r"|\.toFixed\(\s*2\s*\)\s*[\s'\"}]*\s*[$€£¥]"
                 r"|toLocaleDateString\(\s*[\"']en-US[\"']"
                 r"|[\"'](?:MM/DD/YYYY|MM/dd/yyyy)[\"']"
                 r"|\\B\(\?=\(\\d\{3\}\)\+\(\?!\\d\)\)", text) \
       and not re.search(r"Intl\.(?:NumberFormat|DateTimeFormat|RelativeTimeFormat)", text):
        out.append(finding(
            path, first(r"toFixed\(\s*2\s*\)|toLocaleDateString|MM/DD/YYYY"),
            "prices or dates formatted by hand, with no Intl formatter anywhere",
            "hardcoded-locale-formats", "medium",
            "toFixed(2) with a currency symbol is the commonest price-rendering idiom in the "
            "training data. It is not wrong so much as monolingual: JPY has zero decimals, KWD "
            "has three, and Germany writes 1.234,56 € with the symbol trailing.",
            "Intl.NumberFormat(locale, {style:'currency', currency}).format(amount) and "
            "Intl.DateTimeFormat(locale, {dateStyle:'medium'}).format(d). Take locale from the "
            "user's stored preference. Store money as integer minor units, never float.",
            family="defect"))

    if re.search(r"\bt\(\s*[\"'`][^\"'`]+[\"'`]\s*\)\s*\+|\+\s*t\(\s*[\"'`]"
                 r"|[\"'][\w.]*_(?:part\d|prefix|suffix|start|end)[\"']", text):
        out.append(finding(
            path, first(r"t\(\s*[\"'`][^\"'`]+[\"'`]\s*\)\s*\+|\+\s*t\(|_part\d|_prefix|_suffix"),
            "a translated sentence assembled from concatenated fragments",
            "sentence-assembled-from-fragments", "medium",
            "Fragment assembly reads perfectly in English, which is the only language the "
            "generator renders. Translators receive word-order-locked pieces they cannot "
            "reorder, and no language with grammatical gender, case or non-binary plurals can "
            "come out right. It is invisible until someone opens the string file.",
            "One message per sentence, with named placeholders and ICU plurals: "
            "t('cart.count', {count}) where the message is "
            "\"{count, plural, one {# item} other {# items}}\". Give translators context "
            "comments.",
            family="defect"))

    # ---- urgency and social proof with no source
    cd = re.search(r"(?:Date\.now\(\)|new Date\(\)(?:\.getTime\(\))?)\s*\+\s*\d"
                   r"|useState\(\s*\d{2,}\s*\*\s*60", text)
    if cd and re.search(r"countdown|timer|offerEnd|expires|deadline|flashSale|ends in",
                        text, re.I):
        out.append(finding(
            path, text[:cd.start()].count("\n") + 1,
            "a countdown whose deadline is computed from now, so it restarts on every load",
            "countdown-that-resets", "high",
            "A client-side countdown is a tidy, self-contained component; a real deadline needs "
            "a server, a promotion record and an end date. The model builds the component it "
            "can complete. Princeton counted 393 countdown timers across 361 of 11,000 shopping "
            "sites, so this is the corpus default, not a choice.",
            "If the offer has a real end, render it from a server timestamp and let the timer "
            "stop and the offer actually end. If it does not, delete the timer — a fake "
            "countdown is a false statement about price and availability.",
            family="defect"))

    fake = re.search(r"(?:Math\.random\(\)|Date\.now\(\)\s*%)[\s\S]{0,200}?"
                     r"(?:viewing|watching|looking at|people|shoppers|left in stock|"
                     r"only \d+ left)", text, re.I) \
        or re.search(r"(?:viewing|watching|people are|shoppers)[\s\S]{0,200}?Math\.random\(\)",
                     text, re.I)
    if fake:
        out.append(finding(
            path, text[:fake.start()].count("\n") + 1,
            "a live-activity or low-stock number generated from Math.random()",
            "fabricated-live-activity-counter", "high",
            "A live-data widget with no live data, asserting a present-tense fact that is "
            "verifiably false. Princeton counted 313 activity messages and 632 low-stock "
            "messages across the same corpus, which is why the model produces one on request. "
            "Adjacent to unbacked-social-proof, but narrower and more serious: that one is a "
            "copy claim, this one is a fabricated measurement.",
            "Wire it to real inventory or real concurrent-session data, and show nothing when "
            "the number is unremarkable. If you cannot, delete it.",
            family="defect"))

    mo = re.search(r"useEffect\(\s*\(\s*\)\s*=>\s*\{?\s*set(?:Show|Open|Is)\w*\(\s*true\s*\)"
                   r"[\s\S]{0,80}?\}?\s*,\s*\[\s*\]\s*\)", text)
    if mo and not re.search(r"localStorage|sessionStorage|scrollY|IntersectionObserver|"
                            r"mouseleave|setTimeout", text[max(0, mo.start() - 300):mo.end() + 300]):
        out.append(finding(
            path, text[:mo.start()].count("\n") + 1,
            "an overlay opened on mount with no delay, scroll trigger or suppression",
            "modal-on-first-paint", "medium",
            "The visitor is interrupted before reading a word. \"Add an email capture modal\" "
            "retrieves the simplest possible implementation and the simplest is unconditional; "
            "the suppression logic — show once, remember the dismissal, never during "
            "checkout — is the part that requires someone to have USED the site.",
            "Gate it on 50–60% scroll depth, or 30+ seconds, or exit intent. Persist the "
            "dismissal for at least 30 days. Never stack it over a consent banner, and never "
            "show it on checkout.",
            family="defect"))

    # ---- the exit that was never specified
    if re.search(r"(?:checkout\.sessions|subscriptions)\.create|billing_cycle_anchor|"
                 r"createSubscription|paddle\.Checkout", text, re.I) \
       and not re.search(r"billingPortal|cancelSubscription|subscriptions\.cancel|"
                         r"/cancel|deleteAccount|close-account|downgrade", text, re.I):
        out.append(finding(
            path, first(r"checkout\.sessions|subscriptions\.create|paddle\.Checkout"),
            "subscription creation with no cancellation path in the same surface",
            "cancellation-has-no-path", "high",
            "The happy path is what gets specified and what the corpus is full of; the exit "
            "path is specified by nobody. This reads UNREVIEWED more than deceptive — but "
            "the effect is a roach motel, and ROSCA still requires a simple mechanism to stop "
            "recurring charges whatever happened to the FTC's rule.",
            "Mount the provider's billing portal — for Stripe it is one API call and gives "
            "self-serve cancel, plan change and invoice history. Cancellation must be at least "
            "as easy as signup, in the medium the user signed up in.",
            family="defect"))

    if re.search(r"/checkout", text) \
       and re.search(r"if\s*\(\s*!\s*(?:session|user|auth)[\s\S]{0,60}redirect\(|"
                     r"matcher\s*:\s*\[[^\]]*checkout", text, re.I) \
       and not re.search(r"guest", text, re.I):
        out.append(finding(
            path, first(r"/checkout"),
            "checkout behind an auth guard with no guest branch",
            "checkout-without-guest-option", "high",
            "Auth-gating a route is the default generated pattern for anything with an order "
            "record, and guest checkout is an exception someone has to ask for. The model "
            "optimises for a clean data model; Baymard measures the cost at roughly a fifth to "
            "a quarter of buyers abandoning at the wall.",
            "Email-only guest checkout as the default path, with account creation offered after "
            "the order is placed and pre-filled from it. If you need an account for order "
            "history, create it silently and send a set-password link with the receipt.",
            family="defect"))

    # ------------------------------------------------- email: a surface with no preview
    send = re.search(r"(?:emails\.send|sgMail\.send|sendMail|sendEmail|messages\.create)"
                     r"\s*\(\s*\{[\s\S]{0,600}?\}", text)
    if send and re.search(r"\bhtml\s*:", send.group(0)) \
       and not re.search(r"\btext\s*:|TextPart|Body\.Text", send.group(0)):
        out.append(finding(
            path, text[:send.start()].count("\n") + 1,
            "a send call with an html part and no text/plain alternative",
            "no-plain-text-part", "medium",
            "html: is the documented minimum in every provider's quickstart, so it is what gets "
            "generated; the multipart alternative is the step the quickstart omits. Text-only "
            "clients, watch previews and several spam filters get nothing or an auto-stripped "
            "mangle.",
            "Send both parts and write the text version deliberately — do not let the ESP "
            "auto-strip tags, which produces link soup. Keep the same links and the same "
            "unsubscribe.",
            family="defect"))

    email_tpl = bool(re.search(r"<mjml|role=[\"']presentation[\"']|mso-hide|"
                               r"<!--\[if mso\]|email.*template|<td\b", text, re.I)) \
        and bool(re.search(r"<table|<td\b|preheader|unsubscribe|view (?:this )?email", text, re.I))
    if email_tpl:
        if re.search(r"display\s*:\s*(?:flex|grid)|position\s*:\s*(?:absolute|fixed)", low) \
           and not re.search(r"<!--\[if mso\]|mjml|maizzle|juice|premailer", low):
            out.append(finding(
                path, first(r"display\s*:\s*(flex|grid)"),
                "an email template laid out with flex or grid and no Outlook fallback",
                "email-built-with-web-css", "high",
                "The corpus of HTML is overwhelmingly WEB HTML; email HTML is a tiny dialect "
                "frozen around 2003, and the model writes the majority one. It renders "
                "perfectly in the preview pane the author checks and collapses in Outlook's "
                "Word engine, which a large share of recipients still use.",
                "Use MJML or Maizzle and let them emit the table soup and the MSO conditionals. "
                "Hand-written: nested tables with role=\"presentation\", padding on td only, "
                "every style inlined, ghost tables for Outlook. Then test in a rendering "
                "service, not in Gmail alone.",
                family="defect"))
        if not re.search(r"mso-hide|display\s*:\s*none[^<]{0,120}max-height\s*:\s*0", low) \
           and re.search(r"view (?:this )?(?:email|message) (?:in|on)|having trouble|"
                         r"can'?t see this", text, re.I):
            out.append(finding(
                path, first(r"view (this )?(email|message) (in|on)|having trouble"),
                "no preheader, so the inbox preview shows the view-in-browser line",
                "preheader-never-set", "low",
                "The preheader exists only in the inbox list view, never in any preview the "
                "author opens — so nothing in the loop surfaces its absence, and prime "
                "inbox real estate goes to boilerplate.",
                "Make the first child of <body> a hidden div carrying 40–100 characters "
                "that CONTINUE the subject rather than repeating it, padded with zero-width "
                "characters so no boilerplate leaks in behind it. Move \"View in browser\" "
                "below it.",
                family="defect"))

    # ---- the invoice that is a picture of an invoice
    ras = re.search(r"page\.screenshot\s*\(|html2canvas\s*\(|domtoimage\.|"
                    r"addImage\s*\([^)]*canvas", text)
    if ras and re.search(r"invoice|receipt|pdf|statement|ticket|report", low) \
       and not re.search(r"page\.pdf\s*\(|pdfkit|pdfmake|react-pdf|wkhtmltopdf|weasyprint", low):
        out.append(finding(
            path, text[:ras.start()].count("\n") + 1,
            "a document exported by rasterising the page rather than printing it",
            "receipt-generated-as-screenshot", "high",
            "\"Generate a PDF of this page\" retrieves a Puppeteer snippet, and screenshot() is "
            "the more prominent method. The output looks right in a viewer and is functionally "
            "dead: no selectable text, no searchable invoice number, nothing a screen reader "
            "or accounting software can read.",
            "page.pdf({format:'A4', printBackground:true}) preserves real text AND honours your "
            "print stylesheet — so this and no-print-stylesheet are fixed by the same "
            "work. For structured documents, generate the PDF from data with a PDF library and "
            "tag it so amounts and totals are machine-readable.",
            family="defect"))

    return out


def analyze_code(path, text):
    """Overlap between a comment and the line beneath it is countable. Whether a
    comment is *useful* is not, and stays a judge-pass call."""
    out = []
    lines = mask_ignored(text.splitlines())

    narrating = []
    for i, l in enumerate(lines[:-1]):
        m = COMMENT_PREFIX.match(l)
        if not m:
            continue
        comment, nxt = m.group(1).strip(), lines[i + 1].strip()
        if not comment or not nxt or COMMENT_PREFIX.match(lines[i + 1]):
            continue
        # A section divider ("# ---- centred paragraphs") introduces a block; it
        # is not a comment narrating the statement beneath it, and treating it as
        # one flagged this script's own headings.
        if re.match(r"^[-=*~_]{2,}", comment):
            continue
        cw = ident_words(comment) - STOPWORDS
        nw = ident_words(nxt) - STOPWORDS
        if len(cw) < 2:
            continue
        overlap = len(cw & nw) / len(cw)
        # A terse comment is held to a lower bar on purpose. "# increment the
        # counter" above "counter += 1" shares only one word, because the verb
        # the comment spells out is the operator the code uses -- which is the
        # whole tell. Requiring 60% overlap would miss the canonical case.
        bar = 0.5 if len(cw) <= 3 else th("comment-narrates-next-line", "overlap", 0.6)
        if overlap >= bar:
            narrating.append((i + 1, l.strip()[:80]))
    if len(narrating) >= th("comment-narrates-next-line", "min_count", 2):
        out.append(finding(
            path, narrating[0][0],
            f"{len(narrating)} comments restate the line below, e.g. {narrating[0][1]}",
            "comment-narrates-next-line", "high",
            "The comment says what the code already says. Generated comments describe "
            "syntax; engineers annotate the constraint the code cannot express.",
            "Delete it, or replace it with the reason: the bug it avoids, the limit it "
            "respects, what breaks if you change it.", "codex"))

    swallow = [i + 1 for i, l in enumerate(lines[:-1])
               if re.match(r"\s*except\b[^:]*:\s*$", l) and lines[i + 1].strip() == "pass"]
    swallow += [i + 1 for i, l in enumerate(lines)
                if re.search(r"catch\s*\([^)]*\)\s*\{\s*\}", l)]
    if swallow:
        out.append(finding(
            path, swallow[0], f"{len(swallow)} silently swallowed exception(s)",
            "swallow-exception-pass", "high",
            "Bare except/pass is what a generator writes to make an example run. It "
            "converts a failure you could have fixed into a silence you cannot debug.",
            "Catch the specific exception and handle it, or let it propagate.", "codex"))

    # humanize:ignore-start -- the stub regex matches its own source
    stubs = [i + 1 for i, l in enumerate(lines)
             if re.search(r"\b(TODO|FIXME|XXX)\b.*\b(implement|add|fill|replace|your)\b", l, re.I)
             or "raise NotImplementedError" in l
             or re.search(r"(?i)\b(your[-_ ]api[-_ ]key|replace[-_ ]this|insert[-_ ]here|example\.com/api)\b", l)]
    # humanize:ignore-end
    if len(stubs) >= th("placeholder-stub-residue", "min_count", 2):
        out.append(finding(
            path, stubs[0], f"{len(stubs)} placeholder/stub markers",
            "placeholder-stub-residue", "high",
            "Scaffolding the generator left for a human who never came back.",
            "Implement it or delete it. A stub that ships is a lie about what works.",
            "codex"))

    sigs = []
    for i, l in enumerate(lines[:-1]):
        m = re.match(r"\s*(?:def|fn|func|function)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)", l)
        if not m:
            continue
        dm = re.match(r'^(?:"""|\'\'\'|///|\*|//|#)\s*(.+)', lines[i + 1].strip())
        if not dm:
            continue
        first = re.split(r"[.\n]", dm.group(1))[0]
        dw = ident_words(first) - STOPWORDS
        sw = (ident_words(m.group(1)) | ident_words(m.group(2))) - STOPWORDS
        if dw and not (dw - sw):
            sigs.append((i + 2, first[:70]))
    if sigs:
        out.append(finding(
            path, sigs[0][0],
            f"{len(sigs)} docstring(s) restate the signature, e.g. \"{sigs[0][1]}\"",
            "docstring-restates-signature", "medium",
            "A docstring whose every content word already appears in the function name "
            "and parameters carries no information.",
            "Document what the caller cannot see: units, ownership, failure modes, the "
            "invariant it assumes.", "codex"))

    divs = [i + 1 for i, l in enumerate(lines)
            if re.match(r"\s*(?://|#)\s*[=*~-]{12,}\s*$", l)
            or re.match(r"\s*(?://|#)\s*[=*~-]{3,}\s+\w[\w \-]{2,40}\s+[=*~-]{3,}\s*$", l)]
    if len(divs) >= th("decorative-section-divider", "min_count", 2):
        out.append(finding(
            path, divs[0], f"{len(divs)} ASCII-art section dividers",
            "decorative-section-divider", "low",
            "Banner comments partitioning a file the way a generated outline does. "
            "Only a tell when the rest of the codebase does not use them.",
            "Check the surrounding files. If they have none, delete these; if the file "
            "needs sections this badly, it needs splitting."))

    emo = [i + 1 for i, l in enumerate(lines)
           if any(is_emoji(c) for c in l) and not l.strip().startswith(("*", '"""'))]
    if emo and len(emo) >= th("emoji-in-code", "min_count", 1):
        out.append(finding(
            path, emo[0], f"emoji on {len(emo)} line(s)", "emoji-in-code", "low",
            "Emoji in source. Only a tell when the repo does not already use them — "
            "some projects mandate them in commit and log conventions.",
            "Check the repo's own convention first. If there isn't one, remove them.",
            "codex"))
    return out


DOCS_OPENER = re.compile(
    r"^(in this (?:guide|article|tutorial|section|post|chapter)\b"
    r"|this (?:guide|article|tutorial|document|post) (?:will|covers|explains|walks)\b"
    r"|by the end of this\b"
    r"|let'?s (?:dive|get started|take a look|begin)\b"
    r"|we'?ll (?:walk|cover|explore|take a look|be)\b)", re.I)


def analyze_docs_markdown(path, text):
    """Two docs-page defects that are decidable from one markdown file.

    The second one is only HALF decidable from one file, and says so: the tell
    for a templated opening is repetition across pages, not any single sentence.
    A lone instance is reported at low and upgraded by escalate_docs_openers()
    once the run has seen enough pages to justify it.
    """
    out = []
    lines = mask_ignored(text.splitlines())
    body = "\n".join(lines)

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l, re.I)), default)

    # ---- code blocks nobody pasted anywhere
    fences = re.findall(r"^(```+)([^\n`]*)$", body, re.M)
    blocks = re.findall(r"^```+[^\n]*\n([\s\S]*?)^```+\s*$", body, re.M)
    if len(blocks) >= th("code-sample-not-runnable", "min_blocks", 4):
        untagged = sum(1 for _, info in fences[::2] if not info.strip())
        elided = sum(1 for b in blocks
                     if re.search(r"//\s*\.\.\.|#\s*\.\.\.|\.\.\.\s*$|"
                                  r"//\s*(?:rest of|your code here|implementation|etc)", b, re.M))
        dollar = sum(1 for b in blocks
                     if b.strip() and sum(1 for l in b.splitlines() if l.strip())
                     and sum(1 for l in b.splitlines()
                             if l.strip().startswith("$ ")) >= 0.8 * max(
                         1, sum(1 for l in b.splitlines() if l.strip())))
        placeholder = sum(1 for b in blocks
                          if re.search(r"<(?:YOUR|MY)_[A-Z_]+>|YOUR_API_KEY|xxxx+", b))
        reasons = []
        if untagged >= len(blocks) * th("code-sample-not-runnable", "untagged_share", 0.5):
            reasons.append(f"{untagged} of {len(blocks)} fences carry no language")
        if elided:
            reasons.append(f"{elided} block(s) elide the code with an ellipsis comment")
        if dollar:
            reasons.append(f"{dollar} shell block(s) prefix every line with $, which the "
                           "copy button then copies")
        if placeholder:
            reasons.append(f"{placeholder} block(s) contain an unexplained placeholder")
        if len(reasons) >= 2:
            out.append(finding(
                path, first(r"^```"), "; ".join(reasons),
                "code-sample-not-runnable", "medium",
                "Nothing here can be pasted and run. The model writes illustrative fragments "
                "because fragments are what documentation prose looks like in the corpus; it "
                "never pastes one into a terminal. The $-prefix case is the nastiest — it "
                "LOOKS like a transcript and silently breaks paste.",
                "Tag every fence with a language. Strip $ prompts from copyable shell blocks. "
                "Ship at least one complete, copy-paste-and-run example per page, and run it in "
                "CI so it cannot rot.",
                family="defect"))

    # ---- the templated opening
    stripped = re.sub(r"^---\n[\s\S]*?\n---\n", "", body)
    opens = []
    for m in re.finditer(r"^#{1,3} .*$", stripped, re.M):
        rest = stripped[m.end():].lstrip()
        if not rest:
            continue
        sent = split_sentences(rest[:400])
        if sent and DOCS_OPENER.match(sent[0].strip()):
            opens.append((stripped[:m.end()].count("\n") + 1, sent[0].strip()[:70]))
    if opens:
        many = len(opens) >= th("every-page-opens-with-in-this-guide", "min_consecutive", 3)
        out.append(finding(
            path, opens[0][0],
            (f"{len(opens)} sections open with the same framing sentence"
             if many else f'section opens with "{opens[0][1]}…"'),
            "every-page-opens-with-in-this-guide", "medium" if many else "low",
            "A human writing twenty sections varies the opening, because writing the same "
            "sentence twenty times is unbearable. A generator writing them independently "
            "produces the highest-probability opening every time. The UNIFORMITY is the signal "
            + ("— and this file shows it on its own."
               if many else "— one instance is not evidence, so this is reported low "
                            "until the run sees the same opening on other pages."),
            "Delete the opening paragraph and start with the first real sentence. If the page "
            "needs orientation, state the outcome in one line and let the heading and the "
            "sidebar do the structural work.",
            family="form"))
    return out


def escalate_docs_openers(findings):
    """The templated-opening tell is a property of a SET of pages, not a page.

    A single low finding on one file is honest but weak. Once three or more
    separate files in the same run carry it, the repetition is the evidence the
    catalog entry actually describes, so raise them together.
    """
    hits = [f for f in findings if f.get("ism") == "every-page-opens-with-in-this-guide"]
    files = {f.get("file") for f in hits}
    if len(files) >= th("every-page-opens-with-in-this-guide", "min_consecutive", 3):
        for f in hits:
            if f.get("severity") == "low":
                f["severity"] = "medium"
                f["explanation"] += (f" Escalated: {len(files)} files in this run open the "
                                     "same way, which is the repetition the finding is about.")
    return findings


# ---------------------------------------------------------------- provenance

# Every string here is an exact literal verified against a live production page
# or by code search with a hit count. They are deliberately NOT findings, and
# --provenance is deliberately a separate mode that writes no report.
#
# A fingerprint tells you what made the page. It never tells you who wrote it,
# and it never tells you whether the page is any good. Three collapses to refuse:
# provenance is not authorship (a scaffold dependency proves where a project
# STARTED, not who has committed since); provenance is not defect (a CDN host is
# infrastructure, and stripping it gains nothing); and absence proves nothing,
# because every badge below is removable by paying. Wix and Squarespace are the
# sharpest case -- their AI flows now seed the ordinary editor, so AI-built and
# hand-built output are provably identical in markup.
#
# Tier A is a near-unique literal. Tier B is strong but shared or removable.
FINGERPRINTS = [
    ("Framer", "A", r'<meta[^>]+content="Framer\s+[0-9a-f]{7}"', "generator meta"),
    ("Framer", "A", r"<!--[^>]*\bFramer\b[^>]*-->", "build comment"),
    ("Framer", "A", r"data-framer-hydrate-v2|__framer-badge-container", "hydration / badge"),
    ("Framer", "A", r"Inter Placeholder", "default font stack"),
    ("Framer", "A", r"framerusercontent\.com|events\.framer\.com/script", "asset host"),
    ("Framer", "B", r"data-framer-(?:ssr-released-at|page-optimized-at)=", "publish timestamp"),
    ("Lovable", "A", r"DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT",
     "instruction addressed to a model"),
    ("Lovable", "A", r"cdn\.gpteng\.co/gptengineer\.js", "scaffold script"),
    ("Lovable", "A",
     r"pub-[0-9a-f]{32}\.r2\.dev/[0-9a-f]{32}/id-preview-[0-9a-f-]+\.lovable\.app-\d{13}\.png",
     "auto-screenshot og:image (survives badge removal AND a custom domain)"),
    ("Lovable", "A", r'id="lovable-badge"|CameraPlainVariable', "badge"),
    ("Lovable", "B", r"data-lov-id|componentTagger|lovable-tagger", "visual-editor tagger"),
    ("v0 / Vercel", "A", r'content="v0\.app"|generator:\s*"v0\.app"', "generator meta"),
    ("v0 / Vercel", "A", r'Generated by v0|Created with v0|<title>v0 App</title>',
     "unedited scaffold metadata"),
    ("v0 / Vercel", "B", r"--font-geist-sans|Geist Fallback", "font stack"),
    ("Bolt.new", "A", r"bolt\.new/badge\.js|bolt\.new/static/og_default\.png", "badge / default card"),
    ("Replit", "A", r"replit-dev-banner\.js|replit-badge-v2\.js", "dev banner"),
    ("Replit", "A", r"This is a replit script which adds a banner", "self-describing comment"),
    ("Replit", "B", r"@replit/vite-plugin-(?:cartographer|dev-banner|runtime-error-modal)",
     "scaffold plugin"),
    ("Base44", "A", r"media\.base44\.com/images/public/|base44_access_token", "media CDN / token"),
    ("Durable", "A", r"cdn\.durable\.co/(?:blocks|covers|getty|logos|services)/", "stock block CDN"),
    ("Durable", "A", r'"madeWithDurable"|utm_source=Durable\.co', "page JSON"),
    ("Wix", "A", r'content="Wix\.com Website Builder"|static\.parastorage\.com|wixstatic\.com',
     "generator meta / asset host"),
    ("Squarespace", "A", r"<!-- This is Squarespace\.|Static\.SQUARESPACE_CONTEXT",
     "header comment / context object"),
    ("Webflow", "A", r'name=["\']generator["\'][^>]*Webflow|content=["\']Webflow["\']',
     "generator meta (attribute order is REVERSED here -- parse, do not regex the tag)"),
    ("Webflow", "A", r"data-wf-(?:page|site)|cdn\.prod\.website-files\.com", "site attributes"),
    ("10Web", "A", r"10web-theme|tenweb-speed-optimizer|tenweb-[a-z-]+-js", "theme / plugin"),
    ("Hostinger", "B", r"assets\.zyrosite\.com", "asset host (secondhand, not fetch-verified)"),
    ("Claude Artifacts", "A", r"frame\.claudeusercontent\.com|claude\.ai/public/artifacts/",
     "artifact origin"),
    ("Vite scaffold", "A", r'href="/vite\.svg"|<title>Vite \+ React</title>', "untouched scaffold"),
    ("create-next-app", "A", r"<title>Create Next App</title>|Generated by create next app",
     "untouched scaffold"),
    ("shadcn/ui defaults", "A",
     r"oklch\(0\.769 0\.188 70\.08\)|oklch\(0\.828 0\.189 84\.429\)|"
     r"oklch\(0\.398 0\.07 227\.392\)|--sidebar-ring:\s*oklch\(0\.708 0 0\)",
     "unmodified theme tokens"),
    ("Gemini / Imagen", "A", r"Gemini_Generated_Image_", "image filename"),
    ("ChatGPT image", "A", r"ChatGPTImage[A-Z][a-z]{2}\d|ChatGPT-Image-[A-Z][a-z]{2}-\d",
     "image filename"),
    ("Client-First (HUMAN signal)", "A",
     r"\bpadding-global\b|\bcontainer-large\b|\bpadding-section-(?:small|medium|large)\b",
     "evidence AGAINST generation -- a naming system somebody chose"),
]


def scan_provenance(paths):
    """Report what made the page, and refuse to say more than that."""
    hits = {}
    for path in paths:
        try:
            text = Path(path).read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        for tool, tier, pat, what in FINGERPRINTS:
            if re.search(pat, text, re.I):
                hits.setdefault((tool, tier), set()).add(what)
    if not hits:
        print("no tool fingerprints found.\n"
              "That is not evidence the page was hand-built: every badge in the table is "
              "removable by paying, and several tools leave no marker at all.")
        return 0
    print("PROVENANCE — what made these files. Not findings, and not a claim about who "
          "wrote them.\n")
    for (tool, tier), whats in sorted(hits.items(), key=lambda kv: (kv[0][1], kv[0][0])):
        print(f"  [{tier}] {tool}")
        for w in sorted(whats):
            print(f"        {w}")
    print("\nTier A is a near-unique literal; Tier B is strong but shared or removable.")
    print("Three or more signals for one tool is a positive, two is probable, one is a hint.")
    print("\nWhat to do with this: report the platform if asked, never infer the author. "
          "A generator meta is\ninformation, not a problem. The findings worth acting on are "
          "the ones in the report — run without\n--provenance for those. Where a "
          "fingerprint IS also a defect (an unwritten meta description, a\nshare card that is "
          "the builder's logo, a palette nobody chose), fix the thing it points at rather\nthan "
          "the string: the string then disappears as a side effect, which is the only removal "
          "that is\nhonest.")
    return 0


# ----------------------------------------------------- in-product UI strings

def extract_ui_strings(text, suffix):
    """Candidate user-facing strings, with their line numbers.

    Deliberately narrow. A false positive here is a phrase quoted in an article,
    so the extraction refuses anything that is not plausibly a UI string: i18n
    catalog values, JSX text nodes, and string literals in the render or error
    path.
    """
    out = []
    if suffix == ".json":
        # An i18n catalog: flat or nested string values, keyed by dotted ids.
        for m in re.finditer(r'"[^"]+"\s*:\s*"([^"\\]{2,200})"', text):
            out.append((text[:m.start()].count("\n") + 1, m.group(1)))
        return out
    for m in re.finditer(r">\s*([^<>{}\n][^<>{}]{1,160}?)\s*<", text):
        v = m.group(1).strip()
        if v and not v.startswith(("//", "/*", "@")):
            out.append((text[:m.start()].count("\n") + 1, v))
    for m in re.finditer(r"""(?:toast|alert|setError|setMessage|notify|Error|message|
                             label|title|placeholder|description|error|text|children)
                             \s*[:=(]\s*["'`]([^"'`\\]{2,200})["'`]""",
                         text, re.X | re.I):
        out.append((text[:m.start()].count("\n") + 1, m.group(1).strip()))
    return out


def analyze_ui_strings(path, text):
    """Measure punctuation frequency. Contextual UI copy belongs to the judge."""
    suffix = path.suffix.lower()
    text = "\n".join(mask_ignored(text.splitlines()))
    strings = extract_ui_strings(text, suffix)
    bangs = [(ln, value) for ln, value in strings if "!" in value]
    if len(strings) < th("exclamation-in-system-strings", "min_strings", 12) or \
       len(bangs) <= len(strings) / th("exclamation-in-system-strings", "strings_per_mark", 12):
        return []
    return [finding(
        path, bangs[0][0],
        f"{len(bangs)} of {len(strings)} UI strings carry an exclamation mark",
        "exclamation-in-system-strings", "low",
        "The extracted strings use a repeated emphasis cue. Check whether it fits the actual workflow.",
        "Retain the punctuation where it serves the message.",
        family="rhythm",
    )]


def _has_form(text, low):
    """Is there a form surface here at all?

    Every check below costs a false positive if it fires on an article that
    merely mentions an input, so the whole pass is gated on markup that
    actually collects something.
    """
    return bool(re.search(r"<input\b|<select\b|<textarea\b|<form\b|useForm\(|"
                          r"register\(|<Field\b|formState", text, re.I))


def analyze_motion(path, text):
    """Interaction and motion.

    Motion is the one design property whose entire quality lives in time, and a
    generator emits it as a static string it can never watch run. So the timing
    decisions are made from whatever value was commonest in the corpus and then
    applied uniformly — and uniform motion is decoration by definition, because
    decoration is the only use of motion that needs no knowledge of what is
    actually happening on the page.
    """
    out = []
    lines = mask_ignored(text.splitlines())
    text = "\n".join(lines)
    low = text.lower()

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l, re.I)), default)

    reduce_guard = bool(re.search(r"prefers-reduced-motion", low))
    js_reduce = bool(re.search(r"matchMedia\(\s*[\"'`]\(?prefers-reduced-motion"
                               r"|useReducedMotion|reducedMotion\s*[:=]", text, re.I))

    # ---- reveal-on-scroll applied to the whole document
    reveal_pat = (r'data-aos=|whileInView|useInView|\bAOS\.init|'
                  r'class(?:Name)?="[^"]*\b(?:animate-on-scroll|reveal|fade-up|'
                  r'scroll-reveal|aos-init)\b|IntersectionObserver')
    reveals = len(re.findall(reveal_pat, text, re.I))
    sections = len(re.findall(r"<section\b|<Section\b", text, re.I))
    if sections >= th("motion-on-everything-so-nothing-is-emphasised", "min_sections", 3) \
       and reveals >= sections * th("motion-on-everything-so-nothing-is-emphasised",
                                    "ratio", 0.8):
        out.append(finding(
            path, first(reveal_pat),
            f"{reveals} scroll-reveal trigger(s) across {sections} section(s)",
            "motion-on-everything-so-nothing-is-emphasised", "medium",
            "Motion is a contrast channel like size or weight, so spending it on all content "
            "spends it on none: if every section reveals, the reveal tells the reader nothing "
            "about what matters. Reviewers in one six-site teardown reported the same thing "
            "each time — the animation held their attention while the messaging went unread.",
            "Pick the one or two moments that deserve emphasis and let the rest be present on "
            "arrival. A reveal on the headline figure means something; a reveal on the footer "
            "means the page is slow.",
            family="shape"))

    # ---- scroll capture
    jack = []
    if re.search(r"addEventListener\(\s*[\"'`](?:wheel|mousewheel|touchmove)[\"'`][\s\S]{0,200}?"
                 r"preventDefault", text):
        jack.append("a wheel or touchmove listener calling preventDefault")
    if re.search(r"locomotive-scroll|fullpage\.js|new\s+fullpage|\bLenis\b|"
                 r"ScrollTrigger[\s\S]{0,120}?pin\s*:\s*true", text, re.I):
        jack.append("a scroll-hijacking library")
    if re.search(r"scroll-snap-type\s*:\s*[xy]\s+mandatory", low):
        jack.append("scroll-snap-type: mandatory")
    if jack:
        out.append(finding(
            path, first(r"wheel|locomotive|fullpage|Lenis|ScrollTrigger|scroll-snap-type"),
            "; ".join(jack),
            "scroll-jacking", "high",
            "Nielsen Norman Group's usability testing found most participants at least mildly "
            "disoriented by scroll capture, several reading it as a bug rather than a design, "
            "and task-focused visitors dropping off. Users have a strong mental model that a "
            "wheel notch moves the page a fixed distance; overriding it contradicts the one "
            "control they are certain of.",
            "Let the page scroll. Where a section must hold position use scroll-snap with "
            "proximity rather than mandatory, keep every keyboard route working, and never "
            "call preventDefault on wheel.",
            family="defect"))

    # ---- transition: all
    t_all = len(re.findall(r"transition\s*:\s*all\b|transition-property\s*:\s*all\b"
                           r"|\btransition-all\b", low))
    if t_all >= th("transition-all-as-the-default", "min_count", 2):
        out.append(finding(
            path, first(r"transition\s*:\s*all|transition-all"),
            f"{t_all} × transition: all",
            "transition-all-as-the-default", "medium",
            "`all` animates every property that ever changes, including ones nobody intended — "
            "a class swap that also changes height now animates layout, and the browser cannot "
            "composite it. It is also a statement that no one decided what was changing.",
            "Name the properties: transition: background-color 120ms ease-out, transform 160ms "
            "ease-out. If you cannot name them, the element does not need a transition.",
            family="form"))

    # ---- one duration for every distance
    durs = re.findall(r"(?:transition-duration|animation-duration)\s*:\s*([\d.]+m?s)", low)
    durs += re.findall(r"transition\s*:\s*[a-z-]+\s+([\d.]+m?s)", low)
    durs += [f"{m}ms" for m in re.findall(r"\bduration-(\d{2,4})\b", low)]
    if len(durs) >= th("one-duration-for-every-distance", "min_contexts", 3) \
       and len(set(durs)) == 1 and not re.search(r"--(?:dur|duration|motion)[\w-]*\s*:", low):
        out.append(finding(
            path, first(r"duration|transition\s*:"),
            f"{len(durs)} animated context(s), all at {durs[0]}",
            "one-duration-for-every-distance", "medium",
            "Perceived speed is distance over time, so one duration makes small moves feel "
            "sluggish and large ones feel abrupt. Duration is a judgement made by watching, "
            "which is exactly what a generator cannot do — so the corpus median is emitted for "
            "a 2px hover tint and a full-height sheet alike.",
            "Two or three durations tied to distance: ~120ms for a hover or tint, ~220ms for a "
            "popover, ~360ms for a full-height surface. Put them in tokens so the choice is "
            "visible in the code.",
            family="shape"))

    # ---- ease-in on an entrance
    if re.search(r"(?:fade-?in|slide-?up|slide-?in|reveal|enter|appear)[^;{}]{0,80}"
                 r"\bease-in\b(?!-out)|\bease-in\b(?!-out)[^;{}]{0,60}"
                 r"(?:fade-?in|slide-?up|reveal|enter)", low):
        out.append(finding(
            path, first(r"ease-in\b"),
            "an entrance animation easing in",
            "ease-in-on-an-entrance", "medium",
            "ease-in starts slow and accelerates, so the element loiters exactly while the "
            "reader waits for it and then snaps. Entrances want ease-out; exits want ease-in. "
            "The naming collision is a fact about English rather than about motion, which is "
            "the kind of error a text model makes and a person watching the screen does not.",
            "ease-out on entrances, ease-in on exits, ease-in-out only for a move that both "
            "starts and ends on screen. Keep entrances at or under 200ms.",
            family="form"))

    # ---- content that only exists if the script runs
    if re.search(r"\.(?:reveal|fade-?in|animate-on-scroll|scroll-reveal)[^{}]*\{[^}]*"
                 r"opacity\s*:\s*0", low) and not re.search(r"\.no-js|html\.js|@starting-style", low):
        out.append(finding(
            path, first(r"opacity\s*:\s*0"),
            "reveal content starts at opacity: 0 and is cleared only by script",
            "initial-state-hidden-so-content-depends-on-script", "high",
            "If the script does not run, does not run in time, or the element never enters the "
            "viewport, the content is permanently invisible — and invisible to in-page search "
            "and to print. The CSS half and the JS half are each correct; nothing in either "
            "encodes what happens when only one of them runs.",
            "Animate from a visible state, or gate the hidden initial state behind a class the "
            "script sets on <html> first, so the no-script path renders everything. "
            "@starting-style does this natively now.",
            family="defect"))

    # ---- animating a layout property
    lay = re.findall(r"transition(?:-property)?\s*:\s*[^;]*\b(height|width|top|left|right|"
                     r"bottom|margin|padding)\b", low)
    if lay:
        out.append(finding(
            path, first(r"transition[^;]*\b(?:height|width|top|left|margin|padding)\b"),
            f"animating {', '.join(sorted(set(lay)))}",
            "animating-a-layout-property", "medium",
            "These force layout on every frame for the whole subtree, so the animation janks on "
            "exactly the hardware already struggling. It is the commonest cause of motion that "
            "feels cheap without looking wrong in a screenshot.",
            "Animate transform and opacity. For a height change use a grid-template-rows "
            "0fr-to-1fr transition, or interpolate-size / calc-size — both stay off the layout "
            "path in current browsers.",
            family="defect"))

    # ---- hover without a hover guard
    hovers = re.findall(r"[^\s{,]+:hover\b", low)
    if len(hovers) >= th("hover-styles-without-a-hover-guard", "min_count", 2) \
       and not re.search(r"\(\s*hover\s*:\s*hover\s*\)|\(\s*pointer\s*:\s*fine\s*\)", low):
        out.append(finding(
            path, first(r":hover"),
            f"{len(hovers)} :hover rule(s), no (hover: hover) guard anywhere",
            "hover-styles-without-a-hover-guard", "medium",
            "On a touchscreen the hover state latches on tap and stays until the user taps "
            "elsewhere, so the card they just tapped stays lit. The behaviour does not exist on "
            "the machine the code was written for and cannot be seen in the source.",
            "Wrap hover styling in @media (hover: hover) and (pointer: fine). Known limit: a "
            "touchscreen laptop answers yes to both, so keep :active and :focus-visible "
            "carrying their own weight.",
            family="defect"))

    # ---- hover is the only route
    if re.search(r":hover\s+[^{]*\{[^}]*(?:opacity\s*:\s*1|display\s*:\s*(?:block|flex)|"
                 r"visibility\s*:\s*visible)", low) \
       and not re.search(r":focus-within|:focus-visible", low):
        out.append(finding(
            path, first(r":hover\s+[^{]*\{"),
            "content revealed on hover with no :focus-within equivalent",
            "hover-is-the-only-route-to-the-information", "high",
            "On a touchscreen the content cannot be reached at all, and with a keyboard only if "
            "the same styles are bound to focus. Hover-reveal is a heavily represented desktop "
            "pattern whose failure is a property of the device, which the source does not "
            "describe.",
            "Bind the same reveal to :focus-within. Better, stop hiding it: if the action "
            "matters it can be visible, and if it does not it belongs in a menu with a real "
            "trigger.",
            family="defect"))

    # ---- hover styled, focus forgotten
    fvis = len(re.findall(r":focus-visible|:focus\b", low))
    if len(hovers) >= th("hover-styled-focus-forgotten", "min_hovers", 3) \
       and fvis * th("hover-styled-focus-forgotten", "ratio", 3) < len(hovers):
        out.append(finding(
            path, first(r":hover"),
            f"{len(hovers)} :hover rule(s) against {fvis} focus rule(s)",
            "hover-styled-focus-forgotten", "high",
            "Every interactive element in the file is styled for exactly one input device. "
            "Hover is the state the author sees while building; focus only appears if you put "
            "the mouse down.",
            "Every :hover gets a :focus-visible. If you remove the default outline, replace it "
            "with an indicator of at least equal visibility — WCAG 2.2's 2.4.11 makes its size "
            "and contrast testable.",
            family="defect"))
    if re.search(r"outline\s*:\s*(?:none|0)\b", low) \
       and not re.search(r":focus-visible[^{]*\{[^}]*(?:outline|box-shadow|border)", low):
        out.append(finding(
            path, first(r"outline\s*:\s*(?:none|0)"),
            "outline removed with no replacement focus indicator",
            "hover-styled-focus-forgotten", "high",
            "outline: none with nothing in its place deletes the only indication a keyboard "
            "user has of where they are on the page.",
            "Replace it in the same rule: :focus-visible { outline: 2px solid currentColor; "
            "outline-offset: 2px }.",
            family="defect"))

    # ---- reduced motion honoured in CSS, ignored in script
    lib = re.search(r"\bgsap\b|framer-motion|locomotive|\bLenis\b|animejs|anime\(|"
                    r"lottie|AOS\.init|ScrollTrigger", text, re.I)
    if lib and reduce_guard and not js_reduce:
        out.append(finding(
            path, first(r"gsap|framer-motion|locomotive|Lenis|animejs|lottie|AOS\.init"),
            f"{lib.group(0)} initialised with no reduced-motion check",
            "reduced-motion-honoured-in-css-ignored-in-script", "high",
            "The media query silences the CSS transitions and leaves the parallax, the "
            "scroll-triggered timeline and the spring physics running — which is the motion "
            "that actually causes trouble. 35.4% of US adults aged 40 and over showed "
            "vestibular dysfunction in the 2001-2004 NHANES data, about 69 million people.",
            "Read the query in JS and branch: skip the timeline, or set duration to 0. Bind the "
            "change event too, so toggling the OS setting takes effect without a reload.",
            family="defect"))
    elif lib and not reduce_guard and not js_reduce:
        out.append(finding(
            path, first(r"gsap|framer-motion|locomotive|Lenis|animejs|lottie|AOS\.init"),
            f"{lib.group(0)} with no reduced-motion handling anywhere",
            "no-reduced-motion-guard", "high",
            "A motion library is running with the user's stated preference never consulted, in "
            "CSS or in script.",
            "Add @media (prefers-reduced-motion: reduce) for the CSS and a matchMedia check "
            "before building any timeline.",
            family="defect"))

    # ---- the reduced-motion block that only resets durations
    # The universal reset is usually pasted as a single line, so the block body
    # is matched by brace-counting rather than by requiring a newline -- the
    # first version of this check silently never fired on the commonest form.
    reduce_body = ""
    mstart = re.search(r"@media[^{]*prefers-reduced-motion[^{]*\{", low)
    if mstart:
        depth, i = 0, mstart.end() - 1
        while i < len(low):
            if low[i] == "{":
                depth += 1
            elif low[i] == "}":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        reduce_body = low[mstart.end():i]
    if reduce_body:
        body = reduce_body
        only_time = re.search(r"animation-duration|transition-duration|animation-delay", body) \
            and not re.search(r"transform|background-attachment|animation-play-state|"
                              r"scroll-behavior|display|autoplay", body)
        risky = re.search(r"background-attachment\s*:\s*fixed|parallax|autoplay|"
                          r"\binfinite\b", low)
        if only_time and risky:
            out.append(finding(
                path, first(r"prefers-reduced-motion"),
                "reduced-motion block resets durations only, on a page with parallax, "
                "autoplay or infinite animation",
                "reduced-motion-block-only-shortens-duration", "low",
                "The universal duration reset is a reasonable floor and is not a motion design. "
                "It leaves parallax offsets, auto-advancing content and large translate "
                "distances in place, because none of those are durations.",
                "Keep the reset as a backstop, then handle what it cannot: background-attachment: "
                "scroll, autoplay paused, and large translations replaced with a cross-fade.",
                family="shape"))

    # ---- parallax
    if re.search(r"background-attachment\s*:\s*fixed", low) \
       or re.search(r"(?:scrollY|pageYOffset|scrollTop)[\s\S]{0,120}?"
                    r"translate(?:3d|Y)?\(", text):
        # A reduced-motion block that only resets durations does not guard
        # this: parallax is a transform and an attachment, neither of which is
        # a duration. Require the block to address the motion it claims to.
        guards_parallax = js_reduce or bool(
            re.search(r"background-attachment|transform|translate|scroll", reduce_body))
        if not guards_parallax:
            out.append(finding(
                path, first(r"background-attachment\s*:\s*fixed|scrollY|pageYOffset"),
                "scroll-linked background movement, unguarded",
                "parallax-with-no-reduced-motion-path", "high",
                "Background and foreground moving at different rates is the example WCAG 2.3.3 "
                "names directly, and the one most cited for vestibular reactions — dizziness, "
                "nausea, headache.",
                "Guard it: @media (prefers-reduced-motion: reduce) { background-attachment: "
                "scroll }, and skip the scroll handler when the query matches.",
                family="defect"))

    # ---- stagger that outlasts the reader
    for mm in re.finditer(r"(?:animation-)?delay[^;\n]{0,40}?(?:index|i|idx)\s*\*\s*(\d{2,4})"
                          r"|(?:index|i|idx)\s*\*\s*(\d{2,4})\s*\)?\s*(?:\+\s*)?[\"'`]?ms",
                          text, re.I):
        step = int(mm.group(1) or mm.group(2))
        items = max(len(re.findall(r"\.map\(", text)) and 10, 10)
        budget = th("stagger-delay-outlasts-the-reader", "max_total_ms", 600)
        if step * items > budget:
            out.append(finding(
                path, text[:mm.start()].count("\n") + 1,
                f"{step}ms per item — about {step * items}ms before the last one exists",
                "stagger-delay-outlasts-the-reader", "medium",
                "Nobody multiplied it out. The per-item delay is written once and the count "
                "arrives from data, so the total is never a number anyone saw.",
                "Cap the total: stagger only the first few items and bring the rest in together, "
                "keeping the whole sequence inside about 400ms.",
                family="shape"))
            break

    # ---- global smooth scroll
    if re.search(r"(?:html|:root|body)[^{}]*\{[^}]*scroll-behavior\s*:\s*smooth", low) \
       and not re.search(r"prefers-reduced-motion\s*:\s*no-preference", low):
        out.append(finding(
            path, first(r"scroll-behavior\s*:\s*smooth"),
            "scroll-behavior: smooth applied globally and unguarded",
            "smooth-scroll-forced-globally", "medium",
            "Every programmatic jump now animates, including ones the user did not ask to "
            "watch: skip links, an anchor into a long document, a scroll restore on back. A "
            "screen-reader user following a skip link has to wait for it.",
            "Guard it with @media (prefers-reduced-motion: no-preference), or apply it to the "
            "specific interactions that want it. Skip links should always jump.",
            family="form"))

    # ---- hover-scale on every card
    sc = len(re.findall(r"hover:scale-\d|whileHover=\{\{\s*scale|:hover[^{}]*\{[^}]*"
                        r"transform\s*:\s*scale\(", low))
    if sc >= th("hover-scale-on-every-card", "min_count", 3):
        out.append(finding(
            path, first(r"hover:scale-|whileHover|transform\s*:\s*scale"),
            f"{sc} elements lifting or scaling on hover by the same amount",
            "hover-scale-on-every-card", "low",
            "The framer-motion whileHover default and the hover:scale-105 idiom applied to a "
            "grid, so nothing is more interactive than anything else. On text, a scale "
            "transform resamples the glyphs and they go soft.",
            "Use hover to signal what is clickable, not to decorate. A background or border "
            "shift says the same thing without resampling text.",
            family="form"))

    # ---- infinite animation with no off switch
    inf = re.findall(r"animation\s*:[^;]*\binfinite\b|animation-iteration-count\s*:\s*infinite",
                     low)
    if inf and not re.search(r"animation-play-state|spinner|loading|\bloader\b|progressbar", low):
        out.append(finding(
            path, first(r"\binfinite\b"),
            f"{len(inf)} infinite animation(s), no pause control",
            "infinite-animation-with-no-off", "medium",
            "Beyond five seconds of unattended motion WCAG 2.2.2 requires a mechanism to pause, "
            "stop or hide it, and an infinite CSS animation has none. It also keeps a "
            "compositor layer awake, which is a battery cost on a page doing nothing.",
            "Stop it after a few cycles, bind it to a control, or guard it with reduced-motion. "
            "A busy indicator is exempt because it ends when the load does.",
            family="defect"))

    # ---- counting up a number that never changed
    if re.search(r"(?:textContent|innerText|setCount|setValue)\s*=?\s*\(?[^;\n]{0,60}"
                 r"(?:Math\.(?:round|floor)|toFixed)\([^;\n]{0,80}progress|countUp|CountUp",
                 text, re.I):
        out.append(finding(
            path, first(r"countUp|CountUp|progress"),
            "a statistic animated up from zero",
            "counter-animation-on-a-static-number", "low",
            "The number did not change. For a few hundred milliseconds the page displays values "
            "that are not true, and with a screen reader or in-page search the animated value is "
            "unreadable or wrong.",
            "Render the number. If you keep the effect, put the true value in the DOM and mark "
            "the animating node aria-hidden with the real figure in a visually hidden sibling.",
            family="form"))

    # ---- toast that times out too fast
    for mm in re.finditer(r"(?:toast|snackbar|notification|alert)[\s\S]{0,160}?"
                          r"setTimeout\([^,]{0,60},\s*(\d{3,5})\s*\)", text, re.I):
        ms = int(mm.group(1))
        if ms < th("toast-timeout-shorter-than-its-reading-time", "min_ms", 5000):
            out.append(finding(
                path, text[:mm.start()].count("\n") + 1,
                f"toast auto-dismisses after {ms}ms regardless of message length",
                "toast-timeout-shorter-than-its-reading-time", "medium",
                "WCAG 2.2.1 requires time limits to be adjustable or extendable. A screen "
                "reader or a slower reader cannot get through a two-line message in three "
                "seconds, and if the message carried the only copy of an error it is now gone.",
                "Scale the timeout with the text, pause on hover and on focus, and never "
                "auto-dismiss anything carrying an error or an undo. Give every toast a close "
                "button.",
                family="defect"))
            break

    # ---- the primary action with no pending state
    if re.search(r"(?:onClick|onSubmit)\s*=\s*\{?\s*async|await\s+(?:fetch|post|save|submit|"
                 r"mutate)\(", text) \
       and not re.search(r"isPending|isLoading|isSubmitting|loading\s*&&|pending|aria-busy|"
                         r"setSubmitting", text, re.I):
        out.append(finding(
            path, first(r"async|await"),
            "an async primary action with no pending state",
            "no-pending-state-on-the-primary-action", "high",
            "The button looks identical during the request, so the user gets no acknowledgement "
            "that the click registered and clicks again — and with no re-entry guard the second "
            "click is a second request. The pending state has no duration on localhost, so "
            "nothing about building the page surfaces it.",
            "Set a pending state on click: change the label, show a spinner in the button, set "
            "aria-busy, and guard the handler against re-entry. Keep the button focusable so "
            "the state is announced.",
            family="defect"))

    # ---- focus moved only once the dialog has finished animating
    if re.search(r"(?:onAnimationComplete|transitionend|onTransitionEnd)[\s\S]{0,120}?\.focus\(\)"
                 r"|setTimeout\([^,]{0,80}\.focus\(\)[^,]{0,20},\s*([2-9]\d{2,})", text):
        out.append(finding(
            path, first(r"onAnimationComplete|transitionend|onTransitionEnd|\.focus\(\)"),
            "focus moved in an animation-complete callback",
            "modal-animation-delays-the-focus-move", "medium",
            "For the length of the animation the keyboard is still on the page behind and a "
            "screen reader is still reading it — and tabbing during that window lands in "
            "background content the dialog now covers. \"Animate the dialog\" and \"move focus "
            "into the dialog\" are separately correct; their ordering is what nobody specified.",
            "Move focus on open, before or during the animation. The animation is decoration; "
            "the focus move is the state change.",
            family="defect"))

    # ---- a swipe that plays a canned animation instead of following the finger
    if re.search(r"(?:onTouchStart|onPointerDown|addEventListener\(\s*[\"\'`](?:touchstart|"
                 r"pointerdown)[\"\'`])", text) \
       and not re.search(r"(?:touchmove|pointermove|onTouchMove|onPointerMove|deltaX|deltaY|"
                         r"clientX\s*-|movementX)", text):
        out.append(finding(
            path, first(r"onTouchStart|onPointerDown|touchstart|pointerdown"),
            "a gesture start handler with no move handler",
            "motion-does-not-track-the-gesture", "low",
            "The surface does not move with the finger, so there is no direct manipulation and "
            "no way to abort halfway — the gesture is a trigger for a canned animation rather "
            "than a manipulation of an object. Gesture-tracked motion needs the pointer stream "
            "and interruption handling; a timed animation is one call and satisfies the same "
            "sentence.",
            "Bind position to the pointer delta while the gesture is live, and hand the "
            "remainder to a spring on release with the gesture's velocity. Let the user drag it "
            "back.",
            family="shape"))

    # ---- a reading-progress bar on something nobody needs to be oriented in
    if re.search(r"(?:scrollY|scrollTop|pageYOffset)[\s\S]{0,160}?"
                 r"(?:progress|\.style\.width|scaleX)", text, re.I) \
       and len(strip_markup(text)) < th("scroll-progress-bar-on-a-short-page",
                                        "min_chars", 6000):
        out.append(finding(
            path, first(r"progress|scaleX|\.style\.width"),
            f"a scroll-progress indicator on about {len(strip_markup(text))} characters of text",
            "scroll-progress-bar-on-a-short-page", "low",
            "A reading-progress indicator on a document short enough to need no orientation is a "
            "scroll listener, a fixed element and a repaint per frame, spent telling the reader "
            "what the scrollbar already told them.",
            "Keep it for long-form reading where it orients, and drive it with a CSS "
            "scroll-driven animation rather than a scroll listener where you keep it.",
            family="shape"))

    # ---- will-change everywhere
    wc = len(re.findall(r"will-change\s*:", low))
    if wc >= th("will-change-left-on-everywhere", "min_count", 3) \
       or re.search(r"(?:^|\n)\s*\*\s*\{[^}]*will-change", low):
        out.append(finding(
            path, first(r"will-change"),
            f"{wc} will-change declaration(s)",
            "will-change-left-on-everywhere", "low",
            "It promotes elements to their own compositor layer and holds the memory for as "
            "long as the declaration applies, so as a blanket optimisation it costs more than "
            "the jank it was meant to remove.",
            "Set it immediately before the animation and remove it after, or leave it out — "
            "transform and opacity animations are already composited without it.",
            family="shape"))

    return out


# The fields a browser can fill, mapped to the token it needs. Matching is on
# the field's NAME, not on free text, which is what keeps this list from
# behaving like the phrase lists the rest of this skill argues against.
AUTOFILL_PURPOSE = [
    (r"\b(?:e-?mail)\b", "email"),
    (r"\b(?:phone|tel|mobile)\b", "tel"),
    (r"\bfirst-?name|given-?name\b", "given-name"),
    (r"\blast-?name|surname|family-?name\b", "family-name"),
    (r"\b(?:full-?name|fullname)\b", "name"),
    (r"\b(?:address|street|addr)\b", "street-address"),
    (r"\b(?:city|town|locality)\b", "address-level2"),
    (r"\b(?:zip|postal|postcode)\b", "postal-code"),
    (r"\b(?:country)\b", "country-name"),
    (r"\b(?:cc-?num|card-?number|cardnum)\b", "cc-number"),
    (r"\b(?:org|company|organisation|organization)\b", "organization"),
]

NUMERIC_FIELD = (r"\b(?:zip|postal|postcode|phone|tel|otp|verification|"
                 r"code|pin|amount|quantity|qty|cvv|cvc|account)\b")

# type=number is for values you would do arithmetic on. These are identifiers.
IDENTIFIER_FIELD = (r"\b(?:cc|card|credit|phone|tel|zip|postal|postcode|otp|"
                    r"verification|pin|account|ssn|iban|routing)\b")


def _inputs(text):
    """Every input-ish tag, as (tag_source, line_number)."""
    return [(m.group(0), text[:m.start()].count("\n") + 1)
            for m in re.finditer(r"<(?:input|Input)\b[^>]*>", text)]


def analyze_forms(path, text):
    """Forms and input.

    A form is the one surface where the model's output is the BEGINNING of the
    user's work rather than the end of it. Everything else it produces is read;
    a form is operated — on a phone keyboard, through a password manager, after
    an error, under time pressure. None of those conditions exist in the markup,
    so the tells cluster exactly at the properties that only come into being
    while somebody is using it.
    """
    out = []
    lines = mask_ignored(text.splitlines())
    text = "\n".join(lines)
    low = text.lower()
    if not _has_form(text, low):
        return out

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l, re.I)), default)

    tags = _inputs(text)

    # ---- the disabled submit
    m = re.search(r"<(?:button|Button)\b[^>]*\bdisabled\s*=\s*\{\s*!?\s*"
                  r"(?:isValid|formState\.isValid|valid|canSubmit|isFormValid)"
                  r"|disabled=\{!\s*\w*[Vv]alid", text)
    if m:
        out.append(finding(
            path, text[:m.start()].count("\n") + 1,
            m.group(0)[:120],
            "submit-disabled-until-valid", "high",
            "The control that would tell the user what is wrong is the control being withheld. "
            "Fix one of three errors and the button stays dead with no indication anything "
            "improved, so the interface reads as broken rather than as strict. It is the most "
            "reproduced form pattern in generated code and practitioners have argued against "
            "it for over a decade.",
            "Leave the button enabled. Validate on submit, render an error summary, move focus "
            "to it, and link each message to its field. If you must show an unready state use "
            "aria-disabled, which stays focusable and announceable.",
            family="defect"))

    # ---- validity gated on keyup, which autofill does not fire
    if re.search(r"addEventListener\(\s*[\"'`]key(?:up|press|down)[\"'`]|onKey(?:Up|Press)\s*=",
                 text) and re.search(r"valid|disabled|canSubmit|checkForm", text, re.I):
        out.append(finding(
            path, first(r"key(?:up|press|down)"),
            "form validity driven by a key event",
            "validity-gate-misses-the-password-manager", "high",
            "A password manager's fill does not produce a key event. The fields are visibly "
            "populated, the form is visibly complete, and the button is still dead with nothing "
            "on screen explaining why — the user has done everything right. Blocking password "
            "managers also puts WCAG 2.2's 3.3.8 in play.",
            "Listen for `input`, not keyup — it fires for autofill, paste and speech. Better, "
            "stop gating the button at all.",
            family="defect"))

    # ---- autocomplete
    missing = []
    for tag, ln in tags:
        tl = tag.lower()
        if "autocomplete" in tl or re.search(r'type=["\'](?:hidden|submit|button)', tl):
            continue
        ident = " ".join(re.findall(r'(?:name|id|placeholder)=["\']([^"\']+)', tl))
        for pat, token in AUTOFILL_PURPOSE:
            if re.search(pat, ident, re.I) or re.search(pat, tl, re.I):
                missing.append((ln, token))
                break
    if missing:
        out.append(finding(
            path, missing[0][0],
            f"{len(missing)} personal-data field(s) with no autocomplete token "
            f"(wanted: {', '.join(sorted({t for _, t in missing})[:5])})",
            "missing-autofill-attributes", "high",
            "The browser cannot fill them and assistive tooling cannot identify their purpose. "
            "This is a WCAG 2.1 failure in its own right — 1.3.5 Identify Input Purpose, Level "
            "AA — and Google reports correct autocomplete cutting checkout time by up to about "
            "30%. The attribute changes nothing the author can see, which is why it is missing.",
            "Add the specific token, not the generic one: autocomplete=\"given-name\", "
            "\"email\", \"tel\", \"street-address\", \"postal-code\", \"cc-number\". The token "
            "list is fixed; invented values do nothing.",
            family="defect"))

    if re.search(r'autocomplete\s*=\s*["\']?\{?\s*["\']?off', low) \
       and re.search(NUMERIC_FIELD + r"|email|name|address", low):
        out.append(finding(
            path, first(r"autocomplete\s*=\s*[\"']?\{?\s*[\"']?off"),
            "autocomplete=\"off\" on a form collecting personal data",
            "autocomplete-off-on-personal-fields", "medium",
            "Its effect is to make every user type by hand what their browser already knows. "
            "Browsers now ignore it for passwords precisely because sites overused it; for "
            "names, addresses and payment fields it still works.",
            "Remove it and set the real token. If a value genuinely must not persist — a "
            "one-time code — use autocomplete=\"one-time-code\", which expresses that intent.",
            family="defect"))

    # ---- type=number on an identifier
    for tag, ln in tags:
        tl = tag.lower()
        if re.search(r'type=["\']number', tl) and re.search(IDENTIFIER_FIELD, tl):
            out.append(finding(
                path, ln, tag[:120],
                "number-input-for-a-non-number", "medium",
                "The spec says this type is for numbers you would do arithmetic on. For an "
                "identifier it drops leading zeros, silently rejects the spaces and dashes "
                "people type, changes value when a focused field is scrolled over, and adds "
                "spinner arrows. \"It contains digits, so it is a number\" is a reasonable "
                "inference from the type's name and wrong about what the type means.",
                "type=\"text\" with inputmode=\"numeric\", a pattern and the right autocomplete "
                "token. type=\"tel\" for phone numbers. Keep type=\"number\" for quantities.",
                family="defect"))
            break

    # ---- inputmode absent on a numeric field
    for tag, ln in tags:
        tl = tag.lower()
        if re.search(r'type=["\']text', tl) and re.search(NUMERIC_FIELD, tl) \
           and "inputmode" not in tl:
            out.append(finding(
                path, ln, tag[:120],
                "inputmode-absent-on-a-numeric-field", "medium",
                "A phone user gets the full QWERTY keyboard and has to find the number layer to "
                "type a postcode or a verification code. The keyboard is a property of a device "
                "the page was never opened on.",
                "inputmode=\"numeric\" for digit strings, \"decimal\" for amounts, \"tel\" for "
                "phone numbers — plus enterkeyhint to label the return key.",
                family="defect"))
            break

    # ---- error summary on a long form
    field_count = len(tags) + len(re.findall(r"<(?:select|textarea|Select|Textarea)\b", text))
    has_inline_err = re.search(r"errors?\.\w+|error\s*&&|className=[\"'][^\"']*\berror\b", text)
    has_summary = re.search(r"error-summary|errorSummary|role=[\"']alert[\"'][^>]*>[\s\S]{0,200}"
                            r"<(?:ul|ol)\b|There (?:is|are) \d+ (?:problem|error)", text, re.I)
    if field_count > th("no-error-summary-on-a-long-form", "min_fields", 5) \
       and has_inline_err and not has_summary:
        out.append(finding(
            path, first(r"errors?\.|error"),
            f"{field_count} fields, per-field errors only, no summary",
            "no-error-summary-on-a-long-form", "medium",
            "The user gets no count, no list and no route to the first problem — they scroll "
            "hunting for red, and some of it is off screen. In-line errors are the visible half "
            "and they look complete when the whole form fits on the reviewer's screen.",
            "On failure render a summary at the top: a count, a heading, and a link per error "
            "whose text is the message and whose target is the field. Move focus to it. The "
            "GOV.UK pattern was built for people completing services under stress.",
            family="defect"))

    # ---- error not tied to its field
    if has_inline_err and not re.search(r"aria-describedby", low):
        out.append(finding(
            path, first(r"errors?\.|error"),
            "in-line error messages with no aria-describedby",
            "error-not-tied-to-its-field", "high",
            "Visually the message is beside the field; programmatically it is an unrelated piece "
            "of text, so a screen-reader user focused on the input hears the label and nothing "
            "about what went wrong. Proximity in the markup reads as association, and the "
            "association is an attribute nobody looked for.",
            "Give the error an id, point aria-describedby at it, and set aria-invalid=\"true\" "
            "while the field is in error. Both are conditional on the error, not permanent.",
            family="defect"))
    elif has_inline_err and not re.search(r"aria-invalid", low):
        out.append(finding(
            path, first(r"aria-describedby"),
            "fields described by an error but never marked invalid",
            "error-not-tied-to-its-field", "medium",
            "aria-describedby carries the text; aria-invalid carries the state. Without it the "
            "field is not announced as being in error, only as having extra description.",
            "Add aria-invalid=\"true\" for the duration of the error.",
            family="defect"))

    # ---- focus not moved after a failed submit
    if re.search(r"setErrors?\(|setFormErrors?\(|set\w*Error\(", text) \
       and not re.search(r"\.focus\(\)|focusRef|autoFocus|setFocus\(", text):
        out.append(finding(
            path, first(r"setErrors?\(|set\w*Error\("),
            "errors set on failed submit with no focus move",
            "focus-not-moved-after-a-failed-submit", "high",
            "Focus stays on the submit button at the bottom and nothing announces the failure. "
            "For a keyboard or screen-reader user the submit appeared to do nothing. A sighted "
            "mouse user sees the red appear; the failure only exists for someone whose "
            "attention is where the focus is.",
            "Move focus to the error summary if you have one, or to the first invalid field. "
            "Give the summary tabindex=\"-1\" so it can take focus.",
            family="defect"))

    # ---- the form clears on failure
    if re.search(r"catch\s*\([^)]*\)\s*\{[^}]{0,200}?\b(?:reset\(\)|setValues\(initial|"
                 r"setForm\(initial|clearForm\()", text):
        out.append(finding(
            path, first(r"catch"),
            "the error path resets the form",
            "form-clears-on-validation-failure", "high",
            "Everything the user typed is gone and they start again — and the longer the form, "
            "the more likely they abandon. Baymard puts abandonment attributable to a long or "
            "complicated checkout at 18%, against a tracked ~70% overall rate. The error path "
            "is the branch least likely to be exercised while building, and clearing is what a "
            "naive re-render does for free.",
            "Preserve every value across a failed submit, including passwords. Re-render the "
            "same state with errors attached. A SUCCESSFUL submit should clear.",
            family="defect"))

    # ---- paste blocked
    if re.search(r"onPaste\s*=\s*\{?[^}]{0,80}preventDefault|"
                 r"addEventListener\(\s*[\"'`]paste[\"'`][\s\S]{0,120}?preventDefault", text):
        out.append(finding(
            path, first(r"onPaste|[\"'`]paste[\"'`]"),
            "paste blocked on an input",
            "paste-blocked-on-a-password-or-code-field", "high",
            "It stops password managers and it stops copying a one-time code out of a message. "
            "The security rationale it is offered under is the reverse of the truth — blocking "
            "paste pushes people toward passwords short enough to type. The UK NCSC has advised "
            "against it for years, and WCAG 2.2's 3.3.8 treats obstructing password managers as "
            "an authentication barrier.",
            "Delete the handler. If you need to catch a mis-paste, validate the value instead "
            "of refusing it.",
            family="defect"))

    # ---- password without a reveal
    if re.search(r'type=["\']password', low) \
       and not re.search(r"showPassword|show-password|togglePassword|reveal-password|"
                         r"type=\{\s*show", text, re.I):
        out.append(finding(
            path, first(r'type=["\']password'),
            "password field with no reveal control",
            "no-show-password-control", "low",
            "The user cannot check what they typed, which on a phone keyboard is where most "
            "password entry failures come from, and the cost is an error message that cannot "
            "tell them which character was wrong.",
            "Add a real <button type=\"button\"> whose accessible name changes with state. Keep "
            "focus in place when it is pressed.",
            family="form"))

    # ---- required asterisk with no legend
    has_legend = re.search(r"\*[^<>]{0,60}\b(?:required|optional|mandatory)\b"
                           r"|\b(?:required|optional|mandatory)\b[^<>]{0,60}\*", low)
    if re.search(r">\s*[^<>]{1,60}\*\s*<|\*\s*</label>", text) and not has_legend:
        out.append(finding(
            path, first(r"\*\s*</label>|\*\s*<"),
            "asterisks marking required fields with no legend",
            "required-marking-with-no-key", "low",
            "The convention is widespread and it is still a convention — nothing on the page "
            "says what the asterisk means, and it is not usefully announced.",
            "State it once at the top of the form and put `required` on the input so it is "
            "announced. Where most fields are required, mark the optional ones instead.",
            family="form"))

    # ---- multi-step with no way back
    if re.search(r"set(?:Step|CurrentStep|Page|Index)\(\s*(?:\w+\s*\+\s*1|prev\s*=>\s*prev\s*\+)",
                 text) and not re.search(r"-\s*1\)|prev\s*-\s*1|goBack|onBack|Previous|\bBack\b",
                                         text):
        out.append(finding(
            path, first(r"set(?:Step|CurrentStep|Page|Index)\("),
            "a step advances with no decrement path",
            "multi-step-form-with-no-back-or-progress", "medium",
            "The user cannot tell how many steps there are or get back to correct something. "
            "Forward is the path the happy demo takes; back is a branch that only matters once "
            "somebody makes a mistake.",
            "Show \"Step 2 of 4\", give a real Back control that preserves entered values, and "
            "put the step in the URL so the browser's own back button works.",
            family="defect"))

    # ---- date as three selects
    sels = re.findall(r"<(?:select|Select)\b[^>]*>", text, re.I)
    if len(sels) >= 3:
        joined = " ".join(sels).lower()
        if re.search(r"\bday\b", joined) and re.search(r"\bmonth\b", joined) \
           and re.search(r"\byear\b", joined):
            out.append(finding(
                path, first(r"<select"),
                "a date collected as three dropdowns",
                "date-entered-as-three-selects", "low",
                "Selecting a year from a list of ninety is slow with a mouse and worse on a "
                "phone. The pattern tests consistently badly against three short text inputs, "
                "which is why GOV.UK ships the text-input version for dates people know.",
                "Three labelled numeric text inputs in a fieldset for a remembered date. Keep a "
                "calendar picker for choosing a date — booking, scheduling — where the calendar "
                "is the point.",
                family="form"))

    # ---- a select for two options
    for mm in re.finditer(r"<select\b[^>]*>([\s\S]{0,400}?)</select>", text, re.I):
        opts = re.findall(r"<option\b", mm.group(1), re.I)
        if 0 < len(opts) <= th("select-for-a-two-option-choice", "max_options", 2):
            out.append(finding(
                path, text[:mm.start()].count("\n") + 1,
                f"a dropdown with {len(opts)} option(s)",
                "select-for-a-two-option-choice", "low",
                "Two interactions to reveal one bit of information, and on a phone it opens a "
                "full-height wheel to pick between yes and no. `select` is the general-purpose "
                "answer to \"a choice\" and generalises without regard to how many there are.",
                "Radio buttons for two to about five options — all visible, one tap each. A "
                "checkbox where the choice is genuinely binary and the default is off.",
                family="form"))
            break

    # ---- an email pattern that rejects real addresses
    m = re.search(r"[\"'/\[]([^\"'/]{0,80}@[^\"'/]{0,80}\\?\.\[?a-z[^\"'/]{0,30}\{2,[34]\})",
                  text, re.I)
    if m or re.search(r"\[a-z\]\{2,4\}\$?[\"'/]", low):
        out.append(finding(
            path, first(r"@[^\"'/]{0,60}\{2,[34]\}|\[a-z\]\{2,4\}"),
            "an email pattern with a restrictive top-level-domain class",
            "email-regex-rejects-valid-addresses", "medium",
            "{2,4} rejects .museum, .software and every longer TLD, and most hand-rolled "
            "patterns also reject plus-addressing. The user has a working address the form "
            "insists is invalid, with no route past it. Email regexes are abundant in the "
            "corpus, most are wrong in the same ways, and the wrongness is invisible against "
            "the addresses a developer tests with.",
            "Use type=\"email\" and let the browser do the syntactic check, then verify by "
            "sending mail. If you must pattern-match, require an @ with something either side "
            "and stop there.",
            family="defect"))

    # ---- autofocus
    if re.search(r"\bautofocus\b|autoFocus(?:=\{true\}|\s|/?>)", text, re.I) \
       and len(re.findall(r"<(?:p|h2|h3|article|section)\b", text, re.I)) > 3:
        out.append(finding(
            path, first(r"autofocus"),
            "autofocus on a page with other content above it",
            "autofocus-on-page-load", "low",
            "It moves the viewport on a phone and opens the keyboard over the content, skips "
            "past everything above the field including the heading, and for a screen-reader "
            "user starts the page partway through with no announcement of what was skipped.",
            "Keep it for a page whose only purpose is that one field. Drop it anywhere the user "
            "needs to read something first.",
            family="form"))

    # ---- character counter nobody hears
    m = re.search(r"\{?\s*\w*(?:value|text|content)\w*\.length\s*\}?\s*(?:/|of|\bof\b)\s*\{?\s*"
                  r"\d{2,4}", text, re.I)
    if m and not re.search(r"aria-live", low):
        out.append(finding(
            path, text[:m.start()].count("\n") + 1,
            "a live character count with no live region",
            "character-counter-that-is-never-announced", "low",
            "A sighted user watches it approach the limit; everyone else types past it and finds "
            "out at submit. The counter is visual by construction and the announcement is a "
            "separate consideration.",
            "Put it in a polite live region, debounce it, and only announce near the limit — the "
            "remaining count at the last twenty characters, not every character. Tie it to the "
            "field with aria-describedby.",
            family="defect"))
    elif m and re.search(r'aria-live=["\']assertive', low):
        out.append(finding(
            path, first(r"aria-live"),
            "a character counter in an assertive live region",
            "character-counter-that-is-never-announced", "medium",
            "Assertive interrupts whatever is being spoken, so the count is announced over the "
            "user's own typing. This is the over-correction of the silent counter and is "
            "arguably worse.",
            "aria-live=\"polite\", debounced, announcing only near the limit.",
            family="defect"))

    # ---- native and custom validation both live
    if re.search(r"\brequired\b|pattern=", low) \
       and re.search(r"onSubmit=\{|handleSubmit\(|validate\(", text) \
       and not re.search(r"noValidate|novalidate", text, re.I):
        out.append(finding(
            path, first(r"onSubmit=\{|handleSubmit\("),
            "native constraints and a custom validator, with no noValidate",
            "native-and-custom-validation-both-firing", "medium",
            "The browser's bubble appears on some paths and the styled in-line messages on "
            "others, they disagree about what is wrong, and which one the user sees depends on "
            "how they submitted. Two separately correct answers to \"validate this form\", with "
            "nothing making one defer.",
            "Pick one. Keep the attributes for semantics and set noValidate so your messages are "
            "the only ones shown, or drop the custom layer and style :user-invalid.",
            family="defect"))

    # ---- the search box that is a text box
    for tag, ln in tags:
        tl = tag.lower()
        if re.search(r'type=["\']text', tl) and re.search(r"search|query\b", tl):
            if not re.search(r'role=["\']search|type=["\']search', low):
                out.append(finding(
                    path, ln, tag[:120],
                    "search-field-with-no-clear-and-no-search-type", "low",
                    "The user clears a query by holding backspace, and the field gets none of "
                    "the platform behaviour — no clear affordance, no search keyboard, no "
                    "history. type=\"text\" works, so nothing about the page failing surfaces "
                    "the gap.",
                    "type=\"search\" inside a role=\"search\" landmark, with an explicit clear "
                    "button that returns focus to the field.",
                    family="form"))
            break

    # ---- enterkeyhint
    if field_count > th("no-enterkeyhint-on-a-multi-field-form", "min_fields", 3) \
       and "enterkeyhint" not in low:
        out.append(finding(
            path, first(r"<input|<Input"),
            f"{field_count} fields, no enterkeyhint on any of them",
            "no-enterkeyhint-on-a-multi-field-form", "low",
            "Every field's on-screen return key says the same thing, so on a phone the user "
            "cannot tell whether return will move on or submit. The key's label is a "
            "phone-keyboard property invisible in the markup and on the desktop it was built on.",
            "enterkeyhint=\"next\" on every field but the last, \"done\" or \"send\" on the "
            "last. One attribute per input.",
            family="form"))

    # ---- password rules that only appear once you have broken them
    if re.search(r'type=["\']password', low) \
       and re.search(r"(?:minLength|min_length|\.length\s*[<>]=?\s*\d|"
                     r"(?:pattern|regex)[^\n]{0,60}(?:A-Z|a-z|0-9|\\d))", text) \
       and not re.search(r"at least \d|must (?:contain|include|be)|requirements?|"
                         r"characters? long|uppercase|lowercase", low):
        out.append(finding(
            path, first(r'type=["\']password'),
            "password constraints live only in the validator",
            "password-rules-revealed-after-failure", "medium",
            "The user guesses, fails, guesses again, and each round is an error message that "
            "reads as a reprimand for not knowing a rule that was never stated. The rule lives "
            "where the generator was asked to put it, and stating it in the interface is a "
            "second, separate instruction.",
            "Show the requirements next to the field before anyone types, and tick them off as "
            "they are met. Tie the list to the field with aria-describedby.",
            family="form"))

    # ---- a visual challenge as the only way through
    if re.search(r"recaptcha|hcaptcha|turnstile|g-recaptcha|grecaptcha", low) \
       and not re.search(r"audio|accessib|alternative|mailto:|tel:", low):
        out.append(finding(
            path, first(r"recaptcha|hcaptcha|turnstile"),
            "a visual challenge with no alternative and no bypass route",
            "captcha-as-the-only-route-past-the-form", "medium",
            "A WCAG 1.1.1 problem and a hard stop: the user cannot contact anyone about being "
            "unable to contact anyone. Spam handling is a real requirement answered with the "
            "corpus-standard widget, and the alternative path is a separate requirement nobody "
            "stated.",
            "Prefer an invisible or token-based check. Where a challenge is needed, offer an "
            "audio alternative and publish a second contact route — an email address, a phone "
            "number — that does not pass through it.",
            family="defect"))

    # ---- the label that only exists while the field is empty
    float_label = re.search(r":not\(:placeholder-shown\)[^{]*\{[^}]*(?:font-size|transform|"
                            r"opacity|top)|\.(?:filled|has-value|floating)[^{]*label[^{]*\{[^}]*"
                            r"font-size\s*:\s*(?:0?\.[0-5]\d*rem|[0-9]px|1[01]px)", low)
    if float_label:
        out.append(finding(
            path, first(r":not\(:placeholder-shown\)|floating|has-value"),
            "a label that shrinks or moves once the field has a value",
            "label-that-only-exists-while-empty", "medium",
            "Once there is a value the field's name is gone. A user reviewing a completed form, "
            "or returning to fix one error, cannot tell what any field is. The empty form is the "
            "only state a generator renders.",
            "Keep a persistent visible label above the field. If you keep a floating label, "
            "check its shrunken size and contrast against the same thresholds as any other text.",
            family="defect"))

    return out


# Manuscript and plotting-code surfaces. .tex and .bib were previously routed to
# analyze_prose, which read LaTeX commands as vocabulary; .R was not routed at
# all. A figure's defects are mostly checkable in the CODE that drew it, which is
# what makes this lane structural rather than a matter of squinting at pixels.
TEX_EXT = {".tex", ".bib", ".cls", ".sty", ".ltx"}
PLOT_EXT = {".py", ".r", ".rmd", ".ipynb", ".jl"}

# Cabanac/Labbe tortured phrases. These are evidence of word-level machine
# PARAPHRASING to evade text matching, not of LLM generation -- modern
# instruction-tuned models preserve technical terms. The remedy differs, so the
# distinction is kept in the finding text.
TORTURED = {
    "counterfeit consciousness": "artificial intelligence",
    "man-made brainpower": "artificial intelligence",
    "bosom peril": "breast cancer",
    "kidney disappointment": "kidney failure",
    "joined together states": "United States",
    "irregular esteem": "random value",
    "mean square blunder": "mean square error",
    "profound learning": "deep learning",
    "gullible bayes": "naive Bayes",
    "bolster vector machine": "support vector machine",
    "colossal information": "big data",
    "lung malignancy": "lung cancer",
}

CHAT_RESIDUE = (
    r"as an AI language model|I (?:do not|don't) have (?:access to|the ability)"
    r"|my (?:knowledge )?(?:cut[- ]?off|training data)(?: date)?"
    r"|as of my last (?:knowledge )?update|Regenerate response"
    r"|certainly[,!]? here (?:is|are)|I hope this helps"
    r"|as a large language model|I'm sorry,? but (?:I|as)"
)


def analyze_manuscript(path, text):
    """Research-paper surfaces: the manuscript and the referee report.

    A paper's sentences and its checkable commitments come out of the same
    machinery at the same confidence, and nothing in the finished artifact marks
    which is which. So every check here points OUTWARD at the world -- does this
    resolve, does the body contain the abstract's number -- rather than inward at
    style. Those cost an accused author nothing when they come back clean, which
    matters more here than anywhere else in this skill: the population most
    likely to leave a style marker in a manuscript is the one writing in its
    second language, and the cost of being wrong is a career rather than an edit.
    """
    out = []
    lines = mask_ignored(text.splitlines())
    text = "\n".join(lines)
    low = text.lower()

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l, re.I)), default)

    # ---- literal chatbot residue. Academ-AI documents 768 published documents
    # carrying this; first person 52.2%, cutoff disclaimers 43.9%.
    m = re.search(CHAT_RESIDUE, text, re.I)
    if m:
        out.append(finding(
            path, first(CHAT_RESIDUE), m.group(0)[:90],
            "chat-preamble-in-the-manuscript", "high",
            "Assistant scaffolding left in scholarly prose. This is machine residue with "
            "essentially no human source -- Academ-AI documents 768 published papers, "
            "proceedings and chapters carrying it, and fewer than one in twenty are ever "
            "corrected. It says nothing about the quality of the work and everything about "
            "the absence of a final read.",
            "Delete it, then read the paragraph it was sitting in, because the sentence it "
            "replaced may never have been written. Then check the venue's disclosure policy: "
            "of 56 publishers with a public AI policy, 82.1% require disclosure.",
            family="residue"))

    # ---- a paper addressed to a chat user rather than a reader
    if re.search(r"\b(?:as you\s+(?:can see|requested|mentioned)|you\s+(?:asked|wanted|said)|"
                 r"in your\s+(?:question|prompt|request)|let me know if)\b", low) \
       and re.search(r"\\begin\{abstract\}|\babstract\b|\bwe (?:present|propose|show)\b", low):
        out.append(finding(
            path, first(r"as you |you asked|in your (?:question|prompt)|let me know if"),
            "second person addressed to a requester, in a manuscript",
            "manuscript-addressed-to-the-user", "high",
            "A paper addresses a reader who is not in the room. Second person aimed at a "
            "requester is the conversational frame surviving the copy-paste; Academ-AI finds "
            "it in 11.3% of its documented cases.",
            "Rewrite in the register of the venue. If the sentence only makes sense as an "
            "answer to someone, it is not a finding and should go.",
            family="residue"))

    # ---- placeholder left in a reference or a heading
    if re.search(r"\[(?:Author|Title|Journal|Year|Citation|Reference|insert [^\]]{2,30})\]"
                 r"|\bAuthor et al\., Title, Journal, Year\b"
                 r"|\\cite\{(?:key|ref|citation|TODO|XXX)\}", text, re.I):
        out.append(finding(
            path, first(r"\[(?:Author|Title|Journal|Year|Citation)\]|\\cite\{(?:key|ref|TODO)"),
            "a template slot left unfilled in a reference or heading",
            "placeholder-token-left-in-a-reference-or-heading", "high",
            "The scaffold for a citation shipped in place of the citation. Unlike a style "
            "cue this is not an inference about anyone: the slot is empty and can be seen to "
            "be empty.",
            "Fill it or cut the sentence. Then verify the reference you fill it with, because "
            "a slot nobody filled is a slot nobody checked.",
            family="residue"))

    # ---- a referee report with nothing to point at
    # A referee report makes a recommendation to an editor. A document ABOUT
    # peer review describes one in the third person and makes none -- and this
    # skill's own reference files are exactly that, which is how the first
    # version of this check came to flag its own documentation.
    is_review = bool(re.search(r"\b(?:this (?:paper|manuscript|submission)|the authors)\b", low)) \
        and bool(re.search(r"\b(?:weakness(?:es)?|strengths?|soundness|rebuttals?)\b", low)) \
        and bool(re.search(r"\bI\s+(?:recommend|suggest|would\s+recommend|vote|lean)\b"
                           r"|\bmy\s+(?:recommendation|score|rating|assessment)\b"
                           r"|\brecommend\s+(?:major|minor|rejection|acceptance|revision)\b"
                           r"|\b(?:overall|confidence)\s+(?:score|rating)\b", text, re.I))
    if is_review and len(text.split()) > th("review-with-no-locator", "min_words", 150) \
       and not re.search(r"\b(?:line|l\.|p\.|page|section|sec\.|fig(?:ure)?\.?|table|eq(?:uation)?\.?)"
                         r"\s*\d|\bl\d+\b|§\s*\d", low):
        out.append(finding(
            path, 1,
            f"{len(text.split())} words of review with no line, page, figure, table or "
            f"section reference",
            "review-with-no-locator", "high",
            "A referee who read the paper points at it. A review that never cites a line, a "
            "figure or an equation is compatible with never having opened the submission, "
            "and it gives the authors nothing to act on. This is a property of the review's "
            "usefulness, not a claim about how it was written.",
            "Anchor every criticism to a locator. A weakness that cannot be pinned to a place "
            "in the paper is either not about this paper or not yet a weakness.",
            family="shape"))

    # ---- tortured phrases: paraphrase laundering, NOT generation
    hits = [(k, v) for k, v in TORTURED.items() if k in low]
    if hits:
        out.append(finding(
            path, first(re.escape(hits[0][0])),
            "; ".join(f'"{k}" for "{v}"' for k, v in hits[:4]),
            "tortured-phrase", "high",
            "A term of art replaced by a synonym-swapped near-miss. Widely repeated as an "
            "\"AI writing\" signal and it is NOT one: Cabanac and Labbe's mechanism is "
            "word-level machine paraphrasing used to evade text-matching plagiarism "
            "detection, and modern instruction-tuned models preserve technical terms. Getting "
            "this wrong gets the remedy wrong.",
            "Treat it as a plagiarism-laundering signal, not a generation signal: find the "
            "source text the passage was paraphrased FROM. The Problematic Paper Screener "
            "runs this over ~130 million publications weekly.",
            family="residue"))

    # ---- a hosted model used as an instrument, with no way to reproduce it
    if re.search(r"\b(?:gpt-?4|gpt-?3|chatgpt|claude|gemini|llama|mistral|qwen|deepseek)\b", low) \
       and re.search(r"\bwe (?:used|prompt|queried|asked|ran)\b|\bmodel was (?:used|queried)\b", low):
        miss = []
        if not re.search(r"\b(?:gpt-4[o0-9.\-]*\d{4}|20\d{2}-\d{2}-\d{2}|version\s+\d|"
                         r"-\d{4}(?:-\d{2}-\d{2})?)\b", low):
            miss.append("no pinned version or snapshot date")
        if not re.search(r"\btemperature\b|\btop[_\- ]?p\b|\bseed\b|\bmax[_\- ]?tokens\b", low):
            miss.append("no inference parameters")
        if not re.search(r"\bprompt(?:s)?\b[^.]{0,60}(?:appendix|supplement|available|verbatim|"
                         r"listed|table)|\bfull prompt", low):
            miss.append("no prompt text")
        if re.search(r"latest (?:model|version|release)", low):
            miss.append('"latest model release" instead of a version')
        if len(miss) >= th("model-used-as-an-instrument-with-no-version-date-or-parameters",
                           "min_gaps", 2):
            out.append(finding(
                path, first(r"gpt-?4|chatgpt|claude|gemini|llama|we used|we prompted"),
                "; ".join(miss),
                "model-used-as-an-instrument-with-no-version-date-or-parameters", "high",
                "A hosted model used as a measuring device, reported in a way nobody can "
                "reproduce. Not a text tell at all -- it is a methods defect, fully checkable "
                "from the methods section, and it carries no fairness cost. Of 640 manually "
                "coded LLM-for-software-engineering papers, 32.2% had versioning problems "
                "including the literal phrase \"latest model release\", 199 gave no prompt "
                "templates, 88 documented no inference parameters, and only 13.3% were clean.",
                "Pin the snapshot, state temperature, top_p and seed, put the prompts verbatim "
                "in an appendix, and say how many times you ran it. Temperature zero removes "
                "deliberate sampling but not variation from silent model updates, so a date "
                "is part of the method.",
                family="defect"))

    return out


def analyze_plotting_code(path, text):
    """Scientific figures, checked in the code that drew them.

    The insight that makes this lane structural: a figure is produced by code,
    and the render sits on the other side of a step the author never watched. So
    the generator commits to savefig() without ever seeing that the legend is on
    the data, the ticks are clipped, or 10pt became 2.9pt in an 89mm column. Most
    of that is greppable in the .py or .R. None of it is evidence about
    authorship: the honest word is UNREVIEWED.
    """
    out = []
    lines = mask_ignored(text.splitlines())
    text = "\n".join(lines)
    low = text.lower()
    plots = bool(re.search(r"matplotlib|pyplot|\bplt\.|seaborn|\bsns\.|ggplot|geom_|"
                           r"\bggsave\b|plotly|altair", low))
    if not plots:
        return out

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l, re.I)), default)

    # ---- savefig at the default dpi
    if re.search(r"\b(?:plt\.|fig\.)?savefig\s*\(", low) \
       and not re.search(r"savefig\s*\([^)]*\bdpi\s*=", low) \
       and not re.search(r"savefig\.dpi|rcParams\[[\"']savefig\.dpi", low):
        out.append(finding(
            path, first(r"savefig\s*\("),
            "savefig() with no dpi",
            "savefig-at-the-default-dpi", "high",
            "savefig.dpi defaults to 'figure' and figure.dpi to 100, so the default "
            "6.4x4.8 figure is written at 640x480 pixels. That is about 183 ppi at Nature's "
            "89mm column and falls below PLOS's stated 789px minimum figure width outright. "
            "Nothing in the code or the notebook preview shows it; the journal's checker does.",
            "Pass dpi=300 for raster, or save vector -- savefig('fig.pdf') -- which is what "
            "most journals actually want for line art.",
            family="defect"))

    # ---- a figure sized for a monitor, not a column
    for m in re.finditer(r"figsize\s*=\s*\(\s*([\d.]+)\s*,\s*([\d.]+)", low):
        w = float(m.group(1))
        if w > th("figsize-not-matched-to-the-column-width", "max_inches", 7.5):
            eff = 10.0 * 3.50 / w
            out.append(finding(
                path, text[:m.start()].count("\n") + 1,
                f"figsize width {w}in; 10pt type lands at about {eff:.1f}pt in an 89mm column",
                "figsize-not-matched-to-the-column-width", "high",
                "Type size in a figure is set by the ratio of the declared size to the "
                "printed width, and nobody does that arithmetic. Nature's single column is "
                "89mm (3.50in) and wants 5-7pt; PLOS caps width at 7.5in and wants 8-12pt. A "
                "round monitor-shaped aspect ratio is the corroborating signature.",
                "Set figsize to the actual column width and choose type in points from there. "
                "Then print it at 100% and read it.",
                family="defect"))
            break

    # ---- no layout manager, so the labels are cut off
    risky = re.search(r"rotation\s*=|set_xticklabels|subplots\s*\(\s*[2-9]|colorbar\(", low)
    if risky and not re.search(r"tight_layout|constrained_layout|bbox_inches\s*=\s*[\"']tight"
                               r"|autolayout", low):
        out.append(finding(
            path, first(r"rotation\s*=|subplots\s*\(|colorbar\("),
            "rotated or multi-panel axes with no layout manager",
            "no-layout-manager-so-labels-are-clipped", "high",
            "figure.constrained_layout.use and figure.autolayout both default to False, so "
            "long tick labels, rotated categories and colourbars are written outside the "
            "canvas and silently cropped. The notebook preview often shows them because it "
            "saves with bbox_inches='tight'; the file on disk does not.",
            "Pass constrained_layout=True to subplots(), or bbox_inches='tight' to savefig(). "
            "Then open the saved file rather than the preview.",
            family="defect"))

    # ---- a perceptually non-uniform colormap chosen explicitly
    m = re.search(r"cmap\s*=\s*[\"'](jet|rainbow|hsv|nipy_spectral|gist_rainbow)[\"']"
                  r"|scale_(?:colour|color|fill)_gradientn", low)
    if m:
        out.append(finding(
            path, first(r"cmap\s*=|gradientn"), m.group(0)[:60],
            "rainbow-or-jet-colormap-on-continuous-data", "medium",
            "A rainbow ramp is not perceptually uniform: it invents boundaries where the data "
            "is smooth and hides differences where it is not, and it collapses in greyscale "
            "and for colour-vision deficiency. Note this is about an EXPLICIT choice -- "
            "matplotlib's default has been viridis since 2.0 and is correct.",
            "Use a perceptually uniform map: viridis, magma, cividis. For diverging data use "
            "a diverging map with a defined midpoint. Crameri's testable criterion is whether "
            "the colour map distorts more than about 7% of the displayed data variation.",
            family="defect"))

    # ---- error bars whose meaning is never stated
    if re.search(r"\byerr\s*=|\bxerr\s*=|geom_errorbar|errorbar\s*\(|capsize\s*=", low) \
       and not re.search(r"\bs\.?d\.?\b|standard deviation|\bs\.?e\.?m\.?\b|standard error|"
                         r"confidence interval|\bci\b|\biqr\b|interquartile", low):
        out.append(finding(
            path, first(r"yerr\s*=|geom_errorbar|errorbar\s*\("),
            "error bars drawn with no statement of what they represent",
            "error-bars-of-undeclared-type", "high",
            "An error bar is uninterpretable until you know whether it is SD, SEM, a "
            "confidence interval or an IQR, and the same picture supports opposite readings. "
            "This is a join failure checkable with no image at all: the code draws them and "
            "the caption defines nothing. Across 441 articles in three cardiovascular "
            "journals, 64% had at least one incorrect use of SEM, and in 81% of those the "
            "authors had explicitly said in Methods they were using it descriptively.",
            "State it in the caption -- \"mean +/- s.d., n = 12\" -- and prefer showing the "
            "points. SEM is not a descriptive statistic and shrinks with n, which is why it "
            "is the one most often reached for.",
            family="defect"))

    # ---- the legend the library placed
    if re.search(r"\blegend\s*\(\s*\)|\blegend\s*\(\s*loc\s*=\s*[\"']best[\"']", low):
        out.append(finding(
            path, first(r"legend\s*\("),
            "legend left at loc='best'",
            "legend-left-in-the-default-best-position", "medium",
            "'best' minimises overlap for the data present when it runs, so the legend moves "
            "when the data changes and lands on the points in the version that gets "
            "submitted. It is the default because it is safe on average, not because it is "
            "right for this figure.",
            "Place it deliberately, or put it outside the axes with bbox_to_anchor, or drop "
            "it and label the series directly on the plot, which is almost always better.",
            family="form"))

    # ---- scatter drawn at full opacity over itself
    if re.search(r"\bscatter\s*\(|geom_point\s*\(", low) \
       and not re.search(r"\balpha\s*=|geom_hex|geom_bin2d|rasterized\s*=|\bs\s*=\s*\d", low):
        out.append(finding(
            path, first(r"scatter\s*\(|geom_point\s*\("),
            "scatter with no alpha and no density treatment",
            "overplotted-scatter-at-full-opacity", "medium",
            "At full opacity a dense scatter shows the outline of the data and hides its "
            "density, so the middle of the distribution -- usually the finding -- is a solid "
            "block. The library has no way to know how many points arrive.",
            "Set alpha, or switch to a hexbin or 2-D density for large n. Say n in the "
            "caption so the reader knows what the block contains.",
            family="defect"))

    # ---- the offset text nobody chose
    if re.search(r"matplotlib|\bplt\.", low) \
       and not re.search(r"useoffset|ticklabel_format|ScalarFormatter|set_major_formatter", low) \
       and re.search(r"\b\d{6,}\b|e[+-]?0[5-9]|1e\d", low):
        out.append(finding(
            path, first(r"\d{6,}|e[+-]?0[5-9]|1e\d"),
            "large-magnitude data with the default offset formatter left on",
            "axis-offset-and-exponent-left-on", "medium",
            "axes.formatter.useoffset defaults True and the limits to -5,6, so matplotlib "
            "puts a bare '1e7' or '+1.234e3' in the corner of the axes. It is the purest "
            "literal tool residue in this lane: nobody chose it, most readers misread the "
            "axis without it, and a tight crop for the manuscript deletes it entirely.",
            "plt.ticklabel_format(useOffset=False, style='plain'), or scale the data and say "
            "so in the axis label -- \"Reads (millions)\".",
            family="residue"))

    # ---- a chart type that cannot carry the comparison
    m = re.search(r"\.pie\s*\(|geom_bar[^)]*coord_polar|projection\s*=\s*[\"']3d[\"']"
                  r"|mplot3d|bar3d", low)
    if m:
        out.append(finding(
            path, first(r"\.pie\s*\(|coord_polar|3d"), m.group(0)[:40],
            "pie-or-three-d-chart-for-a-quantitative-comparison", "medium",
            "Angle and volume are the two encodings people read worst. A 3-D bar adds "
            "perspective distortion on top, so the same bar reads differently depending where "
            "it sits in the plot, and occlusion hides the back row entirely.",
            "Use position on a common scale: a bar chart for parts of a whole, a dot plot for "
            "comparisons. Keep 3-D only where the third dimension is real data the reader "
            "must rotate.",
            family="defect"))

    # ---- stars with no test behind them
    if re.search(r"[\"']\*{1,3}[\"']|\bn\.?s\.?[\"']|significance|stat_compare_means|"
                 r"add_stat_annotation", low) \
       and not re.search(r"\bt-?test|mann-?whitney|wilcoxon|anova|kruskal|chi-?squared?|"
                         r"fisher|bonferroni|holm|tukey|dunn|benjamini", low):
        out.append(finding(
            path, first(r"\*{1,3}[\"']|significance|stat_compare_means"),
            "significance annotation with no named test",
            "significance-stars-with-no-test-named", "high",
            "A star says a threshold was crossed and not which one, by what test, with what "
            "correction, at what n. All four change what the star means, and with multiple "
            "panels the correction is usually the part that was skipped.",
            "Name the test, the correction and the n in the caption. Prefer the exact p and "
            "an effect size over the star.",
            family="defect"))

    return out


# Template slots that ship in real submissions. A closed literal list is
# defensible here for the same reason it was in the UI-strings lane: the surface
# is tiny and enumerable, and none of these strings has a legitimate use.
TEMPLATE_RESIDUE = [
    r"Conference acronym\s*'?XX", r"Woodstock,\s*NY", r"David S\.~?Hippocampus",
    r"Given Name Surname", r"email address or ORCID",
    r"Paper Title \(use style: paper title\)", r"XXXXX-XXXX",
    r"\\author\{(?:Anonymous|Author Name|First Author|Your Name)\}",
    r"Trovato.{0,20}Tobin", r"\\institution\{Institution\}",
]


def analyze_latex(path, text):
    """LaTeX source, treated as a program nobody in the loop has run.

    The tell is never that it failed to compile -- it is that it COMPILED and
    nobody opened the PDF. That predicts the whole lane: generated .tex reaches
    for LaTeX's VISUAL layer (\\\\, \\vspace, \\textbf, a typed-out "Figure 1")
    over its SEMANTIC layer (\\label/\\ref, \\emph, \\cite, \\section), because
    the visual layer is the only one verifiable from the token stream alone. A
    counter has no value until TeX assigns one, so a generator writes the number
    it can already see.

    Ten items in this lane are `defect` and reproducible by compiling. The rest
    are craft, and this lane makes NO claim that any of it is commoner in
    generated than hand-written LaTeX -- the largest mined corpus of real LaTeX
    faults is a taxonomy of human faults with the same top categories.
    """
    out = []
    lines = mask_ignored(text.splitlines())
    text = "\n".join(lines)
    # Strip comments before counting markup, but keep them for the residue check.
    body = re.sub(r"(?<!\\)%.*$", "", text, flags=re.M)
    low = body.lower()

    def first(pat, default=1):
        return next((i + 1 for i, l in enumerate(lines)
                     if re.search(pat, l)), default)

    # ---- a cross-reference typed as a digit
    m = re.search(r"(?<!\\)\b(?:Figure|Fig\.|Table|Section|Sec\.|Equation|Eq\.|Algorithm)"
                  r"\s+\d+(?![.\d])", body)
    if m and not re.search(r"\\(?:begin\{verbatim|lstlisting)", low):
        n = len(re.findall(r"(?<!\\)\b(?:Figure|Fig\.|Table|Section|Sec\.|Equation|Eq\.|"
                           r"Algorithm)\s+\d+(?![.\d])", body))
        out.append(finding(
            path, text[:m.start()].count("\n") + 1,
            f'{n} hardcoded cross-reference(s), e.g. "{m.group(0)}"',
            "hardcoded-cross-reference-number", "high",
            "The purest instance of this lane's mechanism: a counter has no value until TeX "
            "assigns one, so the number that gets written is the one already visible in the "
            "draft. It is correct exactly until something is inserted above it, and then it "
            "is silently wrong everywhere.",
            "Give the float a \\label and cite it with \\ref, tied with a non-breaking space: "
            "Figure~\\ref{fig:waits}. TeXtidote ships this rule as sh:hcfig.",
            family="defect"))

    # ---- a font DECLARATION used as if it took an argument
    m = re.search(r"\\(bfseries|itshape|ttfamily|sffamily|rmfamily|slshape|scshape|"
                  r"tiny|small|large|Large|LARGE|huge|Huge)\s*\{", body)
    if m:
        out.append(finding(
            path, text[:m.start()].count("\n") + 1, m.group(0),
            "font-declaration-used-as-command", "high",
            "A declaration takes no argument: \\bfseries{word} sets the brace group AND "
            "everything after it until the enclosing group ends, so the rest of the section "
            "goes bold. It is visible on the page and invisible in the source, which is "
            "exactly the failure mode of source nobody rendered.",
            "Use the command form: \\textbf{word}, \\textit{word}, \\texttt{word}. Keep the "
            "declaration only where you mean it to persist, inside its own group.",
            family="defect"))

    # ---- LaTeX 2.09 markup, deprecated for thirty years
    old = sorted(set(re.findall(r"\\(?:bf|it|rm|sl|tt|sc)\b(?!\w)", body))
                 | set(re.findall(r"\\begin\{eqnarray\*?\}", body))
                 | set(re.findall(r"\$\$", body)))
    if old:
        out.append(finding(
            path, first(r"\\(?:bf|it|rm|sl|tt|sc)\b|eqnarray|\$\$"),
            "; ".join(old[:5]),
            "obsolete-two-oh-nine-markup", "medium",
            "Markup superseded in 1994 and documented as obsolete in l2tabu. $$...$$ is plain "
            "TeX and gives wrong vertical spacing under amsmath; eqnarray has spacing bugs "
            "the AMS environments fixed. It persists because thirty years of examples using "
            "it are still on the web, which is also why a model reproduces it.",
            "\\[ ... \\] for display maths, align or gather from amsmath for multi-line, and "
            "\\textbf / \\textit for fonts.",
            family="form"))

    # ---- negative vertical space, usually to hit a page limit
    neg = re.findall(r"\\vspace\*?\{\s*-[\d.]+\s*(?:pt|mm|cm|in|em|ex|baselineskip)\}", body)
    if len(neg) >= th("negative-vspace-to-hit-page-limit", "min_count", 2):
        out.append(finding(
            path, first(r"\\vspace\*?\{\s*-"),
            f"{len(neg)} negative \\vspace(s), e.g. {neg[0]}",
            "negative-vspace-to-hit-page-limit", "medium",
            "Squeezing the page by hand. It defeats the class file's vertical rhythm, it "
            "moves under any change to the text above it, and several venues require the "
            "template's standard spacing -- ACL's own checker measures the resulting margins "
            "rather than the source.",
            "Cut words instead. Where space is genuinely needed, adjust the document's "
            "spacing parameters once in the preamble rather than per-instance.",
            family="form"))

    # ---- every float pinned exactly here
    h = re.findall(r"\\begin\{(?:figure|table|algorithm)\*?\}\s*\[H?h!?\]|\[H\]", body)
    hard = [x for x in h if "H" in x or "!" in x]
    if len(hard) >= th("every-float-pinned-here", "min_count", 3):
        out.append(finding(
            path, first(r"\[H\]|\[h!\]"),
            f"{len(hard)} float(s) pinned with [H] or [h!]",
            "every-float-pinned-here", "medium",
            "Fighting the float algorithm rather than using it. Pinning every float produces "
            "half-empty pages and pushes text into gaps, and [H] needs the float package "
            "besides. The generator pins because it cannot see where the float would have "
            "gone.",
            "Let LaTeX place them: [tbp] is the usual answer. Reserve [H] for the rare case "
            "where the float genuinely must interrupt the text, such as a code listing being "
            "walked through line by line.",
            family="form"))

    # ---- a reference with no tie, so the number can start a line
    loose = re.findall(r"(?<![~\\{])\s\\(?:ref|cite|eqref|autoref)\{", body)
    tied = re.findall(r"~\\(?:ref|cite|eqref|autoref)\{", body)
    if len(loose) >= th("missing-tie-before-ref-and-cite", "min_count", 3) and len(loose) > len(tied):
        out.append(finding(
            path, first(r"\s\\(?:ref|cite)\{"),
            f"{len(loose)} reference(s) with a breakable space, {len(tied)} tied",
            "missing-tie-before-ref-and-cite", "low",
            "A plain space lets TeX break the line between the word and its number, so a page "
            "can end with \"see Figure\" and the next begin with \"3\". It is invisible until "
            "the text reflows, which is to say invisible to anyone who did not look at the "
            "PDF.",
            "Use a non-breaking space: Figure~\\ref{fig:x}, \\cite is usually preceded by one "
            "too. TeXtidote ships this as sh:nobreak.",
            family="form"))

    # ---- tables built from rules rather than from structure
    if re.search(r"\\begin\{tabular\}\s*\{[^}]*\|", body) \
       and not re.search(r"\\toprule|\\midrule|\\bottomrule|booktabs", low):
        out.append(finding(
            path, first(r"\\begin\{tabular\}\s*\{[^}]*\|"),
            "tabular with vertical rules and no booktabs",
            "vertical-rules-and-full-grid-tables", "medium",
            "The full grid is the spreadsheet's default, not the typographer's. The booktabs "
            "manual states the rule flatly: never use vertical rules, and never use double "
            "rules. A generator reproduces the grid because grids are what tables look like "
            "in the corpus it learned from.",
            "Load booktabs and use \\toprule, \\midrule, \\bottomrule with no vertical rules "
            "at all. Let alignment and space do the separating.",
            family="form"))

    # ---- hyperref loaded too early
    if "hyperref" in low:
        pkgs = re.findall(r"\\usepackage(?:\[[^\]]*\])?\{([^}]*)\}", body)
        flat = [p.strip() for g in pkgs for p in g.split(",")]
        if "hyperref" in flat and flat.index("hyperref") < len(flat) - 1:
            after = [p for p in flat[flat.index("hyperref") + 1:]
                     if p not in {"cleveref", "algorithm2e", "glossaries", "bookmark"}]
            if after:
                out.append(finding(
                    path, first(r"\\usepackage(?:\[[^\]]*\])?\{[^}]*hyperref"),
                    f"hyperref loaded before {', '.join(after[:4])}",
                    "hyperref-load-order-violation", "medium",
                    "hyperref redefines a large number of internal commands and must load "
                    "near-last so that it patches what is already there. Loaded early it is "
                    "silently overwritten by later packages, and the failure is broken links "
                    "in the PDF rather than an error at compile time.",
                    "Load hyperref last, with cleveref the documented exception that goes "
                    "after it.",
                    family="defect"))

    # ---- a bibliography typed out by hand
    if re.search(r"\\begin\{thebibliography\}", body) \
       and not re.search(r"\\bibliography\{|\\addbibresource|\\printbibliography", body):
        n = len(re.findall(r"\\bibitem", body))
        out.append(finding(
            path, first(r"\\begin\{thebibliography\}"),
            f"{n} hand-written \\bibitem entries, no .bib file",
            "hand-rolled-bibliography", "medium",
            "Entries typed rather than generated, so nothing checks them against a database "
            "and nothing enforces a consistent style. This is the highest-yield place in a "
            "manuscript to verify references, because no tool has looked at them.",
            "Move them into a .bib and cite with \\cite. Then verify each entry resolves -- "
            "and check the least-cited ones first, since fidelity of generated references "
            "tracks how often the cited work is cited.",
            family="shape"))

    # ---- template slots that shipped
    hits = [m.group(0) for pat in TEMPLATE_RESIDUE
            for m in [re.search(pat, text, re.I)] if m]
    if hits:
        out.append(finding(
            path, first("|".join(TEMPLATE_RESIDUE)),
            "; ".join(hits[:4]),
            "conference-template-residue", "high",
            "The venue's own placeholder text, still in place. These strings have no "
            "legitimate use and they reach arXiv, ResearchGate and submitted PDFs regularly. "
            "A closed literal list is defensible here because the surface is tiny and "
            "enumerable, unlike prose.",
            "Replace every one. Then check the rest of the front matter, because a template "
            "slot nobody filled usually has siblings.",
            family="residue"))

    # ---- a macro used and never defined (fatal)
    defined = set(re.findall(r"\\(?:new|renew|provide)command\*?\{?\\(\w+)", body))
    defined |= set(re.findall(r"\\DeclareMathOperator\*?\{?\\(\w+)", body))
    defined |= set(re.findall(r"\\def\\(\w+)", body))
    used = set(re.findall(r"\\([a-zA-Z]{3,})\b", body))
    KNOWN = set("""documentclass usepackage begin end section subsection subsubsection
        paragraph textbf textit texttt emph label ref cite eqref autoref caption
        includegraphics centering item newpage clearpage footnote title author date
        maketitle bibliography bibliographystyle newcommand renewcommand providecommand
        def input include appendix tableofcontents hspace vspace textwidth linewidth
        columnwidth frac sqrt sum prod int left right mathrm mathbf mathcal text
        alpha beta gamma delta theta lambda sigma mu nu pi rho tau phi psi omega
        times cdot leq geq neq approx sim infty partial nabla forall exists
        toprule midrule bottomrule multicolumn multirow cmidrule textsc textsf
        footnotesize scriptsize normalsize selectfont bibitem thebibliography
        printbibliography addbibresource DeclareMathOperator operatorname
        newtheorem theoremstyle qquad quad noindent par relax phantom hfill vfill
        color textcolor colorbox fcolorbox href url texorpdfstring
        institution affiliation email orcid keywords abstract acks
        subfigure subcaption includepdf pagestyle thispagestyle setlength
        renewcommandx mathbb mathfrak mathscr boldsymbol overline underline
        widehat widetilde xrightarrow xleftarrow substack binom
        qty SI si num unit ang celsius percent
        cref Cref crefname autoref nameref pageref
        maketitlesupplementary onecolumn twocolumn makeatletter makeatother""".split())
    undef = sorted(u for u in used - defined - KNOWN
                   if re.search(r"\\" + re.escape(u) + r"\b", body)
                   and not re.search(r"\\usepackage[^}]*\b" + re.escape(u), body)
                   and len(u) > 3 and u.islower() and "_" not in u)
    # Only report when the file looks self-contained (it has a documentclass),
    # because a fragment legitimately uses macros defined in its parent.
    if undef and re.search(r"\\documentclass", body) \
       and len(undef) >= th("macro-used-but-never-defined", "min_count", 2):
        shown = ", ".join("\\" + u for u in undef[:5])
        out.append(finding(
            path, first(r"\\" + re.escape(undef[0])),
            f"{len(undef)} command(s) used but not defined here or loaded by a package: "
            f"{shown}",
            "macro-used-but-never-defined", "medium",
            "A command that resolves to nothing at all. This is a compile-reproducible defect "
            "rather than an inference about anyone, and it is the commonest LaTeX failure in "
            "both human and generated source -- so treat it as a build error, not a tell.",
            "Run the file and read the log: Undefined control sequence names it. Then either "
            "define it, load the package that provides it, or delete the call.",
            family="defect"))

    # ---- a float labelled and never referred to
    labels = set(re.findall(r"\\label\{((?:fig|tab|alg|lst):[^}]+)\}", body))
    refs = set(re.findall(r"\\(?:ref|autoref|cref|Cref|pageref)\{([^}]+)\}", body))
    orphan = sorted(labels - refs)
    if orphan:
        out.append(finding(
            path, first(r"\\label\{" + re.escape(orphan[0])),
            f"{len(orphan)} float(s) never referenced in the text: {', '.join(orphan[:4])}",
            "float-never-referenced-in-text", "medium",
            "A figure or table the prose never points at. LaTeX places floats by reference, "
            "so an unreferenced float drifts wherever the algorithm likes, and most venues "
            "require every float to be discussed. A one-directional check for dangling \\ref "
            "cannot find this; it needs the set difference the other way.",
            "Refer to it, or cut it. If the text does not need to point at it, ask whether "
            "the reader needs it.",
            family="defect"))

    return out


def analyze_file(path, base=None):
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return [finding(path, 0, str(e), "unreadable", "low", f"Could not read {path}.")]
    suffix = path.suffix.lower()
    if suffix == ".json":
        # An i18n catalog is a string table, not prose. Nothing else in the
        # bundle reads .json, so this is the only route to it.
        return analyze_ui_strings(path, text)
    if suffix in MARKUP_EXT:
        text = mask_markup_ignored(text)
        text = mask_markup_ignored(text, "/*", "*/")
    if suffix not in {".html", ".htm"}:
        text = "\n".join(mask_ignored(text.splitlines()))
    if suffix in MARKUP_EXT:
        res = (analyze_markup(path, text) + analyze_web_build(path, text)
               + analyze_app_surfaces(path, text) + analyze_ui_strings(path, text)
               + analyze_motion(path, text) + analyze_forms(path, text))
        if suffix in {".html", ".htm"}:
            res += analyze_prose(path, strip_markup(text), suffix, base,
                                 from_markup=True)
            tracking = HtmlUrlTracking()
            tracking.feed(text)
            tracking.close()
            if tracking.count:
                res.append(tracking_param_finding(path, tracking.first_line, tracking.count))
        if suffix in CODE_EXT:
            res += analyze_code(path, text)
        return res
    if suffix in PLOT_EXT and suffix not in CODE_EXT:
        # .R and .Rmd are not in CODE_EXT and were unrouted entirely.
        return analyze_plotting_code(path, text)
    if suffix in CODE_EXT:
        res = analyze_code(path, text)
        if suffix in PLOT_EXT:
            res += analyze_plotting_code(path, text)
        # The send call, the PDF export and the price formatter are rarely near
        # the markup, so a plain .js or .ts file needs these checks too.
        if suffix in JS_FAMILY:
            # A motion timeline and a form's validity logic are as likely to sit
            # in a plain .ts module as in the component that renders the markup.
            res += (analyze_app_surfaces(path, text) + analyze_ui_strings(path, text)
                    + analyze_motion(path, text) + analyze_forms(path, text))
        return res
    if suffix in TEX_EXT:
        # A .tex file is markup, so its prose has to be read with the commands
        # stripped. Routing it straight at analyze_prose counted \usepackage as
        # vocabulary and scored the paper on it.
        res = analyze_manuscript(path, text) + analyze_latex(path, text)
        res += analyze_prose(path, strip_markup(text), suffix, base, from_markup=True)
        res += list(staccato_findings(path, text, suffix))
        return res
    res = analyze_prose(path, text, suffix or ".txt", base)
    if suffix in {".md", ".mdx"}:
        res += analyze_docs_markdown(path, text) + analyze_manuscript(path, text)
    return res


# ------------------------------------------------------------------- report

FAMILY_NOTE = {
    "residue": "possible unconverted artifact — verify context before editing",
    "form": "grammatical form — measured effect sizes, but humans do this too",
    "rhythm": "rhythm cue — weak alone; meaningful only against this author's baseline",
}


def render_report(findings, out_path, title="Humanize review", base=None):
    for f in findings:
        if f.get("severity") not in VALID_SEV:
            f["severity"] = "low"
    findings = sorted(findings, key=lambda f: (SEV_ORDER.get(f.get("severity"), 3),
                                               str(f.get("file", "")), str(f.get("line", 0))))
    counts = {s: sum(1 for f in findings if f.get("severity") == s) for s in VALID_SEV}
    rows = []
    for n, f in enumerate(findings, 1):
        rw, sev = f.get("rewrite") or "", f.get("severity", "low")
        fam = f.get("family", "")
        rows.append(f"""
      <tr class="sev-{html.escape(sev)}">
        <td class="num">{n}</td>
        <td><span class="sev">{html.escape(sev)}</span></td>
        <td class="ism">{html.escape(str(f.get('ism','')))}<div class="dialect">{html.escape(str(f.get('dialect','')))} &middot; {html.escape(str(f.get('layer','judge')))}{(' &middot; ' + html.escape(fam)) if fam else ''}</div></td>
        <td class="loc">{html.escape(Path(str(f.get('file',''))).name)}:{html.escape(str(f.get('line','')))}</td>
        <td class="body"><del>{html.escape(str(f.get('excerpt','')))}</del>
          <div class="why">{html.escape(str(f.get('explanation','')))}</div>
          {f'<ins>{html.escape(str(rw))}</ins>' if rw else ''}</td>
      </tr>""")
    bnote = (f"Rhythm signals were scored against a baseline of {base['files']} file(s), "
             f"{base['words']:,} words of this author's own writing."
             if base else
             "No baseline corpus was supplied, so every rhythm signal below is capped at "
             "low severity. Pass --baseline with the author's own prior writing to make "
             "those findings mean something.")
    doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
  /* Deliberately not the AI default look: no Inter, no indigo, nothing under
     14px. If this report looked generated, nothing in it would land. */
  :root {{ --ink:#1a1714; --paper:#faf7f2; --rule:#d8d0c2; --accent:#8a3324;
           --high:#8a3324; --medium:#9a6a00; --low:#4a5d49; }}
  html {{ font-size: 16px; }}
  body {{ font-family: Georgia, 'Times New Roman', serif; background: var(--paper);
         color: var(--ink); margin: 0; padding: 3rem 4vw; line-height: 1.55; }}
  h1 {{ font-size: 2rem; font-weight: normal; margin: 0 0 .25rem; }}
  .kicker {{ font-family: Menlo, monospace; font-size: .875rem; font-weight: 700;
            letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }}
  .summary {{ font-size: 1rem; margin: .75rem 0 1rem; max-width: 66ch; }}
  .caveat {{ font-size: .9375rem; margin: 0 0 2rem; max-width: 66ch;
            border-left: 3px solid var(--accent); padding-left: .9rem; color: #4a443c; }}
  table {{ width: 100%; border-collapse: collapse; background: #fff;
          border: 1px solid var(--rule); font-size: .9375rem; }}
  th {{ font-family: Menlo, monospace; font-size: .875rem; text-transform: uppercase;
       letter-spacing: .08em; text-align: left; padding: .6rem .7rem;
       border-bottom: 2px solid var(--ink); }}
  td {{ padding: .65rem .7rem; border-bottom: 1px solid var(--rule); vertical-align: top; }}
  td.num {{ font-family: Menlo, monospace; color: #6b655c; }}
  .sev {{ font-family: Menlo, monospace; font-size: .875rem; font-weight: 700;
         text-transform: uppercase; }}
  tr.sev-high .sev {{ color: var(--high); }}
  tr.sev-medium .sev {{ color: var(--medium); }}
  tr.sev-low .sev {{ color: var(--low); }}
  td.ism {{ font-family: Menlo, monospace; font-size: .875rem; }}
  .dialect {{ color: #6b655c; font-size: .875rem; margin-top: .15rem; }}
  td.loc {{ font-family: Menlo, monospace; font-size: .875rem; white-space: nowrap; }}
  del {{ background: #f6e3df; text-decoration-color: var(--high); display: inline-block;
        padding: .05rem .2rem; }}
  ins {{ background: #e7eee4; text-decoration: none; display: block; margin-top: .4rem;
        padding: .3rem .45rem; border-left: 3px solid var(--low); }}
  .why {{ font-size: .9375rem; color: #4a443c; margin-top: .35rem; }}
  footer {{ margin-top: 2rem; font-family: Menlo, monospace; font-size: .875rem;
           color: #6b655c; max-width: 74ch; line-height: 1.5; }}
</style></head><body>
<div class="kicker">make_copy_and_media_human &middot; line-item fix plan</div>
<h1>{html.escape(title)}</h1>
<p class="summary"><strong>{len(findings)}</strong> findings &mdash;
  {counts['high']} high, {counts['medium']} medium, {counts['low']} low.
  Struck text is the tell as found; the inset block is the proposed fix.</p>
<p class="caveat">These are editing cues, not proof of authorship. Because AI
  detectors are biased toward &ldquo;human,&rdquo; a flag here is more likely to
  be an unusual person &mdash; a non-native speaker, an autistic writer, someone
  who simply loves dashes &mdash; than a caught machine. Every fix below is worth
  making either way, which is the only claim this report makes. {html.escape(bnote)}</p>
<table>
  <thead><tr><th>#</th><th>Sev</th><th>Ism</th><th>Where</th><th>Finding &rarr; fix</th></tr></thead>
  <tbody>{''.join(rows) if rows else '<tr><td colspan=5>No findings. Either clean, or the judge pass has not run.</td></tr>'}</tbody>
</table>
<footer>generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%MZ')} &middot; structural
layer measures countable signals only; phrase-level tropes come from the model judge
pass. Thresholds are read from references/catalog.json. Families:
residue = {FAMILY_NOTE['residue']}; form = {FAMILY_NOTE['form']}; rhythm = {FAMILY_NOTE['rhythm']}.
</footer>
</body></html>"""
    out_path.write_text(doc, encoding="utf-8")
    return out_path


# ------------------------------------------------------------ self-checking

# humanize:ignore-start -- fixtures below are deliberate specimens
SELFTEST = """# 🚀 Why Our Platform Wins

## 📈 The Opportunity

It's not just a tool. Tight. Focused. Relentless. Fast. Clean. Sharp. Ready.

> The future belongs to those who automate it.

**Speed:** blazing fast.
**Scale:** infinitely elastic.
**Security:** enterprise-grade.
**Joy:** developer-first.

Input → Pipeline → Magic → Revenue

---

Some text.

---

More text.

---

## Challenges and Future Directions

Despite its growth, the platform faces challenges.
"""

SELFTEST_CODE = """
def get_user_name(user_id):
    \"\"\"Get the user name for the user id.\"\"\"
    # increment the counter
    counter += 1
    # fetch the user from the database
    user = fetch_user_from_database(user_id)
    try:
        return user.name
    except KeyError:
        pass
"""

# Real human prose. If a detector fires on this, the detector is wrong: it will
# train people to ignore the whole report, which is worse than shipping nothing.
# A clean, hand-written LaTeX paper. It is here because the placeholder detector
# once scored it HIGH off `\\usepackage{amsmath}` -- every single-brace group read
# as an unfilled template token. A confident accusation on the most ordinary
# possible input in its domain is the exact failure this catalog exists to
# prevent, so the regression is asserted rather than remembered.
SELFTEST_CLEAN_TEX = (
    "\\documentclass[11pt]{article}\n"
    "\\usepackage{amsmath}\n"
    "\\usepackage{graphicx}\n"
    "\\title{A Study of Port Allocation Under Contention}\n"
    "\\begin{document}\n"
    "\\maketitle\n"
    "\\begin{abstract}\n"
    "We measure how a port broker behaves when many agents request at once. "
    "Across 4,096 trials the median wait fell from 180ms to 12ms once the lease "
    "table moved into shared memory. The remaining tail is dominated by fsync.\n"
    "\\end{abstract}\n"
    "\\section{Introduction}\n"
    "Port conflicts are the commonest failure in multi-agent development. We ran "
    "the broker against a synthetic load and recorded every grant. "
    "Table~\\ref{tab:results} lists the runs. Nothing here depends on the "
    "operating system beyond the clock.\n"
    "\\end{document}\n")


# Reference documentation. Heading density is the CORRECT structure here --
# readers arrive by search and leave immediately -- and heading-spam's own
# false_positive_when has always said so. It scored this medium anyway, because
# the caveat was printed and never implemented.
SELFTEST_CLEAN_REFDOC = (
    "# pd lease\n\nClaim, renew and release port leases.\n\n"
    "## pd lease claim\n\nTakes a port and holds it until the TTL expires or you "
    "release it.\n\n    pd lease claim 5173 --ttl 600\n\n"
    "Exits 3 if another owner holds the port, and prints that owner to stderr.\n\n"
    "## pd lease renew\n\nExtends a lease you already hold. Fails if the lease "
    "expired while you were away, because a lapsed lease may have been taken by "
    "someone else.\n\n    pd lease renew 5173\n\n"
    "## pd lease release\n\nDrops the lease. Idempotent: releasing a port you do "
    "not hold succeeds.\n\n    pd lease release 5173\n\n"
    "## pd lease ls\n\nLists live leases with the seconds remaining on each.\n\n"
    "## Exit codes\n\n    0  ok\n    3  contention\n    4  no such lease\n")


SELFTEST_CLEAN = (
    "We shipped the migration on a Tuesday and it went badly for about forty "
    "minutes. The read replicas in us-east-1 lagged behind the primary, so a "
    "handful of customers saw stale invoice totals for a while. Nobody lost "
    "money. We caught it because Tomasz happened to be looking at the wrong "
    "dashboard at the right moment, which is not a control I want to rely on "
    "again. The fix was three lines in the connection pool config, but finding "
    "it took most of the afternoon, and I'm still not sure we understand why "
    "the lag spiked when it did. What I do know is that our alerting never "
    "fired once. That's the part that worries me going into the bigger cutover "
    "in March, and it's why I've asked Priya to rebuild the replica-lag alert "
    "before we touch anything else.\n")


# humanize:ignore-end


def analyze_file_text(path, text):
    """Run the dispatch over in-memory text, as analyze_file does for a real file.

    The selftest needs this so a regression is caught on the route a user's file
    actually takes, not on whichever single analyzer the test happened to call.
    """
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        f = Path(d) / path.name
        f.write_text(text, encoding="utf-8")
        return analyze_file(f)


def run_selftest():
    got = {f["ism"] for f in analyze_prose(Path("t.md"), SELFTEST, ".md")}
    got |= {f["ism"] for f in analyze_code(Path("t.py"), SELFTEST_CODE)}
    got |= {f["ism"] for f in analyze_prose(
        Path("l.md"), "As an AI language model, I cannot browse the internet.\n", ".md")}
    got |= {f["ism"] for f in analyze_prose(
        Path("i.md"), "A sentence — with residue. See https://x.org/a?utm_source=chatgpt.com\n", ".md")}
    need = {"emoji-section-headers", "unattributed-floating-quote", "bold-label-colon-bullet",
            "arrow-chain-as-explanation", "staccato-fragment-triplet", "horizontal-rule-spam",
            "challenges-and-future-directions", "comment-narrates-next-line",
            "swallow-exception-pass", "docstring-restates-signature", "as-an-ai-leakage",
            "invisible-unicode-artifacts", "tracking-param-residue"}
    print("selftest findings:", " ".join(sorted(got)))
    missing = need - got
    if missing:
        print("MISSING:", " ".join(sorted(missing)))
        return 1
    noise = {f["ism"] for f in analyze_prose(Path("c.md"), SELFTEST_CLEAN, ".md")}
    if noise:
        print("FALSE POSITIVES on human prose:", " ".join(sorted(noise)))
        return 1
    tex_noise = {f["ism"] for f in analyze_file_text(Path("c.tex"), SELFTEST_CLEAN_TEX)}
    if tex_noise:
        print("FALSE POSITIVES on a clean LaTeX paper:", " ".join(sorted(tex_noise)))
        return 1
    ref_noise = {f["ism"] for f in analyze_file_text(Path("c.md"), SELFTEST_CLEAN_REFDOC)}
    if ref_noise:
        print("FALSE POSITIVES on reference documentation:", " ".join(sorted(ref_noise)))
        return 1

    # --baseline is the load-carrying claim of this script, so it gets asserted
    # rather than demonstrated. Three properties have to hold together:
    #   1. a rhythm signal stays LOW with no baseline, whatever its absolute rate
    #   2. the same signal escalates to HIGH against a baseline it far exceeds
    #   3. an author scored against their OWN writing produces nothing
    # Property 3 is the one that matters: it is what stops this skill flagging
    # someone for writing the way they always write.
    dashy = ("We shipped it on a Tuesday \u2014 a bad Tuesday \u2014 and the replicas lagged "
             "\u2014 badly \u2014 behind the primary. Nobody lost money \u2014 we caught it early "
             "\u2014 but the alerting never fired \u2014 not once \u2014 which is the part that "
             "worries me. The fix was small \u2014 three lines \u2014 and finding it took "
             "hours \u2014 most of an afternoon \u2014 because we were looking at the wrong "
             "graph \u2014 the queue depth \u2014 the entire time. I still do not know "
             "\u2014 genuinely \u2014 why the lag spiked when it did.\n") * 3
    calm = ("We shipped the migration on a Tuesday and it went badly for about forty "
            "minutes. The read replicas lagged behind the primary, so a handful of "
            "customers saw stale invoice totals. Nobody lost money. We caught it "
            "because Tomasz happened to be looking at the wrong dashboard, which is "
            "not a control I want to rely on again. The fix was three lines in the "
            "connection pool config. Finding it took most of the afternoon, and I am "
            "still not sure we understand why the lag spiked when it did.\n") * 3

    def sev_of(text, base, ism="em-dash-density"):
        return next((f["severity"] for f in analyze_prose(Path("x.md"), text, ".md", base)
                     if f["ism"] == ism), None)

    calm_base = prose_metrics(calm, ".md")
    base = {"files": 1, "words": calm_base["words"],
            **{k: v for k, v in calm_base.items() if k != "words"}}

    no_base = sev_of(dashy, None)
    if no_base != "low":
        print(f"BASELINE TEST: dash-heavy text with no baseline should be 'low', got {no_base!r}")
        return 1
    with_base = sev_of(dashy, base)
    if with_base != "high":
        print(f"BASELINE TEST: dash-heavy text against a calm baseline should be "
              f"'high', got {with_base!r}")
        return 1
    own = [f["ism"] for f in analyze_prose(Path("x.md"), calm, ".md", base)
           if f.get("family") == "rhythm"]
    if own:
        print("BASELINE TEST: an author scored against their own writing produced "
              "rhythm findings:", " ".join(own))
        return 1

    print("selftest OK (all tells caught; zero false positives on the clean sample; "
          "--baseline escalates low->high on a real delta and stays silent on self)")
    return 0


def run_validate():
    if not CATALOG_NAMES:
        print("catalog not found at", CATALOG_PATH)
        return 1
    src = Path(__file__).read_text(encoding="utf-8")
    emitted = set(re.findall(r'"([a-z][a-z0-9]*(?:-[a-z0-9]+){1,6})",\s*\n?\s*"(?:high|medium|low)"', src))
    emitted |= set(re.findall(r'"([a-z][a-z0-9]*(?:-[a-z0-9]+){1,6})",\s*$', src, re.M)) & set(DEFAULT_THRESHOLDS)
    emitted |= set(DEFAULT_THRESHOLDS)
    emitted -= {"unreadable"}
    unknown = sorted(n for n in emitted if n not in CATALOG_NAMES)
    print(f"catalog: {len(CATALOG_NAMES)} items - script emits/uses {len(emitted)} ism ids")
    if unknown:
        print("NOT IN CATALOG:", " ".join(unknown))
        return 1
    no_th = sorted(n for n in DEFAULT_THRESHOLDS if not _CAT_TH.get(n))
    if no_th:
        print(f"note: {len(no_th)} ism(s) have no catalog thresholds, using bundled "
              f"fallback: {' '.join(no_th)}")

    # Every generated reference prints "Every item carries a False positive when
    # line. Read it before you act on the item." 51 items once satisfied that by
    # saying "Not yet characterized", which honours the sentence and misses the
    # point: this field is what stands between a finding and an accusation, and
    # it only does that if somebody actually answered the question.
    placeholder = re.compile(r"^\s*(?:not yet characteri[sz]ed|tbd|n/?a|unknown|"
                             r"todo)\b", re.I)
    thin = sorted(i["name"] for i in CATALOG.get("items", [])
                  if not (i.get("false_positive_when") or "").strip()
                  or placeholder.match(i["false_positive_when"])
                  or len(i["false_positive_when"].split()) < 8)
    if thin:
        print(f"NO USABLE false_positive_when ON {len(thin)} ITEM(S): {' '.join(thin)}")
        print("Every item needs a real answer to 'who legitimately writes this way?'. "
              "That field is what keeps a finding from becoming an accusation.")
        return 1

    # SKILL.md tells the judge pass to handle "every item whose detection_type is
    # structural but which the script does not implement". That instruction was
    # unactionable, because nothing said which those are -- the agent would have
    # had to grep this file. Report the split so the queue is a number, not a
    # research task. This is a SPLIT, not a gap: detection_type says what kind of
    # evidence settles an item, never that this bundle automates it.
    # A "](" anywhere in a catalog string becomes markdown link syntax the moment
    # the generator writes it into a reference file, and the repo's doc-citation
    # guard then reads what follows as a relative link target. `[0-9](ms|us|...)`
    # is an ordinary regex and a broken link at the same time, and it failed CI.
    # Mirror the repo's doc-citation guard: a URL, anchor, mailto or site-absolute
    # target is fine and common (a badge image is `![build](https://...)`). What
    # breaks is a RELATIVE target, which is what `[0-9](ms|us|...)` looks like.
    _md = re.compile(r"\]\(\s*(?!https?:|mailto:|tel:|#|/)([^)\s]+)")
    md_link = [f"{i['name']}.{k}" for i in CATALOG.get("items", [])
               for k, v in i.items() if isinstance(v, str) and _md.search(v)]
    if md_link:
        print(f"MARKDOWN LINK SYNTAX IN {len(md_link)} CATALOG STRING(S): "
              f"{' '.join(md_link)}")
        print("`](` becomes a relative link once this is written into a reference "
              "file. Write the regex so a character class is not immediately "
              "followed by a group -- \\d(?:a|b) rather than [0-9](a|b).")
        return 1

    implemented = implemented_ids()
    mech = [i for i in CATALOG.get("items", [])
            if i.get("detection_type") in ("structural", "rendered")]
    todo = [i["name"] for i in mech if i["name"] not in implemented]
    print(f"of {len(mech)} mechanically-decidable item(s), "
          f"{len(mech) - len(todo)} are implemented by these scripts and "
          f"{len(todo)} are for the judge pass to ask by hand "
          f"(each is marked in the generated references)")
    print("validate OK")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="*", help="files to review (md, txt, html, css, tsx, py...)")
    ap.add_argument("--baseline", action="append", default=[], metavar="GLOB",
                    help="the author's own known-human writing; repeatable. Rhythm "
                         "signals are scored as a delta against this instead of against "
                         "a universal threshold. Strongly recommended.")
    ap.add_argument("--findings", help="JSON findings from the model judge pass to merge")
    ap.add_argument("--out", default="humanize-report.html")
    ap.add_argument("--title", default="Humanize review")
    ap.add_argument("--json", help="also dump merged findings JSON here")
    ap.add_argument("--fail-on", choices=["high", "medium", "low", "none"], default="none",
                    help="exit 1 if any finding at or above this severity")
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--validate", action="store_true",
                    help="check that every ism id resolves to a catalog item")
    ap.add_argument("--provenance", action="store_true",
                    help="report which tool published these files and stop. Writes no report, "
                         "because provenance is not a finding: it says what made the page, "
                         "never who wrote it or whether it is any good.")
    args = ap.parse_args()

    if args.selftest:
        sys.exit(run_selftest())
    if args.validate:
        sys.exit(run_validate())
    if args.provenance and not args.files:
        ap.error("--provenance needs at least one file to scan")
    if not args.files and not args.findings:
        ap.error("no input: pass at least one file, or --findings from the judge pass. "
                 "Refusing to write an empty report that would read as 'clean'.")

    missing = [f for f in args.files if not Path(f).exists()]
    if missing:
        print("error: no such file(s): " + ", ".join(missing), file=sys.stderr)
        sys.exit(2)

    if args.provenance:
        sys.exit(scan_provenance(args.files))

    base = None
    if args.baseline:
        paths = [p for g in args.baseline for p in sorted(globmod.glob(g, recursive=True))]
        base = build_baseline(paths)
        if base is None:
            print(f"error: --baseline matched no readable prose (tried {len(paths)} path(s))",
                  file=sys.stderr)
            sys.exit(2)
        print(f"baseline: {base['files']} file(s), {base['words']:,} words")

    findings = []
    for f in args.files:
        findings += analyze_file(Path(f), base)
    escalate_docs_openers(findings)

    if args.findings:
        try:
            ext = json.loads(Path(args.findings).read_text(encoding="utf-8"))
        except Exception as e:
            print(f"error: could not read {args.findings}: {e}", file=sys.stderr)
            sys.exit(2)
        if not isinstance(ext, list):
            print(f"error: {args.findings} must be a JSON array of finding objects, got "
                  f"{type(ext).__name__}", file=sys.stderr)
            sys.exit(2)
        for i, f in enumerate(ext):
            if not isinstance(f, dict):
                print(f"error: {args.findings}[{i}] is not an object", file=sys.stderr)
                sys.exit(2)
            f.setdefault("layer", "judge")
            if CATALOG_NAMES and f.get("ism") and f["ism"] not in CATALOG_NAMES:
                print(f"warning: {args.findings}[{i}] ism '{f['ism']}' is not in the catalog",
                      file=sys.stderr)
        findings += ext

    if args.json:
        Path(args.json).write_text(json.dumps(findings, indent=2), encoding="utf-8")
    out = render_report(findings, Path(args.out), title=args.title, base=base)
    print(f"wrote {out} ({len(findings)} findings)")

    if args.fail_on != "none":
        bar = SEV_ORDER[args.fail_on]
        hits = [f for f in findings if SEV_ORDER.get(f.get("severity"), 3) <= bar]
        if hits:
            print(f"FAIL: {len(hits)} finding(s) at or above severity '{args.fail_on}'",
                  file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
