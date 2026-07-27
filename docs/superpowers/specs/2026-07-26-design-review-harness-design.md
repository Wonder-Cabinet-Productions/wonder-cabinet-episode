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

# Design Review & QA Harness — Design

**Date**: 2026-07-26
**Status**: Approved design, pending implementation planning
**Scope**: A rigorous, repeatable agent-driven design review and verification process for the
multi-brand Wonder Cabinet Ghost theme — plus the workspace reference hygiene it depends on.
**Supersedes**: the Sprint 3 phases (3.0–3.4) of
`2026-06-08-luminous-branding-workplan-design.md`, which collapsed audit, expert UX review, and
human UX testing into one undifferentiated blob.

---

## 1. Problem

The theme has a merge gate (`docs/luminous/cross-brand-qa-checklist.md`, partly automated by the
`wc-theme-qa` skill) and a sprint machinery (`planning/sprints/*/features.json`). Neither is
trustworthy yet, and the record shows why.

### 1.1 Sprint 2 produced a documented false pass

| When | Record |
|---|---|
| 2026-07-22 `69ce614a` | S2-06 marked `done`. Acceptance included *"Luminous: `tag:luminous` post … render violet"* |
| 2026-07-22 `default.hbs` | Comment asserts `{{#has tag="luminous"}} → brand-luminous covers POST pages` |
| 2026-07-22 `progress.md` | QA performed by the implementing session; method *"curl DOM-diff + chrome-devtools visual on home + a WC post"*; Luminous *"confirmed via computed styles"* |
| 2026-07-23 `5ca3f6fb` | **Luminous episode pages were rendering WC green.** The `{{#has}}` clause "never fired on posts" |
| 2026-07-25 `a7bf0135` | The computed-style check was reading `document.documentElement` |

Two independent failures compounded:

1. **Sampling.** `/luminous/` (the collection) worked — `routes.yaml` supplies tag context.
   `/luminous/<episode>/` did not — post context nests under `post`. QA verified the page type
   that worked and generalized to the brand.
2. **Instrumentation.** Reading `--show-accent` from `documentElement` returns `:root` — green —
   on a correctly-branded Luminous page *and* on a broken one. The check carried zero bits about
   Luminous branding; it could not distinguish pass from fail in either direction.

Three layers each asserted "Luminous posts render violet" — acceptance criterion, code comment,
QA verdict — and none could contradict the others, because all three came from the same session.
**Independence was the missing property, not effort.**

### 1.2 The same rot mechanism, five times

| # | Assertion | Correct when written? | Invalidated by | Found |
|---|---|---|---|---|
| 1 | QA checklist: read `--show-accent` from `documentElement` | yes | Sprint 2 moving brand context to `<body>` | after it certified Sprint 2 |
| 2 | `default.hbs`: `{{#has tag="luminous"}}` covers post pages | never true | — | next day, in production behaviour |
| 3 | Umbrella spec §2: 5 roles → real subagents | **yes** | 4 agents archived 2026-07-07 | this session |
| 4 | `.sync-manifest.json`: 9 agents deployed | yes (2026-06-10) | the same archiving | this session |
| 5 | `brand-guide.json`: `source_path` → `/Users/markriechers/…` | yes | username + directory change | this session |

Instance 3 is the instructive one. The umbrella spec was authored 2026-06-08 and was **correct**:
`.sync-manifest.json` records `adhd-friendly-ui-designer` synced to `~/.claude/agents/` on
2026-06-10. On 2026-07-07 it was moved to `~/.claude/ARCHIVE/old agents/` along with
`code-troubleshooter`, `obsidian-extension-developer`, and `agent-registrar` — the agent whose
charter is *"discovers, registers, and audits agents across all repositories."* Sprint 2 then ran
on 2026-07-22 with two of its five roles silently undispatchable.

**Nothing in this workspace verifies that a reference still resolves.** That is the systemic
defect. Scattered files are a symptom.

