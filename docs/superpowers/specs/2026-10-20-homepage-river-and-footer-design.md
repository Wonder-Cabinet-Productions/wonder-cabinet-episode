# Homepage river (featured slots) and footer — design

**Date:** 2026-10-20 · **Issues:** #100 (homepage river), #132 (footer), #35 (duplicate, superseded) · **Series:** `dev/homepage` (opens after the Luminous cutover, #98)
**Decided by:** Mark, in a grilling session on 2026-10-20. Calls marked *(builder's call)* or *(designer's call)* were not his and are open to change.

---

## 1. Intent

The homepage at `/` is **Wonder Cabinet's front door, and it also gathers the activity around the show**: bonus newsletters, special series (Island of Knowledge) and the sibling show Luminous. It was first designed as a network landing page, then refitted for the flagship. This design keeps it the flagship's page and lets the other activity in on purpose, instead of through three hardcoded zones.

Mark has two needs:

1. **Branded series carry their branding on the homepage.** A new Luminous episode reads violet, Island of Knowledge reads blue, and so on, wherever it appears on `/`.
2. **Infrequent posts get a sticky spot.** IoK and Luminous don't publish weekly, and newsletters never appear in the episode list. A post Mark marks as special should hold a fixed spot near the top *if it wouldn't otherwise be there by date order*. A new Luminous episode should still flow through the list like any other episode while it's recent.

His expectation: in practice, every IoK, Luminous and newsletter post gets featured. The net effect should be that **special-series items hang around the top of the homepage longer than normal episodes**, with no ongoing curation.

