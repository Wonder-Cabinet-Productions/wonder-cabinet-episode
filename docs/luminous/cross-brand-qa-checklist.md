# Cross-Brand QA Checklist

**Purpose**: the merge-gate verification for any change that touches a **shared component** in this multi-brand theme. Before merging such a change, confirm it renders correctly under **every** brand context — not just the one you were looking at.

**When to run**: any PR that edits `assets/css/screen.css` shared rules, a shared partial in `partials/components/`, `assets/js/audio-player.js`, or anything reading `--show-accent*`. Skip only for changes provably scoped to one brand's vocabulary (e.g., a galaxy-hero-only tweak).

**How to verify**: edit on the Mac → mutagen syncs to LXC `ghost01` → gulp rebuilds → inspect `https://wondercabinet.riechers.co`. There is no local Ghost.

**Automated helper**: the `wc-theme-qa` skill runs the mechanizable items below via
`agent-browser` — §A's visual no-op invariant (`diff screenshot --baseline`), the accent
variables in §B/§C (`eval` on `document.body`), AA contrast (`a11y`), the raw `--wc-green`
grep, and WC-vocabulary leaks. It reports what it could *not* check and never judges design
intent — that stays with `brand-guardian`. This checklist remains the source of truth; the
skill automates it, and items not listed in the skill are still manual.

For one-off visual inspection, chrome-devtools MCP also works against this URL.

---

## A. The invariant

> Routing a rule from `var(--wc-green)` to `var(--show-accent)` must be a **visual no-op for Wonder Cabinet**, because `--show-accent` defaults to `var(--wc-green)`. Any WC visual change after such a routing means a leak was mis-routed (a WC-only rule wrongly pointed at `--show-accent`, or a shared rule left raw).

Until the Sprint 2 show-scoping mechanism lands, **WC is the only full brand context that renders** — so the primary Sprint 1 gate is "WC unchanged." Luminous full-context verification (the violet page) activates in Sprint 2; the Luminous *accent* is verifiable now only in the highlight zone.

---

## B. Sprint 1 gate (foundation correctness)

- [ ] **gscan passes** — `npm run test`, no new errors vs. baseline.
- [ ] **WC homepage** — episode cards still have green borders; CTA button green; section rules green. No color shift anywhere.
- [ ] **WC episode/post page** — audio player waveform progress + cursor render **green**; episode-notes headings/links green; author card accents green.
- [ ] **WC tag archive** — card borders, pagination, headers green.
- [ ] **WC static page** — in-content link color green.
- [ ] **WC contact form** — focus rings + submit button green.
- [ ] **Intended change present** — the homepage **"From Luminous" highlight card is violet `#9A59FF`** (border + badge), not the old gold `#D4A843`.
- [ ] **IoK highlight card** (if a featured `island-of-knowledge` post exists) still renders steel-blue `#b6d0d8` — unchanged.
- [ ] **Audio player console check** — on a WC post, `getComputedStyle(document.body).getPropertyValue('--show-accent')` resolves to the green value; waveform matches.

  > ⚠️ **Read from `document.body`, not `document.documentElement`.** Sprint 2 moved brand
  > context onto a body class (`body.brand-wonder-cabinet` / `body.brand-luminous`). Custom
  > properties set there cascade *down*, so querying `documentElement` returns the `:root`
  > default — **WC green even on a correctly-branded Luminous page**. This check appeared to
  > pass for WC by accident and silently false-negatived on Luminous until corrected 2026-07-25.
  >
  > Real variable names: `--show-accent`, `--show-accent-text`, `--show-accent-dark`,
  > `--show-accent-text-rgb`. There is no `--show-accent-deep`.
- [ ] **Remaining raw `--wc-green*`** — `grep` confirms only the intentional exceptions survive: the `--show-accent*` definitions, `.wc-head-subscribe`, error pages, `--wc-focus-ring-dark`.

### Known deferred decisions (not blockers, log for later)
- [ ] `.wc-head-subscribe` (navbar subscribe button) left raw `--wc-green`. **Design question for Sprint 2/3:** should the persistent global navbar adopt the per-page brand accent, or stay WC-green as a site-wide constant? Resolve during the show-scoping / impeccable work.

---

## C. Sprint 2+ gate (full brand-context — use when the violet page exists)

Run these once the show-scoping mechanism activates Luminous brand context on a page:

- [ ] **Mock a `tag:luminous` post + a WC post, view side by side.**
- [ ] Luminous page: accent (`--show-accent`) resolves to violet `#9A59FF`; readable accent text uses `#8B4DEB` (AA on cream); deep-UI uses `#1F0F33`.
- [ ] Luminous page: episode cards, CTA, Ghost content cards (`kg-*`), audio player waveform — all **violet**.
- [ ] Luminous page: **no** WC-only vocabulary leaks in — no galaxy, no cabinet illustration, no bracket ornaments (per multi-brand §6).
- [ ] Luminous page: wavy SVG hero, dashed divider, eye-icon favicon present.
- [ ] WC pages **simultaneously unchanged** — still fully green; no violet bleed.
- [ ] Text-on-accent (badges/buttons) passes AA under each brand (violet badge → black text 5.25:1).
- [ ] gscan green; a11y pass (contrast) on the violet surfaces.

---

## D. Adding a brand later
When a new brand reaches full brand-context, append its column to sections B/C and verify the same matrix (accent, text-on-cream, text-on-accent, dark, asymmetric vocabulary) against it. See `multi-brand-design-system.md` §10.
