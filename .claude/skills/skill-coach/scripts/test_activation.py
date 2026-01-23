#!/usr/bin/env python3
"""
Skill Activation Tester

Tests whether a skill's description correctly identifies queries that
should/should not activate it. Uses keyword matching as a proxy for
Claude's activation logic.

Usage: python test_activation.py <skill_path> [--verbose]
"""

import sys
import re
from pathlib import Path
from dataclasses import dataclass
from typing import List, Tuple, Optional


@dataclass
class ActivationTest:
    query: str
    should_activate: bool
    reason: str


def extract_keywords(description: str) -> Tuple[List[str], List[str]]:
    """Extract positive and negative keywords from description."""
    positive = []
    negative = []

    # Find "Activate on" keywords
    activate_match = re.search(
        r'[Aa]ctivate\s+on\s+(?:keywords?:?)?\s*["\']?([^."\']+)["\']?',
        description
    )
    if activate_match:
        keywords_str = activate_match.group(1)
        # Split by comma or 'and' or quotes
        positive = [k.strip().strip('"\'') for k in re.split(r',|\sand\s', keywords_str)]
        positive = [k for k in positive if k and len(k) > 1]

    # Find "NOT for" exclusions
    not_match = re.search(r'NOT\s+for\s+([^.]+)', description, re.IGNORECASE)
    if not_match:
        exclusions_str = not_match.group(1)
        negative = [k.strip().strip('"\'') for k in re.split(r',|\sor\s', exclusions_str)]
        negative = [k for k in negative if k and len(k) > 1]

    return positive, negative


def generate_test_queries(positive_kw: List[str], negative_kw: List[str]) -> List[ActivationTest]:
    """Generate test queries from keywords."""
    tests = []

    # Positive tests (should activate)
    for kw in positive_kw[:5]:  # Limit to first 5
        tests.append(ActivationTest(
            query=f"Help me with {kw}",
            should_activate=True,
            reason=f"Contains keyword '{kw}'"
        ))

    # Negative tests (should NOT activate)
    for kw in negative_kw[:5]:  # Limit to first 5
        tests.append(ActivationTest(
            query=f"I need help with {kw}",
            should_activate=False,
            reason=f"Contains exclusion '{kw}'"
        ))

    # Generic negative tests
    generic_negative = [
        "What's the weather today?",
        "Write a haiku about cats",
        "Explain quantum physics",
    ]
    for q in generic_negative:
        tests.append(ActivationTest(
            query=q,
            should_activate=False,
            reason="Generic query unrelated to skill"
        ))

    return tests


def check_activation(query: str, description: str,
                     positive_kw: List[str], negative_kw: List[str]) -> Tuple[bool, str]:
    """
    Simulate activation check.
    Returns (would_activate, explanation)
    """
    query_lower = query.lower()

    # Check for negative keywords first (exclusions take priority)
    for neg in negative_kw:
        if neg.lower() in query_lower:
            return False, f"Blocked by exclusion: '{neg}'"

    # Check for positive keywords
    for pos in positive_kw:
        if pos.lower() in query_lower:
            return True, f"Matched keyword: '{pos}'"

    # Check description terms
    desc_terms = set(description.lower().split())
    query_terms = set(query_lower.split())
    overlap = desc_terms & query_terms

    if len(overlap) >= 2:
        return True, f"Matched description terms: {overlap}"

    return False, "No keyword match"


def run_tests(skill_path: str, verbose: bool = False) -> int:
    """Run activation tests on a skill."""
    skill_dir = Path(skill_path).resolve()
    skill_md = skill_dir / "SKILL.md"

    if not skill_md.exists():
        print(f"Error: {skill_md} not found")
        return 1

    content = skill_md.read_text()

    # Extract description from frontmatter
    desc_match = re.search(r'description:\s*["\']([^"\']+)["\']', content)
    if not desc_match:
        print("Error: Could not find description in frontmatter")
        return 1

    description = desc_match.group(1)
    positive_kw, negative_kw = extract_keywords(description)

    print(f"\n{'='*60}")
    print(f"ACTIVATION TEST: {skill_dir.name}")
    print(f"{'='*60}\n")

    print(f"Positive keywords: {positive_kw}")
    print(f"Negative keywords: {negative_kw}\n")

    # Generate and run tests
    tests = generate_test_queries(positive_kw, negative_kw)

    passed = 0
    failed = 0

    for test in tests:
        activated, explanation = check_activation(
            test.query, description, positive_kw, negative_kw
        )

        if activated == test.should_activate:
            passed += 1
            status = "✅ PASS"
        else:
            failed += 1
            status = "❌ FAIL"

        if verbose or activated != test.should_activate:
            expected = "ACTIVATE" if test.should_activate else "NO ACTIVATE"
            actual = "activated" if activated else "did not activate"
            print(f"{status}: \"{test.query}\"")
            print(f"         Expected: {expected}, Actually: {actual}")
            print(f"         {explanation}")
            print()

    # Summary
    total = passed + failed
    rate = (passed / total * 100) if total > 0 else 0

    print(f"\n{'='*60}")
    print(f"RESULTS: {passed}/{total} passed ({rate:.1f}%)")
    print(f"{'='*60}")

    if rate >= 90:
        print("✅ Activation precision meets target (>90%)")
    elif rate >= 70:
        print("⚠️  Activation precision below target (70-90%)")
    else:
        print("❌ Activation precision needs work (<70%)")

    return 0 if failed == 0 else 1


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_activation.py <skill_path> [--verbose]")
        print("\nTests skill activation based on description keywords.")
        print("\nExample:")
        print("  python test_activation.py ~/.claude/skills/my-skill/")
        print("  python test_activation.py ~/.claude/skills/my-skill/ --verbose")
        sys.exit(1)

    skill_path = sys.argv[1]
    verbose = "--verbose" in sys.argv or "-v" in sys.argv

    sys.exit(run_tests(skill_path, verbose))


if __name__ == '__main__':
    main()
