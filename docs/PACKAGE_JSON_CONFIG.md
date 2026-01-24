# Ghost Theme package.json Configuration

This document explains all configuration options available in a Ghost theme's `package.json`.

## Required Fields

Every Ghost theme must have these fields:

```json
{
    "name": "wonder-cabinet",
    "version": "1.0.0",
    "engines": {
        "ghost": ">=5.0.0"
    }
}
```

| Field | Description |
|-------|-------------|
| `name` | Theme identifier (lowercase, no spaces) |
| `version` | Semantic version (major.minor.patch) |
| `engines.ghost` | Minimum Ghost version required |

## Theme Metadata

```json
{
    "description": "A podcast theme for Wonder Cabinet",
    "demo": "https://demo.example.com",
    "license": "MIT",
    "author": {
        "name": "Your Name",
        "email": "email@example.com",
        "url": "https://yoursite.com"
    },
    "screenshots": {
        "desktop": "assets/screenshot-desktop.jpg"
    },
    "keywords": [
        "ghost",
        "theme",
        "ghost-theme",
        "podcast"
    ],
    "gpm": {
        "type": "theme",
        "categories": ["Minimal", "Magazine"]
    }
}
```

## Config Section

The `config` section controls theme behavior:

```json
{
    "config": {
        "posts_per_page": 15,
        "card_assets": true,
        "image_sizes": {...},
        "custom": {...}
    }
}
```

### posts_per_page

Number of posts per page on index/archive pages:

```json
{
    "config": {
        "posts_per_page": 15
    }
}
```

Access in templates: `{{@config.posts_per_page}}`

### card_assets

Enable Ghost's built-in card styles for editor content:

```json
{
    "config": {
        "card_assets": true
    }
}
```

When `true`, Ghost includes CSS/JS for:
- Gallery cards
- Bookmark cards
- Audio/Video cards
- File cards
- NFT cards
- And other editor cards

### image_sizes

Define responsive image sizes for `{{img_url}}` helper:

```json
{
    "config": {
        "image_sizes": {
            "xxs": { "width": 30 },
            "xs": { "width": 100 },
            "s": { "width": 300 },
            "m": { "width": 600 },
            "l": { "width": 1200 },
            "xl": { "width": 2000 }
        }
    }
}
```

**Usage in templates:**

```handlebars
{{img_url feature_image size="l"}}
{{img_url feature_image size="m" format="webp"}}
```

**With height constraint:**

```json
{
    "image_sizes": {
        "thumbnail": {
            "width": 300,
            "height": 300
        }
    }
}
```

---

## Custom Settings (config.custom)

Define theme settings that appear in Ghost Admin under Design > Site-wide.

### Setting Types

#### Select (Dropdown)

```json
{
    "config": {
        "custom": {
            "navigation_layout": {
                "type": "select",
                "options": ["Logo left", "Logo center", "Logo right"],
                "default": "Logo left",
                "group": "site"
            }
        }
    }
}
```

#### Text Input

```json
{
    "config": {
        "custom": {
            "footer_text": {
                "type": "text",
                "default": "© 2024 All rights reserved",
                "group": "site"
            }
        }
    }
}
```

#### Boolean (Toggle)

```json
{
    "config": {
        "custom": {
            "show_featured_posts": {
                "type": "boolean",
                "default": true,
                "group": "homepage"
            }
        }
    }
}
```

#### Color Picker

```json
{
    "config": {
        "custom": {
            "accent_color": {
                "type": "color",
                "default": "#3eb0ef",
                "group": "site"
            }
        }
    }
}
```

#### Image Upload

```json
{
    "config": {
        "custom": {
            "hero_background": {
                "type": "image",
                "group": "homepage"
            }
        }
    }
}
```

### Setting Groups

Organize settings into sections in Ghost Admin:

| Group | Location |
|-------|----------|
| `site` | Site-wide settings |
| `homepage` | Homepage settings |
| `post` | Post page settings |

### Accessing Custom Settings

In templates, use `{{@custom.setting_name}}`:

```handlebars
{{#match @custom.navigation_layout "Logo center"}}
    <header class="centered-nav">...</header>
{{/match}}

{{#if @custom.show_featured_posts}}
    {{> "featured-posts"}}
{{/if}}

<footer style="background-color: {{@custom.accent_color}}">
    {{@custom.footer_text}}
</footer>

{{#if @custom.hero_background}}
    <div style="background-image: url({{@custom.hero_background}})">
{{/if}}
```

