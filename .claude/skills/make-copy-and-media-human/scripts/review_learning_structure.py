#!/usr/bin/env python3
"""Offline structure and learning-map review for the humanization skill.

This script deliberately reports observable structure and teacher/model
annotations. It does not infer semantic redundancy, authorship, comprehension,
or whether a learner has mastered a concept.

Structural mode scans Markdown, HTML, and TeX for a contiguous stack of three
or more explicit heading-like blocks. It emits the low-severity
``title-stack-candidate`` finding. A chapter title followed by a subtitle is
only two layers and is therefore not a finding at the default threshold.

The TeX mode is intentionally a small source scanner, not a TeX parser. It
supports simple one-line ``chapter``, ``section``, ``subsection``,
``subsubsection``, and ``paragraph`` commands plus standalone ``textbf`` and
``textit`` lines, and ignores common verbatim environments.

Learning-map mode validates a strict annotation graph. Example schema::

    {
      "source": "chapter.md",
      "declared_prior_knowledge": ["whole-numbers"],
      "concepts": [
        {"id": "fractions", "prerequisites": ["whole-numbers"],
         "teaching_line": 10, "first_use_line": 10}
      ],
      "evidence": [
        {"kind": "worked-example", "concept_id": "fractions", "line": 12},
        {"kind": "practice", "concept_id": "fractions", "line": 20},
        {"kind": "retrieval", "concept_id": "fractions", "line": 28},
        {"kind": "transfer", "concept_id": "fractions", "line": 34}
      ]
    }

Missing prerequisites, worked-example/practice/retrieval evidence, and
transfer evidence are reported with the agreed catalog IDs. These are
annotation gaps, not proof that a learner lacks a prerequisite or skill.
Evidence locations are validated, but no semantic judgment is made.

Output is a JSON array accepted by ``humanize_review.py --findings``.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable


SUPPORTED_SUFFIXES = {".md", ".markdown", ".html", ".htm", ".tex", ".latex"}
EVIDENCE_KINDS = {"worked-example", "practice", "retrieval", "transfer"}
PRACTICE_EVIDENCE_KINDS = ("worked-example", "practice", "retrieval")
FINDING_IDS = {
    "title-stack-candidate",
    "prerequisite-not-established",
    "practice-evidence-missing",
    "transfer-evidence-missing",
}


class ReviewInputError(ValueError):
    """An input or annotation map violates the documented strict schema."""


def _validate_min_layers(value: Any) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ReviewInputError("--min-layers must be a positive integer (booleans are not integers)")
    return value


def _positive_int(value: Any, label: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ReviewInputError(f"{label} must be a positive integer (booleans are not integers)")
    return value


def _string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ReviewInputError(f"{label} must be a non-empty string")
    return value


def _string_list(value: Any, label: str) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(item, str) or not item.strip() for item in value):
        raise ReviewInputError(f"{label} must be an array of non-empty strings")
    if len(set(value)) != len(value):
        raise ReviewInputError(f"{label} must not contain duplicate IDs")
    return value


def _known_keys(obj: dict[str, Any], allowed: set[str], label: str) -> None:
    unknown = sorted(set(obj) - allowed)
    if unknown:
        raise ReviewInputError(f"{label} has unknown field(s): {', '.join(unknown)}")


def _finding(file: str, line: int, excerpt: str, ism: str, explanation: str) -> dict[str, Any]:
    return {
        "file": file,
        "line": line,
        "excerpt": excerpt.strip()[:300],
        "ism": ism,
        "dialect": "generic-llm",
        "severity": "low",
        "explanation": explanation,
        "rewrite": "",
        "layer": "learning-structure",
    }


def _stack_findings(path: str, blocks: list[tuple[int, str]], min_layers: int) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    _validate_min_layers(min_layers)
    if len(blocks) < min_layers:
        return findings
    # Blocks are already contiguous by parser definition. Report one finding
    # per maximal run rather than one finding per heading.
    excerpt = " | ".join(text for _, text in blocks[:min_layers])
    findings.append(_finding(
        path,
        blocks[0][0],
        excerpt,
        "title-stack-candidate",
        "Consecutive heading-like blocks meet the configured layer threshold. "
        "This is a low-severity structural candidate only; it does not claim "
        "semantic redundancy, poor hierarchy, or authorship.",
    ))
    return findings


def _runs_findings(path: str, runs: list[list[tuple[int, str]]], min_layers: int) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    for blocks in runs:
        findings.extend(_stack_findings(path, blocks, min_layers))
    return findings


def _mask_delimited_spans(text: str, start: str, end: str) -> str:
    """Blank delimited spans while preserving every source newline."""
    result: list[str] = []
    cursor = 0
    while cursor < len(text):
        begin = text.find(start, cursor)
        if begin < 0:
            result.append(text[cursor:])
            break
        result.append(text[cursor:begin])
        finish = text.find(end, begin + len(start))
        if finish < 0:
            hidden = text[begin:]
            result.append("".join("\n" if ch == "\n" else "\r" if ch == "\r" else " " for ch in hidden))
            break
        finish += len(end)
        hidden = text[begin:finish]
        result.append("".join("\n" if ch == "\n" else "\r" if ch == "\r" else " " for ch in hidden))
        cursor = finish
    return "".join(result)


def _mask_humanize_ignored(text: str) -> str:
    start_pattern = re.compile(
        r"<!--\s*humanize:ignore-start\s*-->|^\s*%\s*humanize:ignore-start[^\n]*$",
        re.IGNORECASE | re.MULTILINE,
    )
    end_pattern = re.compile(
        r"<!--\s*humanize:ignore-end\s*-->|^\s*%\s*humanize:ignore-end[^\n]*$",
        re.IGNORECASE | re.MULTILINE,
    )
    result: list[str] = []
    cursor = 0
    while cursor < len(text):
        begin_match = start_pattern.search(text, cursor)
        if begin_match is None:
            result.append(text[cursor:])
            break
        result.append(text[cursor:begin_match.start()])
        end_match = end_pattern.search(text, begin_match.end())
        finish = end_match.end() if end_match else len(text)
        hidden = text[begin_match.start():finish]
        result.append("".join("\n" if ch == "\n" else "\r" if ch == "\r" else " " for ch in hidden))
        cursor = finish
    return "".join(result)


def _markdown_runs(text: str) -> list[list[tuple[int, str]]]:
    text = _mask_delimited_spans(_mask_humanize_ignored(text), "<!--", "-->")
    runs: list[list[tuple[int, str]]] = []
    in_fence = False
    fence_marker = ""
    in_frontmatter = False
    pending: list[tuple[int, str]] = []

    def flush() -> None:
        if pending:
            runs.append(pending.copy())
            pending.clear()

    for line_no, raw in enumerate(text.splitlines(), 1):
        stripped = raw.strip()
        if line_no == 1 and stripped == "---":
            in_frontmatter = True
            flush()
            continue
        if in_frontmatter:
            if stripped in {"---", "..."}:
                in_frontmatter = False
            continue
        if stripped and raw.expandtabs(4).startswith("    "):
            # Indented code is not a standalone heading/emphasis block.
            flush()
            continue
        if re.match(r"^\s*(```+|~~~+)", raw):
            marker = re.match(r"^\s*(```+|~~~+)", raw).group(1)
            if not in_fence:
                in_fence, fence_marker = True, marker
            elif marker[0] == fence_marker[0] and len(marker) >= len(fence_marker) and raw.strip() == marker:
                in_fence = False
            flush()
            continue
        if in_fence or "<!--" in raw or "-->" in raw:
            flush()
            continue
        if not stripped:
            continue
        candidate: str | None = None
        if re.match(r"^#{1,6}\s+\S", stripped):
            candidate = re.sub(r"^#{1,6}\s+", "", stripped).rstrip("# ")
        else:
            # Conservative whole-block emphasis: matching delimiters and
            # non-space edges, without internal delimiters hiding body prose.
            emphasis = re.fullmatch(r"(\*\*|__|\*|_)([^*_]+)\1", stripped)
            if emphasis and emphasis[2] == emphasis[2].strip():
                candidate = emphasis[2]
        if candidate is None:
            flush()
        else:
            pending.append((line_no, candidate.strip()))
    # A blank line does not break a stack; actual prose does. Frontmatter is
    # intentionally consumed above. A stack ending at EOF is still a stack.
    flush()
    return runs


class _HTMLNode:
    def __init__(self, tag: str | None, line: int, attrs: dict[str, str] | None = None) -> None:
        self.tag = tag
        self.line = line
        self.attrs = attrs or {}
        self.children: list[_HTMLNode | str] = []


class _HTMLTree(HTMLParser):
    ignored = {"nav", "script", "style", "code", "pre", "template"}
    void_elements = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = _HTMLNode(None, 1)
        self.stack = [self.root]
        self.ignore_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        line, _ = self.getpos()
        attr_map = {key.lower(): value or "" for key, value in attrs}
        node = _HTMLNode(tag.lower(), line, attr_map)
        self.stack[-1].children.append(node)
        if node.tag in self.void_elements:
            return
        self.stack.append(node)
        if node.tag in self.ignored:
            self.ignore_depth += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        line, _ = self.getpos()
        self.stack[-1].children.append(_HTMLNode(tag.lower(), line, {k.lower(): v or "" for k, v in attrs}))

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                while len(self.stack) - 1 >= index:
                    popped = self.stack.pop()
                    if popped.tag in self.ignored:
                        self.ignore_depth = max(0, self.ignore_depth - 1)
                return

    def handle_data(self, data: str) -> None:
        if self.ignore_depth == 0:
            self.stack[-1].children.append(data)


def _node_text(node: _HTMLNode) -> str:
    parts: list[str] = []
    for child in node.children:
        if isinstance(child, str):
            parts.append(child)
        else:
            parts.append(_node_text(child))
    return re.sub(r"\s+", " ", html.unescape("".join(parts))).strip()


def _is_container(node: _HTMLNode) -> bool:
    # Ordinary layout wrappers are scan scopes too. Keep their boundaries:
    # flattening sibling wrappers could join headings from unrelated cards.
    if node.tag in {"header", "section", "article", "hgroup", "div"}:
        return True
    role = node.attrs.get("role", "").lower()
    classes = set(node.attrs.get("class", "").split())
    return role == "group" or "group" in classes


def _html_runs(node: _HTMLNode) -> list[list[tuple[int, str]]]:
    runs: list[list[tuple[int, str]]] = []
    run: list[tuple[int, str]] = []

    def flush() -> None:
        nonlocal run
        if run:
            runs.append(run)
            run = []

    if not _is_container(node):
        return runs
    for child in node.children:
        if isinstance(child, str):
            if child.strip():
                flush()
            continue
        if _is_container(child):
            # Nested containers are separate scopes, never a parent stack.
            flush()
            continue
        if child.tag in {"figure", "img", "video", "audio", "svg", "canvas", "iframe", "object", "embed", "hr"}:
            # Non-text content still separates title layers.
            flush()
            continue
        text = _node_text(child)
        classes = set(child.attrs.get("class", "").split())
        explicit_role = child.tag == "p" and bool(classes & {"eyebrow", "subtitle", "dek"})
        if child.tag in {f"h{i}" for i in range(1, 7)} or (
            child.tag in {"strong", "b", "em", "i"} and text
        ) or (explicit_role and text):
            run.append((child.line, text))
        else:
            # An unrecognized block can carry media without text. Only known
            # non-content nodes are transparent to a run.
            if text or child.tag not in _HTMLTree.ignored | {"br", "wbr", "meta", "link"}:
                flush()
    flush()
    return runs


def _html_findings(path: str, text: str, min_layers: int) -> list[dict[str, Any]]:
    text = _mask_humanize_ignored(text)
    parser = _HTMLTree()
    parser.feed(text)
    findings: list[dict[str, Any]] = []
    seen: set[tuple[int, str]] = set()

    def walk(node: _HTMLNode) -> None:
        if _is_container(node):
            for blocks in _html_runs(node):
                if len(blocks) < min_layers:
                    continue
                key = (blocks[0][0], " | ".join(x[1] for x in blocks[:min_layers]))
                if key not in seen:
                    seen.add(key)
                    findings.extend(_stack_findings(path, blocks, min_layers))
        for child in node.children:
            if isinstance(child, _HTMLNode) and child.tag not in _HTMLTree.ignored:
                walk(child)

    walk(parser.root)
    return findings


def _tex_line(raw: str) -> str:
    # Strip only unescaped comments. ``\%`` is content and must stay content.
    for index, char in enumerate(raw):
        if char != "%":
            continue
        slashes = 0
        cursor = index - 1
        while cursor >= 0 and raw[cursor] == "\\":
            slashes += 1
            cursor -= 1
        if slashes % 2 == 0:
            return raw[:index]
    return raw


def _tex_runs(text: str) -> list[list[tuple[int, str]]]:
    text = _mask_humanize_ignored(text)
    runs: list[list[tuple[int, str]]] = []
    in_verbatim = False
    pending: list[tuple[int, str]] = []
    for line_no, raw in enumerate(text.splitlines(), 1):
        line = _tex_line(raw).strip()
        env = re.search(r"\\(?:begin|end)\s*\{([^}]+)\}", line)
        if env and env.group(1).lower() in {"verbatim", "verbatim*", "lstlisting", "minted"}:
            in_verbatim = env.group(0).startswith(r"\begin")
            if pending:
                runs.append(pending.copy())
                pending.clear()
            continue
        if in_verbatim or not line:
            continue
        candidate: str | None = None
        heading = re.fullmatch(
            r"\\(?:chapter|section|subsection|subsubsection|paragraph)\*?\s*\{([^{}]*)\}",
            line,
        )
        if heading:
            candidate = heading.group(1).strip()
        else:
            styled = re.fullmatch(r"\\text(?:bf|it)\s*\{([^{}]*)\}", line)
            if styled:
                candidate = styled.group(1).strip()
        if candidate:
            pending.append((line_no, candidate))
        else:
            if pending:
                runs.append(pending.copy())
                pending.clear()
    if pending:
        runs.append(pending)
    return runs


def scan_text(path: str, text: str, min_layers: int = 3) -> list[dict[str, Any]]:
    """Scan one in-memory document; useful for callers and no-temp-file tests."""
    _validate_min_layers(min_layers)
    suffix = Path(path).suffix.lower()
    if suffix in {".md", ".markdown"}:
        return _runs_findings(path, _markdown_runs(text), min_layers)
    if suffix in {".html", ".htm"}:
        return _html_findings(path, text, min_layers)
    if suffix in {".tex", ".latex"}:
        return _runs_findings(path, _tex_runs(text), min_layers)
    raise ReviewInputError(f"unsupported document type for {path!r}; use .md, .html, or .tex")


def validate_learning_map(data: Any) -> list[dict[str, Any]]:
    """Validate a map and return annotation-gap findings, or raise cleanly."""
    if not isinstance(data, dict):
        raise ReviewInputError("learning map root must be an object")
    _known_keys(data, {"source", "declared_prior_knowledge", "concepts", "evidence"}, "learning map")
    required = {"source", "declared_prior_knowledge", "concepts", "evidence"}
    missing = sorted(required - set(data))
    if missing:
        raise ReviewInputError("learning map is missing required field(s): " + ", ".join(missing))
    source = _string(data["source"], "source")
    prior = _string_list(data["declared_prior_knowledge"], "declared_prior_knowledge")
    concepts_raw = data.get("concepts")
    evidence_raw = data.get("evidence")
    if not isinstance(concepts_raw, list) or not concepts_raw:
        raise ReviewInputError("concepts must be a non-empty array")
    if not isinstance(evidence_raw, list):
        raise ReviewInputError("evidence must be an array")
    concepts: dict[str, dict[str, Any]] = {}
    for index, concept in enumerate(concepts_raw):
        label = f"concepts[{index}]"
        if not isinstance(concept, dict):
            raise ReviewInputError(f"{label} must be an object")
        _known_keys(concept, {"id", "prerequisites", "teaching_line", "first_use_line"}, label)
        cid = _string(concept.get("id"), f"{label}.id")
        if cid in concepts:
            raise ReviewInputError(f"duplicate concept ID: {cid}")
        prereqs = _string_list(concept.get("prerequisites"), f"{label}.prerequisites")
        teaching = _positive_int(concept.get("teaching_line"), f"{label}.teaching_line")
        first_use = _positive_int(concept.get("first_use_line"), f"{label}.first_use_line")
        if cid in prereqs:
            raise ReviewInputError(f"{label} cannot list itself as a prerequisite")
        concepts[cid] = {"prerequisites": prereqs, "teaching_line": teaching, "first_use_line": first_use}
    evidence_by_concept: dict[str, dict[str, list[int]]] = {cid: {} for cid in concepts}
    for index, evidence in enumerate(evidence_raw):
        label = f"evidence[{index}]"
        if not isinstance(evidence, dict):
            raise ReviewInputError(f"{label} must be an object")
        _known_keys(evidence, {"kind", "concept_id", "line"}, label)
        kind = _string(evidence.get("kind"), f"{label}.kind")
        if kind not in EVIDENCE_KINDS:
            raise ReviewInputError(f"{label}.kind must be one of: {', '.join(sorted(EVIDENCE_KINDS))}")
        cid = _string(evidence.get("concept_id"), f"{label}.concept_id")
        if cid not in concepts:
            raise ReviewInputError(f"{label}.concept_id references unknown concept ID: {cid}")
        line = _positive_int(evidence.get("line"), f"{label}.line")
        if line < concepts[cid]["first_use_line"]:
            raise ReviewInputError(f"{label}.line must be >= {cid}.first_use_line")
        evidence_by_concept[cid].setdefault(kind, []).append(line)

    findings: list[dict[str, Any]] = []
    for cid, concept in concepts.items():
        if cid not in prior and concept["first_use_line"] < concept["teaching_line"]:
            findings.append(_finding(
                source, concept["first_use_line"], cid, "prerequisite-not-established",
                f"Concept {cid!r} has first_use_line before teaching_line. This is an "
                "annotation/order gap, not proof that the learner lacks the concept.",
            ))
        for prereq in concept["prerequisites"]:
            if prereq not in concepts and prereq not in prior:
                findings.append(_finding(
                    source, concept["teaching_line"], cid, "prerequisite-not-established",
                    f"Concept {cid!r} names prerequisite {prereq!r}, but the prerequisite is not "
                    "present in the graph. This is an annotation gap, not proof that the learner "
                    "lacks the prerequisite.",
                ))
            elif prereq not in prior and (
                concepts[prereq]["teaching_line"] >= concept["teaching_line"]
                or concepts[prereq]["first_use_line"] >= concept["teaching_line"]
            ):
                findings.append(_finding(
                    source, concept["teaching_line"], cid, "prerequisite-not-established",
                    f"Concept {cid!r} is taught before its annotated prerequisite {prereq!r}. "
                    "This is an annotation/order gap, not proof that the learner lacks the skill.",
                ))
        if cid not in prior:
            for kind in PRACTICE_EVIDENCE_KINDS:
                if not evidence_by_concept[cid].get(kind):
                    findings.append(_finding(
                        source, concept["first_use_line"], cid, "practice-evidence-missing",
                        f"No {kind} evidence is annotated for concept {cid!r}. This is an "
                        "annotation gap, not proof that the learner had no such learning activity.",
                    ))
        if cid not in prior and not evidence_by_concept[cid].get("transfer"):
            findings.append(_finding(
                source, concept["first_use_line"], cid, "transfer-evidence-missing",
                f"No transfer evidence is annotated for concept {cid!r}. This is an annotation "
                "gap, not proof that the learner cannot transfer the concept.",
            ))
    return findings


def _read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ReviewInputError(f"could not read JSON map {path}: {exc}") from None


def _run(paths: Iterable[str], learning_map: str | None, min_layers: int) -> list[dict[str, Any]]:
    _validate_min_layers(min_layers)
    findings: list[dict[str, Any]] = []
    for raw_path in paths:
        path = Path(raw_path)
        if not path.is_file():
            raise ReviewInputError(f"no such file: {raw_path}")
        try:
            findings.extend(scan_text(str(path), path.read_text(encoding="utf-8"), min_layers))
        except (OSError, UnicodeError) as exc:
            raise ReviewInputError(f"could not read {path}: {exc}") from None
    if learning_map:
        findings.extend(validate_learning_map(_read_json(Path(learning_map))))
    if not findings and not paths and not learning_map:
        raise ReviewInputError("provide at least one document or --learning-map JSON")
    return findings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", help="Markdown, HTML, or TeX documents")
    parser.add_argument("--learning-map", help="strict JSON teacher/model annotation map")
    parser.add_argument("--min-layers", type=int, default=3, help="heading stack threshold (default: 3)")
    parser.add_argument("--output", "--out", dest="output", help="write findings JSON here; stdout by default")
    args = parser.parse_args(argv)
    try:
        findings = _run(args.paths, args.learning_map, args.min_layers)
        payload = json.dumps(findings, indent=2, ensure_ascii=False) + "\n"
        if args.output:
            try:
                Path(args.output).write_text(payload, encoding="utf-8")
            except (OSError, UnicodeError) as exc:
                raise ReviewInputError(f"could not write {args.output}: {exc}") from None
        else:
            sys.stdout.write(payload)
        return 0
    except ReviewInputError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
