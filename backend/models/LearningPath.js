const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Schema for individual learning path steps
const LearningStepSchema = new mongoose.Schema({
  stepId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lesson', 'quiz', 'project', 'video', 'reading'],
    required: true
  },
  content: {
    description: String,
    videoUrl: String,
    readingMaterial: String,
    practiceExercises: [String],
    estimatedTime: Number // in minutes
  },
  prerequisites: [{
    type: String // stepIds that must be completed first
  }],
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  topics: [String], // topics covered in this step
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  score: Number, // for quizzes and assessments
  timeSpent: Number // actual time spent in minutes
});

// Schema for personalized learning paths
const LearningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  pathName: {
    type: String,
    required: true
  },
  description: String,
  
  // User's learning preferences and goals
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
    default: 'visual'
  },
  pace: {
    type: String,
    enum: ['slow', 'medium', 'fast'],
    default: 'medium'
  },
  goals: [String], // e.g., ['job-ready', 'certification', 'hobby']
  availableTimePerWeek: Number, // hours per week
  
  // Adaptive path configuration
  steps: [LearningStepSchema],
  currentStepIndex: {
    type: Number,
    default: 0
  },
  
  // Progress tracking
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedSteps: {
    type: Number,
    default: 0
  },
  totalSteps: {
    type: Number,
    default: 0
  },
  
  // Performance metrics for ML adaptation
  performanceMetrics: {
    averageQuizScore: {
      type: Number,
      default: 0
    },
    averageTimePerStep: {
      type: Number,
      default: 0
    },
    strugglingTopics: [String],
    strongTopics: [String],
    preferredContentTypes: [String]
  },
  
  // ML-driven recommendations
  recommendations: [{
    type: {
      type: String,
      enum: ['additional_practice', 'skip_ahead', 'review_topic', 'change_pace', 'different_content_type']
    },
    message: String,
    stepId: String,
    confidence: Number, // ML confidence score
    createdAt: {
      type: Date,
      default: Date.now
    },
    applied: {
      type: Boolean,
      default: false
    }
  }],
  
  // Path adaptation history
  adaptations: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String,
    changes: mongoose.Schema.Types.Mixed,
    mlModel: String // which ML model made the recommendation
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
LearningPathSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods for learning path management
LearningPathSchema.methods.updateProgress = function() {
  this.completedSteps = this.steps.filter(step => step.isCompleted).length;
  this.totalSteps = this.steps.length;
  this.overallProgress = this.totalSteps > 0 ? Math.round((this.completedSteps / this.totalSteps) * 100) : 0;
  
  // Update performance metrics
  const completedQuizzes = this.steps.filter(step => step.type === 'quiz' && step.isCompleted && step.score);
  if (completedQuizzes.length > 0) {
    this.performanceMetrics.averageQuizScore = completedQuizzes.reduce((sum, step) => sum + step.score, 0) / completedQuizzes.length;
  }
  
  const completedStepsWithTime = this.steps.filter(step => step.isCompleted && step.timeSpent);
  if (completedStepsWithTime.length > 0) {
    this.performanceMetrics.averageTimePerStep = completedStepsWithTime.reduce((sum, step) => sum + step.timeSpent, 0) / completedStepsWithTime.length;
  }
};

LearningPathSchema.methods.completeStep = function(stepId, score = null, timeSpent = null) {
  const step = this.steps.find(s => s.stepId === stepId);
  if (step) {
    step.isCompleted = true;
    step.completedAt = new Date();
    if (score !== null) step.score = score;
    if (timeSpent !== null) step.timeSpent = timeSpent;
    
    // Move to next step if current
    if (this.steps[this.currentStepIndex] && this.steps[this.currentStepIndex].stepId === stepId) {
      this.currentStepIndex = Math.min(this.currentStepIndex + 1, this.steps.length - 1);
    }
    
    this.updateProgress();
  }
};

LearningPathSchema.methods.getNextStep = function() {
  if (this.currentStepIndex < this.steps.length) {
    return this.steps[this.currentStepIndex];
  }
  return null;
};

LearningPathSchema.methods.getAvailableSteps = function() {
  return this.steps.filter(step => {
    if (step.isCompleted) return false;
    
    // Check if all prerequisites are completed
    if (step.prerequisites && step.prerequisites.length > 0) {
      return step.prerequisites.every(prereqId => {
        const prereqStep = this.steps.find(s => s.stepId === prereqId);
        return prereqStep && prereqStep.isCompleted;
      });
    }
    
    return true;
  });
};

// Static methods for ML integration
LearningPathSchema.statics.generatePersonalizedPath = async function(userId, courseId, userPreferences, performanceHistory = null) {
  // This will be enhanced with ML model integration
  // For now, create a basic adaptive path based on preferences
  
  const basePath = await this.getBaseCourseStructure(courseId);
  const personalizedSteps = await this.adaptPathForUser(basePath, userPreferences, performanceHistory);
  
  return new this({
    userId,
    courseId,
    pathName: `Personalized ${courseId} Learning Path`,
    description: `Customized learning path based on your preferences and goals`,
    learningStyle: userPreferences.learningStyle || 'visual',
    pace: userPreferences.pace || 'medium',
    goals: userPreferences.goals || [],
    availableTimePerWeek: userPreferences.availableTimePerWeek || 5,
    steps: personalizedSteps,
    totalSteps: personalizedSteps.length
  });
};