### 1.3 Nothing can falsify a design claim

`"test": "gscan ."` validates Ghost theme-API compliance. It passes with every color wrong and
every hierarchy inverted. There are no unit tests, no Playwright, no CI visual check. The whole
quality apparatus is gscan, agent judgment, and a human eyeballing a preview URL.

### 1.4 State lives in six places

`backlog.md`, `TRIAGE.md`, GitHub Issues, per-sprint `features.json`, `progress.md`, and prose
deferrals in docs. The `.wc-head-subscribe` navbar-accent question is deferred simultaneously in
the QA checklist §B, `multi-brand-design-system.md` §7, and `progress.md` — which is why it has
survived two sprints with no owner.

### 1.5 Three documents claim to be the source of truth

`design-assets/site-design/DESIGN_SYSTEM.md` (v1.0, Jan 2025) opens *"This document is the single
source of truth for all visual implementation decisions."* `brand-guardian` names
`brand-guide.md` + the PDFs as "the authorities, in priority order."
`multi-brand-design-system.md` calls itself "the operational contract." Each carries its own copy
of the palette.

---

## 2. Goals / Non-goals

**Goals**

- Make verification independent of implementation, and prove the verifier actually works
- Make every reference — agent, skill, URL, selector, path, token — provably resolvable
- Give design findings an objective standard to cite, where one can exist
- Give design findings a durable home that survives sprint boundaries
- Exploit `agent-browser` 0.33 capabilities that postdate the original harness design

**Non-goals**

- **Not a CI gate.** Baselines are large binaries outside git; `gscan` remains the CI gate.
- **Not a replacement for `brand-guardian`.** The gate catches unintended drift; the engine
  proposes improvements; `brand-guardian` remains the authority on intended change.
- **Not a local Ghost runtime.** The runtime is LXC `ghost01`; everything tests the live preview.
- **Not exhaustive component coverage.** Coverage grows from escapes, not from matrix completeness.

---

## 3. Decisions locked

| # | Decision | Choice |
|---|---|---|
| 1 | Scope | All three concerns in one sequenced spec: reference integrity → gate → ground truth → engine |
| 2 | Gate vs. engine | **Both, explicitly separated.** Different contracts, shared substrate |
| 3 | Ground truth | **Expand it before running heuristic critique** |
| 4 | Reference coverage | **Spec the 5 surfaces that matter; provisional goldens elsewhere** |
| 5 | Fan-out unit | **Two passes — composition, then components targeted by evidence** |
| 6 | Rot defense | **Declared dependencies + a resolver preflight**, plus one-time consolidation |
| 7 | Contract location | **`design-contract/` in the theme repo**, versioned with the code |

---

## 4. Architecture

Three artifacts over one declarative substrate. The substrate holds no logic.

```
design-contract/              (theme repo, versioned with the code)
  surfaces.json               URL, brand, viewport, spec|golden, mask selectors
  tokens.json                 brand / derived / scale tiers
  components.json             partial → CSS section → surfaces → states
  specs/                      the 5 machine-checkable surface specs
  goldens/                    provisional approvals: date, approver, rationale, review-by
  fixtures/                   planted defects each check must catch
```

Today this data lives in three homes — `pages.json` beside the skill in the-lodge, baselines in
gitignored `design-assets/`, the token set only as `:root` in `screen.css`. That split is why
baselines needed branch-keying. Consolidating into the theme repo means a branch carries its own
contract. Baseline *images* stay out of git; their manifest moves in.

```
reference-check ──────────► preflight for both artifacts
                                    │
              ┌─────────────────────┴─────────────────────┐
            GATE                                       ENGINE
      wc-theme-qa (revised)                    wc-design-review (new)
      deterministic                            judgment
      binary verdict                           ranked proposals
      per-PR, blocking                         on-demand, advisory
      writes `verified`                        writes the ledger
                                    │
                            brand-guardian
                     (intent authority, human-gated)
```

---

