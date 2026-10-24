# Luminous → Wonder Cabinet: what we're asking WPR to do

**Status (2026-10-24):** final. Luminous now lives at **https://wondercabinetproductions.com/luminous/**, with all 18 archive episodes published at their original air dates. This page records one small request to Wisconsin Public Radio (WPR), and why we're making it. The request itself goes by email with the CSV attached, so this page is the reference copy, not the message.

## The short version

*Luminous*, Steve Paulson's series on the science, philosophy and culture of psychedelics, first ran inside *To The Best Of Our Knowledge* (TTBOOK) and lives on wpr.org as 18 episode pages. Luminous is now its own podcast, produced by Wonder Cabinet Productions with the UW–Madison Center for Psychedelic Research and Education, and each episode has a permanent home on our site.

We'd like people who find the old pages to land on the new ones. That means one redirect per episode: **18 rows, listed below, nothing to work out.**

## What we're asking

**Preferred: a permanent redirect (HTTP 301)** from each WPR episode page in the table to its Wonder Cabinet page. The full list is in [`wpr-redirects.csv`](wpr-redirects.csv): `from_url,to_url`, one row per episode, ready for a redirect plugin or a server rule. The slugs differ between the sites, so please match by row, not by pattern.

**If redirects aren't possible**, two edits on each of the same 18 pages get most of the benefit:
1. One line near the top: *"Luminous now lives at Wonder Cabinet →"*, linked to the matching new page.
2. Set the page's canonical tag, `<link rel="canonical" href="…">`, to the matching new page.

**Two optional extras**, also in the CSV:
- `…/luminous-do-psychedelics-reveal-a-deeper-dimension-of-reality` is a second WPR page for one of the episodes. It can redirect to the same place as its twin.
- `ttbook.org/luminous`, the old series page, currently lands on the TTBOOK show home. Pointing it at `wondercabinetproductions.com/luminous/` sends series-level traffic to the series.

We're not asking WPR to remove anything else, and the TTBOOK broadcasts that included Luminous segments stay as they are. For example, the TTBOOK page `…/did-the-ancient-greeks-use-drugs-to-find-god` (no "Luminous:" prefix) isn't on the list.

## Why it matters

- **Listeners land on the current home.** It has full episodes, transcripts and new episodes as they come out. The WPR pages are a snapshot from when the series ran inside TTBOOK.
- **Search engines stop splitting the series in two.** Today two sites carry the same 18 episodes. A redirect, or a canonical tag, tells search which one is the source, so the series gets found instead of competing with itself.
- **Nothing breaks.** The old ttbook.org episode links already redirect to these WPR pages, so with WPR's redirect in place they reach Wonder Cabinet too. The audio is served by PRX and doesn't depend on either website.

## Mapping: 18 episodes, oldest first

Every WPR URL was checked live (HTTP 200, title matches the episode) on 2026-10-24.

| # | Episode | Air date | WPR page (redirect from) | Wonder Cabinet page (redirect to) |
|---|---|---|---|---|
| 1 | What Can Psychedelics Teach Us About Dying? | 2023-04-08 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-what-can-psychedelics-teach-us-about-dying-2 | https://wondercabinetproductions.com/luminous/what-can-psychedelics-teach-us-about-dying/ |
| 2 | Building The Psychedelic Revolution | 2023-05-17 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-building-the-psychedelic-revolution | https://wondercabinetproductions.com/luminous/building-the-psychedelic-revolution/ |
| 3 | Melissa Etheridge on Ayahuasca | 2023-07-08 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-melissa-etheridge-on-ayahuasca | https://wondercabinetproductions.com/luminous/melissa-etheridge-on-ayahuasca/ |
| 4 | Your Brain on Shrooms | 2023-07-15 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-your-brain-on-shrooms-2 | https://wondercabinetproductions.com/luminous/your-brain-on-shrooms/ |
| 5 | What happens to an octopus on MDMA? | 2023-08-12 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-what-happens-to-an-octopus-on-mdma | https://wondercabinetproductions.com/luminous/what-happens-to-an-octopus-on-mdma/ |
| 6 | Can psychedelics be decolonized? | 2023-10-21 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-can-psychedelics-be-decolonized | https://wondercabinetproductions.com/luminous/can-psychedelics-be-decolonized/ |
| 7 | Can you have too much transcendence? | 2023-11-18 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-can-you-have-too-much-transcendence | https://wondercabinetproductions.com/luminous/can-you-have-too-much-transcendence/ |
| 8 | Is it the drug or is it the trip? | 2023-12-16 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-is-it-the-drug-or-is-it-the-trip | https://wondercabinetproductions.com/luminous/is-it-the-drug-or-is-it-the-trip/ |
| 9 | A brief history of getting high | 2024-01-27 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-a-brief-history-of-getting-high | https://wondercabinetproductions.com/luminous/a-brief-history-of-getting-high/ |
| 10 | Did the ancient Greeks use drugs to find God? | 2024-05-04 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-did-the-ancient-greeks-use-drugs-to-find-god | https://wondercabinetproductions.com/luminous/did-the-ancient-greeks-use-drugs-to-find-god/ |
| 11 | Erik Davis on LSD and the Psychedelic Underground | 2024-07-20 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/erik-davis-on-lsd-the-psychedelic-underground-and-visionary-experience | https://wondercabinetproductions.com/luminous/erik-davis-on-lsd-and-the-psychedelic-underground/ |
| 12 | Katherine MacLean on the Limits of Consensus Reality | 2024-08-30 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-katherine-maclean-on-mushrooms-and-the-limits-of-consensus-reality | https://wondercabinetproductions.com/luminous/katherine-maclean-on-the-limits-of-consensus-reality/ |
| 13 | Do psychedelics reveal a deeper dimension of reality? | 2024-11-25 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-do-psychedelics-reveal-a-deeper-dimension-of-reality-2 | https://wondercabinetproductions.com/luminous/do-psychedelics-reveal-a-deeper-dimension-of-reality/ |
| 14 | Spring Washam, the Buddhist Shaman | 2025-01-25 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-spring-washam-the-buddhist-shaman | https://wondercabinetproductions.com/luminous/spring-washam-the-buddhist-shaman/ |
| 15 | Chris Timmerman on how DMT can deconstruct the mind | 2025-03-01 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-chris-timmerman-on-how-dmt-can-deconstruct-the-mind | https://wondercabinetproductions.com/luminous/chris-timmerman-on-how-dmt-can-deconstruct-the-mind/ |
| 16 | Marcelo and Kari Gleiser on tripping with your partner | 2025-05-09 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-marcelo-and-kari-gleiser-on-tripping-with-your-partner | https://wondercabinetproductions.com/luminous/marcelo-and-kari-gleiser-on-tripping-with-your-partner/ |
| 17 | Thomas Metzinger on a 'Culture of Consciousness' | 2025-08-02 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-thomas-metzinger-on-why-we-need-a-culture-of-consciousness | https://wondercabinetproductions.com/luminous/thomas-metzinger-on-a-culture-of-consciousness/ |
| 18 | Reclaiming the Acid Queen | 2025-11-08 | https://www.wpr.org/shows/to-the-best-of-our-knowledge/luminous-reclaiming-the-acid-queen | https://wondercabinetproductions.com/luminous/reclaiming-the-acid-queen/ |

