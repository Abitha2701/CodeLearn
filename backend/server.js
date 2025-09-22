const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { QuizTemplate } = require('./models/Quiz');
const LearningPath = require('./models/LearningPath');
const mlService = require('./services/mlService');

// Import route modules
const learningPathRoutes = require('./routes/learningPath');
const mlQuizRoutes = require('./routes/mlQuiz');

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

 

const app = express();
app.use(cors());
app.use(express.json());
// Mount route modules
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/ml-quiz', mlQuizRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// List all topics for a course across levels (must be after app initialization)
app.get('/api/quizzes/topics/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizDataPath = path.join(__dirname, 'comprehensive_quiz_data.json');
    if (!fs.existsSync(quizDataPath)) {
      return res.status(404).json({ success: false, message: 'Quiz data file not found' });
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
app.post('/api/ml-quiz/validate-raw', async (req, res) => {
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

// Startup seeding (non-blocking). Seeds selected topics per course.
async function seedQuizzesOnStart() {
  const plan = {
    python: ['introduction-to-python', 'variables-and-data-types', 'functions-and-scope'],
    javascript: ['javascript-fundamentals', 'es6-features', 'async-await'],
    react: ['react-fundamentals', 'hooks-and-state', 'react-router'],
    vue: ['introduction-to-vue-js', 'vue-router', 'composition-api'],
    nodejs: ['nodejs-basics', 'express-and-apis', 'file-system'],
    java: ['java-basics', 'collections-framework', 'exception-handling'],
    html: ['introduction-to-html', 'html-elements', 'forms-and-input-elements'],
    angular: ['introduction-to-angular', 'routing', 'components-and-templates'],
    typescript: ['introduction-to-typescript', 'generics', 'advanced-types']
  };

  for (const [courseId, topics] of Object.entries(plan)) {
    for (const topicId of topics) {
      try {
        if (isMongoConnected()) {
          const existing = await QuizTemplate.findOne({ course_id: courseId, topic_id: topicId, is_active: true }).lean().catch(() => null);
          if (existing) continue;
        }
        const difficulty = 2;
        const generated = await mlService.generateQuizQuestions(courseId, topicId, difficulty, null, 10);
        if (!generated?.success || !generated.questions?.length) continue;
        if (isMongoConnected()) {
          const level_id = 'beginner';
          const quizDoc = new QuizTemplate({
            course_id: courseId,
            level_id,
            topic_id: topicId,
            title: `${topicId.replace(/-/g, ' ')} Quiz`,
            description: `Seeded quiz for ${topicId.replace(/-/g, ' ')} (${courseId})`,
            questions: generated.questions.map(q => ({ question: q.question, options: q.options, correct_answer: q.options.indexOf(q.answer), explanation: q.explanation || `The correct answer is ${q.answer}` })),
            estimated_time: Math.ceil(generated.questions.length * 1.5),
            difficulty_level: difficulty
          });
          await quizDoc.save().catch(() => {});
        }
        console.log(`🌱 Seeded quiz for ${courseId}/${topicId}`);
      } catch (e) {
        console.warn(`⚠️ Seed skipped for ${courseId}/${topicId}:`, e.message);
      }
    }
  }
}

// Kick off seeding shortly after server start
setTimeout(() => {
  seedQuizzesOnStart();
}, 1500);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Signup Route with Password Hashing
app.post('/api/signup', async (req, res) => {
  const { name, email, password, confirmPassword, preferredLanguages } = req.body;
  console.log('📦 Incoming Signup Data:', { name, email, preferredLanguages });

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      preferredLanguages 
    });
    
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ User signed up successfully:', email);
    res.status(201).json({ 
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguages: user.preferredLanguages
      }
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(400).json({ message: 'Signup failed', error: err.message });
  }
});

// ---- Helpers for quiz generation and Mongo health ----
function isMongoConnected() {
  // 1 = connected, 2 = connecting, 0 = disconnected, 3 = disconnecting
  try {
    return mongoose.connection && mongoose.connection.readyState === 1;
  } catch (e) {
    return false;
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

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
// Login Route with JWT
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt for:', email);

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ User logged in successfully:', email);
    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguages: user.preferredLanguages
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Protected Profile Route
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguages: user.preferredLanguages,
    });
  } catch (err) {
    console.error('❌ Profile fetch error:', err.message);
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// Logout Route (Token Blacklist - Simple Version)
app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
    console.log('🔒 User logged out:', req.user.email);
    // In a production app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('❌ Logout error:', err.message);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
});

// Verify Token Route
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.status(200).json({ 
    valid: true, 
    user: { 
      userId: req.user.userId, 
      email: req.user.email 
    } 
  });
});

// Quiz Routes
app.get('/api/quiz/templates/:courseId/:levelId/:topicId', async (req, res) => {
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
app.get('/api/quizzes/topic/:courseId/:topicId', async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    console.log(`🔍 Direct topic quiz request: ${courseId}/${topicId}`);
    
    // Load quiz data directly from JSON file
    const quizDataPath = path.join(__dirname, 'comprehensive_quiz_data.json');
    
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
app.post('/api/quiz/check-answer', async (req, res) => {
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
app.get('/api/quiz/stats', async (req, res) => {
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
app.get('/api/quiz/course/:courseId/level/:levelId', async (req, res) => {
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
