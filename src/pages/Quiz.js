import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { LEARNING_PATHS } from "../data/learningPaths";
import { COMPREHENSIVE_COURSES } from "../data/comprehensiveCourses";
import { useProgress } from "../hooks/useProgress";
import { perfScore } from "./logic";

export default function Quiz() {
  const { courseId, itemId } = useParams();
  const { state } = useLocation();
  const name = state?.name || "Learner";
  const email = state?.email || "guest@example.com";
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const course = LEARNING_PATHS[courseId] || null;
  const comprehensiveCourse = COMPREHENSIVE_COURSES[courseId] || null;

  // ✅ Always call hook, even if course/item invalid
  const { updateMastery, addAttempt, toggleDone } = useProgress(email, courseId);

  // Parse item ID to extract level and topic information
  const parseItemId = (itemId) => {
    if (itemId.includes('-quiz')) {
      const parts = itemId.split('-');
      let topicId = parts[parts.length - 2]; // Get the topic part
      let levelId = null;
      
      // Map topics to appropriate levels and convert to database format
      const topicToLevelMap = {
        'fundamentals': { levelId: 'beginner', topicId: 'introduction-to-python' },
        'collections': { levelId: 'beginner', topicId: 'data-structures' },
        'functions': { levelId: 'intermediate', topicId: 'functions-and-modules' },
        'classes': { levelId: 'intermediate', topicId: 'object-oriented-programming' },
        'advanced': { levelId: 'advanced', topicId: 'advanced-concepts' }
      };
      
      const mapping = topicToLevelMap[topicId];
      if (mapping) {
        levelId = mapping.levelId;
        topicId = mapping.topicId;
      } else {
        // If no mapping found, assume it's already in correct format
        levelId = topicId;
        topicId = topicId === 'beginner' ? 'introduction-to-python' : 
                 topicId === 'intermediate' ? 'functions-and-modules' :
                 'advanced-concepts';
      }
      
      return { levelId, topicId, isQuiz: true };
    }
    return { levelId: null, topicId: null, isQuiz: false };
  };

  const { levelId, topicId, isQuiz } = parseItemId(itemId);

  // Flatten items
  const allItems = course ? course.modules.flatMap((m) => m.items) : [];
  let item = allItems.find((i) => i.id === itemId);

  // If not found in learning paths, try comprehensive courses
  if (!item && comprehensiveCourse && isQuiz) {
    const level = comprehensiveCourse.levels[levelId];
    if (level) {
      item = {
        id: itemId,
        type: "quiz",
        title: `${level.title} Quiz`,
        topic: levelId,
        difficulty: levelId === 'beginner' ? 2 : levelId === 'intermediate' ? 3 : 4,
        estMins: 10
      };
    }
  }

  // If still not found and itemId doesn't contain '-quiz', it's a direct topic ID
  if (!item && !itemId.includes('-quiz')) {
    // Create a default item for direct topic access
    item = {
      id: itemId,
      type: "quiz",
      title: `${itemId.replace(/-/g, ' ')} Quiz`,
      topic: itemId,
      difficulty: 2,
      estMins: 10
    };
  }

  // Fetch quiz data from backend
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching quiz for itemId: ${itemId}`);
        
        // Check if itemId is a direct topic ID (doesn't contain '-quiz')
        if (!itemId.includes('-quiz')) {
          // Direct topic ID - use new API endpoint
          const response = await fetch(`http://localhost:5001/api/quizzes/topic/${courseId}/${itemId}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Quiz API Response:', data);
          
          if (data.success && data.questions) {
            console.log(`Setting quiz with ${data.questions.length} questions`);
            setQuiz({
              id: `${courseId}-${itemId}`,
              title: data.title || `${itemId.replace(/-/g, ' ')} Quiz`,
              description: `Test your knowledge of ${data.topic}`,
              questions: data.questions.map((q, index) => ({
                id: index,
                question: q.question,
                options: q.options,
                correctAnswer: q.answer
              })),
              total_questions: data.questions.length,
              estimated_time: Math.ceil(data.questions.length * 1.5) // 1.5 minutes per question
            });
          } else {
            console.error('Quiz data validation failed:', data);
            throw new Error(data.message || 'Quiz not found');
          }
        } else {
          // Legacy quiz format - use existing logic
          if (!isQuiz || !levelId || !topicId) {
            setLoading(false);
            return;
          }

          console.log(`Fetching quiz for: ${courseId}/${levelId}/${topicId}`);
          
          const response = await fetch(
            `http://localhost:5001/api/quiz/templates/${courseId}/${levelId}/${topicId}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.quiz) {
            setQuiz(data.quiz);
          } else {
            throw new Error(data.message || 'Quiz not found');
          }
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        console.log('Error details:', { courseId, itemId, error: error.message });
        // Create a fallback quiz for testing
        setQuiz({
          id: 'fallback-quiz',
          title: `${itemId.replace(/-/g, ' ')} Quiz`,
          description: `Test your knowledge of ${itemId.replace(/-/g, ' ')}`,
          questions: [
            {
              id: 0,
              question: `What is an important concept in ${itemId.replace(/-/g, ' ')}?`,
              options: [
                `Understanding ${courseId} basics`,
                `Advanced ${courseId} techniques`, 
                `Common ${courseId} mistakes`,
                `Best practices for ${courseId}`
              ],
              correctAnswer: `Understanding ${courseId} basics`
            },
            {
              id: 1,
              question: `Which approach is recommended for beginners?`,
              options: [
                'Start with advanced concepts',
                'Focus on fundamentals first',
                'Skip theoretical knowledge',
                'Only learn through videos'
              ],
              correctAnswer: 'Focus on fundamentals first'
            }
          ],
          total_questions: 2,
          estimated_time: 5
        });
        setError(`Failed to load quiz: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, itemId, levelId, topicId, isQuiz]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    const totalQuestions = quiz.questions.length;
    const correctAnswers = quiz.questions.filter((q, index) => {
      const userAnswer = answers[q.id];
      if (userAnswer === undefined) return false;
      
      // Check if the question has a correctAnswer field (new format) or use fallback logic
      if (q.correctAnswer) {
        return q.options[userAnswer] === q.correctAnswer;
      } else {
        // Fallback for legacy format - assume first option is correct
        return userAnswer === 0;
      }
    }).length;

    const scorePct = Math.round((correctAnswers / totalQuestions) * 100);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    setScore(scorePct);
    setShowResults(true);

    // Update progress
    const perf = perfScore({
      correct: scorePct >= 70,
      scorePct,
      timeSec: timeTaken,
      expectedTime: quiz.estimated_time * 60,
      hintsUsed: 0,
    });

    if (item) {
      updateMastery(item.topic, perf);
      addAttempt({
        itemId,
        topic: item.topic,
        difficulty: item.difficulty,
        correct: scorePct >= 70,
        scorePct,
        timeSec: timeTaken,
        hintsUsed: 0,
        ts: Date.now(),
      });
      toggleDone(itemId);
    }
  };

  // Navigation functions
  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const backToCourse = () => {
    navigate(`/course/${courseId}`, { state: { name, email } });
  };

  // ✅ Only render after hook calls
  if (!course && !comprehensiveCourse) return <div>❌ Course not found.</div>;
  if (!item) return <div>❌ Quiz item not found.</div>;
  if (item.type !== "quiz") return <div>⚠️ This item is not a quiz.</div>;

  if (loading) {
    return (
      <div className="quiz-page">
        <h1>📝 Loading Quiz...</h1>
        <div className="loading-spinner">🔄 Fetching questions...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-page">
        <h1>❌ Quiz Not Available</h1>
        <p>Sorry, this quiz is not available yet.</p>
        <button onClick={backToCourse} className="btn btn-primary">
          ← Back to Course
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="quiz-page">
        <div className="quiz-results">
          <h1>🎉 Quiz Complete!</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}%</span>
            </div>
          </div>
          <h2>{score >= 70 ? '✅ Passed!' : '❌ Try Again'}</h2>
          <p>
            You answered {Object.keys(answers).length} out of {quiz.questions.length} questions.
          </p>
          <div className="quiz-actions">
            <button onClick={backToCourse} className="btn btn-primary">
              ← Back to Course
            </button>
            <button 
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
              }} 
              className="btn btn-secondary"
            >
              🔄 Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const allAnswered = quiz.questions.every(q => answers.hasOwnProperty(q.id));

  return (
    <div className="quiz-page">
      {/* Quiz Header */}
      <div className="quiz-header">
        <button onClick={backToCourse} className="back-btn">← Back</button>
        <h1>📝 {quiz.title}</h1>
        <div className="quiz-progress">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Current Question */}
      <div className="question-container">
        <h2 className="question-text">{currentQ.question}</h2>
        
        <div className="options-container">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${answers[currentQ.id] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(currentQ.id, index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button 
          onClick={prevQuestion} 
          disabled={currentQuestion === 0}
          className="nav-btn"
        >
          ← Previous
        </button>
        
        <div className="question-indicators">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentQuestion ? 'active' : ''} ${answers.hasOwnProperty(quiz.questions[index].id) ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <button 
            onClick={handleSubmitQuiz}
            disabled={!allAnswered}
            className="submit-btn"
          >
            Submit Quiz 🚀
          </button>
        ) : (
          <button 
            onClick={nextQuestion}
            className="nav-btn"
          >
            Next →
          </button>
        )}
      </div>

      {/* Quiz Info */}
      <div className="quiz-info">
        <p>
          <strong>Topic:</strong> {item.topic} • 
          <strong> Difficulty:</strong> {item.difficulty}/5 • 
          <strong> Time:</strong> ~{quiz.estimated_time} minutes
        </p>
      </div>
    </div>
  );
}
