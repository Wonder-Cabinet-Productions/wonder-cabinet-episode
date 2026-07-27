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
import os

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


# --- a resolver that reports ok on something it cannot read is the whole
# --- failure this tool exists to prevent

def test_resolve_agent_rejects_path_traversal(fake_home, tmp_path):
    """`../../../x` must not resolve outside the scope directories."""
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "secret.md").write_text("x")
    proj = tmp_path / "proj"
    (proj / ".claude" / "agents").mkdir(parents=True)
    got = resolve_agent("../../../outside/secret", proj)
    assert got.ok is False
    assert got.detail == "invalid reference name"


def test_resolve_skill_rejects_path_traversal(fake_home, tmp_path):
    outside = tmp_path / "outside" / "realskill"
    outside.mkdir(parents=True)
    (outside / "SKILL.md").write_text("x")
    proj = tmp_path / "proj"
    (proj / ".claude" / "skills").mkdir(parents=True)
    got = resolve_skill("../../../outside/realskill", proj)
    assert got.ok is False
    assert got.detail == "invalid reference name"


def test_resolvers_reject_empty_and_dot_names(fake_home, tmp_path):
    """An empty name must not resolve against a stray SKILL.md at the root."""
    proj = tmp_path / "proj"
    (proj / ".claude" / "skills").mkdir(parents=True)
    (proj / ".claude" / "skills" / "SKILL.md").write_text("x")
    for bad in ("", ".", "..", " lead", "trail "):
        assert resolve_skill(bad, proj).ok is False
        assert resolve_agent(bad, proj).ok is False


def test_resolve_agent_is_case_sensitive(fake_home, tmp_path):
    """A wrong-case reference must NOT resolve.

    macOS and Windows filesystems are case-insensitive, so `THE-DRONE.md`
    opens `the-drone.md`. Agent names are matched case-sensitively where they
    are used, so reporting this as resolved is a false pass — and the detail
    would name the requested path, hiding the mismatch.
    """
    proj = tmp_path / "proj"
    agents = proj / ".claude" / "agents"
    agents.mkdir(parents=True)
    (agents / "the-drone.md").write_text("x")
    assert resolve_agent("the-drone", proj).ok is True
    assert resolve_agent("THE-DRONE", proj).ok is False
    assert resolve_agent("The-Drone", proj).ok is False


def test_resolve_skill_is_case_sensitive(fake_home, tmp_path):
    proj = tmp_path / "proj"
    skills = proj / ".claude" / "skills" / "browser-tooling"
    skills.mkdir(parents=True)
    (skills / "SKILL.md").write_text("x")
    assert resolve_skill("browser-tooling", proj).ok is True
    assert resolve_skill("Browser-Tooling", proj).ok is False


def test_resolve_agent_survives_unicode_normalization(fake_home, tmp_path):
    """NFC and NFD spellings of the same name must resolve to each other.

    Case-sensitivity must not be bought with a normalization false negative:
    `os.listdir` returns stored bytes, so an NFD on-disk name and an NFC
    reference are different strings even though every OS path API opens them
    interchangeably. Both directions are tested.
    """
    import unicodedata

    proj = tmp_path / "proj"
    agents = proj / ".claude" / "agents"
    agents.mkdir(parents=True)
    nfc = unicodedata.normalize("NFC", "café-agent")
    nfd = unicodedata.normalize("NFD", "café-agent")

    (agents / f"{nfc}.md").write_text("x")
    assert resolve_agent(nfc, proj).ok is True
    assert resolve_agent(nfd, proj).ok is True

    (agents / f"{nfc}.md").unlink()
    (agents / f"{nfd}.md").write_text("x")
    assert resolve_agent(nfd, proj).ok is True
    assert resolve_agent(nfc, proj).ok is True


