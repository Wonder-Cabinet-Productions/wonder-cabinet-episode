# Wonder Cabinet Ghost Theme - Agent Instructions

This document provides all context needed to work on the Wonder Cabinet Ghost theme.

## Quick Reference

```bash
npm run dev      # Start development with live reload
npm run build    # Production build
npm run test     # Run GScan theme validation
npm run zip      # Create uploadable theme archive
```

## Project Overview

**Wonder Cabinet** is a custom Ghost theme for a podcast/media publication. It's built on the Ghost Starter framework with Rollup as the build system.

- **Ghost Version:** 5.0+
- **Build System:** Rollup with PostCSS
- **Template Engine:** Handlebars

## Documentation

Full documentation is in the `/docs/` directory:

| Document | Purpose |
|----------|---------|
| `GHOST_THEME_REFERENCE.md` | Core Ghost theming concepts |
| `HANDLEBARS_HELPERS.md` | Complete helper reference |
| `PACKAGE_JSON_CONFIG.md` | Theme configuration options |
| `DEVELOPMENT_WORKFLOW.md` | Build system & local dev |
| `AUDIO_PLAYER.md` | WaveSurfer.js integration |
| `ROUTES_CONFIG.md` | Ghost routes.yaml reference |

**Read these docs before making significant changes.** They provide Ghost-specific knowledge that may not be in your training data.

## File Structure

```
wonder-cabinet/
├── assets/
│   ├── css/               # Source stylesheets
│   │   ├── index.css      # Entry point (imports all others)
│   │   ├── vars.css       # Design tokens
│   │   ├── components/    # Reusable component styles
│   │   └── ghost/         # Ghost-specific layouts
│   ├── js/                # Source JavaScript
│   │   └── index.js       # Entry point
│   └── built/             # COMPILED OUTPUT (committed!)
├── partials/              # Reusable template fragments
│   ├── card.hbs           # Post card component
│   └── icons/             # SVG icons as partials
├── members/               # Membership templates
├── docs/                  # Theme documentation
├── *.hbs                  # Page templates
├── package.json           # Theme config & dependencies
├── rollup.config.js       # Build configuration
└── AGENTS.md              # This file
```

## Key Patterns

### Template Inheritance

All templates extend `default.hbs`:

```handlebars
{{!< default}}

{{#post}}
    <article>{{content}}</article>
{{/post}}
```

### Including Partials

```handlebars
{{> "card"}}                    <!-- partials/card.hbs -->
{{> "icons/arrow-left"}}        <!-- partials/icons/arrow-left.hbs -->
```

### Responsive Images

Use Ghost's `img_url` helper with defined sizes:

```handlebars
{{img_url feature_image size="l"}}              <!-- 1200px -->
{{img_url feature_image size="m" format="webp"}} <!-- 600px WebP -->
```

Sizes are defined in `package.json` under `config.image_sizes`.

### CSS Variables

```css
:root {
    --ghost-accent-color: #3eb0ef;  /* From Ghost admin */
}
```

## Development Workflow

### Starting Development

```bash
npm install        # First time only
npm run dev        # Starts watch mode with live reload
```

### Hot Reload Behavior

| File Type | Behavior |
|-----------|----------|
| `.hbs` templates | Ghost auto-reloads |
| CSS/JS files | Rollup rebuilds → browser reloads |
| `package.json` | Requires Ghost restart |

### Build Output

The `assets/built/` directory contains compiled output and **must be committed**. Ghost serves directly from this directory.

```bash
npm run build      # Compile for production
git add assets/built/
git commit -m "Update built assets"
```

### Validation

Before deploying, run GScan:

```bash
npm run test
```

## Commit Discipline

This theme is a nested Git repository within a larger workspace.

### Before Committing

1. **Verify you're in the theme directory:**
   ```bash
   pwd  # Should be .../content/themes/wonder-cabinet
   git status  # Shows wonder-cabinet repo status
   ```

2. **Build assets first:**
   ```bash
   npm run build
   ```

3. **Include built assets:**
   ```bash
   git add assets/built/
   ```

### Commit Format

```
[type]: Brief description

- Detail of change 1
- Detail of change 2

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`

### What to Commit Here

| Change | Commit Here? |
|--------|--------------|
| Template changes (.hbs) | Yes |
| CSS/JS changes | Yes (including built/) |
| Theme package.json | Yes |
| Ghost config files | No (parent workspace) |
| routes.yaml | No (Ghost content folder) |

## Common Tasks

### Adding a New Partial

1. Create `partials/my-partial.hbs`
2. Include with `{{> "my-partial"}}`

### Adding New CSS

1. Create file in appropriate `assets/css/` subdirectory
2. Add `@import` in `assets/css/index.css`
3. Run `npm run dev` to rebuild

### Adding New JavaScript

1. Create module in `assets/js/`
2. Import and call in `assets/js/index.js`
3. Run `npm run dev` to rebuild

### Creating a Custom Template

For a page with slug "about":
1. Create `page-about.hbs`
2. Extend default: `{{!< default}}`
3. Ghost automatically uses it for `/about/`

## Ghost Admin Integration

- **Site:** `http://localhost:2368`
- **Admin:** `http://localhost:2368/ghost`
- **Theme Settings:** Design → Site-wide (if custom settings defined)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CSS changes not appearing | Ensure `npm run dev` is running |
| Template changes not appearing | Hard refresh (Cmd+Shift+R) |
| New settings not in admin | Restart Ghost |
| GScan validation errors | Run `npm run test`, fix reported issues |
| Build errors | Check terminal, verify imports |

## External Resources

- [Ghost Themes Documentation](https://ghost.org/docs/themes/)
- [Handlebars Guide](https://handlebarsjs.com/guide/)
- [GScan Validator](https://gscan.ghost.org/)
