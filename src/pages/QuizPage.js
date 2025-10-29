import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import './QuizPage.css'; // You'll need to create this CSS file

const QuestionResultItem = memo(function QuestionResultItem({ q, index, userAnswer, feedback, expanded, onToggle }) {
  const isCorrect = feedback?.isCorrect;
  return (
    <div className="question-result-item">
      <div className="question-result-header">
        <h3>{index + 1}. {q.questionText}</h3>
        <div className="question-result-actions">
          <span className={isCorrect ? 'answer-pill correct' : 'answer-pill incorrect'}>
            {isCorrect ? 'Correct' : (userAnswer ? 'Incorrect' : 'Unanswered')}
          </span>
          <button className="expand-toggle" onClick={onToggle} aria-expanded={!!expanded}>
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="question-result-body">
          <p><strong>Your Answer:</strong> {userAnswer || 'Not answered'}</p>
          {!isCorrect && feedback?.correctAnswer && (
            <p><strong>Correct Answer:</strong> {feedback.correctAnswer}</p>
          )}
          {feedback?.explanation && (
            <p><strong>Explanation:</strong> {feedback.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
});

const QuizPage = () => {
  const { courseId, levelKey } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { name, email, levelTitle, topics, courseTitle } = state || {};

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState(null); // null, 'loading', or actual results
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unanswered'
  const [expandedMap, setExpandedMap] = useState({}); // { [questionId]: boolean }

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual backend endpoint
        const response = await apiFetch('/api/quiz/generate', {
          method: 'POST', // Or GET with query params, depending on your API
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, levelKey, topics })
        });
        const data = await response.json();
        setQuestions(data.questions); // Assuming data.questions is an array of question objects
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        // Handle error: display message to user
      } finally {
        setIsLoading(false);
      }
    };

    if (topics && topics.length > 0) { // Only fetch if topics are available
      fetchQuestions();
    } else {
      // Handle case where topics aren't passed (e.g., direct URL access)
      navigate(`/course/${courseId}`); // Redirect back to course details
    }
  }, [courseId, levelKey, topics, navigate]);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    setResults('loading');
    try {
      const response = await apiFetch('/api/quiz/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, levelKey, userAnswers, questions: questions.map(q => q.id) }) // Send question IDs and answers
      });
      const data = await response.json();
      setResults(data); // Assuming data contains score, correct answers, explanations
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Handle error
      setResults(null); // Reset results state
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!results || !Array.isArray(questions)) return questions;
    if (filter === 'all') return questions;
    return questions.filter((q) => {
      const answered = Object.prototype.hasOwnProperty.call(userAnswers, q.id);
      const fb = results?.feedback?.[q.id];
      if (filter === 'unanswered') return !answered;
      if (!fb) return false;
      return filter === 'correct' ? fb.isCorrect : !fb.isCorrect && answered;
    });
  }, [results, questions, filter, userAnswers]);

  const toggleOne = useCallback((id) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const expandAll = useCallback(() => {
    const next = {};
    for (const q of filteredQuestions || []) next[q.id] = true;
    setExpandedMap(prev => ({ ...prev, ...next }));
  }, [filteredQuestions]);

  const collapseAll = useCallback(() => {
    const next = {};
    for (const q of filteredQuestions || []) next[q.id] = false;
    setExpandedMap(prev => ({ ...prev, ...next }));
  }, [filteredQuestions]);

  if (isLoading) {
    return (
      <div className="quiz-page">
        <p>Generating quiz questions for {levelTitle}...</p>
        {/* Add a spinner or loading animation */}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-page">
        <p>No questions could be generated for this level at the moment.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <header className="quiz-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="quiz-title">{courseTitle} - {levelTitle} Quiz</h1>
        <div className="quiz-brand">🧑‍💻 CodeLearn</div>
      </header>

      <main className="quiz-main">
        {results === 'loading' ? (
          <p>Submitting answers and validating...</p>
        ) : results ? (
          <div className="quiz-results">
            <h2>Quiz Results</h2>
            <p>Your Score: {results.score} / {questions.length}</p>

            <div className="quiz-review-controls">
              <div className="filters">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >All</button>
                <button
                  className={`filter-btn ${filter === 'correct' ? 'active' : ''}`}
                  onClick={() => setFilter('correct')}
                >Correct</button>
                <button
                  className={`filter-btn ${filter === 'incorrect' ? 'active' : ''}`}
                  onClick={() => setFilter('incorrect')}
                >Incorrect</button>
                <button
                  className={`filter-btn ${filter === 'unanswered' ? 'active' : ''}`}
                  onClick={() => setFilter('unanswered')}
                >Unanswered</button>
              </div>
              <div className="expand-controls">
                <button className="toggle-btn" onClick={expandAll}>Expand all</button>
                <button className="toggle-btn" onClick={collapseAll}>Collapse all</button>
              </div>
            </div>

            {filteredQuestions.map((q, index) => (
              <QuestionResultItem
                key={q.id}
                q={q}
                index={index}
                userAnswer={userAnswers[q.id]}
                feedback={results.feedback?.[q.id]}
                expanded={!!expandedMap[q.id]}
                onToggle={() => toggleOne(q.id)}
              />
            ))}

            <button className="go-back-btn" onClick={() => navigate(`/explore`, { state: { name, email } })}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="quiz-questions-container">
            {questions.map((q, index) => (
              <div key={q.id} className="question-card">
                <p className="question-text">{index + 1}. {q.questionText}</p>
                {q.type === 'mcq' && (
                  <div className="mcq-options">
                    {q.options.map((option, optIndex) => (
                      <label key={optIndex}>
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={option}
                          checked={userAnswers[q.id] === option}
                          onChange={() => handleAnswerChange(q.id, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'short_answer' && (
                  <textarea
                    value={userAnswers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                  />
                )}
                {/* Add other question types as needed */}
              </div>
            ))}
            <button className="submit-quiz-btn" onClick={handleSubmitQuiz} disabled={Object.keys(userAnswers).length === 0}>
              Submit Quiz
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;