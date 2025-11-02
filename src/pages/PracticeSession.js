import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import './PracticeSession.css';
import { useNotifications } from '../hooks/useNotifications';

const PracticeSession = () => {
  const { courseId, levelKey } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { name, email, levelTitle, practiceSessions } = state || {};
  const { notify } = useNotifications();

  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState('');

  const currentSession = practiceSessions[currentSessionIndex];
  const currentQuestion = currentSession?.questions?.[currentQuestionIndex];

  const goBack = () => {
    navigate(`/course-details/${courseId}`, { state: { name, email } });
  };

  const handleAnswerChange = (blankIndex, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [`${currentSessionIndex}-${currentQuestionIndex}-${blankIndex}`]: value
    }));
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    const isCorrect = currentQuestion.blanks.every((blank, index) => {
      const userAnswer = userAnswers[`${currentSessionIndex}-${currentQuestionIndex}-${index}`]?.trim();
      return userAnswer === blank.expected;
    });

    if (isCorrect) {
      setFeedback('✅ Correct! Well done.');
      notify.success('Correct answer!');
    } else {
      const correctAnswers = currentQuestion.blanks.map(blank => blank.expected).join(', ');
      setFeedback(`❌ Incorrect. The correct answer(s) are: ${correctAnswers}`);
      notify.error('Incorrect answer. Check the feedback below.');
    }

    setShowResults(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (currentSession.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowResults(false);
      setFeedback('');
    } else if (currentSessionIndex < practiceSessions.length - 1) {
      setCurrentSessionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setFeedback('');
      setUserAnswers({});
    } else {
      // All sessions completed
      notify.success('Congratulations! You have completed all practice sessions.');
      goBack();
    }
  };

  const renderCodeTemplate = () => {
    if (!currentQuestion) return null;

    const template = currentQuestion.codeTemplate;
    const parts = template.split(/(___\s*)/);

    return parts.map((part, index) => {
      if (part.includes('___')) {
        const blankIndex = Math.floor(index / 2);
        const blank = currentQuestion.blanks[blankIndex];
        if (blank) {
          return (
            <input
              key={index}
              type="text"
              className="code-blank"
              placeholder="___"
              value={userAnswers[`${currentSessionIndex}-${currentQuestionIndex}-${blankIndex}`] || ''}
              onChange={(e) => handleAnswerChange(blankIndex, e.target.value)}
              disabled={showResults}
            />
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!practiceSessions || practiceSessions.length === 0) {
    return (
      <div className="practice-session">
        <BackButton label="Back to Course" onClick={goBack} />
        <div className="practice-content">
          <h1>No Practice Sessions Available</h1>
          <p>This level doesn't have practice sessions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-session">
      <header className="practice-header">
        <BackButton label="Back to Course" onClick={goBack} />
        <div className="practice-brand">🧑‍💻 CodeLearn</div>
      </header>

      <main className="practice-main">
        <div className="practice-info">
          <h1>{levelTitle} - Practice Session</h1>
          <div className="session-progress">
            <span>Session {currentSessionIndex + 1} of {practiceSessions.length}</span>
            <span>Question {currentQuestionIndex + 1} of {currentSession.questions?.length || 0}</span>
          </div>
        </div>

        <div className="practice-content">
          <div className="session-card">
            <h2>{currentSession.title}</h2>
            <p className="session-description">{currentSession.description}</p>
            <div className="session-meta">
              <span>Difficulty: {currentSession.difficulty}</span>
              <span>Estimated Time: {currentSession.estimatedTime}</span>
            </div>
          </div>

          {currentQuestion && (
            <div className="question-card">
              <h3>{currentQuestion.title}</h3>
              <p className="question-description">{currentQuestion.description}</p>

              <div className="code-editor">
                <pre className="code-template">
                  {renderCodeTemplate()}
                </pre>
              </div>

              {!showResults ? (
                <button className="btn check-answer-btn" onClick={checkAnswer}>
                  Check Answer
                </button>
              ) : (
                <div className="feedback-section">
                  <p className="feedback">{feedback}</p>
                  <button className="btn next-btn" onClick={nextQuestion}>
                    {currentQuestionIndex < (currentSession.questions?.length || 0) - 1 ? 'Next Question' :
                     currentSessionIndex < practiceSessions.length - 1 ? 'Next Session' : 'Finish Practice'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PracticeSession;
