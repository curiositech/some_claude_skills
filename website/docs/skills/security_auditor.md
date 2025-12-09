---
title: Security Auditor
description: Security vulnerability scanner and OWASP compliance auditor for codebases
sidebar_label: Security Auditor
tags: [security, owasp, vulnerability, sast, audit]
---

# Security Auditor

> Security vulnerability scanner and OWASP compliance auditor for codebases. Dependency scanning, secret detection, SAST for injection/XSS vulnerabilities, and security posture reports.

## Overview

The Security Auditor skill provides comprehensive security scanning for codebases. It identifies vulnerabilities before they become incidents, focusing on actionable findings with remediation guidance.

**Key Capabilities:**
- Dependency vulnerability scanning (npm, pip, cargo)
- Secret/credential leak detection
- OWASP Top 10 static analysis
- Security posture reports

## When to Use

✅ **Use for:**
- Pre-deployment security audits
- Dependency vulnerability scanning
- Secret/credential leak detection
- Code-level SAST (Static Application Security Testing)
- Security posture reports for stakeholders
- OWASP Top 10 compliance checking
- Pre-PR security reviews

❌ **Do NOT use for:**
- Runtime security (WAF, rate limiting) - use infrastructure tools
- Network security/firewall rules - use cloud/DevOps skills
- SOC2/HIPAA/PCI compliance - requires legal/organizational process
- Penetration testing execution - this is detection, not exploitation

## Quick Start

### Full Security Audit
```bash
# Run comprehensive scan
./scripts/full-audit.sh /path/to/project

# Output: security-report.json + summary
```

### Quick Checks
```bash
# Dependency vulnerabilities only
npm audit --json > deps-audit.json

# Secret detection only
./scripts/detect-secrets.sh /path/to/project

# OWASP check specific file
./scripts/owasp-check.py /path/to/file.js
```

## Core Scanning Capabilities

### 1. Dependency Scanning

| Package Manager | Command | Severity Levels |
|-----------------|---------|-----------------|
| npm | `npm audit --json` | critical, high, moderate, low |
| yarn | `yarn audit --json` | same as npm |
| pip | `pip-audit --format json` | critical, high, medium, low |
| cargo | `cargo audit --json` | same |

**Decision Tree:**
```
Critical severity found?
├── YES → Block deployment, immediate fix required
│   └── Check if patch available → npm audit fix --force
├── NO → High severity?
    ├── YES → Fix within sprint, document if deferred
    └── NO → Low/Moderate → Track, fix during maintenance
```

### 2. Secret Detection

**High-Risk Patterns:**
- API keys: `/[A-Za-z0-9_]{20,}/` near "key", "api", "secret"
- AWS credentials: `AKIA[0-9A-Z]{16}`
- Private keys: `-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----`
- JWT tokens: `eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+`
- Connection strings: `://[^:]+:[^@]+@`

### 3. OWASP Top 10 Static Analysis

| # | Vulnerability | Detection Pattern |
|---|---------------|-------------------|
| A01 | Broken Access Control | Missing auth checks on routes |
| A02 | Cryptographic Failures | Weak algorithms (MD5, SHA1 for passwords) |
| A03 | Injection | Unparameterized queries, eval(), innerHTML |
| A04 | Insecure Design | Hardcoded credentials, missing rate limits |
| A05 | Security Misconfiguration | Debug mode in prod, default credentials |
| A06 | Vulnerable Components | Known CVEs in dependencies |
| A07 | Auth Failures | Weak password policies, session issues |
| A08 | Integrity Failures | Unsigned updates, untrusted deserialization |
| A09 | Logging Failures | Sensitive data in logs, missing audit trails |
| A10 | SSRF | Unvalidated URL inputs to fetch/request |

## Security Report Format

```json
{
  "summary": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 12,
    "informational": 8
  },
  "findings": [
    {
      "id": "SEC-001",
      "severity": "high",
      "category": "A03:Injection",
      "title": "SQL Injection in user search",
      "location": "src/api/users.js:45",
      "description": "User input concatenated directly into SQL query",
      "evidence": "const query = `SELECT * FROM users WHERE name = '${input}'`",
      "remediation": "Use parameterized queries",
      "references": ["https://owasp.org/www-community/attacks/SQL_Injection"]
    }
  ]
}
```

## CI/CD Integration

### GitHub Actions Example
```yaml
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run security audit
      run: |
        npm audit --json > audit.json
        ./scripts/detect-secrets.sh . > secrets.json
        ./scripts/generate-report.py
    - name: Fail on critical
      run: |
        if jq '.summary.critical > 0' report.json; then
          echo "Critical vulnerabilities found!"
          exit 1
        fi
```

## Anti-Patterns

### Security by Obscurity
**What it looks like**: "Nobody will find this hardcoded password"
**Why wrong**: Secrets in source always leak eventually
**Instead**: Environment variables, secret managers, zero hardcoded secrets

### Audit Fatigue
**What it looks like**: 500 findings, all "medium", team ignores
**Why wrong**: Critical issues buried in noise
**Instead**: Prioritize by exploitability, start with critical/high only

### One-Time Audit
**What it looks like**: "We did a security audit last year"
**Why wrong**: New CVEs daily, code changes constantly
**Instead**: CI/CD integration, weekly automated scans minimum

## Success Metrics

| Metric | Target |
|--------|--------|
| Critical/High pre-production | 0 |
| Mean time to remediate critical | &lt; 24 hours |
| False positive rate | &lt; 10% |
| Scan coverage | 100% of deployable code |

## Related Skills

- **site-reliability-engineer**: Deployment gates
- **code-reviewer**: PR security checks
- **test-automation-expert**: Security test integration

---

**Detects**: Dependency CVEs | Secret leaks | Injection vulnerabilities | OWASP violations | Security misconfigurations
