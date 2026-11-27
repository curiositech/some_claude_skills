#!/usr/bin/env python3
"""Inventory finding emissions, excluding examples, comments and thresholds.

An inventory is source evidence of a checker, not proof of its coverage or accuracy.
IDs in literal loop rows and dictionary-key loops are resolved. Other dynamic
IDs are deliberately left for manual review.
"""
import ast
from pathlib import Path


def emitted_ids(source):
    tree = ast.parse(source)
    positions = {}
    tables = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Dict):
            keys = {k.value for k in node.value.keys
                    if isinstance(k, ast.Constant) and isinstance(k.value, str)}
            for target in node.targets:
                if isinstance(target, ast.Name):
                    tables[target.id] = keys
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            names = [a.arg for a in node.args.args]
            if node.name in {"finding", "rhythm_finding", "_finding"} and "ism" in names:
                positions[node.name] = names.index("ism")
    found = set()

    class Emissions(ast.NodeVisitor):
        def __init__(self):
            self.bindings = {}

        def visit_FunctionDef(self, node):
            if not node.name.startswith(("test_", "run_selftest", "run_validate")):
                self.generic_visit(node)

        visit_AsyncFunctionDef = visit_FunctionDef

        def visit_For(self, node):
            previous = self.bindings.copy()
            targets = (node.target.elts if isinstance(node.target, (ast.Tuple, ast.List))
                       else [node.target])
            if isinstance(node.iter, (ast.Tuple, ast.List)):
                for index, target in enumerate(targets):
                    if isinstance(target, ast.Name):
                        values = set()
                        for row in node.iter.elts:
                            cells = row.elts if isinstance(row, (ast.Tuple, ast.List)) else [row]
                            if index < len(cells) and isinstance(cells[index], ast.Constant) \
                                    and isinstance(cells[index].value, str):
                                values.add(cells[index].value)
                        self.bindings[target.id] = values
            elif (isinstance(node.iter, ast.Call) and isinstance(node.iter.func, ast.Attribute)
                  and node.iter.func.attr == "items" and isinstance(node.iter.func.value, ast.Name)
                  and targets and isinstance(targets[0], ast.Name)):
                self.bindings[targets[0].id] = tables.get(node.iter.func.value.id, set())
            for statement in node.body:
                self.visit(statement)
            self.bindings = previous
            for statement in node.orelse:
                self.visit(statement)

        def visit_Call(self, node):
            if isinstance(node.func, ast.Name) and node.func.id in positions:
                pos = positions[node.func.id]
                value = node.args[pos] if len(node.args) > pos else None
                for kw in node.keywords:
                    if kw.arg == "ism":
                        value = kw.value
                if isinstance(value, ast.Constant) and isinstance(value.value, str):
                    found.add(value.value)
                elif isinstance(value, ast.Name):
                    found.update(self.bindings.get(value.id, set()))
            self.generic_visit(node)

    Emissions().visit(tree)
    return found


def implemented_ids(directory=None):
    directory = Path(directory) if directory else Path(__file__).resolve().parent
    found = set()
    for path in directory.glob("*.py"):
        if not path.name.startswith("test_") and path.name not in {
            "regenerate_references.py", "implemented_checks.py"
        }:
            found.update(emitted_ids(path.read_text(encoding="utf-8")))
    return found
