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

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

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
    
    const quiz = await QuizTemplate.findByCourseLevelTopic(courseId, levelId, topicId);
    
    if (!quiz) {
      console.log(`❌ Quiz not found for: ${courseId}/${levelId}/${topicId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not available for this topic',
        requestedPath: `${courseId}/${levelId}/${topicId}`
      });
    }
    
    console.log(`✅ Quiz found: "${quiz.title}" with ${quiz.questions.length} questions`);
    res.json({ 
      success: true, 
      quiz: quiz.getFormattedQuiz() 
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
      console.log(`❌ Quiz not found for topic: ${courseId}/${topicId}`);
      console.log(`Available topics in ${courseId}:`, Object.keys(quizData[courseId] || {}));
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not available for this topic',
        requestedTopic: topicId
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
