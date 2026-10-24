// Shared helpers for the staging checks in tests/. Dependency-free (Node 18+ global fetch).
// Point at another site with WC_BASE, e.g. WC_BASE=https://wondercabinetproductions.com
export const BASE = (process.env.WC_BASE || 'https://wondercabinet.riechers.co').replace(/\/$/, '');

const failures = [];
let passes = 0;

export async function fetchHtml(path) {
    const url = new URL(path, BASE);
    url.searchParams.set('nocache', Date.now()); // Ghost's ?v= asset hash and caches hide rebuilds
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    return res.text();
}

// The Content API key is public: Ghost embeds it in every page for search.
let key;
export async function contentApi(resource, params = {}) {
    if (!key) {
        const m = (await fetchHtml('/')).match(/data-key="([0-9a-f]+)"/);
        if (!m) throw new Error('no Content API key (data-key) on the homepage');
        key = m[1];
    }
    const url = new URL(`/ghost/api/content/${resource}/`, BASE);
    url.searchParams.set('key', key);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} for Content API ${resource}`);
    return res.json();
}

export function assert(cond, msg) {
    if (cond) passes++;
    else failures.push(msg);
}

export function report(name) {
    for (const f of failures) console.log(`FAIL  ${f}`);
    console.log(`${name}: ${passes} passed, ${failures.length} failed (${BASE})`);
    process.exitCode = failures.length ? 1 : 0;
}
