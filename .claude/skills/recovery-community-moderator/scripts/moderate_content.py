#!/usr/bin/env python3
"""
Content Moderation Script for Recovery Community

Uses Claude API to evaluate content against harm reduction and
trauma-informed moderation guidelines.
"""

import json
import os
import sys
from dataclasses import dataclass
from enum import Enum
from typing import Optional

try:
    import anthropic
except ImportError:
    print("Please install anthropic: pip install anthropic")
    sys.exit(1)


class Severity(Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    PASS = "PASS"


class Category(Enum):
    SOURCING = "sourcing"
    PERSONAL_ATTACK = "personal_attack"
    SHAMING = "shaming"
    DOXXING = "doxxing"
    SELF_HARM = "self_harm"
    COERCION = "coercion"
    GATEKEEPING = "gatekeeping"
    BREAKING_ANONYMITY = "breaking_anonymity"
    SPAM = "spam"
    MISINFORMATION = "misinformation"
    NONE = "none"


@dataclass
class ModerationResult:
    severity: Severity
    category: Category
    confidence: float
    explanation: str
    crisis_detected: bool
    suggested_action: str
    user_message: Optional[str] = None


SYSTEM_PROMPT = """You are a trauma-informed community moderator for a recovery support forum.

Evaluate the following content and respond with a JSON object containing:
- severity: CRITICAL, HIGH, MEDIUM, LOW, or PASS
- category: sourcing, personal_attack, shaming, doxxing, self_harm, coercion, gatekeeping, breaking_anonymity, spam, misinformation, or none
- confidence: 0.0 to 1.0
- explanation: Brief explanation of your decision
- crisis_detected: true if the person appears to be in crisis (wanting to use, suicidal ideation)
- suggested_action: hide, flag, warn_user, escalate, or none
- user_message: Optional gentle message if action is taken

CRITICAL PRINCIPLES:
1. All recovery pathways are valid (AA, NA, SMART, MAT, harm reduction, abstinence)
2. "I want to use" is a CRY FOR HELP, not a violation
3. Distinguish "I hate AA" (valid) from "I hate you" (violation)
4. Strong language about programs ≠ violation
5. When in doubt, PASS - over-moderation drives people from support

Respond ONLY with the JSON object, no markdown formatting."""


def moderate_content(content: str, context: Optional[str] = None) -> ModerationResult:
    """
    Moderate a piece of content using Claude.

    Args:
        content: The content to moderate
        context: Optional context (e.g., post title, thread context)

    Returns:
        ModerationResult with severity, category, and recommendations
    """
    client = anthropic.Anthropic()

    user_message = f"Content to moderate:\n\n{content}"
    if context:
        user_message = f"Context: {context}\n\n{user_message}"

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    )

    result_text = response.content[0].text.strip()

    # Parse JSON response
    try:
        result = json.loads(result_text)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            # Fallback to safe default
            return ModerationResult(
                severity=Severity.LOW,
                category=Category.NONE,
                confidence=0.5,
                explanation="Could not parse moderation response",
                crisis_detected=False,
                suggested_action="flag"
            )

    return ModerationResult(
        severity=Severity(result.get("severity", "PASS")),
        category=Category(result.get("category", "none")),
        confidence=float(result.get("confidence", 0.5)),
        explanation=result.get("explanation", ""),
        crisis_detected=result.get("crisis_detected", False),
        suggested_action=result.get("suggested_action", "none"),
        user_message=result.get("user_message")
    )


def batch_moderate(contents: list[dict]) -> list[dict]:
    """
    Moderate a batch of content items.

    Args:
        contents: List of dicts with 'id', 'content', and optional 'context'

    Returns:
        List of dicts with moderation results
    """
    results = []
    for item in contents:
        result = moderate_content(
            content=item["content"],
            context=item.get("context")
        )
        results.append({
            "id": item["id"],
            "severity": result.severity.value,
            "category": result.category.value,
            "confidence": result.confidence,
            "explanation": result.explanation,
            "crisis_detected": result.crisis_detected,
            "suggested_action": result.suggested_action,
            "user_message": result.user_message
        })
    return results


if __name__ == "__main__":
    # Example usage
    test_cases = [
        {
            "id": "test_1",
            "content": "I really need to find a new source for pills since my guy got arrested",
            "context": "Posted in General Discussion"
        },
        {
            "id": "test_2",
            "content": "I'm 30 days sober today! Still going to meetings every day.",
            "context": "Posted in Success Stories"
        },
        {
            "id": "test_3",
            "content": "I want to use so badly right now. I can't stop thinking about it.",
            "context": "Posted in Struggles & Support"
        },
        {
            "id": "test_4",
            "content": "If you're not doing AA, you're not really in recovery. You're just fooling yourself.",
            "context": "Posted in General Discussion"
        },
        {
            "id": "test_5",
            "content": "I disagree with how AA approaches spirituality, but I respect that it works for some people.",
            "context": "Posted in General Discussion"
        },
        {
            "id": "test_6",
            "content": "You're such an idiot. No wonder you keep relapsing.",
            "context": "Reply to another user's post"
        }
    ]

    print("Running moderation tests...\n")
    results = batch_moderate(test_cases)

    for result in results:
        print(f"ID: {result['id']}")
        print(f"  Severity: {result['severity']}")
        print(f"  Category: {result['category']}")
        print(f"  Confidence: {result['confidence']:.2f}")
        print(f"  Crisis: {'YES' if result['crisis_detected'] else 'No'}")
        print(f"  Action: {result['suggested_action']}")
        print(f"  Explanation: {result['explanation']}")
        print()
