# Multi-Brand Design System

**Purpose**: This is the operational contract for how **Wonder Cabinet** and **Luminous** coexist inside a single Ghost theme. Read this before touching any color, asset, or template that needs to render correctly under either brand.

**Audience**: Agents and humans implementing or reviewing theme code. It does *not* replace the brand guides — those remain canonical:
- [`docs/wonder-cabinet/brand-guide.md`](./wonder-cabinet/brand-guide.md)
- [`docs/luminous/brand-guide.md`](./luminous/brand-guide.md)

This doc explains how the **theme** reconciles them.

---

## 1. Architectural Model

```
┌─────────────────────────────────────────────────────┐
│                  Ghost Instance                     │
│  (one CMS, one content database, one theme)         │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────────┐
         │  wonder-cabinet-episode theme    │
         │                                  │
         │  ┌────────────────────────────┐  │
         │  │   SHARED LAYER             │  │
         │  │   typography · spacing ·   │  │
         │  │   layout DNA · cream bg ·  │  │
         │  │   audio player · footer    │  │
         │  └────────────────────────────┘  │
         │                                  │
         │  ┌────────────┐  ┌────────────┐  │
         │  │ WC LAYER   │  │ LUMINOUS   │  │
         │  │ green ·    │  │ LAYER      │  │
         │  │ galaxy ·   │  │ violet ·   │  │
         │  │ cabinet ·  │  │ wavy bg ·  │  │
         │  │ brackets   │  │ eye icon · │  │
         │  │            │  │ dashes     │  │
         │  └────────────┘  └────────────┘  │
         └──────────────────────────────────┘
                         │
                         ▼
       brand selected per-page by tag membership:
       tag:luminous → Luminous brand
       (else)       → Wonder Cabinet brand (default)
```

Three reconciliation mechanisms:
1. **CSS token cascade** — `--show-accent` (and siblings) point at the active brand's color. Components read the indirection, not raw `--wc-green`.
2. **Asset swap in templates** — Handlebars chooses logo, hero background, show cover, etc. from the active brand's asset path.
3. **Optional template variants** — When layouts diverge (e.g., a dedicated Luminous landing page), suffixed templates like `index-luminous.hbs` take over.

---

## 2. Shared Layer

The following are **constant across both brands**. Do not introduce per-brand overrides for these:

| Concern | Value | Token / location |
|---|---|---|
| Background | Cream `#FFFAEB` | `--wc-cream` (`screen.css` line 12) |
| Body text | Black `#000000` | `--wc-black` (`screen.css` line 11) |
| Heading font | Jost (Futura substitute) | `--font-heading` (`screen.css` line 32) |
| Body font | EB Garamond (Garamond substitute) | `--font-body` (`screen.css` line 33) |
| Spacing scale | 8 / 16 / 24 / 40 / 64px | `--wc-spacing-xs..xl` (`screen.css` lines 37–41) |
| Container width | 810px | `--container-width` (`screen.css` line 62) |
| Section gaps | 64px / 40px | `--wc-section-gap`, `--wc-subsection-gap` (`screen.css` lines 44–45) |
| Layout DNA | navbar, episode list, podcast services, footer, highlight zones | Shared partials in `partials/components/` |
| Audio player | WaveSurfer.js + control bar | `assets/js/audio-player.js` |
| Bracket button component | Decorative corners | `partials/components/bracket-button.hbs` (visually WC-only — see §6) |

**Why shared:** Cream `#FFFAEB` is *literally identical* in both brand guides — same hex value. Both brand guides also specify Futura+Garamond conceptually, which the theme satisfies with Jost+EB Garamond via Google Fonts. Treating these as shared isn't a compromise; it's a fact about the brands.

---

## 3. Brand-Specific Layer

Everything in this table swaps per brand. The "WC" column is the default; the "Luminous" column overrides under Luminous brand context.

### 3a. Color tokens

