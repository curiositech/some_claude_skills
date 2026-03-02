#!/usr/bin/env python3
"""
Corpus Distillation Pipeline

Three-pass hierarchical extraction of expert knowledge from books:
  Pass 1: Haiku army (parallel) — chunk extraction
  Pass 2: Sonnet synthesis — hierarchical binary merge
  Pass 3: Opus refinement — skill draft or recipe generation

V1 (default): flat extraction prompt → mechanical merge → SKILL.md
V2 (--v2):     adaptive 5-family probes → FOCUS sensemaking merge → recipe directory

Usage:
  python distill.py <input-file> [--output-mode summary|knowledge-map|skill-draft]
  python distill.py <input-file> --v2 --output-mode skill-draft  # V2 recipe pipeline
  python distill.py corpus/books/ --v2                            # Batch V2

Supports: PDF, DOCX, Markdown, EPUB, MHTML, Pages, plain text
Requires: pip install anthropic pymupdf python-docx beautifulsoup4

Cost estimate: V1 ~$0.12/book, V2 ~$0.18/book (adaptive probes + richer output)
"""

import sys
import os
import json
import asyncio
import argparse
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional
import httpx

# Load API key: one canonical .env at project root, override stale session vars
try:
    from dotenv import load_dotenv
    _project_root = Path(__file__).resolve().parent.parent.parent  # some_claude_skills/
    load_dotenv(_project_root / ".env", override=True)
except ImportError:
    pass  # python-dotenv not installed, rely on shell environment

# Import hierarchical merge strategies
try:
    from merge_strategies import pass2_hierarchical
    HIERARCHICAL_AVAILABLE = True
except ImportError:
    HIERARCHICAL_AVAILABLE = False
    print("[WARN] merge_strategies.py not found, hierarchical merge unavailable")

# Import topic index for multi-turn lookup
try:
    from build_topic_index import load_index, OUTPUT_FILE as TOPIC_INDEX_PATH
    TOPIC_INDEX_AVAILABLE = True
except ImportError:
    TOPIC_INDEX_AVAILABLE = False
    TOPIC_INDEX_PATH = None

# Import V2 adaptive probes
try:
    from probes import ADAPTIVE_EXTRACTION_PROMPT, build_extraction_prompt, normalize_v2_extraction
    V2_AVAILABLE = True
except ImportError:
    V2_AVAILABLE = False

# ============================================================================
# Logging Utility
# ============================================================================

def log(msg):
    """Print with immediate flush for background tasks."""
    print(msg, flush=True)
    sys.stdout.flush()


