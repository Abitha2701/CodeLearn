// src/pages/logic.js
export function perfScore({ correct, scorePct, timeSec, expectedTime = 30, hintsUsed = 0 }) {
  const c = correct ? 1 : 0;
  const timeNorm = Math.max(0, Math.min(1, 1 - timeSec / expectedTime));
  const hintPenalty = Math.min(0.4, hintsUsed * 0.1);
  // weight correctness > speed
  return Math.max(0, Math.min(1, 0.7 * c + 0.3 * timeNorm - hintPenalty));
}

export function chooseNextItem({ items, done, mastery }) {
  // Items have topic & difficulty 1..5
  const notDone = items.filter(it => !done.includes(it.id));

  // Order by "target difficulty" around mastery:
  // mastery ~ probability of success; convert to target difficulty
  // simple mapping: targetDifficulty = 1 + round(masteryTopic * 4)
  const scoreItem = (it) => {
    const m = mastery[it.topic] ?? 0.5;
    const target = 1 + Math.round(m * 4); // 1..5
    // prefer items whose difficulty ~ target, then lowest difficulty first
    const diffGap = Math.abs(it.difficulty - target);
    return diffGap * 10 + it.difficulty; // lower is better
  };

  notDone.sort((a, b) => scoreItem(a) - scoreItem(b));
  return notDone[0] || null;
}
