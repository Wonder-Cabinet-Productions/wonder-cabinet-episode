# Wonder Cabinet Theme QA Harness — Design

**Date**: 2026-07-25
**Status**: Approved, pending implementation
**Author**: Claude (brainstorming session)

## Problem

`docs/luminous/cross-brand-qa-checklist.md` is the merge gate for any change touching a
shared component in this multi-brand theme. Every item on it is verified **by hand** —
eyeballing colors at `https://wondercabinet.riechers.co`, pasting a `getComputedStyle` call
into a console, comparing "does this look the same as before" from memory.

Two consequences:

1. **The §A invariant is unenforceable in practice.** "Routing a rule from `var(--wc-green)`
   to `var(--show-accent)` must be a visual no-op for Wonder Cabinet" is a *visual regression
   test* stated in prose. Nobody can hold last week's rendering in their head accurately
   enough to detect a subtle leak.
2. **The checklist can silently rot.** Verified during this design session: line 29 instructs
   `getComputedStyle(document.documentElement).getPropertyValue('--show-accent')`. Sprint 2
   moved brand context to a `<body>` class, so that call now returns **WC green on a
   correctly-branded Luminous page** — a false negative. It still appears to pass for WC only
   because `:root` defaults to green.

`agent-browser` (installed 2026-07-25) makes these checks mechanizable: `eval` for computed
variables, `diff screenshot --baseline` for the visual invariant, `a11y` for contrast.

## Goals

- Automate the mechanizable portions of the existing cross-brand QA checklist
- Enforce the §A "WC is a visual no-op" invariant with real baselines
- Cover **both** brand contexts as first-class — Luminous is under active development on
  `sprint/*` branches and must be checked now, not deferred to a future sprint
- Keep the checklist the human-readable source of truth; the skill automates, never replaces

## Non-Goals

- **Not a replacement for `brand-guardian`.** This catches *unintended* drift. The guardian
  judges *intended* change against the brand book. Different jobs.
- **Not a CI gate.** Baselines live in gitignored `design-assets/`; CI cannot see them.
  `gscan` remains the CI gate.
- **Not a local Ghost runtime.** Ghost runs on LXC `ghost01`. The harness tests the live
  preview URL and never starts anything locally.
- **Not a re-teaching of agent-browser.** The binary ships a version-matched `core` skill.

## Architecture

### Two skills, authored in the-lodge, symlinked global

```
the-lodge/.claude/skills/project/wc-theme-qa/SKILL.md   → ~/.claude/skills/wc-theme-qa
the-lodge/.claude/skills/misc/browser-tooling/SKILL.md  → ~/.claude/skills/browser-tooling
```

**Why the lodge and not `wonder-cabinet/.claude/skills/`:** Claude Code discovers skills from
the current project root plus `~/.claude/skills/`. It does not descend into nested child
repos. The documented theme fast path is `cd ghost-dev/content/themes/wonder-cabinet-episode`
— a session started there would not see a metarepo-scoped skill. The metarepo `CLAUDE.md`
already documents this blind spot for `spectral-engineer` and accepts it. Authoring in the
lodge and symlinking to `~/.claude/skills/` removes the blind spot instead: visible from the
metarepo *and* from a theme-repo session.

Precedent: every global skill is already a symlink into the lodge, and `markbrain-maintenance`
establishes that domain-specific skills live there.

### Brand context is per-page

Sprint 2 puts brand context on the body element (`body.brand-wonder-cabinet`,
`body.brand-luminous`), not on `:root`. All assertions therefore read from
`document.body`, and each page in the matrix carries an **expected brand**.

Verified live on 2026-07-25 (`sprint/2-brand-switch`):

| Brand | `--show-accent` | `--show-accent-text` | `--show-accent-dark` |
|---|---|---|---|
| Wonder Cabinet | `#10a544` | `#087834` | `--wc-dark-green` |
| Luminous | `#9a59ff` | `#8b4deb` | `#1f0f33` |

Real variable names are `--show-accent`, `--show-accent-text`, `--show-accent-dark`,
`--show-accent-text-rgb`. There is no `--show-accent-deep`.

### Page matrix

URLs are **pinned**, never "the most recent episode". A relative selector would silently
re-point at a different post the next time an episode publishes, invalidating every baseline
without any theme change. The matrix lives in `pages.json` beside the skill:

| Key | URL path | Expected brand |
|---|---|---|
| `wc-home` | `/` | wonder-cabinet |
| `wc-post` | pinned WC episode slug | wonder-cabinet |
| `wc-tag` | pinned WC tag archive | wonder-cabinet |
| `wc-page` | pinned static page | wonder-cabinet |
| `wc-contact` | `/contact/` | wonder-cabinet |
| `lum-archive` | `/luminous/` | luminous |
| `lum-post` | `/luminous/reclaiming-the-acid-queen/` | luminous |

Pinned slugs are resolved once at setup and recorded; if a pinned URL later 404s the harness
reports it as a broken pin rather than silently skipping the page.

