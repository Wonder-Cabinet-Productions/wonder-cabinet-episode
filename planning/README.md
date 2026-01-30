# Planning

## Current State

**Mode**: Maintenance
**Last Session**: 2026-01-30 by Agent (image serving fix)
**Upstream**: Fork of [TryGhost/Episode](https://github.com/TryGhost/Episode)

## Quick Links

- Progress log: `progress.md`
- Backlog: `backlog.md`

## Project Context

Wonder Cabinet is a custom Ghost podcast theme forked from the official Episode theme. Development alternates between:

1. **Brand customization** - Implementing the Wonder Cabinet design system
2. **Upstream reconciliation** - Merging changes from TryGhost/Episode
3. **Platform maintenance** - Adapting to Ghost CMS updates and Ghost(Pro) hosting constraints

## Key Decisions

| Decision | Choice | Date | Rationale |
|----------|--------|------|-----------|
| Image format | PNG/WebP via Ghost Admin | 2026-01-30 | Ghost(Pro) corrupts SVG UTF-8 encoding |
| Audio player | WaveSurfer.js v7 (CDN) | Initial | Rich waveform visualization, not bundled |
| Typography | Jost + EB Garamond | Initial | Brand spec (Futura/Garamond alternatives via Google Fonts) |
| Build system | Gulp (inherited from Episode) | Initial | Upstream compatibility |
