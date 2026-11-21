// Header nav must never run under the centred logo (the Island of Knowledge nav item hit it
// between 768 and ~950px). At any width, either the desktop links clear the logo by the
// Figma link gap on both sides without wrapping, or the header has collapsed to the burger.
// It also adds a long fake 4th link to prove the fit is measured, not a fixed breakpoint.
// Run: agent-browser open <url>/ && agent-browser set viewport <w> 800 && agent-browser eval "$(cat tests/nav.browser.js)"
(async () => {
    const GAP = 28;
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const head = document.getElementById('gh-head');
    const left = head.querySelector('.wc-head-nav--left');
    const right = head.querySelector('.wc-head-nav--right');
    const logo = head.querySelector('.wc-head-logo');
    const burger = head.querySelector('.wc-burger');
    const shown = (el) => getComputedStyle(el).display !== 'none';
    const check = (label) => {
        const fails = [];
        if (!shown(left)) {
            if (!shown(burger)) fails.push(`${label}: links hidden but no burger`);
            // The Luminous landing hides both marks on purpose (screen.css, "Luminous nav logo").
            const markShown = [...logo.querySelectorAll('img')].some(shown);
            const l = logo.getBoundingClientRect();
            if (markShown && l.height < 40) fails.push(`${label}: collapsed logo shrank to ${Math.round(l.height)}px`);
            return { state: 'burger', fails };
        }
        if (shown(burger)) fails.push(`${label}: links and burger both visible`);
        const l = logo.getBoundingClientRect();
        const links = [...left.children].filter((e) => e.getClientRects().length);
        const leftEnd = Math.max(...links.map((e) => e.getBoundingClientRect().right));
        const rightStart = Math.min(...[...right.children].filter((e) => e.getClientRects().length).map((e) => e.getBoundingClientRect().left));
        if (l.left - leftEnd < GAP) fails.push(`${label}: left links ${Math.round(l.left - leftEnd)}px from logo`);
        if (rightStart - l.right < GAP) fails.push(`${label}: right actions ${Math.round(rightStart - l.right)}px from logo`);
        links.forEach((a) => { if (a.getClientRects().length > 1 || a.getBoundingClientRect().height > 40) fails.push(`${label}: "${a.textContent.trim()}" wraps`); });
        return { state: 'links', fails };
    };
    await frame();
    const real = check('real nav');
    const extra = left.lastElementChild.cloneNode(true);
    extra.textContent = 'A Fourth Rather Long Item';
    left.appendChild(extra);
    window.dispatchEvent(new Event('resize'));
    await frame();
    const four = check('with 4th item');
    extra.remove();
    window.dispatchEvent(new Event('resize'));
    await frame();
    const failures = [...real.fails, ...four.fails];
    return JSON.stringify({ ok: failures.length === 0, width: innerWidth, real: real.state, fourItems: four.state, failures });
})();