## 5. Phase 1 — Reference integrity

### 5.1 Consolidate the scatter

| Location | Contents | Discoverable from |
|---|---|---|
| `the-lodge/the-agency/` | 9 defs (registry source) | **nothing** |
| `~/.claude/agents/` | 5 live | everywhere |
| `~/.claude/ARCHIVE/old agents/` | 4 archived | nothing |
| `the-lodge/.claude/agents/` | 5 lodge-scoped | the-lodge only |
| `wonder-cabinet/.claude/agents/` | `brand-guardian`, `spectral-engineer` | metarepo only |

Each agent gets exactly one home, no shadow copies: **live** (`~/.claude/agents/`),
**project-scoped** (that repo's `.claude/agents/`), or **retired** (deleted — archiving in place
is what created the ambiguity).

`brand-guardian` and `spectral-engineer` move to **user scope**. Not a theme-repo copy: the
metarepo placement was deliberate (*"there is no per-repo copy to drift"*) and copying would
reintroduce that drift. Not a symlink: worktrees break symlinks, and this work happens in
worktrees. User scope gives one copy visible from the theme repo, the metarepo, and every
worktree. Cost: they appear in unrelated projects' rosters — tolerable, since both descriptions
are explicitly Wonder-Cabinet-scoped. Reversible if noisy.

### 5.2 Declared dependencies

Every skill and spec declares what it depends on, in frontmatter:

```yaml
requires:
  agents:    [brand-guardian]
  skills:    [browser-tooling]
  bins:      ["agent-browser>=0.33.0"]
  paths:     [design-contract/surfaces.json]
  urls:      ["https://wondercabinet.riechers.co/"]
  selectors: [".wc-list-item", ".kg-audio-card"]
  tokens:    ["--show-accent", "--show-accent-text"]
```

### 5.3 `reference-check`

Resolves every declared dependency and fails loudly. Runs as preflight step 0 for both artifacts,
and standalone across the workspace. Resolution per class: agents against the discoverable
roster, skills against the skill list, bins against `$PATH` plus version, paths against the
filesystem, URLs against live HTTP, selectors against a rendered page (match count > 0), tokens
against `tokens.json`.

**What it does not catch.** It catches *dangling* references. It would **not** have caught the
`documentElement` bug — that selector resolves perfectly well and simply returns the wrong thing.
A check that resolves and lies is a different rot mode, defended only by §6.2's fixtures. Two
modes, two defenses; the distinction must stay explicit or the resolver will be over-trusted.

### 5.4 Delete the hand-maintained registries

`.sync-manifest.json` claims 9 agents deployed; 5 are. `AGENT_REGISTRY.md` was last updated
2026-03-05 and lists archived agents as live. Both are **generated from reality or deleted** —
not corrected. Any registry requiring manual updates will rot; correcting one only resets its
clock.

---

## 6. Phase 2 — The gate

Contract: deterministic, binary, per-PR, never opines.

### 6.1 The suite, ordered by determinism

| ID | Check | Mechanism | Determinism |
|---|---|---|---|
| G1 | Reference resolution | `reference-check` | exact |
| G2 | gscan | `npm run test` | exact |
| G3 | **Token conformance** — computed color/space/radius ⊆ `tokens.json` | `get styles` harvest | exact |
| G4 | Brand context + accent variables | `eval` on `document.body` | exact |
| G5 | Raw `--wc-green` leaks | grep vs. documented exceptions | exact |
| G6 | **A11y-tree diff** vs. baseline | `diff snapshot` | exact |
| G7 | axe WCAG 2 A/AA | `a11y --tags wcag2a,wcag2aa` | exact |
| G8 | WC vocabulary absent on Luminous | `get count` | exact |
| G9 | **Reduced-motion path** | `set media reduced-motion` + G6 | exact |
| G10 | **Focus states** | `focus` + `get styles` | exact |
| G11 | Pixel diff | `diff screenshot` | *tolerant* |

