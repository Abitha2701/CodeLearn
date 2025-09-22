const express = require('express');
const router = express.Router();
const mlService = require('../services/mlService');
const { QuizTemplate } = require('../models/Quiz');
const LearningPath = require('../models/LearningPath');
const User = require('../models/User');

// Middleware to verify JWT token
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

// Generate personalized quiz using ML
router.post('/generate/:courseId/:topic', authenticateToken, async (req, res) => {
  try {
    const { courseId, topic } = req.params;
    const { difficulty, questionCount, adaptToUser } = req.body;
    const userId = req.user.userId;

    console.log(`🤖 Generating ML quiz for ${courseId}/${topic}, difficulty: ${difficulty}`);

    let userPerformance = null;
    
    if (adaptToUser) {
      // Get user's performance history for personalization
      const user = await User.findById(userId);
      if (user.progress && user.progress[courseId]) {
        const recentAttempts = user.progress[courseId].attempts.slice(-10);
        userPerformance = await mlService.aggregatePerformanceData(userId, courseId, recentAttempts);
      }
    }

    // Generate quiz questions using ML
    const generatedQuiz = await mlService.generateQuizQuestions(
      courseId,
      topic,
      difficulty || 2,
      userPerformance,
      questionCount || 10
    );

    if (!generatedQuiz.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate quiz questions',
        error: generatedQuiz.error
      });
    }

    // Validate generated questions
    const validation = await mlService.validateQuizQuestions(
      generatedQuiz.questions,
      courseId,
      topic
    );

    // Create quiz template in database
    const quizTemplate = new QuizTemplate({
      course_id: courseId,
      level_id: difficulty <= 2 ? 'beginner' : difficulty <= 3 ? 'intermediate' : 'advanced',
      topic_id: topic,
      title: `AI-Generated ${topic} Quiz`,
      description: `Personalized quiz for ${topic} generated using machine learning`,
      questions: generatedQuiz.questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correct_answer: q.options.indexOf(q.answer),
        explanation: q.explanation || `The correct answer is ${q.answer}`
      })),
      estimated_time: Math.ceil(generatedQuiz.questions.length * 1.5),
      difficulty_level: difficulty || 2,
      tags: [topic, 'ml-generated', 'personalized'],
      created_by: 'ml-service',
      metadata: {
        mlGenerated: true,
        generatedAt: new Date(),
        userPersonalized: adaptToUser,
        validationScore: validation.overallScore,
        mlModel: generatedQuiz.metadata.mlModel
      }
    });

    await quizTemplate.save();

    console.log(`✅ Generated and saved ML quiz with ${generatedQuiz.questions.length} questions`);

    res.json({
      success: true,
      quiz: {
        id: quizTemplate._id,
        title: quizTemplate.title,
        description: quizTemplate.description,
        questions: generatedQuiz.questions,
        estimatedTime: quizTemplate.estimated_time,
        difficulty: quizTemplate.difficulty_level,
        validation: validation,
        metadata: generatedQuiz.metadata
      },
      message: 'Quiz generated successfully using ML'
    });

  } catch (error) {
    console.error('❌ Error generating ML quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate ML quiz',
      error: error.message
    });
  }
});

