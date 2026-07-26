# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Dev loop — read before running ANY command (rev 2026-06-05)

This directory exists on **two machines**, kept identical by a mutagen sync (`wc-theme` session, ~2 s latency):

| Machine | Role | What you may do here |
|---|---|---|
| **Mark's Mac** (`~/Developer/wonder-cabinet/ghost-dev/content/themes/wonder-cabinet-episode`) | Source of truth. **Git lives ONLY here.** | Edit files, commit, push. Do NOT run gulp/Ghost — there is no local runtime. |
| **LXC `ghost01`** (`/home/mark/ghost-dev/content/themes/wonder-cabinet-episode`, ssh alias `wc-ghostdev`) | Runtime mirror. **No `.git` here — deliberate.** | Read files, run gulp/gscan, inspect logs. Do NOT edit source here (Mac wins sync conflicts) and do NOT `git init`. |

**The loop:** edit on the Mac → mutagen syncs → `ghost-theme-watch.service` (gulp) rebuilds `assets/built/` on the CT → verify at **https://wondercabinet.riechers.co**. `.hbs` changes need only a refresh; `routes.yaml`/config changes need `ssh wc-ghostdev 'sudo systemctl restart ghost-dev'`.

**To tell which machine you're on:** `hostname` → `ghost01` = the CT (runtime mirror); anything else = treat as the Mac. The `npm run dev` command below is ALREADY RUNNING on the CT as a systemd unit — don't start a second watcher.

`node_modules/` is NOT synced (platform-specific) — `npm install` separately per machine if needed. `assets/built/` is generated on the CT and syncs back; never hand-edit it.

## ⚠️ Branch model — pick the right base BEFORE opening a PR

Full contract: **`docs/BRANCHING.md`**. The short version:

- **Sprint work targets the active `dev/<series>` integration branch — never `main`.** CI enforces this: a `sprint/*` branch opened against `main` fails the **Base Branch Guard** check. Fix with `gh pr edit <n> --base dev/<series>`.
- `main` accepts exactly three things: a **series rollup** (`dev/<series>` → `main`, rebase-merged), an **S1 hotfix** (`planning/TRIAGE.md`), and **repo plumbing** that touches no theme source.
- Merging to `main` **deploys to production** (`wondercabinetproductions.com`). Merging to `dev/<series>` does not — that branch is the QA target on `wondercabinet.riechers.co`.
- Sprint PRs squash-merge into the dev branch (one commit per sprint). After each merge, restack the sibling sprint branches — recipe in `docs/BRANCHING.md`.
- Both tiers require gscan (`Validate Theme`) to pass. `dev/**` is **strict**: a sprint branch must be up to date with the dev tip before it can merge.

Active series: **`dev/luminous`**.

## Project Overview

**Wonder Cabinet** is a custom Ghost theme for a podcast from the creators of *To The Best Of Our Knowledge*. Built on Ghost's **Episode** theme (official podcast theme) using `@tryghost/shared-theme-assets` v2 for Ghost CMS 5.0+.

**Read `/docs/` before making significant changes** - especially `HANDLEBARS_HELPERS.md`, `GHOST_THEME_REFERENCE.md`, and `AUDIO_PLAYER.md`.

## Design Authority

**When making design changes, always follow the brand guide and wireframes in `/docs/`.**

- **Brand guide**: `docs/wonder-cabinet/brand-guide.md` - colors, typography, logo usage
- **Wireframes**: Design mockups when provided
- **Typography**: Jost (Futura alternative) for headlines, EB Garamond (Garamond alternative) for body - loaded via Google Fonts

Do not deviate from the brand spec unless explicitly instructed.

## Dev Environment — the live-update loop (rev 2026-06-05: runtime moved to LXC `ghost01`)

**Ghost and gulp do NOT run on this Mac.** The runtime lives on a homelab Proxmox LXC (`ghost01`, SSH alias `wc-ghostdev`); this directory is the editing surface and git home. To iterate on designs:

1. **Edit theme files here and save.** That's the whole job — no build or run step.
2. A mutagen session (`wc-theme`) syncs saves to the CT in ~1–2 s, where a gulp watcher (`ghost-theme-watch.service`) rebuilds `assets/built/` automatically and syncs it back here.
3. **Verify at https://wondercabinet.riechers.co** — refresh the browser (`.hbs` edits show immediately; CSS/JS edits show after the ~2 s rebuild). chrome-devtools MCP works against this URL for one-off visual checks. Admin is at `/ghost/`.
4. **Before merging anything touching shared CSS, `partials/components/`, `audio-player.js`, or `--show-accent`** — run the **`wc-theme-qa`** skill. It automates `docs/luminous/cross-brand-qa-checklist.md` across both brand contexts via `agent-browser`: the §A "WC is a visual no-op" invariant, accent variables, AA contrast, and WC-vocabulary leaks. It catches *unintended* drift only — `brand-guardian` still gates design intent.

   Note when checking brand vars by hand: read from `document.body`, **not** `document.documentElement`. Sprint 2 moved brand context to a body class, so querying `:root` returns WC green even on a correctly-branded Luminous page.

If changes don't appear: `mutagen sync list` (expect `wc-theme … Watching for changes`) and `ssh wc-ghostdev 'systemctl is-active ghost-dev ghost-theme-watch'`. Never start Ghost or gulp locally. Full container reference: `../../../knowledge/ghost01-lxc-readme.md` (+ `ghost01-lxc-notes.md`) in the ghost-dev workspace.

## Commands

```bash
# Reference only — `dev` runs as a service on ghost01, NOT here. gscan also gates PRs in CI.
npm run dev      # Gulp watch with livereload (= ghost-theme-watch.service on the CT)
npm run zip      # Build and create distribution archive
npm run test     # Run GScan theme validation
```

## Brand Implementation

The theme implements the Wonder Cabinet brand identity:

Official brand colors per the style guide (`docs/WonderCabinet-BrandGuide-010726.pdf`):

| Element | Value | CSS Variable |
|---------|-------|--------------|
| **Green** | `#10A544` | `--wc-green` |
| **Black** | `#000000` | `--wc-black` |
| **Cream** | `#FFFAEB` | `--wc-cream` |
| **Headline Font** | Jost (Futura alternative) | `--font-heading` |
| **Body Font** | EB Garamond (Garamond alternative) | `--font-body` |

Note: `--wc-dark-green` (`#043013`) and `--wc-green-text` (`#087834`) are theme-derived values not in the official brand guide. They were created for accessibility (text contrast on cream) and dark UI elements. Use sparingly.

## Architecture

### Template Structure

| Template | Purpose |
|----------|---------|
| `default.hbs` | Main layout (navbar, footer, fonts) |
| `home.hbs` | Homepage with hero, podcast services, episode list |
| `index.hbs` | Paginated episode archive |
| `post.hbs` | Episode page with audio player hero |
| `page.hbs` | Static pages |
| `tag.hbs` | Tag archive with hero |
| `author.hbs` | Author archive |

### Custom Partials

| Partial | Purpose |
|---------|---------|
| `partials/components/navbar.hbs` | Custom navbar with centered logo, wave divider |
| `partials/components/home-hero.hbs` | Homepage hero with galaxy background |
| `partials/components/list-item.hbs` | Episode cards with green border, bracket buttons |
| `partials/components/cta.hbs` | Email signup with decorative brackets |
| `partials/components/footer.hbs` | Footer with cabinet illustration |
| `partials/components/tag-header.hbs` | Tag archive hero |
| `partials/components/bracket-button.hbs` | Reusable bracket button component |
| `partials/components/highlight-zone.hbs` | Configurable highlight card for series (newsletter, IoK, Luminous) |
| `partials/components/post-header.hbs` | Non-audio post header with feature image and share button |
| `partials/audio-player-hero.hbs` | WaveSurfer.js audio player hero |
| `partials/podcast-services.hbs` | Apple/Spotify/YouTube Music links |

### Homepage Content Model

The homepage (`home.hbs`) shows the 5 most recent posts (excluding `tag:newsletter` and `tag:luminous`) in chronological order.

