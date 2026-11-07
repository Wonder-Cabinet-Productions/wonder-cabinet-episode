(function () {
    const header = document.querySelector('.gh-header.has-background-image');
    const services = document.querySelector('.gh-podcast-service-list');
    if (!header || !services) return;

    header.style.setProperty('--services-height', `${services.offsetHeight}px`);
})();

/* Show About modal (#124) — upgrades links to a Show About page into openers for that
   page's <dialog>: the trigger from partials/components/show-about.hbs, plus any other
   link to the same page on this page (nav or footer "About"). A link to a Show About
   page whose dialog isn't on this page just navigates, and without JS or <dialog>
   support every link just navigates to the page.
   Kept above pagination(true): that call throws on a single-page list (no element for
   its IntersectionObserver), and anything after it in this bundle never runs. */
(function () {
    document.querySelectorAll('[data-wc-about-open]').forEach(function (trigger) {
        const dialog = document.getElementById(trigger.dataset.wcAboutOpen);
        if (!dialog || typeof dialog.showModal !== 'function') return;

        const title = dialog.querySelector('.wc-about-title');
        let opener = trigger;

        function open(event) {
            // Let modified clicks (new tab/window) through to the page.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            opener = event.currentTarget;
            dialog.showModal();
            dialog.scrollTop = 0; // a reopened dialog keeps its old scroll position
            // showModal() focuses the first focusable element (Close); start on the title.
            if (title) title.focus();
        }

        // Every same-origin link to this dialog's page, compared by path.
        const pagePath = new URL(trigger.href).pathname;
        document.querySelectorAll('a[href]').forEach(function (link) {
            const url = new URL(link.href, location.href);
            if (url.origin !== location.origin || url.pathname !== pagePath) return;
            if (link !== trigger) link.setAttribute('aria-haspopup', 'dialog');
            link.addEventListener('click', open);
        });

        dialog.querySelector('[data-wc-about-close]').addEventListener('click', function () {
            dialog.close();
        });

        // A backdrop click lands on the <dialog> element itself, not its inner box. Only
        // close when the press also started there, so a text selection dragged out of
        // the panel and released over the backdrop doesn't close it.
        let pressedOnBackdrop = false;
        dialog.addEventListener('mousedown', function (event) {
            pressedOnBackdrop = event.target === dialog;
        });
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog && pressedOnBackdrop) dialog.close();
        });

        // Browsers restore focus on close inconsistently; return it to whichever link
        // opened the dialog.
        dialog.addEventListener('close', function () {
            opener.focus();
        });
    });
})();

/* External links open in a new tab. Ghost's editor has no per-link target, so links
   in post, page and newsletter content (including ones added by hand later) can't carry
   one; this sets it at load for every http(s) link off this site. The production domain
   counts as internal everywhere, so the dev preview treats links to it like the live site
   does. Kept above pagination(true) for the same reason as the About modal. */
(function () {
    const INTERNAL_HOSTS = [location.hostname, 'wondercabinetproductions.com'];
    const bare = function (host) { return host.replace(/^www\./, ''); };
    const internal = INTERNAL_HOSTS.map(bare);

    document.querySelectorAll('a[href]').forEach(function (link) {
        let url;
        try {
            url = new URL(link.getAttribute('href'), location.href);
        } catch (e) {
            return;
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
        if (internal.indexOf(bare(url.hostname)) !== -1) return;

        link.target = '_blank';
        const rel = link.rel.split(/\s+/).filter(Boolean);
        if (rel.indexOf('noopener') === -1) rel.push('noopener');
        link.rel = rel.join(' ');
    });
})();

(function () {
    pagination(true);
})();
