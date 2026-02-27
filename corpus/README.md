# Corpus Distillation Pipeline

Extracts expert knowledge from professional books using a three-pass hierarchical pipeline.

## Quick Start

```bash
# Install dependencies
pip install anthropic pymupdf python-docx

# Set your API key
export ANTHROPIC_API_KEY=sk-ant-...

# Distill a single book
python corpus/scripts/distill.py corpus/books/some-book.pdf --output-mode knowledge-map

# Distill all books in a directory
python corpus/scripts/distill.py corpus/books/ --output-mode skill-draft

# Summary only (cheapest, ~$0.04 per 300 pages)
python corpus/scripts/distill.py corpus/books/some-book.pdf --output-mode summary
```

## Output Modes

| Mode | Passes | Cost (300 pages) | Output |
|------|--------|-----------------|--------|
| `summary` | Pass 1 only (Haiku) | ~$0.04 | Concatenated chunk summaries |
| `knowledge-map` | Pass 1 + 2 (Haiku + Sonnet) | ~$0.09 | Structured JSON knowledge map |
| `skill-draft` | Pass 1 + 2 + 3 (Haiku + Sonnet + Sonnet) | ~$0.14 | SKILL.md draft ready for skill-architect |

## Directory Structure

```
corpus/
├── books/          # Input: PDF, DOCX, MD files (you add these)
├── output/         # Output: extractions, knowledge maps, skill drafts
├── scripts/
│   └── distill.py  # The pipeline script
└── README.md       # This file
```

## How It Works

### Pass 1: Haiku Army (Parallel Extraction)
- Splits book into ~4K token chunks with 500-token overlap
- Deploys one Haiku call per chunk in parallel (10 concurrent by default)
- Each extracts: summary, claims, processes, decisions, failures, aha moments, metaphors, temporal patterns, quotes, domain terms
- A 300-page book completes Pass 1 in ~3 seconds wall-clock

### Pass 2: Sonnet Synthesis
- Feeds all Pass 1 extractions into Sonnet
- Merges, deduplicates, and structures into a knowledge map
- Output: concepts, processes, expertise patterns, temporal evolution, metaphors, anti-patterns, vocabulary

### Pass 3: Skill Draft (Optional)
- Takes the knowledge map and produces a SKILL.md
- Follows the skill-architect template
- Decision trees, anti-patterns with Novice/Expert template, temporal markers
- Grade with skill-grader before deploying

## Adding Your Books

Put PDF, DOCX, or Markdown files in `corpus/books/`. The pipeline handles all three formats.

Watch file sizes for git:
- Under 100MB total: just `git add` and push
- Over 100MB: use Git LFS (`git lfs track "*.pdf"`)
- Or add `corpus/books/` to `.gitignore` and manage locally
```

## Cost Estimates

| Book Size | Pages | Chunks | Pass 1 | Pass 2 | Pass 3 | Total |
|-----------|-------|--------|--------|--------|--------|-------|
| Article | 10 | 4 | $0.004 | $0.01 | $0.05 | $0.064 |
| Chapter | 30 | 10 | $0.01 | $0.02 | $0.05 | $0.08 |
| Handbook | 300 | 38 | $0.04 | $0.05 | $0.05 | $0.14 |
| Textbook | 800 | 100 | $0.10 | $0.10 | $0.05 | $0.25 |
```
