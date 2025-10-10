import { useEffect, useState } from 'react';

function slugify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getApiBase() {
  const env = process.env.REACT_APP_API_URL;
  if (env) return env.replace(/\/$/, '');
  // Default to local backend
  return 'http://localhost:5001';
}

export function useTopicVideos(courseId, topicTitle, options = { enabled: true }) {
  const [data, setData] = useState({ videos: [], loading: false, error: null });
  useEffect(() => {
    if (!options.enabled) return;
    if (!courseId || !topicTitle) return;
    const controller = new AbortController();
    const run = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        const topicId = slugify(topicTitle);
        const res = await fetch(`${getApiBase()}/api/videos/${courseId}/${topicId}`, { signal: controller.signal });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to fetch videos');
        setData({ videos: json.videos || [], loading: false, error: null });
      } catch (e) {
        if (e.name === 'AbortError') return;
        setData({ videos: [], loading: false, error: e.message || 'Error' });
      }
    };
    run();
    return () => controller.abort();
  }, [courseId, topicTitle, options.enabled]);
  return data;
}

export async function openTopVideoInNewTab(courseId, topicTitle) {
  const topicId = slugify(topicTitle);
  const res = await fetch(`${getApiBase()}/api/videos/${courseId}/${topicId}`);
  const json = await res.json();
  if (json && json.success && Array.isArray(json.videos) && json.videos.length > 0) {
    const first = json.videos[0];
    const url = `https://www.youtube.com/watch?v=${first.youtubeVideoId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true, url };
  }
  return { success: false };
}
