#!/usr/bin/env python3
"""
Self-Contained Skill Checker

Verifies that a skill ships working tools, not just instructions.
Detects: Phantom Tools, Template Soup, Incomplete MCPs, Missing Agents.

Usage: python check_self_contained.py <skill_path>
"""

import os
import sys
import re
import json
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Set


class Status(Enum):
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"
    SKIP = "SKIP"


@dataclass
class Check:
    name: str
    status: Status
    message: str
    details: List[str] = field(default_factory=list)


class SelfContainedChecker:
    """Check if a skill ships working tools."""

    # Markers that indicate template/placeholder code
    # Must be actual placeholders, not descriptions of anti-patterns
    TEMPLATE_MARKERS = [
        r'#\s*TODO:',                     # TODO: with colon (action item)
        r'//\s*TODO:',                    # JS TODO:
        r'#\s*FIXME:',                    # FIXME: with colon
        r'//\s*FIXME:',                   # JS FIXME:
        r'raise\s+NotImplementedError\(\)',  # Unimplemented function
        r'throw\s+new\s+Error\(["\']Not implemented',
        r'^\s*pass\s*$',                  # bare pass (placeholder)
        r'YOUR_[A-Z_]+_HERE',             # YOUR_API_KEY_HERE
        r'REPLACE_THIS',
        r'^\s*\.\.\.\s*$',                # bare ... placeholder
    ]

    def __init__(self, skill_path: str):
        self.skill_path = Path(skill_path)
        self.skill_md = self.skill_path / "SKILL.md"
        self.checks: List[Check] = []
        self.skill_content = ""

    def run(self) -> List[Check]:
        """Run all self-contained checks."""
        if not self.skill_path.exists():
            self.checks.append(Check(
                "Skill exists",
                Status.FAIL,
                f"Skill directory not found: {self.skill_path}"
            ))
            return self.checks

        if self.skill_md.exists():
            self.skill_content = self.skill_md.read_text()

        self.check_scripts()
        self.check_mcp_server()
        self.check_agents()
        self.check_referenced_files()
        self.summarize()

        return self.checks

    def check_scripts(self):
        """Check scripts/ directory for working code."""
        scripts_dir = self.skill_path / "scripts"

        if not scripts_dir.exists():
            # Check if skill mentions scripts but doesn't have them
            if re.search(r'scripts/', self.skill_content):
                self.checks.append(Check(
                    "Scripts directory",
                    Status.FAIL,
                    "SKILL.md references scripts/ but directory doesn't exist",
                    ["This is a Phantom Tools anti-pattern"]
                ))
            else:
                self.checks.append(Check(
                    "Scripts directory",
                    Status.SKIP,
                    "No scripts/ directory (not required)"
                ))
            return

        # Find all script files
        scripts = list(scripts_dir.glob("*.py")) + \
                  list(scripts_dir.glob("*.sh")) + \
                  list(scripts_dir.glob("*.js")) + \
                  list(scripts_dir.glob("*.ts"))

        if not scripts:
            self.checks.append(Check(
                "Scripts directory",
                Status.WARN,
                "scripts/ exists but contains no script files"
            ))
            return

        # Check each script for template markers
        template_scripts = []
        working_scripts = []

        for script in scripts:
            content = script.read_text()
            lines = content.split('\n')
            is_template = False
            markers_found = []

            for pattern in self.TEMPLATE_MARKERS:
                # Check each line for patterns with ^ anchors
                for line in lines:
                    # Skip lines that are defining string patterns (like in this checker)
                    stripped = line.strip()
                    if stripped.startswith(("r'", 'r"', "'", '"')):
                        continue
                    if re.search(pattern, line, re.IGNORECASE | re.MULTILINE):
                        is_template = True
                        if pattern not in markers_found:
                            markers_found.append(pattern)
                        break

            if is_template:
                template_scripts.append((script.name, markers_found))
            else:
                working_scripts.append(script.name)

        if template_scripts and not working_scripts:
            self.checks.append(Check(
                "Scripts quality",
                Status.FAIL,
                f"All {len(template_scripts)} scripts are templates, not working code",
                [f"  {name}: contains {markers}" for name, markers in template_scripts]
            ))
        elif template_scripts:
            self.checks.append(Check(
                "Scripts quality",
                Status.WARN,
                f"{len(template_scripts)} of {len(scripts)} scripts are templates",
                [f"  Template: {name}" for name, _ in template_scripts] +
                [f"  Working: {name}" for name in working_scripts]
            ))
        else:
            self.checks.append(Check(
                "Scripts quality",
                Status.PASS,
                f"All {len(working_scripts)} scripts appear to be working code",
                [f"  {name}" for name in working_scripts]
            ))

    def check_mcp_server(self):
        """Check mcp-server/ directory for complete implementation."""
        mcp_dir = self.skill_path / "mcp-server"

        if not mcp_dir.exists():
            # Only flag if skill claims to SHIP an MCP (path reference), not just discusses them
            # Look for: `mcp-server/`, "See mcp-server/", "Run mcp-server/"
            ships_mcp = re.search(r'`mcp-server/', self.skill_content) or \
                        re.search(r'[Ss]ee\s+mcp-server/', self.skill_content) or \
                        re.search(r'[Rr]un\s+.*mcp-server/', self.skill_content)
            if ships_mcp:
                self.checks.append(Check(
                    "MCP Server",
                    Status.FAIL,
                    "SKILL.md references mcp-server/ path but directory doesn't exist",
                    ["This is a Phantom Tools anti-pattern"]
                ))
            else:
                self.checks.append(Check(
                    "MCP Server",
                    Status.SKIP,
                    "No mcp-server/ directory (not required)"
                ))
            return

        issues = []
        passes = []

        # Check for package.json
        package_json = mcp_dir / "package.json"
        if not package_json.exists():
            issues.append("Missing package.json")
        else:
            passes.append("Has package.json")
            try:
                pkg = json.loads(package_json.read_text())
                if "dependencies" not in pkg and "devDependencies" not in pkg:
                    issues.append("package.json has no dependencies")
                if "@modelcontextprotocol/sdk" not in str(pkg):
                    issues.append("Missing @modelcontextprotocol/sdk dependency")
                else:
                    passes.append("Has MCP SDK dependency")
            except json.JSONDecodeError:
                issues.append("package.json is invalid JSON")

        # Check for source files
        src_files = list(mcp_dir.glob("src/*.ts")) + \
                    list(mcp_dir.glob("src/*.js")) + \
                    list(mcp_dir.glob("*.ts")) + \
                    list(mcp_dir.glob("*.js"))

        if not src_files:
            issues.append("No source files found")
        else:
            passes.append(f"Has {len(src_files)} source file(s)")

            # Check for template markers in source
            for src in src_files:
                content = src.read_text()
                for pattern in self.TEMPLATE_MARKERS:
                    if re.search(pattern, content, re.IGNORECASE):
                        issues.append(f"{src.name} contains template markers")
                        break

        # Check for README
        readme = mcp_dir / "README.md"
        if not readme.exists():
            issues.append("Missing README.md with installation instructions")
        else:
            passes.append("Has README.md")

        # Determine status
        if len(issues) >= 3:
            status = Status.FAIL
            msg = "MCP server is incomplete"
        elif issues:
            status = Status.WARN
            msg = "MCP server has issues"
        else:
            status = Status.PASS
            msg = "MCP server appears complete"

        self.checks.append(Check(
            "MCP Server",
            status,
            msg,
            [f"  ✓ {p}" for p in passes] + [f"  ✗ {i}" for i in issues]
        ))

    def check_agents(self):
        """Check agents/ directory for complete definitions."""
        agents_dir = self.skill_path / "agents"

        if not agents_dir.exists():
            # Only flag if skill claims to SHIP agents (path reference), not just discusses them
            ships_agents = re.search(r'`agents/', self.skill_content) or \
                           re.search(r'[Ss]ee\s+agents/', self.skill_content) or \
                           re.search(r'[Rr]un\s+.*agents/', self.skill_content)
            if ships_agents:
                self.checks.append(Check(
                    "Agents",
                    Status.FAIL,
                    "SKILL.md references agents/ path but directory doesn't exist",
                    ["This is a Phantom Tools anti-pattern"]
                ))
            else:
                self.checks.append(Check(
                    "Agents",
                    Status.SKIP,
                    "No agents/ directory (not required)"
                ))
            return

        # Find agent definitions
        agent_files = list(agents_dir.glob("*.md")) + \
                      list(agents_dir.glob("*.yaml")) + \
                      list(agents_dir.glob("*.yml"))

        if not agent_files:
            self.checks.append(Check(
                "Agents",
                Status.WARN,
                "agents/ exists but contains no definition files"
            ))
            return

        # Check each agent definition
        complete = []
        incomplete = []

        required_sections = ['purpose', 'prompt', 'tools', 'workflow']

        for agent_file in agent_files:
            content = agent_file.read_text().lower()
            missing = []

            for section in required_sections:
                if section not in content:
                    missing.append(section)

            if missing:
                incomplete.append((agent_file.name, missing))
            else:
                complete.append(agent_file.name)

        if incomplete and not complete:
            self.checks.append(Check(
                "Agents",
                Status.FAIL,
                f"All {len(incomplete)} agent definitions are incomplete",
                [f"  {name}: missing {missing}" for name, missing in incomplete]
            ))
        elif incomplete:
            self.checks.append(Check(
                "Agents",
                Status.WARN,
                f"{len(incomplete)} of {len(agent_files)} agent definitions incomplete",
                [f"  Incomplete: {name}" for name, _ in incomplete] +
                [f"  Complete: {name}" for name in complete]
            ))
        else:
            self.checks.append(Check(
                "Agents",
                Status.PASS,
                f"All {len(complete)} agent definitions appear complete",
                [f"  {name}" for name in complete]
            ))

    def check_referenced_files(self):
        """Check that files referenced in SKILL.md actually exist."""
        if not self.skill_content:
            return

        # Find file references like `scripts/foo.py` or `/references/bar.md`
        patterns = [
            r'`(scripts/[^`]+)`',
            r'`(references/[^`]+)`',
            r'`(agents/[^`]+)`',
            r'`(mcp-server/[^`]+)`',
        ]

        referenced = set()
        for pattern in patterns:
            matches = re.findall(pattern, self.skill_content)
            referenced.update(matches)

        if not referenced:
            self.checks.append(Check(
                "Referenced files",
                Status.SKIP,
                "No specific file paths referenced in SKILL.md"
            ))
            return

        missing = []
        found = []

        for ref in referenced:
            full_path = self.skill_path / ref
            if full_path.exists():
                found.append(ref)
            else:
                missing.append(ref)

        if missing:
            self.checks.append(Check(
                "Referenced files",
                Status.FAIL,
                f"{len(missing)} referenced files don't exist (Phantom Tools)",
                [f"  Missing: {f}" for f in missing] +
                [f"  Found: {f}" for f in found]
            ))
        else:
            self.checks.append(Check(
                "Referenced files",
                Status.PASS,
                f"All {len(found)} referenced files exist",
                [f"  {f}" for f in found]
            ))

    def summarize(self):
        """Add summary check."""
        fails = sum(1 for c in self.checks if c.status == Status.FAIL)
        warns = sum(1 for c in self.checks if c.status == Status.WARN)
        passes = sum(1 for c in self.checks if c.status == Status.PASS)
        skips = sum(1 for c in self.checks if c.status == Status.SKIP)

        # Determine if skill is self-contained
        has_tools = any(
            c.status in (Status.PASS, Status.WARN)
            for c in self.checks
            if c.name in ("Scripts quality", "MCP Server", "Agents")
        )

        if fails > 0:
            status = Status.FAIL
            msg = f"Skill has {fails} critical issues"
        elif warns > 0:
            status = Status.WARN
            msg = f"Skill has {warns} warnings to address"
        elif has_tools:
            status = Status.PASS
            msg = "Skill is self-contained with working tools"
        else:
            status = Status.WARN
            msg = "Skill has no tools (instructions only)"

        self.checks.append(Check(
            "SUMMARY",
            status,
            msg,
            [f"  {passes} passed, {warns} warnings, {fails} failed, {skips} skipped"]
        ))


