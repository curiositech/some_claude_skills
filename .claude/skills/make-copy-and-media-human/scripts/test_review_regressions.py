#!/usr/bin/env python3
"""Regressions for semantic overreach; no network, model, or temporary files."""
import json
from pathlib import Path
import shutil
import subprocess
import unittest
from unittest.mock import Mock, call, patch

import humanize_review as review
import render_check

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

    def test_short_sentence_runs_point_to_each_local_passage(self):
        longer = "The auditor checked the file against the independently recorded result."
        lines = ([longer] * 20 + ["", longer + " Review passed.", "The logs matched.",
                  "The issue closed.", longer, "", "Ready. Cleared. Filed. Shipped."])
        found = review.analyze_prose(Path("report.md"), "\n".join(lines))
        runs = [f for f in found if f["ism"] == "staccato-fragment-triplet"]
        self.assertEqual([(f["line"], f["excerpt"], f["severity"]) for f in runs], [
            (22, "Review passed. The logs matched. The issue closed.", "low"),
            (27, "Ready. Cleared. Filed. Shipped.", "low"),
        ])

    def test_isolated_short_sentences_and_nonprose_do_not_form_runs(self):
        paragraph = "Passed. The auditor compared both records before making its decision."
        text = "\n\n".join([paragraph] * 12) + (
            "\n\nPassed.\n\nClosed.\n\nFiled.\n"
            "\n# Ready. Closed. Filed.\n"
            "\nCleared. Filed. Shipped.\n=======================\n"
            "\n- Cleared.\n- Filed.\n- Shipped.\n"
            "\n```\nCleared. Filed. Shipped.\n```\n"
            "\n    Closed. Filed. Shipped.\n"
            "\nProof.\nCleared. Filed.\n∎.\n"
            "\nCleared! Filed? Shipped.\n")
        findings = review.analyze_prose(Path("report.md"), text)
        self.assertNotIn("staccato-fragment-triplet", {f["ism"] for f in findings})

    def test_latex_short_sentence_cues_keep_source_line_numbers(self):
        source = "\n".join([
            r"\section{Cleared. Filed. Shipped.}",
            r"\begin{verbatim}",
            "Cleared. Filed. Shipped.",
            r"\end{verbatim}",
            r"\begin{enumerate}",
            r"\item Cleared. Filed. Shipped.",
            r"\end{enumerate}",
            "",
            "Proof.",
            "Cleared. Filed.",
            r"\qed",
            "",
            "The proof requires every entry to remain recorded.",
            "The daemon writes. The daemon checks. The daemon confirms.",
        ])
        with patch.object(Path, "read_text", return_value=source):
            found = review.analyze_file(Path("report.tex"))
        runs = [f for f in found if f["ism"] == "staccato-fragment-triplet"]
        self.assertEqual([(f["line"], f["excerpt"]) for f in runs], [
            (14, "The daemon writes. The daemon checks. The daemon confirms."),
        ])

    def test_latex_book_class_commands_do_not_trigger_undefined_macro(self):
        source = r"""\documentclass{book}
\begin{document}
\chapter{Introduction}
\listoffigures
\end{document}"""
        findings = review.analyze_latex(Path("book.tex"), source)
        self.assertNotIn("macro-used-but-never-defined", {item["ism"] for item in findings})
        rule = next(item for item in review.CATALOG["items"]
                    if item["name"] == "macro-used-but-never-defined")
        self.assertEqual(rule["detection_type"], "rendered")

    def test_manuscript_language_retains_its_legitimate_addressee(self):
        source = (
            "Abstract\nWe show that the queue reduces retries. As you can see in Figure 1, "
            "error rates fall. I do not have access to the private calibration records.\n"
            "The appendix describes research on the phrase counterfeit consciousness. "
            "We used independent human ratings. Related work uses GPT-4 for a different task. "
            "The authors discuss strengths of the method. The quoted reviewer wrote I recommend acceptance. "
            + ("The appendix then records the evidence that informed this response. ") * 18
        )
        findings = review.analyze_manuscript(Path("report.tex"), source)
        self.assertEqual(findings, [])
        rules = {item["name"]: item for item in review.CATALOG["items"]}
        for name in ("manuscript-addressed-to-the-user", "tortured-phrase",
                     "review-with-no-locator", "model-used-as-an-instrument-with-no-version-date-or-parameters"):
            with self.subTest(name=name):
                self.assertEqual(rules[name]["detection_type"], "llm-judge")

    def test_literal_manuscript_residue_remains_a_static_check(self):
        source = (
            r"\cite{key} accompanies our previously published result." "\n"
            "As an AI language model, here is a possible summary.\n"
            r"\cite{TODO} belongs in the bibliography."
        )
        self.assertEqual(review.analyze_manuscript(Path("report.tex"), r"\cite{key}"), [])
        findings = review.analyze_manuscript(Path("report.tex"), source)
        self.assertEqual([(item["ism"], item["line"]) for item in findings], [
            ("chat-preamble-in-the-manuscript", 2),
            ("placeholder-token-left-in-a-reference-or-heading", 3),
        ])

    def test_low_burstiness_still_uses_the_author_baseline(self):
        body = "The auditor reviews each recorded event. " * 12
        for baseline, strengths in [(None, ["low"]), ({"sentence_cv": 0.5}, ["high"]),
                                    ({"sentence_cv": 0}, [])]:
            with self.subTest(baseline=baseline):
                found = review.analyze_prose(Path("report.md"), body, base=baseline)
                self.assertEqual([f["severity"] for f in found
                                  if f["ism"] == "low-burstiness-uniform-rhythm"], strengths)
                self.assertNotIn("staccato-fragment-triplet", {f["ism"] for f in found})

    def test_catalog_agrees_on_judgment_boundary(self):
        cat = {i["name"]: i for i in review.CATALOG["items"]}
        self.assertEqual(cat["eyebrow-with-no-information"]["detection_type"], "llm-judge")
        self.assertEqual(cat["invisible-unicode-artifacts"]["severity"], "low")
        self.assertEqual(cat["title-stack-candidate"]["severity"], "low")
        self.assertIn("7s", cat["no-worked-example"]["after"])

    def test_valid_early_back_reference_is_not_a_keyword_finding(self):
        prose = [
            "The queue stores pending requests until a worker is available.",
            "As noted above, the queue stores pending requests.",
            ("The dispatcher assigns a pending request when a worker finishes its prior job. "
             "The scheduler waits when no worker has capacity. ") * 22,
        ]
        findings = review.analyze_prose(Path("queue.md"), "\n".join(prose))
        self.assertNotIn("unearned-prior-reference", {item["ism"] for item in findings})
        rule = next(item for item in review.CATALOG["items"]
                    if item["name"] == "unearned-prior-reference")
        self.assertEqual(rule["detection_type"], "llm-judge")

    def test_apology_and_failure_language_need_the_surrounding_ui_context(self):
        ui = ("<p>Sorry for the inconvenience. Your upload exceeded 10 MB;"
              " choose a smaller file and retry.</p>")
        self.assertEqual(review.analyze_ui_strings(Path("upload.html"), ui), [])
        rules = {item["name"]: item for item in review.CATALOG["items"]}
        self.assertEqual(rules["apology-in-place-of-explanation"]["detection_type"], "llm-judge")
        self.assertEqual(rules["generic-failure-string"]["detection_type"], "llm-judge")

    def test_valid_interpolation_does_not_fail_the_static_ui_check(self):
        for path, text in [
            (Path("locales/en.json"), '{"welcome": "Hello, {{name}}!"}'),
            (Path("Welcome.tsx"), "const label = 'Hello, {{name}}!';"),
        ]:
            with self.subTest(path=path), patch.object(Path, "read_text", return_value=text):
                findings = review.analyze_file(path)
            self.assertNotIn("unresolved-token-in-ui-string", {item["ism"] for item in findings})
        rules = {item["name"]: item for item in review.CATALOG["items"]}
        self.assertEqual(rules["unresolved-token-in-ui-string"]["detection_type"], "rendered")

    def test_punctuation_rate_retains_an_aggregate_low_severity_cue(self):
        strings = {f"label{i}": "All set!" if i < 2 else "Next" for i in range(12)}
        findings = review.analyze_ui_strings(Path("locales/en.json"), json.dumps(strings))
        self.assertEqual([(item["ism"], item["severity"]) for item in findings],
                         [("exclamation-in-system-strings", "low")])


