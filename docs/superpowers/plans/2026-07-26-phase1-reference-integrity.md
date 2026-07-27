# Phase 1: Reference Integrity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a resolver that proves every declared reference — agent, skill, binary, path, URL, DOM selector, design token — still resolves, then use it to find and fix the real dangling references in this workspace.

**Architecture:** A single dependency-free Python module in `the-lodge/scripts/`, unit-tested with pytest against `tmp_path` fixtures. It parses a `requires:` block from any markdown file's YAML frontmatter and resolves each reference class. Static classes (agents, skills, bins, paths, tokens) resolve offline and always run; live classes (urls, selectors) need network or a browser and run only under `--live`, reporting explicitly as SKIPPED otherwise. Consolidation of the scattered agent definitions comes *after* the resolver exists, so the resolver is what discovers the breakage rather than a human doing it by hand.

**Tech Stack:** Python 3.14.6, pytest 9.1.1, PyYAML (already present), `agent-browser` 0.33.0 (live selector resolution only). No new pip dependencies.

## Global Constraints

- **No new pip dependencies.** PyYAML and pytest are already available; everything else is stdlib.
- **Two repos.** Resolver code and tests land in `~/Developer/the-lodge` (its own git repo). Frontmatter additions land in the theme repo. Commit separately — never stage across both.
- **Lodge pytest config is fixed:** `pyproject.toml` sets `pythonpath = ["scripts"]` and `addopts = "--import-mode=importlib"`. Therefore `scripts/reference_check.py` imports as `import reference_check` with no package prefix, and tests live in `tests/reference_check/`.
- **Exit codes:** `0` all references resolved · `1` one or more unresolved · `2` usage error. Nothing else.
- **Live classes never fail silently.** If `--live` is absent, `urls` and `selectors` report `SKIPPED` in the output. Absence of a check is always stated, never implied.
- **Version floor syntax** for `bins` is exactly `name` or `name>=X.Y.Z`. No other comparators.
- Run all lodge tests with: `cd ~/Developer/the-lodge && pytest tests/reference_check/ -v`

---

### Task 1: Frontmatter parsing and `requires` extraction

**Files:**
- Create: `~/Developer/the-lodge/scripts/reference_check.py`
- Test: `~/Developer/the-lodge/tests/reference_check/test_frontmatter.py`

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `parse_frontmatter(text: str) -> dict` — returns `{}` for any malformed or absent frontmatter, never raises
  - `extract_requires(text: str) -> dict[str, list[str]]` — returns only keys whose value is a list
  - `frontmatter_status(text: str) -> str` — one of `"ok"`, `"absent"`, `"unparseable"`, `"ambiguous"`. Task 5's `check_file` turns anything other than `ok`/`absent` into a failing `Result`.

**Two defences, and the order matters.**

**First, parse correctly.** The delimiter is a `---` at **column 0**. Matching `line.strip() == "---"` also matches an indented `  ---` — and indented, that is ordinary content in any YAML continuation context, not a delimiter. Both a block scalar (`|`/`>`) and a plain multi-line scalar produce it; `d: abc` / `  ---` / `  def` folds to `"abc --- def"` with no block indicator at all. Treating it as a terminator truncates the frontmatter and silently drops every key after it. Jekyll, gray-matter and python-frontmatter all anchor at column 0. Anchoring there means these files simply parse, with nothing to detect:

| Input | Permissive matching | Column-0 anchoring |
|---|---|---|
| indented `---` inside a block scalar | frontmatter truncated, keys lost | **read correctly** |
| indented `---` in a plain multi-line scalar | same truncation | **read correctly** |
| indented `---` mid-`requires:` | later keys silently dropped | **all keys read** |
| malformed declaration after one | reports pass, zero references | **`unparseable`** |

**Second, `frontmatter_status` as a backstop.** Correct parsing is not the same as proving nothing was missed, and this tool exists to prevent silent false passes. `"unparseable"` is the load-bearing branch — a file whose frontmatter cannot be read must fail, never report zero references. `"absent"` distinguishes "declares nothing" from "we could not tell". `"ambiguous"` — a second valid reading yielding a different dependency set — should now be unreachable in practice, because a later candidate needs a column-0 `---` inside it, which makes it multi-document YAML and raises. It is retained deliberately as defence in depth: it costs six lines, and the whole point of this phase is that the verifier is not exempt from verification.

- [ ] **Step 1: Write the failing test**

Create `~/Developer/the-lodge/tests/reference_check/test_frontmatter.py`:

```python
from reference_check import (
    extract_requires,
    frontmatter_status,
    parse_frontmatter,
)

DOC = """---
name: wc-theme-qa
requires:
  agents: [brand-guardian]
  bins: ["agent-browser>=0.33.0"]
---

# Body text with --- a stray delimiter
"""


def test_parse_frontmatter_returns_mapping():
    assert parse_frontmatter(DOC)["name"] == "wc-theme-qa"


def test_parse_frontmatter_ignores_body_delimiters():
    assert "agents" in parse_frontmatter(DOC)["requires"]


def test_parse_frontmatter_no_frontmatter_returns_empty():
    assert parse_frontmatter("# Just a heading\n") == {}


def test_parse_frontmatter_unterminated_returns_empty():
    assert parse_frontmatter("---\nname: x\nno closing delimiter\n") == {}


def test_parse_frontmatter_malformed_yaml_returns_empty():
    assert parse_frontmatter("---\n: : :\n---\n") == {}


def test_parse_frontmatter_value_containing_triple_dash():
    """Regression: a `---` inside a quoted value must not terminate the block.

    A substring split truncates here, YAML then fails, and the whole requires
    block silently vanishes — reference-check would report PASS having read
    nothing. The delimiter must be line-anchored.
    """
    doc = (
        '---\n'
        'description: "uses --- as a separator"\n'
        'requires:\n'
        '  agents: [brand-guardian]\n'
        '---\n'
        'body\n'
    )
    assert parse_frontmatter(doc)["description"] == "uses --- as a separator"
    assert extract_requires(doc) == {"agents": ["brand-guardian"]}


def test_extract_requires_returns_declared_classes():
    got = extract_requires(DOC)
    assert got == {"agents": ["brand-guardian"], "bins": ["agent-browser>=0.33.0"]}


def test_extract_requires_absent_returns_empty():
    assert extract_requires("---\nname: x\n---\n") == {}


def test_extract_requires_drops_non_list_values():
    doc = "---\nrequires:\n  agents: brand-guardian\n  skills: [browser-tooling]\n---\n"
    assert extract_requires(doc) == {"skills": ["browser-tooling"]}


# --- "never raises" is a contract, and yaml.YAMLError does not cover it ---

def test_parse_frontmatter_invalid_calendar_date_does_not_raise():
    """yaml.safe_load raises ValueError, not YAMLError, on 2023-02-30."""
    assert parse_frontmatter("---\npublished: 2023-02-30\n---\n") == {}


def test_parse_frontmatter_deep_nesting_does_not_raise():
    """Deeply nested flow collections raise RecursionError, not YAMLError."""
    doc = "---\nagents: " + "[" * 20000 + "]" * 20000 + "\n---\n"
    assert parse_frontmatter(doc) == {}


# --- column-0 anchoring: an indented `---` is CONTENT, not a delimiter ---

BLOCK_SCALAR = (
    '---\n'
    'description: |\n'
    '  ---\n'
    '  a horizontal rule inside a literal block\n'
    'requires:\n'
    '  agents: [brand-guardian]\n'
    '---\n'
)

MID_BLOCK_SCALAR = (
    '---\n'
    'requires:\n'
    '  agents: [brand-guardian]\n'
    '  notes: |\n'
    '    ---\n'
    '  bins: ["agent-browser>=0.33.0"]\n'
    '---\n'
)


def test_frontmatter_status_ok():
    assert frontmatter_status("---\nrequires:\n  agents: [x]\n---\nbody\n") == "ok"


def test_frontmatter_status_absent():
    assert frontmatter_status("# heading\n") == "absent"


def test_frontmatter_status_unparseable_malformed():
    assert frontmatter_status("---\n: : :\n---\n") == "unparseable"


def test_frontmatter_status_unparseable_unterminated():
    assert frontmatter_status("---\nname: x\nno close\n") == "unparseable"


def test_frontmatter_status_ok_without_requires():
    assert frontmatter_status("---\nname: x\n---\n") == "ok"


def test_indented_delimiter_is_content_not_terminator():
    """An indented `  ---` inside a block scalar must be READ, not flagged.

    Matching `line.strip() == "---"` treats it as a frontmatter terminator,
    truncating the block and losing every key after it. Real frontmatter
    parsers anchor at column 0; doing the same makes this file parse plainly.
    """
    assert frontmatter_status(BLOCK_SCALAR) == "ok"
    assert extract_requires(BLOCK_SCALAR) == {"agents": ["brand-guardian"]}
    assert parse_frontmatter(BLOCK_SCALAR)["description"].startswith("---")


def test_indented_delimiter_mid_block_keeps_later_keys():
    """The harder shape: keys AFTER the indented `---` must survive."""
    assert frontmatter_status(MID_BLOCK_SCALAR) == "ok"
    assert extract_requires(MID_BLOCK_SCALAR) == {
        "agents": ["brand-guardian"],
        "bins": ["agent-browser>=0.33.0"],
    }


def test_frontmatter_status_not_fooled_by_body_horizontal_rule():
    """A `---` rule in the BODY must not be reported as ambiguous."""
    assert frontmatter_status("---\nrequires:\n  agents: [x]\n---\n\n---\n") == "ok"


def test_frontmatter_status_unparseable_when_declaration_is_malformed():
    """Malformed frontmatter must FAIL, never pass as zero references.

    Here `agents: [x` never closes. With column-0 anchoring there is exactly
    one candidate and it does not parse, so the file reports "unparseable"
    rather than silently resolving nothing.
    """
    doc = '---\nnotes: |\n  ---\nrequires:\n  agents: [x\n---\n'
    assert frontmatter_status(doc) == "unparseable"
    assert extract_requires(doc) == {}


def test_frontmatter_status_ok_for_harmless_block_scalar():
    """A block scalar with no embedded `---` yields no second candidate."""
    doc = "---\nnotes: |\n  harmless\nrequires:\n  agents: [x]\n---\n"
    assert frontmatter_status(doc) == "ok"
    assert extract_requires(doc) == {"agents": ["x"]}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/test_frontmatter.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'reference_check'`

- [ ] **Step 3: Write minimal implementation**

Create `~/Developer/the-lodge/scripts/reference_check.py`:

```python
#!/usr/bin/env python3
"""Resolve every declared reference in a markdown file's `requires:` frontmatter.

Catches dangling references — an archived agent, a 404 pinned URL, a selector
that matches nothing. It does NOT catch a reference that resolves and returns
the wrong thing; that is the fixture suite's job (Phase 2).
"""
from __future__ import annotations

import yaml


def _candidate_blocks(lines: list[str]) -> list[str]:
    """Every possible frontmatter block — one per **column-0** `---` terminator.

    Two properties matter here, and getting either wrong silently drops
    declared dependencies:

    1. **Never a substring split.** `text.split("---", 2)` truncates at a `---`
       inside a quoted value; YAML then fails and the whole requires block
       disappears.
    2. **Column 0, not merely line-anchored.** `lines[i].strip() == "---"` also
       matches an *indented* `  ---`. Indented, that is ordinary content — not
       a delimiter — in any continuation context: a block scalar (`|` or `>`),
       and equally a plain multi-line scalar, where `d: abc` / `  ---` / `  def`
       folds to `"abc --- def"` with no block indicator present at all.
       Treating it as a delimiter truncates the frontmatter mid-block. Jekyll,
       gray-matter and python-frontmatter all anchor at column 0; matching them
       means every such file simply parses, with nothing to detect.
    """
    return [
        "\n".join(lines[1:index])
        for index in range(1, len(lines))
        if lines[index].rstrip() == "---"
    ]


def _load_mapping(block: str) -> dict | None:
    """Parse one block to a mapping, or None if it is not a valid YAML mapping.

    Catches bare `Exception` deliberately. `yaml.safe_load` raises `ValueError`
    on an invalid calendar date (`2023-02-30` — ordinary frontmatter content)
    and `RecursionError` on deeply nested flow collections. Neither subclasses
    `yaml.YAMLError`, and the interface contract is that parsing never raises.
    """
    try:
        data = yaml.safe_load(block)
    except Exception:
        return None
    return data if isinstance(data, dict) else None


def parse_frontmatter(text: str) -> dict:
    """Return the YAML frontmatter mapping, or {} if absent or malformed."""
    lines = text.splitlines()
    if not lines or lines[0].rstrip() != "---":
        return {}
    for block in _candidate_blocks(lines):
        data = _load_mapping(block)
        if data is not None:
            return data
    return {}


def _requires_of(mapping: dict) -> dict[str, list[str]]:
    """The resolved dependency set of one parsed mapping."""
    requires = mapping.get("requires")
    if not isinstance(requires, dict):
        return {}
    return {k: list(v) for k, v in requires.items() if isinstance(v, list)}


def frontmatter_status(text: str) -> str:
    """Classify the parse: "ok" | "absent" | "unparseable" | "ambiguous".

    The backstop behind correct parsing (`_candidate_blocks`). Reporting a
    pass on references that were never read is the failure this whole tool
    exists to prevent, so a file that cannot be read must say so:

      * "absent"      — no frontmatter at all; declares nothing.
      * "unparseable" — frontmatter present, no reading of it parses. Load
                        bearing: without it a malformed declaration resolves
                        to zero references and reports a pass.
      * "ambiguous"   — a second valid reading yields a DIFFERENT dependency
                        set. With column-0 anchoring this should be
                        unreachable, since a later candidate needs a column-0
                        `---` inside it, which makes the block multi-document
                        YAML and raises. Kept as defence in depth: six lines,
                        and the verifier is not exempt from verification.
    """
    lines = text.splitlines()
    if not lines or lines[0].rstrip() != "---":
        return "absent"
    parsed = [_load_mapping(block) for block in _candidate_blocks(lines)]
    canonical = next((i for i, data in enumerate(parsed) if data is not None), None)
    if canonical is None:
        return "unparseable"
    baseline = _requires_of(parsed[canonical])
    for data in parsed[canonical + 1:]:
        if data is not None and _requires_of(data) != baseline:
            return "ambiguous"
    return "ok"


def extract_requires(text: str) -> dict[str, list[str]]:
    """Return the `requires:` block, keeping only keys whose value is a list."""
    return _requires_of(parse_frontmatter(text))
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/test_frontmatter.py -v
```

Expected: PASS — 21 passed

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/the-lodge
git add scripts/reference_check.py tests/reference_check/test_frontmatter.py
git commit -m "feat(reference-check): parse requires block from frontmatter"
```

---

### Task 2: Result type and filesystem resolvers (agents, skills)

**Files:**
- Modify: `~/Developer/the-lodge/scripts/reference_check.py`
- Test: `~/Developer/the-lodge/tests/reference_check/test_resolve_fs.py`

**Interfaces:**
- Consumes: nothing from Task 1 at runtime
- Produces:
  - `@dataclass Result(kind: str, ref: str, ok: bool, detail: str = "")`
  - `agent_dirs(cwd: Path) -> list[Path]` — project scope first, then user scope
  - `skill_dirs(cwd: Path) -> list[Path]`
  - `resolve_agent(name: str, cwd: Path) -> Result`
  - `resolve_skill(name: str, cwd: Path) -> Result`

- [ ] **Step 1: Write the failing test**

Create `~/Developer/the-lodge/tests/reference_check/test_resolve_fs.py`:

```python
import pytest

from reference_check import Result, resolve_agent, resolve_skill


@pytest.fixture
def fake_home(tmp_path, monkeypatch):
    home = tmp_path / "home"
    (home / ".claude" / "agents").mkdir(parents=True)
    (home / ".claude" / "skills").mkdir(parents=True)
    monkeypatch.setattr("pathlib.Path.home", lambda: home)
    return home


def test_resolve_agent_found_in_user_scope(fake_home, tmp_path):
    (fake_home / ".claude" / "agents" / "brand-guardian.md").write_text("x")
    got = resolve_agent("brand-guardian", tmp_path / "proj")
    assert got.ok is True
    assert got.kind == "agents"
    assert "brand-guardian.md" in got.detail


def test_resolve_agent_found_in_project_scope(fake_home, tmp_path):
    proj = tmp_path / "proj"
    (proj / ".claude" / "agents").mkdir(parents=True)
    (proj / ".claude" / "agents" / "local-only.md").write_text("x")
    assert resolve_agent("local-only", proj).ok is True


def test_resolve_agent_project_scope_wins(fake_home, tmp_path):
    proj = tmp_path / "proj"
    (proj / ".claude" / "agents").mkdir(parents=True)
    (proj / ".claude" / "agents" / "dup.md").write_text("project")
    (fake_home / ".claude" / "agents" / "dup.md").write_text("user")
    assert str(proj) in resolve_agent("dup", proj).detail


def test_resolve_agent_missing_is_not_ok(fake_home, tmp_path):
    got = resolve_agent("adhd-friendly-ui-designer", tmp_path / "proj")
    assert got.ok is False
    assert got.detail == "not found in any agent directory"


def test_resolve_skill_requires_skill_md(fake_home, tmp_path):
    (fake_home / ".claude" / "skills" / "browser-tooling").mkdir(parents=True)
    assert resolve_skill("browser-tooling", tmp_path / "proj").ok is False
    (fake_home / ".claude" / "skills" / "browser-tooling" / "SKILL.md").write_text("x")
    assert resolve_skill("browser-tooling", tmp_path / "proj").ok is True


def test_result_is_comparable():
    assert Result("agents", "a", True) == Result("agents", "a", True)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/test_resolve_fs.py -v
```

Expected: FAIL — `ImportError: cannot import name 'Result' from 'reference_check'`

- [ ] **Step 3: Write minimal implementation**

Add to `~/Developer/the-lodge/scripts/reference_check.py`, after the imports:

```python
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Result:
    kind: str
    ref: str
    ok: bool
    detail: str = ""


def agent_dirs(cwd: Path) -> list[Path]:
    return [Path(cwd) / ".claude" / "agents", Path.home() / ".claude" / "agents"]


def skill_dirs(cwd: Path) -> list[Path]:
    return [Path(cwd) / ".claude" / "skills", Path.home() / ".claude" / "skills"]


def resolve_agent(name: str, cwd: Path) -> Result:
    for directory in agent_dirs(cwd):
        candidate = directory / f"{name}.md"
        if candidate.is_file():
            return Result("agents", name, True, str(candidate))
    return Result("agents", name, False, "not found in any agent directory")


def resolve_skill(name: str, cwd: Path) -> Result:
    for directory in skill_dirs(cwd):
        candidate = directory / name / "SKILL.md"
        if candidate.is_file():
            return Result("skills", name, True, str(candidate))
    return Result("skills", name, False, "not found in any skill directory")
```

Update the top-of-file import line to `import yaml` plus the new stdlib imports — the file's import block becomes:

```python
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/ -v
```

Expected: PASS — 27 passed

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/the-lodge
git add scripts/reference_check.py tests/reference_check/test_resolve_fs.py
git commit -m "feat(reference-check): resolve agent and skill references"
```

---

### Task 3: Binary, path, and token resolvers

**Files:**
- Modify: `~/Developer/the-lodge/scripts/reference_check.py`
- Test: `~/Developer/the-lodge/tests/reference_check/test_resolve_static.py`

**Interfaces:**
- Consumes: `Result` from Task 2
- Produces:
  - `parse_bin_spec(spec: str) -> tuple[str, str | None]` — raises `ValueError` on bad syntax
  - `version_tuple(text: str) -> tuple[int, ...]` — first three integers found
  - `resolve_bin(spec: str) -> Result`
  - `repo_root(start: Path) -> Path` — nearest ancestor containing `.git` (file or dir), else the start directory
  - `resolve_path(rel: str, base: Path) -> Result`
  - `load_token_names(tokens_json: Path) -> set[str]` — union across all tiers
  - `resolve_token(name: str, tokens_json: Path) -> Result`

- [ ] **Step 1: Write the failing test**

Create `~/Developer/the-lodge/tests/reference_check/test_resolve_static.py`:

```python
import json

import pytest

from reference_check import (
    load_token_names,
    parse_bin_spec,
    repo_root,
    resolve_bin,
    resolve_path,
    resolve_token,
    version_tuple,
)


def test_parse_bin_spec_plain_name():
    assert parse_bin_spec("agent-browser") == ("agent-browser", None)


def test_parse_bin_spec_with_floor():
    assert parse_bin_spec("agent-browser>=0.33.0") == ("agent-browser", "0.33.0")


def test_parse_bin_spec_rejects_other_comparators():
    with pytest.raises(ValueError):
        parse_bin_spec("agent-browser>0.33.0")


def test_version_tuple_extracts_first_three_integers():
    assert version_tuple("agent-browser 0.33.0") == (0, 33, 0)


def test_version_tuple_pads_nothing_when_short():
    assert version_tuple("v2.1") == (2, 1)


def test_resolve_bin_missing_binary():
    got = resolve_bin("definitely-not-a-real-binary-xyz")
    assert got.ok is False
    assert got.detail == "not on PATH"


def test_resolve_bin_present_without_floor():
    assert resolve_bin("git").ok is True


def test_repo_root_finds_git_dir(tmp_path):
    (tmp_path / ".git").mkdir()
    nested = tmp_path / "a" / "b"
    nested.mkdir(parents=True)
    assert repo_root(nested) == tmp_path


def test_repo_root_finds_git_file_worktree(tmp_path):
    (tmp_path / ".git").write_text("gitdir: /elsewhere")
    assert repo_root(tmp_path) == tmp_path


def test_resolve_path_present(tmp_path):
    (tmp_path / ".git").mkdir()
    (tmp_path / "design-contract").mkdir()
    (tmp_path / "design-contract" / "surfaces.json").write_text("{}")
    assert resolve_path("design-contract/surfaces.json", tmp_path).ok is True


def test_resolve_path_missing(tmp_path):
    (tmp_path / ".git").mkdir()
    got = resolve_path("design-contract/surfaces.json", tmp_path)
    assert got.ok is False
    assert got.detail == "no such path"


def test_load_token_names_unions_tiers(tmp_path):
    tokens = tmp_path / "tokens.json"
    tokens.write_text(json.dumps({
        "brand": {"--wc-green": "#10A544"},
        "derived": {"--wc-green-text": "#087834"},
        "scale": {"--wc-spacing-md": "24px"},
    }))
    assert load_token_names(tokens) == {"--wc-green", "--wc-green-text", "--wc-spacing-md"}


def test_load_token_names_missing_file_is_empty(tmp_path):
    assert load_token_names(tmp_path / "absent.json") == set()


def test_resolve_token_present_and_absent(tmp_path):
    tokens = tmp_path / "tokens.json"
    tokens.write_text(json.dumps({"brand": {"--show-accent": "#10A544"}}))
    assert resolve_token("--show-accent", tokens).ok is True
    got = resolve_token("--show-accent-deep", tokens)
    assert got.ok is False
    assert got.detail == "not declared in tokens.json"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/test_resolve_static.py -v
```

Expected: FAIL — `ImportError: cannot import name 'parse_bin_spec'`

- [ ] **Step 3: Write minimal implementation**

Add to `~/Developer/the-lodge/scripts/reference_check.py`. Extend the import block with `import json`, `import re`, `import shutil`, `import subprocess`, then append:

```python
BIN_SPEC = re.compile(r"^([A-Za-z0-9_.\-]+)(?:>=([0-9][0-9.]*))?$")


def parse_bin_spec(spec: str) -> tuple[str, str | None]:
    match = BIN_SPEC.match(spec.strip())
    if not match:
        raise ValueError(f"bad bin spec {spec!r}; use 'name' or 'name>=X.Y.Z'")
    return match.group(1), match.group(2)


def version_tuple(text: str) -> tuple[int, ...]:
    return tuple(int(part) for part in re.findall(r"\d+", text)[:3])


def resolve_bin(spec: str) -> Result:
    name, floor = parse_bin_spec(spec)
    path = shutil.which(name)
    if path is None:
        return Result("bins", spec, False, "not on PATH")
    if floor is None:
        return Result("bins", spec, True, path)
    try:
        proc = subprocess.run(
            [name, "--version"], capture_output=True, text=True, timeout=10
        )
    except (OSError, subprocess.TimeoutExpired):
        return Result("bins", spec, False, "could not read --version")
    found = version_tuple(proc.stdout + proc.stderr)
    shown = ".".join(str(part) for part in found) or "unknown"
    if found >= version_tuple(floor):
        return Result("bins", spec, True, shown)
    return Result("bins", spec, False, f"found {shown}, need >={floor}")


def repo_root(start: Path) -> Path:
    start = Path(start).resolve()
    for candidate in [start, *start.parents]:
        if (candidate / ".git").exists():
            return candidate
    return start if start.is_dir() else start.parent


def resolve_path(rel: str, base: Path) -> Result:
    target = repo_root(base) / rel
    if target.exists():
        return Result("paths", rel, True, str(target))
    return Result("paths", rel, False, "no such path")


def load_token_names(tokens_json: Path) -> set[str]:
    try:
        data = json.loads(Path(tokens_json).read_text())
    except (OSError, json.JSONDecodeError):
        return set()
    names: set[str] = set()
    for tier in data.values():
        if isinstance(tier, dict):
            names.update(tier.keys())
    return names


def resolve_token(name: str, tokens_json: Path) -> Result:
    if name in load_token_names(tokens_json):
        return Result("tokens", name, True, str(tokens_json))
    return Result("tokens", name, False, "not declared in tokens.json")
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/ -v
```

Expected: PASS — 41 passed

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/the-lodge
git add scripts/reference_check.py tests/reference_check/test_resolve_static.py
git commit -m "feat(reference-check): resolve bin, path, and token references"
```

---

### Task 4: Live resolvers behind `--live` (urls, selectors)

**Files:**
- Modify: `~/Developer/the-lodge/scripts/reference_check.py`
- Test: `~/Developer/the-lodge/tests/reference_check/test_resolve_live.py`

**Interfaces:**
- Consumes: `Result` from Task 2
- Produces:
  - `resolve_url(url: str, opener=urllib.request.urlopen) -> Result` — `opener` is injectable for tests
  - `resolve_selector(selector: str, urls: list[str], runner=subprocess.run) -> Result` — matches if count > 0 on any declared URL
- Note for later tasks: both take an injectable callable as the last parameter so no test touches the network.

- [ ] **Step 1: Write the failing test**

Create `~/Developer/the-lodge/tests/reference_check/test_resolve_live.py`:

```python
import urllib.error

from reference_check import resolve_selector, resolve_url


class FakeResponse:
    def __init__(self, status):
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


def test_resolve_url_ok():
    got = resolve_url("https://example.test/", opener=lambda *a, **k: FakeResponse(200))
    assert got.ok is True
    assert got.detail == "200"


def test_resolve_url_404_is_not_ok():
    got = resolve_url("https://example.test/gone", opener=lambda *a, **k: FakeResponse(404))
    assert got.ok is False
    assert got.detail == "404"


def test_resolve_url_network_error_is_not_ok():
    def boom(*a, **k):
        raise urllib.error.URLError("unreachable")

    got = resolve_url("https://example.test/", opener=boom)
    assert got.ok is False
    assert "unreachable" in got.detail


class FakeProc:
    def __init__(self, stdout):
        self.stdout = stdout
        self.stderr = ""
        self.returncode = 0


def test_resolve_selector_matches_on_first_url():
    calls = []

    def runner(cmd, **kwargs):
        calls.append(cmd)
        return FakeProc("3" if "get" in cmd else "")

    got = resolve_selector(".wc-list-item", ["https://example.test/"], runner=runner)
    assert got.ok is True
    assert got.detail == "3 match(es) on https://example.test/"


def test_resolve_selector_zero_matches_everywhere():
    def runner(cmd, **kwargs):
        return FakeProc("0" if "get" in cmd else "")

    got = resolve_selector(".gone", ["https://example.test/"], runner=runner)
    assert got.ok is False
    assert got.detail == "0 matches on any declared url"


def test_resolve_selector_without_urls_is_not_ok():
    got = resolve_selector(".x", [], runner=lambda *a, **k: FakeProc("0"))
    assert got.ok is False
    assert got.detail == "no urls declared to resolve selector against"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/test_resolve_live.py -v
```

Expected: FAIL — `ImportError: cannot import name 'resolve_selector'`

- [ ] **Step 3: Write minimal implementation**

Add `import urllib.error` and `import urllib.request` to the import block, then append:

```python
def resolve_url(url: str, opener=urllib.request.urlopen) -> Result:
    try:
        with opener(url, timeout=15) as response:
            status = getattr(response, "status", 0)
    except Exception as exc:  # URLError, HTTPError, socket timeouts
        return Result("urls", url, False, str(exc))
    ok = 200 <= status < 400
    return Result("urls", url, ok, str(status))


def resolve_selector(selector: str, urls: list[str], runner=subprocess.run) -> Result:
    if not urls:
        return Result(
            "selectors", selector, False, "no urls declared to resolve selector against"
        )
    for url in urls:
        runner(["agent-browser", "open", url], capture_output=True, text=True, timeout=60)
        proc = runner(
            ["agent-browser", "get", "count", selector],
            capture_output=True,
            text=True,
            timeout=60,
        )
        digits = re.findall(r"\d+", proc.stdout or "")
        count = int(digits[0]) if digits else 0
        if count > 0:
            return Result("selectors", selector, True, f"{count} match(es) on {url}")
    return Result("selectors", selector, False, "0 matches on any declared url")
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/ -v
```

Expected: PASS — 47 passed

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/the-lodge
git add scripts/reference_check.py tests/reference_check/test_resolve_live.py
git commit -m "feat(reference-check): resolve url and selector references under --live"
```

---

### Task 5: CLI, report format, and exit codes

**Files:**
- Modify: `~/Developer/the-lodge/scripts/reference_check.py`
- Test: `~/Developer/the-lodge/tests/reference_check/test_cli.py`

**Interfaces:**
- Consumes: every resolver from Tasks 2–4, plus `frontmatter_status` from Task 1
- Produces:
  - `check_file(path: Path, live: bool, tokens_json: Path | None) -> list[Result]`
  - `format_report(path: Path, results: list[Result], live: bool) -> str`
  - `main(argv: list[str]) -> int`

- [ ] **Step 1: Write the failing test**

Create `~/Developer/the-lodge/tests/reference_check/test_cli.py`:

```python
import pytest

from reference_check import Result, check_file, format_report, main


@pytest.fixture
def fake_home(tmp_path, monkeypatch):
    home = tmp_path / "home"
    (home / ".claude" / "agents").mkdir(parents=True)
    monkeypatch.setattr("pathlib.Path.home", lambda: home)
    return home


def write_doc(tmp_path, body):
    (tmp_path / ".git").mkdir()
    doc = tmp_path / "SKILL.md"
    doc.write_text(body)
    return doc


def test_check_file_resolves_declared_agent(fake_home, tmp_path):
    (fake_home / ".claude" / "agents" / "brand-guardian.md").write_text("x")
    doc = write_doc(tmp_path, "---\nrequires:\n  agents: [brand-guardian]\n---\n")
    results = check_file(doc, live=False, tokens_json=None)
    assert results == [Result("agents", "brand-guardian", True,
                              str(fake_home / ".claude" / "agents" / "brand-guardian.md"))]


def test_check_file_reports_missing_agent(fake_home, tmp_path):
    doc = write_doc(tmp_path, "---\nrequires:\n  agents: [ghost-agent]\n---\n")
    assert check_file(doc, live=False, tokens_json=None)[0].ok is False


def test_check_file_skips_live_classes_when_not_live(fake_home, tmp_path):
    doc = write_doc(tmp_path, '---\nrequires:\n  urls: ["https://example.test/"]\n---\n')
    results = check_file(doc, live=False, tokens_json=None)
    assert len(results) == 1
    assert results[0].ok is True
    assert results[0].detail == "SKIPPED (no --live)"


def test_format_report_states_skipped_classes(fake_home, tmp_path):
    doc = write_doc(tmp_path, '---\nrequires:\n  urls: ["https://example.test/"]\n---\n')
    text = format_report(doc, check_file(doc, live=False, tokens_json=None), live=False)
    assert "SKIPPED" in text


def test_main_exit_zero_when_all_resolve(fake_home, tmp_path, capsys):
    (fake_home / ".claude" / "agents" / "brand-guardian.md").write_text("x")
    doc = write_doc(tmp_path, "---\nrequires:\n  agents: [brand-guardian]\n---\n")
    assert main([str(doc)]) == 0


def test_main_exit_one_when_reference_dangles(fake_home, tmp_path, capsys):
    doc = write_doc(tmp_path, "---\nrequires:\n  agents: [ghost-agent]\n---\n")
    assert main([str(doc)]) == 1
    assert "ghost-agent" in capsys.readouterr().out


def test_main_exit_two_on_missing_file(capsys):
    assert main(["/nonexistent/file.md"]) == 2


def test_main_exit_two_on_no_arguments(capsys):
    assert main([]) == 2


def test_check_file_reports_unparseable_frontmatter(fake_home, tmp_path):
    """Unreadable frontmatter must FAIL, never pass as zero references."""
    doc = write_doc(tmp_path, '---\nrequires:\n  agents: [brand-guardian\n---\n')
    results = check_file(doc, live=False, tokens_json=None)
    assert [r.kind for r in results] == ["frontmatter"]
    assert results[0].ok is False
    assert results[0].ref == "unparseable"


def test_check_file_reads_through_indented_delimiter(fake_home, tmp_path):
    """An indented `---` is block-scalar content — the agent must still resolve."""
    (fake_home / ".claude" / "agents" / "brand-guardian.md").write_text("x")
    doc = write_doc(tmp_path, (
        '---\n'
        'description: |\n'
        '  ---\n'
        '  a rule inside a literal block\n'
        'requires:\n'
        '  agents: [brand-guardian]\n'
        '---\n'
    ))
    results = check_file(doc, live=False, tokens_json=None)
    assert [r.kind for r in results] == ["agents"]
    assert results[0].ok is True


def test_main_exit_one_on_unparseable_frontmatter(fake_home, tmp_path):
    doc = write_doc(tmp_path, '---\nrequires:\n  agents: [brand-guardian\n---\n')
    assert main([str(doc)]) == 1
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/test_cli.py -v
```

Expected: FAIL — `ImportError: cannot import name 'check_file'`

- [ ] **Step 3: Write minimal implementation**

Add `import argparse` and `import sys` to the import block, then append:

```python
STATIC_CLASSES = ("agents", "skills", "bins", "paths", "tokens")
LIVE_CLASSES = ("urls", "selectors")


FRONTMATTER_DETAIL = {
    "unparseable": "frontmatter present but could not be parsed — declared "
                   "references, if any, were not read",
    "ambiguous": "frontmatter parse is ambiguous (a bare `---` line inside a "
                 "block scalar); a different reading finds a requires: block "
                 "this one cannot see",
}


def check_file(path: Path, live: bool, tokens_json: Path | None) -> list[Result]:
    path = Path(path)
    text = path.read_text()
    results: list[Result] = []

    status = frontmatter_status(text)
    if status in FRONTMATTER_DETAIL:
        results.append(Result("frontmatter", status, False, FRONTMATTER_DETAIL[status]))

    requires = extract_requires(text)
    base = path.parent
    urls = list(requires.get("urls", []))

    for name in requires.get("agents", []):
        results.append(resolve_agent(name, base))
    for name in requires.get("skills", []):
        results.append(resolve_skill(name, base))
    for spec in requires.get("bins", []):
        try:
            results.append(resolve_bin(spec))
        except ValueError as exc:
            results.append(Result("bins", spec, False, str(exc)))
    for rel in requires.get("paths", []):
        results.append(resolve_path(rel, base))
    for name in requires.get("tokens", []):
        if tokens_json is None:
            results.append(Result("tokens", name, False, "no --tokens file given"))
        else:
            results.append(resolve_token(name, tokens_json))

    for kind in LIVE_CLASSES:
        for ref in requires.get(kind, []):
            if not live:
                results.append(Result(kind, ref, True, "SKIPPED (no --live)"))
            elif kind == "urls":
                results.append(resolve_url(ref))
            else:
                results.append(resolve_selector(ref, urls))
    return results


def format_report(path: Path, results: list[Result], live: bool) -> str:
    lines = [f"reference-check: {path}"]
    for result in results:
        mark = "OK  " if result.ok else "FAIL"
        lines.append(f"  {result.kind:<10} {result.ref:<34} {mark}  {result.detail}")
    failures = [r for r in results if not r.ok]
    if not live:
        lines.append("  note: urls and selectors were not resolved (no --live)")
    lines.append(
        f"FAIL {len(failures)} unresolved reference(s)" if failures
        else f"PASS {len(results)} reference(s) resolved"
    )
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="reference-check")
    parser.add_argument("files", nargs="*")
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--tokens", default=None)
    args = parser.parse_args(argv)

    if not args.files:
        print("usage: reference-check [--live] [--tokens PATH] FILE...", file=sys.stderr)
        return 2

    tokens_json = Path(args.tokens) if args.tokens else None
    exit_code = 0
    for name in args.files:
        path = Path(name)
        if not path.is_file():
            print(f"reference-check: no such file: {path}", file=sys.stderr)
            exit_code = 2
            continue
        results = check_file(path, live=args.live, tokens_json=tokens_json)
        print(format_report(path, results, live=args.live))
        if any(not r.ok for r in results) and exit_code == 0:
            exit_code = 1
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/ -v
```

Expected: PASS — 58 passed

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/the-lodge
git add scripts/reference_check.py tests/reference_check/test_cli.py
git commit -m "feat(reference-check): add CLI, report format, and exit codes"
```

---

### Task 6: Install on PATH and point it at the real workspace

**Files:**
- Modify: `~/Developer/the-lodge/scripts/reference_check.py` (permissions only)
- Create: `~/.local/bin/reference-check` (symlink)

**Interfaces:**
- Consumes: `main()` from Task 5
- Produces: a `reference-check` executable on `$PATH`, matching the existing `~/.local/bin/ytsurf` symlink precedent

- [ ] **Step 1: Make executable and symlink**

```bash
chmod +x ~/Developer/the-lodge/scripts/reference_check.py
ln -sf ~/Developer/the-lodge/scripts/reference_check.py ~/.local/bin/reference-check
```

- [ ] **Step 2: Verify it runs and reports usage correctly**

```bash
reference-check; echo "exit=$?"
```

Expected: usage line on stderr, `exit=2`

- [ ] **Step 3: Run it against the real theme QA skill**

```bash
reference-check ~/.claude/skills/wc-theme-qa/SKILL.md; echo "exit=$?"
```

Expected: `PASS 0 reference(s) resolved` and `exit=0` — the skill has no `requires:` block yet. This is the baseline before Task 7 adds one.

- [ ] **Step 4: Prove it detects the real dangling reference**

Create a scratch file reproducing the umbrella spec's role mapping:

```bash
cat > /tmp/claude-501/rot-probe.md <<'EOF'
---
requires:
  agents: [brand-guardian, adhd-friendly-ui-designer, the-drone]
  bins: ["agent-browser>=0.33.0"]
---
EOF
reference-check /tmp/claude-501/rot-probe.md; echo "exit=$?"
```

Expected: `brand-guardian` FAIL (still metarepo-only — fixed in Task 8), `adhd-friendly-ui-designer` FAIL (archived 2026-07-07), `the-drone` OK, `agent-browser>=0.33.0` OK, `exit=1`.

This is the plan's central proof: the resolver independently rediscovers the rot documented in the spec §1.2.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/the-lodge
git add scripts/reference_check.py
git commit -m "chore(reference-check): mark executable for ~/.local/bin symlink"
```

---

### Task 7: Declare dependencies in the theme's QA skill and spec

**Files:**
- Modify: `~/Developer/the-lodge/.claude/skills/project/wc-theme-qa/SKILL.md` (frontmatter)
- Modify: `<theme>/docs/superpowers/specs/2026-07-26-design-review-harness-design.md` (frontmatter)

**Interfaces:**
- Consumes: the `requires:` schema from Task 1
- Produces: two real files carrying declared dependencies, so the resolver has live subjects

Note: `~/.claude/skills/wc-theme-qa` is the deployed copy; the lodge path above is the authored source. Edit the lodge source, then confirm the deployed copy reflects it.

- [ ] **Step 1: Add the requires block to the QA skill**

In `~/Developer/the-lodge/.claude/skills/project/wc-theme-qa/SKILL.md`, insert into the existing frontmatter, after the `description:` line and before the closing `---`:

```yaml
requires:
  agents: [brand-guardian]
  skills: [browser-tooling]
  bins: ["agent-browser>=0.33.0"]
  urls: ["https://wondercabinet.riechers.co/"]
```

- [ ] **Step 2: Add the requires block to the design spec**

At the very top of `docs/superpowers/specs/2026-07-26-design-review-harness-design.md` in the theme repo, above the `# Design Review & QA Harness — Design` heading, add:

```yaml
---
requires:
  agents: [brand-guardian, spectral-engineer]
  bins: ["agent-browser>=0.33.0"]
  paths:
    - docs/luminous/cross-brand-qa-checklist.md
    - docs/multi-brand-design-system.md
    - docs/superpowers/specs/2026-07-25-wc-theme-qa-harness-design.md
    - docs/superpowers/specs/2026-06-08-luminous-branding-workplan-design.md
  urls: ["https://wondercabinet.riechers.co/"]
---
```

- [ ] **Step 3: Run the resolver against both**

```bash
reference-check ~/.claude/skills/wc-theme-qa/SKILL.md
reference-check <theme>/docs/superpowers/specs/2026-07-26-design-review-harness-design.md
echo "exit=$?"
```

Expected: both report `brand-guardian` and `spectral-engineer` as FAIL, everything else OK, `exit=1`. Task 8 makes these pass.

- [ ] **Step 4: Commit (two repos, separately)**

```bash
cd ~/Developer/the-lodge
git add .claude/skills/project/wc-theme-qa/SKILL.md
git commit -m "feat(wc-theme-qa): declare dependencies for reference-check"
```

```bash
cd <theme>
git add docs/superpowers/specs/2026-07-26-design-review-harness-design.md
git commit -m "docs: declare spec dependencies for reference-check"
```

---

### Task 8: Consolidate agent definitions to a single home each

**Files:**
- Move: `~/Developer/wonder-cabinet/.claude/agents/brand-guardian.md` → `~/.claude/agents/brand-guardian.md`
- Move: `~/Developer/wonder-cabinet/.claude/agents/spectral-engineer.md` → `~/.claude/agents/spectral-engineer.md`
- Delete: `~/.claude/ARCHIVE/old agents/` (4 files)
- Delete: `~/.claude/agents/.sync-manifest.json`
- Modify: `~/Developer/the-lodge/conventions/AGENT_REGISTRY.md`

**Interfaces:**
- Consumes: the FAIL results from Task 7 Step 3
- Produces: `reference-check` exit 0 on both files from Task 7

Per spec §5.1: one home per agent, no shadow copies. User scope for the two Wonder Cabinet agents — not a theme-repo copy (reintroduces the drift the metarepo placement avoided) and not a symlink (worktrees break symlinks, and this work runs in one).

- [ ] **Step 1: Record the before state**

```bash
ls ~/.claude/agents/ ~/Developer/wonder-cabinet/.claude/agents/ "$HOME/.claude/ARCHIVE/old agents/"
```

Expected: 5 live agents, 2 metarepo agents, 4 archived. Note this output — the commit message cites it.

- [ ] **Step 2: Move the two Wonder Cabinet agents to user scope**

```bash
mv ~/Developer/wonder-cabinet/.claude/agents/brand-guardian.md ~/.claude/agents/
mv ~/Developer/wonder-cabinet/.claude/agents/spectral-engineer.md ~/.claude/agents/
rmdir ~/Developer/wonder-cabinet/.claude/agents 2>/dev/null || true
```

- [ ] **Step 3: Decide the four archived agents, then act**

The four in `~/.claude/ARCHIVE/old agents/` are `adhd-friendly-ui-designer`, `agent-registrar`, `code-troubleshooter`, `obsidian-extension-developer`. Each is either restored to `~/.claude/agents/` or deleted outright — archiving in place is what created the ambiguity.

`adhd-friendly-ui-designer` is referenced by the Luminous umbrella spec §2 as the design/UX and a11y lens, so **restore it**:

```bash
cp "$HOME/.claude/ARCHIVE/old agents/adhd-friendly-ui-designer.md" ~/.claude/agents/
```

`agent-registrar` is superseded by `reference-check` for the rot-detection half, and its `agent-registrar-scan.sh` has never run (no log, no reports, not scheduled). **Delete it and the dead script.** For `code-troubleshooter` and `obsidian-extension-developer`, ask the user before deleting — they are outside this project's scope and this plan should not silently discard them.

```bash
rm "$HOME/.claude/ARCHIVE/old agents/agent-registrar.md"
rm ~/Developer/the-lodge/scripts/agent-registrar-scan.sh
```

- [ ] **Step 4: Delete the stale generated-by-hand registries**

```bash
rm ~/.claude/agents/.sync-manifest.json
```

Then replace the Tier-1 table in `~/Developer/the-lodge/conventions/AGENT_REGISTRY.md` with a pointer, since a hand-maintained table is what rotted (spec §5.4):

```markdown
## Tier 1: Lodge Agents

This table was hand-maintained and rotted — it listed four agents as live for
four months after they were archived on 2026-07-07. Do not restore it.

To see what is actually discoverable:

    ls ~/.claude/agents/

To verify that a document's declared agents resolve:

    reference-check <file.md>
```

- [ ] **Step 5: Verify the resolver now passes**

```bash
reference-check ~/.claude/skills/wc-theme-qa/SKILL.md; echo "exit=$?"
reference-check /tmp/claude-501/rot-probe.md; echo "exit=$?"
```

Expected: the skill reports `PASS`, `exit=0`. The rot probe now reports all three agents OK, `exit=0` — the same probe that failed in Task 6 Step 4.

- [ ] **Step 6: Confirm agents are visible from the theme repo**

```bash
cd <theme> && reference-check docs/superpowers/specs/2026-07-26-design-review-harness-design.md; echo "exit=$?"
```

Expected: `PASS`, `exit=0`. This is the property that was broken — `brand-guardian` reachable from the directory where the work happens.

- [ ] **Step 7: Commit**

```bash
cd ~/Developer/the-lodge
git add conventions/AGENT_REGISTRY.md
git rm --cached scripts/agent-registrar-scan.sh 2>/dev/null || true
git add -A scripts/
git commit -m "chore(agents): consolidate to one home each; retire hand-maintained registry

brand-guardian and spectral-engineer move to user scope so they resolve from
the theme repo, where all the work happens. adhd-friendly-ui-designer restored
from ARCHIVE (referenced by the Luminous umbrella spec). agent-registrar and
its never-run scan script deleted, superseded by reference-check.

AGENT_REGISTRY.md's Tier-1 table listed four agents as live for four months
after they were archived. Replaced with a pointer to reference-check rather
than corrected, per spec section 5.4: any registry requiring manual updates
will rot, and correcting one only resets its clock."
```

`~/.claude/` is not a git repo — the moves there are not committed anywhere. Note in `planning/progress.md` in the theme repo what changed, so the next session can reconstruct it.

---

## Self-Review

**Spec coverage (§5 Phase 1):**

| Spec requirement | Task |
|---|---|
| §5.1 Consolidate the scatter, one home each | 8 |
| §5.1 `brand-guardian`/`spectral-engineer` to user scope | 8 |
| §5.2 Declared dependencies in frontmatter | 1, 7 |
| §5.3 `reference-check` resolves 7 classes | 2, 3, 4, 5 |
| §5.3 Live classes gated behind `--live`, reported as skipped | 4, 5 |
| §5.3 Explicit non-coverage of resolve-and-lie bugs | documented in the module docstring, Task 1 |
| §5.4 Delete `.sync-manifest.json` and `AGENT_REGISTRY.md` table | 8 |

**Placeholder scan:** No TBD/TODO. Every code step carries runnable code. Task 8 Step 3 defers two out-of-scope agents to the user by design rather than leaving a blank — that is a decision, not a placeholder.

**Type consistency:** `Result(kind, ref, ok, detail)` is defined in Task 2 and used with that exact signature in Tasks 3, 4, 5. `repo_root` is defined in Task 3 and consumed by `resolve_path` in the same task. `check_file(path, live, tokens_json)` in Task 5 calls `resolve_agent(name, base)`, `resolve_skill(name, base)`, `resolve_bin(spec)`, `resolve_path(rel, base)`, `resolve_token(name, tokens_json)`, `resolve_url(ref)`, `resolve_selector(ref, urls)` — all matching their Task 2–4 definitions. Test counts accumulate 21 → 27 → 41 → 47 → 58 — verified end-to-end by assembling the module from this plan's own code blocks and running all five test files against it (58 passed).

**Known gap, deliberate:** `<theme>` appears as a placeholder path in Tasks 7 and 8 because the theme repo is currently checked out in a worktree whose path is session-specific. Substitute the current working directory at execution time.