Ten deterministic checks, one tolerant. The prior design led with G11 and spent its risk section
absorbing the resulting flake. G3, G6, G9, G10 are new and became cheap only with
`agent-browser` 0.33.

`--show-accent` resolves to `#10a544` / `#087834` under `body.brand-wonder-cabinet` and
`#9a59ff` / `#8b4deb` under `body.brand-luminous`. Read from `document.body`, never
`document.documentElement`.

### 6.2 Determinism protocol

Before any capture: abort image requests
(`network route --abort --resource-type image`), freeze animation via
`set media reduced-motion`, fixed viewport and device pixel ratio. Mask **only** the WaveSurfer
region — it renders from decoded audio and is genuinely non-deterministic. Flake is eliminated
where possible and masked where not, rather than absorbed into a loose global threshold.

### 6.3 The fixture suite — the gate's own tests

`design-contract/fixtures/`, each a minimal mutation bound to the check that must catch it:

| Fixture | Mutation | Must fail |
|---|---|---|
| `raw-green-leak` | shared rule → `var(--wc-green)` | G5, G4 |
| `off-scale-gap` | a `gap: 24px` → `23px` | G3 |
| `unbranded-luminous-post` | strip `brand-luminous` from `<body>` | G4 |
| `low-contrast-violet` | accent-text → raw `#9A59FF` (3.84:1 on cream) | G7 |
| `wc-vocab-on-luminous` | unhide cabinet under `body.brand-luminous` | G8 |
| `heading-order-break` | h2 → h4 in episode notes | G6 |
| `motion-ignores-preference` | drop the `prefers-reduced-motion` guard | G9 |
| `lost-focus-ring` | `outline: none` on a focusable | G10 |
| `dangling-agent` | frontmatter names a nonexistent agent | G1 |
| `frontmatter-swallowed` | a `---` inside a quoted frontmatter value | G1 |

Run mode: apply → run gate → **assert the named check FAILS** → revert. A fixture that passes
means the check is broken; that reports as a **self-test failure**, which invalidates the entire
run and is louder than any content failure.

This is the defense against the `documentElement` class of bug. `unbranded-luminous-post` strips
the class; a check reading `:root` reports green — the same thing it reports on a *correct* page
— so it cannot distinguish, and the fixture exposes that in one run.

`frontmatter-swallowed` guards the same class one level up, in the resolver itself. Phase 1's
first implementation split frontmatter on the substring `---`, which truncates at a `---` inside a
quoted value; YAML then fails, the `requires:` block vanishes, and `reference-check` reports
`PASS 0 reference(s) resolved` — a silent false pass in the tool built to prevent silent false
passes. Fixed in Phase 1 with a line-anchored delimiter; this fixture keeps it fixed. **The
verifier is not exempt from verification.**

### 6.4 Applying fixtures without touching the working tree

The runtime is on LXC `ghost01` behind mutagen, so mutating source to test would be slow and
risky. Most fixtures don't need to:

- **Client-side injection** (G3, G4, G6, G7, G8, G10) — `eval` a `<style>` block or DOM mutation
  into the live page. No file change, no sync wait, reversible, runs in seconds.
- **Source-level only where unavoidable** (G2 gscan, G5 grep) — run against a scratch copy,
  never the working tree.

Two fixtures are **dual-mode**, and this must be explicit or one half will silently go untested:
`raw-green-leak` is injected client-side to exercise G4/G3 (the rendered value changes) *and*
applied to a scratch copy to exercise G5 (a source grep cannot see an injected style). Each
fixture therefore declares which mode satisfies which check ID.

### 6.5 Output contract

The gate writes into `features.json`:

```json
"verified": { "verdict": "pass", "checkIds": ["G1","G3","G6"],
              "evidence": "…", "agent": "wc-theme-qa",
              "sha": "a7bf0135", "dirty": false, "timestamp": "2026-07-26T…" }
```