class HtmlSuppression(unittest.TestCase):
    def test_suppressed_specimens_do_not_leak_into_review(self):
        html = (
            "<p>Introduction</p><!-- humanize:ignore-start -->\n"
            "<p>As an AI language model, I cannot do that.</p>\n"
            "<!-- humanize:ignore-end --><p>oaicite</p>\n"
        )
        with patch.object(Path, "read_text", return_value=html):
            findings = review.analyze_file(Path("page.html"))
        self.assertNotIn("as-an-ai-leakage", {item["ism"] for item in findings})
        residue = [item for item in findings if item["ism"] == "model-markup-residue"]
        self.assertEqual([item["line"] for item in residue], [3])

    def test_inline_suppression_leaves_neighboring_prose_intact(self):
        html = ("<p>Before <!-- humanize:ignore-start -->hidden"
                "<!-- humanize:ignore-end --> after.</p>\n")
        text = review.strip_markup(html)
        self.assertIn("Before", text)
        self.assertIn("after.", text)
        self.assertNotIn("hidden", text)
        self.assertEqual(text.count("\n"), html.count("\n"))


    def test_multiline_markup_and_comments_keep_source_line_numbers(self):
        html = (
            "<style>\np { margin: 0; }\n</style>\n"
            "<!--\n A regular comment\n-->\n"
            "<script>\nconsole.log('hello');\n</script>\n"
            "<p>{{ fname }}</p>\n"
        )
        with patch.object(Path, "read_text", return_value=html):
            findings = review.analyze_file(Path("page.html"))
        placeholders = [item for item in findings if item["ism"] == "unfilled-placeholder-residue"]
        self.assertEqual([item["line"] for item in placeholders], [10])

    def test_html_url_attributes_are_scanned_outside_suppression_only(self):
        html = (
            "<!-- humanize:ignore-start -->\n"
            '<a href="https://example.com/?utm_source=chatgpt.com">Specimen</a>\n'
            "<!-- humanize:ignore-end -->\n"
            '<a href="https://example.com/?x=1&amp;utm_source=claude">Source</a>\n'
            '<p data-href="https://example.com/?utm_source=copilot">Data only</p>\n'
        )
        with patch.object(Path, "read_text", return_value=html):
            findings = review.analyze_file(Path("page.html"))
        tracking = [item for item in findings if item["ism"] == "tracking-param-residue"]
        self.assertEqual([item["line"] for item in tracking], [4])
        self.assertIn("1 chat-attribution", tracking[0]["excerpt"])

    def test_css_suppression_masks_palette_specimen_before_markup_scans(self):
        css = (
            "/* humanize:ignore-start */\n"
            ".specimen { color: #6366f1; }\n"
            "/* humanize:ignore-end */\n"
            ".control { color: #4f46e5; }\n"
        )
        with patch.object(Path, "read_text", return_value=css):
            findings = review.analyze_file(Path("style.css"))
        hits = [item for item in findings if item["ism"] == "tailwind-indigo-default-palette"]
        self.assertEqual([item["line"] for item in hits], [4])
        self.assertNotIn("#6366f1", hits[0]["excerpt"])


    def test_jsx_suppression_masks_placeholder_before_web_build_scans(self):
        jsx = (
            '<section>{/* humanize:ignore-start */}<p>Lorem ipsum</p>\n'
            '{/* humanize:ignore-end */}<p>Actual product documentation.</p></section>\n'
        )
        with patch.object(Path, "read_text", return_value=jsx):
            findings = review.analyze_file(Path("Examples.tsx"))
        self.assertNotIn("lorem-ipsum-in-live-build", {item["ism"] for item in findings})
        self.assertNotIn("Lorem ipsum", " ".join(item["excerpt"] for item in findings))


