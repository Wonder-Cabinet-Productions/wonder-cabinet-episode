# Tag pages as mini-series landings (#125)

Decided with Mark, 2026-11-21. Ships in the `dev/archive-loadmore` series, ahead of its deploy.
It builds on two decisions already merged there (#157): the hero names the tag once (the art
if the tag has some, else the name as text), and no heading sits above the list.

## Goal

Any tag page can act as a small show landing: an extended About, listen links, its own
colours, and the same layout as the show landings. A plain tag stays a plain archive.

## Decisions

| # | Question | Decision |
|---|---|---|
| 1 | How a tag opts in | **By content.** No switch. Each piece appears only when its content exists in Ghost Admin. |
| 2 | Colour source | **Theme token block** per series in `screen.css`, contrast-checked and gated by brand-guardian. The tag's Admin `accent_color` field is ignored. |
| 3 | IoK colour | **Tabled.** The producers don't want the pale blue, and they asked about greens. The brand guide has only one green, `#10A544`, and every green that reads on black is within about 1.3:1 of it, so an IoK card would look like a WC card. The gold `#FFCA57` set on the tag in Admin is the open alternative. Build with `--iok-accent` `#B6D0D8` as a placeholder; swapping it is a one-block change. |
| 4 | Layout | **Mirror the show landing:** backdrop band behind the nav, then the hero, a rule, and a services row (description, listen links, About button), then the list. |
| 5 | Listen links | **The parent show's links** (Wonder Cabinet's `@custom` settings) by default. **Series playlists** come from the tag's own **code injection**: see below. |
| 6 | Luminous | **Share the parts, keep its page.** Extract the band, hero and services row into partials used by both `index-luminous.hbs` and the tag landing. `/luminous/` must be a pixel no-op (C3). |
| 7 | Episode pages | **Series colour plus a series link.** An episode tagged with a coloured series takes that series' tokens (through `partials/series/registry.hbs`, as homepage cards do; IoK episodes have primary tag `wonder-cabinet`, so the primary-tag body class can't do it), plus a badge linking to the series landing. |

## Page anatomy (tag landing)

Every row is conditional on its content:

| Row | Shows when | Source |
|---|---|---|
| Band backdrop | always on a tag page | theme |
| Hero: art, or the name as text | always | tag `feature_image` / `name` |
| Services row: description | tag has a description | tag `description` (no `@site.description` fallback for ordinary tags) |
| Services row: listen links | parent show's links are set | `@custom.apple_podcasts_link` etc. |
| Services row: playlist button(s) | tag code injection carries a playlist | see below |
| Services row: About button | a published Show About page carries the tag | `components/show-about` (already generic) |
| Episode list, Load more, CTA | always | as now |

## Playlists through tag code injection

Verified in Ghost 6.10.3 source: `ghost_head` and `ghost_foot` output the tag's
`codeinjection_head` and `codeinjection_foot` on any page with tag context. That includes
channels that set `data: tag.<slug>`.

The editor pastes one line per platform into **Tag → Code injection → Header**:

```html
<meta name="wc:playlist" content="spotify https://open.spotify.com/playlist/…">
```

`main.js` reads `meta[name="wc:playlist"]` and adds a "Listen on Spotify"-style button to the
services row. It knows Apple, Spotify and YouTube Music by URL host; any other host gets a generic
"Listen" button. Without JS no playlist button shows, and the parent show's links still do.
Document the snippet in `docs/SHOW_ABOUT.md`, beside the About page instructions.

Open detail for the build: should a playlist button replace the parent show's link for the
same platform, or sit beside it? Default: replace it, so each platform shows one button.

## Implementation slices (each a sprint PR into `dev/archive-loadmore`)

1. **Shared landing partials, plus the tag landing structure.** Extract the band, hero and
   services row from `index-luminous.hbs`. `tag.hbs` (and `newsletter.hbs` / `index.hbs`
   if they fit) uses them, with About and the parent listen links. Gate: `/luminous/` and
   the homepage are C3 no-ops; brand-guardian.
2. **Series colour.** Add `body.brand-island-of-knowledge` to the `.wc-brand--island-of-knowledge`
   token block. Series class plus badge on episode pages through the registry. Resolves #56
   for tag pages.
3. **Playlists.** The meta convention, the `main.js` renderer, docs, and tests.

## Follow-up: move every show's listen links to tag code injection

Mark, 2026-11-21: platform links rarely change, so once slice 3 proves out, consider moving
the WC and Luminous listen links onto the same tag code-injection convention. That would free
up to six of the 20 custom settings. Things to weigh before doing it:

- The links would become JS-rendered. Today they're server-rendered, including the homepage
  hero's buttons, which would then pop in late and be missing without JS.
- Code injection appears only on pages with tag context: home and `/luminous/` (both set
  `data: tag.*`), and tag pages. Episode pages don't have it, so check whether they show listen
  links, and find them another source if they do.
- Editors would paste a snippet instead of filling in a labelled settings field.

Not scheduled. Decide after slice 3 has run on prod for a while.

## Out of scope

- Per-tag Admin settings: 17 of 20 custom settings are already used.
- Migrating Luminous fully onto the generic template.
- Picking IoK's colour (decision 3).
