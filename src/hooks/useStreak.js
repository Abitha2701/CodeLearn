// Tracks daily streak across all courses by inspecting localStorage progress entries
import { useEffect, useMemo, useState } from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;

const getAllAttempts = () => {
  const attempts = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('progress:')) continue;
      const val = localStorage.getItem(k);
      if (!val) continue;
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed?.attempts)) {
        attempts.push(...parsed.attempts);
      }
    }
  } catch {}
  return attempts;
};

export function useStreak() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onStorage = () => setTick((t) => t + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const { currentStreak, bestStreak, lastActiveDay, weekActivity } = useMemo(() => {
    const attempts = getAllAttempts();
    const daysSet = new Set(
      attempts
        .filter(a => typeof a?.ts === 'number')
        .map(a => new Date(new Date(a.ts).toDateString()).getTime())
    );

    // Weekly activity (last 7 days ending today)
    const todayMidnight = new Date(new Date().toDateString()).getTime();
    const weekActivity = Array.from({ length: 7 }).map((_, idx) => {
      const dayTs = todayMidnight - (6 - idx) * DAY_MS;
      return daysSet.has(dayTs);
    });

    // Compute streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let lastActiveDay = null;

    if (daysSet.size > 0) {
      const sortedDays = Array.from(daysSet).sort((a, b) => a - b);
      let run = 1;
      bestStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        if (sortedDays[i] - sortedDays[i - 1] === DAY_MS) {
          run += 1;
        } else if (sortedDays[i] === sortedDays[i - 1]) {
          // same day duplicate, ignore
        } else {
          bestStreak = Math.max(bestStreak, run);
          run = 1;
        }
      }
      bestStreak = Math.max(bestStreak, run);

      // Current streak: count back from today
      let cursor = todayMidnight;
      let streak = 0;
      while (daysSet.has(cursor)) {
        streak += 1;
        cursor -= DAY_MS;
      }
      // If yesterday had activity but not today, that's still a current streak
      if (streak === 0 && daysSet.has(todayMidnight - DAY_MS)) {
        let c = todayMidnight - DAY_MS;
        while (daysSet.has(c)) { streak += 1; c -= DAY_MS; }
      }
      currentStreak = streak;
      lastActiveDay = new Date(Math.max(...sortedDays));
    }

    return { currentStreak, bestStreak, lastActiveDay, weekActivity };
  }, [tick]);

  return { currentStreak, bestStreak, lastActiveDay, weekActivity };
}


