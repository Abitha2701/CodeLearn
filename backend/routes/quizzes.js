const express = require('express');
const path = require('path');
const fs = require('fs');
const { QuizTemplate } = require('../models/Quiz');
const mlService = require('../services/mlService');

const router = express.Router();

// Helper function to check MongoDB connection
function isMongoConnected() {
  try {
    return require('mongoose').connection && require('mongoose').connection.readyState === 1;
  } catch (e) {
    return false;
  }
}

// Ensure quiz questions are unique; if not enough after de-dup, augment via ML and shuffle
async function dedupeAndAugment(questions, courseId, topicId, difficulty, desiredCount = 10) {
  try {
    const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const keyOf = q => `${norm(q.question)}::${(q.options||[]).map(o=>norm(o)).sort().join('|')}`;
    const seen = new Set();
    const out = [];
    for (const q of questions || []) {
      const k = keyOf(q);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(q);
      }
    }
    // Augment if needed
    if (out.length < desiredCount) {
      const extra = await mlService.generateQuizQuestions(courseId, topicId, difficulty || 2, null, desiredCount - out.length + 2);
      if (extra?.success && Array.isArray(extra.questions)) {
        for (const e of extra.questions) {
          const cand = { question: e.question, options: e.options, answer: e.answer };
          const k = keyOf(cand);
          if (!seen.has(k)) {
            seen.add(k);
            out.push(cand);
            if (out.length >= desiredCount) break;
          }
        }
      }
    }
    // Shuffle
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  } catch (e) {
    // On any failure, return the original list
    return questions || [];
  }
}

async function generateAndRespond(courseId, topicId, res, difficultyHint = 2) {
  try {
    const difficulty = /advanced|oop|decorator|async|performance|concurrency|patterns/i.test(topicId)
      ? Math.max(3, difficultyHint)
      : difficultyHint;

    const generated = await mlService.generateQuizQuestions(courseId, topicId, difficulty, null, 10);
    if (!generated?.success || !generated.questions?.length) {
      return res.status(500).json({ success: false, message: 'Failed to generate quiz for this topic' });
    }
    let validation = null;
    try {
      validation = await mlService.validateQuizQuestions(generated.questions, courseId, topicId);
    } catch (e) {
      console.warn('⚠️ Validation failed during fallback generation:', e.message);
    }

    const prepared = await dedupeAndAugment(
      generated.questions.map(q => ({ question: q.question, options: q.options, answer: q.answer })),
      courseId,
      topicId,
      difficulty,
      10
    );

    return res.json({
      success: true,
      questions: prepared,
      title: `${topicId.replace(/-/g, ' ')} Quiz`,
      topic: topicId,
      level: difficulty <= 2 ? 'beginner' : difficulty <= 3 ? 'intermediate' : 'advanced',
      course: courseId,
      validation
    });
  } catch (err) {
    console.error('❌ Error in generateAndRespond:', err);
    return res.status(500).json({ success: false, message: 'Server error while generating quiz', error: err.message });
  }
}

// List all topics for a course across levels (must be after app initialization)
router.get('/topics/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizDataPath = path.join(__dirname, '..', 'comprehensive_quiz_data.json');
    if (!fs.existsSync(quizDataPath)) {
      return res.status(404).json({ success: false, message: 'Quiz data file not found' });
    }

    const quizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));
    const course = quizData[courseId];
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const levelOrder = ['beginner', 'intermediate', 'advanced'];
    const topics = [];
    levelOrder.forEach(levelKey => {
      const levelData = course[levelKey];
      if (!levelData) return;
      Object.entries(levelData).forEach(([topicId, info]) => {
        topics.push({
          id: topicId,
          name: info.topic || topicId.replace(/-/g, ' '),
          level: levelKey,
          difficulty: levelKey === 'beginner' ? 'Easy' : levelKey === 'intermediate' ? 'Medium' : 'Hard',
          icon: '📘',
          description: info.topic || topicId.replace(/-/g, ' ')
        });
      });
    });

    res.json({ success: true, topics });
  } catch (error) {
    console.error('❌ Error listing topics:', error);
    res.status(500).json({ success: false, message: 'Server error while listing topics', error: error.message });
  }
});

