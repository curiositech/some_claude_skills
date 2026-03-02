#!/usr/bin/env python3
"""
Skill Validation Script — Frontmatter + Structure + Quality

Validates skills against the rules that cause Claude Code to reject or mishandle them,
plus quality standards from skill-architect.

Usage:
    python scripts/validate_skill.py .claude/skills/my-skill
    python scripts/validate_skill.py .claude/skills/my-skill --strict
    python scripts/validate_skill.py --all                                # Validate every skill
    python scripts/validate_skill.py --all --json                         # JSON output for CI
    python scripts/validate_skill.py --all --errors-only                  # Only show failures
"""

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Dict, Set


# ──────────────────────────────────────────────────────────────────────
# Constants: What Claude Code actually accepts
# ──────────────────────────────────────────────────────────────────────

# Required by Claude Code runtime
REQUIRED_FIELDS = {"name", "description"}

# Optional fields Claude Code recognizes
VALID_OPTIONAL_FIELDS = {
    "allowed-tools",
    "argument-hint",
    "license",
    "disable-model-invocation",
    "user-invocable",
    "context",
    "agent",
    "model",
    "hooks",
    "metadata",
}

# Keys that look valid but are confusing/wrong
INVALID_KEYS = {
    "tools": "Use 'allowed-tools' instead",
    "integrates_with": "Move to SKILL.md body text",
    "triggers": "Use 'description' keywords instead",
    "outputs": "Use SKILL.md Output Format section",
    "coordinates_with": "Move to SKILL.md body text",
    "python_dependencies": "Move to SKILL.md body text",
    "requires": "Move to SKILL.md body text",
    "requires-mcp": "Not a valid field — skills cannot declare MCP dependencies",
    "dependencies": "Move to SKILL.md body text",
}

# Custom keys that are SAFE (silently ignored by runtime, used by tooling)
# NOTE: category, tags, pairs-with, badge now belong under metadata: block
KNOWN_CUSTOM_KEYS = {
    "version",
    "author", "created", "updated",
}

# Keys that belong under metadata: (warn if found at top level)
METADATA_NESTED_KEYS = {
    "category": "Move under 'metadata:' block",
    "tags": "Move under 'metadata:' block",
    "pairs-with": "Move under 'metadata:' block",
    "badge": "Move under 'metadata:' block",
}

# All tools Claude Code can gate
VALID_TOOLS = {
    "Read", "Write", "Edit", "MultiEdit",
    "Bash", "Grep", "Glob",
    "WebFetch", "WebSearch",
    "Task", "NotebookEdit", "NotebookRead",
    "EnterPlanMode", "ExitPlanMode",
    "AskUserQuestion", "TodoWrite",
}

# Valid values for specific fields
VALID_CONTEXT_VALUES = {"fork"}
VALID_MODEL_VALUES = {"sonnet", "opus", "haiku"}

# Line count thresholds
MAX_LINES_WARNING = 500
MAX_LINES_ERROR = 800


# ──────────────────────────────────────────────────────────────────────
# YAML Frontmatter Parser (lightweight, no PyYAML dependency)
# ──────────────────────────────────────────────────────────────────────

def parse_frontmatter(content: str) -> tuple[Optional[Dict[str, str]], str, Optional[str]]:
    """
    Parse YAML frontmatter from SKILL.md content.
    Returns (frontmatter_dict, body, error_message).
    Handles simple key: value, quoted strings, and multi-line descriptions.
    """
    if not content.startswith("---"):
        return None, content, "Missing YAML frontmatter delimiter (---)"

    # Find closing ---
    end_match = re.search(r"\n---\s*\n", content[3:])
    if not end_match:
        return None, content, "Missing closing frontmatter delimiter (---)"

    fm_text = content[4 : 3 + end_match.start()]
    body = content[3 + end_match.end() :]

    result = {}
    current_key = None
    current_value_lines = []

    for line in fm_text.split("\n"):
        # Key: value line
        key_match = re.match(r"^(\w[\w-]*):\s*(.*)", line)
        if key_match:
            # Save previous key if accumulating multi-line
            if current_key and current_value_lines:
                result[current_key] = " ".join(current_value_lines).strip()

            current_key = key_match.group(1)
            value = key_match.group(2).strip()

            # Strip surrounding quotes
            if value and value[0] in ('"', "'") and value[-1] == value[0]:
                value = value[1:-1]

            if value:
                result[current_key] = value
                current_value_lines = []
                current_key = None  # Single-line, done
            else:
                current_value_lines = []  # Multi-line follows

        elif current_key and line.startswith("  "):
            # Continuation of multi-line value
            current_value_lines.append(line.strip())
        elif current_key and line.strip() == "":
            continue
        # Sub-keys (e.g., metadata, hooks, tags, pairs-with) — collect as string
        elif current_key and line.startswith("  "):
            current_value_lines.append(line.strip())

    # Don't forget last key
    if current_key and current_value_lines:
        result[current_key] = " ".join(current_value_lines).strip()

    return result, body, None


