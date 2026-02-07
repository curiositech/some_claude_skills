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
        model="claude-sonnet-4-5-20250929",
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
    client = AsyncAnthropic()

    output_dir = Path("corpus/output")
    knowledge_maps = list(output_dir.glob("*_knowledge_map.json"))

    print(f"Found {len(knowledge_maps)} knowledge maps")

    # Filter to only those without SKILL.md
    to_process = []
    for km_path in knowledge_maps:
        filename = km_path.stem.replace("_knowledge_map", "")
        skill_path = output_dir / f"{filename}_SKILL.md"

        if not skill_path.exists():
            to_process.append((km_path, skill_path, filename))

    print(f"Need to generate {len(to_process)} skill drafts\n")

    if not to_process:
        print("All skill drafts already exist!")
        return

    total_cost = 0.0
    successful = 0
    failed = 0

    for i, (km_path, skill_path, filename) in enumerate(to_process, 1):
        print(f"\n[{i}/{len(to_process)}] Processing: {filename}")

        try:
            # Load knowledge map
            with open(km_path, 'r') as f:
                knowledge_map = json.load(f)

            # Generate skill draft
            result = await generate_skill_draft(client, knowledge_map)

            # Calculate cost (Sonnet 4.5: $3/MTok in, $15/MTok out)
            cost = (result["input_tokens"] * 3.00 + result["output_tokens"] * 15.00) / 1_000_000
            total_cost += cost

            # Save skill draft
            with open(skill_path, 'w') as f:
                f.write(result["skill_md"])

            print(f"   ✅ Saved: {skill_path}")
            print(f"   Cost: ${cost:.4f} ({result['input_tokens']:,} in + {result['output_tokens']:,} out)")
            successful += 1

        except Exception as e:
            print(f"   ❌ Error: {e}")
            failed += 1

            # If it's a credit error, stop processing
            if "credit balance" in str(e).lower():
                print(f"\n⚠️  API credit exhausted after {successful} successful completions")
                break

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Successfully generated: {successful}/{len(to_process)} skill drafts")
    print(f"Failed: {failed}")
    print(f"Total cost: ${total_cost:.4f}")
    print(f"Average cost per skill: ${total_cost/successful:.4f}" if successful > 0 else "")


if __name__ == "__main__":
    asyncio.run(process_knowledge_maps())
