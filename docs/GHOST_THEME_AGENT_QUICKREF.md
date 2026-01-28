# Ghost Theme Development — Agent Quick Reference

> **Purpose:** Give agents working on the Wonder Cabinet theme a fast orientation to Ghost theming without consuming excessive context. This is a map, not a textbook — follow the links to go deeper.

---

## Where to Find Detailed Documentation

### The Library (centralized knowledge base)
Located at `the-lodge/knowledge/ghost-themes/`. Use the `research-assistant` agent or read files directly.

| Document | What It Covers | When to Read |
|----------|---------------|--------------|
| `ghost-themes-overview.md` | High-level intro, required files/helpers, GScan | First-time orientation |
| `ghost-theme-structure.md` | File layout, template hierarchy, `package.json` config | Setting up or adding templates |
| `ghost-theme-contexts.md` | 6 contexts, available data per context, `@site` global | Wiring data into templates |
| `ghost-custom-settings.md` | Custom settings (5 types, 20 max), `@custom` object | Adding admin-configurable options |
| `ghost-helpers-overview.md` | All 85+ Handlebars helpers with examples | **Primary reference** for any template work |
| `ghost-theme-development-guide.md` | Tutorial walkthrough, `routes.yaml`, advanced patterns | Deep dives, routing questions |

### Local Theme Docs (this repo's `docs/` directory)
Project-specific references tailored to the Wonder Cabinet theme.

| Document | What It Covers |
|----------|---------------|
| `GHOST_THEME_REFERENCE.md` | Template hierarchy, inheritance, partials, `@site` data |
| `HANDLEBARS_HELPERS.md` | All helpers with Wonder Cabinet-specific examples |
| `PACKAGE_JSON_CONFIG.md` | `package.json` fields: `image_sizes`, `card_assets`, `custom` settings |
| `ROUTES_CONFIG.md` | `routes.yaml` structure, collections, taxonomies |
| `AUDIO_PLAYER.md` | WaveSurfer.js integration, audio detection, player architecture |
| `AUDIO_PLAYER_INTEGRATION.md` | Audio player implementation details |
| `wonder-cabinet/brand-guide.md` | Brand colors, typography, logo usage — **design authority** |

### Ghost Official Docs (web)
- Full docs: https://docs.ghost.org/themes/
- LLM-optimized: https://docs.ghost.org/llms.txt
- GScan validator: https://gscan.ghost.org/

---

## Essential Concepts (60-Second Version)

### Required Files
Every Ghost theme **must** have: `index.hbs`, `post.hbs`, `package.json`

### Required Helpers (in `default.hbs`)
```handlebars
{{ghost_head}}     {{!-- in <head> --}}
{{ghost_foot}}     {{!-- before </body> --}}
{{body_class}}     {{!-- on <body> --}}
{{{body}}}         {{!-- where page content renders (triple-stash = raw HTML) --}}
```

### Template Selection Priority
```
post-{slug}.hbs → custom-{name}.hbs → post.hbs → index.hbs
page-{slug}.hbs → page.hbs → post.hbs
tag-{slug}.hbs  → tag.hbs  → index.hbs
home.hbs        → index.hbs
```

### 6 Contexts
`index` (home/lists), `post`, `page`, `tag`, `author`, `error`
- Detect with `{{#is "post"}}...{{/is}}`
- Each context exposes different data — check `ghost-theme-contexts.md`

### Key Data Objects
| Object | Scope | Examples |
|--------|-------|---------|
| `@site` | Global | `{{@site.title}}`, `{{@site.logo}}`, `{{@site.navigation}}` |
| `@custom` | Global | `{{@custom.background_color}}` (theme settings from `package.json`) |
| `{{title}}`, `{{content}}`, `{{url}}` | Post/Page | Direct output in context |
| `{{posts}}` | Index/Tag/Author | Loop with `{{#foreach posts}}` |