`status` stays doer-owned; `verified` is verifier-owned. **No agent writes both.** A feature is
never `done` — it is `implemented`, and separately `verified`.

---

## 7. Phase 3 — Ground truth

### 7.1 The five specced surfaces

| Surface | Source | Authority |
|---|---|---|
| WC home | **derived** | `mockups/WonderCabinetWebsite-010725-pages-1440/page-1.png` |
| WC episode | **derived** | `…/page-2.png` — see note below |
| Luminous home | **authored** | user + `brand-guardian` |
| Luminous episode | **authored** | user + `brand-guardian` |
| Episode archive | **authored**, brand-parameterized | `multi-brand-design-system.md` §2, §6 |

The archive is specced once with brand as a parameter, because the multi-brand contract asserts
archives share layout DNA and differ only in accent and vocabulary. If the archive cannot be
expressed brand-parameterized, that contract is wrong — the spec structure tests the assertion.

Wireframe coverage is genuinely thin: three rasterized pages, WC-only, desktop-only. That is why
everything else gets a golden rather than a derived spec.

**Which episode wireframe is authoritative.** Pages 2 and 3 are two *alternate* treatments of the
same WC episode page. Page 3 shows an image-grid hero; page 2 shows a green audio-player card over
the galaxy. **Page 2 is the one that shipped** — `screen.css` carries the
"Green player card — elevated above galaxy" block, and `partials/audio-player-hero.hbs`
implements it. The derived spec cites **page 2**; page 3 is recorded as a rejected variant so a
future reader does not mistake it for drift. Confirming this before authoring is a Phase 3
prerequisite, not an assumption.

### 7.2 What a spec is

Assertions reference **tokens, never hex** — that is what lets one spec validate under both brands.

```yaml
surface: wc-episode
brand: wonder-cabinet
source: derived
authority: mockups/WonderCabinetWebsite-010725-pages-1440/page-3.png
viewports: [1280, 390]

structure:            # order checked against the a11y tree, not pixels
  [navbar, audio-player-hero, episode-notes, episode-links, cta, footer]

assertions:
  - id: notes-on-cream
    selector: .wc-episode-notes
    expect: { background-color: token(--wc-cream) }
  - id: notes-heading-accent
    selector: .wc-episode-notes h2
    expect: { color: token(--show-accent-text) }
  - id: single-h1
    query: count(h1) == 1
```

### 7.3 `tokens.json` — three tiers, three authorities

| Tier | Contents | Authority |
|---|---|---|
| `brand` | the 3 official colors, Jost / EB Garamond pairing | `docs/wonder-cabinet/brand-guide.json` (from the PDF) |
| `derived` | `--wc-green-text`, `--wc-dark-green`, `--luminous-accent-*` | contrast math in multi-brand §4a |
| `scale` | spacing 8/16/24/40/64, type sizes, radii | the design system |

This makes G3 meaningful: a color in none of the three tiers is **brand drift**; a spacing value
off the scale is **system drift**. Different findings, different owners.

`tokens.json` is **generated** — seeded from `brand-guide.json` and `:root` — never hand-typed.
Hand-typing the palette into a fourth document is precisely how three documents came to hold it.

### 7.4 Provisional goldens for the remaining surfaces

```yaml
surface: wc-contact
brand: wonder-cabinet
kind: provisional-golden
approved: 2026-07-26
approver: mark
rationale: "Matches wireframe CTA styling; focus rings green; no overflow at 390."
review-by: 2026-10-26
baseline: [contact-1280.png, contact-390.png]
```

`review-by` is the anti-rot mechanism for goldens. An expired approval reports as
**INFO: this standard is stale** rather than silently continuing to act like a standard. Goldens
decay by design; specs do not.

A golden is weak evidence and is labelled as such. It records *"we agreed this looks right on
this date, for this reason"* — not *"this is correct."* The date, approver, and rationale are what
separate it from circular baselining.

### 7.5 The Figma probe — timeboxed, runs first

