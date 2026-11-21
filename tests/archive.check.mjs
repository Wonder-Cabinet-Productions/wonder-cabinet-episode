// #23: list pages use the homepage's click-to-load "Load more" instead of the old
// prev/next pager. Server-rendered markup only; tests/loadmore.browser.js covers the click.
// Run: node tests/archive.check.mjs   (WC_BASE to point elsewhere)
import { fetchHtml, assert, report } from './lib/site.mjs';

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

// The homepage's own Load more is unchanged
const home = await fetchHtml('/');
assert(/data-wc-loadmore[^>]*href="\/latest\/page\/2\/"|href="\/latest\/page\/2\/"[^>]*data-wc-loadmore/.test(home), '/: Load more still targets /latest/page/2/');

report('archive');
