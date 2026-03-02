#!/usr/bin/env python3
"""
Generate skill drafts from existing knowledge maps.

This script processes knowledge maps that already exist and generates
SKILL.md files from them, skipping the expensive Pass 1 and Pass 2.

Usage:
  python generate_skills_from_maps.py
"""

import os
import json
import asyncio
from pathlib import Path
from anthropic import AsyncAnthropic

# ============================================================================
# Skill Draft Prompt (from distill.py)
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


async def generate_skill_draft(client, knowledge_map: dict) -> str:
    """Generate a SKILL.md from a knowledge map using Sonnet 4.5."""
    response = await client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=8000,
        messages=[{
            "role": "user",
            "content": SKILL_DRAFT_PROMPT + json.dumps(knowledge_map, indent=2)
        }]
    )

    return {
        "skill_md": response.content[0].text,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
    }


async def process_knowledge_maps():
    """Find all knowledge maps without corresponding SKILL.md files and generate them."""
    import sys

    def log(msg):
        print(msg, flush=True)
        sys.stdout.flush()

    log("=" * 70)
    log("SKILL DRAFT GENERATOR - Starting")
    log("=" * 70)

    log("Initializing Anthropic client...")
    client = AsyncAnthropic()
    log("✓ Client initialized")

    log("\nResolving output directory path...")
    output_dir = Path(__file__).parent.parent / "output"
    log(f"✓ Output directory: {output_dir.absolute()}")

    log("\nScanning for knowledge maps...")
    knowledge_maps = list(output_dir.glob("*_knowledge_map.json"))
    log(f"✓ Found {len(knowledge_maps)} knowledge maps")

    if knowledge_maps:
        log("\nKnowledge maps found:")
        for km in sorted(knowledge_maps)[:5]:
            log(f"  - {km.name}")
        if len(knowledge_maps) > 5:
            log(f"  ... and {len(knowledge_maps) - 5} more")

    # Filter to only those without SKILL.md
    log("\nFiltering for knowledge maps without skill drafts...")
    to_process = []
    for km_path in knowledge_maps:
        filename = km_path.stem.replace("_knowledge_map", "")
        skill_path = output_dir / f"{filename}_SKILL.md"

        if not skill_path.exists():
            to_process.append((km_path, skill_path, filename))
            log(f"  → Need to generate: {filename}")
        else:
            log(f"  ✓ Already exists: {filename}")

    log(f"\n{'=' * 70}")
    log(f"SUMMARY: Need to generate {len(to_process)} skill drafts")
    log(f"{'=' * 70}\n")

    if not to_process:
        log("All skill drafts already exist!")
        return

    total_cost = 0.0
    successful = 0
    failed = 0

    for i, (km_path, skill_path, filename) in enumerate(to_process, 1):
        log(f"\n{'=' * 70}")
        log(f"[{i}/{len(to_process)}] Processing: {filename}")
        log(f"{'=' * 70}")

        try:
            # Load knowledge map
            log(f"  Step 1/3: Loading knowledge map from {km_path.name}...")
            with open(km_path, 'r') as f:
                knowledge_map = json.load(f)
            log(f"  ✓ Loaded knowledge map ({len(json.dumps(knowledge_map))} chars)")

            # Generate skill draft
            log(f"  Step 2/3: Calling Anthropic API (Sonnet 4.5)...")
            result = await generate_skill_draft(client, knowledge_map)
            log(f"  ✓ API call complete")

            # Calculate cost (Sonnet 4.5: $3/MTok in, $15/MTok out)
            cost = (result["input_tokens"] * 3.00 + result["output_tokens"] * 15.00) / 1_000_000
            total_cost += cost

            # Save skill draft
            log(f"  Step 3/3: Saving skill draft to {skill_path.name}...")
            with open(skill_path, 'w') as f:
                f.write(result["skill_md"])
            log(f"  ✓ Saved ({len(result['skill_md'])} chars)")

            log(f"\n  ✅ SUCCESS!")
            log(f"     Cost: ${cost:.4f}")
            log(f"     Tokens: {result['input_tokens']:,} in + {result['output_tokens']:,} out")
            log(f"     Running total: ${total_cost:.4f}")
            successful += 1

        except Exception as e:
            log(f"\n  ❌ ERROR: {type(e).__name__}: {e}")
            failed += 1

            # If it's a credit error, stop processing
            if "credit balance" in str(e).lower():
                log(f"\n⚠️  API credit exhausted after {successful} successful completions")
                log("Stopping processing to avoid errors.")
                break

    log(f"\n{'='*70}")
    log(f"FINAL SUMMARY")
    log(f"{'='*70}")
    log(f"Successfully generated: {successful}/{len(to_process)} skill drafts")
    log(f"Failed: {failed}")
    log(f"Total cost: ${total_cost:.4f}")
    if successful > 0:
        log(f"Average cost per skill: ${total_cost/successful:.4f}")
    log(f"{'='*70}\n")


if __name__ == "__main__":
    asyncio.run(process_knowledge_maps())
