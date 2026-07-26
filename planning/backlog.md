# Backlog

Maintenance items and future work for the Wonder Cabinet theme, organized by priority tier.

**Triage process**: See [`TRIAGE.md`](TRIAGE.md) for how new issues are categorized, validated, and routed.

---

## High Priority

Directly affects listeners or creates legal/compliance exposure.

- [ ] **[2026-01-30]** [S2/a11y] Accessibility audit — ARIA labels, contrast ratios, keyboard navigation
  - Theme has partial a11y work; full WCAG 2.1 AA audit needed
  - Agent: Spectral Engineer

- [ ] **[2026-01-30]** [S2/mobile] Mobile responsiveness audit across all templates
  - Single 767px breakpoint may have gaps; podcast audiences are mobile-heavy
  - Agent: Spectral Engineer

- [ ] **[2026-01-30]** [S2/audio] Audio player behavior on slow connections
  - WaveSurfer.js loaded from CDN — review timeout handling, CORS fallback, error states
  - Agent: Spectral Engineer + Code Troubleshooter

---

## Normal Priority

Platform health and sustainability — no immediate user impact but affects long-term viability.

- [ ] **[2026-01-30]** [S3/platform] Check TryGhost/Episode upstream for updates since fork
  - `upstream` remote configured; 20+ commits diverged
  - Agent: The Fixer

- [ ] **[2026-01-30]** [S3/platform] Evaluate shared-theme-assets v2 updates (currently v2.5.2)
  - Base CSS dependency — newer versions may have fixes or breaking changes
  - Agent: The Fixer

- [ ] **[2026-01-30]** [S3/platform] Monitor Ghost(Pro) SVG handling
  - Known workaround in place (PNG/WebP via Admin); periodic check for platform fixes
  - Agent: The Fixer

- [ ] **[2026-01-30]** [S3/platform] Test with future Ghost CMS major versions
  - Forward compatibility check for Ghost 6.x when available
  - Agent: The Fixer

---

## Low Priority

Technical debt and hygiene — no user-facing impact.

- [ ] **[2026-01-30]** [S4/audio] Bundle audio-player.js into Gulp pipeline
  - Works fine unbundled (~20KB); marginal performance gain
  - Agent: The Drone

- [ ] **[2026-01-30]** [S4/css] Audit CSS for unused rules inherited from Episode base
  - ~2600-line screen.css; pure hygiene, no functional issue
  - Agent: The Drone

- [ ] **[2026-01-30]** [S4/platform] Evaluate Gulp vs Rollup build system
  - Low ROI; AGENTS.md doc mismatch is the real issue (references Rollup, build uses Gulp)
  - Agent: The Drone

- [ ] **[2026-01-30]** [S4/hbs] Reconcile upstream template changes with brand customizations
  - Depends on upstream check (Normal Priority) completing first
  - Agent: The Fixer

- [ ] **[2026-01-30]** [S4/hbs] Review custom settings coverage
  - 17 settings already defined in package.json; only needed if new features arise
  - Agent: Spectral Engineer

---

## Post-Luminous maintenance sprints

Open GitHub issues compiled into sequenced sprints to execute **after** the Luminous brand arc lands its combined deploy (PRs #46 + #53). Full sequencing, dependencies, and the disposition of Luminous-resolved/entangled issues live in the roadmap → [`post-luminous-roadmap.md`](post-luminous-roadmap.md). Promote one sprint at a time into `sprints/current/` per [`TRIAGE.md`](TRIAGE.md).

**Gate:** blocked until PRs #46 + #53 merge — that merge also closes #34/#51/#52 (verify-and-close batch in the roadmap).

### Hygiene micro-batch (sub-threshold — one maintenance session)

- [ ] **[2026-07-22]** [S4/hygiene] Delete orphaned `illustration-footer-cabinet-table.png` (only `.svg` referenced) - ([#42](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/42))
- [ ] **[2026-07-22]** [S4/hygiene] Delete orphaned favicon/app-icon set (Option A) - ([#41](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/41))
- [ ] **[2026-07-22]** [S4/docs] README: document highlight zones + featured-flag content workflow + tag-slug deps - ([#38](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/38))

### Sprint 4 — Homepage content-density & discovery UX (dependency-ordered)

- [ ] **[2026-07-22]** [S3/hbs] Fix highlight-zone double-render — `home.hbs` feed filter omits `island-of-knowledge` - ([#35](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/35))
- [ ] **[2026-07-22]** [S4/feature] Load More Episodes (Content API) — enabler; branch `feature/load-more-episodes` in progress - ([#24](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/24))
- [ ] **[2026-07-22]** [S4/enhancement] Content density — split newsletter highlight + 2nd featured box + ~6 episodes - ([#22](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/22))
- [ ] **[2026-07-22]** [S4/enhancement] Archive-page experiment — 2-wide + infinite scroll (reuses #24) - ([#23](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/23))
- [ ] **[2026-07-22]** [S4/enhancement] Consistent item count between highlight zones (unblocks post-deploy) - ([#39](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/39))

### Sprint 5 — Component wiring & membership (design-gated, last)

- [ ] **[2026-07-22]** [S4/feature] Wire `bracket-button` into live templates — WC-scoped (Luminous hides brackets) - ([#43](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/43))
- [ ] **[2026-07-22]** [S4/feature] Paid-membership upgrade surfaces (navbar/support prompt/Portal) — needs mockups - ([#33](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/33))

### Owned by the Luminous arc — not re-sprinted (see roadmap)

- #40 residual SVG greens → Luminous Sprint 2.2 · #37 Luminous tag-page spacing → Sprint 2 template variants · #29 `--wc-dark-green` brand decision → Sprint 3 Impeccable audit

---

## Recommended Execution Order

1. **Accessibility + Mobile audit** — combine into one session (overlapping methodology, same templates/CSS)
2. **Audio player slow-connection review** — separate session (JS-focused)
3. **Upstream reconciliation** — fetch, diff, document diverged changes
4. **Remaining items** as time allows, in tier order

---

## Multi-brand (Luminous) work — tracked as sprints

The Luminous brand integration runs as a 3-sprint arc, not maintenance backlog items. See the umbrella spec [`docs/superpowers/specs/2026-06-08-luminous-branding-workplan-design.md`](../docs/superpowers/specs/2026-06-08-luminous-branding-workplan-design.md) and per-sprint artifacts under [`planning/sprints/`](sprints/). The live backlog of refactor items lives in [`docs/multi-brand-design-system.md`](../docs/multi-brand-design-system.md) §9.

- [x] **Sprint 1 — Foundation & Correctness** (2026-06-08) — token correctness, `--show-accent` leak routing, audio-player tokenization, N-brand doc. See [`planning/sprints/1-foundation/`](sprints/1-foundation/).
- [ ] **Sprint 2 — Brand Switch** — show-scoping mechanism, `/luminous/` collection, asset migration, asymmetric elements, template variants.
- [ ] **Sprint 3 — Impeccable audit + dual UX testing** (collaborative).

---

## Completed

Items moved here after completion (retained for 30 days per hygiene cadence).

*(Sprint work tracked above and under `planning/sprints/`.)*