def print_report(checks: List[Check]):
    """Print formatted report."""
    status_icons = {
        Status.PASS: "✅",
        Status.WARN: "⚠️ ",
        Status.FAIL: "❌",
        Status.SKIP: "⏭️ ",
    }

    print(f"\n{'='*60}")
    print("SELF-CONTAINED SKILL CHECK")
    print(f"{'='*60}\n")

    for check in checks:
        icon = status_icons[check.status]
        print(f"{icon} {check.name}: {check.message}")
        for detail in check.details:
            print(f"   {detail}")
        print()

    print(f"{'='*60}\n")


def main():
    if len(sys.argv) < 2:
        print("Usage: python check_self_contained.py <skill_path>")
        print("\nChecks if a skill ships working tools or just instructions.")
        print("\nDetects:")
        print("  - Phantom Tools: Referenced files that don't exist")
        print("  - Template Soup: Scripts with TODO/FIXME markers")
        print("  - Incomplete MCPs: Missing package.json, dependencies, etc.")
        print("  - Missing Agents: Referenced but undefined subagents")
        print("\nExample:")
        print("  python check_self_contained.py ~/.claude/skills/my-skill/")
        sys.exit(1)

    skill_path = sys.argv[1]

    print(f"Checking self-contained status: {skill_path}")

    checker = SelfContainedChecker(skill_path)
    checks = checker.run()

    print_report(checks)

    # Exit code based on failures
    fails = sum(1 for c in checks if c.status == Status.FAIL)
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
