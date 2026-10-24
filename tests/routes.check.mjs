// #100: the /latest/ and /episodes/ channels (docs/routes.yaml), checked against the Content
// API. Needs the routes uploaded to the site under test. Run: node tests/routes.check.mjs
import fs from 'node:fs';
import { BASE, fetchHtml, contentApi, assert, report } from './lib/site.mjs';

const RIVER_SIZE = 8;     // /latest/ `limit` in docs/routes.yaml
const PER_PAGE = 5;       // posts_per_page in package.json (/episodes/ sets no limit)
const ids = (html) => [...html.slice(html.indexOf('gh-feed')).matchAll(/<article[^>]*data-post-id="([^"]+)"/g)].map((m) => m[1]);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const river = (await contentApi('posts', { filter: 'tag:-newsletter', limit: 'all', fields: 'id' })).posts.map((p) => p.id);
assert(same(ids(await fetchHtml('/latest/')), river.slice(0, RIVER_SIZE)), '/latest/ lists the newest 8 non-newsletter posts');
if (river.length > RIVER_SIZE) {
    assert(same(ids(await fetchHtml('/latest/page/2/')), river.slice(RIVER_SIZE, RIVER_SIZE * 2)), '/latest/page/2/ lists the next 8');
}

const wc = (await contentApi('posts', { filter: 'tag:wonder-cabinet+tag:-newsletter', limit: PER_PAGE, fields: 'id' })).posts.map((p) => p.id);
assert(same(ids(await fetchHtml('/episodes/')), wc), '/episodes/ lists Wonder Cabinet posts only');

// Channels must not take over post URLs (spec §4.6)
const lum = (await contentApi('posts', { filter: 'tag:luminous', limit: 1, fields: 'slug' })).posts[0];
const lumHtml = await fetchHtml(`/luminous/${lum.slug}/`);
assert(lumHtml.includes(`rel="canonical" href="${BASE}/luminous/${lum.slug}/"`), 'Luminous post URLs unchanged');
const wcPost = (await contentApi('posts', { filter: 'tag:wonder-cabinet+tag:-newsletter', limit: 1, fields: 'slug' })).posts[0];
assert((await fetchHtml(`/${wcPost.slug}/`)).includes(`rel="canonical" href="${BASE}/${wcPost.slug}/"`), 'Wonder Cabinet post URLs unchanged');

const routes = fs.readFileSync('docs/routes.yaml', 'utf8');
assert(/\/latest\/:\s*\n\s*controller: channel[\s\S]*?limit: 8/.test(routes), 'docs/routes.yaml: /latest/ is a channel with limit 8');
assert(!/player-|wavesurfer-styles/.test(routes), 'docs/routes.yaml: no dead player routes');

report('routes');
