const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadQuizData() {
  const quizDataPath = path.join(__dirname, '..', 'comprehensive_quiz_data.json');
  if (!fs.existsSync(quizDataPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

// GET /api/topics/:courseId -> list of topics across levels
router.get('/:courseId', (req, res) => {
  const { courseId } = req.params;
  const data = loadQuizData();
  if (!data || !data[courseId]) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  const levelOrder = ['beginner', 'intermediate', 'advanced'];
  const topics = [];
  levelOrder.forEach(levelKey => {
    const levelData = data[courseId][levelKey];
    if (!levelData) return;
    Object.entries(levelData).forEach(([topicId, info]) => {
      topics.push({
        id: topicId,
        level: levelKey,
        title: info.topic || topicId.replace(/-/g, ' '),
        course: info.course || courseId,
        concepts: info.concepts || [],
        objectives: info.objectives || [],
      });
    });
  });
  res.json({ success: true, topics });
});

// GET /api/topics/:courseId/:topicId -> topic details
router.get('/:courseId/:topicId', (req, res) => {
  const { courseId, topicId } = req.params;
  const data = loadQuizData();
  if (!data || !data[courseId]) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  const levels = data[courseId];
  for (const [levelKey, levelData] of Object.entries(levels)) {
    if (levelData && levelData[topicId]) {
      const info = levelData[topicId];
      return res.json({
        success: true,
        topic: {
          id: topicId,
          level: levelKey,
          title: info.topic || topicId.replace(/-/g, ' '),
          course: info.course || courseId,
          concepts: info.concepts || [],
          objectives: info.objectives || [],
          questionsCount: Array.isArray(info.questions) ? info.questions.length : 0
        }
      });
    }
  }
  return res.status(404).json({ success: false, message: 'Topic not found' });
});

module.exports = router;
