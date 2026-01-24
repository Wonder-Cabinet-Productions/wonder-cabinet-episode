# Ghost Handlebars Helpers Reference

Complete reference for Ghost's Handlebars helpers. All examples use patterns from the wonder-cabinet theme.

## Table of Contents

- [Data Helpers](#data-helpers)
- [Global Data](#global-data)
- [Block Helpers](#block-helpers)
- [Iteration Helpers](#iteration-helpers)
- [Conditional Helpers](#conditional-helpers)
- [Utility Helpers](#utility-helpers)
- [Navigation & SEO](#navigation--seo)
- [Membership Helpers](#membership-helpers)

---

## Data Helpers

Output content from the current context.

### Content Data

```handlebars
{{title}}                    <!-- Post/page title -->
{{content}}                  <!-- Full HTML content -->
{{excerpt}}                  <!-- Auto-generated excerpt (first 50 words) -->
{{excerpt words="100"}}      <!-- Custom word limit -->
{{custom_excerpt}}           <!-- Manual excerpt from editor -->
{{html}}                     <!-- Alias for {{content}} -->
```

### URL & Slug

```handlebars
{{url}}                      <!-- Relative URL: /my-post/ -->
{{url absolute="true"}}      <!-- Full URL: https://site.com/my-post/ -->
{{slug}}                     <!-- URL slug: my-post -->
{{canonical_url}}            <!-- Canonical URL for SEO -->
```

### Date & Time

```handlebars
{{date}}                            <!-- Default format -->
{{date format="YYYY-MM-DD"}}        <!-- ISO format: 2024-01-15 -->
{{date format="D MMM YYYY"}}        <!-- Human format: 15 Jan 2024 -->
{{date format="MMMM D, YYYY"}}      <!-- Full: January 15, 2024 -->
{{date published_at format="..."}}  <!-- Published date -->
{{date updated_at format="..."}}    <!-- Last updated date -->
```

### Reading Time

```handlebars
{{reading_time}}             <!-- "2 min read" -->
{{reading_time minute="1 minute" minutes="% minutes"}}
```

### Feature Image

```handlebars
{{feature_image}}            <!-- Image URL -->
{{feature_image_alt}}        <!-- Alt text -->
{{feature_image_caption}}    <!-- Caption (HTML) -->

<!-- Responsive images with img_url helper -->
{{img_url feature_image size="s"}}        <!-- 300px width -->
{{img_url feature_image size="m"}}        <!-- 600px width -->
{{img_url feature_image size="l"}}        <!-- 1200px width -->

<!-- Format conversion -->
{{img_url feature_image size="m" format="webp"}}
{{img_url feature_image size="m" format="avif"}}
```

### Tags & Authors

```handlebars
{{tags}}                     <!-- Comma-separated tag links -->
{{tags limit="3"}}           <!-- First 3 tags -->
{{tags separator=", " prefix="Tagged: "}}

{{authors}}                  <!-- Comma-separated author links -->
{{authors limit="2" separator=" & "}}

{{primary_tag.name}}         <!-- First tag name -->
{{primary_author.name}}      <!-- First author name -->
```

---

## Global Data

Access site-wide data with the `@` prefix. Available in all templates.

### Site Settings

```handlebars
{{@site.title}}              <!-- Site title -->
{{@site.description}}        <!-- Site description -->
{{@site.logo}}               <!-- Logo URL -->
{{@site.cover_image}}        <!-- Cover image URL -->
{{@site.icon}}               <!-- Favicon URL -->
{{@site.url}}                <!-- Site URL -->
{{@site.locale}}             <!-- Language code: en -->
{{@site.timezone}}           <!-- Timezone: America/Chicago -->
```

### Membership Settings

```handlebars
{{@site.members_enabled}}          <!-- true/false -->
{{@site.members_invite_only}}      <!-- Invite-only mode -->
{{@site.paid_members_enabled}}     <!-- Paid subscriptions enabled -->
{{@site.signup_url}}               <!-- Signup portal URL -->
```

### Current Member

```handlebars
{{@member}}                  <!-- Current member object (or null) -->
{{@member.email}}            <!-- Member email -->
{{@member.name}}             <!-- Member name -->
{{@member.paid}}             <!-- Has active subscription -->
{{@member.status}}           <!-- free, paid, comped -->
```

### Custom Theme Settings

Access settings defined in `package.json` under `config.custom`:

```handlebars
{{@custom.navigation_layout}}      <!-- Custom select value -->
{{@custom.title_font}}             <!-- Custom font setting -->
{{@custom.show_publication_cover}} <!-- Boolean setting -->
```

### Config Values

```handlebars
{{@config.posts_per_page}}   <!-- Posts per page setting -->
```

---

## Block Helpers

Block helpers wrap content and provide context.

### Post Context

```handlebars
{{#post}}
    <h1>{{title}}</h1>
    <div>{{content}}</div>
{{/post}}
```

### Tag Context

```handlebars
{{#tag}}
    <h1>{{name}}</h1>
    <p>{{description}}</p>
    <img src="{{feature_image}}">
{{/tag}}
```

### Author Context

```handlebars
{{#author}}
    <h1>{{name}}</h1>
    <p>{{bio}}</p>
    <img src="{{profile_image}}">
    <a href="{{website}}">Website</a>
{{/author}}
```

---

## Iteration Helpers

### foreach

Iterate over arrays with access to iteration metadata:

```handlebars
{{#foreach posts}}
    <article>
        <h2>{{title}}</h2>

        {{#if @first}}First post!{{/if}}
        {{#if @last}}Last post!{{/if}}
        {{@index}} <!-- 0-based index -->
        {{@number}} <!-- 1-based index -->
    </article>
{{/foreach}}
```

**Options:**

```handlebars
{{#foreach posts limit="5"}}        <!-- First 5 items -->
{{#foreach posts from="2" to="5"}}  <!-- Items 2-5 -->
{{#foreach posts visibility="all"}} <!-- Include drafts -->
```

### get

Fetch additional data from Ghost API:

```handlebars
{{#get "posts" limit="3" include="tags,authors"}}
    {{#foreach posts}}
        <a href="{{url}}">{{title}}</a>
    {{/foreach}}
{{/get}}

<!-- Filter by tag -->
{{#get "posts" filter="tag:featured" limit="5"}}
    {{#foreach posts}}...{{/foreach}}
{{/get}}

<!-- Filter by author -->
{{#get "posts" filter="author:ghost" limit="10"}}
    ...
{{/get}}

<!-- Multiple filters -->
{{#get "posts" filter="tag:news+featured:true" limit="5"}}
    ...
{{/get}}
```

**Resources available:**
- `posts` - Blog posts
- `pages` - Static pages
- `tags` - All tags
- `authors` - All authors

### next_post / prev_post

Navigate between posts:

```handlebars
{{#next_post}}
    <a href="{{url}}">Next: {{title}}</a>
{{/next_post}}

{{#prev_post}}
    <a href="{{url}}">Previous: {{title}}</a>
{{/prev_post}}
```

---

## Conditional Helpers

### if / unless

```handlebars
{{#if feature_image}}
    <img src="{{feature_image}}">
{{else}}
    <div class="no-image-placeholder"></div>
{{/if}}

{{#unless @member}}
    <a href="{{@site.signup_url}}">Sign up</a>
{{/unless}}
```

### is

Check current template context:

```handlebars
{{#is "home"}}Home page{{/is}}
{{#is "post"}}Single post{{/is}}
{{#is "page"}}Static page{{/is}}
{{#is "tag"}}Tag archive{{/is}}
{{#is "author"}}Author archive{{/is}}
{{#is "paged"}}Paginated page{{/is}}

<!-- Multiple contexts -->
{{#is "home, index"}}
    Any list page
{{/is}}
```

### has

Check if a post has specific properties:

```handlebars
{{#has tag="featured"}}
    <span class="featured-badge">Featured</span>
{{/has}}

{{#has author="ghost"}}
    <span>By Ghost</span>
{{/has}}

{{#has number="posts:>5"}}
    <span>This author has many posts</span>
{{/has}}
```

### match

Compare values (Ghost 4.0+):

```handlebars
{{#match @custom.layout "grid"}}
    <div class="grid-layout">...</div>
{{/match}}

{{#match @custom.layout "list"}}
    <div class="list-layout">...</div>
{{/match}}

<!-- Comparison operators -->
{{#match posts.length ">" 0}}
    Has posts
{{/match}}
```

---

## Utility Helpers

### Partials

Include reusable template fragments:

```handlebars
{{> "card"}}                       <!-- partials/card.hbs -->
{{> "icons/arrow-left"}}           <!-- partials/icons/arrow-left.hbs -->
{{> "card" featured=true}}         <!-- Pass custom data -->
```

### asset

Generate cache-busted asset URLs:

```handlebars
<link rel="stylesheet" href="{{asset "built/index.css"}}">
<script src="{{asset "built/index.js"}}" defer></script>
```

### img_url

Transform image URLs with size and format options:

```handlebars
<!-- Sizes (defined in package.json) -->
{{img_url feature_image size="xxs"}}  <!-- 30px -->
{{img_url feature_image size="xs"}}   <!-- 100px -->
{{img_url feature_image size="s"}}    <!-- 300px -->
{{img_url feature_image size="m"}}    <!-- 600px -->
{{img_url feature_image size="l"}}    <!-- 1200px -->
{{img_url feature_image size="xl"}}   <!-- 2000px -->

<!-- Formats -->
{{img_url feature_image size="m" format="webp"}}
{{img_url feature_image size="m" format="avif"}}
```

### body_class

Add context-aware classes to body:

```handlebars
<body class="{{body_class}}">
<!-- Outputs: home-template, post-template, tag-template, etc. -->
```

### post_class

Add post-specific classes:

```handlebars
<article class="{{post_class}}">
<!-- Outputs: post tag-news tag-featured featured -->
```

### encode

URL-encode strings for sharing links:

```handlebars
<a href="https://twitter.com/intent/tweet?url={{url absolute="true" | encode}}&text={{title | encode}}">
    Share on Twitter
</a>
```

### concat

Combine strings:

```handlebars
{{concat @site.url "/rss/"}}  <!-- https://site.com/rss/ -->
```

### plural

Handle singular/plural text:

```handlebars
{{plural pagination.total empty="No posts" singular="% post" plural="% posts"}}
```

---

## Navigation & SEO

### navigation

Output navigation menus from Ghost admin:

```handlebars
{{navigation}}                        <!-- Primary nav -->
{{navigation type="secondary"}}       <!-- Secondary nav (footer) -->
```

### search

Output Ghost's native search:

```handlebars
{{search}}  <!-- Search icon/button -->
```

### pagination

Standard pagination controls:

```handlebars
{{pagination}}

<!-- Access pagination data -->
{{#if pagination.prev}}
    <a href="{{pagination.prev}}">Newer</a>
{{/if}}

{{pagination.page}} of {{pagination.pages}}

{{#if pagination.next}}
    <a href="{{pagination.next}}">Older</a>
{{/if}}
```

### ghost_head / ghost_foot

Required for Ghost functionality:

```handlebars
<head>
    {{ghost_head}}  <!-- Meta tags, styles, SEO -->
</head>

<body>
    ...
    {{ghost_foot}}  <!-- Scripts, tracking -->
</body>
```

### meta_title / meta_description

SEO helpers:

```handlebars
<title>{{meta_title}}</title>
<meta name="description" content="{{meta_description}}">
```

### comments

Output native Ghost comments:

```handlebars
{{#if comments}}
    <section class="comments">
        {{comments}}
    </section>
{{/if}}
```

---

## Membership Helpers

For sites with Ghost Members enabled.

### Member Access

```handlebars
{{#if @member}}
    <p>Welcome, {{@member.name}}!</p>
    <a href="#/portal/account">Account</a>
{{else}}
    <a href="{{@site.signup_url}}">Subscribe</a>
{{/if}}
```

### Content Visibility

```handlebars
{{#if @member.paid}}
    <div>Premium content here</div>
{{else}}
    <div>Subscribe to access</div>
{{/if}}
```

### Tiers & Pricing

```handlebars
{{#get "tiers" include="monthly_price,yearly_price" limit="all"}}
    {{#foreach tiers}}
        <div class="tier">
            <h3>{{name}}</h3>
            <p>{{description}}</p>
            {{#if monthly_price}}
                {{price monthly_price currency=currency}}/month
            {{/if}}
        </div>
    {{/foreach}}
{{/get}}
```

### price

Format currency values:

```handlebars
{{price 500}}                    <!-- $5.00 -->
{{price 500 currency="GBP"}}     <!-- £5.00 -->
{{price plan.amount currency=plan.currency}}
```

### total_members / total_paid_members

Display member counts:

```handlebars
<p>Join {{total_members}} other subscribers</p>
<p>{{total_paid_members}} premium members</p>
```

---

## Quick Reference Table

| Helper | Purpose | Example |
|--------|---------|---------|
| `{{title}}` | Post title | `<h1>{{title}}</h1>` |
| `{{content}}` | Post content | `<div>{{content}}</div>` |
| `{{url}}` | Relative URL | `<a href="{{url}}">` |
| `{{date}}` | Formatted date | `{{date format="D MMM YYYY"}}` |
| `{{img_url}}` | Responsive image | `{{img_url feature_image size="l"}}` |
| `{{@site.*}}` | Site settings | `{{@site.title}}` |
| `{{@custom.*}}` | Theme settings | `{{@custom.layout}}` |
| `{{#foreach}}` | Loop over array | `{{#foreach posts}}...{{/foreach}}` |
| `{{#get}}` | Fetch data | `{{#get "posts" limit="5"}}` |
| `{{#is}}` | Check context | `{{#is "post"}}...{{/is}}` |
| `{{#if}}` | Conditional | `{{#if feature_image}}...{{/if}}` |
| `{{> "partial"}}` | Include partial | `{{> "card"}}` |
| `{{asset}}` | Asset URL | `{{asset "built/index.css"}}` |
| `{{navigation}}` | Nav menu | `{{navigation}}` |
| `{{ghost_head}}` | Head meta | Required in `<head>` |
| `{{ghost_foot}}` | Foot scripts | Required before `</body>` |
