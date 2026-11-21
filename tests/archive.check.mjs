// #23: list pages use the homepage's click-to-load "Load more" instead of the old
// prev/next pager. Server-rendered markup only; tests/loadmore.browser.js covers the click.
// Run: node tests/archive.check.mjs   (WC_BASE to point elsewhere)
import { fetchHtml, contentApi, assert, report } from './lib/site.mjs';

const PAGES = ['/episodes/', '/luminous/', '/newsletter/', '/latest/'];
for (const path of PAGES) {
    const html = await fetchHtml(path);
    const next = html.match(/<link rel="next" href="([^"]+)"/);
    assert(/data-wc-river/.test(html), `${path}: the feed is marked data-wc-river`);
    assert(!/wc-pagination-count/.test(html), `${path}: no "Page N of M" count`);
    if (next) {
        const btn = html.match(/<a [^>]*data-wc-loadmore[^>]*href="([^"]+)"|<a [^>]*href="([^"]+)"[^>]*data-wc-loadmore/);
        assert(!!btn, `${path}: has a Load more link`);
        const href = btn && (btn[1] || btn[2]);
        assert(href && new URL(href, 'http://x').pathname === `${path}page/2/`, `${path}: Load more links to ${path}page/2/ without JS (got ${href})`);
        assert(/data-wc-loadmore[^>]*>Load more<\/a>/.test(html), `${path}: button reads "Load more" (lists aren't all episodes)`);
        assert(/data-wc-loadmore-status[^>]*aria-live="polite"|aria-live="polite"[^>]*data-wc-loadmore-status/.test(html), `${path}: has a live status region`);
    }
}

// Page 2 keeps a way back, plus Load more for the rest
const p2 = await fetchHtml('/episodes/page/2/');
assert(/href="\/episodes\/"[^>]*>[^<]*Newer/i.test(p2) || /Newer[^<]*<\/a>/i.test(p2) && /href="\/episodes\/"/.test(p2), '/episodes/page/2/: links back to newer episodes');

// Tag heroes name the tag once (#125): the art when there is some (as the h1's image,
// alt = the name), otherwise the name as text. No second heading repeats it above the list.
const tags = (await contentApi('tags', { limit: 'all', include: 'count.posts', filter: 'visibility:public' })).tags;
for (const path of ['/island-of-knowledge/', '/newsletter/']) {
    const html = await fetchHtml(path);
    const slug = path.replace(/\//g, '');
    const tag = tags.find((t) => t.slug === slug);
    if (!tag) { assert(false, `${path}: tag ${slug} not found`); continue; }
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
    assert(!/wc-episodes-header/.test(html), `${path}: no list heading repeating the name`);
    if (tag.feature_image) {
        assert(/<img[^>]*alt="[^"]+"/.test(h1) && !/wc-tag-hero-title/.test(html), `${path}: has art, so the h1 is the art and the name isn't printed as text`);
    } else {
        assert(h1.trim() === tag.name, `${path}: no art, so the h1 is the name as text (got ${JSON.stringify(h1.trim())})`);
    }
}

// The homepage's own Load more is unchanged
const home = await fetchHtml('/');
assert(/data-wc-loadmore[^>]*href="\/latest\/page\/2\/"|href="\/latest\/page\/2\/"[^>]*data-wc-loadmore/.test(home), '/: Load more still targets /latest/page/2/');

report('archive');
