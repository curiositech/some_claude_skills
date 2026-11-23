#!/usr/bin/env python3
"""Regressions for semantic overreach; no network, model, or temporary files."""
from pathlib import Path
import unittest
import humanize_review as review

class EditorialBoundaries(unittest.TestCase):
    def test_french_space_is_low_typography_cue(self):
        found = [f for f in review.analyze_prose(Path("fr.md"), "Prix : 1\u202f000 euros.\n")
                 if f["ism"] == "invisible-unicode-artifacts"]
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0]["severity"], "low")
        self.assertEqual(found[0]["family"], "form")
        self.assertIn("Preserve", found[0]["rewrite"])
        self.assertNotIn("pasted out of", found[0]["explanation"])

    def test_plain_language_labels_are_not_semantic_findings(self):
        markup = '<p class="uppercase">Your account</p><h1>Billing</h1>'
        markup += '<p class="uppercase">Before you start</p><h2>Requirements</h2>'
        found = review.analyze_markup(Path("x.html"), markup)
        self.assertNotIn("eyebrow-with-no-information", {f["ism"] for f in found})

    def test_citation_urls_are_not_repo_leaks(self):
        body = ("The experiment compares two conditions and reports the assumptions, "
                "the observations and the remaining uncertainty for readers to evaluate. ") * 20
        cited = body + "\n" + "\n".join(
            "See https://arxiv.org/abs/2505.04946 for the study." for _ in range(5))
        found = review.analyze_prose(Path("research.md"), cited)
        self.assertNotIn("repo-context-leak", {f["ism"] for f in found})
        leaked = body + "\n" + "\n".join(
            "Open lib/fleet/conductor.ts to understand this." for _ in range(5))
        found = review.analyze_prose(Path("research.md"), leaked)
        self.assertIn("repo-context-leak", {f["ism"] for f in found})

    def test_catalog_agrees_on_judgment_boundary(self):
        cat = {i["name"]: i for i in review.CATALOG["items"]}
        self.assertEqual(cat["eyebrow-with-no-information"]["detection_type"], "llm-judge")
        self.assertEqual(cat["invisible-unicode-artifacts"]["severity"], "low")
        self.assertEqual(cat["title-stack-candidate"]["severity"], "low")
        self.assertIn("7s", cat["no-worked-example"]["after"])

if __name__ == "__main__":
    unittest.main()