// Validate raw questions (without quizId) for ML feedback per question
router.post('/validate-raw', async (req, res) => {
  try {
    const { courseId, topicId, questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'questions array is required' });
    }
    const validated = await mlService.validateQuizQuestions(questions, courseId || 'general', topicId || 'general');
    return res.json({ success: true, validation: validated });
  } catch (error) {
    console.error('❌ Error validating raw questions:', error);
    return res.status(500).json({ success: false, message: 'Failed to validate questions', error: error.message });
  }
});

// Quiz Routes
router.get('/templates/:courseId/:levelId/:topicId', async (req, res) => {
  try {
    const { courseId, levelId, topicId } = req.params;
    console.log(`🔍 Quiz request: ${courseId}/${levelId}/${topicId}`);
    // Short-circuit if Mongo is offline to avoid buffering delays
    if (!isMongoConnected()) {
      console.log('🚫 Mongo offline, using ML fallback');
      return generateAndRespond(courseId, topicId, res, levelId === 'beginner' ? 2 : levelId === 'intermediate' ? 3 : 4);
    }

    const quiz = await QuizTemplate.findByCourseLevelTopic(courseId, levelId, topicId);

    if (!quiz) {
      console.log(`❌ Quiz not found for: ${courseId}/${levelId}/${topicId}`);
      // Use ML fallback instead of 404
      return generateAndRespond(courseId, topicId, res, levelId === 'beginner' ? 2 : levelId === 'intermediate' ? 3 : 4);
    }

    // De-duplicate questions before responding
    const prepared = await dedupeAndAugment(
      quiz.questions.map(q => ({ question: q.question, options: q.options })),
      courseId,
      topicId,
      quiz.difficulty_level || (levelId === 'beginner' ? 2 : levelId === 'intermediate' ? 3 : 4),
      10
    );

    console.log(`✅ Quiz found: "${quiz.title}" prepared ${prepared.length} unique questions`);
    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        course_id: quiz.course_id,
        level_id: quiz.level_id,
        topic_id: quiz.topic_id,
        title: quiz.title,
        description: quiz.description,
        questions: prepared.map((q, idx) => ({ id: idx, question: q.question, options: q.options })),
        estimated_time: quiz.estimated_time,
        difficulty_level: quiz.difficulty_level,
        passing_score: quiz.passing_score,
        max_attempts: quiz.max_attempts,
        total_questions: prepared.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz',
      error: error.message
    });
  }
});

