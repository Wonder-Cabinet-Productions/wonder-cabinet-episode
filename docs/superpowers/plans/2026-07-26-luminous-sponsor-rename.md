# Luminous Sponsor Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sponsoring center's old name with its new one everywhere it appears in the theme, and move both brands' hero taglines into Ghost custom settings so the string is editable without a deploy.

**Architecture:** The old name is currently baked as outlined vector paths inside `wordmark.svg` — unreachable by any text edit. We strip those paths out of the asset, then re-render the tagline as live HTML text in the same slot, driven by a new Ghost custom setting. The Wonder Cabinet homepage gets the same treatment for symmetry. Design source of truth: `docs/superpowers/specs/2026-07-25-luminous-sponsor-rename-design.md`.

**Tech Stack:** Ghost 5.x theme (Handlebars), `package.json` custom settings, plain CSS, SVG. No build step to invoke by hand — gulp runs as `ghost-theme-watch.service` on LXC `ghost01` and rebuilds `assets/built/` on save via mutagen.

---

## Global Constraints

Values below are copied verbatim from the spec. Every task's requirements implicitly include this section.

- **New center name:** `Center for Psychedelic Research and Education` (CPRE), University of Wisconsin–Madison, School of Pharmacy. URL: `https://research.pharmacy.wisc.edu/cpre/`
- **Old name to eliminate:** `Transdisciplinary Center for Research in Psychoactive Substances` (TCRPS)
- **Default Luminous tagline string, exact:**
  `Conversations from the University of Wisconsin–Madison Center for Psychedelic Research and Education`
- **En dash, not hyphen,** in `Wisconsin–Madison` (U+2013, UW house style). This is the single easiest thing to get wrong in this plan.
- **Exact wording is provisional** — Mark is confirming house style with the client. The custom-setting design exists precisely so this can change in Ghost Admin without code. Do not hardcode it anywhere else.
- **Triple-stache (`{{{ }}}`) is an approved, deliberate choice** for both tagline fields, so the WC tagline can carry `<em>`. Only Admins/Owner can edit Design settings. Do not "fix" this to a double-stache.
- **Never hand-edit `assets/built/`** — it is generated on the CT and syncs back.
- **Do not run gulp or Ghost locally.** This machine is the editing surface and git home only.
- **Branch:** `name-change`, stacked on `sprint/2-brand-switch` (PR base). Keep `index-luminous.hbs` and `screen.css` diffs minimal and surgical — both are active Sprint 2 territory.

### The dev loop (how every "run it" step below works)

1. Save the file here on the Mac.
2. Mutagen syncs to LXC `ghost01` in ~1–2 s; gulp rebuilds `assets/built/`.
3. Verify at **https://wondercabinet.riechers.co**.
   - `.hbs` edits → visible on refresh.
   - CSS edits → visible after the ~2 s rebuild.
   - **`package.json` custom-settings edits → require a Ghost restart:**
     `ssh wc-ghostdev 'sudo systemctl restart ghost-dev'`

If a change does not appear: `mutagen sync list` (expect `wc-theme … Watching for changes`) and
`ssh wc-ghostdev 'systemctl is-active ghost-dev ghost-theme-watch'`.

### Verification model

Ghost themes have no unit-test harness. "Tests" in this plan are **executable assertions against the live dev site** plus `gscan`. Each task follows the same red/green cycle: run the assertion, watch it fail, make the change, watch it pass.

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `index-luminous.hbs` | Luminous landing template — show blurb slot | 1 |
| `package.json` | Theme custom-settings schema | 2, 4 |
| `partials/components/home-hero.hbs` | WC homepage hero — tagline slot | 2 |
| `assets/images/luminous/wordmark.svg` | Luminous logotype asset (wordmark + dot leader only, after this work) | 3 |
| `partials/components/luminous-hero.hbs` | Luminous hero — eye icon, wordmark, tagline slot | 4 |
| `assets/css/screen.css` | `.wc-hero-tagline--luminous` styling | 4 |
| `docs/luminous/brand-guide.md` | Brand reference — records the rename | 5 |
| `docs/multi-brand-design-system.md` | Cross-brand asset/slot mapping | 5 |
| `docs/luminous/sponsor-rename-handoff.md` | **New** — tracker for assets needing Art & Sons re-export | 5 |

---

## Task 1: De-hardcode the Luminous show blurb

Sequenced first because it contains the plan's **only unverified assumption**. Resolve it before building on it.

