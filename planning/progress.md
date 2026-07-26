# Progress Log

Session handoff notes for continuity between work sessions.

---

## 2026-06-08 - Sprint 1: Luminous Foundation & Correctness

**Agent**: Multi-role team (Brand Translator, Ghost-Platform Specialist, a11y Specialist, Implementer, Cross-Brand QA)
**Summary**: First sprint of the Luminous multi-brand arc. Made every brand-aware token + consumer correct and routed through `--show-accent*`, with the live WC site provably unchanged. Only intended visual change: the "From Luminous" highlight card is now violet.

### What was done
- **Eval triage** (3 specialist agents) of the two PR #44 docs vs. the primary brand source → recovered `docs/luminous/brand-guide.md` as foundation; **re-derived `docs/multi-brand-design-system.md` as N-brand** (WC + Luminous + IoK).
- **Tokens**: `--luminous-accent` `#D4A843`→`#9A59FF`; added `--luminous-accent-text-on-cream` `#8B4DEB` (AA 4.62:1) and `--luminous-accent-dark` `#1F0F33`.
- **CSS**: routed 38 shared-component `--wc-green*` leaks → `--show-accent*` (no-op for WC).
- **JS**: audio player progress/cursor colors now read `--show-accent` at init (fallback `#10A544`).
- **QA**: authored `docs/luminous/cross-brand-qa-checklist.md`; gscan green; live-verified on wondercabinet.riechers.co (WC green unchanged, Luminous card violet, IoK steel-blue unchanged).
- Sprint artifacts under `planning/sprints/1-foundation/`.

### Context for next session
- **Discovery**: IoK is a third brand already in the theme (accent-only). The architecture is now documented as N-brand.
- **Deferred**: SVG fill tokenization → Sprint 2.2; `.wc-head-subscribe` navbar-accent decision → Sprint 2/3 (open design question).
- **Sprint 2 (Brand Switch)** is next: the page-level show-scoping mechanism is the keystone — nothing else in Sprint 2 starts until it lands. Then the `/luminous/` `routes.yaml` collection (note: routes.yaml lives on the LXC, not the theme repo — mirror at `docs/routes-luminous.reference.yaml`).
- `assets/built/screen.css` was rebuilt by the CT and synced back — committed alongside source.

---

## 2026-01-30 - Sprint Prioritization + Feedback Triage

**Agent**: Planning session
**Summary**: Restructured backlog with priority tiers and established a triage process for routing live-site feedback.

### What was done
- Restructured `backlog.md` with High/Normal/Low priority tiers, severity/category tags, dates, and agent assignments
- Created `TRIAGE.md` documenting the full triage process: categories, severity levels, routing table, hotfix process, sprint promotion trigger, and hygiene cadence
- Updated `README.md` with backlog summary counts, issue tracking reference, and triage link
- Created GitHub Issue labels: category labels (`css`, `hbs`, `audio`, `platform`, `a11y`, `mobile`, `feature`, `content`) and severity labels (`S1-critical`, `S2-major`, `S3-minor`, `S4-enhancement`)
- Established dual-track issue management: GitHub Issues for intake/traceability, `backlog.md` as agent-readable working document

### Context for next session
- Recommended first action: Combined accessibility + mobile responsiveness audit (High Priority)
- All 12 original backlog items preserved and tagged — no items dropped
- Existing backlog items don't yet have GitHub Issues — agents should create them during triage per `TRIAGE.md` bridge rules
- Theme is in maintenance mode; sprint artifacts only created if 3+ related issues cluster

---

## 2026-01-30 - Repository Modernization

**Agent**: The Fixer
**Summary**: Added planning infrastructure, git hooks, and workspace manifest registration.

### What was done
- Populated `planning/` with README.md, progress.md, backlog.md
- Created `.githooks/commit-msg` delegating to the-lodge shared hook
- Registered in `forerunner_repos.json` as a fork-origin theme

### Context for next session
- Theme is functionally complete for initial launch
- Recent fix addressed Ghost(Pro) SVG corruption by switching to PNG/WebP served via Ghost Admin
- `assets/built/` must always be committed (Ghost serves from there)

---

## 2026-01-30 - Image Serving Fix

**Agent**: Development session
**Summary**: Fixed Ghost(Pro) UTF-8 corruption of SVG images.

### What was done
- Converted critical SVG assets to PNG/WebP
- Updated templates to reference Ghost Admin-uploaded images
- Trimmed unused images from theme package

### Context for next session
- SVG bracket corners still in repo (used via CSS `background-image`, not affected by Ghost(Pro) corruption)
- Galaxy background, logo, and title graphic now served as PNG/WebP via Ghost Admin

---