def repair_json(text: str) -> dict:
    """Attempt to parse JSON with common LLM output repairs.

    Handles: trailing commas, unescaped newlines in strings, markdown fences.
    """
    import re

    # Strip markdown fences
    if '```' in text:
        text = re.sub(r'```(?:json)?\s*', '', text)

    # Find the JSON object
    start = text.find('{')
    end = text.rfind('}') + 1
    if start < 0 or end <= start:
        return None
    text = text[start:end]

    # First try: direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Remove trailing commas before } or ]
    cleaned = re.sub(r',\s*([}\]])', r'\1', text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Replace unescaped control characters in strings
    cleaned = re.sub(r'[\x00-\x1f]', ' ', cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    return None

# ============================================================================
# Text Extraction
# ============================================================================

def extract_text_from_pdf(path: str) -> str:
    """Extract text from PDF using PyMuPDF (fitz)."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("Install PyMuPDF: pip install pymupdf")
        sys.exit(1)
    
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n\n"
    doc.close()
    return text


def extract_text_from_docx(path: str) -> str:
    """Extract text from DOCX."""
    try:
        from docx import Document
    except ImportError:
        print("Install python-docx: pip install python-docx")
        sys.exit(1)
    
    doc = Document(path)
    return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text_from_mhtml(path: str) -> str:
    """Extract text from MHTML (web archive) files."""
    import email
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("Install BeautifulSoup: pip install beautifulsoup4")
        sys.exit(1)
    
    raw = Path(path).read_bytes()
    # MHTML is MIME-encoded; parse as email message
    msg = email.message_from_bytes(raw)
    
    html_parts = []
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            if ct == 'text/html':
                charset = part.get_content_charset() or 'utf-8'
                payload = part.get_payload(decode=True)
                if payload:
                    html_parts.append(payload.decode(charset, errors='replace'))
            elif ct == 'text/plain' and not html_parts:
                charset = part.get_content_charset() or 'utf-8'
                payload = part.get_payload(decode=True)
                if payload:
                    html_parts.append(payload.decode(charset, errors='replace'))
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or 'utf-8'
            html_parts.append(payload.decode(charset, errors='replace'))
    
    full_html = "\n".join(html_parts)
    
    if '<html' in full_html.lower() or '<body' in full_html.lower():
        soup = BeautifulSoup(full_html, 'html.parser')
        # Remove script, style, nav, footer elements
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            tag.decompose()
        text = soup.get_text(separator='\n\n', strip=True)
    else:
        text = full_html
    
    return text


def extract_text_from_pages(path: str) -> str:
    """Extract text from Apple Pages files (.pages is a zip archive)."""
    import zipfile
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("Install BeautifulSoup: pip install beautifulsoup4")
        sys.exit(1)
    
    text_parts = []
    
    try:
        with zipfile.ZipFile(path, 'r') as z:
            names = z.namelist()
            
            # Pages stores content in index.xml or Document.xml or preview text
            # Try multiple known locations
            for candidate in ['index.xml', 'Index/Document.iwa', 'preview.pdf']:
                if candidate in names:
                    if candidate.endswith('.pdf'):
                        # Extract the preview PDF to a temp file and read it
                        import tempfile
                        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
                            tmp.write(z.read(candidate))
                            tmp_path = tmp.name
                        text = extract_text_from_pdf(tmp_path)
                        os.unlink(tmp_path)
                        return text
                    elif candidate.endswith('.xml'):
                        xml_content = z.read(candidate).decode('utf-8', errors='replace')
                        soup = BeautifulSoup(xml_content, 'html.parser')
                        text_parts.append(soup.get_text(separator='\n\n', strip=True))
            
            # Fallback: try to find any XML or text content
            if not text_parts:
                for name in names:
                    if name.endswith('.xml') or name.endswith('.txt'):
                        try:
                            content = z.read(name).decode('utf-8', errors='replace')
                            if len(content) > 100:  # Skip tiny metadata files
                                soup = BeautifulSoup(content, 'html.parser')
                                extracted = soup.get_text(separator='\n', strip=True)
                                if len(extracted) > 50:
                                    text_parts.append(extracted)
                        except Exception:
                            continue
            
            # Last resort: try the preview PDF if it exists under any path
            if not text_parts:
                for name in names:
                    if 'preview' in name.lower() and name.endswith('.pdf'):
                        import tempfile
                        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
                            tmp.write(z.read(name))
                            tmp_path = tmp.name
                        text = extract_text_from_pdf(tmp_path)
                        os.unlink(tmp_path)
                        if text.strip():
                            return text
    except zipfile.BadZipFile:
        raise ValueError(f"File {path} is not a valid .pages (zip) archive")
    
    if not text_parts:
        raise ValueError(
            f"Could not extract text from {path}. "
            "Apple Pages .iwa format is proprietary. "
            "Please export as PDF or DOCX from Pages and re-add."
        )
    
    return "\n\n".join(text_parts)


def extract_text_from_epub(path: str) -> str:
    """Extract text from EPUB file."""
    try:
        from ebooklib import epub
        from bs4 import BeautifulSoup
    except ImportError:
        print("Install libraries: pip install ebooklib beautifulsoup4")
        sys.exit(1)

    book = epub.read_epub(path)
    text_parts = []

    for item in book.get_items():
        if item.get_type() == 9:  # EBOOKLIB_TYPE_DOCUMENT
            content = item.get_content().decode('utf-8', errors='replace')
            soup = BeautifulSoup(content, 'html.parser')
            # Remove scripts, styles, and navigation
            for tag in soup(['script', 'style', 'nav']):
                tag.decompose()
            text = soup.get_text(separator='\n', strip=True)
            if text.strip():
                text_parts.append(text)

    if not text_parts:
        raise ValueError(f"Could not extract text from EPUB: {path}")

    return "\n\n".join(text_parts)


def extract_text(path: str) -> str:
    """Extract text from any supported format."""
    ext = Path(path).suffix.lower()
    if ext == '.pdf':
        return extract_text_from_pdf(path)
    elif ext == '.docx':
        return extract_text_from_docx(path)
    elif ext in ('.md', '.txt', '.text'):
        return Path(path).read_text(encoding='utf-8', errors='replace')
    elif ext == '.mhtml':
        return extract_text_from_mhtml(path)
    elif ext == '.pages':
        return extract_text_from_pages(path)
    elif ext == '.epub':
        return extract_text_from_epub(path)
    elif ext in ('.htm', '.html'):
        try:
            from bs4 import BeautifulSoup
        except ImportError:
            print("Install BeautifulSoup: pip install beautifulsoup4")
            sys.exit(1)
        html = Path(path).read_text(encoding='utf-8', errors='replace')
        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(['script', 'style', 'nav', 'footer']):
            tag.decompose()
        return soup.get_text(separator='\n\n', strip=True)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Supported: .pdf, .docx, .md, .txt, .mhtml, .pages, .html")


# ============================================================================
# Chunking
# ============================================================================

def count_tokens_approx(text: str) -> int:
    """Approximate token count (1 token ≈ 4 chars for English)."""
    return len(text) // 4


def semantic_chunk(text: str, max_tokens: int = 4000, overlap_tokens: int = 500, total_chars: int = 0) -> list[dict]:
    """Split text into overlapping chunks on paragraph boundaries.

    Args:
        text: Full text to chunk
        max_tokens: Maximum tokens per chunk
        overlap_tokens: Overlap between chunks
        total_chars: Total characters in document (for position estimation)

    Returns:
        List of chunks with provenance metadata
    """
    max_chars = max_tokens * 4
    overlap_chars = overlap_tokens * 4

    paragraphs = text.split('\n\n')
    chunks = []
    current = ""
    chunk_id = 0
    char_position = 0

    for para in paragraphs:
        if count_tokens_approx(current + para) > max_tokens and current:
            # Estimate page number (assume 2500 chars/page)
            approx_page = char_position // 2500 + 1
            chunks.append({
                "id": chunk_id,
                "text": current.strip(),
                "tokens": count_tokens_approx(current),
                "char_start": char_position,
                "char_end": char_position + len(current),
                "approx_page": approx_page,
            })
            chunk_id += 1
            # Overlap: keep the tail of the previous chunk
            current = current[-overlap_chars:] + "\n\n" + para
        else:
            current += "\n\n" + para if current else para

        char_position += len(para) + 2  # +2 for newlines

    if current.strip():
        approx_page = char_position // 2500 + 1
        chunks.append({
            "id": chunk_id,
            "text": current.strip(),
            "tokens": count_tokens_approx(current),
            "char_start": char_position,
            "char_end": char_position + len(current),
            "approx_page": approx_page,
        })

    return chunks


# ============================================================================
# Pass 1: Haiku Extraction (Parallel)
# ============================================================================

EXTRACTION_PROMPT = """You are extracting structured knowledge from a book chunk for a knowledge engineering pipeline.

Analyze this text and extract the following. Return ONLY valid JSON, no markdown fences.

{
  "summary": "2-3 sentence summary of this section",
  "key_claims": ["list of factual claims or assertions"],
  "processes": ["any step-by-step procedures described"],
  "decisions": ["any decision points or heuristics mentioned"],
  "failures": ["any failures, mistakes, or anti-patterns described"],
  "aha_moments": ["any insights, realizations, or conceptual breakthroughs"],
  "metaphors": ["any metaphors or mental models used"],
  "temporal": ["any 'things changed when...' or 'before X, after Y' patterns"],
  "quotes": [
    {"text": "exact quote from text", "context": "1-sentence context explaining significance"}
  ],
  "domain_terms": ["domain-specific vocabulary or jargon"],
  "examples": [
    {"description": "what the example illustrates", "details": "key details of the example"}
  ]
}

CRITICAL:
- Preserve quotes VERBATIM (exact text from source)
- Include at least 1-3 significant quotes if present
- Capture concrete examples with enough detail for later citation

If a category has no relevant content, use an empty array [].

TEXT TO ANALYZE:
"""


async def extract_chunk(client, chunk: dict, semaphore: asyncio.Semaphore) -> dict:
    """Extract knowledge from a single chunk using Haiku."""
    async with semaphore:
        try:
            response = await client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=2000,
                messages=[{
                    "role": "user",
                    "content": EXTRACTION_PROMPT + chunk["text"][:16000]  # Safety limit
                }]
            )
            
            text = response.content[0].text.strip()
            # Parse JSON with repair for common LLM issues
            extraction = repair_json(text)
            if extraction is None:
                extraction = {"summary": text[:500], "parse_error": True}
            
            # Add provenance metadata to extraction
            extraction["_source"] = {
                "chunk_id": chunk["id"],
                "approx_page": chunk.get("approx_page", 0),
                "char_range": f"{chunk.get('char_start', 0)}-{chunk.get('char_end', 0)}"
            }

            return {
                "chunk_id": chunk["id"],
                "extraction": extraction,
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            }
        except Exception as e:
            return {
                "chunk_id": chunk["id"],
                "extraction": {"error": str(e)},
                "input_tokens": 0,
                "output_tokens": 0,
            }


async def pass1_extract(client, chunks: list[dict], max_concurrent: int = 10) -> list[dict]:
    """Pass 1: Parallel Haiku extraction across all chunks."""
    semaphore = asyncio.Semaphore(max_concurrent)
    tasks = [extract_chunk(client, chunk, semaphore) for chunk in chunks]
    results = await asyncio.gather(*tasks)
    return sorted(results, key=lambda r: r["chunk_id"])


# ============================================================================
# Pass 1 V2: Adaptive Probe Extraction (Parallel)
# ============================================================================

async def extract_chunk_v2(client, chunk: dict, semaphore: asyncio.Semaphore) -> dict:
    """Extract knowledge from a single chunk using adaptive probes (V2)."""
    async with semaphore:
        try:
            prompt = build_extraction_prompt()  # No structural hint in lean V2
            response = await client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=3000,  # V2 output is richer
                messages=[{
                    "role": "user",
                    "content": prompt + chunk["text"][:16000]
                }]
            )

            text = response.content[0].text.strip()

            # Parse JSON with repair
            raw_extraction = repair_json(text)
            if raw_extraction is None:
                raw_extraction = {"chunk_summary": text[:500], "parse_error": True, "_raw_text": text}

            # Normalize V2 families → flat structure for merge pipeline
            if not raw_extraction.get("parse_error"):
                extraction = normalize_v2_extraction(raw_extraction)
                extraction["_raw_families"] = raw_extraction  # Keep original for debugging
            else:
                extraction = raw_extraction

            # Add provenance metadata
            extraction["_source"] = {
                "chunk_id": chunk["id"],
                "approx_page": chunk.get("approx_page", 0),
                "char_range": f"{chunk.get('char_start', 0)}-{chunk.get('char_end', 0)}"
            }

            return {
                "chunk_id": chunk["id"],
                "extraction": extraction,
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            }
        except Exception as e:
            return {
                "chunk_id": chunk["id"],
                "extraction": {"error": str(e)},
                "input_tokens": 0,
                "output_tokens": 0,
            }


async def pass1_extract_v2(client, chunks: list[dict], max_concurrent: int = 10) -> list[dict]:
    """Pass 1 V2: Parallel adaptive probe extraction across all chunks."""
    semaphore = asyncio.Semaphore(max_concurrent)
    tasks = [extract_chunk_v2(client, chunk, semaphore) for chunk in chunks]
    results = await asyncio.gather(*tasks)
    return sorted(results, key=lambda r: r["chunk_id"])


# ============================================================================
# Pass 2: Sonnet Synthesis
# ============================================================================

SYNTHESIS_PROMPT = """You are synthesizing extracted knowledge from multiple book chunks into a structured knowledge map.

You will receive chunk-level extractions from a book. Merge, deduplicate, and organize them into this structure. Return ONLY valid JSON.

{
  "document_summary": "1-2 paragraph executive summary of the entire book's key contributions",
  
  "core_concepts": [
    {"concept": "name", "definition": "what it means", "relationships": ["connects to X because..."]}
  ],
  
  "processes": [
    {"name": "process name", "steps": ["ordered steps"], "decision_points": ["choices"], "common_mistakes": ["what goes wrong"]}
  ],
  
  "expertise_patterns": [
    {"pattern": "what experts do differently", "novice_mistake": "what novices do", "aha_moment": "the bridging insight"}
  ],
  
  "temporal_evolution": [
    {"period": "date range", "paradigm": "what was believed", "change_trigger": "what caused shift"}
  ],
  
  "key_metaphors": [
    {"metaphor": "how practitioners think about X", "maps_to": "the underlying structure"}
  ],
  
  "anti_patterns": [
    {"name": "anti-pattern name", "description": "what it looks like", "why_wrong": "fundamental reason", "fix": "correct approach"}
  ],
  
  "notable_quotes": ["direct quotes worth preserving"],
  
  "domain_vocabulary": [
    {"term": "word", "definition": "what it means in this domain"}
  ]
}

CHUNK EXTRACTIONS:
"""


async def pass2_synthesize(
    client,
    extractions: list[dict],
    use_hierarchical: bool = False,
    use_multi_turn: bool = False,
    topic_index: dict = None,
    source_name: str = None,
) -> dict:
    """
    Pass 2: Sonnet merges all extractions into a knowledge map.

    Args:
        client: Anthropic client
        extractions: List of Pass 1 chunk extractions
        use_hierarchical: Use hierarchical binary merge (recommended for >20 chunks)
        use_multi_turn: Use multi-turn evidence lookup (reduces context, improves quality)
        topic_index: Pre-loaded topic index for multi-turn lookup
        source_name: Source name filter for multi-turn lookup

    Returns:
        Dict with knowledge_map, input_tokens, output_tokens, actual_cost
    """
    if use_hierarchical and HIERARCHICAL_AVAILABLE:
        # Use new hierarchical merge (solves context limits)
        return await pass2_hierarchical(
            client,
            extractions,
            use_cache=True,
            use_multi_turn_lookup=use_multi_turn,
            topic_index=topic_index,
            source_name=source_name,
        )

    # Fallback: original flat merge (may hit context limits with >50 chunks)
    log(f"   Using flat merge (legacy)")

    # Prepare extraction summaries for Sonnet
    extraction_text = json.dumps(
        [e["extraction"] for e in extractions if "error" not in e.get("extraction", {})],
        indent=1
    )

    # If too long, truncate (Sonnet has 200K context but let's be reasonable)
    if len(extraction_text) > 150000:
        log(f"   [WARN] Truncating extraction text ({len(extraction_text)} chars)")
        extraction_text = extraction_text[:150000] + "\n... (truncated)"

    response = await client.messages.create(
        model="claude-sonnet-4-5",  # Fixed: Sonnet 4.5 is the latest
        max_tokens=8000,
        messages=[{
            "role": "user",
            "content": SYNTHESIS_PROMPT + extraction_text
        }]
    )

    text = response.content[0].text.strip()
    try:
        start = text.find('{')
        end = text.rfind('}') + 1
        knowledge_map = json.loads(text[start:end])
    except (json.JSONDecodeError, ValueError):
        knowledge_map = {"raw_synthesis": text, "parse_error": True}

    return {
        "knowledge_map": knowledge_map,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
    }


# ============================================================================
# Pass 3: Opus Skill Draft (Optional)
# ============================================================================

SKILL_DRAFT_PROMPT = """You are skill-architect. Using this knowledge map extracted from a professional book, create a SKILL.md following the standard template.

The skill should encode the book's expertise as:
- Decision trees in the Core Process (not prose)
- Anti-patterns with Novice/Expert/Timeline template  
- Temporal knowledge with dates
- Mental models and metaphors as shibboleths

Follow this template:
---
name: [lowercase-hyphenated from book topic]
description: [What] [When] [Keywords]. NOT for [Exclusions].
allowed-tools: Read
---

# [Skill Name]
[One sentence purpose derived from the book]

## When to Use
✅ Use for: [domains from the knowledge map]
❌ NOT for: [adjacent domains this doesn't cover]

## Core Process
[Decision trees from the book's processes]

## Anti-Patterns
[From the knowledge map's anti_patterns and expertise_patterns]

## References
- Source: [Book title and author]

KNOWLEDGE MAP:
"""


async def pass3_skill_draft(client, knowledge_map: dict) -> str:
    """Pass 3: Opus creates a SKILL.md from the knowledge map."""
    response = await client.messages.create(
        model="claude-opus-4-5",  # Opus 4.5 for highest quality skill generation
        max_tokens=8000,
        messages=[{
            "role": "user",
            "content": SKILL_DRAFT_PROMPT + json.dumps(knowledge_map, indent=2)
        }]
    )
    return response.content[0].text


# ============================================================================
# Pass 3 V2: Recipe Generation (Opus)
# ============================================================================

RECIPE_GENERATION_PROMPT = """You are a knowledge architect. Using this knowledge map extracted from a professional book, create a RECIPE DIRECTORY — a set of task-oriented recipes that encode the book's expertise for practitioners.

A recipe is NOT a summary. A recipe answers: "I've never done X before. What do I need to know to do it well?"

Each recipe should contain:
1. SITUATION: When you'd use this recipe (trigger conditions)
2. CRITICAL CUES: What to look for before and during the task (from expert judgment calls)
3. STEPS: The procedure, with decision points marked as [JUDGMENT] where expertise matters
4. FAILURE MODES: What goes wrong and how to recognize it early
5. QUALITY CHECKS: How to know if you're doing it right
6. SCOPE: What this recipe does NOT cover (honest boundaries)

STRUCTURAL RULES:
- Organize by TASK, not by chapter or topic
- Each recipe is standalone — a practitioner reads ONE recipe for ONE task
- Cross-reference other recipes with TYPED relationships: prerequisite (must do first), alternative (try instead), sequel (do next), specialization (narrower version)
- Preserve the book's conditions and caveats — "X works when Y" stays conditional
- Include expert-vs-novice contrasts where the knowledge map has them
- Include verbatim quotes as evidence for key claims (with page citations)
- Tag each recipe with situation_facets — these enable practitioners to FIND recipes by problem shape, not just by title. Choose the single best value for each facet based on the recipe's primary use case.

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "book_title": "inferred title of the source",
  "book_domain": "what field this covers",
  "recipes": [
    {
      "recipe_id": "lowercase-hyphenated-name",
      "title": "How to [verb] [object]",
      "situation": "Use this when...",
      "prerequisites": ["what you need to know/have first"],
      "critical_cues": [
        {"cue": "what to look for", "means": "what it indicates", "source": "page N"}
      ],
      "steps": [
        {"step": 1, "action": "what to do", "details": "how to do it", "judgment": "optional — where expertise matters"},
      ],
      "failure_modes": [
        {"failure": "what goes wrong", "early_sign": "how to catch it", "recovery": "what to do"}
      ],
      "quality_checks": ["how to verify you did it right"],
      "scope_limits": ["what this recipe does NOT cover"],
      "expert_novice_contrast": [
        {"aspect": "what", "expert": "does this", "novice": "does that"}
      ],
      "key_quotes": [
        {"text": "verbatim quote", "page": "approx page", "relevance": "why it matters here"}
      ],
      "situation_facets": {
        "time_pressure": "none|moderate|severe",
        "team_context": "solo|small_team|large_org|cross_functional",
        "decision_reversibility": "easily_reversible|costly_to_reverse|irreversible",
        "information_quality": "complete|partial|ambiguous|contradictory",
        "stakes": "learning|routine|high_consequence",
        "expertise_required": "novice_friendly|intermediate|expert_only"
      },
      "related_recipes": [
        {"recipe_id": "recipe-id-1", "relationship": "prerequisite|alternative|sequel|specialization", "why": "brief explanation of the relationship"}
      ]
    }
  ],
  "glossary": [
    {"term": "domain term", "definition": "what it means", "see_recipe": "recipe where it's used"}
  ],
  "citation_graph": [
    {"cited_author": "Author (Year)", "claim_attributed": "what the source book says they showed", "used_in_recipes": ["recipe-ids where this citation supports a claim"], "confidence": "direct_cite|paraphrase"}
  ],
  "meta": {
    "total_recipes": 0,
    "primary_tasks": ["list of main tasks this book teaches"],
    "gaps_noted": ["knowledge gaps identified during synthesis"]
  }
}

KNOWLEDGE MAP:
"""


async def generate_recipes(client, knowledge_map: dict, max_retries: int = 3) -> dict:
    """Pass 3 V2: Opus generates a recipe directory from the knowledge map."""
    for attempt in range(max_retries):
        try:
            response = await client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=16000,
                messages=[{
                    "role": "user",
                    "content": RECIPE_GENERATION_PROMPT + json.dumps(knowledge_map, indent=2)
                }]
            )
            break
        except Exception as e:
            if attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)
                log(f"   [RETRY] Attempt {attempt + 1} failed: {e}. Waiting {wait}s...")
                await asyncio.sleep(wait)
            else:
                log(f"   [ERROR] All {max_retries} attempts failed: {e}")
                return {"raw_text": str(e), "parse_error": True, "recipes": [],
                        "_generation_metadata": {"input_tokens": 0, "output_tokens": 0, "cost": 0}}

    text = response.content[0].text.strip()
    # Parse JSON
    try:
        start = text.find('{')
        end = text.rfind('}') + 1
        if start >= 0 and end > start:
            recipes = json.loads(text[start:end])
        else:
            recipes = {"raw_text": text, "parse_error": True}
    except (json.JSONDecodeError, ValueError):
        recipes = {"raw_text": text, "parse_error": True}

    recipes["_generation_metadata"] = {
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "cost": (response.usage.input_tokens * 15.00 + response.usage.output_tokens * 75.00) / 1_000_000,
    }

    return recipes


# ============================================================================
# Main Pipeline
# ============================================================================

async def distill_file(
    filepath: str,
    output_dir: str,
    output_mode: str = "knowledge-map",
    max_concurrent: int = 10,
    use_hierarchical: bool = True,
    use_v2: bool = False,
    use_multi_turn: bool = False,
    topic_index: dict = None,
) -> dict:
    """Run the full distillation pipeline on a single file."""
    try:
        import anthropic
    except ImportError:
        print("Install anthropic SDK: pip install anthropic")
        sys.exit(1)
    
    client = anthropic.AsyncAnthropic(
        timeout=httpx.Timeout(120.0, connect=10.0)  # Large payloads need generous timeout
    )
    filename = Path(filepath).stem
    
    log(f"\n{'='*60}")
    log(f"Distilling: {filepath}")
    log(f"Output mode: {output_mode}")
    log(f"{'='*60}")
    
    # Extract text
    log(f"\n📖 Extracting text...")
    text = extract_text(filepath)
    total_tokens = count_tokens_approx(text)
    log(f"   {total_tokens:,} tokens ({total_tokens // 500} pages approx)")
    
    # Chunk
    log(f"\n✂️  Chunking...")
    chunks = semantic_chunk(text, total_chars=len(text))
    log(f"   {len(chunks)} chunks")
    
    # Pass 1: Haiku extraction
    if use_v2 and V2_AVAILABLE:
        log(f"\n🐝 Pass 1 (V2): Adaptive probe extraction ({len(chunks)} parallel)...")
        extractions = await pass1_extract_v2(client, chunks, max_concurrent)
    else:
        log(f"\n🐝 Pass 1: Haiku army ({len(chunks)} parallel extractions)...")
        extractions = await pass1_extract(client, chunks, max_concurrent)
    p1_input = sum(e["input_tokens"] for e in extractions)
    p1_output = sum(e["output_tokens"] for e in extractions)
    p1_cost = (p1_input * 0.80 + p1_output * 4.00) / 1_000_000
    errors = sum(1 for e in extractions if "error" in e.get("extraction", {}))
    log(f"   Done. {len(extractions) - errors} succeeded, {errors} errors")
    log(f"   Cost: ${p1_cost:.4f} ({p1_input:,} in + {p1_output:,} out)")
    
    # Save Pass 1 output
    p1_path = os.path.join(output_dir, f"{filename}_pass1_extractions.json")
    with open(p1_path, 'w') as f:
        json.dump(extractions, f, indent=2)
    log(f"   Saved: {p1_path}")
    
    if output_mode == "summary":
        # Just return the concatenated summaries
        summaries = [e["extraction"].get("summary", "") for e in extractions if "error" not in e.get("extraction", {})]
        result = {"summaries": summaries, "pass1_cost": p1_cost}
        result_path = os.path.join(output_dir, f"{filename}_summary.json")
        with open(result_path, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\n✅ Summary saved: {result_path}")
        print(f"   Total cost: ${p1_cost:.4f}")
        return result
    
    # Pass 2: Sonnet synthesis
    if use_multi_turn:
        log(f"\n🧠 Pass 2: Sonnet synthesis (multi-turn lookup enabled)...")
    else:
        log(f"\n🧠 Pass 2: Sonnet synthesis...")
    synthesis = await pass2_synthesize(
        client,
        extractions,
        use_hierarchical=use_hierarchical,
        use_multi_turn=use_multi_turn,
        topic_index=topic_index,
        source_name=filename,  # Use filename as source filter
    )

    # Calculate cost (use actual_cost from hierarchical merge if available)
    if "actual_cost" in synthesis:
        p2_cost = synthesis["actual_cost"]
    else:
        p2_cost = (synthesis["input_tokens"] * 3.00 + synthesis["output_tokens"] * 15.00) / 1_000_000

    log(f"   Cost: ${p2_cost:.4f}")
    
    # Save Pass 2 output
    p2_path = os.path.join(output_dir, f"{filename}_knowledge_map.json")
    with open(p2_path, 'w') as f:
        json.dump(synthesis["knowledge_map"], f, indent=2)
    log(f"   Saved: {p2_path}")
    
    if output_mode == "knowledge-map":
        total_cost = p1_cost + p2_cost
        print(f"\n✅ Knowledge map saved: {p2_path}")
        print(f"   Total cost: ${total_cost:.4f}")
        return {"knowledge_map": synthesis["knowledge_map"], "total_cost": total_cost}
    
    # Pass 3: Skill draft or Recipe generation
    if use_v2 and V2_AVAILABLE:
        log(f"\n📝 Pass 3 (V2): Recipe generation...")
        recipes = await generate_recipes(client, synthesis["knowledge_map"])
        p3_cost = recipes.get("_generation_metadata", {}).get("cost", 0.05)

        # Save recipe directory
        recipe_dir = os.path.join(output_dir, f"{filename}_recipes")
        os.makedirs(recipe_dir, exist_ok=True)

        # Save full recipe JSON
        recipe_path = os.path.join(recipe_dir, "recipes.json")
        with open(recipe_path, 'w') as f:
            json.dump(recipes, f, indent=2)

        # Save individual recipe files for easy browsing
        for recipe in recipes.get("recipes", []):
            rid = recipe.get("recipe_id", f"recipe-{recipes.get('recipes', []).index(recipe)}")
            individual_path = os.path.join(recipe_dir, f"{rid}.json")
            with open(individual_path, 'w') as f:
                json.dump(recipe, f, indent=2)

        # Save glossary
        if recipes.get("glossary"):
            glossary_path = os.path.join(recipe_dir, "glossary.json")
            with open(glossary_path, 'w') as f:
                json.dump(recipes["glossary"], f, indent=2)

        # Save the knowledge map alongside
        km_path = os.path.join(recipe_dir, "knowledge_map.json")
        with open(km_path, 'w') as f:
            json.dump(synthesis["knowledge_map"], f, indent=2)

        total_cost = p1_cost + p2_cost + p3_cost
        recipe_count = len(recipes.get("recipes", []))
        log(f"\n✅ Recipe directory saved: {recipe_dir}")
        log(f"   {recipe_count} recipes generated")
        log(f"   Total cost: ${total_cost:.4f}")

        return {"recipes": recipes, "knowledge_map": synthesis["knowledge_map"], "total_cost": total_cost}
    else:
        log(f"\n📝 Pass 3: Skill draft generation...")
        skill_md = await pass3_skill_draft(client, synthesis["knowledge_map"])

        # Save skill draft
        p3_path = os.path.join(output_dir, f"{filename}_SKILL.md")
        with open(p3_path, 'w') as f:
            f.write(skill_md)

        total_cost = p1_cost + p2_cost + 0.05  # Approximate Pass 3 cost
        log(f"\n✅ Skill draft saved: {p3_path}")
        log(f"   Total cost: ${total_cost:.4f}")

        return {"skill_draft": skill_md, "knowledge_map": synthesis["knowledge_map"], "total_cost": total_cost}


async def main():
    parser = argparse.ArgumentParser(description="Corpus Distillation Pipeline")
    parser.add_argument("input", help="File path or directory of files to distill")
    parser.add_argument("--output-mode", choices=["summary", "knowledge-map", "skill-draft"],
                        default="knowledge-map", help="Output mode (default: knowledge-map)")
    parser.add_argument("--output-dir", default="corpus/output", help="Output directory")
    parser.add_argument("--max-concurrent", type=int, default=10,
                        help="Max concurrent Haiku calls (default: 10)")
    parser.add_argument("--hierarchical", action="store_true", default=True,
                        help="Use hierarchical binary merge for Phase 2 (recommended, default: True)")
    parser.add_argument("--no-hierarchical", action="store_false", dest="hierarchical",
                        help="Use legacy flat merge (may hit context limits)")
    parser.add_argument("--v2", action="store_true", default=False,
                        help="Use V2 pipeline: adaptive probes + FOCUS merge + recipe generation")
    parser.add_argument("--multi-turn", action="store_true", default=False,
                        help="Use multi-turn evidence lookup (50-70%% context reduction, better citations)")
    parser.add_argument("--topic-index", type=str, default=None,
                        help="Path to topic index for multi-turn lookup (default: auto-detect)")

    args = parser.parse_args()

    if args.v2 and not V2_AVAILABLE:
        log("ERROR: --v2 requires probes.py in the same directory as distill.py")
        sys.exit(1)

    # Load topic index for multi-turn lookup
    topic_index = None
    if args.multi_turn:
        if not TOPIC_INDEX_AVAILABLE:
            log("ERROR: --multi-turn requires build_topic_index.py in the same directory")
            sys.exit(1)
        index_path = Path(args.topic_index) if args.topic_index else TOPIC_INDEX_PATH
        log(f"📚 Loading topic index from {index_path}...")
        topic_index = load_index(index_path)
        if topic_index is None:
            log(f"ERROR: Topic index not found at {index_path}")
            log("       Run: python build_topic_index.py")
            sys.exit(1)
        meta = topic_index.get("metadata", {})
        log(f"   Loaded: {meta.get('total_sources', 0)} sources, {meta.get('total_quotes', 0)} quotes")

    os.makedirs(args.output_dir, exist_ok=True)
    
    input_path = Path(args.input)
    
    if input_path.is_dir():
        # Process all supported files in directory
        SUPPORTED = ('.pdf', '.docx', '.md', '.txt', '.text', '.mhtml', '.pages', '.html', '.htm', '.epub')
        files = sorted([
            str(f) for f in input_path.iterdir()
            if f.suffix.lower() in SUPPORTED
        ])
        log(f"Found {len(files)} files to process")
        if args.v2:
            log(f"🔬 V2 pipeline: adaptive probes + FOCUS merge + recipe generation")
        if args.multi_turn:
            log(f"🔁 Multi-turn evidence lookup enabled")
        for filepath in files:
            try:
                await distill_file(
                    filepath,
                    args.output_dir,
                    args.output_mode,
                    args.max_concurrent,
                    use_hierarchical=args.hierarchical,
                    use_v2=args.v2,
                    use_multi_turn=args.multi_turn,
                    topic_index=topic_index,
                )
            except Exception as e:
                log(f"\n❌ Error processing {filepath}: {e}")
    elif input_path.is_file():
        if args.v2:
            log(f"🔬 V2 pipeline: adaptive probes + FOCUS merge + recipe generation")
        if args.multi_turn:
            log(f"🔁 Multi-turn evidence lookup enabled")
        await distill_file(
            str(input_path),
            args.output_dir,
            args.output_mode,
            args.max_concurrent,
            use_hierarchical=args.hierarchical,
            use_v2=args.v2,
            use_multi_turn=args.multi_turn,
            topic_index=topic_index,
        )
    else:
        log(f"Not found: {args.input}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