**Files:**
- Modify: `index-luminous.hbs:16-20`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: nothing later tasks depend on. Fully independent — if it fails, Tasks 2–6 are unaffected.

**Context:** `index-luminous.hbs` hardcodes a truncated duplicate of the `tag:luminous` description already stored in Ghost. The `/luminous/` collection binds `data: tag.luminous` in `routes.yaml`, which *should* expose the tag in template context. Ghost already derives the page's meta description from that tag, so the resource is definitely in route context — but that the `{{tag.description}}` accessor resolves in the template has **not** been observed. Step 1 settles it.

- [ ] **Step 1: Probe whether `{{tag.description}}` resolves**

Temporarily add a probe line to `index-luminous.hbs`, immediately after the opening `<main ...>` tag on line 3:

```handlebars
<!-- PROBE tag.description=[{{tag.description}}] name=[{{tag.name}}] -->
```

Save, wait ~3 s for mutagen, then:

```bash
curl -sL --max-time 20 https://wondercabinet.riechers.co/luminous/ | grep -o 'PROBE.*-->'
```

- **If the probe prints the description text** → the accessor works. Use `{{tag.description}}` in Step 3.
- **If it prints `tag.description=[] name=[]`** → the accessor does not resolve. Use this documented fallback in Step 3 instead, and note the substitution in the commit message:

```handlebars
{{#get "tags" filter="slug:luminous" limit="1"}}{{#foreach tags}}<p class="wc-podcast-services-desc">{{description}}</p>{{/foreach}}{{/get}}
```

- [ ] **Step 2: Remove the probe**

Delete the probe line added in Step 1. It must not survive into the commit.

- [ ] **Step 3: Replace the hardcoded blurb**

In `index-luminous.hbs`, replace lines 17–19:

```handlebars
                <p class="wc-podcast-services-desc">
                    In <em>Luminous</em>, TTBOOK executive producer Steve Paulson explores the philosophical and cultural implications of psychedelics.
                </p>
```

with (assuming Step 1 confirmed the direct accessor):

```handlebars
                {{!-- Blurb comes from the tag:luminous description in Ghost (bound via
                     `data: tag.luminous` in routes.yaml), which already serves as this
                     page's meta description. Single source of truth — edit it in Ghost
                     Admin, not here. --}}
                <p class="wc-podcast-services-desc">{{tag.description}}</p>
```

Note: the `<em>` around *Luminous* is intentionally lost. Tag descriptions are plain text in Ghost, and this same string already renders unstyled as the meta description.

- [ ] **Step 4: Verify the rendered blurb matches the tag description**

```bash
curl -sL --max-time 20 https://wondercabinet.riechers.co/luminous/ \
  | grep -o '<p class="wc-podcast-services-desc">[^<]*</p>'
```

Expected: the full tag description — `In “Luminous,” TTBOOK executive producer Steve Paulson explores the philosophical and cultural implications of psychedelics through conversations with scientists, healers and religious scholars.`

Expected to be **absent**: the old truncated hardcoded string ending at `...implications of psychedelics.`

- [ ] **Step 5: Commit**

```bash
git add index-luminous.hbs
git commit -m "refactor(luminous): source show blurb from tag:luminous description

The blurb was a hardcoded, truncated duplicate of the tag description
Ghost already serves as this page's meta description. The collection
binds data: tag.luminous, so the template can read it directly."
```

> **Amendment (post-implementation, 2026-07-26):** Step 1's probe resolved the other way —
> the plan above presents `{{tag.description}}` as the primary path and the `{{#get}}`
> block as the documented fallback. What actually shipped (commit `0b1a3715`) is the
> `{{#get "tags" filter="slug:luminous" limit="1"}}` form, used unconditionally rather than
> as a fallback, because it doesn't depend on `routes.yaml`'s `data: tag.luminous` binding
> staying wired that way. This note records what was built, not what the plan predicted;
> the steps above are left as originally written.

---

## Task 2: Move the Wonder Cabinet hero tagline into a custom setting

**Files:**
- Modify: `package.json:122` (insert before `hero_title_image`)
- Modify: `partials/components/home-hero.hbs:11`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: establishes the `{{#if}}` + triple-stache tagline pattern that Task 4 mirrors for Luminous. Setting name: `hero_tagline`.

**Context:** WC's tagline is currently hardcoded HTML containing `<em>`. This task must be a **pure refactor with zero visual change** — that is the whole review criterion.