@pytest.mark.skipif(os.geteuid() == 0, reason="root bypasses read permissions")
def test_resolve_agent_unreadable_file_is_not_ok(fake_home, tmp_path):
    """is_file() is True for a chmod-000 file; resolving it would be a false pass."""
    proj = tmp_path / "proj"
    agents = proj / ".claude" / "agents"
    agents.mkdir(parents=True)
    locked = agents / "locked.md"
    locked.write_text("x")
    locked.chmod(0o000)
    try:
        assert resolve_agent("locked", proj).ok is False
    finally:
        locked.chmod(0o644)
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
from pathlib import Path, PurePosixPath


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


def _valid_ref_name(name: str) -> bool:
    """A reference name is a bare identifier, never a path.

    Without this guard `../../../secret` resolves to a file outside every
    `.claude/agents` and `.claude/skills` tree and is reported as found —
    resolution escaping its own scope. Rejecting separators is what confines
    it; with no separator present, `..` cannot traverse.
    """
    if not name or name != name.strip() or name in (".", ".."):
        return False
    return "/" not in name and "\\" not in name


def _readable_file(path: Path) -> bool:
    """Resolve only to a regular file this process can actually read.

    `is_file()` alone returns True for a file with no read permission. That is
    a silent false pass: the reference is announced as resolving even though
    nothing can read it — the exact failure this tool exists to prevent.
    """
    return path.is_file() and os.access(path, os.R_OK)


def _exact_path(directory: Path, *parts: str) -> Path | None:
    """Join `parts` under `directory`, requiring each to match on disk exactly.

    macOS and Windows filesystems are case-insensitive, so `THE-DRONE.md`
    happily opens `the-drone.md`. But agent and skill names are matched
    case-sensitively where they are actually used, so a wrong-case reference
    would resolve here and then fail to dispatch — and because the resolver
    reports the *requested* path, the report would conceal the mismatch.
    Checking each component against `os.listdir` makes resolution as
    case-sensitive as the thing it is predicting.

    Comparison is Unicode-normalized (NFC) on both sides. `os.listdir` returns
    whatever bytes the filesystem stores, and APFS keeps names as written — so
    a name authored NFD (`e` + combining acute) and a reference typed NFC (`é`)
    are different strings for a raw `in` test, even though every OS path API
    opens them interchangeably. Comparing raw would trade the case false
    positive for a normalization false negative. The matched **on-disk** name
    is what gets returned, so `detail` reports reality rather than the request.
    """
    current = directory
    for part in parts:
        try:
            entries = {unicodedata.normalize("NFC", e): e for e in os.listdir(current)}
        except OSError:
            return None
        key = unicodedata.normalize("NFC", part)
        if key not in entries:
            return None
        current = current / entries[key]
    return current


def resolve_agent(name: str, cwd: Path) -> Result:
    if not _valid_ref_name(name):
        return Result("agents", name, False, "invalid reference name")
    for directory in agent_dirs(cwd):
        candidate = _exact_path(directory, f"{name}.md")
        if candidate is not None and _readable_file(candidate):
            return Result("agents", name, True, str(candidate))
    return Result("agents", name, False, "not found in any agent directory")


def resolve_skill(name: str, cwd: Path) -> Result:
    if not _valid_ref_name(name):
        return Result("skills", name, False, "invalid reference name")
    for directory in skill_dirs(cwd):
        candidate = _exact_path(directory, name, "SKILL.md")
        if candidate is not None and _readable_file(candidate):
            return Result("skills", name, True, str(candidate))
    return Result("skills", name, False, "not found in any skill directory")
```

Update the top-of-file import line to `import yaml` plus the new stdlib imports — the file's import block becomes:

```python
from __future__ import annotations

import os
import unicodedata
from dataclasses import dataclass
from pathlib import Path, PurePosixPath

