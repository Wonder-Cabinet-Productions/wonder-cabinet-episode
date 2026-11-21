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
   support every link just navigates to the page. */
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

/* "Load more episodes" (#100 homepage, #23 every paginated list): upgrades the link to the
   feed's next page (/latest/ for the homepage river, the list's own /page/N/ elsewhere) into
   an in-place load, so the footer and newsletter signup stay reachable. Inserts only posts
   not already on the page (a pinned slot post can reappear in a later batch, #35), moves
   focus to the first new card, and announces the count. On any failure it follows the link
   instead, which is also all that happens without JS. */
(function () {
    const button = document.querySelector('[data-wc-loadmore]');
    const river = document.querySelector('[data-wc-river]');
    if (!button || !river) return;
    const status = document.querySelector('[data-wc-loadmore-status]');
    let loading = false;

    function announce(text) {
        if (!status) return;
        status.textContent = ''; // so a repeated message is announced again
        setTimeout(function () { status.textContent = text; }, 50);
    }

    button.addEventListener('click', async function (event) {
        // Let modified clicks (new tab/window) through to the page.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (loading) return;
        loading = true;
        button.setAttribute('aria-busy', 'true');
        const href = button.href;
        const hadFocus = document.activeElement === button;

        try {
            const res = await fetch(href);
            if (!res.ok) throw new Error(`${res.status} for ${href}`);
            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');

            const onPage = new Set();
            document.querySelectorAll('[data-post-id]').forEach(function (el) {
                onPage.add(el.dataset.postId);
            });
            const added = [];
            doc.querySelectorAll('.gh-feed > article[data-post-id]').forEach(function (card) {
                if (onPage.has(card.dataset.postId)) return;
                added.push(river.appendChild(document.importNode(card, true)));
            });

            const next = doc.querySelector('link[rel=next]');
            if (next) {
                button.setAttribute('href', new URL(next.getAttribute('href'), href).pathname);
            } else {
                button.hidden = true;
            }

            // Move focus only for keyboard activation (Enter/Space give detail 0). After a
            // mouse or touch click it would just draw a focus ring; the announcement below
            // still reaches screen readers either way.
            const viaKeyboard = event.detail === 0;
            const firstLink = viaKeyboard && added.length && added[0].querySelector('a[href]');
            if (firstLink) {
                firstLink.focus();
            } else if (button.hidden && (viaKeyboard || hadFocus)) {
                // The button is gone: don't leave focus on a hidden element. Go to the
                // link beside it (homepage archive, or "Newer episodes"), else the first new card.
                const sibling = button.parentElement.querySelector('a[href]:not([data-wc-loadmore])');
                const fallback = sibling || (added.length && added[0].querySelector('a[href]'));
                if (fallback) fallback.focus();
            }
            announce(added.length ? `${added.length} more ${added.length === 1 ? 'episode' : 'episodes'} loaded` : 'No more episodes');
        } catch (e) {
            location.href = href;
        } finally {
            loading = false;
            button.removeAttribute('aria-busy');
        }
    });
})();

/* External links open in a new tab. Ghost's editor has no per-link target, so links
   in post, page and newsletter content (including ones added by hand later) can't carry
   one; this sets it at load for every http(s) link off this site. The production domain
   counts as internal everywhere, so the dev preview treats links to it like the live site
   does. */
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