### Complete Custom Settings Example

```json
{
    "config": {
        "custom": {
            "navigation_layout": {
                "type": "select",
                "options": ["Logo left", "Logo center", "Stacked"],
                "default": "Logo left",
                "group": "site"
            },
            "title_font": {
                "type": "select",
                "options": ["Modern", "Elegant", "Bold"],
                "default": "Modern",
                "group": "site"
            },
            "body_font": {
                "type": "select",
                "options": ["Sans-serif", "Serif"],
                "default": "Sans-serif",
                "group": "site"
            },
            "show_publication_cover": {
                "type": "boolean",
                "default": true,
                "group": "homepage"
            },
            "featured_section_heading": {
                "type": "text",
                "default": "Featured Articles",
                "group": "homepage"
            },
            "show_author_bio": {
                "type": "boolean",
                "default": true,
                "group": "post"
            },
            "show_related_posts": {
                "type": "boolean",
                "default": true,
                "group": "post"
            }
        }
    }
}
```

---

## Scripts Section

Standard npm scripts for theme development:

```json
{
    "scripts": {
        "dev": "rollup -c --environment BUILD:development -w",
        "build": "rollup -c --environment BUILD:production",
        "zip": "npm run build && bestzip $npm_package_name.zip assets/* partials/* members/* *.hbs package.json",
        "test": "npx gscan .",
        "pretest": "npm run build"
    }
}
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development with watch mode |
| `npm run build` | Production build |
| `npm run zip` | Create uploadable theme archive |
| `npm run test` | Run GScan validation |

---

## GScan Validation

GScan is Ghost's theme validator. Run before uploading:

```bash
npm run test
# or
npx gscan .
```

GScan checks:
- Required files exist
- Valid `package.json` structure
- Template syntax errors
- Deprecated helpers
- Accessibility issues

### Common GScan Errors

| Error | Fix |
|-------|-----|
| Missing `index.hbs` | Create required template |
| Invalid engine version | Update `engines.ghost` |
| Missing `ghost_head` | Add `{{ghost_head}}` to default.hbs |
| Deprecated helper | Update to current syntax |

---

## Complete Example

Here's a complete `package.json` for reference:

```json
{
    "name": "wonder-cabinet",
    "description": "A podcast theme for Wonder Cabinet",
    "version": "1.0.0",
    "engines": {
        "ghost": ">=5.0.0"
    },
    "license": "MIT",
    "author": {
        "name": "Theme Author",
        "email": "author@example.com"
    },
    "screenshots": {
        "desktop": "assets/screenshot-desktop.jpg"
    },
    "keywords": ["ghost", "theme", "ghost-theme", "podcast"],
    "gpm": {
        "type": "theme",
        "categories": ["Minimal", "Podcast"]
    },
    "config": {
        "posts_per_page": 15,
        "card_assets": true,
        "image_sizes": {
            "xxs": { "width": 30 },
            "xs": { "width": 100 },
            "s": { "width": 300 },
            "m": { "width": 600 },
            "l": { "width": 1200 },
            "xl": { "width": 2000 }
        },
        "custom": {
            "navigation_layout": {
                "type": "select",
                "options": ["Logo left", "Logo center"],
                "default": "Logo left",
                "group": "site"
            },
            "show_featured": {
                "type": "boolean",
                "default": true,
                "group": "homepage"
            }
        }
    },
    "scripts": {
        "dev": "rollup -c --environment BUILD:development -w",
        "build": "rollup -c --environment BUILD:production",
        "zip": "npm run build && bestzip $npm_package_name.zip assets/* partials/* members/* *.hbs package.json",
        "test": "npx gscan .",
        "pretest": "npm run build"
    },
    "devDependencies": {
        "@rollup/plugin-babel": "^6.0.0",
        "@rollup/plugin-terser": "^0.4.0",
        "rollup": "^4.0.0",
        "rollup-plugin-postcss": "^4.0.0",
        "postcss": "^8.4.0",
        "postcss-import": "^16.0.0",
        "postcss-preset-env": "^10.0.0",
        "bestzip": "^2.2.0"
    },
    "type": "module"
}
```
