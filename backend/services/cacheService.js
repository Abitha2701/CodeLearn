const NodeCache = require('node-cache');

// Initialize cache with 5 minute default TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class CacheService {
  // Quiz data cache keys
  static QUIZ_TOPICS_KEY = 'quiz_topics';
  static QUIZ_DATA_KEY = 'quiz_data';
  static QUIZ_TEMPLATE_KEY = (courseId, levelId, topicId) => `quiz_template:${courseId}:${levelId}:${topicId}`;
  static TOPIC_QUIZ_KEY = (courseId, topicId) => `topic_quiz:${courseId}:${topicId}`;

  // User progress cache keys
  static USER_PROGRESS_KEY = (userId) => `user_progress:${userId}`;
  static COURSE_PROGRESS_KEY = (userId, courseId) => `course_progress:${userId}:${courseId}`;
  static USER_STATS_KEY = (userId) => `user_stats:${userId}`;

  // Cache quiz topics list
  static setQuizTopics(courseId, topics) {
    const key = `${this.QUIZ_TOPICS_KEY}:${courseId}`;
    cache.set(key, topics, 600); // 10 minutes for topics
    return topics;
  }

  static getQuizTopics(courseId) {
    const key = `${this.QUIZ_TOPICS_KEY}:${courseId}`;
    return cache.get(key);
  }

  // Cache quiz data (JSON file content)
  static setQuizData(data) {
    cache.set(this.QUIZ_DATA_KEY, data, 1800); // 30 minutes for quiz data
    return data;
  }

  static getQuizData() {
    return cache.get(this.QUIZ_DATA_KEY);
  }

  // Cache individual quiz templates
  static setQuizTemplate(courseId, levelId, topicId, quizData) {
    const key = this.QUIZ_TEMPLATE_KEY(courseId, levelId, topicId);
    cache.set(key, quizData, 900); // 15 minutes for templates
    return quizData;
  }

  static getQuizTemplate(courseId, levelId, topicId) {
    const key = this.QUIZ_TEMPLATE_KEY(courseId, levelId, topicId);
    return cache.get(key);
  }

  // Cache topic quizzes
  static setTopicQuiz(courseId, topicId, quizData) {
    const key = this.TOPIC_QUIZ_KEY(courseId, topicId);
    cache.set(key, quizData, 900); // 15 minutes for topic quizzes
    return quizData;
  }

  static getTopicQuiz(courseId, topicId) {
    const key = this.TOPIC_QUIZ_KEY(courseId, topicId);
    return cache.get(key);
  }

  // Cache user progress
  static setUserProgress(userId, progress) {
    const key = this.USER_PROGRESS_KEY(userId);
    cache.set(key, progress, 300); // 5 minutes for progress
    return progress;
  }

  static getUserProgress(userId) {
    const key = this.USER_PROGRESS_KEY(userId);
    return cache.get(key);
  }

  // Cache course progress
  static setCourseProgress(userId, courseId, progress) {
    const key = this.COURSE_PROGRESS_KEY(userId, courseId);
    cache.set(key, progress, 300); // 5 minutes for course progress
    return progress;
  }

  static getCourseProgress(userId, courseId) {
    const key = this.COURSE_PROGRESS_KEY(userId, courseId);
    return cache.get(key);
  }

  // Cache user statistics
  static setUserStats(userId, stats) {
    const key = this.USER_STATS_KEY(userId);
    cache.set(key, stats, 600); // 10 minutes for stats
    return stats;
  }

  static getUserStats(userId) {
    const key = this.USER_STATS_KEY(userId);
    return cache.get(key);
  }

  // Invalidate user progress cache when progress is updated
  static invalidateUserProgress(userId) {
    cache.del(this.USER_PROGRESS_KEY(userId));
    cache.del(this.USER_STATS_KEY(userId));
    // Also invalidate course progress (we'd need to know which courses, but for simplicity invalidate all)
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.startsWith(`course_progress:${userId}:`)) {
        cache.del(key);
      }
    });
  }

  // Invalidate quiz cache when quiz data is updated
  static invalidateQuizCache() {
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.startsWith('quiz_') || key.startsWith('topic_quiz:')) {
        cache.del(key);
      }
    });
  }

  // Get cache statistics
  static getStats() {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) || 0
    };
  }

  // Clear all cache
  static clear() {
    cache.flushAll();
  }

  // Health check
  static isHealthy() {
    try {
      cache.set('health_check', 'ok', 1);
      return cache.get('health_check') === 'ok';
    } catch (error) {
      return false;
    }
  }
}

module.exports = CacheService;
