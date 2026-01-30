# Triage Process

Standardized process for handling feedback and bugs on the live Wonder Cabinet theme.

---

## Issue Tracking: GitHub Issues + backlog.md

**GitHub Issues** are the primary intake for bugs and feedback. They provide traceability, linking, and a public record.

**`backlog.md`** remains the working document agents read at session start. Items are synced from GitHub Issues into the backlog with a reference link.

### Bridge Rules

- **New bug from feedback**: Create a GitHub Issue first (with labels), then add a backlog entry linking to it.
- **Existing backlog item without an issue**: When an agent triages it, create a GitHub Issue via `gh issue create` and link back in `backlog.md`.
- **Completing an item**: Close the GitHub Issue and mark the backlog checkbox. Move to the Completed section.

### Backlog Entry Format

```
- [ ] **[YYYY-MM-DD]** [S#/category] Description - source ([#123](url))
  - Validation notes (added by triaging agent)
```

Example:
```
- [ ] **[2026-02-05]** [S2/css] Episode list cards missing green border on Safari - user feedback ([#7](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode/issues/7))
  - Validated: `.wc-list-item` border clipped by overflow:hidden on parent
```

---

## Issue Categories

Bounded by Ghost theme scope — if an issue falls outside these categories, it's not a theme bug.

| Category | Label | Examples |
|----------|-------|---------|
| Visual/CSS | `css` | Wrong color, broken layout, misaligned element |
| Template Logic | `hbs` | Missing content, wrong conditional, broken partial |
| Audio Player | `audio` | Won't play, waveform missing, CORS error |
| Ghost Platform | `platform` | Admin setting broken, image corruption, deploy failure |
| Accessibility | `a11y` | Missing alt text, poor contrast, keyboard trap |
| Responsive | `mobile` | Overflow, unreadable text, untappable buttons |
| Feature Request | `feature` | New custom setting, new template, new component |
| Content Edge Case | `content` | Long title overflow, missing feature image handling |

---

## Severity Levels

| Level | Label | Definition | Response |
|-------|-------|------------|----------|
| S1 | `S1-critical` | Theme broken for all visitors, deploy failed, audio player down | Same-day hotfix |
| S2 | `S2-major` | Significant issue on common user path, broken on mobile, key component failing | Next maintenance session |
| S3 | `S3-minor` | Cosmetic issue, edge case, spacing off-spec | Backlog (normal priority) |
| S4 | `S4-enhancement` | Feature request, nice-to-have improvement | Backlog (low priority, no SLA) |

---

## Triage Flow

```
REPORTED → CATEGORIZE (assign category label + severity label)
    → VALIDATE (Spectral Engineer reproduces)
        → Cannot reproduce → Close with note
        → Confirmed → ROUTE:
            S1 → Hotfix branch (see below)
            S2 → High Priority backlog, next maintenance session
            S3 → Normal Priority backlog
            S4 → Low Priority backlog
            Upstream issue → Note with [upstream] tag, link to TryGhost/Episode
```

---

## Agent Routing

| Category | Primary Agent | Notes |
|----------|--------------|-------|
| `css` | Spectral Engineer | CSS specificity conflicts, shared-theme-asset overrides |
| `hbs` | Spectral Engineer → The Drone | SE diagnoses, Drone implements |
| `audio` | Spectral Engineer + Code Troubleshooter | SE for rendering/UI states, CT for JS logic |
| `platform` | The Fixer | Ghost(Pro) hosting, deploy pipeline, CMS compatibility |
| `a11y` | Spectral Engineer | ARIA, contrast, keyboard navigation |
| `mobile` | Spectral Engineer | Responsive CSS, 767px breakpoint coverage |
| `feature` | Spectral Engineer (design) → The Drone (implement) | Design-first per brand guide |
| `content` | Spectral Engineer | Template edge cases, content overflow |

---

## S1 Hotfix Process

For critical issues that break the site for all visitors:

1. **Branch** from `main`: `hotfix/brief-description`
2. **Fix** the issue
3. **Build**: `npx gulp build`
4. **Test**: `npm run test` (GScan validation)
5. **Commit** with `fix:` prefix
6. **Merge** to `main` (auto-deploys to Ghost(Pro))
7. **Log** in `progress.md`, mark complete in `backlog.md`, close GitHub Issue

---

## Sprint Promotion Trigger

When **3+ related issues** accumulate in the same category:

1. Create `planning/sprints/current/design.md` and `features.json`
2. Move related items from backlog into sprint features
3. Assign agent team and execute per sprint conventions

This transitions the work from **maintenance mode** to a **sprint** for that cluster of issues.

---

## Backlog Hygiene Cadence

| Frequency | Action |
|-----------|--------|
| **Each session** | Mark completed items, add new validated issues |
| **Monthly** | Full review — delete items completed >30 days ago, reassess stale items >60 days |
| **Quarterly** | Upstream check: fetch TryGhost/Episode, check shared-theme-assets releases, test latest Ghost CMS |
