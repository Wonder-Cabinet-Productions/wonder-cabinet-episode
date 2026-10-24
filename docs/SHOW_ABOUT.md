# Show About Modal

An optional **About** popup for each show's landing page. A visitor taps **About** in the row of listen links, and the show's About page opens in a modal over the landing page instead of navigating away. Added in #124.

Everything you change day to day lives in **Ghost Admin**. The theme only decides where the modal appears and how it looks.

## Giving a show an About modal

1. In Ghost Admin, create (or open) a **page**. Any slug works; the theme finds the page by its settings, not its URL.
2. Page settings → **Template** → **Show About**.
3. Page settings → **Tags**: add the show's tag **first** (primary tag):
   - `wonder-cabinet` for the Wonder Cabinet landing page (`/`)
   - `luminous` for the Luminous landing page (`/luminous/`)
4. Publish.

The **About** button appears at the end of that show's listen-links row. Its two lines read "About" over the show's name, which comes from the primary tag's name.

The tag has to be first because it also sets the brand of the standalone page. With `luminous` first, `/about-luminous/` renders in Luminous colours, not Wonder Cabinet green.

**No page, no modal.** If no published page has both the Show About template and the show's tag, nothing renders: no button, no error. That keeps the modal optional per show, and it also means a missing setting fails silently (see *Production setup* below).

Use only one Show About page per show. If there are two, the theme shows one of them.

## Writing the page

The page title becomes the modal heading and the page body becomes the modal content. So every show's modal reads the same:

- **Title:** a question or a name, with curly quotes (’ “ ”), not straight ones.
- **Opening:** a short intro paragraph or two, with no heading above it.
- **Sections:** start each further section with an **H2** (for example "About the host"), not a bold paragraph. Screen-reader users navigate by headings.
- **Images:** leave captions off unless they add information. A name under a portrait of the person just named is noise.
- **Ending:** a button card (for example "More from Steve") is a good way to close, but it's optional. Ending on a paragraph is fine.

On a phone, long text scrolls inside the modal under a sticky title and close button, so length is not a technical problem. Shorter still reads better.

## How it behaves

- **Opening:** the About button opens the modal. Close it with the ✕, the Esc key, or a click or tap on the dark backdrop around it. Focus returns to whatever opened it.
- **Other links to the page:** any link to a Show About page also opens the modal, as long as that page's modal exists on the current page. This includes the footer "About" link, so on `/` the footer's link to `/about/` opens the Wonder Cabinet modal. Elsewhere the same link simply navigates to the page. For example, `/luminous/` only has the Luminous modal, so its link to `/about/` goes to the page.
- **Fallbacks:** the About button is an ordinary link to the page, so the standalone page still works:
  - without JavaScript;
  - when someone Cmd/Ctrl-clicks to open a new tab;
  - in browsers without `<dialog>` support.
- **Search engines** index the standalone page normally. It is a regular published page, listed in the sitemap.

## Production setup

These are **Ghost Admin data**, not theme code, so deploying the theme does not create them. Check them at production cutover:

- [ ] `/about/` → Template **Show About**, primary tag `wonder-cabinet`
- [ ] Luminous About page → create it, with Template **Show About** and primary tag `luminous`
- [ ] Both titles use curly quotes
- [ ] Load `/` and `/luminous/`: each shows an **About** button that opens the right modal

If a button is missing, the page is almost always missing the template, the tag, or its publish status.

## For developers

| File | Role |
|---|---|
| `custom-show-about.hbs` | The **Show About** page template; the standalone page and no-JS fallback |
| `partials/components/show-about.hbs` | Trigger plus `<dialog>`. Finds its page with `{{#get "pages" filter="custom_template:custom-show-about+tag:{{tagSlug}}"}}`. Brand-agnostic: styled only through `--show-accent*` |
| `partials/podcast-services.hbs`, `index-luminous.hbs` | Include sites, at the end of each listen-links row |
| `partials/icons/info.hbs` | The "i" icon |
| `assets/js/main.js` | "Show About modal" block: link upgrade, focus handling, backdrop close. Runs before `pagination(true)`, which throws on single-page lists |
| `assets/css/screen.css` | "Show About Modal (#124)" section: trigger, 2×2 row, dialog, sticky header, fade |

The developer details are in the header comment of `show-about.hbs`.

**Constraints:**
- Include the partial **once per page**, because the dialog ID is `wc-about-<slug>`. This matters for #125's tag pages.
- Keep the partial driven only by its `tagSlug` parameter.