// New route for direct topic access (for TopicSelection component)
router.get('/topic/:courseId/:topicId', async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    console.log(`🔍 Direct topic quiz request: ${courseId}/${topicId}`);

    // Load quiz data directly from JSON file
    const quizDataPath = path.join(__dirname, '..', 'comprehensive_quiz_data.json');

    if (!fs.existsSync(quizDataPath)) {
      console.log(`❌ Quiz data file not found: ${quizDataPath}`);
      return res.status(404).json({
        success: false,
        message: 'Quiz data file not found'
      });
    }

    const quizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));

    // Search for the topic across all levels
    let foundQuiz = null;
    let foundLevel = null;

    if (quizData[courseId]) {
      // Check all levels (beginner, intermediate, advanced)
      for (const [levelKey, levelData] of Object.entries(quizData[courseId])) {
        if (levelData[topicId]) {
          foundQuiz = levelData[topicId];
          foundLevel = levelKey;
          break;
        }
      }
    }

    if (!foundQuiz) {
      console.log(`⚙️ No static quiz found for ${courseId}/${topicId}. Falling back to ML generation...`);

      // Heuristic difficulty: default 2; boost if topic contains advanced keywords
      const difficulty = /advanced|oop|decorator|async|performance|concurrency|patterns/i.test(topicId) ? 4 : 2;

      // Generate using ML service (simulated if no API key)
      const generated = await mlService.generateQuizQuestions(courseId, topicId, difficulty, null, 10);
      if (!generated || !generated.success || !generated.questions?.length) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate quiz for this topic'
        });
      }

      // Validate generated questions for quality
      let validation = null;
      try {
        validation = await mlService.validateQuizQuestions(generated.questions, courseId, topicId);
      } catch (e) {
        console.warn('⚠️ Validation failed for generated quiz:', e.message);
      }

      // Persist as a QuizTemplate for caching (best-effort, only if Mongo is connected)
      if (isMongoConnected()) {
        try {
          const level_id = difficulty <= 2 ? 'beginner' : difficulty <= 3 ? 'intermediate' : 'advanced';
          const quizDoc = new QuizTemplate({
            course_id: courseId,
            level_id,
            topic_id: topicId,
            title: `${topicId.replace(/-/g, ' ')} Quiz`,
            description: `Auto-generated quiz for ${topicId.replace(/-/g, ' ')} (${courseId})`,
            questions: generated.questions.map(q => ({
              question: q.question,
              options: q.options,
              correct_answer: q.options.indexOf(q.answer),
              explanation: q.explanation || `The correct answer is ${q.answer}`
            })),
            estimated_time: Math.ceil(generated.questions.length * 1.5),
            difficulty_level: difficulty
          });
          await quizDoc.save().catch(err => {
            // Unique index clashes may happen for same (course, level, topic)
            console.warn('⚠️ Skipping quiz save (may already exist):', err.message);
          });
        } catch (e) {
          console.warn('⚠️ Failed to cache generated quiz:', e.message);
        }
      }

      return res.json({
        success: true,
        questions: generated.questions.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.answer
        })),
        title: `${topicId.replace(/-/g, ' ')} Quiz`,
        topic: topicId,
        level: difficulty <= 2 ? 'beginner' : difficulty <= 3 ? 'intermediate' : 'advanced',
        course: courseId,
        validation
      });
    }

    console.log(`✅ Topic quiz found: "${foundQuiz.topic}" with ${foundQuiz.questions.length} questions`);
    res.json({
      success: true,
      questions: foundQuiz.questions,
      title: `${foundQuiz.topic} Quiz`,
      topic: foundQuiz.topic,
      level: foundLevel,
      course: foundQuiz.course
    });
  } catch (error) {
    console.error('❌ Error fetching topic quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz',
      error: error.message
    });
  }
});

// Check Answer Route
router.post('/check-answer', async (req, res) => {
  try {
    const { quizId, questionIndex, answerIndex } = req.body;

    const quiz = await QuizTemplate.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const result = quiz.checkAnswer(questionIndex, answerIndex);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Error checking answer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking answer',
      error: error.message
    });
  }
});

// Get Quiz Statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await QuizTemplate.getQuizStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching quiz stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz statistics',
      error: error.message
    });
  }
});

// Get All Quizzes for a Course and Level
router.get('/course/:courseId/level/:levelId', async (req, res) => {
  try {
    const { courseId, levelId } = req.params;
    // Short-circuit when Mongo is offline
    if (!isMongoConnected()) {
      return res.json({ success: true, quizzes: [] });
    }

    const quizzes = await QuizTemplate.findByCourseAndLevel(courseId, levelId);
    res.json({
      success: true,
      quizzes: quizzes.map(quiz => ({
        topic_id: quiz.topic_id,
        title: quiz.title,
        description: quiz.description,
        estimated_time: quiz.estimated_time,
        difficulty_level: quiz.difficulty_level,
        total_questions: quiz.questions.length
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching course quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course quizzes',
      error: error.message
    });
  }
});

module.exports = router;
