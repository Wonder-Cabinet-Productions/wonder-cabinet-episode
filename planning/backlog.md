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

## Recommended Execution Order

1. **Accessibility + Mobile audit** — combine into one session (overlapping methodology, same templates/CSS)
2. **Audio player slow-connection review** — separate session (JS-focused)
3. **Upstream reconciliation** — fetch, diff, document diverged changes
4. **Remaining items** as time allows, in tier order

---

## Completed

Items moved here after completion (retained for 30 days per hygiene cadence).

*(none yet)*
