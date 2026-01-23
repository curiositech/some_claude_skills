#!/usr/bin/env python3
"""
Product Appeal Scorer - Structured analysis of product desirability

Analyzes landing pages and generates appeal scores across the
Desirability Triangle: Identity Fit, Problem Urgency, Trust Signals.

Usage:
    python appeal_scorer.py <url>
    python appeal_scorer.py --file <screenshot.png>
    python appeal_scorer.py --interactive

Output: JSON with scores and recommendations
"""

import sys
import json
import argparse
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict
from enum import Enum


class Priority(Enum):
    IMMEDIATE = "immediate"
    MEDIUM = "medium"
    LONG_TERM = "long_term"


@dataclass
class Score:
    """Individual score with reasoning."""
    value: int  # 1-10
    reasoning: str
    evidence: str


@dataclass
class TriangleVertex:
    """One vertex of the Desirability Triangle."""
    name: str
    overall: Score
    sub_scores: Dict[str, Score]


@dataclass
class Objection:
    """User objection and how it's addressed."""
    objection: str
    type: str  # trust, skepticism, value, effort, identity, risk, urgency
    addressed: bool
    how_addressed: Optional[str]
    recommendation: Optional[str]


@dataclass
class Recommendation:
    """Prioritized recommendation."""
    title: str
    description: str
    impact: str
    effort: str
    priority: Priority


@dataclass
class FiveSecondTest:
    """Results of 5-second test simulation."""
    what_is_this: Score
    who_is_it_for: Score
    core_promise: Score
    next_action: Score
    overall: int


@dataclass
class AppealAnalysis:
    """Complete appeal analysis output."""
    url: Optional[str]
    personas: List[str]
    triangle: Dict[str, TriangleVertex]
    five_second_test: FiveSecondTest
    objections: List[Objection]
    recommendations: List[Recommendation]
    overall_score: int
    summary: List[str]


def create_empty_analysis() -> AppealAnalysis:
    """Create template for manual analysis."""

    # Template scores
    template_score = Score(value=0, reasoning="[Analyze and fill]", evidence="[Quote from page]")

    # Identity Fit vertex
    identity_fit = TriangleVertex(
        name="Identity Fit",
        overall=template_score,
        sub_scores={
            "visual_match": Score(0, "Does design match target user expectations?", "[evidence]"),
            "language_resonance": Score(0, "Does copy speak their language?", "[evidence]"),
            "implied_user": Score(0, "Are people like them shown/implied?", "[evidence]"),
            "values_alignment": Score(0, "Do stated values match user values?", "[evidence]"),
            "aspiration_fit": Score(0, "Does this fit who they want to be?", "[evidence]"),
        }
    )

    # Problem Urgency vertex
    problem_urgency = TriangleVertex(
        name="Problem Urgency",
        overall=template_score,
        sub_scores={
            "pain_acknowledged": Score(0, "Is user's pain point clearly named?", "[evidence]"),
            "emotional_resonance": Score(0, "Does it connect to how problem feels?", "[evidence]"),
            "solution_clarity": Score(0, "Is it clear how this solves the problem?", "[evidence]"),
            "time_to_value": Score(0, "Is it clear how quickly they'll see results?", "[evidence]"),
            "why_now": Score(0, "Is there urgency to act now vs later?", "[evidence]"),
        }
    )

    # Trust Signals vertex
    trust_signals = TriangleVertex(
        name="Trust Signals",
        overall=template_score,
        sub_scores={
            "professional_execution": Score(0, "Does it look legitimate and polished?", "[evidence]"),
            "social_proof": Score(0, "Are testimonials/logos/numbers present?", "[evidence]"),
            "risk_reduction": Score(0, "Are guarantees/free trials/demos offered?", "[evidence]"),
            "credibility_markers": Score(0, "Press, awards, certifications?", "[evidence]"),
            "transparency": Score(0, "Are pricing, terms, team visible?", "[evidence]"),
        }
    )

    # 5-Second Test
    five_second = FiveSecondTest(
        what_is_this=Score(0, "Can visitor identify product category?", "[evidence]"),
        who_is_it_for=Score(0, "Is target audience immediately clear?", "[evidence]"),
        core_promise=Score(0, "Is value proposition obvious?", "[evidence]"),
        next_action=Score(0, "Is primary CTA prominent and clear?", "[evidence]"),
        overall=0
    )

    # Common objections
    objections = [
        Objection("Is this legit?", "trust", False, None, "Add trust badges, testimonials"),
        Objection("I've tried things before", "skepticism", False, None, "Show differentiation, case studies"),
        Objection("Too expensive", "value", False, None, "Demonstrate ROI, show pricing early"),
        Objection("Too complicated", "effort", False, None, "Show simple onboarding, quick wins"),
        Objection("Not for people like me", "identity", False, None, "Show relatable testimonials"),
        Objection("What if it doesn't work?", "risk", False, None, "Money-back guarantee, free trial"),
        Objection("I'll do it later", "urgency", False, None, "Show cost of delay, limited offer"),
    ]

    return AppealAnalysis(
        url=None,
        personas=["[Persona 1]", "[Persona 2]"],
        triangle={
            "identity_fit": identity_fit,
            "problem_urgency": problem_urgency,
            "trust_signals": trust_signals,
        },
        five_second_test=five_second,
        objections=objections,
        recommendations=[],
        overall_score=0,
        summary=[]
    )