import yaml
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/ -v
```

Expected: PASS — 34 passed

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
import os

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


def test_version_tuple_extracts_dotted_version():
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


# --- the same guards the agent/skill resolvers carry apply here ---

def test_version_tuple_ignores_a_date(tmp_path):
    """"built on 2024-01-15" must not parse as version 2024.1.15.

    Taking "the first three integers" lets a date in a --version banner clear
    every floor, silently passing a binary far too old.
    """
    assert version_tuple("mytool 1.2.3 (built on 2024-01-15)") == (1, 2, 3)
    assert version_tuple("built on 2024-01-15") == ()


def test_version_tuple_ignores_a_dotted_date():
    """A DOTTED date is the harder case, and the near-miss is instructive.

    Excluding a preceding digit alone is not enough: in "2024.01.15" the scan
    restarts after the dot and matches "01.15" — which compares GREATER than a
    1.0.0 floor, making the guard worse than none. The preceding dot must be
    excluded too.
    """
    assert version_tuple("built 2024.01.15") == ()
    assert version_tuple("released 2024.1.5") == ()
    assert version_tuple("mytool 1.2.3 (2024.01.15)") == (1, 2, 3)
    assert not version_tuple("built 2024.01.15") >= (1, 0, 0)


def test_version_floor_pads_to_equal_width():
    """A binary reporting "1.2" must satisfy a ">=1.2.0" floor.

    Raw tuple comparison says (1, 2) < (1, 2, 0), so an equal version reads as
    too old — a false negative on the version gate.
    """
    assert version_tuple("1.2") < version_tuple("1.2.0")   # the trap itself
    from reference_check import resolve_bin
    assert resolve_bin("git").ok is True                    # sanity: no floor


def test_resolve_path_rejects_empty_reference(tmp_path):
    """An empty path must not resolve to the repo root.

    The agent and skill resolvers already reject empty names; the same shape
    was left open here — `root / ""` is the root, which exists.
    """
    (tmp_path / ".git").mkdir()
    for bad in ("", ".", "..", "  "):
        got = resolve_path(bad, tmp_path)
        assert got.ok is False, bad
        assert got.detail == "invalid path reference"


def test_resolve_path_is_case_sensitive(tmp_path):
    """A mis-cased path must not resolve, and detail must not echo the request.

    This filesystem is case-insensitive; git and Linux CI are not. A declared
    path with the wrong case passes here and dangles everywhere else, with the
    report printing the requested spelling rather than what exists.
    """
    (tmp_path / ".git").mkdir()
    (tmp_path / "docs").mkdir()
    (tmp_path / "docs" / "note.md").write_text("x")
    assert resolve_path("docs/note.md", tmp_path).ok is True
    assert resolve_path("DOCS/note.md", tmp_path).ok is False
    assert resolve_path("docs/NOTE.md", tmp_path).ok is False


def test_resolve_bin_rejects_a_failed_version_call(tmp_path):
    """A --version that EXITS NON-ZERO must not clear a floor.

    A binary printing "usage: fakebin v9.9.9" on stderr while exiting 1 would
    otherwise satisfy >=2.0.0 — a version floor cleared by an error message.
    """
    import stat

    fake = tmp_path / "fakebin"
    fake.write_text("#!/bin/sh\necho 'usage: fakebin v9.9.9' >&2\nexit 1\n")
    fake.chmod(fake.stat().st_mode | stat.S_IEXEC)
    import os as _os

    _os.environ["PATH"] = f"{tmp_path}:{_os.environ['PATH']}"
    got = resolve_bin("fakebin>=2.0.0")
    assert got.ok is False
    assert got.detail == "--version exited non-zero"


def test_resolve_path_rejects_absolute(tmp_path):
    """pathlib DISCARDS base when rel is absolute — /etc/hosts must not pass."""
    (tmp_path / ".git").mkdir()
    got = resolve_path("/etc/hosts", tmp_path)
    assert got.ok is False
    assert got.detail == "path escapes the repository"


def test_resolve_path_rejects_traversal(tmp_path):
    (tmp_path / ".git").mkdir()
    got = resolve_path("../../../../../../etc/hosts", tmp_path)
    assert got.ok is False
    assert got.detail == "path escapes the repository"


@pytest.mark.skipif(os.geteuid() == 0, reason="root bypasses read permissions")
def test_resolve_path_rejects_unreadable(tmp_path):
    (tmp_path / ".git").mkdir()
    locked = tmp_path / "locked.md"
    locked.write_text("x")
    locked.chmod(0o000)
    try:
        got = resolve_path("locked.md", tmp_path)
        assert got.ok is False
        assert got.detail == "path exists but is not readable"
    finally:
        locked.chmod(0o644)


def test_load_token_names_non_mapping_json_returns_empty(tmp_path):
    """Valid JSON that is not an object must not crash the run."""
    tokens = tmp_path / "tokens.json"
    for shape in ('["a"]', "42", "null", '"str"', "true"):
        tokens.write_text(shape)
        assert load_token_names(tokens) == set()
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


VERSION_TOKEN = re.compile(r"(?<![\d.])(\d{1,3}(?:\.\d+){1,3})\b")


def version_tuple(text: str) -> tuple[int, ...]:
    """The first dotted version-like token, as integers.

    NOT "the first three integers found". A `--version` banner containing a
    date — "built on 2024-01-15" — would then parse as version 2024.1.15 and
    clear every floor, silently passing a binary far too old. Requiring at
    least one dot excludes bare years and hyphenated dates.

    The pattern is fussy for reasons each learned from a real miss:

    * No leading ``\\b`` — `v` and `2` are both word characters, so anchoring
      the front fails on the very common "v2.1" spelling.
    * ``\\d{1,3}`` for the major — a four-digit leading component is a year,
      not a major version, so "2024.01.15" is excluded.
    * ``(?<![\\d.])`` — excluding a preceding DIGIT alone is not enough. In
      "2024.01.15" the scan simply restarts after the dot and matches "01.15",
      which compares GREATER than a 1.0.0 floor. The dot must be excluded too,
      or the guard is worse than none.
    """
    match = VERSION_TOKEN.search(text)
    return tuple(int(p) for p in match.group(1).split(".")) if match else ()


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
    if getattr(proc, "returncode", 0) != 0:
        # An ERROR must never clear a version floor. A binary exiting non-zero
        # with "usage: fakebin v9.9.9" on stderr would otherwise satisfy
        # >=2.0.0 — the floor cleared by a failure message. Same guard
        # resolve_selector carries; it belongs on every subprocess call.
        return Result("bins", spec, False, "--version exited non-zero")
    found = version_tuple(proc.stdout + proc.stderr)
    shown = ".".join(str(part) for part in found) or "unknown"
    wanted = version_tuple(floor)
    width = max(len(found), len(wanted))
    pad = lambda v: v + (0,) * (width - len(v))
    if pad(found) >= pad(wanted):
        return Result("bins", spec, True, shown)
    return Result("bins", spec, False, f"found {shown}, need >={floor}")


def repo_root(start: Path) -> Path:
    start = Path(start).resolve()
    for candidate in [start, *start.parents]:
        if (candidate / ".git").exists():
            return candidate
    return start if start.is_dir() else start.parent


def resolve_path(rel: str, base: Path) -> Result:
    """Resolve a repo-relative path, confined to the repo and readable.

    Two failures the agent/skill resolvers already guard against apply here
    too. `pathlib` silently DISCARDS `base` when `rel` is absolute, so
    "/etc/hosts" resolved outside the repo and reported found; and `.exists()`
    is True for a file nothing can read, which is a silent false pass.
    """
    if not rel or rel.strip() in ("", ".", ".."):
        return Result("paths", rel, False, "invalid path reference")
    root = repo_root(base).resolve()
    try:
        target = (root / rel).resolve()
    except OSError:
        return Result("paths", rel, False, "no such path")
    if not target.is_relative_to(root):
        return Result("paths", rel, False, "path escapes the repository")
    if not target.exists():
        return Result("paths", rel, False, "no such path")
    # Case-exact, for the same reason agents and skills are: this filesystem is
    # case-insensitive, but git and Linux CI are not. A mis-cased declared path
    # resolves here and dangles everywhere else — and `detail` would echo the
    # REQUESTED spelling, concealing it. Walk the components against listdir.
    exact = _exact_path(root, *PurePosixPath(rel).parts)
    if exact is None:
        return Result("paths", rel, False, "no such path")
    if not os.access(exact, os.R_OK):
        return Result("paths", rel, False, "path exists but is not readable")
    return Result("paths", rel, True, str(exact))


def load_token_names(tokens_json: Path) -> set[str]:
    try:
        data = json.loads(Path(tokens_json).read_text())
    except (OSError, json.JSONDecodeError):
        return set()
    if not isinstance(data, dict):
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

Expected: PASS — 58 passed

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


def test_resolve_url_non_integer_status_does_not_raise():
    """A response whose .status is None must report, not crash.

    A file:// URL produces exactly this: the attribute exists but is None, so
    getattr's default never fires and `200 <= None` raises. The guard has to be
    a type check, and it has to live inside the try's protection.
    """
    class NoneStatus:
        status = None

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    got = resolve_url("file:///etc/hosts", opener=lambda *a, **k: NoneStatus())
    assert got.ok is False
    assert "no usable status" in got.detail


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


def test_resolve_selector_missing_binary_returns_result(tmp_path):
    """agent-browser absent must report, not crash the whole run."""
    def missing(cmd, **kwargs):
        raise FileNotFoundError(2, "No such file or directory", cmd[0])

    got = resolve_selector(".x", ["https://example.test/"], runner=missing)
    assert got.ok is False
    assert got.detail == "agent-browser unavailable"


def test_resolve_selector_error_output_is_not_a_count():
    """`Error 404: no such page` must not read as 404 matches.

    Taking the first integer in stdout makes a selector report as RESOLVING
    because the browser failed — the exact silent false pass this tool exists
    to prevent.
    """
    def failing(cmd, **kwargs):
        proc = FakeProc("Error 404: no such page")
        proc.returncode = 1
        return proc

    got = resolve_selector(".x", ["https://example.test/"], runner=failing)
    assert got.ok is False
    assert got.detail == "no usable count from 1 of 1 url(s)"


def test_resolve_selector_states_an_unchecked_url():
    """One unusable url plus one clean zero must NOT read as a plain zero.

    The plan's constraint is that absence of a check is stated, never implied.
    Reporting "0 matches" when a page was never successfully checked implies a
    verified absence that did not happen.
    """
    calls = {"n": 0}

    def mixed(cmd, **kwargs):
        if "get" not in cmd:
            return FakeProc("")
        calls["n"] += 1
        if calls["n"] == 1:
            proc = FakeProc("garbage")
            proc.returncode = 1
            return proc
        return FakeProc("0")

    got = resolve_selector(".x", ["https://a.test/", "https://b.test/"], runner=mixed)
    assert got.ok is False
    assert got.detail == "no usable count from 1 of 2 url(s)"


def test_resolve_selector_requires_the_page_to_load():
    """If `open` fails, any count that follows describes the WRONG page.

    Guarding only the count command leaves the open one line above it
    unchecked, so a page that never loaded still yields a match from whatever
    was previously in the browser.
    """
    def open_fails(cmd, **kwargs):
        if "open" in cmd:
            proc = FakeProc("")
            proc.returncode = 1
            return proc
        return FakeProc("3")

    got = resolve_selector(".x", ["https://never-loaded.example/"], runner=open_fails)
    assert got.ok is False
    assert got.detail == "no usable count from 1 of 1 url(s)"


def test_resolve_selector_nonzero_exit_is_not_a_match():
    def nonzero(cmd, **kwargs):
        proc = FakeProc("7")
        proc.returncode = 2
        return proc

    assert resolve_selector(".x", ["https://example.test/"], runner=nonzero).ok is False
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
    """Resolve a URL by opening it and inspecting the response status.

    `.status` is not reliably an int. A `file://` URL yields a response whose
    `status` attribute EXISTS but is None, so `getattr(response, "status", 0)`
    returns None rather than the default — and comparing None against an int
    raises. The comparison must therefore be type-guarded, and it must sit
    inside the guard: an assumption evaluated outside the try is not protected
    by it.
    """
    try:
        with opener(url, timeout=15) as response:
            status = getattr(response, "status", None)
    except Exception as exc:  # URLError, HTTPError, socket timeouts
        return Result("urls", url, False, str(exc))
    if not isinstance(status, int):
        return Result("urls", url, False, f"no usable status ({status!r})")
    ok = 200 <= status < 400
    return Result("urls", url, ok, str(status))


def resolve_selector(selector: str, urls: list[str], runner=subprocess.run) -> Result:
    """Count selector matches on any declared URL.

    Two traps here, and the second is the worst shape this tool can produce:

    * `subprocess.run` RAISES `FileNotFoundError` when `agent-browser` is not
      installed. Unhandled, the verifier crashes instead of reporting.
    * Taking "the first integer in stdout" turns an error line — say
      `Error 404: no such page` — into a count of 404 matches, so a selector
      reports as RESOLVING precisely because the browser failed.

    Hence: the command must exit 0, and stdout must be exactly a number.
    Anything else is not a count, and a URL that produced no usable count is
    reported as such rather than folded into "0 matches".
    """
    if not urls:
        return Result(
            "selectors", selector, False, "no urls declared to resolve selector against"
        )
    unusable = 0
    for url in urls:
        try:
            opened = runner(
                ["agent-browser", "open", url], capture_output=True, text=True, timeout=60
            )
            if getattr(opened, "returncode", 0) != 0:
                # If the page never loaded, any count that follows describes
                # whatever was previously loaded. Checking only the count
                # command leaves this one line above it unguarded.
                unusable += 1
                continue
            proc = runner(
                ["agent-browser", "get", "count", selector],
                capture_output=True,
                text=True,
                timeout=60,
            )
        except (OSError, subprocess.SubprocessError):
            return Result("selectors", selector, False, "agent-browser unavailable")
        if getattr(proc, "returncode", 0) != 0:
            unusable += 1
            continue
        text = (proc.stdout or "").strip()
        if not text.isdigit():
            unusable += 1
            continue
        if int(text) > 0:
            return Result("selectors", selector, True, f"{text} match(es) on {url}")
    if unusable:
        return Result(
            "selectors", selector, False,
            f"no usable count from {unusable} of {len(urls)} url(s)",
        )
    return Result("selectors", selector, False, "0 matches on any declared url")
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ~/Developer/the-lodge && pytest tests/reference_check/ -v
```

Expected: PASS — 70 passed

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


def test_check_file_reports_an_unreadable_input(fake_home, tmp_path):
    """Non-UTF-8 input must report, not raise.

    _readable_file guards every REFERENCED file; the file under check was
    never guarded, so an unreadable input raised — exiting 1 indistinguishably
    from "unresolved references" and abandoning the rest of a multi-file run.
    """
    (tmp_path / ".git").mkdir()
    doc = tmp_path / "bad.md"
    doc.write_bytes(b"\xff\xfe not utf-8")
    results = check_file(doc, live=False, tokens_json=None)
    assert [r.kind for r in results] == ["file"]
    assert results[0].ok is False
    assert results[0].detail.startswith("unreadable:")


def test_format_report_does_not_count_skipped_as_resolved(fake_home, tmp_path):
    """The summary line is what CI reads; it must not claim skipped as passed."""
    doc = write_doc(tmp_path, '---\nrequires:\n  urls: ["https://e.test/"]\n---\n')
    text = format_report(doc, check_file(doc, live=False, tokens_json=None), live=False)
    assert "PASS 0 resolved, 1 SKIPPED" in text
    assert "PASS 1 reference(s) resolved" not in text


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
LIVE_CLASSES = ("urls", "selectors")
SKIPPED_DETAIL = "SKIPPED (no --live)"


FRONTMATTER_DETAIL = {
    "unparseable": "frontmatter present but could not be parsed — declared "
                   "references, if any, were not read",
    "ambiguous": "frontmatter parse is ambiguous (a bare `---` line inside an "
                 "indented continuation); a different reading finds a requires: "
                 "block this one cannot see",
}


def check_file(path: Path, live: bool, tokens_json: Path | None) -> list[Result]:
    path = Path(path)
    try:
        text = path.read_text()
    except (OSError, UnicodeDecodeError) as exc:
        # _readable_file guards every REFERENCED file; the file under check was
        # never guarded. An unreadable or non-UTF-8 input raised, which exits 1
        # indistinguishably from "unresolved references" and silently abandoned
        # every remaining file in a multi-file run.
        return [Result("file", str(path), False, f"unreadable: {exc}")]
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
                results.append(Result(kind, ref, True, SKIPPED_DETAIL))
            elif kind == "urls":
                results.append(resolve_url(ref))
            else:
                results.append(resolve_selector(ref, urls))
    return results


def format_report(path: Path, results: list[Result], live: bool) -> str:
    lines = [f"reference-check: {path}"]
    for result in results:
        mark = "SKIP" if result.detail == SKIPPED_DETAIL else ("OK  " if result.ok else "FAIL")
        lines.append(f"  {result.kind:<10} {result.ref:<34} {mark}  {result.detail}")
    failures = [r for r in results if not r.ok]
    skipped = [r for r in results if r.detail == SKIPPED_DETAIL]
    if not live:
        lines.append("  note: urls and selectors were not resolved (no --live)")
    if failures:
        lines.append(f"FAIL {len(failures)} unresolved reference(s)")
    elif skipped:
        # The summary is the one line CI reads. Counting skipped checks as
        # resolved asserts a verification that never ran — the plan's own
        # constraint is that absence of a check is STATED, never implied.
        lines.append(
            f"PASS {len(results) - len(skipped)} resolved, {len(skipped)} SKIPPED"
        )
    else:
        lines.append(f"PASS {len(results)} reference(s) resolved")
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

Expected: PASS — 83 passed

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
mv "$HOME/.claude/ARCHIVE/old agents/adhd-friendly-ui-designer.md" ~/.claude/agents/
```

**`mv`, not `cp`.** A copy leaves the file in both places, and a shadow copy is
exactly the ambiguity §5.1 sets out to end — "each agent gets exactly one home,
no shadow copies". An earlier draft of this step said `cp` and contradicted its
own section; the final verification caught it.

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

**Type consistency:** `Result(kind, ref, ok, detail)` is defined in Task 2 and used with that exact signature in Tasks 3, 4, 5. `repo_root` is defined in Task 3 and consumed by `resolve_path` in the same task. `check_file(path, live, tokens_json)` in Task 5 calls `resolve_agent(name, base)`, `resolve_skill(name, base)`, `resolve_bin(spec)`, `resolve_path(rel, base)`, `resolve_token(name, tokens_json)`, `resolve_url(ref)`, `resolve_selector(ref, urls)` — all matching their Task 2–4 definitions. Test counts accumulate 21 → 34 → 58 → 70 → 83 — verified end-to-end by assembling the module from this plan's own code blocks and running all five test files against it (83 passed).

**Known gap, deliberate:** `<theme>` appears as a placeholder path in Tasks 7 and 8 because the theme repo is currently checked out in a worktree whose path is session-specific. Substitute the current working directory at execution time.
