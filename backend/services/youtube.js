// Use Node's built-in fetch (Node 18+) with a minimal fallback to node-fetch if unavailable
const fetchFn = (...args) => {
  if (typeof fetch !== 'undefined') return fetch(...args);
  // Fallback only if needed; avoids hard dependency in modern Node
  // eslint-disable-next-line global-require
  const nodeFetch = require('node-fetch');
  return nodeFetch(...args);
};

// Simple in-memory cache with TTL per topic
// cacheKey: topicId -> { ts, videos }
const cache = new Map();
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isFresh(entry) {
  return entry && (Date.now() - entry.ts) < TTL_MS && Array.isArray(entry.videos);
}

async function searchYouTube(query, maxResults = 5) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return { success: false, reason: 'missing_api_key', videos: [] };
  }
  const params = new URLSearchParams({
    part: 'snippet',
    maxResults: String(maxResults),
    q: query,
    type: 'video',
    key: apiKey,
    safeSearch: 'strict',
    order: 'viewCount',
    videoEmbeddable: 'true',
    videoDuration: 'medium'
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const res = await fetchFn(url);
  if (!res.ok) {
    return { success: false, reason: `http_${res.status}`, videos: [] };
  }
  const json = await res.json();
  let videos = (json.items || []).map(item => ({
    youtubeVideoId: item.id && item.id.videoId,
    title: item.snippet && item.snippet.title,
    channel: item.snippet && item.snippet.channelTitle,
    publishedAt: item.snippet && item.snippet.publishedAt,
    thumbnails: item.snippet && item.snippet.thumbnails
  })).filter(v => !!v.youtubeVideoId);

  // Filter and rank to avoid music/irrelevant results
  const includeKeywords = ['tutorial', 'course', 'lesson', 'introduction', 'basics', 'beginner', 'learn'];
  const excludeKeywords = ['music', 'song', 'lyrics', 'official video', 'cover', 'video clip', 'live'];
  const allowlistedChannels = [
    'freeCodeCamp.org',
    'Programming with Mosh',
    'Traversy Media',
    'The Net Ninja',
    'Fireship',
    'Web Dev Simplified',
    'Academind',
    'Corey Schafer',
    'Tech With Tim',
    'Amigoscode',
    'Derek Banas'
  ];

  const norm = (s) => String(s || '').toLowerCase();
  videos = videos
    .filter(v => {
      const t = norm(v.title);
      if (excludeKeywords.some(k => t.includes(k))) return false;
      // Prefer content that contains at least one include keyword
      return includeKeywords.some(k => t.includes(k));
    })
    .sort((a, b) => {
      const aScore = (allowlistedChannels.includes(a.channel) ? 10 : 0) + (includeKeywords.filter(k => norm(a.title).includes(k)).length);
      const bScore = (allowlistedChannels.includes(b.channel) ? 10 : 0) + (includeKeywords.filter(k => norm(b.title).includes(k)).length);
      return bScore - aScore;
    });
  return { success: true, videos };
}

async function getTopicVideos(topicTitle, courseId, conceptKeywords = []) {
  const topicKey = `${courseId || 'general'}::${topicTitle || 'topic'}`.toLowerCase();
  const cached = cache.get(topicKey);
  if (isFresh(cached)) {
    return { success: true, cached: true, videos: cached.videos };
  }

  const keywords = conceptKeywords.slice(0,2).join(' ');
  const query = `${topicTitle} ${courseId || ''} programming tutorial course ${keywords} for beginners`.trim();
  try {
    const result = await searchYouTube(query, 5);
    if (result.success) {
      cache.set(topicKey, { ts: Date.now(), videos: result.videos });
      return { success: true, cached: false, videos: result.videos };
    }
    return { success: false, videos: [] };
  } catch (e) {
    return { success: false, videos: [] };
  }
}

module.exports = { getTopicVideos };
