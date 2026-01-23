#!/usr/bin/env python3
"""
OWASP Top 10 Static Analysis Scanner
Detects common vulnerabilities in JavaScript, TypeScript, and Python code.
"""

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

@dataclass
class Finding:
    """Security finding data class"""
    id: str
    severity: str
    owasp_category: str
    title: str
    file: str
    line: int
    evidence: str
    description: str
    remediation: str

class OWASPScanner:
    """Static analysis scanner for OWASP Top 10 vulnerabilities"""

    # Patterns organized by OWASP category
    PATTERNS = {
        "A03:Injection": {
            "js": [
                (r'eval\s*\(', "eval() usage", "critical",
                 "eval() can execute arbitrary code",
                 "Use JSON.parse() for data, avoid dynamic code execution"),
                (r'new\s+Function\s*\(', "new Function() usage", "critical",
                 "new Function() can execute arbitrary code",
                 "Avoid dynamic function creation, use static alternatives"),
                (r'child_process\.exec\s*\([^)]*\+', "Command injection risk", "critical",
                 "String concatenation in exec() allows command injection",
                 "Use execFile() with array arguments, validate input"),
                (r'\.innerHTML\s*=', "innerHTML assignment", "high",
                 "innerHTML can execute scripts in user content",
                 "Use textContent for text, sanitize HTML with DOMPurify"),
                (r'document\.write\s*\(', "document.write() usage", "high",
                 "document.write() can inject malicious content",
                 "Use DOM manipulation methods instead"),
                (r'\$\{[^}]+\}.*(?:SELECT|INSERT|UPDATE|DELETE)', "SQL template injection", "critical",
                 "Template literals in SQL queries allow injection",
                 "Use parameterized queries with placeholders"),
            ],
            "py": [
                (r'eval\s*\(', "eval() usage", "critical",
                 "eval() executes arbitrary Python code",
                 "Use ast.literal_eval() for data, avoid eval()"),
                (r'exec\s*\(', "exec() usage", "critical",
                 "exec() executes arbitrary Python code",
                 "Avoid exec(), use safer alternatives"),
                (r'subprocess\..*shell\s*=\s*True', "Shell=True in subprocess", "critical",
                 "shell=True allows command injection",
                 "Use shell=False with list arguments"),
                (r'pickle\.loads?\s*\(', "Pickle deserialization", "critical",
                 "Pickle can execute arbitrary code during deserialization",
                 "Use JSON or other safe serialization formats"),
                (r'yaml\.load\s*\([^)]*\)(?!\s*,\s*Loader)', "Unsafe YAML load", "high",
                 "yaml.load() without SafeLoader can execute code",
                 "Use yaml.safe_load() or Loader=yaml.SafeLoader"),
                (r'cursor\.execute\s*\([^)]*%', "SQL string formatting", "critical",
                 "String formatting in SQL queries allows injection",
                 "Use parameterized queries: cursor.execute(sql, (param,))"),
                (r'cursor\.execute\s*\([^)]*\.format', "SQL .format() injection", "critical",
                 ".format() in SQL queries allows injection",
                 "Use parameterized queries with placeholders"),
            ]
        },
        "A02:Cryptographic Failures": {
            "js": [
                (r'crypto\.createHash\s*\([\'"]md5[\'"]\)', "MD5 hash usage", "high",
                 "MD5 is cryptographically broken",
                 "Use SHA-256 or better for integrity, bcrypt/argon2 for passwords"),
                (r'crypto\.createHash\s*\([\'"]sha1[\'"]\)', "SHA1 hash usage", "medium",
                 "SHA1 is deprecated for security purposes",
                 "Use SHA-256 or better"),
                (r'Math\.random\s*\(', "Math.random() for security", "medium",
                 "Math.random() is not cryptographically secure",
                 "Use crypto.randomBytes() or crypto.getRandomValues()"),
            ],
            "py": [
                (r'hashlib\.md5\s*\(', "MD5 hash usage", "high",
                 "MD5 is cryptographically broken",
                 "Use hashlib.sha256() or better, bcrypt for passwords"),
                (r'hashlib\.sha1\s*\(', "SHA1 hash usage", "medium",
                 "SHA1 is deprecated for security purposes",
                 "Use hashlib.sha256() or better"),
                (r'random\.(random|randint|choice)', "random module for security", "medium",
                 "random module is not cryptographically secure",
                 "Use secrets module for security-sensitive randomness"),
            ]
        },
        "A05:Security Misconfiguration": {
            "js": [
                (r'cors\s*\(\s*\)', "CORS allow all", "high",
                 "Unrestricted CORS allows any origin",
                 "Configure specific allowed origins"),
                (r'app\.use\s*\(\s*cors\s*\(\s*\{\s*origin\s*:\s*[\'"]?\*', "CORS wildcard origin", "high",
                 "CORS wildcard allows any origin",
                 "Specify allowed origins explicitly"),
                (r'debug\s*[:=]\s*true', "Debug mode enabled", "medium",
                 "Debug mode may expose sensitive information",
                 "Disable debug mode in production"),
                (r'NODE_ENV\s*!==?\s*[\'"]production', "Non-production check", "low",
                 "Ensure production settings in deployment",
                 "Use environment-specific configuration"),
            ],
            "py": [
                (r'DEBUG\s*=\s*True', "Django DEBUG=True", "high",
                 "Debug mode exposes sensitive error details",
                 "Set DEBUG=False in production"),
                (r'ALLOWED_HOSTS\s*=\s*\[\s*[\'"]?\*', "Django wildcard hosts", "high",
                 "Wildcard ALLOWED_HOSTS is insecure",
                 "Specify exact hostnames"),
                (r'app\.run\s*\([^)]*debug\s*=\s*True', "Flask debug mode", "high",
                 "Debug mode enables code execution via debugger",
                 "Disable debug mode in production"),
            ]
        },
        "A07:Authentication Failures": {
            "js": [
                (r'jwt\.sign\s*\([^)]*expiresIn\s*:\s*[\'"]?\d{8,}', "Long JWT expiry", "medium",
                 "Very long token expiration increases risk",
                 "Use shorter expiration times (hours, not days)"),
                (r'password.*[\'"][a-zA-Z0-9]{1,7}[\'"]', "Short password constant", "high",
                 "Hardcoded short password is insecure",
                 "Remove hardcoded passwords, use secrets management"),
                (r'bcrypt.*rounds?\s*[:=]\s*[1-9]\b', "Low bcrypt rounds", "medium",
                 "Low bcrypt rounds make passwords easier to crack",
                 "Use at least 10-12 rounds"),
            ],
            "py": [
                (r'password.*=\s*[\'"][a-zA-Z0-9]{1,7}[\'"]', "Short password constant", "high",
                 "Hardcoded short password is insecure",
                 "Remove hardcoded passwords, use secrets management"),
                (r'SECRET_KEY\s*=\s*[\'"][^\'\"]{1,20}[\'"]', "Short SECRET_KEY", "high",
                 "Short secret key is vulnerable to brute force",
                 "Use at least 50 random characters"),
            ]
        },
        "A10:SSRF": {
            "js": [
                (r'fetch\s*\(\s*(?:req\.(?:query|body|params)|[a-zA-Z]+Input)', "SSRF risk in fetch", "high",
                 "User input directly in fetch URL allows SSRF",
                 "Validate and whitelist allowed domains"),
                (r'axios\.\w+\s*\(\s*(?:req\.(?:query|body|params)|[a-zA-Z]+Input)', "SSRF risk in axios", "high",
                 "User input directly in axios URL allows SSRF",
                 "Validate and whitelist allowed domains"),
            ],
            "py": [
                (r'requests\.\w+\s*\(\s*(?:request\.\w+|user_input|url_param)', "SSRF risk in requests", "high",
                 "User input directly in request URL allows SSRF",
                 "Validate and whitelist allowed domains"),
                (r'urllib\.request\.urlopen\s*\(\s*[a-zA-Z]', "SSRF risk in urllib", "high",
                 "Unvalidated URL in urlopen allows SSRF",
                 "Validate and whitelist allowed domains"),
            ]
        }
    }

    # File extensions to language mapping
    EXTENSIONS = {
        '.js': 'js',
        '.jsx': 'js',
        '.ts': 'js',
        '.tsx': 'js',
        '.mjs': 'js',
        '.cjs': 'js',
        '.py': 'py',
    }

    # Directories to skip
    SKIP_DIRS = {
        'node_modules', '.git', 'dist', 'build', '.next', '__pycache__',
        'venv', '.venv', 'env', '.env', 'coverage', '.nyc_output'
    }

    def __init__(self):
        self.findings: List[Finding] = []
        self.finding_counter = 0

    def scan_file(self, filepath: Path) -> None:
        """Scan a single file for vulnerabilities"""
        ext = filepath.suffix.lower()
        lang = self.EXTENSIONS.get(ext)

        if not lang:
            return

        try:
            content = filepath.read_text(encoding='utf-8', errors='ignore')
            lines = content.split('\n')
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}", file=sys.stderr)
            return

        for owasp_cat, lang_patterns in self.PATTERNS.items():
            patterns = lang_patterns.get(lang, [])
            for pattern, title, severity, description, remediation in patterns:
                for i, line in enumerate(lines, 1):
                    # Skip comments
                    stripped = line.strip()
                    if stripped.startswith('//') or stripped.startswith('#'):
                        continue
                    if stripped.startswith('/*') or stripped.startswith('"""') or stripped.startswith("'''"):
                        continue

                    if re.search(pattern, line, re.IGNORECASE):
                        self.finding_counter += 1
                        self.findings.append(Finding(
                            id=f"OWASP-{self.finding_counter:04d}",
                            severity=severity,
                            owasp_category=owasp_cat,
                            title=title,
                            file=str(filepath),
                            line=i,
                            evidence=line.strip()[:100],
                            description=description,
                            remediation=remediation
                        ))

    def scan_directory(self, path: Path) -> None:
        """Recursively scan a directory"""
        if not path.exists():
            print(f"Error: Path does not exist: {path}", file=sys.stderr)
            sys.exit(1)

        if path.is_file():
            self.scan_file(path)
            return

        for item in path.rglob('*'):
            # Skip excluded directories
            if any(skip in item.parts for skip in self.SKIP_DIRS):
                continue
            if item.is_file():
                self.scan_file(item)

    def get_summary(self) -> dict:
        """Get summary counts by severity"""
        summary = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        for f in self.findings:
            if f.severity in summary:
                summary[f.severity] += 1
        summary['total'] = len(self.findings)
        return summary

    def to_json(self) -> str:
        """Export findings as JSON"""
        return json.dumps({
            'summary': self.get_summary(),
            'findings': [
                {
                    'id': f.id,
                    'severity': f.severity,
                    'owasp_category': f.owasp_category,
                    'title': f.title,
                    'file': f.file,
                    'line': f.line,
                    'evidence': f.evidence,
                    'description': f.description,
                    'remediation': f.remediation
                }
                for f in self.findings
            ]
        }, indent=2)

    def print_report(self) -> None:
        """Print human-readable report"""
        summary = self.get_summary()

        print("\n" + "=" * 60)
        print("OWASP Top 10 Static Analysis Report")
        print("=" * 60)

        print(f"\nSummary:")
        print(f"  Critical: {summary['critical']}")
        print(f"  High:     {summary['high']}")
        print(f"  Medium:   {summary['medium']}")
        print(f"  Low:      {summary['low']}")
        print(f"  Total:    {summary['total']}")

        if self.findings:
            print("\nFindings:")
            print("-" * 60)
            for f in sorted(self.findings, key=lambda x: ['critical', 'high', 'medium', 'low'].index(x.severity)):
                sev_color = {
                    'critical': '\033[91m',  # Red
                    'high': '\033[93m',      # Yellow
                    'medium': '\033[94m',    # Blue
                    'low': '\033[90m'        # Gray
                }.get(f.severity, '')
                reset = '\033[0m'

                print(f"\n[{sev_color}{f.severity.upper()}{reset}] {f.id}: {f.title}")
                print(f"  Category: {f.owasp_category}")
                print(f"  Location: {f.file}:{f.line}")
                print(f"  Evidence: {f.evidence}")
                print(f"  Issue: {f.description}")
                print(f"  Fix: {f.remediation}")

