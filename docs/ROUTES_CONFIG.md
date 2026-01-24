# Ghost Routes Configuration (routes.yaml)

Guide to configuring custom routes, collections, and taxonomies in Ghost.

## Overview

Ghost uses `routes.yaml` to control URL structure and template routing. This file lives in Ghost's content folder (not in the theme), but themes must understand it to work correctly with custom routes.

**File Location:** `content/settings/routes.yaml` (in Ghost installation, not theme)

## Basic Structure

```yaml
routes:

collections:

taxonomies:
```

## Routes

Routes map URLs to templates with optional data.

### Static Route

```yaml
routes:
  /about/:
    template: page-about
    data: page.about
```

This creates `/about/` using `page-about.hbs` with the "about" page's data.

### Route Without Data

```yaml
routes:
  /custom-page/:
    template: custom
```

Uses `custom.hbs` template with no data context.

### Route with Controller

```yaml
routes:
  /rss/:
    controller: rss
```

Uses Ghost's built-in RSS controller.

## Collections

Collections group posts with specific filtering.

### Basic Collection (Blog)

```yaml
collections:
  /:
    permalink: /{slug}/
    template: index
```

Default setup: all posts at root, using `index.hbs`.

### Filtered Collection (Podcast)

```yaml
collections:
  /podcast/:
    permalink: /podcast/{slug}/
    filter: tag:podcast
    template: podcast-index
    data: tag.podcast
```

Only posts tagged "podcast" appear at `/podcast/`.

### Multiple Collections

```yaml
collections:
  /blog/:
    permalink: /blog/{slug}/
    filter: tag:-podcast
    template: index

  /podcast/:
    permalink: /podcast/{slug}/
    filter: tag:podcast
    template: podcast
```

Blog excludes podcast posts; podcast collection shows only podcast posts.

### Collection Options

| Option | Description |
|--------|-------------|
| `permalink` | URL structure for posts |
| `filter` | Ghost filter syntax |
| `template` | Template file (without .hbs) |
| `data` | Additional data to load |
| `limit` | Posts per page (overrides theme) |
| `order` | Sort order |

### Permalink Variables

```yaml
permalink: /{slug}/                    # /my-post/
permalink: /blog/{slug}/               # /blog/my-post/
permalink: /{year}/{month}/{slug}/     # /2024/01/my-post/
permalink: /{primary_tag}/{slug}/      # /news/my-post/
```

Available variables:
- `{id}` - Post ID
- `{slug}` - Post slug
- `{year}` - 4-digit year
- `{month}` - 2-digit month
- `{day}` - 2-digit day
- `{primary_tag}` - First tag slug
- `{primary_author}` - First author slug

## Filter Syntax

Ghost uses a powerful filter syntax for collections.

### Basic Filters

```yaml
filter: tag:news                       # Has tag "news"
filter: tag:-news                      # Does NOT have tag "news"
filter: author:ghost                   # By author "ghost"
filter: featured:true                  # Featured posts only
filter: visibility:public              # Public posts only
```

### Combined Filters

```yaml
filter: tag:news+featured:true         # AND: news AND featured
filter: tag:news,tag:updates           # OR: news OR updates
filter: tag:podcast+tag:-archived      # podcast AND NOT archived
```

### Filter Operators

| Operator | Example | Meaning |
|----------|---------|---------|
| `:` | `tag:news` | Equals |
| `-` | `tag:-draft` | Not equals |
| `+` | `tag:a+tag:b` | AND |
| `,` | `tag:a,tag:b` | OR |
| `>` | `published_at:>'2024-01-01'` | Greater than |
| `<` | `published_at:<'2024-12-31'` | Less than |

## Taxonomies

Taxonomies define how tags and authors are routed.

### Default Taxonomies

```yaml
taxonomies:
  tag: /tag/{slug}/
  author: /author/{slug}/
```

### Custom Taxonomy Routes

```yaml
taxonomies:
  tag: /topic/{slug}/          # /topic/news/
  author: /writer/{slug}/      # /writer/john/
```

### Disable a Taxonomy

```yaml
taxonomies:
  tag: /tag/{slug}/
  # author: (omit to disable)
```

## Data Routing

Load additional data into routes.

### Single Resource

```yaml
routes:
  /about/:
    template: about
    data: page.about           # Load page with slug "about"
```

### Multiple Resources

```yaml
routes:
  /featured/:
    template: featured
    data:
      featured: page.featured-posts
      team: page.team
```

Access in template as `{{featured}}` and `{{team}}`.

### Tag/Author Data

```yaml
collections:
  /podcast/:
    permalink: /podcast/{slug}/
    filter: tag:podcast
    template: podcast
    data: tag.podcast          # Loads tag data for header
```

## Example Configurations

### Podcast Site

```yaml
routes:
  /about/:
    template: page
    data: page.about

  /subscribe/:
    template: subscribe
    data: page.subscribe

collections:
  /episodes/:
    permalink: /episodes/{slug}/
    filter: tag:episode
    template: episode-index
    data: tag.episode

  /:
    permalink: /{slug}/
    filter: tag:-episode
    template: index

taxonomies:
  tag: /topic/{slug}/
  author: /host/{slug}/
```

### Magazine with Sections

```yaml
collections:
  /news/:
    permalink: /news/{slug}/
    filter: tag:news
    template: section

  /features/:
    permalink: /features/{slug}/
    filter: tag:feature
    template: section

  /reviews/:
    permalink: /reviews/{slug}/
    filter: tag:review
    template: section

  /:
    permalink: /{slug}/
    filter: tag:-news+tag:-feature+tag:-review
    template: index

taxonomies:
  tag: /tag/{slug}/
  author: /author/{slug}/
```

### Simple Blog (Default)

```yaml
routes:

collections:
  /:
    permalink: /{slug}/
    template: index

taxonomies:
  tag: /tag/{slug}/
  author: /author/{slug}/
```

## Applying Changes

After modifying `routes.yaml`:

1. **Restart Ghost** - Changes require restart
2. **Test URLs** - Verify routes work as expected
3. **Check templates** - Ensure referenced templates exist in theme

## Theme Considerations

When designing a theme that uses custom routes:

1. **Create required templates** - Each route references a template
2. **Handle data context** - Templates receive data specified in routes
3. **Use `{{#is}}` helper** - Detect context in shared templates
4. **Document requirements** - Note which routes.yaml setup your theme needs

### Template Context Check

```handlebars
{{!-- In a shared template --}}
{{#is "index"}}
    {{!-- Main blog listing --}}
{{/is}}

{{#is "tag"}}
    {{!-- Tag archive --}}
{{/is}}

{{!-- Or check for specific data --}}
{{#if tag}}
    <h1>{{tag.name}}</h1>
{{/if}}
```

## Debugging

### Check Current Routes

Ghost Admin → Settings → Labs → Routes (download/upload)

### Common Issues

| Problem | Solution |
|---------|----------|
| 404 on custom route | Check template exists, restart Ghost |
| Wrong template used | Verify route template name matches file |
| Posts not appearing | Check filter syntax |
| Duplicate posts | Ensure filters don't overlap |
| Pagination broken | Check collection settings |

### Filter Testing

Test filters in Ghost Admin → Posts → Filter before adding to routes.yaml.
