# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wonder Cabinet** is a custom Ghost theme for a podcast from the creators of *To The Best Of Our Knowledge*. Built on Ghost's **Episode** theme (official podcast theme) using `@tryghost/shared-theme-assets` v2 for Ghost CMS 5.0+.

**Read `/docs/` before making significant changes** - especially `HANDLEBARS_HELPERS.md`, `GHOST_THEME_REFERENCE.md`, and `AUDIO_PLAYER.md`.

## Design Authority

**When making design changes, always follow the brand guide and wireframes in `/docs/`.**

- **Brand guide**: `docs/wonder-cabinet/brand-guide.md` - colors, typography, logo usage
- **Wireframes**: Design mockups when provided
- **Typography target**: Jost (Futura alternative) for headlines, EB Garamond (Garamond alternative) for body - both on Google Fonts

Do not deviate from the brand spec unless explicitly instructed.

## Commands

```bash
npm run dev      # Start Gulp watch with livereload
npm run zip      # Build and create distribution archive
npm run test     # Run GScan theme validation
```

Note: There is no separate `build` command - `npm run dev` handles building. For a one-time build, run `npx gulp css && npx gulp js`.

## Brand Guide

The theme implements the Wonder Cabinet brand identity (see `docs/wonder-cabinet/brand-guide.md`):

| Element | Value | Notes |
|---------|-------|-------|
| **Green** | `#10A544` | Signature brand color |
| **Black** | `#000000` | Headers, UI elements |
| **Cream** | `#FFFAEB` | Backgrounds, light text |
| **Headline Font** | Futura Bold | Brand spec (theme uses Mona Sans as web substitute) |
| **Body Font** | Adobe Garamond | Brand spec |

**Current theme font**: Mona Sans (variable font) - consider updating to match brand typography.

## Architecture

### Build System

**Bundler**: Gulp with the following pipeline:

- **CSS Entry**: `assets/css/screen.css` → PostCSS → `assets/built/screen.css`
- **JS Entry**: Shared assets + `assets/js/main.js` → concat/uglify → `assets/built/main.min.js`
- **Livereload**: Watches `.hbs`, CSS, and JS files

**CSS Pipeline**: PostCSS with:
- `postcss-easy-import` - CSS imports from `@tryghost/shared-theme-assets`
- `autoprefixer` - Browser prefixes
- `cssnano` - Minification

**JS Pipeline**:
- Concatenates from `@tryghost/shared-theme-assets/assets/js/v2/`
- Adds local `assets/js/lib/*.js` (if exists) and `assets/js/main.js`
- Uglifies for production

### Template Structure

| Template | Purpose |
|----------|---------|
| `default.hbs` | Main layout (navbar, footer, theme settings) |
| `home.hbs` | Homepage with hero header, podcast services, episode list |
| `index.hbs` | Paginated episode archive |
| `post.hbs` | Episode/post page with article component |
| `page.hbs` | Static pages |
| `tag.hbs` | Tag archive with header |
| `author.hbs` | Author archive with header |

### Partials (from shared-theme-assets)

| Partial | Purpose |
|---------|---------|
| `partials/components/navbar.hbs` | Site navigation with layout options |
| `partials/components/header.hbs` | Hero/header section |
| `partials/components/header-content.hbs` | Header text content |
| `partials/components/article.hbs` | Post/page content display |
| `partials/components/list.hbs` | Episode/post list |
| `partials/components/list-item.hbs` | Individual list item |
| `partials/components/cta.hbs` | Email signup call-to-action |
| `partials/components/footer.hbs` | Site footer |
| `partials/components/tag-header.hbs` | Tag archive header |
| `partials/components/author-header.hbs` | Author archive header |
| `partials/podcast-services.hbs` | Apple/Spotify/YouTube Music links |
| `partials/icons/*.hbs` | SVG icon components |
| `partials/pswp.hbs` | PhotoSwipe lightbox |

### CSS Structure

```
assets/css/
└── screen.css              # Entry point - imports shared assets + custom styles
    ├── @import shared-theme-assets/v2/screen.css
    ├── Mona Sans font-face
    ├── CSS custom properties
    ├── Typography overrides
    ├── Navbar customizations
    ├── Header/hero styles
    ├── Podcast services section
    ├── Post list styling
    ├── CTA section
    └── Archive page styles

assets/built/
├── screen.css              # Compiled CSS (committed)
└── main.min.js             # Compiled JS (committed)
```

### JavaScript

| File | Purpose |
|------|---------|
| `assets/js/main.js` | Theme-specific JS (header height, pagination init) |
| Shared assets | Pagination, galleries, lightbox from `@tryghost/shared-theme-assets` |

The main.js sets the `--services-height` CSS variable for viewport calculations and initializes infinite scroll pagination.

## Ghost Admin Custom Settings

Defined in `package.json` under `config.custom`:

| Setting | Type | Purpose |
|---------|------|---------|
| `typography` | select | Wide or Narrow font variation |
| `background_color` | color | Page background (default: #ebebeb) |
| `navigation_layout` | select | Logo left/middle/stacked |
| `email_signup_text` | text | CTA section heading |
| `footer_text` | text | Custom footer content |
| `primary_header` | text | Homepage hero main text |
| `secondary_header` | text | Homepage hero subtitle |
| `apple_podcasts_link` | text | Apple Podcasts URL |
| `spotify_link` | text | Spotify URL |
| `youtube_music_link` | text | YouTube Music URL |

Access in templates: `{{@custom.apple_podcasts_link}}`

## Development Notes

- Ghost hot-reloads `.hbs` templates automatically
- CSS/JS changes require the dev server (`npm run dev`) or manual rebuild
- The `assets/built/` folder must be committed - Ghost serves from there
- Theme uses `@tryghost/shared-theme-assets` v2 for base components
- Auto light/dark text contrast calculation runs on page load based on background color

## Image Handling

Ghost responsive image sizes (defined in `package.json`):

| Size | Width | Use Case |
|------|-------|----------|
| `xs` | 150px | Thumbnails |
| `s` | 300px | Small displays |
| `m` | 720px | Episode cards |
| `l` | 960px | Feature images |
| `xl` | 1200px | Large displays |
| `xxl` | 2000px | Hero images |

Use `{{img_url feature_image size="m" format="webp"}}` in templates.

## Key CSS Patterns

### Typography Variation
The theme uses Mona Sans variable font with `font-variation-settings`:
- Wide: `"wdth" 110` (default)
- Narrow: `"wdth" 80-100`
- Headlines: `"wdth" 125`, weight 800

### Color Contrast
Light/dark text is automatically determined by background color luminance (YIQ formula). Classes applied to `<html>`:
- `.has-light-text` - for dark backgrounds
- `.has-dark-text` - for light backgrounds

### Container Width
```css
.gh-inner {
    --container-width: 960px;
}
```

## Parent Workspace Context

This theme lives within a larger Ghost development environment at `ghost-dev/`. When committing changes to this theme, ensure you're in this directory (not the parent repo).