Import `design-assets/site-design/wondercabinet.fig` (2.2 MB, Jan 2026), authenticate the Figma
MCP, and check for real variables, component variants, and auto-layout spacing. If present,
`tokens.json` and several component specs generate structurally instead of by transcription. If
it is flat artboards — the common brand-agency handoff — abandon within the timebox. The point is
not to assume either outcome.

### 7.6 Retiring the competing authorities

| Doc | Fate |
|---|---|
| `design-contract/` | **new** — machine-readable authority: tokens, specs, surfaces |
| `docs/multi-brand-design-system.md` | **keep** — the human architectural contract; explains *why* |
| `docs/wonder-cabinet/brand-guide.md`, `docs/luminous/brand-guide.md` | **keep** — canonical brand distillations |
| `docs/wonder-cabinet/brand-guide.json` | **keep**, fix the dead `source_path` — it seeds the brand tier |
| `design-assets/site-design/DESIGN_SYSTEM.md` | **retire** — Jan 2025, duplicate palette, claims sole primacy |

---

## 8. Phase 4 — The engine

Contract: on-demand, produces ranked proposals, never blocks a merge, never writes `verified`.

### 8.1 Preconditions (hard refusals)

The engine will not run unless `reference-check` passes, the **fixture self-test passes**, and all
outstanding mechanical findings are resolved or explicitly waived. Judgment cannot be layered on
an unvalidated harness, and agents must not spend attention rediscovering what a grep already
found.

### 8.2 Pass 1 — composition, one agent per specced surface

Input: the surface spec (or golden), a11y-tree snapshot and screenshot at both viewports, the
authority image where derived, `tokens.json`, `.impeccable.md`, and an explicit non-goal —
*report nothing the mechanical checks already cover.*

Findings carry a citation class:

- **A** — cites a failed spec assertion ID
- **B** — cites a wireframe region or a brand-guide clause
- **C** — heuristic judgment, no citation

Because ground truth was expanded first, most findings land in A or B. C is the residue and the
only class required to clear the refutation bar.

### 8.3 Pass 2 — components, targeted by evidence

Triggered only by: a component named in a pass-1 finding, a component with an outstanding
mechanical violation, or a component whose CSS section appears in the diff under review.

One agent owns one component across both brands, both viewports, and all its states from
`components.json` — brand and viewport are inner loops, not additional agents. Cost scales with
what is actually wrong rather than with matrix size.

### 8.4 Refutation

Every C-class finding goes to three skeptics with **different lenses**, prompted to refute, with
*refuted* as the default:

- **spec** — is there a clause this violates, or is this preference?
- **user-impact** — would a listener notice or be impeded?
- **cost** — is the fix proportionate, or a rewrite dressed as a nit?

Survives at ≥2 of 3. Diverse lenses rather than three identical refuters: perspective catches
failure modes redundancy cannot.

### 8.5 Coherence synthesizer

Runs last, sees everything. Its input is **data, not opinions**: every computed `border-radius`,
`font-size`, `gap`, `box-shadow`, and `transition-duration` harvested across all surfaces, plus
all findings. It reports near-duplicate values (23px beside 24px), variant proliferation (five
button treatments), and cross-surface inconsistency.

These are mechanical detections no single-component agent can make by construction. This is the
component that prevents fan-out from producing locally-good, globally-incoherent results.

### 8.6 Output

Ranked proposals, each carrying: citation class and citation, surfaces affected, refutation
verdict (n survived / n), proposed change, and blast radius (shared component? both brands?).
Proposals go to the ledger — never to a merge decision.

---

## 9. Ledger, human gates, cadence

### 9.1 `planning/design-findings.json`

Stable IDs, surviving sprint boundaries:

