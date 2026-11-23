#!/usr/bin/env python3
"""Offline regressions for local cadence and honest automation claims."""
from pathlib import Path
import tempfile
import os
import unittest

import humanize_review as review
from implemented_checks import emitted_ids, implemented_ids


SCRATCH_ROOT = Path(os.environ.get("COPY_REVIEW_SCRATCH_ROOT", Path.home() / "coding/tmp")).resolve()
if not SCRATCH_ROOT.is_relative_to((Path.home() / "coding/tmp").resolve()):
    raise RuntimeError("Test scratch must remain under ~/coding/tmp")
SCRATCH_ROOT.mkdir(parents=True, exist_ok=True)


class LocalCadence(unittest.TestCase):
    def found(self, text, suffix=".md"):
        return list(review.staccato_findings(Path("chapter" + suffix), text, suffix))

    def test_local_run_survives_chapter_dilution_and_has_source_line(self):
        context = "This complete sentence provides enough context for the next observation.\n\n"
        text = context * 200 + "Tight.\nControlled.\nDeliberate.\n\n" + context * 200
        found = self.found(text)
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0]["line"], 401)
        self.assertEqual(found[0]["severity"], "low")

    def test_separate_runs_report_separate_lines(self):
        found = self.found("Tight. Controlled. Deliberate.\n\nFast. Simple. Ready.")
        self.assertEqual([f["line"] for f in found], [1, 3])

    def test_nonconsecutive_short_sentences_do_not_trigger_share_rule(self):
        text = "Done. A longer sentence explains what happened to the uploaded file. " * 12
        self.assertFalse(self.found(text))

    def test_boundaries_do_not_join_unrelated_short_sentences(self):
        for boundary in ("\n\n", "\n# Heading\n", "\n> A quoted example.\n",
                         "\n```text\nExample. Example. Example.\n```\n",
                         "\n- First item.\n", "\n| A | B |\n"):
            with self.subTest(boundary=boundary):
                self.assertFalse(self.found("One. Two." + boundary + "Three."))

    def test_proof_label_is_not_a_third_sentence(self):
        for label in ("Proof.", "*Proof.*", "Solution."):
            self.assertFalse(self.found(label + " Both read v. Both write v."))

    def test_tex_exclusions_and_lines(self):
        text = ("\\begin{proof}\nProof. Both read v. Both write v. \\qed\n\\end{proof}\n"
                "\\begin{figure}\nTight. Controlled. Deliberate.\n\\end{figure}\n"
                "\\[\nTight. Controlled. Deliberate.\n\\]\n"
                "\\begin{thebibliography}{9}\nTight. Controlled. Deliberate.\n"
                "\\end{thebibliography}\n\nTight. Controlled. Deliberate.\n")
        found = self.found(text, ".tex")
        self.assertEqual([f["line"] for f in found], [14])

    def test_actual_tex_file_route_keeps_tex_exclusions(self):
        # Installed copies also keep scratch under ~/coding/tmp.
        root = SCRATCH_ROOT
        with tempfile.TemporaryDirectory(dir=root, prefix=".copy-test-") as folder:
            path = Path(folder) / "sample.tex"
            path.write_text("\\begin{figure}\nTight. Controlled. Deliberate.\n\\end{figure}\n")
            self.assertNotIn("staccato-fragment-triplet", {f["ism"] for f in review.analyze_file(path)})

    def test_tex_inequality_does_not_change_cadence_source_lines(self):
        root = SCRATCH_ROOT
        with tempfile.TemporaryDirectory(dir=root, prefix=".copy-test-") as folder:
            path = Path(folder) / "sample.tex"
            path.write_text("Assume $a < b$.\n\nTight. Controlled. Deliberate.\n\nAssume $c > d$.\n")
            found = [f for f in review.analyze_file(path) if f["ism"] == "staccato-fragment-triplet"]
            self.assertEqual([f["line"] for f in found], [3])

    def test_ignored_specimens_do_not_trigger(self):
        self.assertFalse(self.found("<!-- humanize:ignore-start -->\n"
                                    "Tight. Controlled. Deliberate.\n"
                                    "<!-- humanize:ignore-end -->"))

    def test_indented_code_and_list_continuations_do_not_trigger(self):
        self.assertFalse(self.found("    first(). second(). third()."))
        self.assertFalse(self.found("1. First item follows\n   Tight. Controlled. Deliberate."))
        self.assertFalse(self.found("- First item\n\n  Tight. Controlled. Deliberate."))

    def test_html_plaintext_stream_does_not_claim_local_runs(self):
        self.assertFalse(self.found("One. Two. Three.", ".html"))
        root = SCRATCH_ROOT
        with tempfile.TemporaryDirectory(dir=root, prefix=".copy-test-") as folder:
            path = Path(folder) / "sample.html"
            path.write_text("<!--\ncomment\nhere\n-->\n<h2>One.</h2>\n<p>Two.</p>\n<p>Three.</p>")
            self.assertNotIn("staccato-fragment-triplet", {f["ism"] for f in review.analyze_file(path)})


class AutomationEvidence(unittest.TestCase):
    def test_mentions_do_not_claim_automation(self):
        source = '''"""Example: ism = "docstring-example"."""
THRESHOLDS = {"threshold-only": 3}
# finding("x", 1, "example", "comment-example", "high", "why")
def finding(file, line, excerpt, ism, severity, explanation): pass
def check():
    return finding("x", 1, "actual", "actual-emission", "low", "why")
def test_example():
    return finding("x", 1, "example", "test-example", "low", "why")
'''
        self.assertEqual(emitted_ids(source), {"actual-emission"})

    def test_inventory_handles_renderer_signature_and_keyword(self):
        source = '''
def finding(file, ism, severity, excerpt, explanation, rewrite): pass
def check():
    finding("x", "rendered-check", "low", "x", "why", "fix")
    finding("x", ism="keyword-check", severity="low", excerpt="x", explanation="why", rewrite="fix")
'''
        self.assertEqual(emitted_ids(source), {"rendered-check", "keyword-check"})

    def test_real_judge_rule_stays_manual(self):
        ids = implemented_ids()
        self.assertIn("staccato-fragment-triplet", ids)
        self.assertIn("title-stack-candidate", ids)
        self.assertIn("webgl-library-for-decoration", ids)
        self.assertNotIn("generic-failure-string", ids)
        self.assertNotIn("unresolved-token-in-ui-string", ids)
        self.assertNotIn("negation-contrast-frame", ids)
        self.assertNotIn("missing-causal-step", ids)
        self.assertTrue(ids.issubset(review.CATALOG_NAMES | {"unreadable"}))

    def test_finite_loop_emissions_without_claiming_unrelated_keys(self):
        source = '''
PATTERNS = {"table-emission": ("pattern", "low")}
UNUSED = {"not-emitted": "example"}
def finding(file, line, excerpt, ism, severity, explanation): pass
def check():
    for ism, value in PATTERNS.items():
        finding("x", 1, "x", ism, "low", "why")
    for lib, ism in (("lib", "row-emission"),):
        finding("x", 1, "x", ism, "low", "why")
'''
        self.assertEqual(emitted_ids(source), {"table-emission", "row-emission"})


if __name__ == "__main__":
    unittest.main()
