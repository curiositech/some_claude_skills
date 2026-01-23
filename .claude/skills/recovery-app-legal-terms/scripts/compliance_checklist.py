#!/usr/bin/env python3
"""
Legal Compliance Checklist for Recovery Apps

Validates that legal documents meet minimum requirements for
recovery/wellness applications.
"""

import json
import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class ComplianceLevel(Enum):
    PASS = "PASS"
    WARNING = "WARNING"
    FAIL = "FAIL"


@dataclass
class CheckResult:
    name: str
    level: ComplianceLevel
    message: str
    recommendation: Optional[str] = None


@dataclass
class ComplianceReport:
    document_type: str
    checks: list[CheckResult] = field(default_factory=list)
    overall_level: ComplianceLevel = ComplianceLevel.PASS

    def add_check(self, check: CheckResult):
        self.checks.append(check)
        if check.level == ComplianceLevel.FAIL:
            self.overall_level = ComplianceLevel.FAIL
        elif check.level == ComplianceLevel.WARNING and self.overall_level != ComplianceLevel.FAIL:
            self.overall_level = ComplianceLevel.WARNING

    def to_dict(self) -> dict:
        return {
            "document_type": self.document_type,
            "overall_level": self.overall_level.value,
            "checks": [
                {
                    "name": c.name,
                    "level": c.level.value,
                    "message": c.message,
                    "recommendation": c.recommendation,
                }
                for c in self.checks
            ],
        }


# Required phrases for medical disclaimer
MEDICAL_DISCLAIMER_PHRASES = [
    ("not medical advice", "Explicit statement that content is not medical advice"),
    ("not a substitute", "Statement that app doesn't replace professional treatment"),
    ("consult", "Recommendation to consult healthcare professionals"),
    ("emergency", "Information about what to do in emergencies"),
    ("911", "Reference to emergency services"),
    ("988", "Reference to Suicide & Crisis Lifeline"),
]

# Required sections for privacy policy
PRIVACY_POLICY_SECTIONS = [
    ("collect", "Information collection practices"),
    ("use", "How information is used"),
    ("share", "Information sharing practices"),
    ("retention", "Data retention policies"),
    ("rights", "User rights and choices"),
    ("security", "Security measures"),
    ("contact", "Contact information"),
]

# Required sections for terms of service
TOS_SECTIONS = [
    ("acceptance", "Acceptance of terms"),
    ("account", "Account requirements"),
    ("content", "User content policies"),
    ("prohibited", "Prohibited activities"),
    ("disclaimer", "Medical disclaimer reference"),
    ("liability", "Limitation of liability"),
    ("termination", "Termination provisions"),
    ("contact", "Contact information"),
]

# Age requirement patterns
AGE_PATTERNS = [
    r"\b18\s*(years?|yrs?)?\s*(of\s*age|old)?\b",
    r"\beighteen\b",
    r"\bminors?\b",
    r"\bchildren\b",
]


def check_medical_disclaimer(content: str) -> ComplianceReport:
    """Check medical disclaimer for required elements."""
    report = ComplianceReport(document_type="medical_disclaimer")
    content_lower = content.lower()

    for phrase, description in MEDICAL_DISCLAIMER_PHRASES:
        if phrase.lower() in content_lower:
            report.add_check(CheckResult(
                name=f"Contains '{phrase}'",
                level=ComplianceLevel.PASS,
                message=f"Found: {description}",
            ))
        else:
            report.add_check(CheckResult(
                name=f"Contains '{phrase}'",
                level=ComplianceLevel.FAIL,
                message=f"Missing: {description}",
                recommendation=f"Add language about: {description}",
            ))

    # Check for crisis resources
    crisis_resources = ["988", "741741", "samhsa", "crisis"]
    crisis_found = any(r in content_lower for r in crisis_resources)
    if crisis_found:
        report.add_check(CheckResult(
            name="Crisis resources",
            level=ComplianceLevel.PASS,
            message="Crisis resources are included",
        ))
    else:
        report.add_check(CheckResult(
            name="Crisis resources",
            level=ComplianceLevel.FAIL,
            message="No crisis resources found",
            recommendation="Add 988 Suicide & Crisis Lifeline and other crisis resources",
        ))

    return report


