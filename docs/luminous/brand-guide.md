# Luminous Brand Guide

**Source**: PDF Brand Guide (`Luminous_BrandGuide.pdf`)
**Master file**: `Luminous_BrandGuide.ai`
**Designer**: Art & Sons (artandsons.com)
**Date**: May 17, 2026
**Asset drop**: `design-assets/site-design/Luminous-Brand-Web-Podcast/` *(at the wonder-cabinet metarepo root — all `design-assets/…` paths in these docs resolve from there, not from this theme repo)*
**Project**: Luminous — second podcast sharing the Wonder Cabinet Ghost theme

> See also: [`multi-brand-design-system.md`](../multi-brand-design-system.md) for how Luminous coexists with Wonder Cabinet inside the same theme, and which tokens / assets swap per brand.

---

## Overview

Luminous is the second podcast hosted on the same Ghost instance and theme as Wonder Cabinet. Its visual identity is minimal and contemplative: a black or violet **eye icon** with concentric radiating iris lines on a cream or violet field. Where Wonder Cabinet evokes a "cabinet of curiosities" — illustrative, ornamental, cosmic — Luminous reads as quieter, more abstract, more geometric.

The two brands share typography, cream background, spacing, and layout DNA. They diverge on accent color, hero motif, logo, and decorative elements.

---

## Primary Logo

The primary logo consists of:
- **Eye Icon**: A circular mark with concentric lines radiating outward from a central pupil (iris stripes), rendered in solid black, violet, or cream depending on the variant.
- **Wordmark**: "LUMINOUS" set in Futura Bold, often with a leading decorative dot leader.
- **Horizontal lockup**: Wordmark to the right of the eye icon.
- **Vertical lockup**: Wordmark below the eye icon.

### Logo Variants

All files live in `design-assets/site-design/Luminous-Brand-Web-Podcast/LogoAssets/`.

| Variant | File | Dimensions | Context |
|---|---|---|---|
| Primary mark on white/cream | `Luminous-_PrimaryMarkOnWhite-1920x1920.png` | 8000×8000 | Light backgrounds, default web |
| Primary mark on violet | `Luminous-_PrimaryMarkOnViolet-1920x1920.png` | 8000×8000 | Violet hero / feature backgrounds |
| Primary mark on dark | `Luminous-_PrimaryMarkOnDark-1920wide.png` | 8000×3465 | Black backgrounds (parallel to WC dark-bg logo) |
| Horizontal lockup on white | `Luminous-_HorzontalPrimaryMarkOnWhite-1920wide.png` | 9242×3334 | Horizontal contexts (navbar, footer) |
| Horizontal lockup on violet | `Luminous-_HorzontalPrimaryMarkOnViolet.png` | 9242×3334 | Horizontal on violet |
| Wordmark only on white | `Luminous-_WordmarkOnWhite-1920x1920 copy.png` | 8000×3465 | Text-only treatment |
| Eye icon (black) | `Luminous-_EyeIconBlack-800x800.png` | 3334×3334 | Favicon, monochrome icon use |
| Eye icon (violet) | `Luminous-_EyeIconViolet-800x800.png` | 3334×3334 | Brand-colored icon use |
| Eye icon (web-optimized) | `LuminousWeb-eyeicon.png` | 800×800 | Standard web icon |

**Working files**: `LuminousLogos.ai` and `LuminousLogo-web-podcast.ai` (master vector sources).

---

## Color Palette

### Primary Colors

| Color | Hex | RGB | CMYK | Notes |
|---|---|---|---|---|
| **Violet** | `#9A59FF` | 154, 89, 255 | 60, 70, 0, 0 | Signature accent — headlines, links, highlight zones, audio player accents |
| **Black** | `#000000` | 0, 0, 38* | 40, 30, 20, 100 | Eye-mark fill, text on cream |
| **Cream** | `#FFFAEB` | 255, 250, 235 | 0, 1, 7, 0 | Background (**identical to WC cream — shared across brands**) |

*Note: source PDF shows slight RGB variation for black, matching the WC brand guide convention.*

### Usage Guidelines
- **Violet** is the signature brand color, used for accents, highlight cards, link emphasis, and audio-player waveform colors when rendering a Luminous episode.
- **Black** carries the eye-mark and body text on cream.
- **Cream** is the shared background across both brands. *Do not introduce a Luminous-specific background color* — keep the warmth consistent so cross-brand UI (navbar, footer) remains coherent.