def main():
    parser = argparse.ArgumentParser(
        description='OWASP Top 10 Static Analysis Scanner',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s /path/to/project
  %(prog)s src/api/users.js --json
  %(prog)s . --output report.json
        """
    )
    parser.add_argument('path', help='File or directory to scan')
    parser.add_argument('--json', '-j', action='store_true', help='Output JSON format')
    parser.add_argument('--output', '-o', help='Write report to file')
    parser.add_argument('--fail-on', choices=['critical', 'high', 'medium', 'low'],
                        default='critical', help='Exit with error if findings at this level or above')

    args = parser.parse_args()

    scanner = OWASPScanner()
    scanner.scan_directory(Path(args.path))

    if args.json:
        output = scanner.to_json()
        if args.output:
            Path(args.output).write_text(output)
            print(f"Report written to {args.output}")
        else:
            print(output)
    else:
        scanner.print_report()
        if args.output:
            Path(args.output).write_text(scanner.to_json())
            print(f"\nJSON report written to {args.output}")

    # Exit code based on findings
    summary = scanner.get_summary()
    severity_levels = ['critical', 'high', 'medium', 'low']
    fail_index = severity_levels.index(args.fail_on)

    for level in severity_levels[:fail_index + 1]:
        if summary[level] > 0:
            sys.exit(1)

    sys.exit(0)

if __name__ == '__main__':
    main()
