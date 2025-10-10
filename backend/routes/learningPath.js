const express = require('express');
const router = express.Router();
const LearningPath = require('../models/LearningPath');
const mlService = require('../services/mlService');
const User = require('../models/User');
const { getTopicVideos } = require('../services/youtube');

// Middleware to verify JWT token (assuming it's defined in server.js)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper: enrich steps with top video links for lesson/video steps
async function enrichStepsWithVideos(courseId, steps, limit = 3) {
  if (!Array.isArray(steps)) return steps;
  const enriched = [];
  for (const step of steps) {
    if (step && (step.type === 'lesson' || step.type === 'video')) {
      const topics = step.topics || [];
      const videosPerTopic = [];
      let firstVideoUrl = null;
      for (const topicId of topics) {
        try {
          const titleGuess = String(topicId || '').replace(/-/g, ' ');
          const result = await getTopicVideos(titleGuess, courseId, []);
          const topVideos = (result && result.videos) ? result.videos.slice(0, Math.max(1, Number(limit) || 3)) : [];
          const mapped = topVideos.map(v => ({
            youtubeVideoId: v.youtubeVideoId,
            title: v.title,
            channel: v.channel,
            url: `https://www.youtube.com/watch?v=${v.youtubeVideoId}`
          }));
          if (!firstVideoUrl && mapped.length > 0) {
            firstVideoUrl = mapped[0].url;
          }
          videosPerTopic.push({ topicId, videos: mapped });
        } catch (_) {
          videosPerTopic.push({ topicId, videos: [] });
        }
      }
      const base = step.toObject?.() || step;
      const content = { ...(base.content || {}) };
      if (firstVideoUrl) {
        content.videoUrl = firstVideoUrl;
      }
      enriched.push({ ...base, content, videoRecommendations: videosPerTopic });
    } else {
      enriched.push(step);
    }
  }
  return enriched;
}

// Create or get personalized learning path
router.post('/create/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { preferences, goals } = req.body;
    const userId = req.user.userId;
    const force = (req.query.force === 'true');
    const includeParam = req.query.includeVideos;
    const includeVideos = includeParam === undefined ? true : includeParam === 'true';
    const videoLimit = req.query.videoLimit ? parseInt(req.query.videoLimit, 10) : 3;

    console.log(`🎯 Creating personalized learning path for user ${userId}, course ${courseId}`);

    // Check if user already has a learning path for this course
    let existingPath = await LearningPath.findOne({ userId, courseId, isActive: true });

    // If a path exists but has zero steps, or force=true, regenerate it
    if (existingPath && !force && existingPath.steps && existingPath.steps.length > 0) {
      console.log('📚 Existing learning path found, returning it');
      const lpObj = existingPath.toObject ? existingPath.toObject() : existingPath;
      if (includeVideos) {
        lpObj.steps = await enrichStepsWithVideos(courseId, lpObj.steps, videoLimit);
      }
      return res.json({
        success: true,
        learningPath: lpObj,
        message: 'Existing learning path retrieved'
      });
    }

    // Get user's performance history for this course
    const user = await User.findById(userId);
    const performanceHistory = user.progress && user.progress[courseId] ? 
      user.progress[courseId].attempts : null;

    // Generate personalized learning path using ML
    const personalizedPath = await LearningPath.generatePersonalizedPath(
      userId, 
      courseId, 
      {
        learningStyle: preferences?.learningStyle || 'visual',
        pace: preferences?.pace || 'medium',
        goals: goals || ['general-learning'],
        availableTimePerWeek: preferences?.availableTimePerWeek || 5
      },
      performanceHistory
    );

    // If we are regenerating, deactivate previous path
    if (existingPath) {
      existingPath.isActive = false;
      await existingPath.save();
    }

    await personalizedPath.save();

    console.log(`✅ Created personalized learning path with ${personalizedPath.steps.length} steps`);
    
    const savedObj = personalizedPath.toObject ? personalizedPath.toObject() : personalizedPath;
    if (includeVideos) {
      savedObj.steps = await enrichStepsWithVideos(courseId, savedObj.steps, videoLimit);
    }
    res.json({
      success: true,
      learningPath: savedObj,
      message: 'Personalized learning path created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating learning path:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create learning path',
      error: error.message
    });
  }
});