def check_privacy_policy(content: str) -> ComplianceReport:
    """Check privacy policy for required sections."""
    report = ComplianceReport(document_type="privacy_policy")
    content_lower = content.lower()

    for keyword, description in PRIVACY_POLICY_SECTIONS:
        if keyword.lower() in content_lower:
            report.add_check(CheckResult(
                name=f"Section: {description}",
                level=ComplianceLevel.PASS,
                message=f"Found content about: {description}",
            ))
        else:
            report.add_check(CheckResult(
                name=f"Section: {description}",
                level=ComplianceLevel.FAIL,
                message=f"Missing section: {description}",
                recommendation=f"Add section covering: {description}",
            ))

    # Check for GDPR compliance
    gdpr_keywords = ["gdpr", "eu", "european", "data subject"]
    gdpr_found = any(k in content_lower for k in gdpr_keywords)
    if gdpr_found:
        report.add_check(CheckResult(
            name="GDPR compliance",
            level=ComplianceLevel.PASS,
            message="GDPR-related content found",
        ))
    else:
        report.add_check(CheckResult(
            name="GDPR compliance",
            level=ComplianceLevel.WARNING,
            message="No GDPR-specific content found",
            recommendation="Consider adding GDPR compliance section for EU users",
        ))

    # Check for CCPA compliance
    ccpa_keywords = ["ccpa", "california", "do not sell"]
    ccpa_found = any(k in content_lower for k in ccpa_keywords)
    if ccpa_found:
        report.add_check(CheckResult(
            name="CCPA compliance",
            level=ComplianceLevel.PASS,
            message="CCPA-related content found",
        ))
    else:
        report.add_check(CheckResult(
            name="CCPA compliance",
            level=ComplianceLevel.WARNING,
            message="No CCPA-specific content found",
            recommendation="Consider adding CCPA compliance section for California users",
        ))

    # Check for age requirement
    age_found = any(re.search(p, content_lower) for p in AGE_PATTERNS)
    if age_found:
        report.add_check(CheckResult(
            name="Age requirement",
            level=ComplianceLevel.PASS,
            message="Age requirement specified",
        ))
    else:
        report.add_check(CheckResult(
            name="Age requirement",
            level=ComplianceLevel.FAIL,
            message="No age requirement found",
            recommendation="Add minimum age requirement (typically 18 for recovery apps)",
        ))

    return report


def check_terms_of_service(content: str) -> ComplianceReport:
    """Check terms of service for required sections."""
    report = ComplianceReport(document_type="terms_of_service")
    content_lower = content.lower()

    for keyword, description in TOS_SECTIONS:
        if keyword.lower() in content_lower:
            report.add_check(CheckResult(
                name=f"Section: {description}",
                level=ComplianceLevel.PASS,
                message=f"Found content about: {description}",
            ))
        else:
            report.add_check(CheckResult(
                name=f"Section: {description}",
                level=ComplianceLevel.FAIL,
                message=f"Missing section: {description}",
                recommendation=f"Add section covering: {description}",
            ))

    # Check for age requirement
    age_found = any(re.search(p, content_lower) for p in AGE_PATTERNS)
    if age_found:
        report.add_check(CheckResult(
            name="Age requirement",
            level=ComplianceLevel.PASS,
            message="Age requirement specified",
        ))
    else:
        report.add_check(CheckResult(
            name="Age requirement",
            level=ComplianceLevel.FAIL,
            message="No age requirement found",
            recommendation="Add minimum age requirement (typically 18 for recovery apps)",
        ))

    # Check for medical disclaimer reference
    medical_keywords = ["medical", "not a substitute", "healthcare", "professional"]
    medical_found = sum(1 for k in medical_keywords if k in content_lower) >= 2
    if medical_found:
        report.add_check(CheckResult(
            name="Medical disclaimer",
            level=ComplianceLevel.PASS,
            message="Medical disclaimer content found",
        ))
    else:
        report.add_check(CheckResult(
            name="Medical disclaimer",
            level=ComplianceLevel.FAIL,
            message="Insufficient medical disclaimer content",
            recommendation="Add or reference medical disclaimer prominently",
        ))

    return report


def check_all_documents(
    medical_disclaimer: Optional[str] = None,
    privacy_policy: Optional[str] = None,
    terms_of_service: Optional[str] = None,
) -> dict:
    """Run compliance checks on all provided documents."""
    results = {}

    if medical_disclaimer:
        results["medical_disclaimer"] = check_medical_disclaimer(medical_disclaimer).to_dict()

    if privacy_policy:
        results["privacy_policy"] = check_privacy_policy(privacy_policy).to_dict()

    if terms_of_service:
        results["terms_of_service"] = check_terms_of_service(terms_of_service).to_dict()

    # Overall assessment
    all_levels = [r["overall_level"] for r in results.values()]
    if "FAIL" in all_levels:
        overall = "FAIL"
    elif "WARNING" in all_levels:
        overall = "WARNING"
    else:
        overall = "PASS"

    return {
        "overall_compliance": overall,
        "documents": results,
    }


if __name__ == "__main__":
    # Example usage with sample documents
    sample_medical = """
    This app is not medical advice and is not a substitute for professional treatment.
    Always consult your healthcare provider. In an emergency, call 911.
    If you're in crisis, call or text 988 for the Suicide & Crisis Lifeline.
    """

    sample_privacy = """
    We collect information you provide, including email and display name.
    We use this information to provide and improve the app.
    We do not share your personal information with third parties for marketing.
    We retain your data until you delete your account.
    You have the right to access, correct, and delete your data.
    We use encryption and security best practices.
    Contact us at privacy@example.com.
    This applies to users 18 years of age or older.
    For California residents, we comply with CCPA.
    For EU residents, we comply with GDPR.
    """

    sample_tos = """
    By using this app, you accept these terms.
    You must be 18 years old to create an account.
    You retain ownership of your content but grant us a license to display it.
    Prohibited activities include harassment, sourcing, and spam.
    This app is not medical advice and is not a substitute for professional healthcare.
    Our liability is limited to the maximum extent permitted by law.
    We may terminate accounts that violate these terms.
    Contact us at legal@example.com.
    """

    result = check_all_documents(
        medical_disclaimer=sample_medical,
        privacy_policy=sample_privacy,
        terms_of_service=sample_tos,
    )

    print(json.dumps(result, indent=2))
