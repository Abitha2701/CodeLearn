import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useProgress = (email, courseId) => {
  const { token, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local done state for completed items
  const [done, setDone] = useState(() => {
    try {
      const key = `done:${email}:${courseId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Mastery state - now mutable for direct updates
  const [mastery, setMastery] = useState(() => {
    const masteryMap = {};
    Object.values(progress).forEach(p => {
      if (p.attempts && p.attempts.length > 0) {
        const avgScore = p.attempts.reduce((sum, a) => sum + (a.scorePct || 0), 0) / p.attempts.length;
        masteryMap[p.topicId] = Math.min(1, avgScore / 100);
      }
    });
    return masteryMap;
  });

  // Toggle done status for an item
  const toggleDone = useCallback((itemId) => {
    setDone(prev => {
      const newDone = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];

      // Persist to localStorage
      try {
        const key = `done:${email}:${courseId}`;
        localStorage.setItem(key, JSON.stringify(newDone));
      } catch (err) {
        console.error('Failed to save done items:', err);
      }

      return newDone;
    });
  }, [email, courseId]);

  // Load user progress from database
  const loadProgress = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const progressMap = {};
        data.progress.forEach(p => {
          const key = `${p.courseId}:${p.topicId}`;
          progressMap[key] = p;
        });
        setProgress(progressMap);
      } else {
        setError('Failed to load progress');
      }
    } catch (err) {
      setError('Network error loading progress');
      console.error('Progress load error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  // Save quiz attempt to database
  const saveAttempt = useCallback(async (courseId, topicId, levelId, scorePct, answers = [], timeSpent = 0) => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch('http://localhost:5001/api/progress/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          topicId,
          levelId,
          scorePct,
          answers,
          timeSpent
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local progress state
        const key = `${courseId}:${topicId}`;
        setProgress(prev => ({
          ...prev,
          [key]: data.progress
        }));
        return true;
      } else {
        console.error('Failed to save progress:', response.status);
        return false;
      }
    } catch (err) {
      console.error('Progress save error:', err);
      return false;
    }
  }, [token, isAuthenticated]);

  // Get progress for a specific topic
  const getTopicProgress = useCallback((courseId, topicId) => {
    const key = `${courseId}:${topicId}`;
    return progress[key] || null;
  }, [progress]);

  // Get progress for a specific course
  const getCourseProgress = useCallback((courseId) => {
    return Object.values(progress).filter(p => p.courseId === courseId);
  }, [progress]);

  // Get user statistics
  const getStats = useCallback(async () => {
    if (!isAuthenticated || !token) return null;

    try {
      const response = await fetch('http://localhost:5001/api/progress/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.stats;
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
    return null;
  }, [token, isAuthenticated]);

  // Update mastery for a topic
  const updateMastery = useCallback((topicId, newMastery) => {
    setMastery(prev => ({
      ...prev,
      [topicId]: Math.min(1, Math.max(0, newMastery))
    }));
  }, []);

  // Add an attempt to progress
  const addAttempt = useCallback((attemptData) => {
    const { itemId, topic, difficulty, correct, scorePct, timeSec, hintsUsed, ts } = attemptData;
    const key = `${courseId}:${topic}`;

    setProgress(prev => {
      const existing = prev[key] || { courseId, topicId: topic, attempts: [] };
      const newAttempts = [...existing.attempts, {
        itemId,
        difficulty,
        correct,
        scorePct,
        timeSec,
        hintsUsed,
        ts
      }];
      return {
        ...prev,
        [key]: { ...existing, attempts: newAttempts }
      };
    });

    // Update mastery based on average score
    const avgScore = (mastery[topic] || 0) * 100; // existing average
    const totalAttempts = (progress[key]?.attempts?.length || 0) + 1;
    const newAvg = ((avgScore * (totalAttempts - 1)) + scorePct) / totalAttempts;
    updateMastery(topic, newAvg / 100);
  }, [courseId, mastery, progress, updateMastery]);

  // Load progress on mount and when authentication changes
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    loading,
    error,
    done,
    mastery,
    toggleDone,
    updateMastery,
    addAttempt,
    saveAttempt,
    getTopicProgress,
    getCourseProgress,
    getStats,
    refreshProgress: loadProgress
  };
};