// Get user's learning path for a course
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;
    const includeVideos = (req.query.includeVideos === 'true');

    const learningPath = await LearningPath.findOne({ 
      userId, 
      courseId, 
      isActive: true 
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'No learning path found for this course'
      });
    }

    const lpObj = learningPath.toObject ? learningPath.toObject() : learningPath;
    if (includeVideos) {
      lpObj.steps = await enrichStepsWithVideos(courseId, lpObj.steps, videoLimit);
    }
    res.json({
      success: true,
      learningPath: lpObj
    });

  } catch (error) {
    console.error('❌ Error fetching learning path:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning path',
      error: error.message
    });
  }
});

// Update step completion
router.post('/:courseId/complete-step', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { stepId, score, timeSpent } = req.body;
    const userId = req.user.userId;

    const learningPath = await LearningPath.findOne({ 
      userId, 
      courseId, 
      isActive: true 
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // Complete the step
    learningPath.completeStep(stepId, score, timeSpent);
    await learningPath.save();

    // Analyze performance and get recommendations
    const user = await User.findById(userId);
    const recentAttempts = user.progress && user.progress[courseId] ? 
      user.progress[courseId].attempts.slice(-10) : [];

    if (recentAttempts.length >= 3) {
      const recommendations = await mlService.recommendPathAdjustments(learningPath, {
        averageQuizScore: learningPath.performanceMetrics.averageQuizScore,
        averageTimePerStep: learningPath.performanceMetrics.averageTimePerStep,
        strugglingTopics: learningPath.performanceMetrics.strugglingTopics,
        strongTopics: learningPath.performanceMetrics.strongTopics
      });

      // Add recommendations to learning path
      learningPath.recommendations.push(...recommendations);
      await learningPath.save();
    }

    console.log(`✅ Step ${stepId} completed for user ${userId}`);

    res.json({
      success: true,
      learningPath,
      message: 'Step completed successfully'
    });

  } catch (error) {
    console.error('❌ Error completing step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete step',
      error: error.message
    });
  }
});

// Get next recommended step
router.get('/:courseId/next-step', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const learningPath = await LearningPath.findOne({ 
      userId, 
      courseId, 
      isActive: true 
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    const nextStep = learningPath.getNextStep();
    const availableSteps = learningPath.getAvailableSteps();

    res.json({
      success: true,
      nextStep,
      availableSteps,
      progress: {
        completed: learningPath.completedSteps,
        total: learningPath.totalSteps,
        percentage: learningPath.overallProgress
      }
    });

  } catch (error) {
    console.error('❌ Error getting next step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next step',
      error: error.message
    });
  }
});

// Apply ML recommendations
router.post('/:courseId/apply-recommendation', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { recommendationId } = req.body;
    const userId = req.user.userId;

    const learningPath = await LearningPath.findOne({ 
      userId, 
      courseId, 
      isActive: true 
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    const recommendation = learningPath.recommendations.id(recommendationId);
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    // Apply the recommendation
    await applyRecommendation(learningPath, recommendation);
    recommendation.applied = true;
    
    // Log the adaptation
    learningPath.adaptations.push({
      reason: recommendation.message,
      changes: recommendation.changes,
      mlModel: 'recommendation-engine'
    });

    await learningPath.save();

    console.log(`✅ Applied recommendation ${recommendationId} for user ${userId}`);

    res.json({
      success: true,
      learningPath,
      message: 'Recommendation applied successfully'
    });

  } catch (error) {
    console.error('❌ Error applying recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply recommendation',
      error: error.message
    });
  }
});

