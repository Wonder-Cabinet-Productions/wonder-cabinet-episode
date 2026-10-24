// #100 layout: a long series tag name (renamed in Admin) must wrap, not overflow.
// Run: agent-browser open <url>/ && agent-browser eval "$(cat tests/river.browser.js)" at 320 and 1440.
(() => {
    const failures = [];
    const long = 'Island of Knowledge: A Very Long Series Name';
    const targets = [...document.querySelectorAll('.wc-highlight-badge')];
    if (!targets.length) return JSON.stringify({ ok: false, failures: ['no badge on the page'] });
    targets.forEach((el) => { el.textContent = long; });
    if (document.documentElement.scrollWidth > innerWidth) failures.push('horizontal scroll');
    targets.forEach((el) => {
        const card = el.closest('.wc-episode-card').getBoundingClientRect();
        const r = el.getBoundingClientRect();
        if (r.right > card.right + 0.5) failures.push(`${el.className} overflows its card by ${Math.round(r.right - card.right)}px`);
    });
    return JSON.stringify({ ok: failures.length === 0, width: innerWidth, checked: targets.length, failures });
})();
