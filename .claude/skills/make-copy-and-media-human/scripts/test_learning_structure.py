#!/usr/bin/env python3
"""In-memory tests for review_learning_structure.py; no temporary files needed."""

from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("review_learning_structure.py")
SPEC = importlib.util.spec_from_file_location("review_learning_structure", SCRIPT)
assert SPEC and SPEC.loader
review = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(review)


def finding_ids(findings):
    return [finding["ism"] for finding in findings]


class StructuralTests(unittest.TestCase):
    def test_markdown_three_heading_stack_is_low_candidate(self):
        findings = review.scan_text("chapter.md", "# Chapter\n\n## Section\n\n### Subsection\n")
        self.assertEqual(finding_ids(findings), ["title-stack-candidate"])
        self.assertEqual(findings[0]["line"], 1)
        self.assertEqual(findings[0]["severity"], "low")

    def test_markdown_title_and_subtitle_two_levels_are_allowed(self):
        text = "# Chapter title\n\n*Short subtitle*\n\nProse starts here.\n"
        self.assertEqual(review.scan_text("chapter.md", text), [])

    def test_markdown_prose_breaks_heading_run(self):
        text = "# A\n## B\nThis paragraph is a real break.\n### C\n"
        self.assertEqual(review.scan_text("chapter.md", text), [])

    def test_markdown_indented_code_is_not_a_title_stack(self):
        for indent in ('    ', '\t'):
            with self.subTest(indent=indent):
                text = '\n'.join(indent + line for line in ('# A', '## B', '### C'))
                self.assertEqual(review.scan_text("chapter.md", text), [])

    def test_markdown_whitespace_only_blank_line_keeps_stack(self):
        text = '# A\n    \n## B\n\t\n### C'
        self.assertEqual(finding_ids(review.scan_text("chapter.md", text)), ["title-stack-candidate"])

    def test_markdown_bold_and_italic_standalone_blocks_count(self):
        text = "**A**\n\n_B_\n\n### C\n"
        self.assertEqual(finding_ids(review.scan_text("chapter.md", text)), ["title-stack-candidate"])

    def test_markdown_mixed_emphasis_prose_is_not_a_title_stack(self):
        text = ('**First** paragraph explains **one**\n\n'
                '**Second** paragraph explains **two**\n\n'
                '**Third** paragraph explains **three**')
        self.assertEqual(review.scan_text("chapter.md", text), [])

    def test_markdown_spaced_or_mismatched_emphasis_is_plain_text(self):
        for middle in ('_ B _', '**B__', '*B_'):
            with self.subTest(middle=middle):
                self.assertEqual(review.scan_text("chapter.md", f'# A\n\n{middle}\n\n## C'), [])

    def test_markdown_fences_comments_and_frontmatter_are_ignored(self):
        text = "---\ntitle: Metadata\n---\n# A\n## B\n\n```md\n### fake\n#### fake\n##### fake\n```\n<!-- ### comment -->\n"
        self.assertEqual(review.scan_text("chapter.md", text), [])

    def test_markdown_multiline_comment_does_not_leak_internal_heading(self):
        text = "# A\n## B\n<!--\n### hidden\n#### hidden\n##### hidden\n-->\nBody follows.\n"
        self.assertEqual(review.scan_text("chapter.md", text), [])

    def test_humanize_ignore_span_is_honored_in_markdown(self):
        text = "<!-- humanize:ignore-start -->\n# A\n## B\n### C\n<!-- humanize:ignore-end -->\n"
        self.assertEqual(review.scan_text("chapter.md", text), [])

    def test_long_fence_is_not_closed_by_shorter_fence(self):
        text = "````md\n```\n# A\n## B\n### C\n````\n"
        self.assertEqual(review.scan_text("example.md", text), [])

    def test_article_eyebrow_title_dek_is_candidate_not_verdict(self):
        text = '<article><p class="eyebrow">Research</p><h1>Learning</h1><p class="dek">A study</p><p>Body.</p></article>'
        found = review.scan_text("article.html", text)
        self.assertEqual(finding_ids(found), ["title-stack-candidate"])
        self.assertEqual(found[0]["severity"], "low")

    def test_markdown_multiple_runs_report_separately(self):
        text = "# A\n## B\n### C\nParagraph.\n# D\n## E\n### F\n"
        findings = review.scan_text("chapter.md", text)
        self.assertEqual(len(findings), 2)
        self.assertEqual([item["line"] for item in findings], [1, 5])

    def test_html_direct_section_stack_is_detected(self):
        text = "<section>\n<h2>A</h2>\n<h3>B</h3>\n<strong>C</strong>\n</section>"
        self.assertEqual(finding_ids(review.scan_text("page.html", text)), ["title-stack-candidate"])

    def test_html_nav_script_style_and_code_are_ignored(self):
        text = "<nav><h1>A</h1><h2>B</h2><h3>C</h3></nav><section><script><h1>X</h1></script><h2>A</h2><h3>B</h3></section>"
        self.assertEqual(review.scan_text("page.html", text), [])

    def test_html_prose_breaks_single_container_run(self):
        text = "<section><h2>A</h2><p>Actual prose.</p><h3>B</h3><h4>C</h4></section>"
        self.assertEqual(review.scan_text("page.html", text), [])

    def test_html_stack_before_body_is_retained(self):
        text = "<section><h2>A</h2><h3>B</h3><h4>C</h4><p>Body follows.</p></section>"
        findings = review.scan_text("page.html", text)
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["line"], 1)

    def test_html_void_elements_do_not_capture_following_headings(self):
        text = '<section><h2>A</h2><meta charset="utf-8"><h3>B</h3><br><h4>C</h4></section>'
        self.assertEqual(finding_ids(review.scan_text("page.html", text)), ["title-stack-candidate"])

    def test_html_hgroup_and_explicit_header_roles_are_supported(self):
        text = (
            '<header><p class="eyebrow"><strong>A</strong></p>'
            '<p class="subtitle">B <em>detail</em></p><h2>C</h2></header>'
        )
        self.assertEqual(finding_ids(review.scan_text("page.html", text)), ["title-stack-candidate"])
        hgroup = "<hgroup><h1>A</h1><h2>B</h2><h3>C</h3></hgroup>"
        self.assertEqual(finding_ids(review.scan_text("page.html", hgroup)), ["title-stack-candidate"])

    def test_html_nested_containers_have_separate_scopes(self):
        text = (
            "<section><h2>Outer A</h2><section><h2>Inner A</h2><h3>Inner B</h3>"
            "<h4>Inner C</h4></section><h3>Outer B</h3></section>"
        )
        findings = review.scan_text("page.html", text)
        self.assertEqual(len(findings), 1)
        self.assertIn("Inner A", findings[0]["excerpt"])

    def test_html_group_class_is_a_container(self):
        text = '<div class="group"><h2>A</h2><em>B</em><i>C</i></div>'
        self.assertEqual(finding_ids(review.scan_text("page.html", text)), ["title-stack-candidate"])

    def test_html_ordinary_hero_wrapper_is_scanned_once(self):
        text = ('<header>\n<div class="hero-copy">\n'
                '<p class="eyebrow">Research</p>\n<h1>Learning</h1>\n'
                '<p class="subtitle">A study</p>\n</div>\n</header>')
        found = review.scan_text("page.html", text)
        self.assertEqual(finding_ids(found), ["title-stack-candidate"])
        self.assertEqual(found[0]["line"], 3)
        self.assertEqual(found[0]["excerpt"], "Research | Learning | A study")

    def test_html_nested_plain_wrappers_are_scanned(self):
        text = '<div><div><h1>A</h1><h2>B</h2><h3>C</h3></div></div>'
        self.assertEqual(finding_ids(review.scan_text("page.html", text)), ["title-stack-candidate"])

    def test_html_sibling_wrappers_do_not_combine_titles(self):
        text = ('<header><div><h1>A</h1><h2>B</h2></div>'
                '<div><h2>C</h2><h3>D</h3></div></header>')
        self.assertEqual(review.scan_text("page.html", text), [])

    def test_html_wrapper_prose_breaks_stack(self):
        text = '<div><h1>A</h1><p>Actual prose.</p><h2>B</h2><h3>C</h3></div>'
        self.assertEqual(review.scan_text("page.html", text), [])

    def test_html_wrappers_in_ignored_elements_remain_ignored(self):
        for tag in ('nav', 'pre', 'code', 'script', 'style', 'template'):
            with self.subTest(tag=tag):
                text = f'<{tag}><div><h1>A</h1><h2>B</h2><h3>C</h3></div></{tag}>'
                self.assertEqual(review.scan_text("page.html", text), [])

    def test_html_media_breaks_title_run(self):
        for media in ('<figure><img src="graph.png" alt="Graph"></figure>',
                      '<p><img src="graph.png" alt="Graph"></p>',
                      '<a href="full.png"><img src="graph.png" alt="Graph"></a>',
                      '<img src="graph.png" alt="Graph">', '<video src="lesson.mp4"></video>',
                      '<svg><path d="M0 0L1 1"></path></svg>', '<hr>'):
            with self.subTest(media=media):
                text = f'<section><h2>A</h2>{media}<h3>B</h3><h4>C</h4></section>'
                self.assertEqual(review.scan_text("page.html", text), [])

    def test_tex_section_subsection_and_styled_lines_are_detected(self):
        text = r"\section{A}"
        text += "\n\\subsection{B}\n\\textbf{C}\n"
        self.assertEqual(finding_ids(review.scan_text("chapter.tex", text)), ["title-stack-candidate"])

    def test_tex_escaped_percent_is_content_and_unescaped_comment_breaks(self):
        text = r"\section{A \% rate}" + "\n\\subsection{B} % comment" + "\n\\textit{C}\n"
        findings = review.scan_text("chapter.tex", text)
        self.assertEqual(finding_ids(findings), ["title-stack-candidate"])
        self.assertIn("rate", findings[0]["excerpt"])

    def test_tex_verbatim_is_ignored(self):
        text = "\\section{A}\n\\subsection{B}\n\\begin{verbatim}\n\\subsubsection{fake}\n\\textbf{fake}\n\\end{verbatim}\n"
        self.assertEqual(review.scan_text("chapter.tex", text), [])

    def test_tex_optional_heading_forms_are_supported(self):
        text = "\\chapter{A}\n\\subsubsection{B}\n\\paragraph{C}\n"
        self.assertEqual(finding_ids(review.scan_text("chapter.tex", text)), ["title-stack-candidate"])

    def test_humanize_ignore_span_is_honored_in_html_and_tex(self):
        html = "<!-- humanize:ignore-start --><section><h1>A</h1><h2>B</h2><h3>C</h3></section><!-- humanize:ignore-end -->"
        tex = "% humanize:ignore-start\n\\section{A}\n\\subsection{B}\n\\subsubsection{C}\n% humanize:ignore-end\n"
        self.assertEqual(review.scan_text("page.html", html), [])
        self.assertEqual(review.scan_text("chapter.tex", tex), [])

    def test_min_layers_is_configurable(self):
        text = "# A\n## B\n"
        self.assertEqual(finding_ids(review.scan_text("chapter.md", text, min_layers=2)), ["title-stack-candidate"])
        with self.assertRaises(review.ReviewInputError):
            review.scan_text("chapter.md", text, min_layers=0)