Separately, the **footer nav** is squeezed between the legs of the cabinet illustration. Any label longer than "About" or "Contact" crowds badly at narrow widths (#132), which blocks clearer labels such as "About Wonder Cabinet".

## 2. Goals, non-goals, anti-goals

**Goals**
- One homepage list (the "river") carrying Wonder Cabinet (including IoK) and Luminous episodes in date order, each card in its series' colours.
- Featured posts pinned in a few slots, with at most one per series, only when the river doesn't already show them.
- A "Load more episodes" control that extends the river in place.
- A Wonder Cabinet-only episode archive at `/episodes/`.
- A footer where nav labels can grow freely.
- Zero ongoing work in Admin beyond ticking **Featured**.

**Non-goals**
- Turning `/` into a network page with equal billing for every show (hero, listen links and About stay Wonder Cabinet's).
- Changing post URLs or the `/luminous/` collection.
- Changing IoK's primary tag, or how IoK episode pages look (they stay Wonder Cabinet green).
- Sticky slots or a river on `/luminous/` or tag pages. #125 covers tag pages separately.
- Two-column or grid archives (the rest of #23).
- New brand colours. Series colours come from existing, contrast-tested tokens.

**Anti-goals** (failure even if it technically works)
- **Duplicates on page 1.** A post in both a slot and the river is the #35 bug.
- **A wall of highlight boxes.** If flowing series cards look like pinned cards, the river reads as all-promotion and nothing stands out.
- **Newsletters crowding out series.** Newsletters come out every two weeks; without a cap they would fill every slot within weeks.
- **An unreachable footer or newsletter signup.** True infinite scroll is out for this reason.
- **Inaccessible additions.** Every new colour pairing has to pass WCAG AA (the 2026-10 sprint just fixed several); "Load more" has to work by keyboard and screen reader.
- **Shrinking the footer type** to make labels fit (brand-guardian, #132).

## 3. Current state (dev/luminous, 2026-10-20)

- `home.hbs`: hero → listen links → "Latest Episodes" → `{{#get "posts" filter="tag:-newsletter+tag:-luminous" limit="5"}}`. Three `components/highlight-zone` calls sit after cards 2, 3 and 4, filtered `tag:newsletter|island-of-knowledge|luminous + featured:true`, `limit=1`, with hardcoded badge labels and URLs. Then "More Episodes →" to `/page/2/`, then the email CTA.
- `components/list-item.hbs` shows a "Featured" badge on featured posts (`wc-featured-badge`), and a newsletter variant.
- `components/newsletter-feature.hbs` is **unused**.
- Routes (dev; prod matches per the cutover backup): collections `/` (`tag:wonder-cabinet+tag:-newsletter`, `data: tag.wonder-cabinet`), `/luminous/`, `/newsletter/`. There are also seven dead `/player-*/` and `/wavesurfer-styles/` routes whose templates don't exist.
- **IoK episodes** have `wonder-cabinet` as their primary tag and `island-of-knowledge` as a secondary tag. They live in the `/` collection and render with `brand-wonder-cabinet`.
- **Brand tokens:** `--show-accent*` per body brand class. IoK has only `--iok-accent` / `--iok-accent-text` (used by `.wc-highlight--series`); there's no IoK body brand. #125 (another session) is adding opt-in per-tag colour schemes, IoK first.
- **Volumes on dev:** 11 posts in the WC feed, 15 Luminous, 2 IoK; newsletters roughly every two weeks. The Luminous back catalogue carries 2022–2024 air dates, so it sorts below 2026 WC episodes.
- **Featured** is read only by the homepage zones and the list-item badge. Nothing else depends on it.

## 4. The design — homepage

### 4.1 The river
- **Contents:** every post **not** tagged `newsletter`. That covers Wonder Cabinet (including IoK) and Luminous, newest first, interleaved by date.
- **First batch: 8 cards.** Mark wants to test 8; it's tunable.
- **"Load more episodes"** button below the river appends the next batch of 8 in place. No page navigation, and the footer and signup stay reachable. Batches after the first are plain river: no slots.
- **Without JavaScript,** the same control is a real link to page 2 of the river channel (§4.6), so crawlers and no-script visitors can page through.
- Below the river: **"All Wonder Cabinet episodes →"** links to `/episodes/` (§4.6).
- The `episode_section_heading` custom setting still drives the heading.

### 4.2 Series colour on cards
- **Any branded tag on a post sets its colour.** If a post carries a tag that has a brand defined in the theme, the card uses that brand. Otherwise it's Wonder Cabinet green.
  - **Precedence:** any non-WC brand beats `wonder-cabinet`. If a post has two non-WC brands, a fixed order in the series list decides: `luminous`, then `island-of-knowledge` *(builder's call, revised in planning: Handlebars can't read tag order cheaply; unlikely in practice)*.
- **Colours stay in the theme** as contrast-tested token pairs, never from Ghost's tag accent-colour field (the theme can't check contrast on an arbitrary colour).
- **One brand definition, shared with #125.** The set of "branded series" and their tokens should be the same definition #125 introduces for tag pages, not a second list. Coordinate with that session before building.
- A tag with no brand block renders green, and gets no slot (§4.3). **Adding a series is two small edits in one sprint:** its brand block (CSS tokens, for colour) and its slug in the series list (a single Handlebars partial, for slots). Handlebars can't read CSS, and custom settings are at Ghost's 20/20 cap, so the list can't live in Admin *(designer's call)*.
- **#125 hasn't landed.** This work defines the brand-block shape: per-card brand classes, since `/`'s body is always `brand-wonder-cabinet` and river cards need their own colour. It then offers that shape to #125 rather than waiting on it *(designer's call; tell the #125 session before building)*.
- **Wonder Cabinet has a brand block but is not in the series list.** **Newsletter is in the series list** for slots. Its card keeps today's newsletter styling; it isn't a show brand and doesn't go into #125's tag-page schemes.

### 4.3 Sticky slots
- **Featured means pinned.** Mark ticks **Featured** in Ghost Admin. The "Featured" badge on cards is removed so the flag means one thing.
- **Up to 3 slots on the first batch,** placed after river cards **2, 4 and 6** *(designer's call; tune by eye in the prototype)*. Fewer qualifying posts means fewer slots; nothing renders empty.
- **At most one slot per series.** A series' slot holds its **newest featured post**. Older featured posts from that series wait; they never take a second slot. Newsletters count as a series.
- **Slot series are newsletter, Island of Knowledge and Luminous only.** Wonder Cabinet is not a slot series: featuring a plain WC episode has no homepage effect. Mark chose this. With three series and three slots, every qualifying series always fits.
- **The slot is a safety net.** A featured post that's already among the first-batch river cards shows there, in the river, and doesn't take a slot. It takes its series' slot only once newer posts push it out of the first batch.
  - Newsletters never enter the river, so the newest featured newsletter always takes the newsletter slot.
  - Visible consequence (accepted): featuring a recent episode sometimes changes nothing visible, because it's still in the river.
- **Pins are manual.** No timer. A pin ends when Mark unticks Featured, or when a newer featured post from the same series replaces it.
- **Slot order is fixed per series:** newsletter after card 2, Island of Knowledge after card 4, Luminous after card 6. A series with no qualifying post leaves no slot *(designer's call, revised in planning: Handlebars can't sort separate per-series queries by date, so "newest first" isn't buildable server-side)*. If a fourth slot series is ever added, revisit both the slot count and this rule.
- **Slot badge links live in the series list,** not Ghost: on dev the Content API returns `/404/` as the URL of a tag that a collection owns (`luminous`, `newsletter`).
- **No JS:** slot selection is server-side (Handlebars `{{#get}}`). It works for crawlers and no-script visitors.

### 4.4 Card styles
- **Pinned (slot) cards:** today's highlight card (`components/highlight-zone`), already brand-guardian-approved. It's driven generically:
  - the badge text is the series tag's **name** (editable in Admin), linking to the series' page (`/luminous/`, `/island-of-knowledge/`, `/newsletter/`);
  - the accent class comes from the brand;
  - the CTA keeps today's data-driven "Read" / "View Episode".
  - Whether a pinned card also says "Featured" is left to the prototype *(designer's call, settle by eye)*.
- **Flowing (river) cards:** the normal episode card with the series' accent swapped in (border, button, hover) and a **small series label**, so a violet card in a green list explains itself.
  - Wonder Cabinet cards look exactly as today, apart from losing the "Featured" badge.

### 4.4a Load more and duplicates
- The #35 anti-goal covers the **whole page**, not just the first batch. When "Load more" inserts `/latest/page/N/` cards, it skips any post already on the page, which matters most for a pinned post that reappears in a later batch. Batch counts and the live-region announcement reflect the cards actually inserted *(designer's call)*.

### 4.5 Removed
- The three hardcoded highlight-zone calls and their hardcoded badge URLs (which the theme `CLAUDE.md` warns about).
- The #35 duplicate.
- The unused `components/newsletter-feature.hbs`.
- The `wc-featured-badge` on list items.

### 4.6 Routes (Ghost `routes.yaml`, uploaded in Admin, not shipped with the theme)
- **`/latest/` channel** (`controller: channel`): every non-newsletter post, newest first, paginated. Page 1 duplicates the homepage river; "Load more" fetches `/latest/page/N/` and the no-JS fallback links there. *(Path is the designer's call.)*
- **`/episodes/` channel:** Wonder Cabinet posts only (`tag:wonder-cabinet`, no newsletters), paginated, using the existing archive look. Mark chose this path.
- **Why channels, not collections:** a collection *owns* its posts' URLs, and a post belongs to one collection. Widening `/` to include Luminous would move every Luminous episode off `/luminous/{slug}/`. Channels list posts without owning them, so they don't overlap with `/`, `/luminous/` or `/newsletter/`. Confirm this on dev before relying on it.
- **Edit the tracked `docs/routes.yaml`** (added in #139 after the cutover; it matches production, has no dead `/player-*/` routes, and already carries an `/island-of-knowledge/` channel). Route changes go through that file in a PR, and Mark uploads it unchanged.
- **The `/` collection's own pagination** (`/page/N/`, rendered by `index.hbs`) stays live, because Ghost always paginates a collection. It's no longer linked from the homepage. Existing inbound links keep working, with no redirect *(designer's call; revisit if it confuses search)*.
- **Deploy order:** upload the routes before, or together with, the theme that links to them. Otherwise "Load more" and "All Wonder Cabinet episodes" point at 404s.

## 5. The design — footer (#132)

- **Copyright alone between the cabinet legs,** as the Art & Sons wireframe draws it (WonderCabinetWebsite-010725, p. 1). The wireframe has no footer nav; the nav was a theme addition.
- **Below the cabinet, a centred stack:** the secondary-nav row (wrapping freely when labels are long), then the social icons. Everything sits on the cabinet's centre line at every width.
- Nav links get a **≥ 24×24px target** (WCAG 2.2 SC 2.5.8).
- **Remove the `padding-left: 11px` optical offset** on `.wc-footer-nav`; it's tuned to "About" + "Contact" only.
- **Don't shrink the type.** 14px mobile is the floor (brand-guardian).
- **Both brands:**
  - Luminous hides the cabinet and its footer overlay already falls into normal flow, so the stack must look deliberate there too.
  - The Luminous footer is otherwise unchanged unless the prototype shows a reason.
- **Acceptance (from #132):**
  - a label like "About Wonder Cabinet" fits at 320px without crowding;
  - centring holds for any label;
  - verified at 320 / 390 / 1440 on both brands.
  - **Then** Mark may rename the label in Admin.

## 6. Process and gates

- **Series `dev/homepage`,** branched from `main` after the Luminous cutover lands (#98, #135). Nothing merges while the cutover hold is on.
- **Timing:** writing the plan can start now. **Building and staging prototypes wait for the cutover to finish.** Staging (`wondercabinet.riechers.co`) serves the shared Mac checkout, so a prototype there would land in the middle of the cutover review.
- **Sprint 1: footer.** Small, specified by #132.
- **Sprint 2: homepage.** Prototype on staging first, then build out.
- **Every sprint:** brand-guardian gate on visual changes, plus the cross-brand QA pass (`wc-theme-qa` or the manual checklist; record which ran).
- **Impeccable critique** once the homepage prototype is on staging, covering the river and the (by then merged) footer.
  - **Live** if skill-ops#322 has cleared by then (tracked on #129).
  - **Otherwise** from screenshots and source, labelled provisional like the 2026-10-14 About-modal critique.
- **Release:** `dev/homepage` → `main` rollup plus the `routes.yaml` upload (§4.6). That includes a Mark step in Admin, which goes on that release's checklist.

## 7. Left to the builder

- The Handlebars technique for "featured posts not in the first batch, newest per series" (for example, read the 8th river post's `published_at` and filter slots to older posts; one `{{#get}}` per branded series).
- How "Load more" fetches and inserts `/latest/page/N/` cards, plus the accessibility handling for it:
  - focus goes to the first new card;
  - a polite live-region announcement;
  - the button is hidden at the last page;
  - the URL is not rewritten *(builder's call)*.
- Exact series-label styling on river cards, within brand tokens; brand-guardian gates it.
- How the brand-to-tag mapping is expressed in CSS (body-level tokens vs card-level classes), aligned with #125.
- Performance: the number of `{{#get}}` calls on `/`. Keep it modest; measure on staging.
- Test data on dev: featured posts across series, enough to exercise every slot and the safety-net rule.
