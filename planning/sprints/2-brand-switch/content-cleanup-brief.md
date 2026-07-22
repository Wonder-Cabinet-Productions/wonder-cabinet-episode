# Sprint 2.3 — Luminous Content Cleanup (parallel, user-supervised lane)

**Split from the theme-code lane on 2026-07-22.** This workstream is **content/data only**
(Ghost episodes, slugs, canonicals, the WPR redirect artifact). It touches **no theme
files** — templates, CSS, and assets are the parallel design lane. The two run
independently; their only shared output is the *final slug list*, which is consumed only
at the **deferred** live routes/redirect cutover (out of scope for the current push).

## Why this is safe to run in parallel
- No shared files with the theme-code lane.
- The `/luminous/{slug}/` permalink pattern (declared in the deferred `routes.yaml`) is
  brand-agnostic of the individual slugs — `post-luminous.hbs` renders whatever post it's
  handed. So finalizing slugs here does **not** block template work, and vice-versa.
- All *live-URL* changes (redirects, canonical cutover, routes.yaml) are **deferred** to a
  separate gated step (human gates #3/#4). This lane *prepares* those decisions; it does
  not execute them live.

## Scope (content lane)
1. **Enumerate** the live Luminous episodes (`tag:luminous`) and their **current Ghost
   slugs** — source of truth is the live site + Ghost Admin on `ghost01`.
2. **Reconcile** against the 17-row target table in
   `docs/luminous/wpr-redirect-handoff.md` (the `/luminous/{slug}/` targets).
3. **Flag for decision** (do not change): 
   - slug mismatches (live slug ≠ table target);
   - **awkward / truncated target slugs** — e.g. row 1 target
     `…-researcher-leaned-his-terminal-cancer-diagnosis` dropped "into" from the title
     "…'leaned in' to his terminal cancer diagnosis" and reads wrong; several others look
     auto-truncated. Which is canonical — fix the slug, or fix the table?
   - duplicate / stale imported episodes present on the site but not in the table;
   - episodes in the table but missing/unpublished on the site;
   - per-episode gaps: canonical URL, feature image, excerpt, publish date.
4. **Produce** the finalized slug map + a cleaned redirect table/CSV, ready to hand to the
   deferred cutover step. Update `wpr-redirect-handoff.md` only after the user approves
   slug changes.

## Boundary — do NOT touch (owned by the theme-code lane)
`default.hbs`, `post-luminous.hbs`, `index-luminous.hbs`, `assets/css/**`,
`assets/images/**`, `assets/js/**`, `package.json` custom settings, `routes-luminous.reference.yaml`.

## Output
- `planning/sprints/2-brand-switch/content-audit-findings.md` — one row per episode needing
  a decision, phrased as a concrete question for the user; plus a clean/needs-attention
  summary. **Audit + questions only in the first pass — no content writes** until the user
  supervises the decisions.

## Deferred (NOT this lane, NOT this push)
Live `routes.yaml` collection on the LXC, applying redirects/canonicals, sending the WPR ask.