// Get adaptive quiz based on user's learning path
router.get('/adaptive/:courseId/:stepId', authenticateToken, async (req, res) => {
  try {
    const { courseId, stepId } = req.params;
    const userId = req.user.userId;

    console.log(`🎯 Getting adaptive quiz for step ${stepId}`);

    // Get user's learning path
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

    // Find the specific step
    const step = learningPath.steps.find(s => s.stepId === stepId);
    if (!step || step.type !== 'quiz') {
      return res.status(404).json({
        success: false,
        message: 'Quiz step not found'
      });
    }

    // Determine adaptive difficulty based on user performance
    let adaptiveDifficulty = step.difficulty;
    if (learningPath.performanceMetrics.averageQuizScore > 85) {
      adaptiveDifficulty = Math.min(adaptiveDifficulty + 1, 5);
    } else if (learningPath.performanceMetrics.averageQuizScore < 60) {
      adaptiveDifficulty = Math.max(adaptiveDifficulty - 1, 1);
    }

    // Check if we have a cached adaptive quiz
    let existingQuiz = await QuizTemplate.findOne({
      course_id: courseId,
      topic_id: step.topics[0],
      difficulty_level: adaptiveDifficulty,
      'metadata.mlGenerated': true,
      'metadata.userPersonalized': true
    });

    if (existingQuiz) {
      console.log('📚 Using existing adaptive quiz');
      return res.json({
        success: true,
        quiz: existingQuiz.getFormattedQuiz(),
        adaptive: true,
        adjustedDifficulty: adaptiveDifficulty,
        originalDifficulty: step.difficulty
      });
    }

    // Generate new adaptive quiz
    const user = await User.findById(userId);
    const recentAttempts = user.progress && user.progress[courseId] ? 
      user.progress[courseId].attempts.slice(-10) : [];
    
    const userPerformance = recentAttempts.length > 0 ? 
      await mlService.aggregatePerformanceData(userId, courseId, recentAttempts) : null;

    const generatedQuiz = await mlService.generateQuizQuestions(
      courseId,
      step.topics[0],
      adaptiveDifficulty,
      userPerformance,
      8
    );

    if (!generatedQuiz.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate adaptive quiz'
      });
    }

    // Validate generated questions for adaptive quiz
    const adaptiveValidation = await mlService.validateQuizQuestions(
      generatedQuiz.questions,
      courseId,
      step.topics[0]
    );

    // Create and save the adaptive quiz
    const adaptiveQuiz = new QuizTemplate({
      course_id: courseId,
      level_id: adaptiveDifficulty <= 2 ? 'beginner' : adaptiveDifficulty <= 3 ? 'intermediate' : 'advanced',
      topic_id: step.topics[0],
      title: `Adaptive ${step.topics[0]} Quiz`,
      description: `Personalized adaptive quiz adjusted to your performance level`,
      questions: generatedQuiz.questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correct_answer: q.options.indexOf(q.answer),
        explanation: q.explanation || `The correct answer is ${q.answer}`
      })),
      estimated_time: Math.ceil(generatedQuiz.questions.length * 1.5),
      difficulty_level: adaptiveDifficulty,
      tags: [step.topics[0], 'adaptive', 'ml-generated'],
      created_by: 'adaptive-ml-service',
      metadata: {
        mlGenerated: true,
        adaptive: true,
        userPersonalized: true,
        originalDifficulty: step.difficulty,
        adjustedDifficulty: adaptiveDifficulty,
        basedOnPerformance: userPerformance !== null,
        generatedAt: new Date(),
        validationScore: adaptiveValidation.overallScore
      }
    });

    await adaptiveQuiz.save();

    console.log(`✅ Generated adaptive quiz with difficulty ${adaptiveDifficulty} (original: ${step.difficulty})`);

    res.json({
      success: true,
      quiz: adaptiveQuiz.getFormattedQuiz(),
      adaptive: true,
      adjustedDifficulty: adaptiveDifficulty,
      originalDifficulty: step.difficulty,
      performanceBasedAdjustment: userPerformance !== null,
      validation: adaptiveValidation
    });

  } catch (error) {
    console.error('❌ Error generating adaptive quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate adaptive quiz',
      error: error.message
    });
  }
});

