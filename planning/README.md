# Planning

## Current State

**Mode**: Maintenance
**Last Session**: 2026-01-30 — Sprint prioritization + feedback triage process
**Upstream**: Fork of [TryGhost/Episode](https://github.com/TryGhost/Episode)

## Quick Links

- Backlog: [`backlog.md`](backlog.md) — prioritized maintenance items
- Triage process: [`TRIAGE.md`](TRIAGE.md) — how feedback is categorized, validated, and routed
- Progress log: [`progress.md`](progress.md) — session handoff notes

## Backlog Summary

| Priority | Count | Focus |
|----------|-------|-------|
| High | 3 | Accessibility, mobile responsiveness, audio player resilience |
| Normal | 4 | Upstream reconciliation, dependency updates, platform monitoring |
| Low | 5 | Technical debt, build system hygiene, unused CSS |

**Recommended next session**: Accessibility + Mobile audit (combine — overlapping methodology)

## Issue Tracking

New bugs and feedback are filed as **GitHub Issues** on [`Wonder-Cabinet-Productions/wonder-cabinet-episode`](https://github.com/Wonder-Cabinet-Productions/wonder-cabinet-episode) with category labels (`css`, `hbs`, `audio`, `platform`, `a11y`, `mobile`, `feature`, `content`) and severity labels (`S1-critical`, `S2-major`, `S3-minor`, `S4-enhancement`). See [`TRIAGE.md`](TRIAGE.md) for the full process.

## Project Context

Wonder Cabinet is a custom Ghost podcast theme forked from the official Episode theme. Development alternates between:

1. **Brand customization** — Implementing the Wonder Cabinet design system
2. **Upstream reconciliation** — Merging changes from TryGhost/Episode
3. **Platform maintenance** — Adapting to Ghost CMS updates and Ghost(Pro) hosting constraints

## Key Decisions

| Decision | Choice | Date | Rationale |
|----------|--------|------|-----------|
| Image format | PNG/WebP via Ghost Admin | 2026-01-30 | Ghost(Pro) corrupts SVG UTF-8 encoding |
| Audio player | WaveSurfer.js v7 (CDN) | Initial | Rich waveform visualization, not bundled |
| Typography | Jost + EB Garamond | Initial | Brand spec (Futura/Garamond alternatives via Google Fonts) |
| Build system | Gulp (inherited from Episode) | Initial | Upstream compatibility |
| Issue tracking | GitHub Issues + backlog.md | 2026-01-30 | Traceability + agent-readable working doc |