- [ ] **Step 1: Capture the current rendered output as the baseline**

```bash
curl -sL --max-time 20 https://wondercabinet.riechers.co/ \
  | grep -o '<p class="wc-hero-tagline">.*</p>'
```

Expected: `<p class="wc-hero-tagline">From the creators of <em>To The Best Of Our Knowledge</em></p>`

Record this exact string. Step 5 asserts it is byte-identical afterward.

- [ ] **Step 2: Add the custom setting**

In `package.json`, inside `config.custom`, insert immediately before the `"hero_title_image"` key (line 122):

```json
            "hero_tagline": {
                "type": "text",
                "default": "From the creators of <em>To The Best Of Our Knowledge</em>",
                "description": "Homepage hero tagline. Limited inline HTML (e.g. <em>) is allowed.",
                "group": "homepage"
            },
```

- [ ] **Step 3: Render the tagline from the setting**

In `partials/components/home-hero.hbs`, replace line 11:

```handlebars
        <p class="wc-hero-tagline">From the creators of <em>To The Best Of Our Knowledge</em></p>
```

with:

```handlebars
        {{!-- Tagline is editable in Ghost Admin → Design (custom.hero_tagline).
             Triple-stache is deliberate: the field carries <em> around the show
             title, and Ghost custom settings have no rich-text type. Only
             Admins/Owner can edit Design settings. --}}
        {{#if @custom.hero_tagline}}
            <p class="wc-hero-tagline">{{{@custom.hero_tagline}}}</p>
        {{/if}}
```

- [ ] **Step 4: Restart Ghost so it picks up the new setting**

`package.json` changes are config, not templates — a refresh is not enough:

```bash
ssh wc-ghostdev 'sudo systemctl restart ghost-dev'
```

Wait ~15 s for Ghost to come back up.

- [ ] **Step 5: Verify the output is byte-identical to the baseline**

```bash
curl -sL --max-time 20 https://wondercabinet.riechers.co/ \
  | grep -o '<p class="wc-hero-tagline">.*</p>'
```

Expected: **exactly** the string recorded in Step 1, including the `<em>` tags. If the `<em>` renders as escaped `&lt;em&gt;`, the triple-stache was written as a double-stache — fix it.

- [ ] **Step 6: Verify gscan still passes**

```bash
npm run test
```

Expected: no new errors. (Warnings pre-existing on this theme are acceptable; compare against the count before your change if unsure.)

- [ ] **Step 7: Commit**

```bash
git add package.json partials/components/home-hero.hbs
git commit -m "refactor(wc): move homepage hero tagline into a custom setting

Pure refactor — rendered output is byte-identical. Triple-stache keeps
the <em> around the show title, which Ghost's plain-text custom settings
cannot carry otherwise."
```

---

## Task 3: Strip the sponsor tagline out of the Luminous wordmark asset

**Files:**
- Modify: `assets/images/luminous/wordmark.svg`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: a wordmark asset with viewBox `0 0 2400 419` containing only the `LUMINOUS` logotype and the dot leader. Task 4 depends on this — if Task 4 lands first, the page shows the old baked tagline *and* the new live one simultaneously.

**Context:** The file's structure was verified directly. It is line-based and unambiguous:

| Lines | Contents | Fate |
|---|---|---|
| 1–18 | XML decl, `<svg>`, `<defs>` with `.cls-1` (dashed stroke) / `.cls-2` (cream fill) | Keep |
| **19–98** | `<g>` — 78 `<path>`, y 474–691 — **the sponsor tagline** | **Delete** |
| 99–108 | `<g>` — 8 `<path>`, y 39–287 — the `LUMINOUS` logotype | Keep |
| 109 | `<line class="cls-1">` at y=383.71 — the dot leader | Keep |
| 110 | `</svg>` | Keep |

The crop height of **419** is derived, not guessed: after deletion the true ink bbox runs y=31→388, and the original top padding is 31, so `388 + 31 = 419` reproduces it symmetrically. Verified by render.

- [ ] **Step 1: Confirm the file still matches the expected structure**

Line numbers are only safe if the file is untouched since the audit:

```bash
grep -n -E "</defs>|^  <g>|^  </g>|<line|</svg>" assets/images/luminous/wordmark.svg
```

Expected exactly:

```
18:  </defs>
19:  <g>
98:  </g>
99:  <g>
108:  </g>
109:  <line class="cls-1" x1="129.99" y1="383.71" x2="2276.45" y2="383.71"/>
110:</svg>
```

If it differs, stop and re-derive the group boundaries before proceeding.

- [ ] **Step 2: Delete the tagline group and crop the viewBox**

```bash
python3 - <<'EOF'
p = 'assets/images/luminous/wordmark.svg'
lines = open(p).read().split('\n')
assert lines[18].strip() == '<g>' and lines[97].strip() == '</g>', 'structure moved; re-audit'
# Drop lines 19-98 (1-indexed) = indices 18..97 — the 78-path sponsor tagline group.
out = lines[:18] + lines[98:]
s = '\n'.join(out).replace('viewBox="0 0 2400 758"', 'viewBox="0 0 2400 419"')
assert 'viewBox="0 0 2400 419"' in s, 'viewBox not rewritten'
open(p, 'w').write(s)
EOF
```

- [ ] **Step 3: Verify structure, size, and that the logotype survived intact**

```bash
grep -c '<path' assets/images/luminous/wordmark.svg   # expect 8
grep -o 'viewBox="[^"]*"' assets/images/luminous/wordmark.svg  # expect 0 0 2400 419
grep -c 'cls-1' assets/images/luminous/wordmark.svg   # expect 2 (style rule + the <line>)
wc -c < assets/images/luminous/wordmark.svg           # expect ~3969, was 33886
```

- [ ] **Step 4: Verify the render visually**

```bash
SCRATCH=/private/tmp/claude-501/-Users-mriechers--herdr-worktrees-wonder-cabinet-episode-name-change/0cb9ec89-002f-479a-bb71-d47e92abd8b0/scratchpad
rsvg-convert -w 1240 -b '#0a0a0a' assets/images/luminous/wordmark.svg -o "$SCRATCH/wordmark-check.png"
magick "$SCRATCH/wordmark-check.png" -trim -format "ink: %wx%h offset %X%Y\n" info:
```

Expected: `ink: 1123x185 offset +63+16` — symmetric 16px top/bottom padding.

Then **open `$SCRATCH/wordmark-check.png` and look at it.** It must show `LUMINOUS` above a dotted leader line, with no tagline text beneath and no clipped letterforms.

- [ ] **Step 5: Commit**

```bash
git add assets/images/luminous/wordmark.svg
git commit -m "refactor(luminous): strip sponsor tagline out of wordmark.svg

The tagline was 78 outlined vector paths baked into the logo asset, so
the sponsor name could not be edited at all. Removed; viewBox cropped
758 -> 419 to preserve the original padding. The asset is now a pure
wordmark, as multi-brand-design-system.md already described it.
34KB -> 4KB. Tagline returns as live text in the next commit."
```

---

## Task 4: Render the Luminous tagline as live text from a custom setting

**Files:**
- Modify: `package.json:84-88` (insert after `luminous_youtube_music_link`)
- Modify: `partials/components/luminous-hero.hbs:1-15`
- Modify: `assets/css/screen.css:2253` (after `.wc-hero-title--luminous`)

**Interfaces:**
- Consumes: the trimmed asset from Task 3; the `{{#if}}` + triple-stache pattern from Task 2.
- Produces: setting `luminous_hero_tagline`; CSS class `.wc-hero-tagline--luminous`.

- [ ] **Step 1: Assert the old name is gone and the new one is not yet present**

```bash
curl -sL --max-time 20 https://wondercabinet.riechers.co/luminous/ \
  | grep -o -E 'Transdisciplinary|Psychedelic Research and Education'
```

Expected after Task 3: **no output** — the old name left with the SVG paths, and the new one has not landed. (The old name was never in the HTML, only in the image; this asserts the new text is genuinely absent before you add it.)

- [ ] **Step 2: Add the custom setting**

In `package.json`, inside `config.custom`, insert immediately after the `"luminous_youtube_music_link"` block (closing brace on line 88):

```json
            "luminous_hero_tagline": {
                "type": "text",
                "default": "Conversations from the University of Wisconsin–Madison Center for Psychedelic Research and Education",
                "description": "Luminous hero tagline / sponsor credit. Limited inline HTML is allowed.",
                "group": "homepage"
            },
```

**Check the dash.** `Wisconsin–Madison` uses an en dash (U+2013), not a hyphen. Verify:

```bash
grep -c 'Wisconsin–Madison' package.json   # expect 1
grep -c 'Wisconsin-Madison' package.json   # expect 0
```

- [ ] **Step 3: Add the tagline to the hero and correct the stale comment**

Replace the whole of `partials/components/luminous-hero.hbs` with:

```handlebars
{{!--
    Luminous Landing Hero
    Mirrors components/home-hero.hbs, but for the /luminous/ collection: the eye-icon
    motif above the LUMINOUS wordmark, then the sponsor credit in the under-wordmark
    slot that WC home fills with wc-hero-tagline.

    The credit used to be 78 outlined vector paths baked into wordmark.svg, which made
    the sponsoring center's name uneditable. It is now live text from a custom setting
    (Ghost Admin → Design). Wavy background lives on the .wc-hero-zone wrapper
    (index-luminous.hbs).
--}}

<section class="wc-hero wc-hero--luminous">
    <div class="wc-hero-content gh-inner">
        <img src="{{asset "images/luminous/eye-icon-violet.png"}}" alt="" aria-hidden="true" class="wc-hero-eye">
        <img src="{{asset "images/luminous/wordmark.svg"}}" alt="Luminous" class="wc-hero-title wc-hero-title--luminous">
        {{#if @custom.luminous_hero_tagline}}
            <p class="wc-hero-tagline wc-hero-tagline--luminous">{{{@custom.luminous_hero_tagline}}}</p>
        {{/if}}
    </div>
</section>
```

- [ ] **Step 4: Style the tagline**

In `assets/css/screen.css`, insert immediately after the `.wc-hero-title--luminous` rule (which ends at line 2255):

```css
/* Luminous hero tagline: the sponsor credit, formerly baked into wordmark.svg.
   A ~99-character institutional name rather than WC's short quip, so it takes a
   smaller size and its own measure. Roman, not italic — WC's italic marks a show
   title and there is none here. Sits on the near-black brand band (~19:1 on cream). */
.wc-hero-tagline--luminous {
    font-style: normal;
    font-size: 1.8rem;
    line-height: 1.45;
    max-width: 44ch;
    margin-top: var(--wc-spacing-sm);
}

@media (max-width: 767px) {
    .wc-hero-tagline--luminous {
        font-size: 1.5rem;
    }
}
```

`.wc-hero-content` is a centered flex column with `text-align: center`, so the `max-width` centers the block without extra rules.

- [ ] **Step 5: Restart Ghost for the new setting**

```bash
ssh wc-ghostdev 'sudo systemctl restart ghost-dev'
```

Wait ~15 s.

- [ ] **Step 6: Verify the tagline renders with the correct name and dash**

```bash
curl -sL --max-time 20 https://wondercabinet.riechers.co/luminous/ \
  | grep -o '<p class="wc-hero-tagline wc-hero-tagline--luminous">[^<]*</p>'
```

Expected: `<p class="wc-hero-tagline wc-hero-tagline--luminous">Conversations from the University of Wisconsin–Madison Center for Psychedelic Research and Education</p>`

Confirm the en dash survived the round trip (not `&#8211;`-mangled or downgraded to a hyphen).

- [ ] **Step 7: Verify visually at desktop and mobile**

Load https://wondercabinet.riechers.co/luminous/ and check:
- Tagline sits directly beneath the dot leader, visually continuous with the wordmark — not floating oddly far below it.
- It wraps to about two lines on desktop, and the wrap point is not awkward (e.g. not orphaning `Education`). Tune `max-width` if it is.
- It is legible everywhere the cream wavy pattern runs bright behind it. If any local stretch is hard to read, that is a real finding — report it rather than papering over it.
- At ≤767px it stays readable and does not overflow.

- [ ] **Step 8: Verify the empty-field behavior**

In Ghost Admin → Design, clear the Luminous hero tagline field and save. Reload `/luminous/`.

Expected: the `<p>` disappears entirely; no empty paragraph, no leftover gap. Then **restore the field to the default value** before continuing.

- [ ] **Step 9: Commit**

```bash
git add package.json partials/components/luminous-hero.hbs assets/css/screen.css
git commit -m "feat(luminous): sponsor credit as live text from a custom setting

The sponsoring center renamed from the Transdisciplinary Center for
Research in Psychoactive Substances to the Center for Psychedelic
Research and Education. The credit is now editable in Ghost Admin
instead of being baked into wordmark.svg, and it gains screen-reader
and search-engine visibility it never had as text-in-an-image.

Exact house-style wording is still being confirmed with the client —
the setting means that lands without a deploy."
```