# ──────────────────────────────────────────────────────────────────────
# Validation Result
# ──────────────────────────────────────────────────────────────────────

@dataclass
class ValidationResult:
    check: str
    passed: bool
    message: str
    severity: str  # 'error', 'warning', 'suggestion'


@dataclass
class SkillReport:
    skill_name: str
    skill_path: str
    results: List[ValidationResult] = field(default_factory=list)

    @property
    def errors(self) -> List[ValidationResult]:
        return [r for r in self.results if not r.passed and r.severity == "error"]

    @property
    def warnings(self) -> List[ValidationResult]:
        return [r for r in self.results if not r.passed and r.severity == "warning"]

    @property
    def suggestions(self) -> List[ValidationResult]:
        return [r for r in self.results if not r.passed and r.severity == "suggestion"]

    @property
    def passed(self) -> bool:
        return len(self.errors) == 0

    def to_dict(self) -> dict:
        return {
            "skill": self.skill_name,
            "path": self.skill_path,
            "passed": self.passed,
            "errors": len(self.errors),
            "warnings": len(self.warnings),
            "results": [
                {"check": r.check, "passed": r.passed, "message": r.message, "severity": r.severity}
                for r in self.results
                if not r.passed
            ],
        }


# ──────────────────────────────────────────────────────────────────────
# Validator
# ──────────────────────────────────────────────────────────────────────

