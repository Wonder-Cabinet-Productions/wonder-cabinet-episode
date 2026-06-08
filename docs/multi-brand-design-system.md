# Multi-Brand Design System

**Purpose**: the operational contract for how multiple podcast brands coexist inside this single Ghost theme. Read it before touching any color, asset, or template that must render correctly under more than one brand.

**Status**: re-derived 2026-06-08 (Sprint 1) from the current code. Supersedes the 2-brand draft stranded in closed PR #44. This version models **three brands** and distinguishes *participation levels* (see §1).

**Audience**: agents and humans implementing or reviewing theme code. It does **not** replace the brand guides — those remain canonical:
- [`docs/wonder-cabinet/brand-guide.md`](./wonder-cabinet/brand-guide.md)
- [`docs/luminous/brand-guide.md`](./luminous/brand-guide.md)
- Island of Knowledge has no standalone brand guide yet (accent derived from theislandofknowledge.com).

**A note on line numbers**: this doc references tokens and rules by **name and section**, not line number — the PR #44 draft rotted precisely because it hard-coded line numbers that drifted. When you need an exact location, grep the token name in `assets/css/screen.css`.

---

## 1. The brands and their participation levels

This theme hosts one CMS, one content database, one theme — and N brands selected per-page. The crucial insight the 2-brand draft missed: **brands participate at different depths.**

| Brand | Tag | Participation level | What renders branded |
|---|---|---|---|
| **Wonder Cabinet** | (default / untagged) | **Host brand** | Everything by default. Green, galaxy, cabinet, brackets. |
| **Luminous** | `tag:luminous` | **Full brand-context** *(in progress — this is the active work)* | A whole page flips: violet accent, eye-icon, wavy bg, dashed dividers, own `/luminous/` collection + templates. |
| **Island of Knowledge** | `tag:island-of-knowledge` | **Accent-only** | A highlight-zone card within WC pages picks up the IoK steel-blue. No page-level switch, no own templates. |
| *(newsletter)* | `tag:newsletter` | **Content-type accent** (not a brand) | Highlight-zone card uses cream accent. Listed here because it shares the same mechanism. |

**Two participation levels, two mechanisms:**

- **Accent-only** — a component-scoped CSS modifier class (`.wc-highlight--{variant}`) swaps that brand's accent into one card. Cheap, additive, no page context. IoK and newsletter live here today.
- **Full brand-context** — a page-level activation sets the active brand once, and *everything downstream* (CSS cascade via `--show-accent*`, asset swaps in partials, audio-player JS) reads from it. Luminous is being promoted to this level (Sprint 2). WC is this level by default.

A brand can graduate from accent-only to full brand-context later (IoK could, if it ever wants its own landing page) — the model supports it without rework.

```
┌─────────────────────────────────────────────────────────┐
│                     Ghost instance                       │
│            (one CMS, one DB, one theme)                  │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────── SHARED LAYER ─────────────────┐
        │ cream bg · Jost + EB Garamond · spacing scale │
        │ 810px container · navbar · footer · audio     │
        │ player · episode list · highlight-zone shell  │
        └───────────────────────────────────────────────┘
                           │
   ┌──────────── per-brand layers (accent + vocabulary) ───────────┐
   │  WC (host)      Luminous (full)     IoK (accent)   newsletter │
   │  green          violet              steel-blue      cream      │
   │  galaxy         wavy SVG            —                —         │
   │  cabinet        eye icon           —                —         │
   │  brackets       dashed divider     —                —         │
   └───────────────────────────────────────────────────────────────┘
                           │
        brand selected per page:
          tag:luminous → Luminous full context  (Sprint 2)
          else         → Wonder Cabinet (default host)
        accent cards selected per highlight zone:
          .wc-highlight--series   → IoK accent
          .wc-highlight--luminous → Luminous accent
          .wc-highlight--newsletter → cream accent
```

---

## 2. Shared layer (constant across all brands — never per-brand override)

| Concern | Value | Token / location (`assets/css/screen.css`) |
|---|---|---|
| Background | Cream `#FFFAEB` | `--wc-cream` |
| Body text | Black `#000000` | `--wc-black` |
| Heading font | Jost (Futura substitute) | `--font-heading` |
| Body font | EB Garamond (Garamond substitute) | `--font-body` |
| Spacing scale | 8 / 16 / 24 / 40 / 64px | `--wc-spacing-xs..xl` |
| Section rhythm | 64 / 40px | `--wc-section-gap`, `--wc-subsection-gap` |
| Container width | 810px | `--container-width` (on `.gh-inner`) |
| Layout DNA | navbar, episode list, podcast services, footer, highlight-zone shell, pagination | shared partials in `partials/components/` |
| Audio player | WaveSurfer.js v7 + control bar | `assets/js/audio-player.js` |