---

## Task 5: Update documentation

**Files:**
- Modify: `docs/luminous/brand-guide.md:117-118`
- Modify: `docs/multi-brand-design-system.md:106`
- Create: `docs/luminous/sponsor-rename-handoff.md`

**Interfaces:**
- Consumes: the asset and template changes from Tasks 3–4.
- Produces: nothing code-facing.

- [ ] **Step 1: Correct the wordmark description in the brand guide**

In `docs/luminous/brand-guide.md`, replace the "Website Wordmark" entry (line 118):

```markdown
**`LuminousWeb_Website-Wordmark.svg`** — Decorative "LUMINOUS" wordmark in cream with dot-leader treatment. 2400×758 viewBox.
```

with:

```markdown
**`LuminousWeb_Website-Wordmark.svg`** — Decorative "LUMINOUS" wordmark in cream with
dot-leader treatment. 2400×758 viewBox.

> **The source asset also carries the sponsor tagline** as outlined vector paths beneath
> the dot leader — a detail this guide originally omitted. The theme's copy
> (`assets/images/luminous/wordmark.svg`) has had those paths removed and its viewBox
> cropped to 2400×419; the credit is now live text from the `luminous_hero_tagline`
> custom setting. See [`sponsor-rename-handoff.md`](./sponsor-rename-handoff.md).
```

- [ ] **Step 2: Record the rename in the brand guide**

Append a new section to `docs/luminous/brand-guide.md`, immediately before `## File Information`:

```markdown
---

## Sponsor rename (2026-07-26)

The center sponsoring *Luminous* changed its name:

| | |
|---|---|
| **Was** | Transdisciplinary Center for Research in Psychoactive Substances (TCRPS) |
| **Now** | Center for Psychedelic Research and Education (CPRE) |
| **Parent** | University of Wisconsin–Madison, School of Pharmacy |
| **URL** | https://research.pharmacy.wisc.edu/cpre/ |

Same entity — CPRE's site still carries legacy "TCRPS" in its Rennebohm Hall address block,
which confirms continuity rather than a new center. Note the **en dash** in
"Wisconsin–Madison" (UW house style).

Every logo lockup and both podcast cover arts in the asset drop still bake the old name and
need re-exports from Art & Sons — tracked in
[`sponsor-rename-handoff.md`](./sponsor-rename-handoff.md).
```

- [ ] **Step 3: Update the cross-brand asset table**

In `docs/multi-brand-design-system.md`, line 106 currently reads:

```markdown
| Wordmark / title | `WonderCabinet-title.png` | `WebsiteGraphics/LuminousWeb_Website-Wordmark.svg` | — |
```

Replace with:

```markdown
| Wordmark / title | `WonderCabinet-title.png` | `WebsiteGraphics/LuminousWeb_Website-Wordmark.svg` | Luminous copy is trimmed to wordmark + dot leader only (viewBox 2400×419); the sponsor tagline it used to bake in is now live text via `luminous_hero_tagline` |
| Hero tagline | `hero_tagline` custom setting | `luminous_hero_tagline` custom setting | Both are content slots, not assets. Rendered with triple-stache so `<em>` survives |
```

- [ ] **Step 4: Create the handoff doc**

Create `docs/luminous/sponsor-rename-handoff.md`:

```markdown
# Luminous Sponsor Rename — Outstanding Asset Work

**Date**: 2026-07-26
**Context**: [`../superpowers/specs/2026-07-25-luminous-sponsor-rename-design.md`](../superpowers/specs/2026-07-25-luminous-sponsor-rename-design.md)

## The rename

| | |
|---|---|
| **Was** | Transdisciplinary Center for Research in Psychoactive Substances (TCRPS) |
| **Now** | Center for Psychedelic Research and Education (CPRE) |
| **Parent** | University of Wisconsin–Madison, School of Pharmacy |
| **URL** | https://research.pharmacy.wisc.edu/cpre/ |

## Done in the theme

The `/luminous/` hero credit is live text from the `luminous_hero_tagline` custom setting
(Ghost Admin → Design). The name is editable there without a deploy. Live Ghost content was
audited and contained no mentions of the old name.

## Outstanding — needs Art & Sons

These bake the old name as outlined vector paths or flattened raster. They cannot be
regenerated from this repo: no licensed Futura, no vector sources here. All paths are
relative to `design-assets/site-design/Luminous-Brand-Web-Podcast/` at the metarepo root.

| Priority | Asset | Why it matters |
|---|---|---|
| **1** | `PodcastGraphics/LuminousLogo_ShowCoverArt-3000x3000.png` | **Live in the Apple and Spotify feeds now.** Highest public exposure of the old name. |
| **1** | `PodcastGraphics/LuminousLogo_EpisodeDefault-3000x3000.png` | Default episode artwork; same feeds. |
| 2 | `LogoAssets/Luminous-_PrimaryMarkOnWhite-1920x1920.png` | Primary lockup, light backgrounds |
| 2 | `LogoAssets/Luminous-_PrimaryMarkOnViolet-1920x1920.png` | Primary lockup, violet |
| 2 | `LogoAssets/Luminous-_PrimaryMarkOnDark-1920wide.png` | Primary lockup, dark |
| 2 | `LogoAssets/Luminous-_HorzontalPrimaryMarkOnWhite-1920wide.png` | Horizontal lockup |
| 2 | `LogoAssets/Luminous-_HorzontalPrimaryMarkOnViolet.png` | Horizontal lockup, violet |
| 2 | `LogoAssets/Luminous-_WordmarkOnWhite-1920x1920 copy.png` | Wordmark-only treatment |
| 3 | `WebsiteGraphics/Episode-art-template.psd` | Template — stale text propagates into every new episode's art |
| 3 | `Luminous_BrandGuide.ai` / `.pdf` | Brand guide masters |

Eye icons, the wavy background, and the line separator carry **no** text and need no rework.

## When new exports arrive

The theme's `assets/images/luminous/wordmark.svg` should stay trimmed to wordmark + dot
leader. Keeping the credit as live text is the better arrangement regardless — it is
editable, accessible to screen readers, indexable, and wraps responsively. Do not
reintroduce a tagline baked into the asset.

## Open question

Exact house-style wording is being confirmed with the client. Current default:

> Conversations from the University of Wisconsin–Madison Center for Psychedelic Research and Education

Correct it in Ghost Admin → Design, not in code.
```

- [ ] **Step 5: Verify no stale references to the old name remain in the theme**

```bash
grep -rn -i -E "transdisciplinary|psychoactive|TCRPS" \
  --include="*.hbs" --include="*.css" --include="*.js" --include="*.json" \
  . | grep -v node_modules | grep -v assets/built | grep -v package-lock
```

Expected: **no output.**

```bash
grep -rn -i -E "transdisciplinary|psychoactive|TCRPS" docs/ | grep -v agentic-development
```

Expected: only historical/documentary mentions inside `sponsor-rename-handoff.md`, `brand-guide.md`'s new rename section, and the design spec — all of which name the old term deliberately, to record what changed.

- [ ] **Step 6: Commit**

```bash
git add docs/luminous/brand-guide.md docs/multi-brand-design-system.md docs/luminous/sponsor-rename-handoff.md
git commit -m "docs(luminous): record the CPRE rename and track outstanding assets

Corrects the brand guide, which described wordmark.svg as a plain
wordmark and omitted that it also baked in the sponsor tagline. Adds a
handoff doc tracking the logo lockups and both podcast cover arts that
still carry the old name and need Art & Sons re-exports."
```

---

## Task 6: Cross-brand QA gate

**Files:** none modified — this is the integration gate.

**Interfaces:**
- Consumes: everything from Tasks 1–5.

**Context:** `CLAUDE.md` requires the `wc-theme-qa` skill before merging anything touching shared CSS, `partials/components/`, `audio-player.js`, or `--show-accent`. This work touches shared `screen.css` and two component partials, so the gate is mandatory, not optional.

- [ ] **Step 1: Run the cross-brand QA harness**

Invoke the `wc-theme-qa` skill.

It automates `docs/luminous/cross-brand-qa-checklist.md`: the §A "WC is a visual no-op" invariant, per-brand accent variables, AA contrast, and WC-vocabulary leaks across both brand contexts.

**§A is the critical one here.** Task 2 changed how the WC homepage tagline is produced. If §A reports any visual delta on Wonder Cabinet, that is a real regression — investigate rather than re-baseline.

When checking brand variables by hand, read from `document.body`, **not** `document.documentElement` — Sprint 2 moved brand context to a body class, so querying `:root` returns WC green even on a correctly-branded Luminous page.

