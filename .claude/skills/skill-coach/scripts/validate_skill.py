#!/usr/bin/env python3
"""
Skill Validator - Pre-flight checks for Agent Skills

Validates skill structure, content quality, and best practices.
"""

import os
import sys
import re
import yaml
from pathlib import Path
from typing import List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum


class Severity(Enum):
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"


@dataclass
class ValidationIssue:
    severity: Severity
    message: str
    line: int = None
    suggestion: str = None


class SkillValidator:
    def __init__(self, skill_path: str):
        self.skill_path = Path(skill_path)
        self.issues: List[ValidationIssue] = []
        self.skill_md = self.skill_path / "SKILL.md"
        
    def validate(self) -> List[ValidationIssue]:
        """Run all validation checks."""
        self.check_structure()
        self.check_skill_md()
        self.check_description_quality()
        self.check_progressive_disclosure()
        self.check_antipatterns_section()
        self.check_usage_sections()
        self.check_allowed_tools()
        return self.issues
    
    def check_structure(self):
        """Verify required files and folders exist."""
        if not self.skill_path.exists():
            self.issues.append(ValidationIssue(
                Severity.ERROR,
                f"Skill directory not found: {self.skill_path}"
            ))
            return
        
        if not self.skill_md.exists():
            self.issues.append(ValidationIssue(
                Severity.ERROR,
                "SKILL.md file missing"
            ))
            return
        
        # Check for recommended structure
        scripts_dir = self.skill_path / "scripts"
        if not scripts_dir.exists():
            self.issues.append(ValidationIssue(
                Severity.INFO,
                "No /scripts directory found. Consider adding validation or example scripts."
            ))
        
        references_dir = self.skill_path / "references"
        if not references_dir.exists():
            self.issues.append(ValidationIssue(
                Severity.INFO,
                "No /references directory. Consider splitting detailed docs into references."
            ))
    
    def check_skill_md(self):
        """Validate SKILL.md content and structure."""
        with open(self.skill_md, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for YAML frontmatter
        if not content.startswith('---'):
            self.issues.append(ValidationIssue(
                Severity.ERROR,
                "Missing YAML frontmatter. Must start with '---'"
            ))
            return
        
        # Extract frontmatter
        try:
            parts = content.split('---', 2)
            frontmatter = yaml.safe_load(parts[1])
        except Exception as e:
            self.issues.append(ValidationIssue(
                Severity.ERROR,
                f"Invalid YAML frontmatter: {e}"
            ))
            return
        
        # Check required fields
        if 'name' not in frontmatter:
            self.issues.append(ValidationIssue(
                Severity.ERROR,
                "Missing required field: name"
            ))
        else:
            # Validate name format
            name = frontmatter['name']
            if not re.match(r'^[a-z0-9-]+$', name):
                self.issues.append(ValidationIssue(
                    Severity.ERROR,
                    f"Invalid name format: '{name}'. Must use lowercase letters, numbers, and hyphens only."
                ))
            if len(name) > 64:
                self.issues.append(ValidationIssue(
                    Severity.ERROR,
                    f"Name too long: {len(name)} chars (max 64)"
                ))
        
        if 'description' not in frontmatter:
            self.issues.append(ValidationIssue(
                Severity.ERROR,
                "Missing required field: description"
            ))
        
        # Check line count
        lines = content.split('\n')
        if len(lines) > 500:
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                f"SKILL.md is {len(lines)} lines (recommended: <500). Consider splitting into /references."
            ))
    
    def check_description_quality(self):
        """Analyze description field quality."""
        with open(self.skill_md, 'r') as f:
            content = f.read()
        
        try:
            parts = content.split('---', 2)
            frontmatter = yaml.safe_load(parts[1])
            description = frontmatter.get('description', '')
        except:
            return  # Already reported in check_skill_md
        
        if not description:
            return
        
        # Check length
        if len(description) > 1024:
            self.issues.append(ValidationIssue(
                Severity.ERROR,
                f"Description too long: {len(description)} chars (max 1024)"
            ))
        
        if len(description) < 20:
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                "Description too short. Should explain what, when, and triggers."
            ))
        
        # Check for key components
        has_what = any(word in description.lower() for word in ['create', 'analyze', 'generate', 'process', 'handle', 'manage'])
        has_when = any(word in description.lower() for word in ['when', 'use for', 'use when', 'for'])
        
        if not has_what:
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                "Description should explain WHAT the skill does"
            ))
        
        if not has_when:
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                "Description should explain WHEN to use it",
                suggestion="Add: 'Use when...' or 'Use for...'"
            ))
        
        # Check for negative triggers (what NOT to use it for)
        has_not = 'not' in description.lower() or "don't" in description.lower()
        if not has_not:
            self.issues.append(ValidationIssue(
                Severity.INFO,
                "Consider adding what NOT to use this skill for to prevent false activation"
            ))
        
        # Check point of view (use word boundaries to avoid false positives like "skill" matching "i ")
        import re
        first_second_person = re.compile(r'\b(i|you|your|my|we|our)\b', re.IGNORECASE)
        if first_second_person.search(description):
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                "Description should use third person, not first/second person",
                suggestion="Change 'you can use this to...' to 'Use for...'"
            ))
    
    def check_progressive_disclosure(self):
        """Check for proper progressive disclosure structure."""
        with open(self.skill_md, 'r') as f:
            content = f.read()
        
        # Check for references to external files
        has_references = bool(re.search(r'/references/', content) or 
                             re.search(r'/scripts/', content))
        
        lines = content.split('\n')
        if len(lines) > 300 and not has_references:
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                "Long SKILL.md without references. Consider splitting detailed content.",
                suggestion="Move deep dives to /references/ and link from main file"
            ))
        
        # Check for "See X for details" patterns
        if len(lines) > 200:
            has_see_references = bool(re.search(r'See .* for', content))
            if not has_see_references:
                self.issues.append(ValidationIssue(
                    Severity.INFO,
                    "Consider adding 'See /references/X for...' to defer detailed content"
                ))
    
    def check_antipatterns_section(self):
        """Check if skill includes anti-pattern guidance."""
        with open(self.skill_md, 'r') as f:
            content = f.read().lower()
        
        has_antipatterns = any(term in content for term in [
            'anti-pattern', 'antipattern', 'common mistake', 
            'avoid', 'don\'t', 'deprecated', 'wrong'
        ])
        
        if not has_antipatterns:
            self.issues.append(ValidationIssue(
                Severity.INFO,
                "No anti-pattern guidance found. Consider adding common mistakes section.",
                suggestion="Add '## Common Anti-Patterns' section"
            ))

    def check_usage_sections(self):
        """Check for When to Use / NOT to Use sections."""
        with open(self.skill_md, 'r') as f:
            content = f.read().lower()

        has_when_to_use = any(pattern in content for pattern in [
            'when to use', 'use for:', '✅ use for'
        ])
        has_when_not = any(pattern in content for pattern in [
            'not for:', 'when not to', '❌ not for'
        ])

        if not has_when_to_use:
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                "Missing 'When to Use' section. Helps activation clarity.",
                suggestion="Add section listing what the skill is for"
            ))

        if not has_when_not:
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                "Missing 'When NOT to Use' section. Prevents false activation.",
                suggestion="Add section listing what the skill should NOT handle"
            ))

    def check_allowed_tools(self):
        """Validate allowed-tools field."""
        with open(self.skill_md, 'r') as f:
            content = f.read()
        
        try:
            parts = content.split('---', 2)
            frontmatter = yaml.safe_load(parts[1])
            allowed_tools = frontmatter.get('allowed-tools', '')
        except:
            return
        
        if not allowed_tools:
            self.issues.append(ValidationIssue(
                Severity.INFO,
                "No allowed-tools specified. Claude will ask for permission."
            ))
            return
        
        # Check for overly permissive tools
        tools = [t.strip() for t in str(allowed_tools).split(',')]
        
        if 'Bash' in tools and not any('Bash(' in t for t in tools):
            self.issues.append(ValidationIssue(
                Severity.WARNING,
                "Unrestricted Bash access. Consider scoping: Bash(git:*,npm:*)",
                suggestion="Restrict bash to specific commands"
            ))
        
        # Check for unnecessary tools
        body_content = content.split('---', 2)[2].lower()
        for tool in tools:
            tool_lower = tool.split('(')[0].lower()
            if tool_lower not in body_content:
                self.issues.append(ValidationIssue(
                    Severity.INFO,
                    f"Tool '{tool}' in allowed-tools but not mentioned in content"
                ))


