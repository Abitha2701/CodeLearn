// src/hooks/useProgress.js
import { useEffect, useState, useMemo } from 'react';

const key = (email, courseId) => `progress:${email || 'guest'}:${courseId}`;

export function useProgress(email, courseId) {
  const [state, setState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key(email, courseId)) || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(key(email, courseId), JSON.stringify(state));
  }, [email, courseId, state]);

  // shape:
  // {
  //   mastery: { [topic]: number between 0..1 },
  //   attempts: [{ itemId, topic, difficulty, correct, scorePct, timeSec, hintsUsed, ts }],
  //   done: [itemId, ...]
  // }

  const mastery = state.mastery || {};
  const attempts = state.attempts || [];
  const done = state.done || [];

  const updateMastery = (topic, perf, alpha = 0.3) => {
    const current = mastery[topic] ?? 0.5; // start neutral
    const next = (1 - alpha) * current + alpha * perf; // EWMA
    setState(s => ({ ...s, mastery: { ...(s.mastery || {}), [topic]: Number(next.toFixed(3)) } }));
  };

  const addAttempt = (attempt) => {
    setState(s => ({ ...s, attempts: [ ...(s.attempts || []), attempt ] }));
  };

  const toggleDone = (itemId) => {
    setState(s => {
      const d = new Set(s.done || []);
      d.has(itemId) ? d.delete(itemId) : d.add(itemId);
      return { ...s, done: Array.from(d) };
    });
  };

  return { mastery, attempts, done, updateMastery, addAttempt, toggleDone };
}
