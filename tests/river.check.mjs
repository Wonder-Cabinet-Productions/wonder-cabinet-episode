// #100: the homepage river and its sticky slots, checked against an oracle computed from the
// Content API (spec §4.1–4.4). Run from the theme root: node tests/river.check.mjs
import { fetchHtml, contentApi, assert, report } from './lib/site.mjs';

const RIVER_SIZE = 8;
// [series slug, slot comes after river card N] — must match partials/series/registry.hbs
const SLOTS = [['newsletter', 2], ['island-of-knowledge', 4], ['luminous', 6]];
// Brand precedence — must match the CSS source order of the .wc-brand--* blocks
const BRANDS = ['luminous', 'island-of-knowledge'];

const posts = (await contentApi('posts', { limit: 'all', include: 'tags', fields: 'id,slug,featured,published_at' })).posts;
const has = (p, s) => p.tags.some((t) => t.slug === s);
const river = posts.filter((p) => !has(p, 'newsletter')).slice(0, RIVER_SIZE);

// Oracle: a series' slot holds its NEWEST featured post, only if the river doesn't show it.
const expected = [];
river.forEach((p, i) => {
    expected.push(p.id);
    for (const [series, after] of SLOTS) {
        if (i + 1 !== after) continue;
        const pin = posts.find((q) => q.featured && has(q, series));
        if (pin && !river.includes(pin)) expected.push(`${series}:${pin.id}`);
    }
});

const html = await fetchHtml('/');
const start = html.indexOf('data-wc-river');
const stop = html.indexOf('</main>', start);
assert(start > -1, 'river container (data-wc-river) present');
const body = html.slice(start, stop);
const got = [...body.matchAll(/<article(?: data-wc-slot="([^"]+)")? data-post-id="([^"]+)"/g)]
    .map((m) => (m[1] ? `${m[1]}:${m[2]}` : m[2]));
const slug = Object.fromEntries(posts.map((p) => [p.id, p.slug]));
const show = (list) => list.map((x) => x.replace(/[0-9a-f]{24}/, (id) => slug[id] || id)).join('\n    ');
assert(JSON.stringify(got) === JSON.stringify(expected), `river + slots order\n  got\n    ${show(got)}\n  expected\n    ${show(expected)}`);
assert(new Set(got.map((g) => g.split(':').pop())).size === got.length, 'no post appears twice on page 1 (#35)');

// Series colour and label on river cards
const cards = body.split('<article').slice(1);
for (const p of river) {
    const card = cards.find((c) => c.includes(`data-post-id="${p.id}"`) && !c.startsWith(' data-wc-slot'));
    if (!card) { assert(false, `river card for ${p.slug}`); continue; }
    const head = card.slice(0, card.indexOf('>'));
    const brand = BRANDS.find((b) => has(p, b));
    if (brand) {
        assert(head.includes(`wc-brand--${brand}`), `${p.slug}: card carries wc-brand--${brand}`);
        assert(card.includes('wc-series-label'), `${p.slug}: card shows a series label`);
    } else {
        assert(!/wc-brand--/.test(head) && !card.includes('wc-series-label'), `${p.slug}: plain Wonder Cabinet card`);
    }
}

// Slot badges: tag name, linked to the series page from the registry
const SERIES_URL = { newsletter: '/newsletter/', 'island-of-knowledge': '/island-of-knowledge/', luminous: '/luminous/' };
for (const card of cards.filter((c) => c.startsWith(' data-wc-slot'))) {
    const series = card.match(/data-wc-slot="([^"]+)"/)[1];
    const badge = card.match(/<a class="wc-highlight-badge" href="([^"]*)">([^<]*)<\/a>/);
    assert(badge && badge[1] === SERIES_URL[series], `${series} slot badge links to ${SERIES_URL[series]}`);
    assert(badge && badge[2].trim().length > 0, `${series} slot badge has the tag name`);
}

assert(!html.includes('wc-featured-badge'), 'Featured badge removed (spec §4.5)');

// Load more without JS is a real link to the river's page 2; the archive link follows it (§4.1)
const more = html.match(/<a [^>]*data-wc-loadmore[^>]*>/);
const riverTotal = posts.filter((p) => !has(p, 'newsletter')).length;
if (riverTotal > RIVER_SIZE) assert(more && /href="\/latest\/page\/2\/"/.test(more[0]), 'Load more links to /latest/page/2/');
else assert(!more, 'no Load more when the river fits in one batch');
assert(/<a [^>]*href="\/episodes\/"/.test(html), 'link to /episodes/ below the river');

// WCAG AA for the new pairings (spec anti-goals): series label on the black card, and
// --show-on-accent (black) on each accent used for buttons and badges.
const lum = (hex) => {
    const c = hex.match(/\w\w/g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
for (const [name, accent] of [['Wonder Cabinet', '10A544'], ['Luminous', '9A59FF'], ['Island of Knowledge', 'B6D0D8']]) {
    assert(contrast(accent, '000000') >= 4.5, `${name}: accent on black ≥ 4.5:1 (${contrast(accent, '000000').toFixed(2)})`);
}

report('river');
