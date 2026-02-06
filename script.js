// Affiliate vendor logos (Clearbit Logo API)
(function () {
    var cards = document.querySelectorAll('.affiliate-card[data-logo-domain]');
    var CLEARBIT = 'https://logo.clearbit.com/';
    for (var i = 0; i < cards.length; i++) {
        (function (card) {
            var domain = card.getAttribute('data-logo-domain');
            var img = card.querySelector('.affiliate-logo');
            var wrap = card.querySelector('.affiliate-logo-wrap');
            if (!domain || !img) return;
            img.onload = function () {
                if (wrap) wrap.classList.add('affiliate-logo-wrap--loaded');
            };
            img.onerror = function () {
                if (wrap) wrap.style.display = 'none';
            };
            img.src = CLEARBIT + domain;
            if (img.complete && wrap) wrap.classList.add('affiliate-logo-wrap--loaded');
        })(cards[i]);
    }
})();

// Twitch Embed
const twitchChannel = "pezliz"; // Placeholder channel name

// Initialize Twitch Embed
// Note: This requires the Twitch Embed JS script to be loaded in HTML
if (document.getElementById('twitch-embed')) {
    new Twitch.Embed("twitch-embed", {
        width: "100%",
        height: "100%", // Controlled by CSS
        channel: twitchChannel,
        layout: "video",
        autoplay: false
    });
}

// PezLiz YouTube channel ID (from youtube.com/@pezliz)
const YOUTUBE_CHANNEL_ID = 'UCI3g9525SNP2r8wedjgMoZg';
const YOUTUBE_RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=' + YOUTUBE_CHANNEL_ID)}`;