### Derived tokens (TBD)
The Wonder Cabinet brand defines two derived colors for accessibility (`--wc-green-text` #087834 and `--wc-dark-green` #043013). Luminous does **not** yet have published equivalents. Until they are commissioned, the theme will use violet at full strength on cream — verify WCAG contrast in context before declaring complete. See [`multi-brand-design-system.md` § Backlog](../multi-brand-design-system.md#9-backlog-refactor-work-this-doc-surfaces) item #6.

### Color variance note
The brand guide PDF specifies cream as `#FFFAEB`, but the embedded SVG in `LuminousWeb_WebsiteBackground.svg` uses `#FFF9E8` (a slightly cooler variant). The PDF value is canonical. SVGs should be normalized to `#FFFAEB` (or routed through `var(--wc-cream)`) if rendered inline in the theme.

---

## Typography

### Headline Font
**Futura Bold**
- Used for: Wordmark, headlines, all-caps display
- Style: Bold, geometric sans-serif

### Body Font
**Adobe Garamond** (Regular)
- Used for: Taglines, secondary text, body copy
- Style: Classic serif

### Web substitutes (matching WC convention)
Both Futura and Adobe Garamond are licensed fonts. The Wonder Cabinet theme substitutes them with Google Font equivalents that are visually compatible — and the same substitutes apply to Luminous without modification:

| Brand spec | Theme substitute | Loaded via |
|---|---|---|
| Futura Bold | **Jost** | Google Fonts (already loaded by `default.hbs`) |
| Adobe Garamond | **EB Garamond** | Google Fonts (already loaded by `default.hbs`) |

This means **typography is fully shared across both brands** — no per-brand font loading required. See `--font-heading` and `--font-body` in `assets/css/screen.css` (lines 32–34).

---

## Secondary Graphics

All files live in `design-assets/site-design/Luminous-Brand-Web-Podcast/WebsiteGraphics/`.

### Website Background
**`LuminousWeb_WebsiteBackground.svg`** — Wavy organic background pattern in cream and violet at low opacity. 2400×2400 viewBox, fully scalable. Functional analog to Wonder Cabinet's raster `bg-galaxy-spiral-1200w@2x.png`, but more abstract and lighter in tone.

### Website Wordmark
**`LuminousWeb_Website-Wordmark.svg`** — Decorative "LUMINOUS" wordmark in cream with dot-leader treatment. 2400×758 viewBox.

### Line Separator
**`LuminousWeb_LineSeparator.svg`** — Dashed horizontal divider in cream, 1200×152 viewBox, stroke dasharray ~1.18/29.59 at 9.86px weight. Functional analog to WC's `ui-wave-divider-light.svg` (smooth wave) — Luminous uses a quieter dashed treatment instead.

### Episode art template
**`Episode-art-template.psd`** — Photoshop template for generating per-episode cover art with consistent layout, branded elements, and typography placement.

### Secondary graphics (future use)
The brand guide page 6 shows a grid pattern of nine violet eye icons on a wavy striped background, labeled "SECONDARY GRAPHICS FOR FUTURE USE." This implies a tile/pattern system is planned but is **not** yet exported as a standalone asset. Treat as a future expansion slot.

---

## Podcast Cover Art

All files live in `design-assets/site-design/Luminous-Brand-Web-Podcast/PodcastGraphics/`.

| File | Dimensions | Purpose |
|---|---|---|
| `LuminousLogo_ShowCoverArt-3000x3000.png` | 12500×12500 | RSS / iTunes / Spotify show cover art |
| `LuminousLogo_EpisodeDefault-3000x3000.png` | 12500×12500 | Default episode artwork (when episode has no custom art) |

---

## Logo Spacing and Clear Space

The Luminous brand guide does **not** publish formal clear-space rules, minimum-size requirements, or do's-and-don'ts. Until those are issued, follow the WC convention (use the eye icon height as the minimum padding unit on all sides) and use judgment.

---

## Brand Elements Summary

| Element | Primary Use | Notes |
|---|---|---|
| Eye icon | Primary mark, favicon, audio-player accent | Core brand identifier |
| Violet `#9A59FF` | Accent, headlines, highlight zones | Signature look |
| Wavy SVG background | Hero/feature backgrounds | Quieter parallel to WC galaxy |
| Dashed line separator | Section dividers | Parallel to WC wave divider |
| Jost (Futura sub) | Headlines, UI headers | Same as WC |
| EB Garamond (Garamond sub) | Body, taglines | Same as WC |

---

## Stated Gaps vs. Wonder Cabinet

Luminous lacks the following decorative elements that WC has. These are **deliberate omissions** — Luminous is a quieter brand by design — but worth flagging for cross-brand template decisions:

| WC element | Luminous equivalent | Implication |
|---|---|---|
| Cabinet illustration (footer) | (none) | Footer should hide or skip the illustration slot under Luminous brand context |
| Bracket corner ornaments (4 SVGs) | (none) | Bracket buttons are a WC-only ornament; Luminous CTAs should use a simpler treatment |
| Galaxy spiral hero (raster) | Wavy SVG pattern | Direct slot swap |
| Wave divider | Dashed line separator | Direct slot swap |
| Show cover (Wonder Cabinet) | Show cover art (Luminous) | Direct slot swap |
| Wordmark title graphic | SVG wordmark | Direct slot swap |

---

## File Information

- **Original PDF**: `Luminous_BrandGuide.pdf` (786 KB)
- **Master AI file**: `Luminous_BrandGuide.ai` (7.4 MB)
- **Asset drop root**: `~/Developer/wonder-cabinet/design-assets/site-design/Luminous-Brand-Web-Podcast/`
- **Format**: Landscape brand guide presentation
- **Page count**: ~7 (matching WC brand-guide convention)