class SkillValidator:
    def __init__(self, skill_path: Path, strict: bool = False):
        self.skill_path = skill_path
        self.strict = strict
        self.report = SkillReport(
            skill_name=skill_path.name,
            skill_path=str(skill_path),
        )

    def add(self, check: str, passed: bool, message: str, severity: str = "error"):
        self.report.results.append(ValidationResult(check, passed, message, severity))

    def validate(self) -> SkillReport:
        # Structure checks
        if not self.skill_path.exists() or not self.skill_path.is_dir():
            self.add("dir_exists", False, f"Directory not found: {self.skill_path}")
            return self.report

        skill_md = self.skill_path / "SKILL.md"
        if not skill_md.exists():
            self.add("skill_md_exists", False, "SKILL.md file not found")
            return self.report

        content = skill_md.read_text(encoding="utf-8")

        # Frontmatter
        fm, body, parse_error = parse_frontmatter(content)
        if parse_error:
            self.add("frontmatter_parse", False, parse_error)
            return self.report

        self.add("frontmatter_parse", True, "Frontmatter parses correctly")

        # Required fields
        self._check_required_fields(fm)

        # Invalid keys
        self._check_invalid_keys(fm)

        # Metadata sub-fields
        self._check_metadata_fields(fm)

        # Name format
        self._check_name_format(fm)

        # Description quality
        self._check_description(fm)

        # allowed-tools syntax
        self._check_allowed_tools(fm)

        # Field value validation
        self._check_field_values(fm)

        # Line count
        self._check_line_count(content)

        # Phantom files
        self._check_phantom_references(content)

        # Quality checks
        self._check_not_clause_in_body(body)
        self._check_mermaid_diagrams(body)
        self._check_anti_patterns(body)

        return self.report

    def _check_required_fields(self, fm: dict):
        for field_name in REQUIRED_FIELDS:
            if field_name in fm and fm[field_name]:
                self.add(f"required_{field_name}", True, f"Has required field: {field_name}")
            else:
                self.add(f"required_{field_name}", False, f"Missing required field: {field_name}")

    def _check_invalid_keys(self, fm: dict):
        all_valid = REQUIRED_FIELDS | VALID_OPTIONAL_FIELDS | KNOWN_CUSTOM_KEYS
        for key in fm:
            if key in INVALID_KEYS:
                self.add(
                    f"invalid_key_{key}",
                    False,
                    f"Invalid key '{key}' — {INVALID_KEYS[key]}",
                    severity="error",
                )
            elif key in METADATA_NESTED_KEYS:
                self.add(
                    f"metadata_nested_{key}",
                    False,
                    f"Key '{key}' at top level — {METADATA_NESTED_KEYS[key]}",
                    severity="warning",
                )
            elif key not in all_valid:
                self.add(
                    f"unknown_key_{key}",
                    False,
                    f"Unknown key '{key}' — will be ignored by Claude Code. If custom, add to KNOWN_CUSTOM_KEYS",
                    severity="suggestion",
                )

    def _check_metadata_fields(self, fm: dict):
        """Validate metadata sub-fields if present."""
        metadata = fm.get("metadata")
        if not metadata or not isinstance(metadata, str):
            # Our lightweight parser returns metadata as a string blob — skip deep validation
            return

        # If we have a proper dict (from full YAML parser), validate types
        if isinstance(metadata, dict):
            if "private" in metadata:
                val = metadata["private"]
                if not isinstance(val, bool) and str(val).lower() not in ("true", "false"):
                    self.add("metadata_private_type", False, f"metadata.private should be boolean, got '{val}'", severity="error")
            if "deprecated" in metadata:
                val = metadata["deprecated"]
                if not isinstance(val, bool) and str(val).lower() not in ("true", "false"):
                    self.add("metadata_deprecated_type", False, f"metadata.deprecated should be boolean, got '{val}'", severity="error")

    def _check_name_format(self, fm: dict):
        name = fm.get("name", "")
        if not name:
            return

        # Must be lowercase-hyphenated
        if re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", name):
            self.add("name_format", True, f"Name '{name}' is lowercase-hyphenated")
        else:
            # Check specific issues
            if " " in name:
                self.add("name_format", False, f"Name '{name}' contains spaces — use hyphens")
            elif name != name.lower():
                self.add("name_format", False, f"Name '{name}' contains uppercase — use lowercase")
            elif "_" in name:
                self.add("name_format", False, f"Name '{name}' uses underscores — use hyphens")
            else:
                self.add("name_format", False, f"Name '{name}' contains invalid characters")

        # Name should match directory name
        dir_name = self.skill_path.name
        if name != dir_name:
            self.add(
                "name_matches_dir",
                False,
                f"Name '{name}' doesn't match directory '{dir_name}'",
                severity="warning",
            )

    def _check_description(self, fm: dict):
        desc = fm.get("description", "")
        if not desc:
            return

        # Length
        if len(desc) < 30:
            self.add("desc_length", False, f"Description too short ({len(desc)} chars, minimum 30)", severity="warning")
        elif len(desc) > 500:
            self.add("desc_length", False, f"Description too long ({len(desc)} chars, max 500 recommended)", severity="warning")
        else:
            self.add("desc_length", True, f"Description length OK ({len(desc)} chars)")

        # NOT clause
        not_patterns = [r"\bNOT\s+for\b", r"\bNot\s+for\b", r"\bnot\s+for\b"]
        has_not = any(re.search(p, desc) for p in not_patterns)
        if has_not:
            self.add("desc_not_clause", True, "Description has NOT clause")
        else:
            self.add("desc_not_clause", False, "Description missing NOT clause — add 'NOT for [exclusions]'", severity="warning")

        # Keywords (should have domain-specific trigger words)
        # Check if description has at least some quoted or specific terms
        keyword_indicators = ['"', "activate on", "use when", "use for"]
        has_keywords = any(k in desc.lower() for k in keyword_indicators)
        if has_keywords:
            self.add("desc_keywords", True, "Description includes activation keywords/triggers")
        else:
            self.add("desc_keywords", False, "Description may lack specific trigger keywords", severity="suggestion")

    def _check_allowed_tools(self, fm: dict):
        tools_str = fm.get("allowed-tools", "")
        if not tools_str:
            # allowed-tools is optional (not required by Claude Code)
            self.add("allowed_tools_present", True, "allowed-tools not specified (all tools available)")
            return

        # Smart split: split on commas NOT inside parentheses
        tools = self._split_tools(tools_str)
        for tool in tools:
            tool = tool.strip()
            if not tool:
                continue

            # Handle Bash with scope: Bash(npm run *), Bash(npm:*,npx:*)
            base_tool = re.match(r"^([\w-]+)(\(.+\))?$", tool)
            if not base_tool:
                # Check if it's an MCP tool with hyphens
                if re.match(r"^mcp__[\w-]+__[\w-]+$", tool):
                    continue  # Valid MCP tool
                self.add("allowed_tools_syntax", False, f"Malformed tool entry: '{tool}'")
                continue

            tool_name = base_tool.group(1)
            tool_scope = base_tool.group(2)

            if tool_name.startswith("mcp__"):
                # MCP tool reference: mcp__<server>__<tool> (hyphens OK in names)
                if re.match(r"^mcp__[\w-]+__[\w-]+$", tool_name):
                    continue  # Valid MCP tool
                else:
                    self.add("allowed_tools_mcp", False, f"Malformed MCP tool: '{tool_name}' — format is mcp__<server>__<tool>")
            elif tool_name not in VALID_TOOLS:
                self.add("allowed_tools_unknown", False, f"Unknown tool: '{tool_name}'", severity="warning")

            # Check Bash scope syntax
            if tool_name == "Bash" and tool_scope:
                scope_content = tool_scope[1:-1]  # Strip parens
                # Warn about deprecated :* syntax
                if re.search(r"\w:\*", scope_content) and " " not in scope_content:
                    self.add(
                        "bash_scope_deprecated",
                        False,
                        f"Bash scope '{scope_content}' may use deprecated ':*' syntax — prefer 'Bash(npm run *)' with space before *",
                        severity="warning",
                    )

        self.add("allowed_tools_syntax", True, f"allowed-tools syntax OK ({len(tools)} tools)")

    @staticmethod
    def _split_tools(tools_str: str) -> List[str]:
        """Split comma-separated tools, respecting parenthesized groups like Bash(npm:*,npx:*)"""
        tools = []
        depth = 0
        current = []
        for char in tools_str:
            if char == "(":
                depth += 1
                current.append(char)
            elif char == ")":
                depth -= 1
                current.append(char)
            elif char == "," and depth == 0:
                tools.append("".join(current).strip())
                current = []
            else:
                current.append(char)
        if current:
            tools.append("".join(current).strip())
        return tools

    def _check_field_values(self, fm: dict):
        # context field
        context = fm.get("context", "")
        if context and context not in VALID_CONTEXT_VALUES:
            self.add("context_value", False, f"Invalid context value: '{context}' — valid values: {VALID_CONTEXT_VALUES}", severity="warning")

        # model field
        model = fm.get("model", "")
        if model and model not in VALID_MODEL_VALUES:
            self.add("model_value", False, f"Invalid model value: '{model}' — valid values: {VALID_MODEL_VALUES}", severity="warning")

        # disable-model-invocation should be boolean-like
        dmi = fm.get("disable-model-invocation", "")
        if dmi and dmi.lower() not in ("true", "false"):
            self.add("dmi_value", False, f"disable-model-invocation should be 'true' or 'false', got '{dmi}'")

        # user-invocable should be boolean-like
        ui = fm.get("user-invocable", "")
        if ui and ui.lower() not in ("true", "false"):
            self.add("ui_value", False, f"user-invocable should be 'true' or 'false', got '{ui}'")

    def _check_line_count(self, content: str):
        lines = content.count("\n") + 1
        if lines > MAX_LINES_ERROR:
            self.add("line_count", False, f"SKILL.md is {lines} lines — max recommended is {MAX_LINES_WARNING}, move content to references/")
        elif lines > MAX_LINES_WARNING:
            self.add("line_count", False, f"SKILL.md is {lines} lines — consider moving depth to references/ (target <{MAX_LINES_WARNING})", severity="warning")
        else:
            self.add("line_count", True, f"SKILL.md is {lines} lines (under {MAX_LINES_WARNING} limit)")

    def _check_phantom_references(self, content: str):
        """Check that files referenced in SKILL.md actually exist.
        Skips references inside fenced code blocks (template examples)."""
        # Strip fenced code blocks to avoid matching template examples
        stripped = re.sub(r"```[\s\S]*?```", "", content)

        # Find references like `references/foo.md` or `scripts/bar.py`
        ref_pattern = re.compile(r"`(references/[\w./-]+|scripts/[\w./-]+)`")
        phantoms = []

        for match in ref_pattern.finditer(stripped):
            ref_path = self.skill_path / match.group(1)
            if not ref_path.exists():
                phantoms.append(match.group(1))

        if phantoms:
            for phantom in phantoms:
                self.add("phantom_file", False, f"Referenced file does not exist: {phantom}")
        else:
            ref_count = len(ref_pattern.findall(content))
            if ref_count > 0:
                self.add("phantom_files", True, f"All {ref_count} referenced files exist")

    def _check_not_clause_in_body(self, body: str):
        """Check for 'NOT for' section in body (in addition to description)"""
        not_section = re.search(r"NOT\s+for|❌\s+NOT\s+for", body)
        if not_section:
            self.add("body_not_clause", True, "Body has NOT-for section")
        else:
            self.add("body_not_clause", False, "Body missing NOT-for section in 'When to Use'", severity="suggestion")

    def _check_mermaid_diagrams(self, body: str):
        mermaid_count = body.count("```mermaid")
        if mermaid_count > 0:
            self.add("has_mermaid", True, f"Has {mermaid_count} Mermaid diagram(s)")
        else:
            self.add("has_mermaid", False, "No Mermaid diagrams — consider adding for processes/decisions", severity="suggestion")

    def _check_anti_patterns(self, body: str):
        anti_pattern = re.search(r"anti.?pattern|novice.*expert|shibboleth", body, re.IGNORECASE)
        if anti_pattern:
            self.add("has_antipatterns", True, "Has anti-pattern documentation")
        else:
            self.add("has_antipatterns", False, "No anti-patterns found — add at least one shibboleth", severity="suggestion")