## What we did on our side

- Each Wonder Cabinet episode page is self-canonical: its `<link rel="canonical">` points at itself, and no longer at ttbook.org or wpr.org.
- Each episode's PRX record now links to its Wonder Cabinet page, so podcast apps send people there.
- The archive was published with original air dates and no email to subscribers. It's an archive, not a relaunch blast.

## For reference: the old ttbook.org addresses

These already 301 to the WPR pages above. WPR controls these rules, and nothing in them needs to change.

| Episode | Old ttbook.org URL |
|---|---|
| What Can Psychedelics Teach Us About Dying? | https://ttbook.org/show/luminous-what-can-psychedelics-teach-us-about-dying |
| Building The Psychedelic Revolution | https://www.ttbook.org/show/luminous-building-psychedelic-revolution |
| Melissa Etheridge on Ayahuasca | https://www.ttbook.org/show/luminous-melissa-etheridge-ayahuasca |
| Your Brain on Shrooms | https://www.ttbook.org/show/luminous-your-brain-shrooms |
| What happens to an octopus on MDMA? | https://www.ttbook.org/show/luminous-giving-mdma-octopuses |
| Can psychedelics be decolonized? | https://www.ttbook.org/show/luminous-can-psychedelics-be-decolonized |
| Can you have too much transcendence? | https://www.ttbook.org/show/luminous-can-you-have-too-much-transcendence |
| Is it the drug or is it the trip? | https://www.ttbook.org/show/luminous-it-drug-or-it-trip |
| A brief history of getting high | https://www.ttbook.org/show/luminous-brief-history-getting-high |
| Did the ancient Greeks use drugs to find God? | https://www.ttbook.org/show/did-ancient-greeks-use-drugs-find-god |
| Erik Davis on LSD and the Psychedelic Underground | https://www.ttbook.org/show/erik-davis-lsd-psychedelic-underground-and-visionary-experience |
| Katherine MacLean on the Limits of Consensus Reality | https://www.ttbook.org/show/luminous-katherine-maclean-mushrooms-and-limits-consensus-reality |
| Do psychedelics reveal a deeper dimension of reality? | https://www.ttbook.org/interview/luminous-do-psychedelics-reveal-deeper-dimension-reality |
| Spring Washam, the Buddhist Shaman | https://www.ttbook.org/show/luminous-spring-washam-buddhist-shaman |
| Chris Timmerman on how DMT can deconstruct the mind | https://www.ttbook.org/show/luminous-chris-timmerman-how-dmt-can-deconstruct-mind |
| Marcelo and Kari Gleiser on tripping with your partner | https://www.ttbook.org/show/luminous-marcelo-and-kari-gleiser-tripping-your-partner |
| Thomas Metzinger on a 'Culture of Consciousness' | https://www.ttbook.org/show/luminous-thomas-metzinger-why-we-need-culture-consciousness |
| Reclaiming the Acid Queen | https://www.ttbook.org/show/luminous-reclaiming-acid-queen |

## History

- 2026-06-08: first draft. It mapped 17 TTBOOK *interview* pages rather than the Luminous episodes, and its target URLs were pre-launch slugs. Superseded.
- 2026-10-24: rebuilt from the final production slug list (`prx-to-ghost-publisher/data/luminous-final-slugs.prod.csv`) after the cutover (#98). Every WPR page was re-verified live. Three old ttbook URLs missing from that list were recovered from the pre-cutover PRX feed and the prod content snapshot. Two WPR pages that the slug list recorded only as the TTBOOK show home were resolved to their episode pages. See #126 and #97.
