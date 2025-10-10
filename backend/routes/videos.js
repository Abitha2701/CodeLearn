const express = require('express');
const fs = require('fs');
const path = require('path');
const { getTopicVideos } = require('../services/youtube');

const router = express.Router();

function loadQuizData() {
  const quizDataPath = path.join(__dirname, '..', 'comprehensive_quiz_data.json');
  if (!fs.existsSync(quizDataPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

// GET /api/videos -> help/usage
router.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Usage: GET /api/videos/:courseId/:topicId',
    example: '/api/videos/python/introduction-to-python',
    youtubeEnabled: !!process.env.YOUTUBE_API_KEY,
  });
});

// GET /api/videos/:courseId/:topicId -> fetch YouTube videos dynamically with caching
router.get('/:courseId/:topicId', async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const data = loadQuizData();

    // Derive topicTitle from JSON if available; otherwise fall back to slug -> title
    let topicTitle = topicId.replace(/-/g, ' ');
    let conceptKeywords = [];
    if (data && data[courseId]) {
      for (const levelData of Object.values(data[courseId] || {})) {
        if (levelData && levelData[topicId]) {
          const info = levelData[topicId];
          topicTitle = info.topic || topicTitle;
          conceptKeywords = info.concepts || [];
          break;
        }
      }
    }

    // If YOUTUBE_API_KEY is not configured, return curated fallbacks to avoid empty UI
    if (!process.env.YOUTUBE_API_KEY) {
      const fallback = getFallbackVideos(courseId, topicId, topicTitle);
      console.log(`🎞️ [videos] Fallback videos for ${courseId}/${topicId} -> ${topicTitle}: ${fallback.length}`);
      return res.json({ success: true, videos: fallback, cached: true, note: 'using_fallback_no_api_key' });
    }

    const result = await getTopicVideos(topicTitle, courseId, conceptKeywords);
    if (!result.success) {
      console.warn(`🎞️ [videos] Fetch failed for ${courseId}/${topicId}: ${topicTitle}`);
      return res.status(200).json({ success: true, videos: [], cached: false, note: 'YouTube API not configured or fetch failed' });
    }
    console.log(`🎞️ [videos] Live videos for ${courseId}/${topicId} -> ${topicTitle}: ${(result.videos||[]).length}, cached=${!!result.cached}`);
    return res.json({ success: true, videos: result.videos, cached: !!result.cached });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch videos', error: e.message });
  }
});

// Curated minimal fallback list by topic for demo when API key missing
function getFallbackVideos(courseId, topicId, topicTitle) {
  const bySlug = `${courseId}:${topicId}`.toLowerCase();
  const map = new Map([
    ['python:introduction-to-python', [
      { youtubeVideoId: 'kqtD5dpn9C8', title: 'Python for Beginners', channel: 'Programming with Mosh' },
      { youtubeVideoId: 'rfscVS0vtbw', title: 'Learn Python - Full Course', channel: 'freeCodeCamp.org' }
    ]],
    ['python:variables-and-data-types', [
      { youtubeVideoId: 'TqPzwenhMj0', title: 'Python Variables Explained', channel: 'Corey Schafer' }
    ]],
    ['javascript:javascript-fundamentals', [
      { youtubeVideoId: 'PkZNo7MFNFg', title: 'JS Tutorial for Beginners', channel: 'freeCodeCamp.org' }
    ]],
    ['react:react-fundamentals', [
      { youtubeVideoId: 'bMknfKXIFA8', title: 'React Course - Beginners', channel: 'freeCodeCamp.org' }
    ]],
    ['react:hooks-and-state', [
      { youtubeVideoId: 'dpw9EHDh2bM', title: 'React Hooks in 100 Seconds', channel: 'Fireship' },
      { youtubeVideoId: 'TNhaISOUy6Q', title: 'React Hooks Crash Course', channel: 'Traversy Media' }
    ]],
    ['html:introduction-to-html', [
      { youtubeVideoId: 'qz0aGYrrlhU', title: 'HTML Full Course', channel: 'freeCodeCamp.org' }
    ]],
    ['html:html-elements', [
      { youtubeVideoId: 'x4OKqZ2kIx4', title: 'HTML Elements Explained', channel: 'Kevin Powell' }
    ]],
    ['html:forms-and-input-elements', [
      { youtubeVideoId: 'fNcJuPIZ2WE', title: 'HTML Forms Tutorial', channel: 'Kevin Powell' }
    ]],
    ['css:css-basics', [
      { youtubeVideoId: '1Rs2ND1ryYc', title: 'CSS Crash Course', channel: 'Traversy Media' }
    ]],
    ['go:go-basics', [
      { youtubeVideoId: 'yyUHQIec83I', title: 'Go Programming - Full Course', channel: 'freeCodeCamp.org' }
    ]],
    ['nodejs:nodejs-basics', [
      { youtubeVideoId: 'fBNz5xF-Kx4', title: 'Node.js Crash Course', channel: 'Traversy Media' }
    ]],
    ['java:java-basics', [
      { youtubeVideoId: 'grEKMHGYyns', title: 'Java Tutorial for Beginners', channel: 'Programming with Mosh' }
    ]],
  ]);
  const key = map.has(bySlug) ? bySlug : null;
  const items = key ? map.get(bySlug) : [];
  if (items.length) return items;

  // Course-specific safe educational defaults
  const courseDefaults = {
    python: { youtubeVideoId: 'rfscVS0vtbw', title: 'Learn Python - Full Course', channel: 'freeCodeCamp.org' },
    javascript: { youtubeVideoId: 'PkZNo7MFNFg', title: 'JS Tutorial for Beginners', channel: 'freeCodeCamp.org' },
    react: { youtubeVideoId: 'bMknfKXIFA8', title: 'React Course - Beginners', channel: 'freeCodeCamp.org' },
    html: { youtubeVideoId: 'qz0aGYrrlhU', title: 'HTML Full Course', channel: 'freeCodeCamp.org' },
    css: { youtubeVideoId: '1Rs2ND1ryYc', title: 'CSS Crash Course', channel: 'Traversy Media' },
    nodejs: { youtubeVideoId: 'fBNz5xF-Kx4', title: 'Node.js Crash Course', channel: 'Traversy Media' },
    java: { youtubeVideoId: 'grEKMHGYyns', title: 'Java Tutorial for Beginners', channel: 'Programming with Mosh' },
    typescript: { youtubeVideoId: 'zQnBQ4tB3ZA', title: 'TypeScript Full Course', channel: 'freeCodeCamp.org' }
  };
  const def = courseDefaults[courseId?.toLowerCase()] || { youtubeVideoId: 'PkZNo7MFNFg', title: `${topicTitle} Tutorial`, channel: 'freeCodeCamp.org' };
  return [def];
}

module.exports = router;
