# Development Workflow

Guide to developing and testing the wonder-cabinet Ghost theme locally.

## Prerequisites

- Node.js 18+ and npm
- Ghost instance running locally (port 2368)
- Theme directory linked to Ghost's content/themes folder

## Quick Start

```bash
# Install dependencies
npm install

# Start development mode with live reload
npm run dev

# In another terminal, ensure Ghost is running
# Access site at http://localhost:2368
# Access admin at http://localhost:2368/ghost
```

## Build System

This theme uses **Rollup** as its bundler with the following pipeline:

### Entry Points

```
assets/js/index.js      # JavaScript entry (imports CSS too)
assets/css/index.css    # CSS entry (imported by JS)
```

### Build Output

```
assets/built/
├── index.js            # Bundled, minified JavaScript
├── index.js.map        # Source map
├── index.css           # Processed, minified CSS
└── index.css.map       # Source map
```

### Processing Pipeline

**JavaScript:**
1. ES modules resolved (`@rollup/plugin-node-resolve`)
2. CommonJS converted (`@rollup/plugin-commonjs`)
3. Babel transpilation to ES5 (`@rollup/plugin-babel`)
4. Minification (`@rollup/plugin-terser`)
5. Output as IIFE format

**CSS:**
1. `@import` statements resolved (`postcss-import`)
2. Modern CSS features transpiled (`postcss-preset-env`)
3. Minification
4. Output as separate CSS file

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with live reload |
| `npm run build` | Production build (minified) |
| `npm run test` | Run GScan theme validation |
| `npm run zip` | Create uploadable theme archive |

### Development Mode

```bash
npm run dev
```

This command:
- Watches for file changes
- Rebuilds on save
- Triggers live reload in browser
- Generates source maps for debugging

Files watched:
- `assets/js/**/*.js`
- `assets/css/**/*.css`
- `**/*.hbs` (Handlebars templates)

### Production Build

```bash
npm run build
```

Creates optimized, minified output. Run before deploying or creating a zip.

## Hot Reload Behavior

### Automatic Reload (No Action Needed)

| File Type | Behavior |
|-----------|----------|
| `.hbs` templates | Ghost hot-reloads automatically |
| `.css` files | Rollup rebuilds → browser reloads |
| `.js` files | Rollup rebuilds → browser reloads |

### Requires Ghost Restart

| Change | Solution |
|--------|----------|
| `package.json` config | Restart Ghost |
| New custom settings | Restart Ghost |
| `routes.yaml` changes | Restart Ghost |

## Directory Structure

```
wonder-cabinet/
├── assets/
│   ├── css/
│   │   ├── index.css          # Entry point
│   │   ├── vars.css           # Design tokens
│   │   ├── components/        # Reusable styles
│   │   └── ghost/             # Ghost-specific layouts
│   ├── js/
│   │   ├── index.js           # Entry point
│   │   ├── menuOpen.js        # Mobile menu
│   │   └── infiniteScroll.js  # Infinite scroll
│   └── built/                 # BUILD OUTPUT (committed)
├── partials/                  # Reusable template fragments
├── members/                   # Membership templates
├── *.hbs                      # Page templates
├── package.json               # Theme config
├── rollup.config.js           # Build config
└── docs/                      # This documentation
```

## CSS Architecture

### Entry Point (index.css)

```css
/* assets/css/index.css */
@import "vars.css";
@import "components/global.css";
@import "components/buttons.css";
@import "ghost/header.css";
@import "ghost/content.css";
@import "ghost/footer.css";
```

### CSS Variables

```css
/* assets/css/vars.css */
:root {
    /* Ghost provides this from admin settings */
    --ghost-accent-color: #3eb0ef;

    /* Breakpoints */
    --xlarge: 1680px;
    --large: 1280px;
    --medium: 980px;
    --small: 740px;
    --xsmall: 480px;
}
```

### Adding New CSS

1. Create file in appropriate directory:
   - `components/` for reusable styles
   - `ghost/` for Ghost-specific layouts

2. Import in `index.css`:
   ```css
   @import "components/my-component.css";
   ```

3. Rollup will include it in the build

## JavaScript Architecture

### Entry Point (index.js)

```javascript
// assets/js/index.js
import '../css/index.css';  // CSS imported here!
import menuOpen from './menuOpen';
import infiniteScroll from './infiniteScroll';

menuOpen();
infiniteScroll();
```

### Adding New JavaScript

1. Create module file:
   ```javascript
   // assets/js/myFeature.js
   export default function myFeature() {
       // Implementation
   }
   ```

2. Import and call in `index.js`:
   ```javascript
   import myFeature from './myFeature';
   myFeature();
   ```

## Cache Busting

### During Development

Ghost automatically appends `?v=hash` to asset URLs via `{{asset}}` helper.

### Force Refresh

If changes aren't appearing:

1. **Hard refresh browser:** `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
2. **Clear browser cache:** DevTools > Application > Clear Storage
3. **Restart Ghost:** Sometimes needed for persistent caching
4. **Check build output:** Verify `assets/built/` files are updated

## Common Issues

### Changes Not Appearing

| Symptom | Solution |
|---------|----------|
| CSS changes ignored | Check `npm run dev` is running |
| Template changes ignored | Ghost should auto-reload; try refresh |
| New settings not appearing | Restart Ghost |
| Build errors | Check terminal for Rollup errors |

### Build Fails

```bash
# Clean install
rm -rf node_modules
npm install

# Check Node version
node --version  # Should be 18+

# Run build directly to see errors
npm run build
```

### GScan Errors

```bash
npm run test
```

Common fixes:
- Add missing `{{ghost_head}}` or `{{ghost_foot}}`
- Fix invalid Handlebars syntax
- Update deprecated helpers
- Ensure required files exist

## Deployment

### Creating a Zip

```bash
npm run zip
```

This creates `wonder-cabinet.zip` containing only necessary files:
- All `.hbs` templates
- `partials/` directory
- `members/` directory
- `assets/` directory (including `built/`)
- `package.json`

### Uploading to Ghost

1. Go to Ghost Admin → Settings → Design
2. Click "Change theme"
3. Click "Upload theme"
4. Select `wonder-cabinet.zip`

### Committing Built Assets

The `assets/built/` directory **must be committed** to the repository. Ghost serves assets directly from this folder and doesn't run build processes.

```bash
git add assets/built/
git commit -m "Update built assets"
```

## Theme Validation

Before deploying, always validate:

```bash
npm run test
```

This runs [GScan](https://github.com/TryGhost/gscan), Ghost's official theme validator.

## Environment Notes

- Ghost runs on port 2368 by default
- Admin panel at `/ghost`
- Live reload uses port 35729
- Source maps help with debugging in browser DevTools