class LearningMapTests(unittest.TestCase):
    def valid_map(self):
        return {
            "source": "chapter.md",
            "declared_prior_knowledge": [],
            "concepts": [
                {"id": "whole", "prerequisites": [], "teaching_line": 2, "first_use_line": 2},
                {"id": "fraction", "prerequisites": ["whole"], "teaching_line": 10, "first_use_line": 10},
            ],
            "evidence": [
                {"kind": "worked-example", "concept_id": "whole", "line": 3},
                {"kind": "practice", "concept_id": "whole", "line": 5},
                {"kind": "retrieval", "concept_id": "whole", "line": 6},
                {"kind": "transfer", "concept_id": "whole", "line": 7},
                {"kind": "worked-example", "concept_id": "fraction", "line": 11},
                {"kind": "practice", "concept_id": "fraction", "line": 13},
                {"kind": "retrieval", "concept_id": "fraction", "line": 14},
                {"kind": "transfer", "concept_id": "fraction", "line": 16},
            ],
        }

    def test_valid_map_has_no_annotation_findings(self):
        self.assertEqual(review.validate_learning_map(self.valid_map()), [])

    def test_missing_practice_and_transfer_use_agreed_ids(self):
        data = self.valid_map()
        data["evidence"] = []
        ids = finding_ids(review.validate_learning_map(data))
        self.assertEqual(ids.count("practice-evidence-missing"), 6)
        self.assertEqual(ids.count("transfer-evidence-missing"), 2)

    def test_prerequisite_order_gap_is_reported_without_claiming_skill_failure(self):
        data = self.valid_map()
        data["concepts"][0]["teaching_line"] = 20
        data["concepts"][0]["first_use_line"] = 20
        for evidence in data["evidence"]:
            if evidence["concept_id"] == "whole":
                evidence["line"] += 20
        findings = review.validate_learning_map(data)
        self.assertIn("prerequisite-not-established", finding_ids(findings))
        self.assertTrue(all("not proof" in finding["explanation"] for finding in findings if finding["ism"] == "prerequisite-not-established"))

    def test_unknown_prerequisite_is_annotation_gap(self):
        data = self.valid_map()
        data["concepts"][1]["prerequisites"] = ["missing"]
        self.assertIn("prerequisite-not-established", finding_ids(review.validate_learning_map(data)))

    def test_declared_prior_knowledge_is_not_reported_as_missing_practice(self):
        data = self.valid_map()
        data["declared_prior_knowledge"] = ["whole"]
        data["evidence"] = [item for item in data["evidence"] if item["concept_id"] == "fraction"]
        ids = finding_ids(review.validate_learning_map(data))
        self.assertEqual(ids, [])

    def test_prior_knowledge_can_be_used_before_a_later_refresher(self):
        data = self.valid_map()
        data['declared_prior_knowledge'] = ['whole']
        data['concepts'][0]['teaching_line'] = 100
        self.assertEqual(review.validate_learning_map(data), [])

    def test_bool_is_not_accepted_as_positive_line(self):
        data = self.valid_map()
        data["concepts"][0]["teaching_line"] = True
        with self.assertRaises(review.ReviewInputError):
            review.validate_learning_map(data)

    def test_unknown_field_is_rejected(self):
        data = self.valid_map()
        data["unexpected"] = 1
        with self.assertRaises(review.ReviewInputError):
            review.validate_learning_map(data)

    def test_duplicate_concept_id_is_rejected(self):
        data = self.valid_map()
        data["concepts"].append(data["concepts"][0].copy())
        with self.assertRaises(review.ReviewInputError):
            review.validate_learning_map(data)

    def test_evidence_before_first_use_is_rejected(self):
        data = self.valid_map()
        data["evidence"].append({"kind": "practice", "concept_id": "fraction", "line": 1})
        with self.assertRaises(review.ReviewInputError):
            review.validate_learning_map(data)

    def test_unknown_evidence_kind_is_rejected(self):
        data = self.valid_map()
        data["evidence"].append({"kind": "mastery", "concept_id": "fraction", "line": 20})
        with self.assertRaises(review.ReviewInputError):
            review.validate_learning_map(data)

    def test_external_declared_prior_id_satisfies_prerequisite(self):
        data = self.valid_map()
        data["declared_prior_knowledge"] = ["not-in-graph"]
        data["concepts"][1]["prerequisites"] = ["not-in-graph"]
        self.assertEqual(review.validate_learning_map(data), [])

    def test_first_use_before_teaching_is_a_review_finding(self):
        data = self.valid_map()
        data["concepts"][1]["first_use_line"] = 8
        findings = review.validate_learning_map(data)
        self.assertIn("prerequisite-not-established", finding_ids(findings))
        self.assertTrue(any("first_use_line" in finding["explanation"] for finding in findings))

    def test_missing_each_practice_family_is_reported_separately(self):
        data = self.valid_map()
        data["evidence"] = [item for item in data["evidence"] if item["kind"] == "transfer"]
        findings = review.validate_learning_map(data)
        practice_findings = [f for f in findings if f["ism"] == "practice-evidence-missing"]
        self.assertEqual(len(practice_findings), 6)
        self.assertTrue(any("worked-example" in f["explanation"] for f in practice_findings))
        self.assertTrue(any("practice" in f["explanation"] for f in practice_findings))
        self.assertTrue(any("retrieval" in f["explanation"] for f in practice_findings))

    def test_min_layers_is_checked_for_empty_and_map_only_calls(self):
        with self.assertRaises(review.ReviewInputError):
            review.scan_text("chapter.md", "plain prose", min_layers=True)
        with self.assertRaises(review.ReviewInputError):
            review._run([], None, 0)


if __name__ == "__main__":
    unittest.main()
