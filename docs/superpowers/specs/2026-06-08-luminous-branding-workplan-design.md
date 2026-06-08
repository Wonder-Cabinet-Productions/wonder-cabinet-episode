# Luminous Branding Workplan — Design

**Date**: 2026-06-08
**Status**: Approved design (umbrella spec) — pending user review before implementation planning
**Scope**: Full brand-switch experience — `tag:luminous` pages render entirely in the Luminous (violet / eye-icon) brand inside the shared Wonder Cabinet Ghost theme.
**Repo**: `ghost-dev/content/themes/wonder-cabinet-episode` (the theme repo — all paths below are relative to it unless noted)

---

## 1. Context & the stranded-docs finding

Luminous is the second podcast sharing the Wonder Cabinet Ghost theme. The "initial planning docs" for integrating its branding already exist, but were **stranded in a closed PR**:

- **PR #44** (`feature/iok-theming`) was **closed without merging** on 2026-06-06.
- It contained two documents that are **not on `main`**:
  - `docs/luminous/brand-guide.md` — the Luminous brand translated to markdown (violet `#9A59FF`, eye-icon motif, Art & Sons, May 2026), mirroring `docs/wonder-cabinet/brand-guide.md`. Includes a "Stated Gaps vs. Wonder Cabinet" table (no cabinet illustration, no bracket ornaments — deliberately quieter brand).
  - `docs/multi-brand-design-system.md` — the architectural contract for how WC and Luminous coexist: a shared layer (cream, Jost/EB Garamond, spacing, audio player) vs. a per-brand layer (accent, hero, logo, dividers), a `--show-accent` token-indirection scheme, an agent decision tree, and a **10-item prioritized backlog**.

Partial plumbing *did* land on `main`: `index-luminous.hbs`, the `.wc-highlight--luminous` modifier, `home.hbs` filtering `tag:luminous` out of the main feed, and a `series-info` slug match. The drafted docs openly admit gaps — the violet token shipped as a `#D4A843` gold placeholder, derived contrast tokens are TBD, and the page-level scoping mechanism is undecided.

This workplan recovers that prior thinking and drives it through to the full brand-switch end state.

### Locked decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Target scope | **Full brand-switch experience** — all 10 backlog items + page-scoping + template variants + landing page |
| Agent team | **Fresh expertise-tuned roles** (not the original named personas) |
| Prior PR #44 docs | **Eval phase decides** foundation-vs-rederive per document; user approves before deeper work |
| Workplan structure | **Two-sprint split** at the architectural seam — *extended to three sprints* (see below) |
| Luminous landing-page URL | **Vanity `/luminous/` via `routes.yaml` collection** (reuses `index-luminous.hbs` as the collection template) |
| Third sprint | **`/impeccable:impeccable` audit + dual UX testing**, collaborative with human gates |

---

## 2. The agent team

Five expertise-tuned roles, each defined by **charter**, **inputs owned**, and the **actual subagent type it maps to** (so the plan is executable, not aspirational).