// Validate quiz answers with ML feedback
router.post('/validate-answers', authenticateToken, async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    const userId = req.user.userId;

    console.log(`🔍 Validating quiz answers with ML feedback`);

    const quiz = await QuizTemplate.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate basic score
    let correctAnswers = 0;
    const detailedResults = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct_answer;
      
      if (isCorrect) correctAnswers++;

      detailedResults.push({
        questionIndex: index,
        question: question.question,
        userAnswer: question.options[userAnswer],
        correctAnswer: question.options[question.correct_answer],
        isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Generate ML-powered feedback
    const performanceAnalysis = await mlService.analyzeUserPerformance(
      userId,
      quiz.course_id,
      [{
        scorePct: score,
        timeSec: timeSpent,
        topic: quiz.topic_id,
        difficulty: quiz.difficulty_level,
        ts: Date.now()
      }]
    );

    // Generate personalized recommendations
    const recommendations = [];
    
    if (score < 70) {
      recommendations.push({
        type: 'review',
        message: 'Consider reviewing the fundamental concepts before moving forward',
        priority: 'high'
      });
    }

    if (score > 90) {
      recommendations.push({
        type: 'advance',
        message: 'Excellent work! You might be ready for more advanced topics',
        priority: 'medium'
      });
    }

    // Identify weak areas
    const incorrectTopics = detailedResults
      .filter(result => !result.isCorrect)
      .map(result => quiz.topic_id);

    if (incorrectTopics.length > 0) {
      recommendations.push({
        type: 'practice',
        message: `Focus on practicing: ${quiz.topic_id}`,
        priority: 'high',
        topics: [quiz.topic_id]
      });
    }

    console.log(`✅ Quiz validated: ${score}% (${correctAnswers}/${quiz.questions.length})`);

    res.json({
      success: true,
      results: {
        score,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        timeSpent,
        passed: score >= 70,
        detailedResults,
        performanceAnalysis,
        recommendations,
        mlFeedback: {
          strengths: performanceAnalysis.strengths || [],
          weaknesses: performanceAnalysis.weaknesses || [],
          nextSteps: recommendations.map(r => r.message)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error validating quiz answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate quiz answers',
      error: error.message
    });
  }
});

// Get ML-powered learning recommendations
router.get('/recommendations/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    console.log(`🎯 Getting ML recommendations for ${courseId}`);

    // Get user's recent performance
    const user = await User.findById(userId);
    const recentAttempts = user.progress && user.progress[courseId] ? 
      user.progress[courseId].attempts.slice(-20) : [];

    if (recentAttempts.length < 3) {
      return res.json({
        success: true,
        recommendations: [{
          type: 'start_learning',
          message: 'Complete a few quizzes to get personalized recommendations',
          priority: 'medium'
        }]
      });
    }

    // Analyze performance with ML
    const performanceAnalysis = await mlService.analyzeUserPerformance(
      userId,
      courseId,
      recentAttempts
    );

    // Get learning path for context
    const learningPath = await LearningPath.findOne({ 
      userId, 
      courseId, 
      isActive: true 
    });

    let pathRecommendations = [];
    if (learningPath) {
      pathRecommendations = await mlService.recommendPathAdjustments(
        learningPath,
        performanceAnalysis
      );
    }

    // Combine all recommendations
    const allRecommendations = [
      ...pathRecommendations,
      ...generateContentRecommendations(performanceAnalysis, courseId),
      ...generateStudyRecommendations(performanceAnalysis)
    ];

    console.log(`✅ Generated ${allRecommendations.length} ML recommendations`);

    res.json({
      success: true,
      recommendations: allRecommendations,
      performanceAnalysis,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('❌ Error getting ML recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Helper functions
function generateContentRecommendations(performanceAnalysis, courseId) {
  const recommendations = [];

  if (performanceAnalysis.weaknesses && performanceAnalysis.weaknesses.length > 0) {
    recommendations.push({
      type: 'additional_content',
      message: `Consider additional resources for: ${performanceAnalysis.weaknesses.join(', ')}`,
      priority: 'high',
      topics: performanceAnalysis.weaknesses,
      confidence: 0.8
    });
  }

  if (performanceAnalysis.strengths && performanceAnalysis.strengths.length > 0) {
    recommendations.push({
      type: 'advanced_content',
      message: `You're strong in ${performanceAnalysis.strengths.join(', ')}. Try advanced challenges!`,
      priority: 'medium',
      topics: performanceAnalysis.strengths,
      confidence: 0.75
    });
  }

  return recommendations;
}

function generateStudyRecommendations(performanceAnalysis) {
  const recommendations = [];

  if (performanceAnalysis.overallPerformance === 'needs_improvement') {
    recommendations.push({
      type: 'study_strategy',
      message: 'Try breaking down complex topics into smaller chunks and practice regularly',
      priority: 'high',
      confidence: 0.85
    });
  }

  if (performanceAnalysis.overallPerformance === 'excellent') {
    recommendations.push({
      type: 'challenge',
      message: 'You\'re doing great! Consider taking on more challenging projects',
      priority: 'medium',
      confidence: 0.8
    });
  }

  return recommendations;
}

module.exports = router;
