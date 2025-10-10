const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LearningPath = require('../models/LearningPath');

// Reuse simple JWT auth from mlQuiz router pattern
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// GET /api/progress/dashboard?courseId=react
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.query;
    const userId = req.user.userId;

    const [user, learningPath] = await Promise.all([
      User.findById(userId).lean().catch(() => null),
      LearningPath.findOne({ userId, courseId, isActive: true }).lean().catch(() => null)
    ]);

    // Derive progress
    let completionPercent = 0;
    let level = 'beginner';
    let completed = [];
    let scores = [];
    let nextSuggestions = [];
    let streaks = { current: 0, longest: 0 };
    let achievements = [];

    if (learningPath && Array.isArray(learningPath.steps)) {
      const total = learningPath.steps.length;
      const done = learningPath.steps.filter(s => s.status === 'completed').length;
      completionPercent = total > 0 ? Math.round((done / total) * 100) : 0;
      level = learningPath.currentLevel || 'beginner';

      completed = learningPath.steps
        .filter(s => s.status === 'completed')
        .map(s => ({ stepId: s.stepId, type: s.type, topics: s.topics || [], score: s.score || null }));

      scores = learningPath.steps
        .filter(s => s.type === 'quiz' && typeof s.score === 'number')
        .map(s => ({ stepId: s.stepId, score: s.score, ts: s.completedAt || null }));

      // Simple next suggestions: next pending topics/quizzes
      nextSuggestions = learningPath.steps
        .filter(s => s.status !== 'completed')
        .slice(0, 3)
        .map(s => ({ type: s.type, topics: s.topics || [], reason: 'Next in your path' }));
    }

    // Derive streaks and achievements from user doc if present
    if (user && user.streaks) {
      streaks.current = user.streaks.currentStreakDays || 0;
      streaks.longest = user.streaks.longestStreakDays || 0;
    }
    if (user && Array.isArray(user.achievements)) {
      achievements = user.achievements;
    }

    return res.json({
      success: true,
      dashboard: {
        progressSummary: { completionPercent, level },
        completed,
        scores,
        nextSuggestions,
        streaks,
        achievements
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to load dashboard', error: e.message });
  }
});

module.exports = router;