function formatVideoDate(pubDateStr) {
    if (!pubDateStr) return '';
    const date = new Date(pubDateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    if (diffDays < 30) return Math.floor(diffDays / 7) + ' week(s) ago';
    return date.toLocaleDateString();
}

// Fetch and render YouTube videos
const videoContainer = document.getElementById('youtube-feed');
if (videoContainer) {
    videoContainer.innerHTML = '<p class="loading">Loading latest videos…</p>';
    fetch(YOUTUBE_RSS_URL)
        .then(response => response.json())
        .then(data => {
            videoContainer.innerHTML = '';
            if (data.status !== 'ok' || !data.items || !data.items.length) {
                videoContainer.innerHTML = '<p class="loading">No videos found.</p>';
                return;
            }
            data.items.slice(0, 6).forEach(video => {
                const title = video.title || 'Video';
                const link = video.link || '#';
                const thumbnail = video.thumbnail || video.enclosure?.thumbnail || 'https://placehold.co/600x400/333/fff?text=Video';
                const date = formatVideoDate(video.pubDate);
                const card = document.createElement('div');
                card.className = 'video-card';
                card.innerHTML = `
                    <a href="${link}" target="_blank" rel="noopener">
                        <img src="${thumbnail}" alt="${title.replace(/"/g, '&quot;')}" class="video-thumbnail" loading="lazy">
                        <div class="video-info">
                            <h3>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
                            <p>${date}</p>
                        </div>
                    </a>
                `;
                videoContainer.appendChild(card);
            });
        })
        .catch(() => {
            videoContainer.innerHTML = '<p class="loading">Could not load videos. <a href="https://www.youtube.com/@pezliz" target="_blank" rel="noopener">Watch on YouTube</a></p>';
        });
}

// Merch carousel: fetch random products and fade/slide carousel with prev/next
(function () {
    const MERCH_BASE = 'https://pezliz-shop.fourthwall.com';
    const MERCH_JSON = MERCH_BASE + '/collections/all.json';
    const CAROUSEL_SIZE = 8;
    const GAP = 20;

    const viewport = document.querySelector('.merch-carousel-viewport');
    const carousel = document.getElementById('merch-carousel');
    const prevBtn = document.querySelector('.merch-carousel-prev');
    const nextBtn = document.querySelector('.merch-carousel-next');
    const dotsEl = document.getElementById('merch-dots');

    if (!carousel || !viewport) return;

    let currentPage = 0;
    let maxPage = 0;

    function decodeTitle(s) {
        if (!s) return '';
        return s.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function updateCarouselPosition() {
        const cards = carousel.querySelectorAll('.merch-card');
        if (cards.length === 0) return;
        const vw = viewport.getBoundingClientRect().width;
        const cardWidth = cards[0].getBoundingClientRect().width;
        const step = cardWidth + GAP;
        const visibleCount = Math.max(1, Math.floor((vw + GAP) / step));
        maxPage = Math.max(0, Math.ceil(cards.length / visibleCount) - 1);
        currentPage = Math.min(currentPage, maxPage);
        const offset = -currentPage * visibleCount * step;
        carousel.style.transform = 'translate3d(' + offset + 'px, 0, 0)';
        if (prevBtn) prevBtn.style.visibility = maxPage <= 0 ? 'hidden' : 'visible';
        if (nextBtn) nextBtn.style.visibility = maxPage <= 0 ? 'hidden' : 'visible';
        if (dotsEl) dotsEl.style.display = maxPage <= 0 ? 'none' : 'flex';
        updateDots();
    }

    function updateDots() {
        if (!dotsEl || maxPage <= 0) return;
        dotsEl.innerHTML = '';
        for (let i = 0; i <= maxPage; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'merch-carousel-dot' + (i === currentPage ? ' active' : '');
            dot.setAttribute('aria-label', 'Page ' + (i + 1));
            dot.addEventListener('click', function () { goToPage(i); });
            dotsEl.appendChild(dot);
        }
    }

    function goToPage(page) {
        currentPage = Math.max(0, Math.min(page, maxPage));
        updateCarouselPosition();
    }

    function initCarouselControls() {
        if (prevBtn) prevBtn.addEventListener('click', function () { goToPage(currentPage - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goToPage(currentPage + 1); });
        window.addEventListener('resize', function () { updateCarouselPosition(); });
    }

    fetch(MERCH_JSON)
        .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error(res.status)); })
        .then(function (data) {
            const products = data.products || [];
            const available = products.filter(function (p) { return p.available !== false && p.image && p.title; });
            const picked = shuffle(available).slice(0, CAROUSEL_SIZE);

            carousel.innerHTML = '';
            carousel.classList.remove('merch-carousel--loading');

            if (picked.length === 0) {
                carousel.innerHTML = '<p class="loading">No products right now. <a href="' + MERCH_BASE + '/collections/all" target="_blank" rel="noopener" class="merch-link">Visit the shop</a></p>';
                return;
            }

            picked.forEach(function (p) {
                const href = (p.url && p.url.startsWith('http')) ? p.url : (MERCH_BASE + (p.url || '/collections/all'));
                const title = decodeTitle(p.title);
                const price = (p.price != null) ? ('$' + String(p.price)) : '';
                const card = document.createElement('a');
                card.href = href;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'merch-card';
                card.innerHTML =
                    '<img class="merch-card-img" src="' + (p.image || '').replace(/"/g, '&quot;') + '" alt="" loading="lazy">' +
                    '<span class="merch-card-title">' + title.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>' +
                    (price ? '<span class="merch-card-price">' + price.replace(/</g, '&lt;') + '</span>' : '');
                carousel.appendChild(card);
            });

            initCarouselControls();
            requestAnimationFrame(function () { updateCarouselPosition(); });
        })
        .catch(function () {
            carousel.innerHTML = '<p class="loading">Could not load merch. <a href="' + MERCH_BASE + '/collections/all" target="_blank" rel="noopener" class="merch-link">View shop</a></p>';
            carousel.classList.remove('merch-carousel--loading');
        });
})();

// Cursor/touch-reactive purple fog
(function () {
    const fogEl = document.querySelector('.cursor-fog');
    if (!fogEl) return;

    function setFogPosition(x, y) {
        fogEl.style.setProperty('--fog-x', x + 'px');
        fogEl.style.setProperty('--fog-y', y + 'px');
    }

    function onMove(e) {
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        setFogPosition(x, y);
    }

    // Initialize to center until first move
    setFogPosition(window.innerWidth / 2, window.innerHeight / 2);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchstart', onMove, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
})();
