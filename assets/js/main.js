(function () {
    const header = document.querySelector('.gh-header.has-background-image');
    const services = document.querySelector('.gh-podcast-service-list');
    if (!header || !services) return;

    header.style.setProperty('--services-height', `${services.offsetHeight}px`);
})();

(function () {
    pagination(true);
})();

/* Show About modal (#124) — upgrades the partials/components/show-about.hbs link to a
   <dialog>. Without JS or <dialog> support the link just navigates to the page. */
(function () {
    document.querySelectorAll('[data-wc-about-open]').forEach(function (trigger) {
        const dialog = document.getElementById(trigger.dataset.wcAboutOpen);
        if (!dialog || typeof dialog.showModal !== 'function') return;

        trigger.addEventListener('click', function (event) {
            // Let modified clicks (new tab/window) through to the page.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            dialog.showModal();
        });

        dialog.querySelector('[data-wc-about-close]').addEventListener('click', function () {
            dialog.close();
        });

        // A backdrop click lands on the <dialog> element itself, not its inner box.
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog) dialog.close();
        });

        // Browsers restore focus on close inconsistently; do it explicitly.
        dialog.addEventListener('close', function () {
            trigger.focus();
        });
    });
})();