- [ ] **Step 2: Run gscan**

```bash
npm run test
```

Expected: no new errors versus the pre-change baseline.

- [ ] **Step 3: Confirm the built assets synced back**

```bash
git status --short assets/built/
```

CSS changed in Task 4, so `assets/built/` should show modifications that gulp produced on the CT and synced back. If it is empty, the rebuild did not happen — check `mutagen sync list` and `ssh wc-ghostdev 'systemctl is-active ghost-theme-watch'`. Never hand-edit these files.

- [ ] **Step 4: Commit built assets if changed**

```bash
git add assets/built/
git commit -m "chore(build): rebuild assets for Luminous sponsor credit styling"
```

- [ ] **Step 5: Open the stacked PR**

```bash
git push -u origin name-change
gh pr create --base sprint/2-brand-switch --title "Luminous sponsor rename — TCRPS → CPRE" --body "$(cat <<'BODY'
The center sponsoring *Luminous* renamed to the **Center for Psychedelic Research and
Education** (CPRE), UW–Madison School of Pharmacy. Same entity — their site still carries
legacy "TCRPS" in its address block.

Stacked on #53 (`sprint/2-brand-switch`), which is itself stacked on #46. Since #53 is a
draft held for a combined deploy, this rides along with that deploy rather than shipping
independently.

## What changed

- **`wordmark.svg` no longer bakes the sponsor name.** It was 78 outlined vector paths, so
  the name could not be edited at all. Stripped; viewBox cropped 758 → 419 to preserve the
  original padding. 34KB → 4KB. `LUMINOUS` renders at exactly the same size.
- **Both brands' hero taglines are now Ghost custom settings** (`hero_tagline`,
  `luminous_hero_tagline`), editable in Admin → Design. The Luminous credit also gains
  screen-reader and search visibility it never had as text-in-an-image, and now wraps
  responsively instead of scaling as one rigid graphic.
- **The Luminous show blurb reads from the `tag:luminous` description** instead of a
  hardcoded, truncated duplicate of it.
- Docs updated, including a correction: the brand guide described `wordmark.svg` as a plain
  wordmark and never mentioned it carried a tagline.

The WC homepage change is a pure refactor — rendered output is byte-identical.

## Still outstanding

Every logo lockup and **both podcast cover arts** still bake the old name, and the cover
arts are live in the Apple and Spotify feeds right now. Those need Art & Sons re-exports
from the `.ai` masters and cannot be done from this repo. Tracked in
`docs/luminous/sponsor-rename-handoff.md`.

## Open question

Exact house-style wording is being confirmed with the client. The custom-setting design
means that correction lands in Ghost Admin without another trip through this three-deep
stack.

## Verification

- `wc-theme-qa` cross-brand harness, including the §A "WC is a visual no-op" invariant
- `gscan`
- Desktop + mobile visual check on `/luminous/` and `/`
- Empty-field check: clearing either tagline setting collapses the slot cleanly

🤖 Generated with [Claude Code](https://claude.com/claude-code)
BODY
)"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| §1 Split the wordmark asset | 3 |
| §2 Tagline → custom setting, both brands | 2 (WC), 4 (Luminous) |
| §3 De-hardcode the Luminous blurb | 1 |
| §4 CSS | 4 |
| Files table (9 files) | 1–5 — all nine covered |
| Out of scope — asset tracker | 5 (handoff doc) |
| Verification (QA harness, gscan, visual, empty-field) | 4 Step 8, 6 |
| Stacking | 6 Step 5 |

No gaps.

**Placeholder scan:** No TBD/TODO. Every code step carries literal content. The one branch point — whether `{{tag.description}}` resolves — is Task 1 Step 1, with both outcomes written out and a concrete fallback, so it is a decision procedure rather than a placeholder. The "tune `max-width` if the wrap is awkward" instruction in Task 4 Step 7 ships a working default (`44ch`) and asks for a judgment call on top of it.

**Type/name consistency:** Setting names `hero_tagline` and `luminous_hero_tagline` are identical in `package.json`, both templates, the docs, and the PR body. CSS class `.wc-hero-tagline--luminous` matches between `luminous-hero.hbs` and `screen.css`. viewBox `0 0 2400 419` matches across Task 3, the brand guide, and the design-system table. The default tagline string is byte-identical in `package.json`, the handoff doc, and the Global Constraints block.
