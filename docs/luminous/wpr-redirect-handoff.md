# Luminous → WPR redirect handoff

**Purpose**: the cross-domain mapping WPR needs so that traffic to the old To The Best Of Our Knowledge / Luminous episode pages reaches the new Wonder Cabinet permalinks. Generated 2026-06-08; verified live (all 17 WPR URLs returned HTTP 200).

**Production domain**: `https://wondercabinetproductions.com` (URLs below are final). Dev/preview is `wondercabinet.riechers.co`. The `/luminous/{slug}/` routing is delivered by the Sprint 2.3 `routes.yaml` collection.

**Chosen approach**: ask WPR to **add a link + `rel=canonical`** on the 17 pages — not a redirect. WPR keeps its archive; we become the canonical home and pick up referral traffic.

## The ask (draft message to WPR — paste, fill the name + domain, attach the CSV)

> **Subject:** Small web request — 16 "To The Best Of Our Knowledge" / Luminous episode pages
>
> Hi [name],
>
> The *Luminous* psychedelics series now has a dedicated home on our new site, **Wonder Cabinet**. Those 17 episodes currently live on wpr.org under the To The Best Of Our Knowledge show — we're not asking you to take anything down. Just two small, mechanical changes on each of those 17 pages so listeners and search engines can find the new home:
>
> 1. **Add one line near the top of the episode:** *"This series now lives at Wonder Cabinet →"* linked to the matching new URL.
> 2. **Set the page's canonical tag** — `<link rel="canonical" href="…">` — to the matching new URL, so search treats Wonder Cabinet as the source of truth.
>
> The exact page-by-page mapping is below (and attached as a CSV) — 17 rows, your current URL → the new Wonder Cabinet URL. No judgment calls, just a lookup; the slugs differ so please match by row, not by pattern.
>
> Thanks so much — happy to hop on a 10-minute call if that's easier.

The `from_url` / `to_url` table and CSV below are the attachment for that message (here `to_url` = the link + canonical target, not a redirect).

## Pages WPR needs to edit (the 17 URLs where the text + canonical go)

Each of these existing WPR pages gets the one-line link + the `rel=canonical` pointing at its paired Wonder Cabinet URL (pairings in the mapping table below):

1. https://www.wpr.org/shows/to-the-best-of-our-knowledge/roland-griffiths-on-new-psilocybin-studies
2. https://www.wpr.org/shows/to-the-best-of-our-knowledge/dying-without-fear-how-psychedelics-can-ease-the-anxiety-of-terminal-illness
3. https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-terror-and-the-ecstasy-of-psychedelics
4. https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-do-psychedelics-reveal-a-deeper-dimension-of-reality-2
5. https://www.wpr.org/shows/to-the-best-of-our-knowledge/does-psychedelic-therapy-need-the-trip
6. https://www.wpr.org/shows/to-the-best-of-our-knowledge/will-psychedelics-replace-antidepressants
7. https://www.wpr.org/shows/to-the-best-of-our-knowledge/spiritual-warriors-in-the-psychedelic-underground
8. https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-tragic-story-of-maria-sabinas-sacred-mushrooms
9. https://www.wpr.org/shows/to-the-best-of-our-knowledge/empowering-indigenous-voices-in-the-psychedelic-industry
10. https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-long-history-of-psychedelic-theft
11. https://www.wpr.org/shows/to-the-best-of-our-knowledge/did-the-ancient-greeks-use-drugs-to-find-god
12. https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-godmother-of-the-european-psychedelic-revival
13. https://www.wpr.org/shows/to-the-best-of-our-knowledge/exploring-consciousness-on-toad-venom
14. https://www.wpr.org/shows/to-the-best-of-our-knowledge/magic-mushrooms-and-the-entropic-brain
15. https://www.wpr.org/shows/to-the-best-of-our-knowledge/spirit-medicine-yuria-celidwens-vision-for-an-ethical-psychedelics
16. https://www.wpr.org/shows/to-the-best-of-our-knowledge/our-minds-remain-open-when-the-lsd-wears-off
17. https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-reclaiming-the-acid-queen

