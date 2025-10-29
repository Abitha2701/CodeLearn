import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { LEARNING_PATHS } from "../data/learningPaths";
import { COMPREHENSIVE_COURSES } from "../data/comprehensiveCourses";
import { useProgress } from "../hooks/useProgress";
import { perfScore } from "./logic";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import "./Quiz.css";
import BackButton from "../components/BackButton";

export default function Quiz() {
  const { courseId, itemId } = useParams();
  const { state } = useLocation();
  const name = state?.name || "Learner";
  const email = state?.email || "guest@example.com";
  const adaptiveStepId = state?.mlAdaptiveStepId || null;
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [expandAllValidation, setExpandAllValidation] = useState(true);

  const course = LEARNING_PATHS[courseId] || null;
  const comprehensiveCourse = COMPREHENSIVE_COURSES[courseId] || null;

  // ✅ Always call hook, even if course/item invalid
  const { updateMastery, addAttempt, toggleDone } = useProgress(email, courseId);

  // Helper: slugify a topic to match backend JSON keys
  const slugify = (str) =>
    (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Parse item ID to extract level and topic information (course-agnostic)
  const parseItemId = (itemId) => {
    if (itemId.includes('-quiz')) {
      // Try to detect explicit level keys
      const levelKeys = ['beginner', 'intermediate', 'advanced'];
      const matchedLevel = levelKeys.find(lvl => itemId.includes(lvl));
      let levelId = matchedLevel || null;

      // Derive topic: prefer first topic of the level for the selected course
      let topicId = null;
      if (levelId && comprehensiveCourse?.levels?.[levelId]?.topics?.length) {
        topicId = slugify(comprehensiveCourse.levels[levelId].topics[0]);
      } else {
        // If level not present in id, try to pull a generic topic name from id
        const base = itemId.replace('-quiz', '');
        // remove course id prefix if present
        const baseNoCourse = base.replace(`${courseId}-`, '');
        // Map common tokens to level
        if (/fundamentals|basics|intro/i.test(baseNoCourse)) {
          levelId = 'beginner';
        } else if (/intermediate|core|advanced-basics/i.test(baseNoCourse)) {
          levelId = 'intermediate';
        } else if (/advanced|expert|pro/i.test(baseNoCourse)) {
          levelId = 'advanced';
        }

        if (levelId && comprehensiveCourse?.levels?.[levelId]?.topics?.length) {
          topicId = slugify(comprehensiveCourse.levels[levelId].topics[0]);
        } else {
          topicId = slugify(baseNoCourse);
        }
        // As a final fallback, use first topic from beginner
        if (!topicId && comprehensiveCourse?.levels?.beginner?.topics?.length) {
          levelId = 'beginner';
          topicId = slugify(comprehensiveCourse.levels.beginner.topics[0]);
        }
      }

      // Ensure levelId has a sensible default
      if (!levelId) levelId = 'beginner';

      return { levelId, topicId, isQuiz: true };
    }
    return { levelId: null, topicId: null, isQuiz: false };
  };

  const { levelId, topicId, isQuiz } = parseItemId(itemId);

  // ---------- Local quiz cache & generator (fallback when backend unavailable) ----------
  const cacheKey = (key) => `quiz_cache::${courseId}::${key}`;
  const readCache = (key) => {
    try {
      const raw = localStorage.getItem(cacheKey(key));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // 7 days TTL
      if (Date.now() - (parsed.ts || 0) > 7 * 24 * 60 * 60 * 1000) return null;
      return parsed.data || null;
    } catch { return null; }
  };
  const writeCache = (key, data) => {
    try { localStorage.setItem(cacheKey(key), JSON.stringify({ ts: Date.now(), data })); } catch {}
  };

  const buildTopicIndex = (courseDef) => {
    const index = {};
    if (!courseDef?.levels) return index;
    for (const [lvlKey, lvl] of Object.entries(courseDef.levels)) {
      (lvl.topics || []).forEach((t) => {
        const slug = (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        index[slug] = { levelKey: lvlKey, title: t };
      });
    }
    return index;
  };

  const generateLocalQuiz = (courseKey, inferredLevelId, inferredTopicId) => {
    const courseDef = COMPREHENSIVE_COURSES[courseKey];
    if (!courseDef?.levels) return null;

    const topicIndex = buildTopicIndex(courseDef);
    let lvlKey = inferredLevelId || null;
    if (!lvlKey && inferredTopicId && topicIndex[inferredTopicId]) {
      lvlKey = topicIndex[inferredTopicId].levelKey;
    }
    if (!lvlKey) lvlKey = 'beginner';

    const level = courseDef.levels[lvlKey];
    const allTopics = [...(level?.topics || [])];
    if (allTopics.length === 0) return null;

    // Choose up to 10 topics to form MCQs
    const chosen = allTopics.slice(0, Math.min(10, allTopics.length));
    const toSlug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const q = chosen.map((topicTitle, idx) => {
      const correct = topicTitle;
      // Distractors: pick 3 other topics from pool
      const pool = allTopics.filter((t) => t !== topicTitle);
      const distractors = pool.slice(0, 3);
      const options = [correct, ...distractors].slice(0, 4);
      // Shuffle a bit (deterministic light shuffle)
      const shuffled = options.sort((a, b) => toSlug(a) > toSlug(b) ? 1 : -1);
      return {
        id: idx,
        question: `Which of the following best relates to: "${topicTitle}"?`,
        options: shuffled,
        correctAnswer: correct
      };
    });

    return {
      id: `${courseKey}-${lvlKey}-${inferredTopicId || 'auto'}`,
      title: `${courseDef.title} ${level?.title || ''} Quiz`.trim(),
      description: `Auto-generated practice quiz for ${courseDef.title} (${level?.title || 'Level'})`,
      questions: q,
      total_questions: q.length,
      estimated_time: Math.ceil(q.length * 1.2)
    };
  };

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

  // Helper to normalize various quiz payload formats to UI format
  const normalizeQuiz = (payload) => {
    if (!payload) return null;
    // If already in expected format
    if (payload.questions && payload.questions.length > 0 && payload.questions[0].question) {
      return {
        id: payload.id || payload._id || itemId,
        title: payload.title || "Quiz",
        description: payload.description || "",
        questions: payload.questions.map((q, index) => ({
          id: q.id ?? index,
          question: q.question || q.question_text,
          options: q.options,
          correctAnswer: q.correctAnswer || (typeof q.correct_answer === 'number' ? q.options[q.correct_answer] : q.answer)
        })),
        total_questions: payload.total_questions || payload.questions.length,
        estimated_time: payload.estimated_time || Math.ceil((payload.questions.length || 5) * 1.5)
      };
    }
    return null;
  };

  // Fetch quiz data from backend (with local fallback and caching)
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching quiz for itemId: ${itemId}`);
        
        // Use cache first if present for this route key
        const routeKey = itemId;
        const cached = readCache(routeKey);
        if (cached) {
          setQuiz(cached);
          return;
        }
        
        // Adaptive ML quiz flow when coming from personalized path
        if (adaptiveStepId) {
          if (!isAuthenticated || !token) {
            throw new Error('Login required for adaptive quiz');
          }
          const resp = await apiFetch(`/api/ml-quiz/adaptive/${courseId}/${adaptiveStepId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!resp.ok) {
            const msg = await resp.text();
            throw new Error(msg || 'Failed to load adaptive quiz');
          }
          const data = await resp.json();
          const formatted = normalizeQuiz(data.quiz) || data.quiz || null;
          if (!formatted) throw new Error('Invalid adaptive quiz format');
          setQuiz(formatted);
          writeCache(routeKey, formatted);
          return;
        }
        
        // Check if itemId is a direct topic ID (doesn't contain '-quiz')
        if (!itemId.includes('-quiz')) {
          // Direct topic ID - use new API endpoint
          const response = await apiFetch(`/api/quizzes/topic/${courseId}/${itemId}`);
          
          if (!response.ok) {
            // Fallback to local generation
            const local = generateLocalQuiz(courseId, null, itemId);
            if (local) {
              setQuiz(local);
              writeCache(routeKey, local);
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Quiz API Response:', data);
          
          if (data.success && data.questions) {
            console.log(`Setting quiz with ${data.questions.length} questions`);
            const built = {
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
            };
            setQuiz(built);
            writeCache(routeKey, built);
          } else {
            console.error('Quiz data validation failed:', data);
            // Fallback to local generation
            const local = generateLocalQuiz(courseId, null, itemId);
            if (local) {
              setQuiz(local);
              writeCache(routeKey, local);
              return;
            }
            throw new Error(data.message || 'Quiz not found');
          }
        } else {
          // Legacy quiz format - use existing logic
          if (!isQuiz || !levelId || !topicId) {
            setLoading(false);
            return;
          }

          console.log(`Fetching quiz for: ${courseId}/${levelId}/${topicId}`);
          
          const response = await apiFetch(
            `/api/quiz/templates/${courseId}/${levelId}/${topicId}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.quiz) {
              const quizData = data.quiz;
              setQuiz(quizData);
              writeCache(routeKey, quizData);
              return;
            }
          }

          // If legacy template not found, try direct topic route (ML fallback + cache)
          const fallbackResp = await apiFetch(`/api/quizzes/topic/${courseId}/${topicId}`);
          if (fallbackResp.ok) {
            const fb = await fallbackResp.json();
            if (fb.success && fb.questions?.length) {
              const built = {
                id: `${courseId}-${topicId}`,
                title: fb.title || `${topicId.replace(/-/g, ' ')} Quiz`,
                description: `Test your knowledge of ${fb.topic}`,
                questions: fb.questions.map((q, index) => ({
                  id: index,
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.answer
                })),
                total_questions: fb.questions.length,
                estimated_time: Math.ceil(fb.questions.length * 1.5)
              };
              setQuiz(built);
              writeCache(routeKey, built);
              return;
            }
          }

          // Final fallback: local generation based on course catalog
          const local = generateLocalQuiz(courseId, levelId, topicId);
          if (local) {
            setQuiz(local);
            writeCache(routeKey, local);
            return;
          }
          throw new Error('Quiz not found in templates or ML fallback');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        console.log('Error details:', { courseId, itemId, error: error.message });
        // Last resort: try local generation once more with minimal context
        const local = generateLocalQuiz(courseId, levelId, topicId || itemId);
        if (local) {
          setQuiz(local);
          writeCache(itemId, local);
          setError(null);
        } else {
          // As a last resort, present an empty state
          setQuiz(null);
          setError(`Failed to load quiz: ${error.message}`);
        }
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
  const handleSubmitQuiz = async () => {
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

    // If this was an adaptive step and user did well (>= 80%), auto-advance to next step
    try {
      if (adaptiveStepId && isAuthenticated && token && scorePct >= 80) {
        // Mark step complete in learning path
        await apiFetch(`/api/learning-paths/${courseId}/complete-step`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ stepId: adaptiveStepId, score: scorePct, timeSpent: timeTaken })
        }).catch(() => {});

        // Fetch next step
        const nextRes = await apiFetch(`/api/learning-paths/${courseId}/next-step`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const nextData = await nextRes.json().catch(() => ({}));
        const next = nextData?.nextStep || null;
        if (next) {
          if (next.type === 'quiz') {
            // Route to next adaptive quiz step
            navigate(`/course/${courseId}/quiz/${(next.topics && next.topics[0]) || 'quiz'}`, {
              state: { name, email, mlAdaptiveStepId: next.stepId }
            });
            return;
          } else {
            // For lesson/reading/video, go back to course; user can continue
            navigate(`/course/${courseId}`, { state: { name, email } });
            return;
          }
        }
      } else if (adaptiveStepId && isAuthenticated && token && scorePct < 80) {
        // Below threshold: request backend to adapt/ease the path and notify user
        try {
          await apiFetch(`/api/learning-paths/${courseId}/adapt-step`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stepId: adaptiveStepId, score: scorePct, timeSpent: timeTaken })
          });
        } catch {}
        // Inform the learner and keep them on results; they can continue or retake
        alert('We adjusted your learning path to better fit your pace. Try the next step when ready.');
      }
    } catch (e) {
      // Non-fatal: keep user on results screen
      console.warn('[Quiz] Auto-advance failed:', e?.message);
    }

    // Trigger ML validation for per-question feedback when results are shown
    try {
      setValidating(true);
      const payloadQuestions = quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        answer: q.correctAnswer || null
      }));
      const resp = await apiFetch('/api/ml-quiz/validate-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, topicId: item?.topic || topicId, questions: payloadQuestions })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) setValidation(data.validation);
      }
    } catch (e) {
      console.warn('[Quiz] Validation fetch failed:', e?.message);
    } finally {
      setValidating(false);
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
                setValidation(null);
              }} 
              className="btn btn-secondary"
            >
              🔄 Retake Quiz
            </button>
          </div>

          {/* ML Validation Feedback */}
          <div className="ml-validation-panel" style={{ marginTop: 24 }}>
            <div className="ml-val-header">
              <div className="ml-val-title">
                <span className="ml-icon">🧠</span>
                <h3>ML Validation</h3>
                {validation && (
                  <span className={`ml-val-badge ${Math.round((validation.overallScore || 0) * 100) >= 80 ? 'ok' : 'warn'}`}>
                    {Math.round((validation.overallScore || 0) * 100)}%
                  </span>
                )}
              </div>
              <div className="ml-val-controls">
                <label className="toggle">
                  <input type="checkbox" checked={showValidation} onChange={(e) => setShowValidation(e.target.checked)} />
                  <span>Show</span>
                </label>
                <label className="toggle">
                  <input type="checkbox" checked={showOnlyIssues} onChange={(e) => setShowOnlyIssues(e.target.checked)} />
                  <span>Only issues</span>
                </label>
                <button
                  className="ml-val-btn"
                  onClick={() => setExpandAllValidation(v => !v)}
                >{expandAllValidation ? 'Collapse all' : 'Expand all'}</button>
              </div>
            </div>

            {showValidation && (
              <div className="ml-val-content">
                {validating && <div className="ml-val-loading">Validating questions…</div>}
                {validation && (
                  <>
                    <div className="ml-val-summary">
                      <div className="ml-val-stat">
                        <span className="label">Overall</span>
                        <div className="progress"><div className="bar" style={{ width: `${Math.round((validation.overallScore || 0) * 100)}%` }} /></div>
                      </div>
                      <div className="ml-val-stat">
                        <span className="label">Valid</span>
                        <span className="value">{validation.validQuestions}/{validation.totalQuestions}</span>
                      </div>
                    </div>

                    <ul className="ml-val-list">
                      {validation.results?.filter((r) => !showOnlyIssues || !r.isValid).map((r, idx) => {
                        const valid = !!r.isValid;
                        const conf = Math.round((r.confidence || 0) * 100);
                        return (
                          <li key={idx} className={`ml-val-item ${valid ? 'valid' : 'invalid'}`}>
                            <div className="ml-val-item-head">
                              <div className="left">
                                <span className={`pill ${valid ? 'ok' : 'warn'}`}>{valid ? 'Valid' : 'Needs review'}</span>
                                <span className="qid">Q{(r.questionId ?? idx) + 1}</span>
                                <span className="qtext">{quiz.questions[idx]?.question}</span>
                              </div>
                              <div className="right">
                                <span className="confidence">{conf}%</span>
                                <div className="confidence-meter" aria-label={`Confidence ${conf}%`}>
                                  <div className="confidence-bar" style={{ width: `${conf}%` }} />
                                </div>
                              </div>
                            </div>
                            {expandAllValidation && (
                              <div className="ml-val-item-body">
                                {r.feedback && <div className="row"><strong>Feedback:</strong> <span>{r.feedback}</span></div>}
                                {Array.isArray(r.suggestions) && r.suggestions.length > 0 && (
                                  <div className="row"><strong>Suggestions:</strong> <span>{r.suggestions.join('; ')}</span></div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            )}
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
        <BackButton onClick={backToCourse} fallbackTo="/dashboard" showHome={true} homeTo="/dashboard" />
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
          className="btn nav-btn"
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
            className="btn submit-btn"
          >
            Submit Quiz 🚀
          </button>
        ) : (
          <button 
            onClick={nextQuestion}
            className="btn nav-btn"
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