LearningPathSchema.statics.getBaseCourseStructure = async function(courseId) {
  try {
    const quizDataPath = path.join(__dirname, '..', 'comprehensive_quiz_data.json');
    if (!fs.existsSync(quizDataPath)) {
      return [];
    }
    const quizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));
    const courseData = quizData[courseId];
    if (!courseData) {
      // Fallback: minimal generic path so users don't get 0 steps
      const generic = [
        {
          stepId: `${courseId}-intro-lesson`,
          title: `Introduction to ${courseId} - Lesson`,
          type: 'lesson',
          content: { description: `Overview and setup for ${courseId}`, estimatedTime: 20 },
          prerequisites: [],
          difficulty: 1,
          topics: ['introduction']
        },
        {
          stepId: `${courseId}-basics-lesson`,
          title: `${courseId} Fundamentals - Lesson`,
          type: 'lesson',
          content: { description: `Core concepts of ${courseId}`, estimatedTime: 30 },
          prerequisites: [`${courseId}-intro-lesson`],
          difficulty: 2,
          topics: ['fundamentals']
        },
        {
          stepId: `${courseId}-basics-quiz`,
          title: `${courseId} Fundamentals - Quiz`,
          type: 'quiz',
          content: { description: `Quiz for ${courseId} fundamentals`, estimatedTime: 12 },
          prerequisites: [`${courseId}-basics-lesson`],
          difficulty: 2,
          topics: ['fundamentals']
        }
      ];
      return generic;
    }

    const levelOrder = ['beginner', 'intermediate', 'advanced'];
    const steps = [];
    let prevStepId = null;

    levelOrder.forEach((levelKey) => {
      const levelTopics = courseData[levelKey];
      if (!levelTopics) return;
      Object.keys(levelTopics).forEach((topicId, index) => {
        const topicInfo = levelTopics[topicId];
        const topicName = topicInfo.topic || topicId.replace(/-/g, ' ');
        const lessonId = `${courseId}-${levelKey}-lesson-${topicId}`;
        const quizId = `${courseId}-${levelKey}-quiz-${topicId}`;

        // Lesson step derived from topic
        steps.push({
          stepId: lessonId,
          title: `${topicName} - Lesson`,
          type: 'lesson',
          content: {
            description: `Concepts and examples for ${topicName}`,
            estimatedTime: 25
          },
          prerequisites: prevStepId ? [prevStepId] : [],
          difficulty: levelKey === 'beginner' ? 1 : levelKey === 'intermediate' ? 2 : 3,
          topics: [topicId]
        });
        prevStepId = lessonId;

        // Quiz step for topic
        steps.push({
          stepId: quizId,
          title: `${topicName} - Quiz`,
          type: 'quiz',
          content: {
            description: `Quiz for ${topicName}`,
            estimatedTime: Math.min(Math.max((topicInfo.questions?.length || 5) * 1.5, 8), 20)
          },
          prerequisites: [lessonId],
          difficulty: levelKey === 'beginner' ? 2 : levelKey === 'intermediate' ? 3 : 4,
          topics: [topicId]
        });
        prevStepId = quizId;
      });
    });

    return steps;
  } catch (e) {
    console.error('Error building base course structure:', e.message);
    return [];
  }
};

LearningPathSchema.statics.adaptPathForUser = async function(basePath, userPreferences, performanceHistory) {
  // ML-driven path adaptation logic will be implemented here
  // For now, apply basic adaptations based on preferences
  
  let adaptedPath = [...basePath];
  
  // Adjust based on learning style
  if (userPreferences.learningStyle === 'visual') {
    // Add more visual content, diagrams, etc.
    adaptedPath = adaptedPath.map(step => ({
      ...step,
      content: {
        ...step.content,
        visualAids: true
      }
    }));
  }
  
  // Adjust based on pace
  if (userPreferences.pace === 'fast') {
    // Reduce estimated times, combine some steps
    adaptedPath = adaptedPath.map(step => ({
      ...step,
      content: {
        ...step.content,
        estimatedTime: Math.max(step.content.estimatedTime * 0.7, 10)
      }
    }));
  } else if (userPreferences.pace === 'slow') {
    // Increase estimated times, add more practice
    adaptedPath = adaptedPath.map(step => ({
      ...step,
      content: {
        ...step.content,
        estimatedTime: step.content.estimatedTime * 1.3,
        additionalPractice: true
      }
    }));
  }
  
  return adaptedPath;
};

module.exports = mongoose.model('LearningPath', LearningPathSchema);