class ModalProbe(unittest.TestCase):
    def test_probe_only_activates_selected_controls_and_limits_attempts(self):
        page = Mock(url="file:///fixture.html")
        controls = [Mock(), Mock()]
        for control in controls:
            control.inner_text.return_value = "Open"
        page.query_selector_all.side_effect = [[control] for control in controls]
        page.evaluate.return_value = None

        self.assertEqual(
            render_check.probe_modals(page, "fixture.html", ("#open", "#other"), limit=1),
            [],
        )
        page.query_selector_all.assert_called_once_with("#open")
        controls[0].press.assert_called_once_with("Enter")
        controls[1].press.assert_not_called()

    def test_ambiguous_selector_activates_nothing(self):
        page = Mock(url="file:///fixture.html")
        controls = [Mock(), Mock()]
        page.query_selector_all.return_value = controls
        with self.assertRaisesRegex(ValueError, "match exactly one element"):
            render_check.probe_modals(page, "fixture.html", (".open",))
        for control in controls:
            control.press.assert_not_called()

    def test_escape_success_does_not_hide_a_missing_tab_trap(self):
        page = Mock(url="file:///fixture.html")
        trigger = Mock()
        trigger.inner_text.return_value = "Open preferences"
        page.query_selector_all.return_value = [trigger]
        page.evaluate.side_effect = [
            {"focusInside": True, "focusables": 2, "native": False},
            False,
            None,
            True,
        ]

        findings = render_check.probe_modals(page, "fixture.html", ("#open",))

        self.assertEqual(page.keyboard.press.call_args_list, [call("Tab"), call("Escape")])
        self.assertEqual(len(findings), 1)
        self.assertIn("Tab moved focus out", findings[0]["excerpt"])
        self.assertNotIn("Escape did not close", findings[0]["excerpt"])


    def test_tab_containment_is_exercised_for_a_focusable_dialog_container(self):
        page = Mock(url="file:///fixture.html")
        trigger = Mock()
        trigger.inner_text.return_value = "Open notice"
        page.query_selector_all.return_value = [trigger]
        page.evaluate.side_effect = [
            {"focusInside": True, "focusables": 0, "native": False},
            False,
            None,
            True,
        ]

        findings = render_check.probe_modals(page, "fixture.html", ("#open",))

        self.assertEqual(page.keyboard.press.call_args_list, [call("Tab"), call("Escape")])
        self.assertEqual(len(findings), 1)
        self.assertIn("Tab moved focus out", findings[0]["excerpt"])

    def test_probe_stops_after_navigation(self):
        page = Mock(url="file:///fixture.html")
        first = Mock()
        first.inner_text.return_value = "Open"
        first.press.side_effect = lambda _key: setattr(page, "url", "file:///another.html")
        page.query_selector_all.return_value = [first]

        self.assertEqual(render_check.probe_modals(page, "fixture.html", ("#open", "#second")), [])
        page.query_selector_all.assert_called_once_with("#open")
        page.evaluate.assert_not_called()


    @unittest.skipUnless(shutil.which("node"), "Node is needed to exercise the dialog probes")
    def test_hidden_first_dialog_does_not_mask_the_visible_dialog(self):
        fixture = """
const focus = {tagName: "BUTTON"};
const dialog = (width, visibility, contains) => ({
  tagName: "DIV", visibility,
  getBoundingClientRect: () => ({width, height: width}),
  querySelectorAll: () => [focus],
  contains: (element) => contains && element === focus,
  matches: () => false,
});
const hidden = dialog(0, "visible", false);
const invisible = dialog(100, "hidden", false);
const visible = dialog(100, "visible", true);
let candidates = [hidden, invisible, visible];
global.document = {activeElement: focus, querySelectorAll: () => candidates};
global.getComputedStyle = (element) => ({visibility: element.visibility});
"""
        reports = subprocess.check_output(
            ["node", "-e", fixture + f"""
const modal = ({render_check.MODAL_PROBE});
const containsFocus = ({render_check.CONTAINED_JS});
const opened = modal();
const contained = containsFocus();
candidates = [hidden, invisible];
console.log(JSON.stringify([opened, contained, modal(), containsFocus()]));
"""], text=True,
        )
        opened, contained, closed, contained_after_close = json.loads(reports)
        self.assertTrue(opened["focusInside"])
        self.assertTrue(contained)
        self.assertIsNone(closed)
        self.assertFalse(contained_after_close)