| Role | Charter | Owns (primary inputs) | Maps to |
|---|---|---|---|
| **Brand Translator** | Reads the Luminous brand PDF + raw asset drop and the WC brand guide; owns visual fidelity and the "genuinely Luminous vs. shared" calls. Produces/validates the brand-guide.md translation. | `Luminous_BrandGuide.pdf`, `LogoAssets/`, `WebsiteGraphics/`, WC brand-guide.md | `adhd-friendly-ui-designer` (design/UX lens) |
| **Ghost-Platform Specialist** | Owns "what's actually possible in Ghost" — handlebars helpers, `@custom` settings, routing/`routes.yaml`, tag-context, `package.json` config, gscan, the LXC mutagen dev loop. Reality-checks every proposed mechanism; holds a standing veto on anything that can't survive the gscan/deploy pipeline or the two-machine loop. | `docs/GHOST_THEME_REFERENCE.md`, `HANDLEBARS_HELPERS.md`, `ROUTES_CONFIG.md`, `package.json` | `the-fixer` |
| **a11y / Contrast Specialist** | Owns WCAG contrast for violet `#9A59FF` on cream; commissions the TBD `--luminous-accent-text` / `--luminous-accent-dark` derived tokens; keyboard/ARIA on new components. | brand colors, `screen.css` token block, live preview | `adhd-friendly-ui-designer` (a11y lens) |
| **Implementer** | Writes CSS/HBS/JS once a feature is specced and gated; clean, convention-matching edits; commits in the theme repo. | active `features.json` item, `screen.css`, partials | `the-drone` |
| **Cross-Brand QA** | Adversarial verifier. Before any shared-component change merges, proves it still renders correctly under **both** a WC-tagged and a Luminous-tagged page. Owns the cross-brand QA checklist (backlog #10). | live `https://wondercabinet.riechers.co`, chrome-devtools MCP | `code-reviewer` + `feature-dev:code-reviewer` |

**Routing principle** (carried from `planning/TRIAGE.md`): *design-first* — Brand Translator + a11y define the target, Ghost-Platform Specialist confirms feasibility, Implementer builds, Cross-Brand QA gates the merge.

---

## 3. The three sprints

The 10 backlog items from `multi-brand-design-system.md` map onto three sequential sprints. Order is **hard**: 1 → 2 → 3.

### Sprint 1 — Foundation & Correctness
*Goal: every brand-aware token and consumer is correct and routed through the indirection layer, with the live WC site provably unchanged. No page yet "becomes" Luminous.*

| Phase | Work | Lead | Backlog |
|---|---|---|---|
| **1.0 Eval triage** | Team reads both stranded docs + source assets; recommends foundation-vs-rederive **per doc**; user approves; recover/refine the two docs onto `main` as the working spec. | Brand Translator + Ghost Specialist | — |
| **1.1 Token correctness** | Fix `--luminous-accent` `#D4A843`→`#9A59FF` (`screen.css` line 20). Commission + define TBD derived tokens `--luminous-accent-text` / `--luminous-accent-dark` for WCAG-AA violet-on-cream. | a11y Specialist | #1, #6 |
| **1.2 Indirection plumbing** | Route the ~22 rules leaking raw `--wc-green` through `--show-accent`. Tokenize audio-player JS (read `--show-accent` at init). Tokenize SVG fills (`currentColor`/CSS masking). *(Three independent tasks — parallelizable.)* | Implementer | #2, #3, #4 |
| **1.3 Prove-both-brands** | Author the cross-brand QA checklist; verify WC renders **pixel-stable**; verify highlight-zone Luminous bits now show true violet. | Cross-Brand QA | #10 |

**Why safe to ship first:** routing `--wc-green` → `--show-accent` is a *no-op for WC*, because `--show-accent` defaults to `var(--wc-green)`. Sprint 1 changes plumbing without changing the rendered WC site.

**Gate:** WC pixel-stable (visual diff) + gscan green + violet correct in highlight zones + contrast tokens defined.

### Sprint 2 — Brand Switch
*Goal: a `tag:luminous` page (and the `/luminous/` collection) renders fully in the violet / eye-icon brand; WC stays untouched.*

| Phase | Work | Lead | Backlog |
|---|---|---|---|
| **2.0 Scoping mechanism** | Decide body-class vs. handlebars helper (Ghost Specialist owns the call); implement page-level brand activation in `default.hbs`; route CSS cascade + JS + partials through the single source of truth. **The keystone.** | Ghost Specialist → Implementer | #5 |
| **2.1 Asset migration** | Adopt `assets/images/{shared,wc,luminous}/`; copy + normalize the Art & Sons exports (casing/underscores); wire asset slots to read brand context. Update `.impeccable.md`. | Implementer | #7, #8 |
| **2.2 Asymmetric elements** | Conditionally render per multi-brand §6: hide cabinet illustration + bracket ornaments under Luminous; enable wavy-SVG hero, dashed separator, eye-icon favicon for Luminous. | Brand Translator → Implementer | (§6) |
| **2.3 Collection + template variants** | Define the `/luminous/` `routes.yaml` collection (`filter: tag:luminous`, `paginate`, permalink); author the **permalink/redirect strategy**; repurpose `index-luminous.hbs` as the **paginating** collection template (iterate route `posts`, remove `count="all"`); build `post-luminous.hbs`. | Ghost Specialist → Implementer | #9 |
| **2.4 Full cross-brand QA** | Mock a Luminous-tagged post + a WC post side-by-side; run the checklist under both; a11y pass on violet pages; gscan; deploy. | Cross-Brand QA | #10 |

**Hard dependency:** 2.0 is the gate for everything after it — backlog #5 says brand-specific styling beyond the highlight-zone modifier must be avoided in PRs until the scoping mechanism exists. 2.1–2.3 cannot start until 2.0 lands. This single dependency is the reason for the sprint boundary.

**`/luminous/` collection implications** (all owned by Ghost-Platform Specialist):
- `routes.yaml` is **not in the theme repo** — it lives in `content/settings/routes.yaml` on the LXC and uploads via Ghost Admin (Labs). Tracked as a mirror (see §4).
- A collection **reassigns canonical URLs** — Luminous posts move from `/{slug}/` to `/luminous/{slug}/` site-wide → requires a redirect strategy + SEO check.
- `index-luminous.hbs` is **repurposed, not retired**, as the collection index template. Pagination rule (below) applies.

**Pagination rule (the gotcha):** the episode archive must iterate the **route-provided `posts`** collection (`hasPagination=true` path in `partials/components/list.hbs`) so Ghost's pagination + `pagination.hbs` work. It must **not** be built with a hand-rolled `{{#get "posts" filter="tag:luminous"}}` block — that fetches a fixed slice and silently opts out of route pagination. Hero/services zones may use `{{#get}}`; the paginated list may not.

**Gate:** Luminous pages fully branded + working pagination + WC unchanged + redirects live + gscan green → merge to `main` → Actions deploys.

### Sprint 3 — Impeccable audit + dual UX testing *(collaborative, gated)*
*Goal: harden and polish the now-live brand switch with expert + human review. Depends on Sprint 2 being live.*

| Phase | Work | Mode |
|---|---|---|
| **3.0 Impeccable audit** | Run `/impeccable:impeccable` across Luminous surfaces (collection/landing, episode page, cross-brand shared components) — visual hierarchy, IA, cognitive load, a11y, motion, anti-patterns. | Agent-driven |
| **3.1 Collaborative triage** | Walk recommended changes through with the user — accept / defer / reject each. Accepted items become `features.json` entries. | **Collaborative gate** |
| **3.2 Expert-agent UX test** | UX-expert agent pass — task-flow walkthrough, friction points, brand coherence under both contexts. | Agent-driven |
| **3.3 User UX test** | User drives the live site; feedback triaged via `TRIAGE.md` severity/category process into fix items. | **Human-in-the-loop gate** |
| **3.4 Polish + close** | Implement accepted fixes, final cross-brand QA, gscan, deploy. | Build team |

---

## 4. Artifacts & conventions

Reuse the existing sprint machinery (`planning/sprints/.../design.md` + `features.json` from `TRIAGE.md`), keep canonical reference docs in `docs/`, and solve the out-of-repo `routes.yaml` gap with a tracked mirror.

### File layout (theme repo)

```
ghost-dev/content/themes/wonder-cabinet-episode/
├── docs/
│   ├── luminous/
│   │   ├── brand-guide.md                ← recovered from PR #44 (Sprint 1.0)
│   │   └── cross-brand-qa-checklist.md   ← authored Sprint 1.3 (backlog #10)
│   ├── multi-brand-design-system.md      ← recovered from PR #44 (Sprint 1.0) — the contract
│   ├── routes-luminous.reference.yaml    ← tracked MIRROR of the live LXC routes.yaml (Sprint 2)
│   └── superpowers/specs/
│       └── 2026-06-08-luminous-branding-workplan-design.md   ← THIS umbrella spec
└── planning/sprints/
    ├── 1-foundation/      { design.md, features.json }
    ├── 2-brand-switch/    { design.md, features.json }
    └── 3-impeccable-ux/   { design.md, features.json }
```

Two layers of doc: this **umbrella spec** defines the team, the three-sprint arc, and conventions once; **each sprint's `design.md` + `features.json`** is authored at that sprint's kickoff with current-state-accurate detail (matching `TRIAGE.md`'s sprint convention — named sprint dirs instead of a single `current/`, with the in-flight one treated as current).

### `features.json` schema

Each backlog item / audit finding becomes one feature encoding its owning role and acceptance criteria, dispatchable straight from the file:

```json
{
  "id": "S1-01",
  "title": "Fix --luminous-accent #D4A843 → #9A59FF",
  "sprint": 1, "phase": "1.1",
  "lead": "a11y-specialist",
  "backlogRef": "multi-brand #1",
  "acceptance": "screen.css line 20 is #9A59FF; highlight-zone renders violet; gscan green",
  "status": "pending", "blockedBy": []
}
```

The 5 role→subagent mappings live once here (§2); `features.json` references them by the short `lead` key.

### Other conventions
- **`routes.yaml` mirror:** `docs/routes-luminous.reference.yaml` is a tracked, reviewable copy of the intended collection config. The live LXC file is outside git; the Ghost-Platform Specialist owns keeping them in sync. Documented mirror, not enforced.
- **GitHub Issues bridge (optional):** per `TRIAGE.md`, file labelled issues on `Wonder-Cabinet-Productions/wonder-cabinet-episode` for anything that outlives a sprint or needs public traceability; `features.json` is the in-sprint working set. Not every feature needs both.
- **Metarepo cleanup:** `planning/backlog.md` (metarepo root) still says *"Merge PR #44"* — superseded (PR closed, docs recovered via Sprint 1.0). Replace that line with a pointer to this spec.

---

## 5. Orchestration, gates, success criteria & risk

### How the team runs

| Sprint | Runner | Rationale |
|---|---|---|
| **1 — Foundation** | Coordinator-driven (The Conductor or sequential `Agent` dispatch); **1.0 eval triage as a `Workflow` fan-out** (roles read sources in parallel, return per-doc recommendations, synthesized for approval); 1.2's three tokenization tasks run parallel. | Autonomous-capable; parallelism safe (no-op for WC). |
| **2 — Brand Switch** | Coordinator-driven but **linear** — 2.0 keystone gate forbids fan-out until scoping lands. | Hard dependency. |
| **3 — Impeccable + UX** | **Manual dispatch, human-in-the-loop**; `/impeccable:impeccable` is the audit engine; no autonomous runner. | Collaborative by design. |

### Human gates (hard stops)
1. **After 1.0** — approve foundation-vs-rederive per doc.
2. **End of Sprint 1** — approve foundation merge against a WC pixel-diff proof.
3. **In 2.0** — approve the scoping decision (body-class vs. handlebars helper) **and** the permalink/redirect strategy (SEO blast radius).
4. **End of Sprint 2** — approve the brand switch going live.
5. **3.1 & 3.3** — collaborative triage + user UX pass.

### Success criteria
- **Sprint 1:** every brand-aware consumer routes through `--show-accent`; WC renders **pixel-identical** (visual diff gate); violet correct + WCAG-AA contrast tokens defined; gscan green.
- **Sprint 2:** a `tag:luminous` post + the `/luminous/` collection render fully in the violet/eye-icon brand **with working pagination**; WC untouched; redirects live; `routes-luminous.reference.yaml` committed; gscan green.
- **Sprint 3:** impeccable findings triaged with the user; expert **and** human UX passes done; accepted fixes shipped; final cross-brand QA green.
- **Overall DoD:** both brands coexist per the multi-brand contract; the §5 decision tree of `multi-brand-design-system.md` holds in the actual code; adding a 3rd show is the documented mechanical path (its §10).

### Risk register
| Risk | Mitigation |
|---|---|
| Collection permalink reassignment breaks existing Luminous URLs (SEO) | Redirect strategy authored in 2.3; human gate #3 |
| A mis-routed `--wc-green` rule visually regresses WC | Pixel-diff gate in 1.3 before Sprint 1 merges |
| SVG `currentColor` tokenization changes rendering where fill did double-duty | Per-asset QA in 1.2 |
| Two-machine `routes.yaml` drift (live LXC vs. intent) | Ghost Specialist owns the tracked mirror |

---

## 6. Backlog → sprint/phase mapping

| # | Backlog item (from `multi-brand-design-system.md`) | Sprint.Phase |
|---|---|---|
| 1 | `--luminous-accent` `#D4A843` → `#9A59FF` | 1.1 |
| 2 | Route ~22 leaking `--wc-green` through `--show-accent` | 1.2 |
| 3 | Tokenize audio-player waveform colors | 1.2 |
| 4 | Tokenize SVG asset fills | 1.2 |
| 5 | Global show-scoping mechanism | 2.0 |
| 6 | Commission Luminous derived contrast tokens | 1.1 |
| 7 | Copy/normalize Luminous assets into `assets/images/luminous/` | 2.1 |
| 8 | Update `.impeccable.md` for finalized Luminous brand | 2.1 |
| 9 | Luminous template variants + landing page (now the `/luminous/` collection) | 2.3 |
| 10 | Cross-brand QA checklist | 1.3 (authored), 2.4 + 3.4 (applied) |

---

## 7. Source references
- Stranded docs (recover from `git show pr44:<path>`): `docs/luminous/brand-guide.md`, `docs/multi-brand-design-system.md` (branch `feature/iok-theming`, closed PR #44)
- Brand source of truth: `design-assets/site-design/Luminous-Brand-Web-Podcast/Luminous_BrandGuide.pdf` (+ `.ai`, LogoAssets, WebsiteGraphics, PodcastGraphics) — at the **metarepo root**
- Existing conventions: `planning/TRIAGE.md` (agent routing, sprint promotion), `docs/ROUTES_CONFIG.md` (routes.yaml), `CLAUDE.md` (build commands, custom settings, LXC dev loop)
- Existing partial plumbing: `index-luminous.hbs`, `home.hbs` (luminous filter + highlight zone), `partials/components/highlight-zone.hbs`, `partials/components/series-info.hbs`, `.wc-highlight--luminous` (`screen.css`)
