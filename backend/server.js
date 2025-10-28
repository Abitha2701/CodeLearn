const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { QuizTemplate } = require('./models/Quiz');
const LearningPath = require('./models/LearningPath');
const mlService = require('./services/mlService');

// Import route modules
const learningPathRoutes = require('./routes/learningPath');
const mlQuizRoutes = require('./routes/mlQuiz');
const topicsRoutes = require('./routes/topics');
const videosRoutes = require('./routes/videos');
const progressRoutes = require('./routes/progress');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizzes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Mount route modules
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/ml-quiz', mlQuizRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api', authRoutes);
app.use('/api/quizzes', quizRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Atlas connection error:', err));

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

// Helper function to check MongoDB connection
function isMongoConnected() {
  try {
    return mongoose.connection && mongoose.connection.readyState === 1;
  } catch (e) {
    return false;
  }
}

// Kick off seeding shortly after server start
setTimeout(() => {
  seedQuizzesOnStart();
}, 1500);

// Global error handler (must be last)
app.use(errorHandler);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
