# Sprint 2.3 — Luminous Content Audit Findings

**Audit only — no content, Ghost settings, or theme files were changed.** Scope and boundary per
`content-cleanup-brief.md`. Source of truth for "live": public checks against
`https://wondercabinet.riechers.co` (curl only — no Ghost Admin/DB/ssh access used).
Reconciled against the 17-row target table in `docs/luminous/wpr-redirect-handoff.md`.

## Summary

**0 of 17 episodes are fully clean. 17 need a decision** — but they split into two very
different kinds of issue, and most of this is expected in-progress sprint state, not a bug:

- **16 of 17** target episodes (rows 1–16) are **not live** on the site at all — no post at
  the target slug, none in the `tag:luminous` archive page, none in the tag RSS feed, none in
  the site-wide RSS feed or sitemap. They exactly match the 16 posts sitting as `status: draft`
  in `wonder-cabinet-tools/luminous-interviews-ghost-import.json` (not confirmed inside Ghost
  Admin — that's out of this audit's bounds — but the slug-for-slug match across all 16 makes
  this the obvious read).
- **1 of 17** (row 17, "Reclaiming the Acid Queen") **is live** and its slug matches the table
  exactly — but its `<link rel="canonical">` currently points *backward* to
  `ttbook.org/show/luminous-reclaiming-acid-queen`, the opposite direction from the handoff
  doc's whole strategy (WPR → canonical → Wonder Cabinet). This will quietly tell Google to
  treat the old WPR page as canonical instead of the new one, undermining the redirect ask
  before it's even sent.
- **2 of the 16** draft slugs (rows 1 and 16) also have a **real readability break** — same
  ones the brief flagged as an example, confirmed by comparing to the source titles. Two more
  (rows 11 and 15) are borderline/minor — noted below, not put in the main table.