# ──────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────

def find_all_skills(base_path: Path) -> List[Path]:
    """Find all skill directories under the given path"""
    skills = []
    skills_dir = base_path / ".claude" / "skills"
    if skills_dir.exists():
        for item in sorted(skills_dir.iterdir()):
            if item.is_dir() and (item / "SKILL.md").exists():
                skills.append(item)
    return skills


def print_report(report: SkillReport, errors_only: bool = False):
    """Print a human-readable report"""
    if errors_only and report.passed and not report.warnings:
        return

    icon = "✅" if report.passed else "❌"
    print(f"\n{icon} {report.skill_name}")

    if not report.passed:
        for r in report.errors:
            print(f"   🔴 {r.message}")

    for r in report.warnings:
        print(f"   🟡 {r.message}")

    if not errors_only:
        for r in report.suggestions:
            print(f"   🔵 {r.message}")


def print_summary(reports: List[SkillReport]):
    """Print summary across all skills"""
    total = len(reports)
    passed = sum(1 for r in reports if r.passed)
    with_warnings = sum(1 for r in reports if r.warnings)

    print(f"\n{'='*60}")
    print(f"VALIDATION SUMMARY: {passed}/{total} skills pass ({total - passed} with errors)")
    if with_warnings:
        print(f"  {with_warnings} skills have warnings")

    # Common issues
    issue_counts: Dict[str, int] = {}
    for report in reports:
        for result in report.results:
            if not result.passed:
                key = result.check.split("_")[0] if "_" in result.check else result.check
                issue_counts[key] = issue_counts.get(key, 0) + 1

    if issue_counts:
        print(f"\n  Most common issues:")
        for issue, count in sorted(issue_counts.items(), key=lambda x: -x[1])[:5]:
            print(f"    {count:3d}x  {issue}")

    print(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(
        description="Validate Claude Code skill frontmatter and structure",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/validate_skill.py .claude/skills/my-skill
  python scripts/validate_skill.py .claude/skills/my-skill --strict
  python scripts/validate_skill.py --all
  python scripts/validate_skill.py --all --json
  python scripts/validate_skill.py --all --errors-only
        """,
    )
    parser.add_argument("skill_path", nargs="?", help="Path to skill directory")
    parser.add_argument("--all", action="store_true", help="Validate all skills")
    parser.add_argument("--strict", action="store_true", help="Fail on warnings too")
    parser.add_argument("--json", action="store_true", help="JSON output")
    parser.add_argument("--errors-only", action="store_true", help="Only show failures")
    parser.add_argument("--base", default=".", help="Base project directory (default: .)")

    args = parser.parse_args()

    if not args.skill_path and not args.all:
        parser.error("Provide a skill path or use --all")

    base = Path(args.base).resolve()

    if args.all:
        skills = find_all_skills(base)
        if not skills:
            print(f"No skills found under {base}/.claude/skills/")
            return 1

        reports = []
        for skill_path in skills:
            validator = SkillValidator(skill_path, strict=args.strict)
            report = validator.validate()
            reports.append(report)

        if args.json:
            print(json.dumps([r.to_dict() for r in reports], indent=2))
        else:
            for report in reports:
                print_report(report, errors_only=args.errors_only)
            print_summary(reports)

        failed = sum(1 for r in reports if not r.passed)
        return 1 if failed > 0 else 0

    else:
        skill_path = Path(args.skill_path).resolve()
        validator = SkillValidator(skill_path, strict=args.strict)
        report = validator.validate()

        if args.json:
            print(json.dumps(report.to_dict(), indent=2))
        else:
            print_report(report)
            print(f"\n  {len(report.errors)} errors, {len(report.warnings)} warnings, {len(report.suggestions)} suggestions")
            if report.passed:
                print("  ✅ Skill passes validation")
            else:
                print("  ❌ Skill has errors that must be fixed")

        return 0 if report.passed else 1


if __name__ == "__main__":
    sys.exit(main())