### Most-Used Helpers
```handlebars
{{#foreach posts}}...{{/foreach}}     {{!-- iterate collections --}}
{{#if feature_image}}...{{/if}}       {{!-- conditionals --}}
{{#has tag="podcast"}}...{{/has}}     {{!-- check properties --}}
{{#is "home"}}...{{/is}}             {{!-- check context --}}
{{#get "posts" filter="featured:true" limit="3"}}  {{!-- query data --}}
{{> "card"}}                          {{!-- include partial --}}
{{asset "css/screen.css"}}            {{!-- asset URL with cache busting --}}
{{img_url feature_image size="m"}}    {{!-- responsive images --}}
{{excerpt words="30"}}                {{!-- truncated excerpt --}}
{{date format="D MMM YYYY"}}          {{!-- formatted date --}}
```

### Loop Metadata (inside `{{#foreach}}`)
`@index` (0-based), `@number` (1-based), `@first`, `@last`, `@odd`, `@even`

---

## Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| Changes to CSS/JS don't appear | Assets served from `assets/built/` | Run `npx gulp build` after changes |
| `{{content}}` shows escaped HTML | Using double-stash `{{content}}` | Use triple-stash `{{{content}}}` for raw HTML |
| Custom setting not showing | Not defined in `package.json` | Add to `config.custom` in `package.json`, max 20 settings |
| Template not picked up | Wrong filename pattern | Check hierarchy: `post-{slug}.hbs`, not `post_{slug}.hbs` |
| GScan validation fails | Missing required helpers | Ensure `{{ghost_head}}`, `{{ghost_foot}}`, `{{body_class}}` exist |
| Partial not found | Wrong path or missing file | Partials live in `partials/`, reference as `{{> "name"}}` (no path prefix) |
| `{{#get}}` returns nothing | Bad filter syntax | Uses NQL (not SQL). Check `ghost-helpers-overview.md` for filter syntax |
| Images don't use responsive sizes | Using raw `{{feature_image}}` | Use `{{img_url feature_image size="m"}}` with `image_sizes` in `package.json` |

---

## Wonder Cabinet Specifics

### Brand Colors (CSS Variables)
```css
--wc-green: #10A544;
--wc-black: #000000;
--wc-cream: #FFFAEB;
--wc-dark-green: #043013;
```

### Fonts
- **Headlines:** Jost (Futura alternative) → `--font-heading`
- **Body:** EB Garamond (Garamond alternative) → `--font-body`
- Loaded via Google Fonts in `default.hbs`

### Build Commands
```bash
npm run dev      # Gulp watch + livereload
npx gulp build   # One-time rebuild (required after CSS/JS changes)
npm run zip      # Build + create distribution archive
npm run test     # GScan validation
```

### Audio Player
- Uses **WaveSurfer.js v7** loaded from CDN on post pages
- Source: `assets/js/audio-player.js`
- Extracts audio URL from Ghost's `.kg-audio-card` element
- Ghost's default audio card hidden via CSS
- Renders on **all posts** — no conditional logic
- Detailed docs: `docs/AUDIO_PLAYER.md`

### Custom Admin Settings (in `package.json`)
```
@custom.background_color    — Page background (default: #000000)
@custom.email_signup_text   — CTA section heading
@custom.apple_podcasts_link — Apple Podcasts URL
@custom.spotify_link        — Spotify URL
@custom.youtube_music_link  — YouTube Music URL
```

---

## How to Discover More

1. **Quick question about a helper?** → Read `docs/HANDLEBARS_HELPERS.md` in this repo
2. **Need full helper catalog?** → `the-lodge/knowledge/ghost-themes/ghost-helpers-overview.md`
3. **Template structure question?** → `docs/GHOST_THEME_REFERENCE.md` in this repo
4. **Routing / collections?** → `docs/ROUTES_CONFIG.md` or Library's `ghost-theme-development-guide.md`
5. **Brand/design question?** → `docs/wonder-cabinet/brand-guide.md` (this is the design authority)
6. **Audio player?** → `docs/AUDIO_PLAYER.md` and `docs/AUDIO_PLAYER_INTEGRATION.md`
7. **Ghost official docs?** → https://docs.ghost.org/themes/ or LLM-friendly https://docs.ghost.org/llms.txt
8. **Need to add docs to The Library?** → Use the `/add-to-library` skill with a URL
