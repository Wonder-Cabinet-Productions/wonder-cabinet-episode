# Sprint 1 — Luminous Foundation & Correctness

**Status**: Complete (2026-06-08)
**Umbrella spec**: [`docs/superpowers/specs/2026-06-08-luminous-branding-workplan-design.md`](../../../docs/superpowers/specs/2026-06-08-luminous-branding-workplan-design.md)
**Branch**: `sprint/1-luminous-foundation`

## Goal

Make every brand-aware token and consumer correct and routed through the `--show-accent*` indirection layer, **leaving the live Wonder Cabinet site pixel-identical**. No page "becomes" Luminous yet — that is Sprint 2. The only intended visual change: the homepage "From Luminous" highlight card turns from gold to true violet.

## Principle encoded this sprint

> **Shared component → `--show-accent*`. WC-only decorative vocabulary or always-WC surface → leave raw `--wc-*`.**
> Routing a shared rule to `--show-accent` is a visual no-op for WC (the token defaults to `var(--wc-green)`), but lets Sprint 2 flip a whole page to violet by overriding three tokens.

## What shipped

| Phase | Work | Result |
|---|---|---|
| 1.0 | Eval triage (3 specialist agents) + doc recovery | `brand-guide.md` recovered as **foundation**; `multi-brand-design-system.md` **re-derived as N-brand** (WC + Luminous + IoK). User-gated. |
| 1.1 | Token correctness | `--luminous-accent` `#D4A843`→`#9A59FF`; added `--luminous-accent-text-on-cream` `#8B4DEB` (AA 4.62:1) + `--luminous-accent-dark` `#1F0F33`. Contrast math in multi-brand doc §4a. |
| 1.2a | CSS leak routing | 38 `var(--wc-green*)` refs in shared components → `--show-accent*`. WC-only surfaces left raw. |
| 1.2b | Audio-player JS | `progressColor`/`cursorColor` now read `--show-accent` at init (fallback `#10A544`); `waveColor` (cream) unchanged. |
| 1.3 | Cross-brand QA | `cross-brand-qa-checklist.md` authored; gscan green; live verification on `wondercabinet.riechers.co`. |

## Key discovery

**There is a third brand already in the theme** — Island of Knowledge (`--iok-accent #b6d0d8`, `.wc-highlight--series`), participating at *accent-only* level (a highlight-zone card within WC pages, no page-level switch). This reshaped the architecture contract into an **N-brand** model distinguishing *accent-only* participation from *full brand-context* participation. See `docs/multi-brand-design-system.md` §1.

## Verification (live, 2026-06-08)

Computed on `https://wondercabinet.riechers.co/`:
- `--show-accent` = `#10a544` (green, default) ✓
- `--luminous-accent` = `#9a59ff` ✓
- WC episode card border / CTA button = `rgb(16,165,68)` green — **no-op confirmed** ✓
- "From Luminous" highlight card border = `rgb(154,89,255)` violet — **intended change live** ✓
- IoK card border = `rgb(182,208,216)` steel-blue — unchanged ✓
- gscan: theme compatible with Ghost 6.x ✓

## Deferred / flagged

- **`.wc-head-subscribe`** (navbar subscribe button) left raw `--wc-green`. Open design question for Sprint 2/3: should the persistent global navbar adopt the per-page brand accent, or stay WC-green site-wide? Logged in the QA checklist.
- SVG fill tokenization (orig. backlog #4) **deferred to Sprint 2.2** — the colored SVGs are WC-only vocabulary hidden under Luminous.

## Next

Sprint 2 — Brand Switch: the page-level show-scoping mechanism (keystone), the `/luminous/` `routes.yaml` collection + permalink/redirect strategy, asset migration, asymmetric-element handling, and Luminous template variants.