> Verified live 2026-06-08 — all 17 returned HTTP 200 (rows 1–16 from the interview import; row 17 *Reclaiming the Acid Queen* added 2026-06-10, sourced from `ttbook.org/show/luminous-reclaiming-acid-queen`). Worth a re-check right before sending, in case WPR reshuffles slugs.

## Context

- Old `ttbook.org/interview/{slug}` URLs already 301 to `wpr.org/shows/to-the-best-of-our-knowledge/{slug}` (WPR controls this).
- There is no "Luminous" grouping on WPR — the series lives only on the new Wonder Cabinet site.
- WPR slugs differ from ours, so this is an explicit per-episode table, not a rule.

## Mapping (17 episodes)

| # | Episode | Current WPR URL (redirect FROM) | New Wonder Cabinet URL (redirect TO) |
|---|---|---|---|
| 1 | How a pioneering psychedelic researcher 'leaned in' to hi… | https://www.wpr.org/shows/to-the-best-of-our-knowledge/roland-griffiths-on-new-psilocybin-studies | https://wondercabinetproductions.com/luminous/how-pioneering-psychedelic-researcher-leaned-his-terminal-cancer-diagnosis/ |
| 2 | Dying without fear: How psychedelics can ease the anxiety… | https://www.wpr.org/shows/to-the-best-of-our-knowledge/dying-without-fear-how-psychedelics-can-ease-the-anxiety-of-terminal-illness | https://wondercabinetproductions.com/luminous/dying-without-fear-how-psychedelics-can-ease-anxiety-terminal-illness/ |
| 3 | The terror and the ecstasy of psychedelics | https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-terror-and-the-ecstasy-of-psychedelics | https://wondercabinetproductions.com/luminous/terror-and-ecstasy-psychedelics/ |
| 4 | Luminous: Do psychedelics reveal a deeper dimension of re… | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-do-psychedelics-reveal-a-deeper-dimension-of-reality-2 | https://wondercabinetproductions.com/luminous/luminous-do-psychedelics-reveal-deeper-dimension-reality/ |
| 5 | Does psychedelic therapy need the trip? | https://www.wpr.org/shows/to-the-best-of-our-knowledge/does-psychedelic-therapy-need-the-trip | https://wondercabinetproductions.com/luminous/does-psychedelic-therapy-need-trip/ |
| 6 | Will psychedelics replace antidepressants? | https://www.wpr.org/shows/to-the-best-of-our-knowledge/will-psychedelics-replace-antidepressants | https://wondercabinetproductions.com/luminous/will-psychedelics-replace-antidepressants/ |
| 7 | Spiritual warriors in the psychedelic underground | https://www.wpr.org/shows/to-the-best-of-our-knowledge/spiritual-warriors-in-the-psychedelic-underground | https://wondercabinetproductions.com/luminous/spiritual-warriors-psychedelic-underground/ |
| 8 | The Tragic Story of Maria Sabina's Sacred Mushrooms | https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-tragic-story-of-maria-sabinas-sacred-mushrooms | https://wondercabinetproductions.com/luminous/tragic-story-maria-sabinas-sacred-mushrooms/ |
| 9 | Empowering Indigenous voices in the psychedelic industry | https://www.wpr.org/shows/to-the-best-of-our-knowledge/empowering-indigenous-voices-in-the-psychedelic-industry | https://wondercabinetproductions.com/luminous/empowering-indigenous-voices-psychedelic-industry/ |
| 10 | The long history of psychedelic theft | https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-long-history-of-psychedelic-theft | https://wondercabinetproductions.com/luminous/long-history-psychedelic-theft/ |
| 11 | Did the ancient Greeks use drugs to find God? | https://www.wpr.org/shows/to-the-best-of-our-knowledge/did-the-ancient-greeks-use-drugs-to-find-god | https://wondercabinetproductions.com/luminous/did-ancient-greeks-use-drugs-find-god/ |
| 12 | The godmother of the European psychedelic revival | https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-godmother-of-the-european-psychedelic-revival | https://wondercabinetproductions.com/luminous/godmother-european-psychedelic-revival/ |
| 13 | Exploring consciousness on toad venom | https://www.wpr.org/shows/to-the-best-of-our-knowledge/exploring-consciousness-on-toad-venom | https://wondercabinetproductions.com/luminous/exploring-consciousness-toad-venom/ |
| 14 | Magic mushrooms and the 'entropic brain' | https://www.wpr.org/shows/to-the-best-of-our-knowledge/magic-mushrooms-and-the-entropic-brain | https://wondercabinetproductions.com/luminous/magic-mushrooms-and-entropic-brain/ |
| 15 | Spirit Medicine: Yuria Celidwen's vision for an ethical p… | https://www.wpr.org/shows/to-the-best-of-our-knowledge/spirit-medicine-yuria-celidwens-vision-for-an-ethical-psychedelics | https://wondercabinetproductions.com/luminous/spirit-medicine-yuria-celidwens-vision-ethical-psychedelics/ |
| 16 | Our minds remain open when the LSD wears off | https://www.wpr.org/shows/to-the-best-of-our-knowledge/our-minds-remain-open-when-the-lsd-wears-off | https://wondercabinetproductions.com/luminous/our-minds-remain-open-when-lsd-wears/ |
| 17 | Reclaiming the Acid Queen | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-reclaiming-the-acid-queen | https://wondercabinetproductions.com/luminous/reclaiming-the-acid-queen/ |