**Highlight zones**: Three `highlight-zone.hbs` partials are injected between episode cards:
- After 2nd episode: **Latest Newsletter** (`tag:newsletter+featured:true`)
- After 3rd episode: **Island of Knowledge** (`tag:island-of-knowledge+featured:true`)
- After 4th episode: **From Luminous** (`tag:luminous+featured:true`)

Each zone queries for one featured post matching its filter. If no post matches, the zone silently disappears. To show a highlight zone:

1. Tag the post with the appropriate tag (e.g., `newsletter`, `island-of-knowledge`, `luminous`)
2. Mark it as **Featured** in Ghost Admin
3. Only one per tag should be featured at a time (each query uses `limit="1"`)

CTA text is data-driven: posts tagged `newsletter` show "Read", all others show "View Episode" with a play icon. Badge labels link to the corresponding tag page.

**Important**: The `badgeUrl` values in `home.hbs` are hardcoded to tag slugs (`/tag/newsletter/`, `/tag/island-of-knowledge/`, `/tag/luminous/`). If tag slugs change in Ghost Admin, these must be updated.

### Audio Player

The theme uses **WaveSurfer.js v7** for audio playback:

- **Library**: Loaded from unpkg CDN on post pages
- **Initialization**: `assets/js/audio-player.js`
- **Audio Detection**: Extracts URL from Ghost's `.kg-audio-card` element
- **Renders on ALL posts** - no conditional logic

Key features:
- Waveform visualization with brand colors
- Play/pause, skip forward (30s), skip back (15s)
- Time display
- Ghost's default audio card is hidden via CSS

### CSS Structure

```
assets/css/screen.css
├── @import shared-theme-assets/v2/screen.css
├── Brand System (variables, typography)
├── Bracket Button Component
├── Navbar
├── Home Hero
├── Podcast Services
├── Episode List/Cards
├── Email CTA
├── Footer
├── Audio Player Hero
├── Episode Notes
├── Tag Archive Hero
└── Archive/Section Headers
```

## Ghost Admin Custom Settings

Defined in `package.json` under `config.custom`:

| Setting | Type | Purpose |
|---------|------|---------|
| `background_color` | color | Page background (default: #000000) |
| `email_signup_text` | text | CTA section heading |
| `apple_podcasts_link` | text | Apple Podcasts URL |
| `spotify_link` | text | Spotify URL |
| `youtube_music_link` | text | YouTube Music URL |

Access in templates: `{{@custom.apple_podcasts_link}}`

## Development Notes

- Ghost hot-reloads `.hbs` templates automatically
- CSS/JS changes rebuild automatically — gulp watch on the CT fires on save (via mutagen) and the output syncs back; never edit `assets/built/*` by hand
- The `assets/built/` folder must be committed - Ghost serves from there
- Audio player JS is NOT bundled - loaded separately on post pages

## Asset Locations

Brand assets are in `assets/images/`:

| Asset | File |
|-------|------|
| Logo (dark bg) | `logo-primary-dark-bg-800w.png` |
| Bracket corners | `ui-bracket-corner-{position}.svg` (4 files) |
| Wave divider | `ui-wave-divider-light.svg` |
| Galaxy background | `bg-galaxy-spiral-1200w@2x.png` |
| Cabinet illustration | `illustration-footer-cabinet-table.svg` |
| Title graphic | `WonderCabinet-title.png` |
| Show cover art | `Show_Cover-Wonder-Cabinet.png` |
| Section divider | `ui-divider-thick.png` |

## Key CSS Patterns

### Spacing Variables
```css
--wc-spacing-xs: 8px;
--wc-spacing-sm: 16px;
--wc-spacing-md: 24px;
--wc-spacing-lg: 40px;
--wc-spacing-xl: 64px;
```

### Container Width
```css
.gh-inner {
    --container-width: 810px; /* Figma spec */
}
```

### Mobile Breakpoint
Most responsive styles use `@media (max-width: 767px)`.

## Parent Workspace Context

This theme lives within a larger Ghost development environment at `ghost-dev/`. When committing changes to this theme, ensure you're in this directory (not the parent repo).