def calculate_overall_score(analysis: AppealAnalysis) -> int:
    """Calculate weighted overall appeal score."""

    # Triangle vertices (equal weight)
    identity = analysis.triangle["identity_fit"].overall.value
    urgency = analysis.triangle["problem_urgency"].overall.value
    trust = analysis.triangle["trust_signals"].overall.value

    triangle_score = (identity + urgency + trust) / 3

    # 5-second test
    five_sec = analysis.five_second_test.overall

    # Weighted: Triangle 70%, 5-second 30%
    overall = (triangle_score * 0.7) + (five_sec * 0.3)

    return round(overall)


def interpret_score(score: int) -> str:
    """Interpret overall score."""
    if score >= 8:
        return "Strong appeal - optimize details"
    elif score >= 6:
        return "Good foundation - address notable gaps"
    elif score >= 4:
        return "Significant issues - prioritize fixes"
    else:
        return "Fundamental positioning problems - rethink approach"


def generate_recommendations(analysis: AppealAnalysis) -> List[Recommendation]:
    """Generate prioritized recommendations based on analysis."""

    recommendations = []

    # Check each triangle vertex
    for vertex_name, vertex in analysis.triangle.items():
        if vertex.overall.value < 5:
            recommendations.append(Recommendation(
                title=f"Improve {vertex.name}",
                description=f"{vertex.name} scored {vertex.overall.value}/10. {vertex.overall.reasoning}",
                impact="high",
                effort="medium",
                priority=Priority.IMMEDIATE
            ))

        # Check sub-scores
        for sub_name, sub_score in vertex.sub_scores.items():
            if sub_score.value < 4:
                recommendations.append(Recommendation(
                    title=f"Fix {sub_name.replace('_', ' ').title()}",
                    description=sub_score.reasoning,
                    impact="medium",
                    effort="low",
                    priority=Priority.IMMEDIATE
                ))

    # Check 5-second test
    fst = analysis.five_second_test
    if fst.what_is_this.value < 5:
        recommendations.append(Recommendation(
            title="Clarify product category",
            description="Visitors don't immediately understand what this is",
            impact="high",
            effort="low",
            priority=Priority.IMMEDIATE
        ))

    if fst.core_promise.value < 5:
        recommendations.append(Recommendation(
            title="Strengthen headline value proposition",
            description="Core promise isn't immediately clear",
            impact="high",
            effort="low",
            priority=Priority.IMMEDIATE
        ))

    # Check objections
    unaddressed = [o for o in analysis.objections if not o.addressed]
    for objection in unaddressed[:3]:  # Top 3 unaddressed
        recommendations.append(Recommendation(
            title=f"Address objection: {objection.objection}",
            description=objection.recommendation or "Add content addressing this concern",
            impact="medium",
            effort="medium",
            priority=Priority.MEDIUM
        ))

    return recommendations


