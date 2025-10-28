const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  levelId: {
    type: String,
    required: true
  },
  attempts: [{
    scorePct: {
      type: Number,
      min: 0,
      max: 100
    },
    ts: {
      type: Number,
      required: true
    },
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean
    }],
    timeSpent: Number, // in seconds
    completedAt: Date
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  totalTimeSpent: {
    type: Number,
    default: 0 // in seconds
  }
}, {
  collection: 'progress',
  timestamps: true
});

// Compound index for efficient queries
progressSchema.index({ userId: 1, courseId: 1, topicId: 1 });

// Static method to get user progress for a course
progressSchema.statics.getUserCourseProgress = function(userId, courseId) {
  return this.find({ userId, courseId }).sort({ lastAccessed: -1 });
};

// Static method to get overall user stats
progressSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        completedQuizzes: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        totalAttempts: { $sum: { $size: '$attempts' } },
        averageScore: { $avg: { $avg: '$attempts.scorePct' } },
        totalTimeSpent: { $sum: '$totalTimeSpent' }
      }
    }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema);
