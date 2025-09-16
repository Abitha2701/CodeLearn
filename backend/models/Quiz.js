const mongoose = require('mongoose');

const QuizTemplateSchema = new mongoose.Schema({
  course_id: {
    type: String,
    required: true,
    index: true
  },
  level_id: {
    type: String,
    required: true,
    index: true
  },
  topic_id: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length >= 2 && v.length <= 6;
        },
        message: 'Questions must have between 2 and 6 options'
      }
    },
    correct_answer: {
      type: Number,
      required: true,
      validate: {
        validator: function(v) {
          return v >= 0 && v < this.options.length;
        },
        message: 'Correct answer index must be valid for the given options'
      }
    },
    explanation: {
      type: String,
      default: ''
    }
  }],
  estimated_time: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty_level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  passing_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 70
  },
  max_attempts: {
    type: Number,
    required: true,
    min: 1,
    default: 3
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient querying
QuizTemplateSchema.index({ course_id: 1, level_id: 1, topic_id: 1 }, { unique: true });

// Update the updated_at field before saving
QuizTemplateSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Instance method to get a formatted quiz for frontend
QuizTemplateSchema.methods.getFormattedQuiz = function() {
  return {
    id: this._id,
    course_id: this.course_id,
    level_id: this.level_id,
    topic_id: this.topic_id,
    title: this.title,
    description: this.description,
    questions: this.questions.map((q, index) => ({
      id: index,
      question: q.question,
      options: q.options,
      // Don't include correct_answer or explanation in quiz format
    })),
    estimated_time: this.estimated_time,
    difficulty_level: this.difficulty_level,
    passing_score: this.passing_score,
    max_attempts: this.max_attempts,
    total_questions: this.questions.length
  };
};

// Instance method to check an answer
QuizTemplateSchema.methods.checkAnswer = function(questionIndex, answerIndex) {
  if (questionIndex < 0 || questionIndex >= this.questions.length) {
    throw new Error('Invalid question index');
  }
  
  const question = this.questions[questionIndex];
  const isCorrect = question.correct_answer === answerIndex;
  
  return {
    correct: isCorrect,
    explanation: question.explanation || `The correct answer is: ${question.options[question.correct_answer]}`,
    correct_answer: question.correct_answer
  };
};

// Static method to find quiz by course, level, and topic
QuizTemplateSchema.statics.findByCourseLevelTopic = function(courseId, levelId, topicId) {
  return this.findOne({
    course_id: courseId,
    level_id: levelId,
    topic_id: topicId,
    is_active: true
  });
};

// Static method to get all quizzes for a course and level
QuizTemplateSchema.statics.findByCourseAndLevel = function(courseId, levelId) {
  return this.find({
    course_id: courseId,
    level_id: levelId,
    is_active: true
  }).sort({ topic_id: 1 });
};

// Static method to get quiz statistics
QuizTemplateSchema.statics.getQuizStats = function() {
  return this.aggregate([
    { $match: { is_active: true } },
    { 
      $group: {
        _id: { course_id: '$course_id', level_id: '$level_id' },
        quiz_count: { $sum: 1 },
        total_questions: { $sum: { $size: '$questions' } },
        avg_difficulty: { $avg: '$difficulty_level' },
        avg_time: { $avg: '$estimated_time' }
      }
    },
    {
      $group: {
        _id: '$_id.course_id',
        levels: {
          $push: {
            level_id: '$_id.level_id',
            quiz_count: '$quiz_count',
            total_questions: '$total_questions',
            avg_difficulty: '$avg_difficulty',
            avg_time: '$avg_time'
          }
        },
        total_quizzes: { $sum: '$quiz_count' },
        total_questions: { $sum: '$total_questions' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const QuizTemplate = mongoose.model('QuizTemplate', QuizTemplateSchema);

module.exports = {
  QuizTemplate,
  QuizTemplateSchema
};