No duplicate/stale Luminous-tagged posts were found on the site (only one post carries the tag
at all, and it's row 17 — already accounted for).

## Decision table

| # | Episode | Current live slug | Target slug (table) | Issue | Question for the human |
|---|---|---|---|---|---|
| 1 | How a pioneering psychedelic researcher 'leaned in' to his terminal cancer diagnosis | — (404 at `/luminous/…/` and at site root; not in tag archive/RSS/sitemap) | `how-pioneering-psychedelic-researcher-leaned-his-terminal-cancer-diagnosis` | Not live (draft in import JSON). **Plus:** slug drops "into" from "leaned in to" — reads as "leaned his terminal cancer diagnosis," which is grammatically broken, not just terse. This exact slug is baked into both the import JSON and the handoff table (same source), so fixing it means editing both. | Fix the slug before publishing (e.g. `…-leaned-into-his-terminal-cancer-diagnosis`) and update the table to match — or accept as-is? Also: is this episode intentionally still unpublished pending the Sprint 2.3 cutover, or should it be imported/published now? |
| 2 | Dying without fear: How psychedelics can ease the anxiety of terminal illness | — (not live) | `dying-without-fear-how-psychedelics-can-ease-anxiety-terminal-illness` | Not live (draft in import JSON). Slug itself reads fine (only stopwords dropped). | Publish now, or hold for the deferred cutover? |
| 3 | The terror and the ecstasy of psychedelics | — (not live) | `terror-and-ecstasy-psychedelics` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 4 | Luminous: Do psychedelics reveal a deeper dimension of reality? | — (not live) | `luminous-do-psychedelics-reveal-deeper-dimension-reality` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 5 | Does psychedelic therapy need the trip? | — (not live) | `does-psychedelic-therapy-need-trip` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 6 | Will psychedelics replace antidepressants? | — (not live) | `will-psychedelics-replace-antidepressants` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 7 | Spiritual warriors in the psychedelic underground | — (not live) | `spiritual-warriors-psychedelic-underground` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 8 | The Tragic Story of Maria Sabina's Sacred Mushrooms | — (not live) | `tragic-story-maria-sabinas-sacred-mushrooms` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 9 | Empowering Indigenous voices in the psychedelic industry | — (not live) | `empowering-indigenous-voices-psychedelic-industry` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 10 | The long history of psychedelic theft | — (not live) | `long-history-psychedelic-theft` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 11 | Did the ancient Greeks use drugs to find God? | — (not live) | `did-ancient-greeks-use-drugs-find-god` | Not live (draft in import JSON). Slug drops "to" — minor/borderline, still parses okay as a keyword string, low confidence this needs a fix. | Publish now, or hold — and worth touching up the slug, or fine as-is? |
| 12 | The godmother of the European psychedelic revival | — (not live) | `godmother-european-psychedelic-revival` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 13 | Exploring consciousness on toad venom | — (not live) | `exploring-consciousness-toad-venom` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 14 | Magic mushrooms and the 'entropic brain' | — (not live) | `magic-mushrooms-and-entropic-brain` | Not live (draft in import JSON). Slug reads fine. | Publish now, or hold for the deferred cutover? |
| 15 | Spirit Medicine: Yuria Celidwen's vision for an ethical psychedelics | — (not live) | `spirit-medicine-yuria-celidwens-vision-ethical-psychedelics` | Not live (draft in import JSON). Slug drops "for" — minor/borderline ("vision ethical psychedelics" reads a little mashed-together), low confidence this needs a fix. | Publish now, or hold — and worth touching up the slug, or fine as-is? |
| 16 | Our minds remain open when the LSD wears off | — (not live) | `our-minds-remain-open-when-lsd-wears` | Not live (draft in import JSON). **Plus:** slug drops the trailing "off" — "…lsd-wears" reads incomplete/broken, same severity as #1. | Fix the slug before publishing (e.g. `…-when-lsd-wears-off`) and update the table to match — or accept as-is? Also: publish now, or hold for the deferred cutover? |
| 17 | Reclaiming the Acid Queen | `reclaiming-the-acid-queen` (**live**, matches target) | `reclaiming-the-acid-queen` | **Live and slug is correct** — no slug issue. But its `<link rel="canonical">` currently points to `https://www.ttbook.org/show/luminous-reclaiming-acid-queen` (confirmed via curl of the live page's `<head>`), the reverse of the intended direction (WPR pages canonicalizing to Wonder Cabinet, not the other way). Feature/OG image is also still hotlinked to PRX's CDN (`f.prxu.org/…`) rather than uploaded to Ghost's own media library — likely fine functionally, flagging in case it matters for the launch checklist. | Should this post's canonical be cleared (self-canonical) or repointed to the eventual production URL (`wondercabinetproductions.com/luminous/reclaiming-the-acid-queen/`) ahead of the WPR ask — and should that happen now or wait for the deferred cutover step? Is the hotlinked PRX feature image acceptable, or should it be re-uploaded to Ghost? |

## Open questions / data-gaps

1. **Draft status is inferred, not confirmed.** The "not live" conclusion for rows 1–16 is
   built entirely from public-site checks (tag archive page, tag RSS, site RSS, sitemap, and
   direct slug probes at both `/luminous/{slug}/` and site-root `/{slug}/` — all 404/absent)
   plus a slug-for-slug match against `wonder-cabinet-tools/luminous-interviews-ghost-import.json`,
   where all 16 are explicitly marked `"status": "draft"`. Per the brief's boundary I did not
   check Ghost Admin/DB to confirm whether these 16 actually exist as drafts in Ghost already
   (imported-but-unpublished) or haven't been imported at all yet. Recommend a quick Admin
   glance to tell which of those two states it is — it changes whether the next step is
   "publish" or "run the importer."
2. **`/tag/luminous/` doesn't render the pagination/count header** the current `tag.hbs`
   template expects (`{{../pagination.total}} available` heading, from `tag.hbs` lines 12–18) —
   the live HTML has no `wc-episodes-header` section at all, just the hero + episode list. With
   only 1 post total this may simply be a `{{#if}}` on a falsy/absent value rather than a real
   template bug, and template behavior is the theme-code lane's territory, not mine to fix — but
   flagging in case it's relevant to that lane's testing (I did not investigate further, per the
   "no theme files" boundary).
3. **Feature images across all 17 episodes are hotlinked to external CDNs** (`wpr-public.s3.amazonaws.com`
   for the 16 drafts, `f.prxu.org` for the 1 live post) rather than uploaded into Ghost's media
   library. Not necessarily a defect (images render fine), but worth a decision on whether these
   should be re-hosted before the episodes go live/production, in case the source CDNs ever
   change or rate-limit hotlinking.
4. **Excerpts on the 16 drafts are mostly photo-credit lines** (e.g. "An interview with Steve
   Paulson.", "Photo illustration by Mark Riechers/Midjourney (TTBOOK)") rather than
   episode-description excerpts — that's what will show as the card/meta description if
   published as-is. Worth a look before publish; not flagged as a defect since I can't tell if
   that's the intended editorial style for this series or just carried over from the WPR source
   uncorrected.
5. **Publish dates in the import JSON are the original 2022–2024 WPR air dates** (preserved,
   not defaulted to today). Assuming that's intentional (keeps original chronology) — flagging
   only so the human can confirm that's still the desired behavior when these are eventually
   published/imported.

## Method (for reproducibility)

- `curl -s -L https://wondercabinet.riechers.co/tag/luminous/` (+ `/page/2/` through `/page/5/`,
  all 404 → single page, single post)
- `curl -s -L https://wondercabinet.riechers.co/tag/luminous/rss/` → 1 `<item>`
- `curl -s -L https://wondercabinet.riechers.co/rss/` and `/sitemap-posts.xml` and
  `/sitemap-tags.xml` → cross-checked, no other Luminous posts or duplicate tag found
- Direct probes of all 16 target-table slugs and their WPR-derived equivalents, at both
  `/luminous/{slug}/` and `/{slug}/` → all 404 except `/luminous/reclaiming-the-acid-queen/` (200)
- `curl -s -L https://wondercabinet.riechers.co/luminous/reclaiming-the-acid-queen/` → inspected
  `<head>` for `<link rel="canonical">`, `og:image`, `og:url`, `article:published_time`
- `wonder-cabinet-tools/luminous-interviews-ghost-import.json` read locally (not modified) to
  compare slugs/status/tags/excerpts/feature images against the 16 missing table rows
