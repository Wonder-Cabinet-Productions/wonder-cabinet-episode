# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wonder Cabinet** is a custom Ghost theme for a podcast from the creators of *To The Best Of Our Knowledge*. Built on Ghost's **Episode** theme (official podcast theme) using `@tryghost/shared-theme-assets` v2 for Ghost CMS 5.0+.

**Read `/docs/` before making significant changes** - especially `HANDLEBARS_HELPERS.md`, `GHOST_THEME_REFERENCE.md`, and `AUDIO_PLAYER.md`.

## Design Authority

**When making design changes, always follow the brand guide and wireframes in `/docs/`.**

- **Brand guide**: `docs/wonder-cabinet/brand-guide.md` - colors, typography, logo usage
- **Wireframes**: Design mockups when provided
- **Typography**: Jost (Futura alternative) for headlines, EB Garamond (Garamond alternative) for body - loaded via Google Fonts

Do not deviate from the brand spec unless explicitly instructed.

## Commands

```bash
npm run dev      # Start Gulp watch with livereload
npm run zip      # Build and create distribution archive
npm run test     # Run GScan theme validation
npx gulp build   # One-time build (CSS + JS)
```

## Brand Implementation

The theme implements the Wonder Cabinet brand identity:

| Element | Value | CSS Variable |
|---------|-------|--------------|
| **Green** | `#10A544` | `--wc-green` |
| **Black** | `#000000` | `--wc-black` |
| **Cream** | `#FFFAEB` | `--wc-cream` |
| **Dark Green** | `#043013` | `--wc-dark-green` |
| **Headline Font** | Jost | `--font-heading` |
| **Body Font** | EB Garamond | `--font-body` |

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
| `partials/components/newsletter-feature.hbs` | Featured newsletter card (injected in homepage feed) |
| `partials/audio-player-hero.hbs` | WaveSurfer.js audio player hero |
| `partials/podcast-services.hbs` | Apple/Spotify/YouTube Music links |

### Homepage Content Model

The homepage (`home.hbs`) does **not** use Ghost's featured flag for the hero or episode list. The episode list shows the 4 most recent posts (excluding `tag:newsletter`) in chronological order.

**Featured newsletter card**: A `newsletter-feature.hbs` partial is injected after the 2nd episode in the list. It queries for a single post matching `tag:newsletter+featured:true`. If no post matches that filter, nothing renders — the card silently disappears and the episode list closes up. To show a newsletter callout on the homepage:

1. Tag the post with `newsletter`
2. Mark it as **Featured** in Ghost Admin
3. Only one should be featured at a time (the query uses `limit="1"`)

The card renders using the same `list-item.hbs` partial with the `isNewsletterFeature=true` flag, which adds:
- A `wc-episode-card--newsletter` CSS class
- A "Latest Newsletter" badge instead of the generic "Featured" badge
- A "Read" button instead of "View Episode"

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
- CSS/JS changes require rebuild: `npx gulp build`
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
