# Backlog

Maintenance items and future work for the Wonder Cabinet theme.

## Upstream Reconciliation

- [ ] Check TryGhost/Episode for updates since fork
- [ ] Evaluate shared-theme-assets v2 updates
- [ ] Reconcile any upstream template changes with brand customizations

## Design & UX

- [ ] Audit mobile responsiveness across all templates
- [ ] Review audio player behavior on slow connections
- [ ] Validate accessibility (ARIA labels, contrast ratios, keyboard nav)

## Technical Debt

- [ ] Consider bundling audio-player.js (currently loaded separately)
- [ ] Audit CSS for unused rules inherited from Episode base
- [ ] Evaluate whether Gulp build can be replaced with Rollup (AGENTS.md references Rollup but actual build uses Gulp)

## Ghost Platform

- [ ] Monitor Ghost(Pro) SVG handling (current workaround: PNG/WebP via Admin)
- [ ] Test with future Ghost CMS major versions
- [ ] Review custom settings coverage (any new brand elements needing admin controls?)
