const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Progress = require('../models/Progress');

const router = express.Router();

// Get user progress for all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.userId })
      .sort({ lastAccessed: -1 });

    res.json({
      success: true,
      progress: progress.map(p => ({
        courseId: p.courseId,
        topicId: p.topicId,
        levelId: p.levelId,
        attempts: p.attempts,
        isCompleted: p.isCompleted,
        lastAccessed: p.lastAccessed,
        totalTimeSpent: p.totalTimeSpent
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
});

// Get progress for a specific course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await Progress.getUserCourseProgress(req.user.userId, courseId);

    res.json({
      success: true,
      progress: progress.map(p => ({
        topicId: p.topicId,
        levelId: p.levelId,
        attempts: p.attempts,
        isCompleted: p.isCompleted,
        lastAccessed: p.lastAccessed,
        totalTimeSpent: p.totalTimeSpent
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course progress',
      error: error.message
    });
  }
});

// Save quiz attempt
router.post('/attempt', authenticateToken, async (req, res) => {
  try {
    const { courseId, topicId, levelId, scorePct, answers, timeSpent } = req.body;

    if (!courseId || !topicId || !levelId || scorePct === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseId, topicId, levelId, scorePct'
      });
    }

    // Find existing progress or create new
    let progress = await Progress.findOne({
      userId: req.user.userId,
      courseId,
      topicId
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user.userId,
        courseId,
        topicId,
        levelId,
        attempts: []
      });
    }

    // Add new attempt
    const attempt = {
      scorePct,
      ts: Date.now(),
      answers: answers || [],
      timeSpent: timeSpent || 0,
      completedAt: new Date()
    };

    progress.attempts.push(attempt);
    progress.lastAccessed = new Date();
    progress.totalTimeSpent += timeSpent || 0;

    // Mark as completed if score >= 80%
    if (scorePct >= 80) {
      progress.isCompleted = true;
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Progress saved successfully',
      progress: {
        courseId: progress.courseId,
        topicId: progress.topicId,
        levelId: progress.levelId,
        attempts: progress.attempts,
        isCompleted: progress.isCompleted,
        totalTimeSpent: progress.totalTimeSpent
      }
    });
  } catch (error) {
    console.error('❌ Error saving progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving progress',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Progress.getUserStats(req.user.userId);

    const result = stats[0] || {
      totalQuizzes: 0,
      completedQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
      totalTimeSpent: 0
    };

    res.json({
      success: true,
      stats: {
        totalQuizzes: result.totalQuizzes || 0,
        completedQuizzes: result.completedQuizzes || 0,
        totalAttempts: result.totalAttempts || 0,
        averageScore: Math.round(result.averageScore || 0),
        totalTimeSpent: result.totalTimeSpent || 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Migrate localStorage progress (for existing users)
router.post('/migrate', authenticateToken, async (req, res) => {
  try {
    const { localProgress } = req.body; // Array of localStorage progress objects

    if (!Array.isArray(localProgress)) {
      return res.status(400).json({
        success: false,
        message: 'localProgress must be an array'
      });
    }

    const migrated = [];
    const skipped = [];

    for (const item of localProgress) {
      try {
        // Check if progress already exists
        const existing = await Progress.findOne({
          userId: req.user.userId,
          courseId: item.courseId,
          topicId: item.topicId
        });

        if (existing) {
          skipped.push(`${item.courseId}/${item.topicId}`);
          continue;
        }

        // Create new progress record
        const progress = new Progress({
          userId: req.user.userId,
          courseId: item.courseId,
          topicId: item.topicId,
          levelId: item.levelId || 'beginner',
          attempts: item.attempts || [],
          isCompleted: item.isCompleted || false,
          totalTimeSpent: item.totalTimeSpent || 0,
          lastAccessed: new Date(item.lastAccessed) || new Date()
        });

        await progress.save();
        migrated.push(`${item.courseId}/${item.topicId}`);
      } catch (err) {
        console.warn(`⚠️ Failed to migrate ${item.courseId}/${item.topicId}:`, err.message);
        skipped.push(`${item.courseId}/${item.topicId}`);
      }
    }

    res.json({
      success: true,
      message: `Migrated ${migrated.length} progress records, skipped ${skipped.length}`,
      migrated,
      skipped
    });
  } catch (error) {
    console.error('❌ Error migrating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error migrating progress',
      error: error.message
    });
  }
});

module.exports = router;
