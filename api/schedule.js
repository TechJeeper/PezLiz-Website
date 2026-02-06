/**
 * Serverless API that fetches PezLiz's Twitch stream schedule using
 * https://dev.twitch.tv/docs/api/reference/#get-channel-stream-schedule
 *
 * Requires env: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET
 * Deploy with Vercel/Netlify and set these in the dashboard.
 */

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_HELIX = 'https://api.twitch.tv/helix';
const BROADCASTER_LOGIN = 'pezliz';

async function getAppAccessToken(clientId, clientSecret) {
    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
    });
    const res = await fetch(TWITCH_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Twitch token failed: ${res.status} ${err}`);
    }
    const data = await res.json();
    return data.access_token;
}

async function getBroadcasterId(accessToken, clientId) {
    const res = await fetch(
        `${TWITCH_HELIX}/users?login=${encodeURIComponent(BROADCASTER_LOGIN)}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Client-Id': clientId
            }
        }
    );
    if (!res.ok) throw new Error(`Twitch users failed: ${res.status}`);
    const json = await res.json();
    if (!json.data || !json.data.length) throw new Error('Broadcaster not found');
    return json.data[0].id;
}

async function getSchedule(accessToken, clientId, broadcasterId) {
    const res = await fetch(
        `${TWITCH_HELIX}/schedule?broadcaster_id=${broadcasterId}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Client-Id': clientId
            }
        }
    );
    if (res.status === 404) {
        return { data: null, segments: [], vacation: null, broadcaster_name: BROADCASTER_LOGIN };
    }
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Twitch schedule failed: ${res.status} ${err}`);
    }
    const json = await res.json();
    const data = json.data || {};
    return {
        segments: data.segments || [],
        vacation: data.vacation || null,
        broadcaster_name: data.broadcaster_name || BROADCASTER_LOGIN,
        broadcaster_login: data.broadcaster_login || BROADCASTER_LOGIN
    };
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        res.status(503).json({
            error: 'Schedule unavailable',
            message: 'Twitch API credentials not configured. Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET.'
        });
        return;
    }

    try {
        const token = await getAppAccessToken(clientId, clientSecret);
        const broadcasterId = await getBroadcasterId(token, clientId);
        const schedule = await getSchedule(token, clientId, broadcasterId);
        res.status(200).json(schedule);
    } catch (err) {
        console.error('Schedule API error:', err.message);
        res.status(500).json({
            error: 'Schedule unavailable',
            message: err.message || 'Failed to load schedule'
        });
    }
}
