# Sprint 2 — Brand Switch: completion design

**Date:** 2026-07-22 · **Branch:** `sprint/2-brand-switch` (PR #53, draft) · **Umbrella spec:**
`docs/superpowers/specs/2026-06-08-luminous-branding-workplan-design.md`

Authored at Sprint 2 mid-point to define the *remaining* work with current-state-accurate
detail (the umbrella spec's §3 Sprint 2 table is the parent). 2.0 (keystone) already landed.

## Scope of this push

Finish the **theme code** for the Luminous brand switch to a merge-ready state. The live
`/luminous/` routes/collection + redirect/canonical go-live is **deferred** to a separate
gated step (human gates #3/#4). The **content cleanup** (episode slugs, redirect artifact)
runs as a **parallel, user-supervised lane** — see `content-cleanup-brief.md` +
`content-audit-findings.md`.

### In scope
- **2.1 Assets (minimal reorg):** normalize the Art & Sons Luminous exports into
  `assets/images/luminous/`. Existing WC assets stay at their current flat paths (no
  reference churn). §8's full `shared/wc/` split is **deferred** (documented, not done).
- **2.2 Asymmetric elements:** gated on `body.brand-luminous` / `{{#has tag="luminous"}}`,
  applied to the **real rendered templates** (shared chrome + post + tag), not variant files.
- **2.3 Templates:** fix the `index-luminous.hbs` `count="all"` pagination gotcha
  (correct-when-activated; dormant until the deferred collection); author
  `docs/routes-luminous.reference.yaml` mirror (documented intent).
- **2.4 QA:** WC-pixel-stability proof + Luminous render verification at the preview; gscan.

### Out of scope (deferred)
- Live `routes.yaml` collection on the LXC; redirect/canonical cutover; the WPR ask.
- **`post-luminous.hbs` — dropped (YAGNI).** The body-class mechanism (2.0) already colors
  `post.hbs` violet; the asymmetric bits live in shared chrome that `post.hbs` inherits; and
  the deferred collection can reuse `post.hbs` when it lands. A dormant duplicate template
  would be unreachable and a sync liability. Documented deviation from the umbrella spec's
  file list.
- **Navbar brand adoption** (per-page accent on the persistent nav / nav wordmark) — an open
  design question deferred since Sprint 1. Nav stays WC-branded; **not touched here.**

## Locked decisions
1. **Single-template, body-class driven** — no per-tag template variants; the real templates
   respond to `body.brand-luminous`.
2. **Minimal asset reorg** — add `luminous/` only.
3. **Drop `post-luminous.hbs`.**

## The core invariant — WC regression safety (the gate on every feature)

Because 2.2 edits **shared templates every WC post renders through** (`default.hbs`,
`footer.hbs`, `post.hbs`, `tag.hbs`, bracket partials), the non-negotiable rule is:

> **Every Luminous change is strictly gated on `body.brand-luminous` (CSS) or
> `{{#has tag="luminous"}}` (template). The WC / untagged render path emits identical DOM and
> identical computed styles — byte-for-byte unchanged.**

- CSS: Luminous overrides live only under a `body.brand-luminous` selector — never edit the
  base rule's value.
- Templates: asymmetric DOM changes go inside `{{#has tag="luminous"}}…{{else}}…{{/has}}`
  guards; the `{{else}}`/default branch is the current WC markup, unmodified.
- **Proof (2.4):** capture the current WC post + WC home rendering, apply changes, re-capture,
  and confirm no visual/DOM diff on WC pages. gscan green. This is the explicit test the work
  is not "done" without.

## Components / files touched

| File | Change | WC-safety mechanism |
|---|---|---|
| `assets/images/luminous/*` | New Luminous assets (normalized names) | additive; nothing existing moves |
| `assets/css/screen.css` | Luminous overrides under `body.brand-luminous`: bg → wavy SVG, divider → dashed, hide cabinet + brackets, eye-icon sizing | all rules scoped to `body.brand-luminous` |
| `partials/components/footer.hbs` | Hide cabinet illustration under Luminous | `{{#has tag="luminous"}}` guard around the `<img>`; `{{else}}` = current markup |
| `default.hbs` (head) | Favicon → eye-icon under Luminous | `{{#has tag="luminous"}}` conditional `<link rel="icon">`; default branch unchanged |
| bracket partials / list-item brackets | Hide/flatten bracket ornaments under Luminous | CSS `display:none` under `body.brand-luminous`, or template guard |
| `partials/components/tag-header.hbs` (+ hero bg) | Wavy Luminous hero bg where galaxy/hero renders on Luminous-reachable pages | CSS bg-image swap under `body.brand-luminous` |
| `index-luminous.hbs` | Remove `count="all"`; use route `posts` pagination | dormant template; no WC impact |
| `docs/routes-luminous.reference.yaml` | New mirror doc (collection intent) | doc only; not applied live |

*(Exact hero/divider surfaces get pinned during implementation — some galaxy-bg lives on
`home.hbs`, which is WC-only and excluded.)*

## Build order
2.1 assets → 2.2 asymmetric (CSS + template guards) → 2.3 index fix + routes mirror →
2.4 QA (WC-stability proof first, then Luminous verification, then gscan).

## Testing / QA plan (2.4)
1. **WC regression (primary):** before/after at `wondercabinet.riechers.co` on a WC post + the
   home page — no visual or DOM diff. This is the acceptance gate the user called out.
2. **Luminous render:** a `tag:luminous` post + `/tag/luminous/` archive show violet + wavy bg
   + dashed divider + eye-icon favicon + no cabinet/brackets.
3. **gscan** green.
4. Confirm `assets/built/` rebuilt via the CT loop and committed.