def serialize_analysis(analysis: AppealAnalysis) -> dict:
    """Convert analysis to JSON-serializable dict."""

    def convert(obj):
        if isinstance(obj, Enum):
            return obj.value
        elif hasattr(obj, '__dataclass_fields__'):
            return {k: convert(v) for k, v in asdict(obj).items()}
        elif isinstance(obj, dict):
            return {k: convert(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert(i) for i in obj]
        return obj

    return convert(analysis)


def print_template():
    """Print empty template for manual analysis."""
    analysis = create_empty_analysis()
    print(json.dumps(serialize_analysis(analysis), indent=2))


def print_summary(analysis: AppealAnalysis):
    """Print human-readable summary."""

    print("\n" + "="*60)
    print("PRODUCT APPEAL ANALYSIS")
    print("="*60 + "\n")

    # Overall score
    overall = calculate_overall_score(analysis)
    print(f"OVERALL APPEAL SCORE: {overall}/10")
    print(f"Interpretation: {interpret_score(overall)}\n")

    # Triangle scores
    print("DESIRABILITY TRIANGLE:")
    print("-"*40)
    for name, vertex in analysis.triangle.items():
        print(f"  {vertex.name}: {vertex.overall.value}/10")
    print()

    # 5-Second Test
    print("5-SECOND TEST:")
    print("-"*40)
    fst = analysis.five_second_test
    print(f"  What is this:     {fst.what_is_this.value}/10")
    print(f"  Who is it for:    {fst.who_is_it_for.value}/10")
    print(f"  Core promise:     {fst.core_promise.value}/10")
    print(f"  Next action:      {fst.next_action.value}/10")
    print()

    # Top recommendations
    recommendations = generate_recommendations(analysis)
    if recommendations:
        print("TOP RECOMMENDATIONS:")
        print("-"*40)
        for i, rec in enumerate(recommendations[:5], 1):
            print(f"  {i}. [{rec.priority.value.upper()}] {rec.title}")
            print(f"     {rec.description}")
        print()

    print("="*60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Product Appeal Scorer - Analyze product desirability"
    )
    parser.add_argument("url", nargs="?", help="URL to analyze")
    parser.add_argument("--template", action="store_true",
                       help="Print empty template for manual analysis")
    parser.add_argument("--input", "-i", type=str,
                       help="Read analysis from JSON file")
    parser.add_argument("--output", "-o", type=str,
                       help="Write analysis to JSON file")
    parser.add_argument("--summary", action="store_true",
                       help="Print human-readable summary")

    args = parser.parse_args()

    if args.template:
        print_template()
        return

    if args.input:
        with open(args.input, 'r') as f:
            data = json.load(f)
        # Reconstruct analysis from JSON
        print(f"Loaded analysis from {args.input}")
        # For now, just print summary
        print(json.dumps(data, indent=2))
        return

    if args.url:
        print(f"URL analysis requires Claude to populate scores.")
        print(f"Use --template to get empty template, fill it, then use --input")
        print(f"\nTarget URL: {args.url}")
        analysis = create_empty_analysis()
        analysis.url = args.url

        if args.output:
            with open(args.output, 'w') as f:
                json.dump(serialize_analysis(analysis), f, indent=2)
            print(f"\nTemplate written to {args.output}")
        else:
            print_template()
        return

    # Default: show usage
    parser.print_help()


if __name__ == "__main__":
    main()