## CSV (copy/paste for their CMS or dev)

```csv
from_url,to_url,type
https://www.wpr.org/shows/to-the-best-of-our-knowledge/roland-griffiths-on-new-psilocybin-studies,https://wondercabinetproductions.com/luminous/how-pioneering-psychedelic-researcher-leaned-his-terminal-cancer-diagnosis/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/dying-without-fear-how-psychedelics-can-ease-the-anxiety-of-terminal-illness,https://wondercabinetproductions.com/luminous/dying-without-fear-how-psychedelics-can-ease-anxiety-terminal-illness/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-terror-and-the-ecstasy-of-psychedelics,https://wondercabinetproductions.com/luminous/terror-and-ecstasy-psychedelics/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-do-psychedelics-reveal-a-deeper-dimension-of-reality-2,https://wondercabinetproductions.com/luminous/luminous-do-psychedelics-reveal-deeper-dimension-reality/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/does-psychedelic-therapy-need-the-trip,https://wondercabinetproductions.com/luminous/does-psychedelic-therapy-need-trip/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/will-psychedelics-replace-antidepressants,https://wondercabinetproductions.com/luminous/will-psychedelics-replace-antidepressants/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/spiritual-warriors-in-the-psychedelic-underground,https://wondercabinetproductions.com/luminous/spiritual-warriors-psychedelic-underground/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-tragic-story-of-maria-sabinas-sacred-mushrooms,https://wondercabinetproductions.com/luminous/tragic-story-maria-sabinas-sacred-mushrooms/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/empowering-indigenous-voices-in-the-psychedelic-industry,https://wondercabinetproductions.com/luminous/empowering-indigenous-voices-psychedelic-industry/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-long-history-of-psychedelic-theft,https://wondercabinetproductions.com/luminous/long-history-psychedelic-theft/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/did-the-ancient-greeks-use-drugs-to-find-god,https://wondercabinetproductions.com/luminous/did-ancient-greeks-use-drugs-find-god/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/the-godmother-of-the-european-psychedelic-revival,https://wondercabinetproductions.com/luminous/godmother-european-psychedelic-revival/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/exploring-consciousness-on-toad-venom,https://wondercabinetproductions.com/luminous/exploring-consciousness-toad-venom/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/magic-mushrooms-and-the-entropic-brain,https://wondercabinetproductions.com/luminous/magic-mushrooms-and-entropic-brain/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/spirit-medicine-yuria-celidwens-vision-for-an-ethical-psychedelics,https://wondercabinetproductions.com/luminous/spirit-medicine-yuria-celidwens-vision-ethical-psychedelics/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/our-minds-remain-open-when-the-lsd-wears-off,https://wondercabinetproductions.com/luminous/our-minds-remain-open-when-lsd-wears/,301
https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-reclaiming-the-acid-queen,https://wondercabinetproductions.com/luminous/reclaiming-the-acid-queen/,301
```