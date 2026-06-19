const axios = require('axios');

async function getChronologicalFeed(channelIds) {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) { console.error('[YouTube] YOUTUBE_API_KEY missing.'); return []; }

    let combinedFeed = [];

    for (const channelId of channelIds) {
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: API_KEY,
                    channelId,
                    part: 'snippet',
                    order: 'date',
                    maxResults: 10,
                    type: 'video',
                    videoDuration: 'medium' // excludes Shorts (< 60s are 'short')
                }
            });

            if (response.data?.items) {
                // Filter out Shorts by checking duration via videos endpoint
                const videoIds = response.data.items.map(i => i.id?.videoId).filter(Boolean).join(',');
                let durationsMap = {};

                if (videoIds) {
                    try {
                        const detailsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                            params: { key: API_KEY, id: videoIds, part: 'contentDetails,statistics' }
                        });
                        detailsRes.data?.items?.forEach(v => {
                            const iso = v.contentDetails?.duration || '';
                            const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                            const secs = ((+match?.[1]||0)*3600) + ((+match?.[2]||0)*60) + (+match?.[3]||0);
                            durationsMap[v.id] = { seconds: secs, viewCount: v.statistics?.viewCount || '0' };
                        });
                    } catch (_) {}
                }

                const cleanVideos = response.data.items
                    .map(item => {
                        const vId = item.id?.videoId || '';
                        const dur = durationsMap[vId];
                        return {
                            videoId: vId,
                            title: item.snippet?.title || 'Untitled',
                            thumbnail: item.snippet?.thumbnails?.medium?.url || '',
                            channelTitle: item.snippet?.channelTitle || 'Unknown',
                            channelId: item.snippet?.channelId || channelId,
                            publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
                            durationSeconds: dur?.seconds || 0,
                            viewCount: dur?.viewCount || '0'
                        };
                    })
                    .filter(v => v.videoId && v.durationSeconds > 60); // Remove Shorts

                combinedFeed = combinedFeed.concat(cleanVideos);
            }
        } catch (error) {
            console.error(`[YouTube] Failed for channel ${channelId}:`, error.response?.data || error.message);
            continue;
        }
    }

    return combinedFeed.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function searchChannelVideos(channelIds, query) {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) return [];

    let results = [];

    for (const channelId of channelIds) {
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: API_KEY,
                    channelId,
                    q: query,
                    part: 'snippet',
                    order: 'relevance',
                    maxResults: 5,
                    type: 'video',
                    videoDuration: 'medium'
                }
            });

            if (response.data?.items) {
                const videos = response.data.items
                    .map(item => ({
                        videoId: item.id?.videoId || '',
                        title: item.snippet?.title || 'Untitled',
                        thumbnail: item.snippet?.thumbnails?.medium?.url || '',
                        channelTitle: item.snippet?.channelTitle || 'Unknown',
                        channelId: item.snippet?.channelId || channelId,
                        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
                        durationSeconds: 300,
                        viewCount: '0'
                    }))
                    .filter(v => v.videoId);
                results = results.concat(videos);
            }
        } catch (error) {
            console.error(`[YouTube Search] Failed for channel ${channelId}:`, error.message);
            continue;
        }
    }

    return results;
}

module.exports = { getChronologicalFeed, searchChannelVideos };
