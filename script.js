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

// Mock YouTube Data
const youtubeVideos = [
    {
        title: "3D Printing a Giant Robot!",
        thumbnail: "https://placehold.co/600x400/fa00fa/ffffff?text=Giant+Robot", // Placeholder image
        link: "https://www.youtube.com/watch?v=placeholder1",
        date: "2 days ago"
    },
    {
        title: "PezLiz Live: Modeling Tutorial",
        thumbnail: "https://placehold.co/600x400/0000f8/ffffff?text=Modeling+Tutorial",
        link: "https://www.youtube.com/watch?v=placeholder2",
        date: "5 days ago"
    },
    {
        title: "Reviewing the New Bambu Lab X1",
        thumbnail: "https://placehold.co/600x400/00002a/ffffff?text=Printer+Review",
        link: "https://www.youtube.com/watch?v=placeholder3",
        date: "1 week ago"
    },
    {
        title: "Painting 3D Prints Like a Pro",
        thumbnail: "https://placehold.co/600x400/ffd700/000000?text=Painting+Guide",
        link: "https://www.youtube.com/watch?v=placeholder4",
        date: "2 weeks ago"
    }
];

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

// Render YouTube Videos
const videoContainer = document.getElementById('youtube-feed');
if (videoContainer) {
    youtubeVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <a href="${video.link}" target="_blank">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>${video.date}</p>
                </div>
            </a>
        `;
        videoContainer.appendChild(card);
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

/*
   Note: To fetch real YouTube data without an API key, you can use an RSS to JSON converter.
   Example using rss2json.com:

   fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID')
     .then(response => response.json())
     .then(data => {
        // Map data.items to your video structure and render
     });
*/
