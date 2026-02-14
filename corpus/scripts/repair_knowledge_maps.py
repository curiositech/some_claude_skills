#!/usr/bin/env python3
"""
Repair knowledge maps that have parse_error due to markdown fence wrapping.

The LLM sometimes wraps JSON responses in ```json ... ``` fences.
This script extracts the JSON from inside the fences and re-saves.
"""

import json
import re
from pathlib import Path


def repair_file(path: Path) -> bool:
    """Try to repair a knowledge map with parse_error. Returns True if repaired."""
    with open(path, 'r') as f:
        data = json.load(f)
    
    if 'parse_error' not in data or 'raw_synthesis' not in data:
        return False
    
    raw = data['raw_synthesis']
    
    # Try to extract JSON from markdown fences
    # Pattern: ```json\n{...}\n```
    match = re.search(r'```(?:json)?\s*\n(\{.*\})\s*\n?```', raw, re.DOTALL)
    if match:
        try:
            repaired = json.loads(match.group(1))
            with open(path, 'w') as f:
                json.dump(repaired, f, indent=2)
            return True
        except json.JSONDecodeError:
            pass
    
    # Try: raw starts with ```json and ends with ```
    if raw.strip().startswith('```'):
        cleaned = re.sub(r'^```(?:json)?\s*\n', '', raw.strip())
        cleaned = re.sub(r'\n```\s*$', '', cleaned)
        try:
            repaired = json.loads(cleaned)
            with open(path, 'w') as f:
                json.dump(repaired, f, indent=2)
            return True
        except json.JSONDecodeError:
            pass
    
    # Try: raw IS the JSON but got truncated — attempt partial parse
    if '{' in raw:
        start = raw.find('{')
        # Find the last complete top-level key-value pair
        try:
            # Try parsing as-is (sometimes it's valid JSON that was wrapped)
            repaired = json.loads(raw[start:])
            with open(path, 'w') as f:
                json.dump(repaired, f, indent=2)
            return True
        except json.JSONDecodeError:
            pass
    
    return False


def main():
    output_dir = Path("corpus/output")
    km_files = list(output_dir.glob("*_knowledge_map.json"))
    
    repaired = 0
    failed = 0
    skipped = 0
    
    for path in sorted(km_files):
        with open(path, 'r') as f:
            data = json.load(f)
        
        if 'parse_error' not in data:
            skipped += 1
            continue
        
        name = path.stem.replace('_knowledge_map', '')
        print(f"Repairing: {name}...", end=" ")
        
        if repair_file(path):
            # Verify
            with open(path, 'r') as f:
                fixed = json.load(f)
            concepts = len(fixed.get('core_concepts', []))
            anti = len(fixed.get('anti_patterns', []))
            print(f"✓ Repaired ({concepts} concepts, {anti} anti-patterns)")
            repaired += 1
        else:
            print("✗ Could not repair automatically")
            failed += 1
    
    print(f"\nResults: {repaired} repaired, {failed} failed, {skipped} already OK")


if __name__ == "__main__":
    main()
