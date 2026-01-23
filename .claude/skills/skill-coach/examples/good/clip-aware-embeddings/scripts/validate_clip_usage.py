#!/usr/bin/env python3
"""
CLIP Usage Validator - Checks if CLIP is appropriate for a given query

This demonstrates domain-specific validation that encodes expert knowledge.
"""

import sys
import re
from enum import Enum
from dataclasses import dataclass
from typing import Optional


class TaskType(Enum):
    SEMANTIC_SEARCH = "semantic_search"
    COUNTING = "counting"
    FINE_GRAINED = "fine_grained"
    SPATIAL = "spatial"
    COMPOSITIONAL = "compositional"
    ZERO_SHOT = "zero_shot"


@dataclass
class ValidationResult:
    is_appropriate: bool
    task_type: TaskType
    confidence: float
    reason: str
    alternative: Optional[str] = None


class CLIPValidator:
    """Validates whether CLIP is appropriate for a given task."""
    
    # Keywords that indicate specific task types
    COUNTING_KEYWORDS = [
        'how many', 'count', 'number of', 'total', 'quantity',
        'several', 'few', 'multiple'
    ]
    
    SPATIAL_KEYWORDS = [
        'left', 'right', 'above', 'below', 'next to', 'beside',
        'between', 'in front', 'behind', 'under', 'over', 'near'
    ]
    
    FINE_GRAINED_DOMAINS = [
        'celebrity', 'celebrities', 'actor', 'actress',
        'car model', 'vehicle model', 'car make',
        'flower species', 'bird species', 'dog breed',
        'person', 'face', 'people'
    ]
    
    COMPOSITIONAL_PATTERNS = [
        r'(\w+)\s+(\w+)\s+and\s+(\w+)\s+(\w+)',  # "red car and blue truck"
        r'both\s+',
        r'neither\s+',
        r'either\s+',
    ]
    
    GOOD_USE_CASES = [
        'find images', 'search for', 'similar to', 'looks like',
        'classify', 'categorize', 'what is this', 'identify',
        'semantic', 'concept', 'theme'
    ]
    
    def validate(self, query: str) -> ValidationResult:
        """
        Validate if CLIP is appropriate for the query.
        
        Args:
            query: Natural language query
            
        Returns:
            ValidationResult with recommendation
        """
        query_lower = query.lower()
        
        # Check for counting tasks
        if any(kw in query_lower for kw in self.COUNTING_KEYWORDS):
            return ValidationResult(
                is_appropriate=False,
                task_type=TaskType.COUNTING,
                confidence=0.95,
                reason="Query requires counting objects. CLIP cannot preserve spatial information needed for counting.",
                alternative="Use object detection models: DETR, Faster R-CNN, YOLO"
            )
        
        # Check for spatial reasoning
        if any(kw in query_lower for kw in self.SPATIAL_KEYWORDS):
            return ValidationResult(
                is_appropriate=False,
                task_type=TaskType.SPATIAL,
                confidence=0.90,
                reason="Query requires spatial understanding. CLIP's embeddings lose spatial topology.",
                alternative="Use spatial reasoning models: GQA, SWIG, Visual Genome models"
            )
        
        # Check for fine-grained classification
        if any(domain in query_lower for domain in self.FINE_GRAINED_DOMAINS):
            return ValidationResult(
                is_appropriate=False,
                task_type=TaskType.FINE_GRAINED,
                confidence=0.85,
                reason="Query requires fine-grained classification. CLIP trained on coarse categories.",
                alternative="Use specialized models: Fine-tuned ResNet/EfficientNet for the specific domain"
            )
        
        # Check for compositional reasoning
        if any(re.search(pattern, query_lower) for pattern in self.COMPOSITIONAL_PATTERNS):
            return ValidationResult(
                is_appropriate=False,
                task_type=TaskType.COMPOSITIONAL,
                confidence=0.80,
                reason="Query requires attribute binding. CLIP cannot bind attributes to specific objects.",
                alternative="Use compositional models: DCSMs (Dense Cosine Similarity Maps), PC-CLIP"
            )
        
        # Check if it's a good CLIP use case
        if any(use_case in query_lower for use_case in self.GOOD_USE_CASES):
            return ValidationResult(
                is_appropriate=True,
                task_type=TaskType.SEMANTIC_SEARCH,
                confidence=0.90,
                reason="Query is appropriate for CLIP: semantic search or broad categorization.",
                alternative=None
            )
        
        # Default: probably okay but lower confidence
        return ValidationResult(
            is_appropriate=True,
            task_type=TaskType.ZERO_SHOT,
            confidence=0.60,
            reason="Query appears suitable for CLIP, but verify results carefully.",
            alternative="If results are poor, consider task-specific models"
        )


def print_result(query: str, result: ValidationResult):
    """Pretty-print validation results."""
    print("\n" + "="*70)
    print(f"CLIP USAGE VALIDATION")
    print("="*70)
    print(f"\nQuery: {query}")
    print(f"Task Type: {result.task_type.value}")
    print(f"Confidence: {result.confidence:.0%}")
    print()
    
    if result.is_appropriate:
        print("✅ CLIP IS APPROPRIATE")
        print(f"\nReason: {result.reason}")
        if result.alternative:
            print(f"\n💡 Note: {result.alternative}")
    else:
        print("❌ CLIP IS NOT APPROPRIATE")
        print(f"\nReason: {result.reason}")
        print(f"\n💡 Use Instead: {result.alternative}")
    
    print("\n" + "="*70 + "\n")


def run_examples():
    """Run validation on example queries."""
    examples = [
        "Find images of beaches at sunset",
        "How many cars are in this image?",
        "Identify which celebrity this is",
        "Is the cat to the left or right of the dog?",
        "Find images with a red car and a blue truck",
        "Classify this image as indoor or outdoor",
    ]
    
    validator = CLIPValidator()
    
    print("\n" + "="*70)
    print("EXAMPLE VALIDATIONS")
    print("="*70)
    
    for query in examples:
        result = validator.validate(query)
        print(f"\n{query}")
        print(f"  → {'✅ CLIP' if result.is_appropriate else '❌ Alternative'}: {result.task_type.value}")
        if not result.is_appropriate:
            print(f"  → {result.alternative}")
    
    print("\n" + "="*70 + "\n")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python validate_clip_usage.py 'your query here'")
        print("  python validate_clip_usage.py --examples")
        print("\nExample:")
        print("  python validate_clip_usage.py 'Find images of mountains'")
        sys.exit(1)
    
    if sys.argv[1] == '--examples':
        run_examples()
        return
    
    query = ' '.join(sys.argv[1:])
    validator = CLIPValidator()
    result = validator.validate(query)
    print_result(query, result)
    
    # Exit code: 0 if appropriate, 1 if not
    sys.exit(0 if result.is_appropriate else 1)


if __name__ == '__main__':
    main()