**Why shared, not compromised:** cream `#FFFAEB` is *literally identical* in the WC and Luminous brand guides — same hex. Both specify Futura + Garamond conceptually, satisfied by Jost + EB Garamond. Treating these as shared is a fact about the brands, not a concession.

---

## 3. Per-brand layer

### 3a. Color tokens (defined in `:root`, `assets/css/screen.css`)

Each brand declares its raw palette. Components never read these directly (except the highlight-zone modifier blocks) — they read the `--show-accent*` indirection (§4).

| Brand | accent | text-on-cream (AA) | text-on-accent | dark |
|---|---|---|---|---|
| **WC** | `--wc-green` `#10A544` | `--wc-green-text` `#087834` (5.37:1) | black (hardcoded in badges) | `--wc-dark-green` `#043013` |
| **Luminous** | `--luminous-accent` `#9A59FF` | `--luminous-accent-text-on-cream` `#8B4DEB` (4.62:1) | `--luminous-accent-text` = `var(--wc-black)` (5.25:1 on violet) | `--luminous-accent-dark` `#1F0F33` |
| **IoK** | `--iok-accent` `#b6d0d8` | *(none — accent-only, never used as page text)* | `--iok-accent-text` `#1a3a44` | *(none)* |

**Token semantics — the distinction that bit the original draft.** Two different "text" needs exist and must not be conflated:
- **text-on-cream**: the accent rendered *as readable text* on the cream background (links, headings). This is what `--show-accent-text` resolves to. For WC that's `--wc-green-text`; for Luminous `--luminous-accent-text-on-cream`. Must pass WCAG AA (4.5:1).
- **text-on-accent**: the text color placed *on top of* an accent-colored fill (a badge, a button). This is `--{brand}-accent-text`, consumed directly by the `.wc-highlight--{variant}` blocks. Contrast is measured against the accent, not cream.

**Accessibility note:** `--luminous-accent` `#9A59FF` is **3.84:1 on cream — it fails AA for normal text.** Never use raw `--luminous-accent` for body copy or small headings; use `--luminous-accent-text-on-cream` (`#8B4DEB`). Full violet is for badges, borders, and large (≥18pt bold) display only. (Derivation math: §4a.)

### 3b. Asset slots

| Slot | WC | Luminous | IoK |
|---|---|---|---|
| Hero background | `bg-galaxy-spiral-1200w@2x.png` (raster) | `WebsiteGraphics/LuminousWeb_WebsiteBackground.svg` (vector wavy) | — |
| Wordmark / title | `WonderCabinet-title.png` | `WebsiteGraphics/LuminousWeb_Website-Wordmark.svg` | — |
| Logo on dark | `logo-primary-dark-bg-800w.png` | `LogoAssets/Luminous-_PrimaryMarkOnDark-1920wide.png` | — |
| Favicon / mark | WC cabinet icon | `LogoAssets/Luminous-_EyeIconBlack-800x800.png` | — |
| Section divider | `ui-wave-divider-light.svg` | `WebsiteGraphics/LuminousWeb_LineSeparator.svg` (dashed) | — |
| Show / episode cover | `Show_Cover-Wonder-Cabinet.png` | `PodcastGraphics/LuminousLogo_ShowCoverArt-3000x3000.png` (+ `…_EpisodeDefault…`) | — |
| Footer illustration | `illustration-footer-cabinet-table.svg` | *(none — §6 asymmetric)* | — |
| Bracket ornaments | `ui-bracket-corner-*.svg` (4) | *(none — §6 asymmetric)* | — |

**Luminous asset paths** above point at `design-assets/site-design/Luminous-Brand-Web-Podcast/` (metarepo root). They have **not** been copied into `assets/images/` yet — that's Sprint 2 (Backlog #7), coordinated with the directory convention (§8).

---

## 4. Token indirection — the `--show-accent*` contract

Three indirection tokens, defined in `:root`, defaulting to the WC host brand:

```
--show-accent:      var(--wc-green);        /* active brand's accent      */
--show-accent-text: var(--wc-green-text);   /* active brand's text-on-cream */
--show-accent-dark: var(--wc-dark-green);   /* active brand's deep accent  */
```

**Components read `--show-accent*`, never the raw `--wc-*` / `--{brand}-*` tokens** (the highlight-zone modifier blocks are the one sanctioned exception — they intentionally hard-bind a brand accent into a single card).

