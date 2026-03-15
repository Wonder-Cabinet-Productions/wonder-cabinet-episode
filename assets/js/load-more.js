(function () {
    'use strict';

    var btn = document.getElementById('wc-load-more-btn');
    if (!btn) return;

    var feed = document.querySelector('.gh-list-feed');
    if (!feed) return;

    // Read API key from Ghost's sodo-search script tag
    var searchScript = document.querySelector('script[data-sodo-search]');
    var apiKey = searchScript ? searchScript.getAttribute('data-key') : null;
    if (!apiKey) return;

    // Read site URL from Ghost's portal script or fallback to window.location.origin
    var portalScript = document.querySelector('script[data-ghost]');
    var siteUrl = portalScript ? portalScript.getAttribute('data-ghost') : window.location.origin;
    // Strip trailing slash
    siteUrl = siteUrl.replace(/\/$/, '');

    var currentPage = parseInt(btn.getAttribute('data-page'), 10) || 2;
    var filter = btn.getAttribute('data-filter') || 'tag:-newsletter';
    var pageSize = 5;
    var loading = false;

    // Read the play icon path from an existing card (includes cache-bust hash)
    var existingIcon = document.querySelector('.wc-episode-card-btn-icon');
    var playIconSrc = existingIcon ? existingIcon.getAttribute('src') : '/assets/images/play-white.svg';

    function formatDate(dateString) {
        var d = new Date(dateString);
        var day = String(d.getDate()).padStart(2, '0');
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var month = months[d.getMonth()];
        var year = d.getFullYear();
        return day + ' ' + month + ' ' + year;
    }

    function hasTag(post, tagSlug) {
        if (!post.tags) return false;
        for (var i = 0; i < post.tags.length; i++) {
            if (post.tags[i].slug === tagSlug) return true;
        }
        return false;
    }

    function imageSize(url, width) {
        // Convert Ghost image URL to sized variant
        // e.g. /content/images/2024/01/photo.jpg → /content/images/size/w300/2024/01/photo.jpg
        return url.replace(/\/content\/images\//, '/content/images/size/w' + width + '/');
    }

    function renderCard(post) {
        var isNewsletter = hasTag(post, 'newsletter');
        var classes = 'gh-list-item wc-episode-card wc-episode-card--new';
        if (post.featured) classes += ' featured';

        var html = '<article class="' + classes + '">';
        html += '<a class="gh-list-item-inner wc-episode-card-inner" href="' + post.url + '">';

        // Featured badge
        if (post.featured) {
            html += '<span class="wc-featured-badge"><span class="sr-only">Featured episode: </span>Featured</span>';
        }

        // Feature image
        if (post.feature_image) {
            var alt = post.feature_image_alt || post.title;
            html += '<figure class="gh-list-item-image wc-episode-card-image">';
            html += '<img srcset="' +
                imageSize(post.feature_image, 300) + ' 300w, ' +
                imageSize(post.feature_image, 720) + ' 720w, ' +
                imageSize(post.feature_image, 960) + ' 960w" ' +
                'sizes="(max-width: 767px) 100vw, 229px" ' +
                'src="' + imageSize(post.feature_image, 720) + '" ' +
                'alt="' + alt.replace(/"/g, '&quot;') + '">';
            html += '</figure>';
        }

        // Content
        html += '<div class="gh-list-item-content wc-episode-card-content">';
        html += '<span class="gh-list-item-published-at wc-episode-card-date">' + formatDate(post.published_at) + '</span>';
        html += '<h3 class="gh-list-item-title wc-episode-card-title">' + post.title + '</h3>';

        var excerpt = post.custom_excerpt || post.excerpt || '';
        if (excerpt) {
            html += '<p class="gh-list-item-excerpt wc-episode-card-excerpt">' + excerpt + '</p>';
        }

        html += '<span class="wc-episode-card-btn">';
        if (isNewsletter) {
            html += 'Read';
        } else {
            html += '<img src="' + playIconSrc + '" alt="" class="wc-episode-card-btn-icon"> View Episode';
        }
        html += '</span>';

        html += '</div></a></article>';
        return html;
    }

    function fetchEpisodes(page) {
        var url = siteUrl + '/ghost/api/content/posts/' +
            '?key=' + apiKey +
            '&filter=' + encodeURIComponent(filter) +
            '&fields=id,title,slug,feature_image,feature_image_alt,published_at,custom_excerpt,excerpt,featured,url' +
            '&include=tags' +
            '&limit=' + pageSize +
            '&page=' + page;

        return fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('API error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                return {
                    posts: data.posts || [],
                    pagination: data.meta && data.meta.pagination ? data.meta.pagination : {}
                };
            });
    }

    btn.addEventListener('click', function () {
        if (loading) return;
        loading = true;
        btn.disabled = true;
        btn.textContent = 'Loading\u2026';

        fetchEpisodes(currentPage)
            .then(function (result) {
                // Append cards
                var fragment = document.createDocumentFragment();
                var temp = document.createElement('div');

                result.posts.forEach(function (post) {
                    temp.innerHTML = renderCard(post);
                    var card = temp.firstChild;
                    fragment.appendChild(card);
                });

                feed.appendChild(fragment);

                // Trigger fade-in animation
                var newCards = feed.querySelectorAll('.wc-episode-card--new');
                // Force reflow before adding loaded class
                void feed.offsetHeight;
                for (var i = 0; i < newCards.length; i++) {
                    newCards[i].classList.remove('wc-episode-card--new');
                    newCards[i].classList.add('wc-episode-card--loaded');
                }

                currentPage++;

                // Hide button if no more pages
                if (!result.pagination.next) {
                    btn.parentElement.parentElement.style.display = 'none';
                } else {
                    btn.disabled = false;
                    btn.innerHTML = 'More Episodes &rarr;';
                }

                loading = false;
            })
            .catch(function () {
                btn.textContent = 'Error — try again';
                btn.disabled = false;
                loading = false;
                setTimeout(function () {
                    btn.innerHTML = 'More Episodes &rarr;';
                }, 3000);
            });
    });
})();