| Slot | WC value | Luminous value | Indirection token |
|---|---|---|---|
| Primary accent | `--wc-green` = `#10A544` | `--luminous-accent` = `#9A59FF` | `--show-accent` |
| Accent text (on cream) | `--wc-green-text` = `#087834` | (TBD — backlog #6) | `--show-accent-text` |
| Accent dark | `--wc-dark-green` = `#043013` | (TBD — backlog #6) | `--show-accent-dark` |

### 3b. Asset slots

| Slot | WC asset | Luminous asset |
|---|---|---|
| Show cover (RSS / podcast directories) | `assets/images/Show_Cover-Wonder-Cabinet.png` | `design/Luminous-Brand-Web-Podcast/PodcastGraphics/LuminousLogo_ShowCoverArt-3000x3000.png` |
| Default episode artwork | (uses show cover) | `design/Luminous-Brand-Web-Podcast/PodcastGraphics/LuminousLogo_EpisodeDefault-3000x3000.png` |
| Hero background | `assets/images/bg-galaxy-spiral-1200w@2x.png` (raster) | `design/Luminous-Brand-Web-Podcast/WebsiteGraphics/LuminousWeb_WebsiteBackground.svg` (vector) |
| Wordmark / title graphic | `assets/images/WonderCabinet-title.png` | `design/Luminous-Brand-Web-Podcast/WebsiteGraphics/LuminousWeb_Website-Wordmark.svg` |
| Logo on dark bg | `assets/images/logo-primary-dark-bg-800w.png` | `design/Luminous-Brand-Web-Podcast/LogoAssets/Luminous-_PrimaryMarkOnDark-1920wide.png` |
| Favicon / mark | (WC cabinet icon) | `design/Luminous-Brand-Web-Podcast/LogoAssets/Luminous-_EyeIconBlack-800x800.png` |
| Section divider | `assets/images/ui-wave-divider-light.svg` | `design/Luminous-Brand-Web-Podcast/WebsiteGraphics/LuminousWeb_LineSeparator.svg` |
| Footer illustration | `assets/images/illustration-footer-cabinet-table.svg` | *(none — see §6 "asymmetric elements")* |
| Bracket corner ornaments | `assets/images/ui-bracket-corner-{top-left,top-right,bottom-left,bottom-right}.svg` | *(none — see §6 "asymmetric elements")* |

**Important:** Luminous asset paths above point to `design/Luminous-Brand-Web-Podcast/`. They have **not yet been copied** into `assets/images/`. That work is [Backlog #7](#9-backlog-refactor-work-this-doc-surfaces).

---

## 4. Token Reference Card

Every CSS custom property that participates in brand selection. Defined in `assets/css/screen.css`:

| Token | Defined at | Meaning | WC default | Luminous override |
|---|---|---|---|---|
| `--wc-green` | line 9 | WC primary green (raw) | `#10A544` | — |
| `--wc-green-text` | line 10 | WCAG-AA green for text on cream | `#087834` | — |
| `--wc-black` | line 11 | Raw black | `#000000` | — |
| `--wc-cream` | line 12 | Raw cream (shared bg) | `#FFFAEB` | — |
| `--wc-dark-green` | line 13 | Raw deep-green for dark UI | `#043013` | — |
| `--luminous-accent` | line 20 | Luminous primary accent | — | `#9A59FF` ⚠️ currently `#D4A843` (gold placeholder — must fix, see [Backlog #1](#9-backlog-refactor-work-this-doc-surfaces)) |
| `--luminous-accent-text` | line 21 | Luminous accent text color | — | `var(--wc-black)` (provisional) |
| `--show-accent` | line 27 | **Use this in components.** Resolves to active brand's accent. | `var(--wc-green)` | (re-mapped per show — mechanism TBD, backlog #5) |
| `--show-accent-text` | line 28 | Active brand's text-on-accent | `var(--wc-green-text)` | (TBD) |
| `--show-accent-dark` | line 29 | Active brand's deep accent | `var(--wc-dark-green)` | (TBD) |
| `--font-heading` | line 32 | Shared heading font | `'Jost', sans-serif` | (no override) |
| `--font-body` | line 33 | Shared body font | `'EB Garamond', Georgia, serif` | (no override) |
| `--font-sans` | line 34 | Shared sans alias | `'Jost', sans-serif` | (no override) |
| `--container-width` | line 62 | Shared content width | `810px` | (no override) |
| `--wc-spacing-{xs..xl}` | lines 37–41 | Shared spacing scale | 8/16/24/40/64px | (no override) |
| `--wc-galaxy-bg` | used line 495 | WC hero background image (CSS-overridable per-template) | `url(../images/bg-galaxy-spiral-1200w-2x.webp)` | should be re-pointed to Luminous SVG under Luminous context |

Today, only the `.wc-highlight--luminous` modifier class (`screen.css` lines 994–1006) actually swaps `--luminous-accent` into effect, and only inside highlight-zone cards. The page-level activation mechanism that would make `--show-accent` resolve to violet across an entire Luminous-tagged page is the subject of [Backlog #5](#9-backlog-refactor-work-this-doc-surfaces).

---

## 5. Decision Tree for Agents

When you're about to write CSS, edit a partial, or add an asset reference, ask three questions in order:

```
1. Is this value the same regardless of which brand is rendering?
   → YES: Use the raw shared token (--wc-cream, --font-heading, --wc-spacing-md).
   → NO:  Continue to 2.

2. Does it need to swap between WC and Luminous?
   → YES: Use the indirection token (--show-accent, --show-accent-text, --show-accent-dark).
          Do NOT write --wc-green directly in a component — it won't override.
   → NO:  Continue to 3.

3. Does only one brand have this element at all?
   → YES: Conditionally render it in the template based on brand context.
          Example: footer cabinet illustration shows for WC, hidden for Luminous.
   → NO:  Reconsider — you probably belong in case 1 or 2.
```

### Worked examples

**Example A — audio player waveform color.**
The waveform should be the active brand's accent: green for WC, violet for Luminous.
→ Case 2. Use `--show-accent`.
→ ⚠️ Today this is broken: `assets/js/audio-player.js` reads a hardcoded hex. ([Backlog #3](#9-backlog-refactor-work-this-doc-surfaces).) When fixed, JS should read `getComputedStyle(document.body).getPropertyValue('--show-accent')`.

**Example B — episode card left border.**
The card has a left border in the show's accent color.
→ Case 2. Use `border-left-color: var(--show-accent);` not `var(--wc-green)`.

**Example C — homepage hero background.**
Homepage is always WC (Luminous posts are filtered out of the main feed per `home.hbs`). The galaxy background is WC-only.
→ Case 1. Just reference `--wc-galaxy-bg` / the galaxy asset directly. No `--show-` indirection needed; the homepage will never render under Luminous brand context.

**Example D — footer cabinet illustration.**
WC has a cabinet table illustration; Luminous has no equivalent.
→ Case 3. Conditionally render the illustration in `footer.hbs`. Under Luminous brand context, the slot stays empty (or shows a Luminous-appropriate alternative if one is later commissioned).

**Example E — heading font weight.**
Both brands use Jost for headlines.
→ Case 1. Use `--font-heading`. Never reach for a brand-specific font token — there isn't one and shouldn't be.

---

## 6. Asymmetric Elements

Some elements exist in one brand but not the other. These are **deliberate** — Luminous is a quieter brand by design — but they need to be handled explicitly in templates:

| Element | WC | Luminous | Handling |
|---|---|---|---|
| Cabinet illustration (footer) | yes | no | Hide under Luminous context, or render Luminous-appropriate alternative when commissioned |
| Bracket corner ornaments | yes (on CTAs, cards) | no | `bracket-button` partial is a WC-only ornament. Luminous CTAs should fall back to simpler treatment — flat button with violet background, no corners. |
| Galaxy / cosmic imagery | yes (hero, accents) | no | Galaxy is WC-only visual vocabulary. Do not add cosmic imagery to Luminous pages. |
| Wavy organic pattern (SVG) | no | yes (hero) | Luminous-only hero background. Do not introduce on WC pages. |
| Dashed line separator | no | yes (sections) | Luminous-only divider. WC uses the wave divider. |
| Eye icon motif | no | yes (favicon, logo) | Luminous-only iconography. |

When in doubt about whether a decorative element fits a brand, **consult the brand guide**, not your aesthetic intuition. Both brands have locked vocabularies per `.impeccable.md` principle #3 (Brand-strict).

---

## 7. Show-Scoping Mechanism

How does the theme know which brand to render for a given page? This is the **contract** that the rest of the design system depends on.

### Today (partial / ad-hoc)

The current state is incomplete:

- **`index-luminous.hbs`** — a Luminous-specific index template exists at theme root. (Behavior: present but not deeply integrated with brand-scoping.)
- **`.wc-highlight--luminous`** — a CSS modifier class on highlight-zone cards swaps in `--luminous-accent` for that one component only. Used by `partials/components/highlight-zone.hbs` when rendering a Luminous-tagged featured post in the homepage feed.
- **`home.hbs`** — excludes `tag:luminous` from the main episode feed, but the rest of the theme has no global notion of "this page is Luminous-context."
- **Audio player JS** — does not read any brand context; hardcodes WC colors.
- **SVG assets** — hardcoded fills; no CSS override path.

### Target contract (subject of a later sprint, not implemented in this doc)

A single mechanism activates brand context once per page, and everything downstream (CSS cascade, asset swap in partials, JS) reads from it. Two reasonable implementations to choose from in the activation sprint:

1. **Body class.** `default.hbs` adds a class like `brand-luminous` or `show-luminous` to `<body>` when the current page is tagged or routed as Luminous. CSS uses `body.brand-luminous { --show-accent: var(--luminous-accent); ... }` to override the indirection tokens. JS reads `document.body.classList`.
2. **Handlebars helper.** A custom helper like `{{#showContext}}...{{/showContext}}` resolves the brand once, then exposes `brand` / `accent` / `assetPath` to descendant templates.

Either way: the **contract** is that exactly one source of truth determines which brand a page renders, and every consumer (CSS, JS, partials) reads from that source. Until this lands, brand-specific styling beyond the highlight-zone modifier class is best avoided in PRs — flag instead to [Backlog #5](#9-backlog-refactor-work-this-doc-surfaces).

---

## 8. Asset Directory Conventions

**Today (legacy):** `assets/images/` is flat. WC-specific assets like `bg-galaxy-spiral-1200w@2x.png`, `illustration-footer-cabinet-table.svg`, `Show_Cover-Wonder-Cabinet.png` sit alongside genuinely shared assets like podcast-service logos.

**Proposed (subject of a later sprint):** Reorganize into brand-scoped subdirectories so the swap is mechanical:

```
assets/images/
  shared/          # Cream-derived UI, generic icons, podcast service logos
  wc/              # WC-specific: galaxy, cabinet, brackets, wordmark, cover
  luminous/        # Luminous-specific: eye icon, wavy bg, wordmark, cover, separator
  (legacy files)   # Existing flat files until migrated
```

Until that migration: **do not copy Luminous assets into `assets/images/` yet.** Reference them from `design/Luminous-Brand-Web-Podcast/` in this doc and in any drafts. The copy-and-rename pass is a coordinated sprint that touches every template at once. ([Backlog #7](#9-backlog-refactor-work-this-doc-surfaces).)

---

## 9. Backlog (refactor work this doc surfaces)

Items in priority order. Future sprint plans should reference these by number.

1. **Update `--luminous-accent` from `#D4A843` (gold placeholder) to `#9A59FF` (canonical violet)** in `assets/css/screen.css` line 20. **Highest priority** — the placeholder is now objectively wrong. One-character-of-CSS change, blocked only on this doc existing.
2. **Refactor ~22 CSS rules that leak direct `--wc-green`** to route through `--show-accent` instead. These will not override under Luminous context until fixed. (Audit: line numbers across `screen.css` documented in the audit report; full list in the planning session for sprint kickoff.)
3. **Tokenize audio player waveform colors.** `assets/js/audio-player.js` hardcodes hex values. Refactor to read `--show-accent` from CSS at init time so the waveform reflects active brand.
4. **Tokenize SVG asset fills.** Inline `fill="#10A544"` etc. in bracket corners, wave divider, cabinet illustration. Either swap to `currentColor` (and set `color` in CSS) or expose via CSS-driven SVG masking. Required before SVG can adapt to Luminous context.
5. **Build the global show-scoping mechanism.** See §7. Decide body-class vs. Handlebars helper, implement, and route all downstream consumers (CSS, JS, partials) through it.
6. **Commission Luminous derived tokens.** Define `--luminous-accent-text` and `--luminous-accent-dark` analogous to WC's `#087834` / `#043013` for accessible text contrast on cream and deep-UI use. Likely a designer ask first, then a CSS land.
7. **Copy Luminous assets into `assets/images/luminous/`** (after directory convention §8 is adopted). Coordinate filename normalization at the same time (the current Art & Sons exports have inconsistent casing and underscores).
8. **Update `.impeccable.md` principle #4 and "Future Requirements" Luminous section** to reflect that the brand is now finalized and to point at this doc + the Luminous brand guide.
9. **Build Luminous-specific template variants** as needed (`post-luminous.hbs`, `tag-luminous.hbs`, dedicated Luminous landing page). Scope after §7 activation mechanism lands — earlier is premature.
10. **Author cross-brand QA checklist.** Before merging any change to a shared component, verify it still renders correctly under both brand contexts (mock a Luminous-tagged post and a WC-tagged post side-by-side).

---

## 10. Adding a Third Show

If a third podcast joins the theme later, the model extends naturally:

- Add `--{show}-accent`, `--{show}-accent-text`, `--{show}-accent-dark` to `screen.css`.
- Add a `{show}/` asset subdirectory under `assets/images/`.
- Extend the show-scoping mechanism (§7) to recognize the new tag and set brand context accordingly.
- Author a `docs/{show}/brand-guide.md` paralleling the WC and Luminous ones.
- Add a row to every table in §3 (Brand-specific layer) of this doc.

The number of show-specific templates needed scales with how much the new show diverges from the shared layout DNA. If a new show fits the layout, it may need *zero* new templates — just tokens and assets.

---

## 11. Source-of-truth References

- [`docs/wonder-cabinet/brand-guide.md`](./wonder-cabinet/brand-guide.md) — canonical WC brand
- [`docs/luminous/brand-guide.md`](./luminous/brand-guide.md) — canonical Luminous brand
- `.impeccable.md` (theme root) — design principles, brand strictness, multi-show intent
- `CLAUDE.md` (theme root) — agent quickref, build commands, custom Ghost settings
- Source PDFs:
  - `/Volumes/Mark's SSD/SSD-Dev/wonder-cabinet/ghost-dev/design/mockups/WonderCabinet_BrandGuide-pages/` (extracted WC pages)
  - `/Volumes/Mark's SSD/SSD-Dev/wonder-cabinet/ghost-dev/design/Luminous-Brand-Web-Podcast/Luminous_BrandGuide.pdf`
- CSS source: `assets/css/screen.css` (token definitions lines 9–34, Luminous highlight-zone rules lines 994–1006)