**Full brand-context activation (Sprint 2, §7)** overrides the three tokens once per page. The Luminous override block will be:
```
/* applied when the page is in Luminous brand context */
--show-accent:      var(--luminous-accent);                 /* #9A59FF */
--show-accent-text: var(--luminous-accent-text-on-cream);   /* #8B4DEB */
--show-accent-dark: var(--luminous-accent-dark);            /* #1F0F33 */
```
Because every shared component already reads `--show-accent*`, that ~3-line override is all it takes to flip an entire page's accent — *provided Sprint 1 routed the leaks* (§5 / Backlog #2).

### 4a. Luminous derived-token math (Sprint 1, a11y)

Cream `#FFFAEB` relative luminance ≈ 0.9563.
- `#9A59FF` (L≈0.2123) on cream → **3.84:1** → fails AA normal text (needs 4.5:1), passes AA large (3:1). → display/badge/border only.
- `#8B4DEB` (139,77,235) on cream → **4.62:1** → passes AA. → the on-cream text token.
- black `#000000` on `#9A59FF` → **5.25:1** (passes AA); white on violet → 4.00:1 (fails). → badge text is black.
- `#1F0F33` (31,15,51) — near-black violet for dark UI; no on-cream contrast requirement.

---

## 5. Decision tree for agents

Before writing CSS, editing a partial, or adding an asset reference, ask in order:

```
1. Same value regardless of brand?
   → YES: raw shared token (--wc-cream, --font-heading, --wc-spacing-md).
   → NO:  go to 2.
2. Must it swap between brands under full brand-context?
   → YES: use the indirection token (--show-accent / --show-accent-text / --show-accent-dark).
          NEVER write --wc-green directly in a shared component — it won't override.
   → NO:  go to 3.
3. Does only one brand have this element at all?
   → YES: conditionally render it in the template based on brand context (§6).
   → NO:  reconsider — you're probably case 1 or 2.
```

**Worked examples**
- *Episode card border* → case 2 → `border-color: var(--show-accent)`.
- *Audio waveform color* → case 2 → JS reads `--show-accent` at init (done, Sprint 1).
- *Homepage galaxy hero* → case 1, WC-only surface (home filters out `tag:luminous`) → reference the galaxy asset directly; no indirection needed.
- *Footer cabinet illustration* → case 3 → render for WC, hide under Luminous.
- *Heading font* → case 1 → `--font-heading`. There is no per-brand font and there shouldn't be.

---

## 6. Asymmetric elements (deliberate — quieter brands by design)

| Element | WC | Luminous | IoK | Handling |
|---|---|---|---|---|
| Cabinet illustration (footer) | yes | no | no | Hide under non-WC full-context; WC-only vocabulary. |
| Bracket corner ornaments | yes | no | no | WC-only ornament. Luminous CTAs use a flat violet button, no corners. |
| Galaxy / cosmic imagery | yes | no | no | WC-only visual vocabulary. Never add to Luminous. |
| Wavy organic SVG | no | yes | no | Luminous-only hero. |
| Dashed line separator | no | yes | no | Luminous-only divider (WC uses the wave divider). |
| Eye-icon motif | no | yes | no | Luminous-only iconography. |

When unsure whether a decorative element fits a brand, **consult the brand guide**, not aesthetic intuition. Per `.impeccable.md` principle #3 (Brand-strict), each brand's vocabulary is locked.

---

## 7. Show-scoping mechanism (roadmap — Sprint 2 / Backlog #5)

**Today (accent-only is wired; full brand-context is not):**
- `.wc-highlight--series` / `--luminous` / `--newsletter` modifier classes swap an accent into a single highlight card. ✅ works.
- `home.hbs` filters `tag:luminous` out of the main feed. ✅
- There is **no** page-level "this page is Luminous" signal yet. The audio player now reads `--show-accent` (Sprint 1) but nothing overrides `--show-accent` per page, so it still resolves to green everywhere.
- `index-luminous.hbs` exists but is not wired to a route.

**Target contract (Sprint 2):** one mechanism sets brand context once per page; every consumer (CSS cascade, asset swaps in partials, JS) reads from it. Two viable implementations — both confirmed feasible in this Ghost 6.x theme (`{{body_class}}`, `{{#match}}`, `{{#has}}`, tag context all available):
1. **Body class** — `default.hbs` adds `brand-luminous` to `<body>` from tag/route context; CSS does `body.brand-luminous { --show-accent: var(--luminous-accent); … }`; JS reads `document.body.classList`.
2. **Handlebars helper** — a custom helper resolves the brand once and exposes `brand`/`accent`/`assetPath` to descendant templates.