@unittest.skipUnless(shutil.which("node"), "Node is needed to exercise the browser probe logic")
class ContrastProbe(unittest.TestCase):
    def test_document_background_is_used_through_transparent_ancestors(self):
        fixture = r"""
const root = {scrollWidth: 500};
const body = {parentElement: root};
const paragraph = {
  id: "example",
  tagName: "P",
  innerText: "Example paragraph",
  childNodes: [{nodeType: 3, textContent: "Example paragraph"}],
  parentElement: body,
  getAttribute: () => null,
  getBoundingClientRect: () => ({width: 120, height: 20}),
};
global.window = {innerWidth: 500};
global.document = {
  documentElement: root, body,
  querySelectorAll: (selector) => selector.startsWith("a, button,") ? [paragraph] : [],
  createElement: () => ({getContext: () => ({})}),
};
let rootBackground = "rgb(0, 0, 0)";
let bodyImage = "none";
let bodyColor = "rgba(0, 0, 0, 0)";
let foreground = "rgb(255, 255, 255)";
global.getComputedStyle = (el) => ({
  backgroundColor: el === root ? rootBackground : el === body ? bodyColor : "rgba(0, 0, 0, 0)",
  backgroundImage: el === body ? bodyImage : "none",
  color: foreground, fontSize: "16px", fontWeight: "400",
});
"""
        reports = subprocess.check_output(
            ["node", "-e", fixture + f"""
const probe = ({render_check.PROBE});
const blackBackground = probe().contrast;
rootBackground = "rgba(255, 255, 255, 1)";
const whiteBackground = probe().contrast;
bodyImage = "linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0))";
const gradient = probe().contrast;
bodyImage = "none";
bodyColor = "rgba(0, 0, 0, 0.5)";
const translucentBackground = probe().contrast;
bodyColor = "rgba(0, 0, 0, 0)";
foreground = "rgba(255, 255, 255, 0.5)";
const translucentForeground = probe().contrast;
rootBackground = "oklch(0 0 0)";
foreground = "oklch(1 0 0)";
const otherColorSpace = probe().contrast;
console.log(JSON.stringify({{blackBackground, whiteBackground, gradient,
  translucentBackground, translucentForeground, otherColorSpace}}));
"""], text=True,
        )
        measurements = json.loads(reports)
        self.assertEqual([item["ratio"] for item in measurements.pop("whiteBackground")], [1])
        for state, findings in measurements.items():
            with self.subTest(state=state):
                self.assertEqual(findings, [])


if __name__ == "__main__":
    unittest.main()