Viewports: `1280` (desktop) and `390` (mobile — the theme's breakpoint is 767px).

### Strict for WC, advisory for Luminous

This is the central design decision, forced by Luminous being mid-build.

- **WC visual diff → FAIL.** §A says WC must be a visual no-op. A WC pixel diff is a
  regression by definition.
- **Luminous visual diff → INFORMATIONAL.** Luminous pages are under active construction;
  diffs there are expected work product. Failing on them would train the operator to ignore
  red, destroying the harness's value.
- **All Luminous *assertions* remain strict** — accent variables, AA contrast, and absence of
  WC-only vocabulary are correctness claims regardless of build state.

### Baselines are branch-keyed

```
wonder-cabinet/design-assets/theme-baselines/
  <branch-slug>/
    manifest.json
    wc-home-1280.png
    lum-archive-1280.png
    ...
```

`manifest.json` records, per capture: page key, URL, viewport, expected brand, capture
timestamp, theme branch, theme commit SHA.

**Why branch-keyed is mandatory here:** Luminous exists only on `sprint/*` branches and is
deliberately held off `main` for one combined production deploy. A flat baseline directory
would compare `sprint/2-brand-switch` renderings against `main` baselines and report every
Luminous page as changed on every run.

**Why the SHA stamp is mandatory:** `design-assets/` is gitignored, so baselines are not
versioned alongside the theme commit that produced them. Without a stamp, a red diff cannot
be distinguished from a stale baseline. The skill reads current HEAD, compares to the
manifest, and reports drift distance ("baselines are 14 commits behind on this branch") before
presenting any result.

## Check suite

Mapped directly to checklist sections:

| ID | Check | Mechanism | Checklist ref |
|---|---|---|---|
| C1 | gscan | `npm run test` | §B |
| C2 | Accent variables per brand | `agent-browser eval` on `document.body` | §B, §C |
| C3 | WC visual no-op | `agent-browser diff screenshot --baseline` | §A |
| C4 | Contrast / AA | `agent-browser a11y --tags wcag2a,wcag2aa` | §C |
| C5 | Raw `--wc-green` leaks | `grep` against the four documented exceptions | §B |
| C6 | No WC vocabulary on Luminous | DOM presence check: galaxy, cabinet illustration, bracket ornaments | §C |

C5's documented exceptions: the `--show-accent*` definitions, `.wc-head-subscribe`, error
pages, `--wc-focus-ring-dark`.

## Preflight

Before any check, verify the dev loop is live, since a stale preview produces meaningless
results:

1. `agent-browser --version` — tool present
2. `mutagen sync list` — expect `wc-theme … Watching for changes`
3. `ssh wc-ghostdev 'systemctl is-active ghost-dev ghost-theme-watch'`
4. Live preview returns 200
5. Baseline drift distance vs current HEAD

Any preflight failure stops the run and reports which one — it never silently proceeds.

## Output

A report structured as the checklist's own sections, each item PASS / FAIL / INFO with
evidence (computed value, diff percentage, axe violation selector). Ends with:

- Explicit statement of what was **not** checked (skipped pages, missing baselines)
- Handoff line recommending `brand-guardian` when diffs are intentional design change

## `browser-tooling` skill

~40 lines. The decision tree from
`the-lodge/knowledge/browser-automation/browser-tooling-comparison.md`, plus the rule that
`agent-browser` should not be mounted as an MCP server because it costs zero context until
invoked. Points at the knowledge base rather than restating it.

## Documentation changes

| File | Change |
|---|---|
| `docs/luminous/cross-brand-qa-checklist.md` | **Fix line 29** — `document.documentElement` → `document.body`; record real variable names; note which items `wc-theme-qa` automates |
| `wonder-cabinet-episode/CLAUDE.md` | Add agent-browser / `wc-theme-qa` alongside "chrome-devtools MCP works against it" |
| `ghost-dev/CLAUDE.md` | Same |
| `wonder-cabinet/CLAUDE.md` | Same |
| `the-lodge/knowledge/mcp/chrome-devtools-mcp.md` | 0.13.0 → 1.6.0; 26 → 28 tools; remove false "Playwright MCP (which you already have)" |

The line 29 fix is a live defect in the merge gate and is worth making independently of the
skill.

## Risks

- **Baseline staleness** — mitigated by the SHA stamp and drift reporting, not eliminated.
- **Screenshot flake** from fonts, CDN images, or the WaveSurfer waveform rendering
  non-deterministically. Mitigation: tolerant pixel threshold on screenshot diffs, exact
  matching only on computed CSS variables. If the audio player proves unstable, mask that
  region rather than loosening the global threshold.
- **Preview reflects working tree, not a commit** — mutagen syncs unsaved-to-git edits, so a
  baseline can capture uncommitted state. The manifest records the SHA but cannot record
  dirtiness; the skill additionally records whether the tree was dirty at capture.