The decision (and the `/luminous/` `routes.yaml` collection + permalink/redirect strategy) is a Sprint 2 human gate. Until it lands, **avoid brand-specific styling beyond the highlight-zone blocks in PRs.**

---

## 8. Asset directory convention (roadmap — Sprint 2 / Backlog #7)

Today `assets/images/` is flat. Proposed brand-scoped layout (adopt in Sprint 2, alongside the copy/normalize pass — current Art & Sons exports have inconsistent casing/underscores and misleading filename dimensions):

```
assets/images/
  shared/     # cream UI, podcast-service logos, generic icons
  wc/         # galaxy, cabinet, brackets, wordmark, cover
  luminous/   # eye icon, wavy bg, wordmark, cover, dashed separator
  (legacy)    # existing flat files until migrated
```
**Do not copy Luminous assets into `assets/images/` until that coordinated pass** — reference them from `design-assets/…` in drafts until then.

---

## 9. Backlog (status refreshed 2026-06-08)

| # | Item | Status |
|---|---|---|
| 1 | `--luminous-accent` `#D4A843` → `#9A59FF` | ✅ **Done** (Sprint 1.1) |
| 6 | Commission Luminous derived contrast tokens | ✅ **Done** (Sprint 1.1 — `--luminous-accent-text-on-cream`, `--luminous-accent-dark`; math §4a) |
| 2 | Route shared components leaking raw `--wc-green*` → `--show-accent*` (audit found ~38 refs; ~shared subset routed) | 🔄 **Sprint 1.2** |
| 3 | Tokenize audio-player waveform/cursor colors (read `--show-accent`) | 🔄 **Sprint 1.2** |
| 4 | Tokenize SVG fills (`currentColor`) | ⏸ **Deferred to Sprint 2.2** — the colored SVGs (brackets, wave divider) are WC-only vocabulary hidden under Luminous; handle with the asymmetric elements. |
| 5 | Global show-scoping mechanism (body-class vs helper) | ⏳ **Sprint 2.0** (keystone) |
| 7 | Copy/normalize Luminous assets → `assets/images/luminous/` | ⏳ **Sprint 2.1** |
| 8 | Update `.impeccable.md` for finalized Luminous brand | ⏳ **Sprint 2.1** |
| 9 | Luminous templates + `/luminous/` collection landing page | ⏳ **Sprint 2.3** |
| 10 | Cross-brand QA checklist | 🔄 **Sprint 1.3** (authored), applied 2.4 + 3.4 |

---

## 10. Adding a brand (N-brand generalization)

The model scales. To add a brand:

1. **Pick a participation level.** Accent-only is cheap (one modifier class + accent token). Full brand-context is the bigger lift (§7 activation + asset swaps + maybe templates).
2. **Accent-only:** add `--{brand}-accent` (+ `--{brand}-accent-text` for on-badge contrast) to `:root`; add a `.wc-highlight--{variant}` block; pass `accentClass` from the highlight-zone partial. *(This is exactly what IoK and newsletter do — copy that pattern.)*
3. **Full brand-context:** also add `--{brand}-accent-text-on-cream` (AA-verified) and `--{brand}-accent-dark`; extend the show-scoping mechanism (§7) to recognize the tag and override `--show-accent*`; add a `{brand}/` asset subdir (§8); author `docs/{brand}/brand-guide.md`; add a row to every table in §1, §3, §6.
4. A brand that fits the shared layout DNA may need **zero** new templates — just tokens and assets.

The number of brand-specific templates scales with how far the brand diverges from the shared layout, not with the number of brands.

---

## 11. Source-of-truth references
- [`docs/wonder-cabinet/brand-guide.md`](./wonder-cabinet/brand-guide.md), [`docs/luminous/brand-guide.md`](./luminous/brand-guide.md) — canonical brand specs
- [`docs/luminous/cross-brand-qa-checklist.md`](./luminous/cross-brand-qa-checklist.md) — the merge-gate verification list
- `.impeccable.md` (theme root) — design principles, brand strictness
- `CLAUDE.md` (theme root) — build commands, custom settings, LXC dev loop
- `docs/ROUTES_CONFIG.md` — `routes.yaml` collections/permalinks (Sprint 2)
- Token definitions + highlight-zone modifier blocks: grep `--show-accent`, `--luminous-accent`, `.wc-highlight--` in `assets/css/screen.css`
- Luminous source assets: `design-assets/site-design/Luminous-Brand-Web-Podcast/` (metarepo root)
