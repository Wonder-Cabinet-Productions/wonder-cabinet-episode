// #132: copyright alone between the cabinet legs; nav and social links below the cabinet.
// Run from the theme root: node tests/footer.check.mjs
import fs from 'node:fs';
import { fetchHtml, contentApi, assert, report } from './lib/site.mjs';

const lum = (await contentApi('posts', { filter: 'tag:luminous', limit: 1, fields: 'slug' })).posts[0];
const pages = ['/', `/luminous/${lum.slug}/`];

for (const path of pages) {
    const html = await fetchHtml(path);
    const footer = html.slice(html.indexOf('<footer class="wc-footer'));
    const oStart = footer.indexOf('wc-footer-overlay');
    const overlay = footer.slice(oStart, footer.indexOf('</div>', footer.indexOf('wc-footer-copyright', oStart)));
    assert(oStart > -1, `${path}: footer overlay present`);
    assert(!overlay.includes('wc-footer-nav'), `${path}: nav is not inside the cabinet overlay`);
    assert(overlay.includes('wc-footer-copyright'), `${path}: copyright stays in the overlay`);
    const iIll = footer.indexOf('wc-footer-illustration');
    const iNav = footer.indexOf('wc-footer-nav');
    const iSoc = footer.indexOf('wc-social-links');
    assert(iIll < iNav && iNav < iSoc, `${path}: order is illustration, nav, social`);
}

// Review Focus 5: no secondary nav items renders no <nav>
const hbs = fs.readFileSync('partials/components/footer.hbs', 'utf8');
assert(/\{\{#if @site\.secondary_navigation\}\}\s*<nav class="wc-footer-nav/.test(hbs), 'empty secondary nav renders no <nav>');

report('footer');
