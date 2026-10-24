// #100 "Load more episodes" on the homepage. Run on a fresh load of /:
//   agent-browser open <base>/ && agent-browser eval "$(cat tests/loadmore.browser.js)"
// The failure fallback (Review Focus 2) navigates away, so it's a separate step; see the
// plan, Task 5. Returns {ok, failures, ...}.
(async () => {
    const failures = [];
    const expect = (cond, msg) => { if (!cond) failures.push(msg); };
    const ids = () => [...document.querySelectorAll('[data-wc-river] [data-post-id]')].map((e) => e.dataset.postId);
    const btn = document.querySelector('[data-wc-loadmore]');
    if (!btn) return JSON.stringify({ ok: false, failures: ['no [data-wc-loadmore] on the page'] });
    expect(btn.getAttribute('href') === '/latest/page/2/', 'no-JS fallback links to /latest/page/2/');

    const before = ids();
    let fetches = 0;
    const realFetch = window.fetch;
    window.fetch = (...a) => { fetches++; return realFetch(...a); };
    btn.click(); btn.click();                                   // double activation
    for (let i = 0; i < 50 && btn.hasAttribute('aria-busy'); i++) await new Promise((r) => setTimeout(r, 100));
    await new Promise((r) => setTimeout(r, 200));
    window.fetch = realFetch;

    const after = ids();
    const added = after.length - before.length;
    expect(fetches === 1, `double activation fetched ${fetches} times, expected 1`);
    expect(new Set(after).size === after.length, 'no post appears twice after loading (#35)');
    expect(added > 0, 'cards were appended');
    const firstNew = document.querySelector(`[data-wc-river] [data-post-id="${after[before.length]}"] a`);
    expect(added === 0 || document.activeElement === firstNew, 'focus moved to the first new card');
    const said = document.querySelector('[data-wc-loadmore-status]').textContent;
    expect(new RegExp(`\\b${added}\\b`).test(said), `announcement "${said}" gives the count ${added}`);
    expect(btn.getAttribute('href') === '/latest/page/3/' || btn.hidden, 'button advances to page 3, or hides at the end');
    expect(location.pathname === '/', 'URL not rewritten');
    expect(!btn.hasAttribute('aria-busy'), 'aria-busy cleared');

    // A mouse click (detail 1) loads the next batch but leaves focus alone: no stray focus ring
    if (!btn.hidden) {
        const focused = document.activeElement;
        const count = ids().length;
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
        for (let i = 0; i < 50 && btn.hasAttribute('aria-busy'); i++) await new Promise((r) => setTimeout(r, 100));
        await new Promise((r) => setTimeout(r, 200));
        expect(ids().length > count, 'mouse click appended cards');
        expect(document.activeElement === focused, 'mouse click left focus where it was');
    }
    return JSON.stringify({ ok: failures.length === 0, added, said, next: btn.hidden ? 'hidden' : btn.getAttribute('href'), failures });
})();