```json
{ "id": "DF-001", "opened": "2026-07-26", "surface": "all",
  "component": "navbar", "class": "B",
  "citation": "multi-brand-design-system.md §7 — deferred design question",
  "summary": "Should .wc-head-subscribe adopt the per-page brand accent or stay WC-green site-wide?",
  "refutation": { "lenses": 3, "survived": 3 },
  "status": "open", "decidedBy": null, "decidedOn": null, "featureRef": null }
```

`status` ∈ `open | accepted | rejected | fixed | deferred`. Accepted findings become
`features.json` entries via `featureRef`.

DF-001 is the `.wc-head-subscribe` question, currently deferred simultaneously in the QA
checklist §B, multi-brand §7, and `progress.md`. It becomes one record with an owner and a state.

### 9.2 Human gates (hard stops)

1. Approve the two authored Luminous specs — design decisions, not agent output
2. Approve each provisional golden — blessing current state must be conscious
3. Triage engine proposals — accept / reject / defer each
4. `brand-guardian` gates any accepted proposal touching brand vocabulary

### 9.3 Cadence

| Trigger | Runs |
|---|---|
| PR touching shared `screen.css` rules, `partials/components/`, `audio-player.js`, or `--show-accent` | Gate |
| Every gate run | Fixture self-test (seconds; client-side injected) |
| On demand — before a sprint closes, or when a surface feels wrong | Engine |
| `review-by` expiry | Golden re-review |

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Fixture suite decays into a formality — fixtures kept passing by weakening them | Fixtures assert a *named* check fails; weakening a check to pass a fixture makes the fixture fail, not pass |
| Provisional goldens quietly become de-facto specs | `review-by` expiry downgrades them to INFO; the engine reports golden-backed findings at lower confidence |
| Authored Luminous specs encode agent invention rather than design intent | Human gate #1; `brand-guardian` review |
| Engine produces volume rather than signal | Pass 2 is evidence-targeted, not exhaustive; C-class requires refutation; preconditions block runs with open mechanical findings |
| `design-contract/` itself rots | It is the resolver's own input — `reference-check` validates its paths, selectors, and tokens on every gate run |
| User-scope agents pollute unrelated projects | Descriptions are WC-scoped; reversible one-file move |
| Baselines captured from a dirty working tree | Manifest records `dirty` flag; preflight reports drift distance before any result |

---

## 11. Sequencing

Hard order. Each phase gates the next.

```
Phase 1  Reference integrity      → nothing else can be trusted without it
Phase 2  Gate + fixtures          → proves verification works before anything relies on it
Phase 3  Ground truth             → gives the engine something to cite
Phase 4  Engine                   → judgment, last, on a validated foundation
```

Phase 3 contains the largest block of human time: authoring two Luminous surface specs is genuine
design work, not transcription.

The ordering is the point. The original process ran the equivalent of Phase 4 first, on an
unvalidated harness, with two of five reviewer roles undispatchable — and certified a sprint whose
central feature was broken.

**On plan granularity.** This spec is deliberately larger than one implementation plan. Phases 1
and 2 are mechanical and can share a plan. Phase 3 contains a human design gate and should be its
own. Phase 4 depends on Phase 3's output existing, so its plan cannot be written accurately until
the specs are authored. Expect three plans, not one — writing a single plan across all four would
require inventing Phase 4 detail that Phase 3 has not yet determined.

---

## 12. References

- `docs/luminous/cross-brand-qa-checklist.md` — current merge gate; becomes the human-readable companion to `design-contract/`
- `docs/multi-brand-design-system.md` — architectural contract (§4 token indirection, §5 decision tree, §6 asymmetry)
- `docs/superpowers/specs/2026-07-25-wc-theme-qa-harness-design.md` — the harness this revises
- `docs/superpowers/specs/2026-06-08-luminous-branding-workplan-design.md` — umbrella spec; its Sprint 3 is superseded here
- `planning/TRIAGE.md` — severity/category model for findings that become issues
- `~/Developer/wonder-cabinet/.claude/agents/brand-guardian.md` — intent authority
- `agent-browser skills get core --full` — version-matched CLI reference (0.33.0)