// Get learning analytics
router.get('/:courseId/analytics', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const learningPath = await LearningPath.findOne({ 
      userId, 
      courseId, 
      isActive: true 
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // Calculate detailed analytics
    const analytics = {
      overallProgress: learningPath.overallProgress,
      completedSteps: learningPath.completedSteps,
      totalSteps: learningPath.totalSteps,
      performanceMetrics: learningPath.performanceMetrics,
      timeSpent: learningPath.steps
        .filter(step => step.isCompleted && step.timeSpent)
        .reduce((total, step) => total + step.timeSpent, 0),
      averageStepTime: learningPath.performanceMetrics.averageTimePerStep,
      strongAreas: learningPath.performanceMetrics.strongTopics,
      improvementAreas: learningPath.performanceMetrics.strugglingTopics,
      recentRecommendations: learningPath.recommendations
        .filter(rec => !rec.applied)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),
      learningTrend: calculateLearningTrend(learningPath.steps),
      estimatedCompletion: estimateCompletionTime(learningPath)
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

// Helper functions
async function applyRecommendation(learningPath, recommendation) {
  const changes = recommendation.changes;

  switch (recommendation.type) {
    case 'additional_practice':
      if (changes.addPracticeSteps) {
        // Add practice steps for struggling topics
        for (const topic of changes.addPracticeSteps) {
          const practiceStep = {
            stepId: `practice-${topic}-${Date.now()}`,
            title: `Additional Practice: ${topic}`,
            type: 'quiz',
            content: {
              description: `Extra practice for ${topic}`,
              estimatedTime: 20
            },
            difficulty: 2,
            topics: [topic]
          };
          learningPath.steps.push(practiceStep);
        }
      }
      break;

    case 'change_pace':
      if (changes.adjustPace === 'slower') {
        // Increase estimated times for remaining steps
        learningPath.steps.forEach(step => {
          if (!step.isCompleted) {
            step.content.estimatedTime = Math.round(step.content.estimatedTime * 1.3);
          }
        });
      }
      break;

    case 'skip_ahead':
      if (changes.skipSteps) {
        // Mark certain basic steps as completed
        learningPath.steps.forEach(step => {
          if (changes.skipSteps.some(skipTopic => step.topics.includes(skipTopic))) {
            step.isCompleted = true;
            step.completedAt = new Date();
          }
        });
      }
      break;
  }

  learningPath.updateProgress();
}

function calculateLearningTrend(steps) {
  const completedSteps = steps.filter(step => step.isCompleted && step.completedAt);
  if (completedSteps.length < 3) return 'insufficient_data';

  // Sort by completion date
  completedSteps.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

  // Calculate trend based on scores over time
  const recentScores = completedSteps.slice(-5).map(step => step.score || 0);
  const olderScores = completedSteps.slice(-10, -5).map(step => step.score || 0);

  if (olderScores.length === 0) return 'insufficient_data';

  const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;

  if (recentAvg > olderAvg + 5) return 'improving';
  if (recentAvg < olderAvg - 5) return 'declining';
  return 'stable';
}

function estimateCompletionTime(learningPath) {
  const remainingSteps = learningPath.steps.filter(step => !step.isCompleted);
  const totalRemainingTime = remainingSteps.reduce((total, step) => 
    total + (step.content.estimatedTime || 30), 0);

  const weeklyHours = learningPath.availableTimePerWeek || 5;
  const weeksToComplete = Math.ceil(totalRemainingTime / 60 / weeklyHours);

  return {
    remainingSteps: remainingSteps.length,
    estimatedHours: Math.round(totalRemainingTime / 60),
    estimatedWeeks: weeksToComplete,
    completionDate: new Date(Date.now() + weeksToComplete * 7 * 24 * 60 * 60 * 1000)
  };
}

module.exports = router;
