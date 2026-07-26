# Luminous Sponsor Rename — Design

**Date**: 2026-07-25
**Branch**: `name-change` (stacked on `sprint/2-brand-switch`)
**Status**: Design approved, pending implementation

---

## The change

The center sponsoring *Luminous* renamed:

| | |
|---|---|
| **Was** | Transdisciplinary Center for Research in Psychoactive Substances (TCRPS) |
| **Now** | Center for Psychedelic Research and Education (CPRE) |
| **Parent** | University of Wisconsin–Madison, School of Pharmacy |
| **URL** | https://research.pharmacy.wisc.edu/cpre/ |

Same entity — CPRE's own site still carries legacy "TCRPS" in its Rennebohm Hall address
block, which confirms the continuity rather than a new center.

Note the en dash in "Wisconsin–Madison" (UW house style), not a hyphen.

> **Open question (owner: Mark).** Exact house-style wording is being confirmed with the
> client. The design below deliberately makes this string editable in Ghost Admin so the
> correction lands without a code change — see "Why custom settings".

---

## Where the old name lives

Audited 2026-07-25 across the theme, the design-asset drop, and live Ghost content.

| Surface | State |
|---|---|
| `assets/images/luminous/wordmark.svg` | **Baked as outlined vector paths.** The tagline is the bottom two lines of the hero wordmark. No live `<text>` — the letterforms are `<path>` data. |
| `partials/components/luminous-hero.hbs:5` | Code comment quoting the old tagline |
| `docs/luminous/brand-guide.md` | Describes the wordmark as *"'LUMINOUS' wordmark in cream with dot-leader treatment"* — omits that it also carries a sponsor tagline |
| `docs/multi-brand-design-system.md` | Asset-swap table row for the wordmark, same omission |
| Live Ghost content | **Clean.** No post, tag, or site-description mentions (verified against the dev site). |
| `design-assets/…/LogoAssets/` (6 lockups) | Old name baked into every lockup — **out of scope**, see below |
| `design-assets/…/PodcastGraphics/` (2 cover arts) | Old name baked in — **out of scope**, highest real-world exposure |

The only *rendered* surface inside this repo is the wordmark SVG.

---

## Design

The organising principle: **the sponsor name stops being baked pixels and becomes editable
content.** It currently lives as outlined vector paths inside a logo asset — the worst
possible place for a string that just changed and may change again.

### 1. Split the wordmark asset

`wordmark.svg` (viewBox `0 0 2400 758`) decomposes cleanly into three parts:

| Part | Contents | Fate |
|---|---|---|
| Group 1 — 78 `<path>`, y 474–691 | The sponsor tagline | **Delete** |
| `<line class="cls-1">` @ y=383.71 | Dot leader | Keep |
| Group 2 — 8 `<path>`, y 39–287 | `LUMINOUS` logotype | Keep |

Crop the viewBox to approximately `0 0 2400 423` — preserving the original 39px top padding
as bottom padding below the dot leader (tune visually during implementation).

The asset then becomes what `docs/multi-brand-design-system.md` already claims it is: a pure
wordmark. File size drops ~34 KB → ~3.5 KB.

### 2. Tagline becomes live text, driven by a custom setting — both brands

Both hero partials render their tagline from a Ghost custom setting.

```json
"hero_tagline": {
  "type": "text",
  "group": "homepage",
  "default": "From the creators of <em>To The Best Of Our Knowledge</em>"
},
"luminous_hero_tagline": {
  "type": "text",
  "group": "homepage",
  "default": "Conversations from the University of Wisconsin–Madison Center for Psychedelic Research and Education"
}
```

`hero_tagline` sits alongside the existing `hero_title_image`; `luminous_hero_tagline`
alongside the existing `luminous_*` settings.

**Rendering** uses triple-stache with an `{{#if}}` guard:

```handlebars
{{#if @custom.hero_tagline}}
  <p class="wc-hero-tagline">{{{@custom.hero_tagline}}}</p>
{{/if}}
```

Triple-stache is a deliberate, approved choice: Ghost custom settings are plain-text only
(no rich-text type exists), and WC's tagline italicizes the show title. Only Admins and the
Owner can edit Design settings — the same trust level as editing the theme itself — so
permitting inline HTML here does not widen the attack surface. The `{{#if}}` guard means
clearing a field collapses the slot rather than leaving an empty `<p>`.

### Why custom settings, and not an existing Ghost field

The instinct to reuse an existing field was right, but every candidate is already occupied,
and each is serving as an **SEO meta description**. Overloading one would silently rewrite
page metadata:

| Field | Current value | Already serving |
|---|---|---|
| `@site.description` | "Intimate conversations about the mysteries of the cosmos…" | Site-wide meta description. Also site-wide, so it *cannot* differ per brand. |
| `tag:wonder-cabinet` description | same string | Meta description on `/` |
| `tag:luminous` description | "In "Luminous," TTBOOK executive producer Steve Paulson explores…" | Meta description on `/luminous/` |

Those tag descriptions are the **show blurb** — a different piece of copy from the tagline
("From the creators of…"). They are not interchangeable.

### 3. De-hardcode the Luminous show blurb

`index-luminous.hbs:18` hardcodes a truncated duplicate of the `tag:luminous` description.
Replace it with the existing Ghost field:

```handlebars
{{!-- was: In <em>Luminous</em>, TTBOOK executive producer Steve Paulson explores… --}}
<p class="wc-podcast-services-desc">{{tag.description}}</p>
```

The `/luminous/` collection binds `data: tag.luminous` in `routes.yaml`, which should expose
the tag in template context.

> **Verify first.** That `{{tag.description}}` resolves in `index-luminous.hbs` is inferred
> from the `data:` binding, not yet observed. Strong supporting evidence: Ghost already
> derives the `/luminous/` meta description from that tag, so the resource *is* in route
> context. If the direct accessor does not resolve, fall back to:
> `{{#get "tags" filter="slug:luminous" limit="1"}}{{#foreach tags}}{{description}}{{/foreach}}{{/get}}`
>
> Losing the `<em>` around *Luminous* is accepted here — the tag description is plain text
> and is already rendered unstyled as the meta description.

### 4. CSS

Add `.wc-hero-tagline--luminous`. The Luminous tagline is a ~99-character institutional name
rather than WC's short italic line, so it needs its own measure, size, and line-height, and
renders non-italic (WC's italic marks a show title; there is no title here).

Contrast is safe: the hero band is `--wc-black` with `bg-wavy.svg` at 0.9 opacity, which
composites to ~3.4% luminance — cream text lands around 19:1. The wavy is a pattern with
bright cream strokes, so confirm no local worst-case legibility problem at implementation.

---

## Files

| File | Change |
|---|---|
| `package.json` | Add `hero_tagline`, `luminous_hero_tagline` custom settings |
| `partials/components/home-hero.hbs` | Tagline from `hero_tagline` |
| `partials/components/luminous-hero.hbs` | Add tagline `<p>`; fix stale comment on line 5 |
| `index-luminous.hbs` | Blurb from `tag.description` |
| `assets/images/luminous/wordmark.svg` | Strip tagline group, crop viewBox |
| `assets/css/screen.css` | `.wc-hero-tagline--luminous` |
| `docs/luminous/brand-guide.md` | Record rename; correct wordmark description; flag stale source assets |
| `docs/multi-brand-design-system.md` | Wordmark row; tagline is now a content slot |
| `docs/luminous/sponsor-rename-handoff.md` | **New** — out-of-scope asset tracker |

---

## Out of scope — flagged, not fixed

These bake the old tagline and cannot be faithfully regenerated here: no licensed Futura, no
vector source in this repo. They need Art & Sons re-exports from the `.ai` masters, tracked
in the new handoff doc.

- All 6 logo lockups in `LogoAssets/`
- **Both podcast cover arts** (`LuminousLogo_ShowCoverArt`, `LuminousLogo_EpisodeDefault`) —
  highest real-world exposure; these are live in the Apple and Spotify feeds right now
- `Episode-art-template.psd`
- `Luminous_BrandGuide.ai` / `.pdf`

---

## Verification

1. **`wc-theme-qa` skill** — required. This touches shared `screen.css` and
   `partials/components/`, which `CLAUDE.md` gates on the cross-brand QA harness. Covers the
   §A "WC is a visual no-op" invariant, accent variables, and AA contrast.
2. **gscan** (`npm run test`) — custom settings changes touch `package.json`.
3. **Visual check** at desktop and mobile on `/luminous/` *and* `/` — the WC home hero is now
   also setting-driven, so it must be confirmed unchanged.
4. **Empty-field check** — clear each setting in Admin, confirm the slot collapses cleanly.

---

## Stacking

`name-change` is at exactly `sprint/2-brand-switch`'s tip (`a7bf0135`), so the stack is
already correct. PR base = `sprint/2-brand-switch`, making this the third level:

```
main
 └─ #46  sprint/1-luminous-foundation
     └─ #53  sprint/2-brand-switch   (draft, held for combined deploy)
         └─ ##  name-change          (this work)
```

This keeps the rename mergeable while the orchestrating agent continues Sprint 2. Because
#53 is a draft held for a combined deploy, expect this PR to land as part of that same
combined deploy rather than independently.

Conflict risk: `index-luminous.hbs` and `screen.css` are active Sprint 2 territory. Keep
those two diffs minimal and surgical.