def print_report(issues: List[ValidationIssue]):
    """Print validation report."""
    if not issues:
        print("✅ Validation passed! No issues found.")
        return
    
    errors = [i for i in issues if i.severity == Severity.ERROR]
    warnings = [i for i in issues if i.severity == Severity.WARNING]
    info = [i for i in issues if i.severity == Severity.INFO]
    
    print(f"\n{'='*60}")
    print(f"VALIDATION REPORT")
    print(f"{'='*60}\n")
    
    if errors:
        print(f"❌ ERRORS ({len(errors)}):")
        for issue in errors:
            print(f"  • {issue.message}")
            if issue.suggestion:
                print(f"    💡 {issue.suggestion}")
        print()
    
    if warnings:
        print(f"⚠️  WARNINGS ({len(warnings)}):")
        for issue in warnings:
            print(f"  • {issue.message}")
            if issue.suggestion:
                print(f"    💡 {issue.suggestion}")
        print()
    
    if info:
        print(f"ℹ️  SUGGESTIONS ({len(info)}):")
        for issue in info:
            print(f"  • {issue.message}")
            if issue.suggestion:
                print(f"    💡 {issue.suggestion}")
        print()
    
    print(f"{'='*60}")
    print(f"Summary: {len(errors)} errors, {len(warnings)} warnings, {len(info)} suggestions")
    print(f"{'='*60}\n")


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_skill.py <skill_path>")
        print("\nExample:")
        print("  python validate_skill.py ~/my-skill/")
        sys.exit(1)
    
    skill_path = sys.argv[1]
    
    print(f"Validating skill at: {skill_path}")
    print()
    
    validator = SkillValidator(skill_path)
    issues = validator.validate()
    
    print_report(issues)
    
    # Exit code based on errors
    errors = [i for i in issues if i.severity == Severity.ERROR]
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
