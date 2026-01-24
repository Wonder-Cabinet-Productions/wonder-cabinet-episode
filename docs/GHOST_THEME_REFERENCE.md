# Ghost Theme Reference

This document covers core Ghost theming concepts for agents working on the wonder-cabinet theme.

## Theme File Structure

A Ghost theme requires these minimum files:

```
theme-name/
├── package.json          # Theme metadata and configuration (REQUIRED)
├── index.hbs             # Home page template (REQUIRED)
├── post.hbs              # Single post template (REQUIRED)
├── default.hbs           # Base layout wrapper
├── page.hbs              # Static page template
├── tag.hbs               # Tag archive template
├── author.hbs            # Author archive template
├── error.hbs             # Error page (404, 500, etc.)
├── partials/             # Reusable template fragments
│   └── card.hbs          # Example partial
├── assets/               # Static assets
│   ├── css/              # Source CSS files
│   ├── js/               # Source JavaScript files
│   └── built/            # Compiled assets (served by Ghost)
└── members/              # Membership templates
    ├── account.hbs
    ├── signin.hbs
    └── signup.hbs
```

## Template Hierarchy

Ghost selects templates based on context. From most to least specific:

### Post Context
1. `post-{slug}.hbs` - Specific post by slug
2. `post.hbs` - All posts (default)

### Page Context
1. `page-{slug}.hbs` - Specific page by slug
2. `page.hbs` - All static pages
3. `post.hbs` - Falls back to post template

### Tag Context
1. `tag-{slug}.hbs` - Specific tag by slug
2. `tag.hbs` - All tag archives
3. `index.hbs` - Falls back to home

### Author Context
1. `author-{slug}.hbs` - Specific author by slug
2. `author.hbs` - All author archives
3. `index.hbs` - Falls back to home

### Index Context
1. `home.hbs` - Custom home page (if exists)
2. `index.hbs` - Default home/list page

## Template Inheritance

Ghost uses Handlebars' layout system for template inheritance.

### Declaring a Parent Layout

At the top of a child template, declare its parent:

```handlebars
{{!< default}}

<article>
    <!-- This content replaces {{{body}}} in default.hbs -->
</article>
```

### The Base Layout (default.hbs)

The base layout contains the HTML structure with a `{{{body}}}` placeholder:

```handlebars
<!DOCTYPE html>
<html>
<head>
    {{ghost_head}}
</head>
<body>
    <header>...</header>

    <main>
        {{{body}}}  <!-- Child template content injected here -->
    </main>

    <footer>...</footer>
    {{ghost_foot}}
</body>
</html>
```

**Important:** Use triple-stache `{{{body}}}` to prevent HTML escaping.

## Partials System

Partials are reusable template fragments stored in `/partials/`.

### Including a Partial

```handlebars
{{> "card"}}                    <!-- partials/card.hbs -->
{{> "icons/arrow-left"}}        <!-- partials/icons/arrow-left.hbs -->
```

### Passing Data to Partials

```handlebars
{{> "card" featured=true}}      <!-- Pass a custom variable -->
{{> "card" page=pagination.page}} <!-- Pass existing data -->
```

### Inline Partials

Define partials within a template (rarely used):

```handlebars
{{#*inline "custom-partial"}}
    <span>Inline content</span>
{{/inline}}
```

## Context Detection

Use the `{{#is}}` helper to detect current context:

```handlebars
{{#is "home"}}
    <h1>Welcome to the home page</h1>
{{/is}}

{{#is "post"}}
    <article>Post content here</article>
{{/is}}

{{#is "page"}}
    <div>Static page content</div>
{{/is}}

{{#is "tag"}}
    <h1>Posts tagged: {{tag.name}}</h1>
{{/is}}
```

### Available Contexts

| Context | Description |
|---------|-------------|
| `home` | The main index page |
| `index` | Any list/archive page |
| `post` | A single post |
| `page` | A static page |
| `tag` | A tag archive |
| `author` | An author archive |
| `paged` | Any paginated page (page 2+) |
| `private` | Password-protected content |

### Combining Contexts

```handlebars
{{#is "home, index"}}
    <!-- Matches home OR any index -->
{{/is}}

{{#is "post, page"}}
    <!-- Matches single post OR page -->
{{/is}}
```

## Ghost-Specific CSS Classes

Ghost automatically adds contextual CSS classes to the `<body>` element via `{{body_class}}`:

```handlebars
<body class="{{body_class}}">
```

### Generated Classes

| Class | When Added |
|-------|------------|
| `.home-template` | Home page |
| `.post-template` | Single post |
| `.page-template` | Static page |
| `.tag-template` | Tag archive |
| `.author-template` | Author archive |
| `.paged` | Paginated pages (page 2+) |

### Post-Specific Classes

The `{{post_class}}` helper adds classes to post containers:

```handlebars
<article class="{{post_class}}">
```

Generated classes include:
- `.post` - All posts
- `.tag-{slug}` - For each tag
- `.featured` - If post is featured

## Asset Organization

### Standard Directories

```
assets/
├── css/               # Source stylesheets
│   ├── index.css      # Entry point
│   └── components/    # Modular CSS
├── js/                # Source JavaScript
│   └── index.js       # Entry point
├── built/             # COMPILED OUTPUT (committed to repo)
│   ├── index.css      # Processed CSS
│   └── index.js       # Bundled JS
├── images/            # Theme images (icons, etc.)
└── fonts/             # Custom fonts
```

### Referencing Assets in Templates

Use the `{{asset}}` helper for cache-busted URLs:

```handlebars
<link rel="stylesheet" href="{{asset "built/index.css"}}">
<script src="{{asset "built/index.js"}}" defer></script>
<img src="{{asset "images/logo.png"}}">
```

**Important:** Ghost serves assets from the compiled `assets/built/` directory. This folder must be committed to the repository.

## Custom Templates

Create custom templates for specific content:

### Custom Page Template
```
page-about.hbs         → /about/ uses this template
page-contact.hbs       → /contact/ uses this template
```

### Custom Tag Template
```
tag-podcast.hbs        → /tag/podcast/ uses this template
```

### Custom Post Template
```
post-welcome.hbs       → Post with slug "welcome" uses this template
```

## Template Variables

Each context provides different data:

### Global Data (Always Available)
- `@site` - Site settings
- `@config` - Theme config
- `@custom` - Custom theme settings

### Post Context
- `{{title}}`, `{{content}}`, `{{excerpt}}`
- `{{feature_image}}`, `{{feature_image_alt}}`
- `{{date}}`, `{{reading_time}}`
- `{{tags}}`, `{{authors}}`
- `{{url}}`, `{{slug}}`

### Index Context
- `{{posts}}` - Array of posts
- `{{pagination}}` - Pagination object

See `HANDLEBARS_HELPERS.md` for complete helper reference.
