# Homepage river (featured slots) and footer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the footer nav below the cabinet (#132), then replace the homepage's five-post list and three hardcoded highlight zones with a branded, de-duplicated river of all episodes, with up to three featured-post slots and an in-place "Load more" (#100).

**Architecture:** Server-side Handlebars does all selection: the river is a `{{#get}}` of non-newsletter posts. Each slot is a per-series `{{#get}}` of the newest featured post, shown only when at least 8 river posts are newer than it. A single series-registry partial maps tag slugs to card brand classes, labels and slot positions. Two new Ghost **channels** (`/latest/`, `/episodes/`) list posts without owning their URLs. A small script in `main.js` progressively enhances the "Load more" link by fetching `/latest/page/N/`.

**Tech Stack:** Ghost 6 Handlebars theme, plain CSS (`assets/css/screen.css`), vanilla JS bundled by gulp into `main.min.js`, `routes.yaml`. The tests are dependency-free Node 18+ scripts (global `fetch`) plus `agent-browser eval` scripts, both run against staging.

**Spec:** `docs/superpowers/specs/2026-10-20-homepage-river-and-footer-design.md`

## Global Constraints

- **Hold:** no branch creation on GitHub, no staging edits and no merges until Prod-Lead reports the Luminous cutover done (#98, #135). Message Prod-Lead before touching the shared checkout or ghost01.
- **Series:**
  - `dev/homepage` is cut from `main` after the cutover.
  - Sprint PRs target `dev/homepage` and squash-merge. Never target `main`.
  - Branches are `sprint/footer` and `sprint/homepage`.
- **Dev loop:**
  - Edit only in the Mac checkout. Never run Ghost or gulp on the Mac.
  - Verify at `https://wondercabinet.riechers.co`, and bypass the `?v=` asset hash when checking CSS or JS.
  - gscan is `npx --yes gscan@5.2.4 .` and must report 0 errors.
- **Restarting `ghost-dev`:** this branch removes no `config.custom` keys, so a restart is safe. Still ask Mark first, since staging is shared.
- **Custom settings are at 20/20.** Add none.
- **Brand:**
  - Colours come only from existing tokens (`--wc-*`, `--luminous-*`, `--iok-*`, `--show-*`).
  - Every new text/background pairing must meet WCAG AA 4.5:1.
  - Footer type never goes below 14px (`1.4rem`).
- **River batch size is 8,** set in three places that must agree:
  - the `limit="8"` in `home.hbs`;
  - the `riverSize=8` passed to the slot partial;
  - `limit: 8` on the `/latest/` route.
- **Slot series and positions** *(implementer's call, revising spec §4.3's "newest first", which Handlebars can't sort across separate queries)*. Each series has a fixed position. A missing series leaves no slot and nothing renders empty.
  - newsletter: after river card 2
  - island-of-knowledge: after river card 4
  - luminous: after river card 6
- **Card brand precedence** *(implementer's call, replacing spec §4.2's "first in tag order")*: `luminous` beats `island-of-knowledge`, which beats Wonder Cabinet (no class).
- **Series links live in the registry, not in Ghost.** On staging, the Content API returns `/404/` as the URL for tags that a collection owns, so `{{url}}` can't supply badge links. Use these:
  - newsletter: `/newsletter/`
  - island-of-knowledge: `/tag/island-of-knowledge/`
  - luminous: `/luminous/`
- **Markup hooks the tests rely on:**
  - every card has `data-post-id="{{id}}"`;
  - each slot has `data-wc-slot="<slug>"`;
  - the river container has `data-wc-river`;
  - the Load more link has `data-wc-loadmore`;
  - the live region has `data-wc-loadmore-status`.
- **The `tests/` directory** is excluded from the theme zip (add it to `zipper` in `gulpfile.js`).
- **Gates for every sprint:**
  - brand-guardian on the visual diff;
  - `wc-theme-qa` (or the manual checklist), recording which one ran;
  - gscan.

## Review Focus

1. **Double activation of Load more** (a double-click, or Enter pressed twice) should fetch the next page once, not insert the same batch twice. Covered by test in Task 5, step 1.
2. **A failed Load more fetch** (offline, or a 404 because the routes weren't uploaded) should fall back to following the link, rather than leaving a dead button. Covered by test in Task 5, step 1.
3. **Fewer than 8 river posts** (a fresh site, or heavy unpublishing): non-newsletter slots stay hidden, and no slot renders past the end of the river. Covered by the Task 4 oracle.
4. **A long series tag name** (Mark renames a tag in Admin) on the slot badge or the river label at 320px should wrap without causing horizontal scroll. Covered by test in Task 4, step 6.
5. **Long or empty footer nav:**
   - a long label wraps and stays centred;
   - no nav items renders no empty `<nav>` and leaves no gap.

   Covered by Task 1, steps 1 and 5.

---

## Sprint 1 — Footer (#132)

### Task 1: Footer nav below the cabinet

**Files:**
- Create: `tests/lib/site.mjs`, `tests/footer.check.mjs`, `tests/footer.browser.js`
- Modify: `partials/components/footer.hbs`, `assets/css/screen.css` (Footer block ~L1258–1362; Luminous footer ~L2362–2375), `gulpfile.js` (`zipper` excludes)

**Interfaces:**
- Produces:
  - `tests/lib/site.mjs` exports:
    - `BASE` (env `WC_BASE`, default `https://wondercabinet.riechers.co`);
    - `fetchHtml(path) -> Promise<string>`, which adds a cache-busting query;
    - `contentApi(resource, params) -> Promise<object>`, which reads the public key from `data-key=` on the homepage;
    - `assert(cond, msg)`, which collects failures;
    - `report()`, which prints the results and sets the exit code.
  - Every later check script imports from this file.

- [ ] **Step 1: Branch and failing HTML test.**
  - After the hold lifts, cut `dev/homepage` from `main`, then branch `sprint/footer`. Copy the spec and this plan from `docs/homepage-design`.
  - `tests/footer.check.mjs` checks the HTML for `/` and for one Luminous post page, `/luminous/<first luminous slug from contentApi>/`:

```js
const footer = html.slice(html.indexOf('<footer class="wc-footer'));
const overlay = footer.slice(footer.indexOf('wc-footer-overlay'), footer.indexOf('</div>', footer.indexOf('wc-footer-copyright')));
assert(!overlay.includes('wc-footer-nav'), 'nav is not inside the cabinet overlay');
assert(overlay.includes('wc-footer-copyright'), 'copyright stays in the overlay');
const iNav = footer.indexOf('wc-footer-nav'), iIll = footer.indexOf('wc-footer-illustration'), iSoc = footer.indexOf('wc-social-links');
assert(iIll < iNav && iNav < iSoc, 'order: illustration, nav, social');
// Review Focus 5 (empty nav): the nav stays behind its guard
const hbs = fs.readFileSync('partials/components/footer.hbs', 'utf8');
assert(/\{\{#if @site\.secondary_navigation\}\}\s*<nav class="wc-footer-nav/.test(hbs), 'empty secondary nav renders no <nav>');
```

- [ ] **Step 2: Run it and confirm it fails.** Run `node tests/footer.check.mjs`. Expect: FAIL on "nav is not inside the cabinet overlay" and on "order".

- [ ] **Step 3: Move the nav.**
  - In `footer.hbs`, move the guarded `<nav class="wc-footer-nav">` out of `.wc-footer-overlay` so it sits between `.wc-footer-illustration` and `{{> "components/social-links"}}`.
  - Update the header comment to read "copyright between the legs; nav and social below".

- [ ] **Step 4: Change the CSS in `screen.css`.**
  - `.wc-footer-nav`:
    - `flex-wrap: wrap; justify-content: center; column-gap: 48px` (32px under 767px); `row-gap: var(--wc-spacing-xs)`;
    - remove `padding-left: 11px` and the mobile column stack;
    - `max-width: 100%`, padding 0 16px.
  - `.wc-footer-nav a`:
    - `display: inline-flex; align-items: center; min-height: 24px; min-width: 24px`;
    - keep `1.6rem`, and `1.4rem` on mobile.
  - `.wc-footer-overlay` (copyright only):
    - drop `gap`;
    - retune `top` by eye so the copyright sits centred in the gap between the legs, at 1440 and at 390. The wireframe is WonderCabinetWebsite-010725 p. 1.
  - Luminous: keep the overlay in normal flow, and set its padding so that copyright, nav and social read as one deliberate stack.

- [ ] **Step 5: Layout test with `tests/footer.browser.js`.** Run this script with `agent-browser eval "$(cat tests/footer.browser.js)"` after `agent-browser open <url>` and a viewport of 320, 390 and 1440, on `/` and on the Luminous post page. It returns JSON:

```js
// returns {ok, failures[]}; also injects a long label to test "any label" (Review Focus 5)
const nav = document.querySelector('.wc-footer-nav');
const ill = document.querySelector('.wc-footer-illustration');
const f = [];
const check = () => {
  const n = nav.getBoundingClientRect(), c = ill.getBoundingClientRect();
  if (Math.abs((n.left + n.width / 2) - (c.left + c.width / 2)) > 1) f.push('nav off cabinet centre line');
  nav.querySelectorAll('a').forEach(a => { const r = a.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) f.push('target < 24px: ' + a.textContent.trim());
    if (parseFloat(getComputedStyle(a).fontSize) < 14) f.push('type < 14px'); });
  if (document.documentElement.scrollWidth > innerWidth) f.push('horizontal scroll');
};
check();
const a = nav.querySelector('a'); a.textContent = 'About Wonder Cabinet'; check();
JSON.stringify({ ok: !f.length, failures: f });
```

  On Luminous the cabinet is hidden, so measure against `.wc-footer-inner` instead. The script falls back to that when `ill` has zero width.
  - Expected: `{"ok":true,"failures":[]}` for all six runs.

- [ ] **Step 6: Run the gates.**
  - Run `node tests/footer.check.mjs`. Expect: PASS.
  - Run `npx --yes gscan@5.2.4 .`. Expect: 0 errors.
  - Run `wc-theme-qa`.
  - Take screenshots at 320/390/1440 on both brands and send them to brand-guardian.
  - Add `'!tests', '!tests/**'` to `zipper`.

- [ ] **Step 7: Commit and open the PR.**
  - Commit: `git add tests gulpfile.js partials/components/footer.hbs assets/css/screen.css assets/built && git commit -m "feat(footer): nav and social below the cabinet, copyright between the legs (#132)"`.
  - Push, then open a PR with `--base dev/homepage`, recording which QA ran.
  - After the merge, Mark may rename the label in Admin.

---

## Sprint 2 — Homepage (#100)

Before Task 3 starts, message the #125 session, or comment on #125 if it isn't live. The message proposes the per-card brand-class shape: `.wc-brand--<slug>` sets the `--show-*` tokens, and `body.brand-luminous` shares the same block. The goal is to have one brand definition. Record the reply in the PR.

### Task 2: Spike — confirm the Ghost behaviours the design rests on (throwaway)

**Files:** none kept. Use a scratch template on staging, deleted afterwards, and the dev `routes.yaml` (uploaded via Admin → Settings → Labs; ask Mark first).

- [ ] **Step 1: Interpolated date filter.**
  - In a scratch `home.hbs` edit, render `{{#get "posts" filter="tag:luminous+featured:true" limit="1"}}{{#foreach posts}}{{#get "posts" filter="tag:-newsletter+published_at:>'{{published_at}}'" limit="1"}}{{pagination.total}}{{/get}}{{/foreach}}{{/get}}`.
  - Expected: the number printed equals the count of non-newsletter posts newer than that post, computed with `contentApi`.
  - If interpolation fails, **stop and flag**. The safety net needs a different technique.
- [ ] **Step 2: Chained block helpers.** Check that `{{#has tag="luminous"}}A{{else has tag="island-of-knowledge"}}B{{/has}}` renders A, B or nothing on the right posts.
- [ ] **Step 3: Channels don't move post URLs.**
  - Add the two channels from Task 3 to the dev routes.
  - Expected:
    - `/latest/` and `/latest/page/2/` return 200 with 8 cards;
    - a Luminous post's canonical is still `/luminous/<slug>/`;
    - `/tag/wonder-cabinet/` still redirects as before.
- [ ] **Step 4: Report the result and revert the scratch template.** Write the result into the Task 4 PR description.

### Task 3: Channels and their templates

**Files:**
- Create:
  - `latest.hbs` (the river channel; plain, branded cards);
  - `episodes.hbs` (Wonder Cabinet archive);
  - `docs/routes.yaml` (tracked mirror of the full production file);
  - `tests/routes.check.mjs`.
- Delete: `docs/routes-luminous.reference.yaml`. Its caveat comments move to the top of `docs/routes.yaml`.

**Interfaces:**
- Consumes: `tests/lib/site.mjs`.
- Produces:
  - `/latest/page/N/` pages with a `.gh-feed` whose children are `components/list-item` cards with `seriesBrand=true` (Task 4);
  - a `link[rel=next]` in `<head>` (Ghost emits it).
  - Load more (Task 5) parses exactly these.

- [ ] **Step 1: Failing test `tests/routes.check.mjs`.**

```js
const river = (await contentApi('posts', { filter: 'tag:-newsletter', limit: 'all', fields: 'id,slug,published_at' })).posts;
const ids = h => [...h.matchAll(/data-post-id="([^"]+)"/g)].map(m => m[1]);
assert(JSON.stringify(ids(await fetchHtml('/latest/'))) === JSON.stringify(river.slice(0, 8).map(p => p.id)), '/latest/ = newest 8 non-newsletter');
assert(JSON.stringify(ids(await fetchHtml('/latest/page/2/'))) === JSON.stringify(river.slice(8, 16).map(p => p.id)), '/latest/page/2/ = next 8');
const wc = (await contentApi('posts', { filter: 'tag:wonder-cabinet+tag:-newsletter', limit: 5, fields: 'id' })).posts.map(p => p.id); // posts_per_page is 5; /episodes/ sets no limit
assert(JSON.stringify(ids(await fetchHtml('/episodes/'))) === JSON.stringify(wc), '/episodes/ = Wonder Cabinet only');
const lum = (await contentApi('posts', { filter: 'tag:luminous', limit: 1, fields: 'slug' })).posts[0];
assert((await fetchHtml(`/luminous/${lum.slug}/`)).includes(`rel="canonical" href="${BASE}/luminous/${lum.slug}/"`), 'Luminous URLs unchanged');
const mirror = fs.readFileSync('docs/routes.yaml', 'utf8');
assert(!/player-|wavesurfer-styles/.test(mirror), 'dead routes dropped');
```

  This test needs `data-post-id` on cards, which Task 4 adds. Add that one attribute to `list-item.hbs` here.

- [ ] **Step 2: Run it.** Run `node tests/routes.check.mjs`. Expect: FAIL, because the routes don't exist yet (404).

- [ ] **Step 3: Write `docs/routes.yaml`.**
  - Start from `~/Downloads/wc-prod-cutover-backup-2026-10-20/routes.yaml`.
  - Drop the seven `/player-*/` and `/wavesurfer-styles/` routes.
  - Add under `routes:`:

```yaml
  /latest/:
    controller: channel
    filter: tag:-newsletter
    limit: 8
    template: latest
  /episodes/:
    controller: channel
    filter: tag:wonder-cabinet+tag:-newsletter
    template: episodes
```

  No `data:` on either channel. A `data: tag.wonder-cabinet` would compete with the `/` collection's ownership of that tag.

- [ ] **Step 4: Write the templates.**
  - `latest.hbs`:
    - a heading "Latest Episodes";
    - a `.gh-list-feed.gh-feed` of `{{> components/list-item seriesBrand=true showExcerpt=true showPublishedAt=true}}`;
    - `{{> components/pagination}}`;
    - the CTA.
  - `episodes.hbs`: like `index.hbs` without the `{{#tag}}` header. The heading is the wonder-cabinet tag's name plus "episodes" and `({{pagination.total}} available)`, read with `{{#get "tags" filter="slug:wonder-cabinet"}}` so it stays editable in Admin.
  - Upload `docs/routes.yaml` to dev Admin (with Mark's OK).

- [ ] **Step 5: Run it.** Run `node tests/routes.check.mjs`. Expect: PASS.

- [ ] **Step 6: Commit.**
  - `git add latest.hbs episodes.hbs docs/routes.yaml tests/routes.check.mjs partials/components/list-item.hbs && git rm docs/routes-luminous.reference.yaml`
  - Commit message: `feat(routes): /latest/ and /episodes/ channels; mirror prod routes.yaml (#100)`.

### Task 4: Series registry, branded river cards and slots

**Files:**
- Create:
  - `partials/series/registry.hbs`;
  - `partials/series/slot.hbs`;
  - `tests/river.check.mjs`.
- Modify:
  - `home.hbs`;
  - `partials/components/list-item.hbs`;
  - `partials/components/highlight-zone.hbs`: it becomes a pure card that renders the *current* post. Its `{{#get}}` and the `tagFilter` param are removed.
  - `assets/css/screen.css`: the brand block ~L65 and the cards ~L861–1170.
  - `CLAUDE.md`: rewrite "Homepage Content Model" and drop the hardcoded-badge warning.
- Delete: `partials/components/newsletter-feature.hbs`, plus the `isNewsletterFeature` branch in `list-item.hbs` (it has no other callers).

**Interfaces:**
- Consumes: the `/latest/` route (Task 3) and the `data-post-id` attribute.
- Produces:
  - `{{> series/registry mode="card-class"}}` runs in a post context and outputs ` wc-brand--luminous`, ` wc-brand--island-of-knowledge` or nothing. Precedence comes from a `{{#has}}…{{else has}}` chain.
  - `{{> series/registry mode="card-label"}}` outputs `<span class="wc-series-label">{{tag name}}</span>` for the same match, or nothing.
  - `{{> series/registry mode="slot" position=1|2|3 riverSize=8}}` outputs that position's slot, or nothing.
  - `{{> series/slot slug=… url=… accentClass=… riverSize=…}}` takes the newest `tag:<slug>+featured:true` post and renders `components/highlight-zone` only when at least `riverSize` non-newsletter posts are newer than it. Newsletter posts aren't in the river, so the newsletter slot qualifies whenever a featured newsletter exists.
  - `components/highlight-zone` params:
    - `badgeLabel` is the matching tag's name;
    - `badgeUrl` and `accentClass` come from the registry;
    - the article carries `data-wc-slot="<slug>"` and `data-post-id`.
  - `list-item` param `seriesBrand=true` adds the card-class and label. Without it the card renders as today, minus the Featured badge. Only `home.hbs` and `latest.hbs` pass it.
  - CSS:
    - `body.brand-luminous, .wc-brand--luminous { …existing Luminous --show-* tokens… }`;
    - `.wc-brand--island-of-knowledge { --show-accent: var(--iok-accent); --show-accent-text: var(--iok-accent-text); --show-accent-text-rgb: 26, 58, 68; --show-on-accent: var(--wc-black); }`;
    - `.wc-series-label` uses `color: var(--show-accent)` on the black card.

- [ ] **Step 1: Failing oracle test `tests/river.check.mjs`.**
  - The test computes the expected homepage from the Content API and compares it with the rendered `/`.
  - The algorithm below is the spec's §4.3 rule:

```js
const posts = (await contentApi('posts', { limit: 'all', include: 'tags', fields: 'id,featured,published_at' })).posts; // newest first
const has = (p, s) => p.tags.some(t => t.slug === s);
const river = posts.filter(p => !has(p, 'newsletter')).slice(0, 8);
const SLOTS = [['newsletter', 2], ['island-of-knowledge', 4], ['luminous', 6]];
const expected = [];
river.forEach((p, i) => {
  expected.push(p.id);
  for (const [s, after] of SLOTS) if (i + 1 === after) {
    const pin = posts.find(q => q.featured && has(q, s));
    if (pin && !river.includes(pin)) expected.push(`${s}:${pin.id}`);
  }
});
const html = await fetchHtml('/');
const body = html.slice(html.indexOf('data-wc-river'), html.indexOf('data-wc-loadmore'));
const got = [...body.matchAll(/<article[^>]*?(?:data-wc-slot="([^"]+)")?[^>]*data-post-id="([^"]+)"/g)].map(m => m[1] ? `${m[1]}:${m[2]}` : m[2]);
assert(JSON.stringify(got) === JSON.stringify(expected), `river+slots order\n got ${got}\n exp ${expected}`);
assert(new Set(got.map(g => g.split(':').pop())).size === got.length, 'no duplicate post on page 1 (#35)');
// brand classes and labels
for (const p of river) {
  const card = body.slice(body.indexOf(`data-post-id="${p.id}"`) - 400, body.indexOf(`data-post-id="${p.id}"`) + 2000);
  const brand = has(p, 'luminous') ? 'luminous' : has(p, 'island-of-knowledge') ? 'island-of-knowledge' : null;
  assert(brand ? card.includes(`wc-brand--${brand}`) && card.includes('wc-series-label') : !/wc-brand--|wc-series-label/.test(card), `brand on ${p.id}`);
}
assert(!html.includes('wc-featured-badge'), 'Featured badge removed');
```

  The `<article>` attribute order in the regex assumes `data-wc-slot` comes before `data-post-id`. Write the markup that way.

  The Review Focus 3 case (fewer than 8 posts) is covered by construction: `river.forEach` never reaches a missing position, so the template must not either. Also run the oracle against the spike's single-post count.

- [ ] **Step 2: Set up dev data and run.**
  - Ask Mark to set the Featured flags in dev Admin so that each case occurs:
    - one featured newsletter;
    - the featured IoK post (2026-02-07, already 9th in the river, so already outside the first 8);
    - one featured Luminous post older than the 8th river post;
    - one featured Luminous post *inside* the first 8. This one needs a recent Luminous post, so Mark publishes or back-dates a test post.
  - Then run `node tests/river.check.mjs`. Expect: FAIL, because the markup hooks don't exist yet.

- [ ] **Step 3: Implement.**
  - `home.hbs`:
    - the river is `{{#get "posts" include="tags,authors" filter="tag:-newsletter" limit="8"}}` inside `<div class="gh-list-feed" data-wc-river>`;
    - after each card, `{{#match @index "==" 1}}{{> series/registry mode="slot" position=1 riverSize=8}}{{/match}}`, and the same at indexes 3 and 5 with positions 2 and 3;
    - remove the three highlight-zone calls and the "More Episodes →" nav;
    - keep the `episode_section_heading` heading as it is;
    - leave the Load more markup to Task 5.
  - Then write `registry.hbs`, `slot.hbs`, the `highlight-zone` refactor, the `list-item` changes and the CSS, as listed under Interfaces.

- [ ] **Step 4: Run it.** Run `node tests/river.check.mjs`. Expect: PASS.

- [ ] **Step 5: Contrast check.**
  - Add this to `tests/river.check.mjs`: a `contrast(hex1, hex2)` helper (WCAG relative luminance), which asserts ≥ 4.5 for each label colour on `#000000`. The colours are `#10A544` (WC, for completeness), `#9A59FF` and `#b6d0d8`.
  - It also asserts ≥ 4.5 for `--show-on-accent` black on each button background.
  - Expected: PASS.

- [ ] **Step 6: Long-name layout check.** Add `tests/river.browser.js` and run it through `agent-browser eval` at 320 and 1440 on `/`.
  - It sets every `.wc-highlight-badge` and `.wc-series-label` to "Island of Knowledge: A Very Long Series Name".
  - Expected: `document.documentElement.scrollWidth <= innerWidth`, and no badge `getBoundingClientRect().right` beyond its card's right edge.

- [ ] **Step 7: Commit.**
  - `git add -A partials home.hbs assets tests CLAUDE.md`
  - Commit message: `feat(home): branded river with featured safety-net slots (#100, #35)`.

### Task 5: Load more episodes (in place)

**Files:**
- Modify:
  - `home.hbs`: add the control below the river;
  - `assets/js/main.js`: a new IIFE above `pagination(true)`;
  - `assets/css/screen.css`: control styles reuse `.wc-pagination-link`.
- Create: `tests/loadmore.browser.js`.

**Interfaces:**
- Consumes:
  - `/latest/page/N/`: cards are `.gh-feed > article[data-post-id]`, and `link[rel=next]` is in `<head>` (Task 3);
  - `data-post-id` on page-1 cards and slots (Task 4).
- Produces markup in `home.hbs`, inside the river `{{#get}}` and only when `{{#match pagination.pages ">" 1}}`:
  - `<a class="wc-pagination-link wc-loadmore" data-wc-loadmore href="/latest/page/2/">Load more episodes</a>`;
  - `<p class="sr-only" data-wc-loadmore-status aria-live="polite"></p>`;
  - then `<a href="/episodes/">All Wonder Cabinet episodes →</a>`.

  The river container must not get the `gh-feed` class. If it did, the shared `pagination(true)` would turn the homepage into infinite scroll.

- [ ] **Step 1: Failing browser test `tests/loadmore.browser.js`.** It's an async IIFE run by `agent-browser eval` after opening `/`, and it returns `{ok, failures}`. The checks:

```js
// a) click appends only new posts and moves focus
const before = [...document.querySelectorAll('[data-wc-river] [data-post-id]')].map(e => e.dataset.postId);
let fetches = 0; const realFetch = window.fetch; window.fetch = (...a) => { fetches++; return realFetch(...a); };
const btn = document.querySelector('[data-wc-loadmore]');
btn.click(); btn.click();                                   // Review Focus 1: double activation
await new Promise(r => setTimeout(r, 2500));
const after = [...document.querySelectorAll('[data-wc-river] [data-post-id]')].map(e => e.dataset.postId);
expect(fetches === 1, 'double activation fetches once');
expect(new Set(after).size === after.length, 'no duplicates after load (#35, spec 4.4a)');
const added = after.length - before.length;
expect(added > 0, 'cards appended');
const firstNew = document.querySelector(`[data-post-id="${after[before.length]}"] a`);
expect(document.activeElement === firstNew, 'focus on first new card');
expect(new RegExp(`\\b${added}\\b`).test(document.querySelector('[data-wc-loadmore-status]').textContent), 'announces actual count');
expect(btn.getAttribute('href') === '/latest/page/3/' || btn.hidden, 'href advances or button hides at the end');
expect(location.pathname === '/', 'URL not rewritten');
// b) Review Focus 2: failure falls back to navigation (run in a fresh page load)
// window.fetch = () => Promise.reject(new Error('offline')); btn.click(); → expect location.pathname === '/latest/page/2/' after 1s
```

  Run part (b) as a second `agent-browser open /` and `eval`, because it navigates away.

  The no-JS check goes in `tests/river.check.mjs`: assert the `/` HTML has `data-wc-loadmore` with `href="/latest/page/2/"` and a link to `/episodes/`.

- [ ] **Step 2: Run it.** Run `agent-browser open "$WC_BASE/" && agent-browser eval "$(cat tests/loadmore.browser.js)"`. Expect: FAIL, because there's no `[data-wc-loadmore]` yet.

- [ ] **Step 3: Implement the IIFE in `main.js`.** It finds `[data-wc-loadmore]`, then on click:
  - ignore modified clicks and `preventDefault`;
  - if a request is already in flight, return. Set `aria-busy="true"` while loading;
  - fetch `href`, then parse it with `DOMParser`;
  - import the `.gh-feed > article` elements whose `data-post-id` isn't already in the document, and append them to `[data-wc-river]`;
  - focus the first inserted card's link;
  - set the status text to `` `${n} more episodes loaded` ``, or `` `No more episodes` `` when `n` is 0;
  - set `href` from the fetched page's `link[rel=next]`, or hide the control when there is none;
  - on any error or a non-OK response, `location.href = href`.

  Rebuild through the CT watcher, and bypass `?v=` when verifying.

- [ ] **Step 4: Run it.** Run the commands from step 2, part (b), and `node tests/river.check.mjs`. Expect: `{"ok":true,...}` for both browser runs, and PASS.

- [ ] **Step 5: Commit.**
  - `git add home.hbs assets tests`
  - Commit message: `feat(home): Load more episodes in place, no-JS fallback to /latest/ (#100)`.

### Task 6: Sprint 2 gates and release prep

- [ ] **Step 1: Run every check and gscan.**
  - Run `for f in tests/*.check.mjs; do node "$f" || exit 1; done`, plus the three browser scripts at 320, 390 and 1440 on both brands.
  - Run `npx --yes gscan@5.2.4 .`.
  - Expect: everything passes, with 0 gscan errors.
- [ ] **Step 2: QA.** Run `wc-theme-qa` (or the manual checklist), and record which one ran in the PR.
- [ ] **Step 3: Design review.**
  - brand-guardian reviews screenshots of `/` (river with all three slots, a Luminous and an IoK river card, and the state after Load more), `/latest/` and `/episodes/`.
  - Run the impeccable critique: live if skill-ops#322 has cleared, otherwise provisional, from screenshots plus source.
  - Settle by eye whether pinned cards also say "Featured" (spec §4.4).
- [ ] **Step 4: Open the PR.** Base is `dev/homepage`, and the description includes the spike results and the #125 reply.
- [ ] **Step 5: Release checklist (rollup of `dev/homepage` → `main`).** Mark uploads `docs/routes.yaml` to **production** Admin before, or with, the theme deploy. If he doesn't, Load more and `/episodes/` return 404. Afterwards, run `WC_BASE=https://wondercabinetproductions.com node tests/routes.check.mjs`, then `node tests/river.check.mjs` with the same `WC_BASE`.
