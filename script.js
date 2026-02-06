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
