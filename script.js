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
        autoplay: false,
        // Add parent domains for embedding constraints
        parent: ["localhost", "127.0.0.1", "pezliz.github.io", "github.io"]
    });
}

// Mock Discord Events (Schedule)
const discordEvents = [
    {
        title: "Twitch Stream: Modeling Monday",
        date: "Oct 28, 2024",
        time: "18:00 EST",
        description: "Join us for a chill modeling session on Twitch!"
    },
    {
        title: "YouTube Premiere: New Project Reveal",
        date: "Oct 30, 2024",
        time: "12:00 EST",
        description: "Unveiling the secret project I've been working on."
    },
    {
        title: "Community Game Night",
        date: "Nov 01, 2024",
        time: "20:00 EST",
        description: "Playing games with the Discord community."
    }
];

// Fetch and Render YouTube Videos
const videoContainer = document.getElementById('youtube-feed');
const CHANNEL_ID = 'UCI3g9525SNP2r8wedjgMoZg';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
// Using allorigins.win as a CORS proxy to fetch the XML feed
const API_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`;

if (videoContainer) {
    // Show loading state
    videoContainer.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">Loading videos...</p>';

    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (!data.contents) throw new Error('No content found');

            // Parse XML content
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            const entries = xmlDoc.querySelectorAll('entry');

            // Clear loading state
            videoContainer.innerHTML = '';

            if (entries.length === 0) {
                 videoContainer.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">No videos found.</p>';
                 return;
            }

            // Limit to most recent 8 videos
            const recentEntries = Array.from(entries).slice(0, 8);

            recentEntries.forEach(entry => {
                const title = entry.querySelector('title').textContent;
                const link = entry.querySelector('link').getAttribute('href');
                const published = new Date(entry.querySelector('published').textContent).toLocaleDateString();

                // YouTube RSS feed uses media:group/media:thumbnail
                // Use namespace-aware selection for robustness
                const mediaNamespace = 'http://search.yahoo.com/mrss/';
                let mediaGroup = entry.getElementsByTagNameNS(mediaNamespace, 'group')[0];

                // Fallback for browsers/parsers that might not handle NS correctly or flat parse
                if (!mediaGroup) {
                    mediaGroup = entry.getElementsByTagName('media:group')[0];
                }

                let thumbnail = '';
                if (mediaGroup) {
                    let thumbNode = mediaGroup.getElementsByTagNameNS(mediaNamespace, 'thumbnail')[0];
                    if (!thumbNode) {
                         thumbNode = mediaGroup.getElementsByTagName('media:thumbnail')[0];
                    }
                    if (thumbNode) thumbnail = thumbNode.getAttribute('url');
                }

                const card = document.createElement('div');
                card.className = 'video-card';

                const anchor = document.createElement('a');
                anchor.href = link;
                anchor.target = "_blank";

                const img = document.createElement('img');
                img.src = thumbnail;
                img.alt = title;
                img.className = 'video-thumbnail';

                const infoDiv = document.createElement('div');
                infoDiv.className = 'video-info';

                const h3 = document.createElement('h3');
                h3.textContent = title;

                const p = document.createElement('p');
                p.textContent = published;

                infoDiv.appendChild(h3);
                infoDiv.appendChild(p);
                anchor.appendChild(img);
                anchor.appendChild(infoDiv);
                card.appendChild(anchor);

                videoContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching YouTube feed:', error);
            videoContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center;">
                    <p style="color: white; margin-bottom: 10px;">Failed to load videos.</p>
                    <a href="https://www.youtube.com/channel/${CHANNEL_ID}" target="_blank" class="social-btn youtube" style="display: inline-block;">
                        Visit Channel
                    </a>
                </div>
            `;
        });
}

// Render Schedule
const scheduleContainer = document.getElementById('schedule-list');
if (scheduleContainer) {
    discordEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-date">${event.date} @ ${event.time}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-description">${event.description}</div>
        `;
        scheduleContainer.appendChild(card);
    });
}
