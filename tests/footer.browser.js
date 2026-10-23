// #132 layout check. Run: agent-browser open <url> && agent-browser eval "$(cat tests/footer.browser.js)"
// at 320, 390 and 1440 wide, on / and a Luminous page. Returns {ok, failures}.
(() => {
    const nav = document.querySelector('.wc-footer-nav');
    const cabinet = document.querySelector('.wc-footer-illustration');
    const failures = [];
    if (!nav) return JSON.stringify({ ok: false, failures: ['no .wc-footer-nav'] });
    // Luminous hides the cabinet; centre on the footer column instead.
    const axis = cabinet && cabinet.getBoundingClientRect().width ? cabinet : document.querySelector('.wc-footer-inner');
    const check = (label) => {
        const n = nav.getBoundingClientRect();
        const c = axis.getBoundingClientRect();
        if (Math.abs((n.left + n.width / 2) - (c.left + c.width / 2)) > 1) failures.push(`${label}: nav off the centre line`);
        nav.querySelectorAll('a').forEach((a) => {
            const r = a.getBoundingClientRect();
            if (r.width < 24 || r.height < 24) failures.push(`${label}: target under 24px: ${a.textContent.trim()}`);
            if (parseFloat(getComputedStyle(a).fontSize) < 14) failures.push(`${label}: type under 14px`);
        });
        if (document.documentElement.scrollWidth > innerWidth) failures.push(`${label}: horizontal scroll`);
    };
    check('as served');
    const first = nav.querySelector('a');
    const original = first.textContent;
    first.textContent = 'About Wonder Cabinet';
    check('long label');
    first.textContent = original;
    return JSON.stringify({ ok: failures.length === 0, width: innerWidth, failures });
})();
