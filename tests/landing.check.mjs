// #125 slice 1: tag pages become mini-series landings when they have landing content.
// Spec: docs/superpowers/specs/2026-11-21-tag-landing-design.md. Server-rendered markup only.
// Needs dev seeded (IoK tag with art + description + Show About page; a plain `test-plain` tag).
// Run: node tests/landing.check.mjs   (WC_BASE to point elsewhere)
import { fetchHtml, assert, report } from './lib/site.mjs';

const platforms = (html) => [...html.matchAll(/data-wc-platform="([a-z-]+)"/g)].map((m) => m[1]);
const bodyClass = (html) => (html.match(/<body class="([^"]*)"/) || [])[1] || '';

// Landing: a tag with art and a description
{
    const path = '/island-of-knowledge/';
    const html = await fetchHtml(path);
    assert(/class="wc-brand-band"/.test(html), `${path}: wrapped in the brand band`);
    assert(/\bwc-landing\b/.test(bodyClass(html)), `${path}: body carries wc-landing (nav bleed)`);
    assert(!/wc-tag-hero-bg/.test(html), `${path}: no second galaxy inside the band`);
    assert(/<section class="wc-podcast-services[\s\S]*?wc-podcast-services-desc/.test(html), `${path}: description sits in the services row`);
    assert(!/wc-tag-hero-description/.test(html), `${path}: description not repeated in the hero`);
    assert(platforms(html).join() === 'apple,spotify,youtube', `${path}: parent listen links, platform-marked (got ${platforms(html)})`);
    assert(/data-wc-about-open=/.test(html), `${path}: About button (Show About page tagged island-of-knowledge)`);
}

// Plain: a tag with no art, description or About page stays a plain archive
{
    const path = '/tag/test-plain/';
    const html = await fetchHtml(path);
    assert(!/wc-brand-band/.test(html), `${path}: no brand band`);
    assert(!/\bwc-landing\b/.test(bodyClass(html)), `${path}: no wc-landing class`);
    assert(!/wc-podcast-services/.test(html), `${path}: no services row`);
    assert(/<h1 class="wc-tag-hero-title">\s*Test Plain\s*<\/h1>/.test(html), `${path}: name as the text title`);
}

// Show landings keep their rows, now from the shared partials
for (const path of ['/', '/luminous/']) {
    const html = await fetchHtml(path);
    // Which links show depends on that show's settings (dev Luminous has no YouTube link);
    // every one shown must carry its platform marker.
    const links = (html.match(/class="wc-podcast-service"/g) || []).length;
    const marked = platforms(html);
    assert(links > 0 && marked.length === links, `${path}: all ${links} listen links platform-marked (got ${marked})`);
    assert(/data-wc-about-open=/.test(html), `${path}: About button still there`);
}

report('landing');
