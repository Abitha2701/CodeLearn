import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COMPREHENSIVE_COURSES } from '../data/comprehensiveCourses';
import LoginRequiredModal from '../components/LoginRequiredModal';
import useLoginModal from '../hooks/useLoginModal';
import './LanguageCategory.css';

const LanguageCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isLoginModalOpen, openLoginModal, closeLoginModal, redirectPath } = useLoginModal();
  
  // Find the course data based on category ID
  const courseData = COMPREHENSIVE_COURSES[categoryId];
  
  if (!courseData) {
    return (
      <div className="language-category-error">
        <h2>Course not found</h2>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const handleStartLearning = () => {
    if (isAuthenticated) {
      navigate(`/course/${categoryId}`);
    } else {
      openLoginModal(`/course/${categoryId}`);
    }
  };

  const handleLoginPrompt = () => {
    // Directly navigate to the login/signup page with redirect information
    navigate('/home', { state: { redirectAfterLogin: `/course/${categoryId}` } });
  };
  
  const handleVideoAccess = () => {
    if (!isAuthenticated) {
      openLoginModal(`/course/${categoryId}`, 'video tutorials');
    }
  };

  return (
    <div className="language-category-page">
      <LoginRequiredModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        redirectPath={redirectPath} 
      />
      <div className="language-category-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="language-brand">🧑‍💻 CodeLearn</div>
      </div>

      <div className="language-hero">
        <div className="language-icon-large">{courseData.icon}</div>
        <div className="language-info">
          <h1>{courseData.title}</h1>
          <p className="language-description">{courseData.description}</p>
          <div className="language-meta">
            <span>📚 {courseData.totalLessons} Lessons</span>
            <span>⏱️ {courseData.estimatedHours} Hours</span>
            <span>🎯 {courseData.category}</span>
          </div>
        </div>
      </div>

      <div className="access-message">
        <div className="message-box">
          <p>
            <strong>Note:</strong> You can browse course content for free, but to access lessons, tutorials, quizzes and track your progress, you'll need a CodeLearn account.
          </p>
          {!isAuthenticated && (
            <button className="login-prompt-btn" onClick={handleLoginPrompt}>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      <div className="language-learning-path">
        <h2>Learning Path</h2>
        <p>This course is structured in progressive levels from beginner to advanced:</p>
        
        <div className="language-levels">
          {Object.entries(courseData.levels).map(([levelKey, level]) => (
            <div className={`level-card ${levelKey}`} key={levelKey}>
              <div className="level-header">
                <h3>{level.title}</h3>
                <span className={`level-badge ${levelKey}`}>
                  {levelKey.charAt(0).toUpperCase() + levelKey.slice(1)}
                </span>
              </div>
              
              <div className="level-content">
                <h4>Topics You'll Learn:</h4>
                <ul className="topics-list">
                  {level.topics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
                
                {level.youtubeLinks && (
                  <div className="tutorial-preview" onClick={isAuthenticated ? null : handleVideoAccess}>
                    <h4>Video Tutorials Available:</h4>
                    <p>{level.youtubeLinks.length} video lessons</p>
                    {!isAuthenticated && (
                      <div className="locked-content">
                        <span className="lock-icon">🔒</span>
                        <span>Login required to access videos</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="cta-container">
          <button className="start-learning-btn" onClick={handleLoginPrompt}>
            {isAuthenticated ? 'Start Learning Now' : 'Sign Up to Start Learning'}
          </button>
          {!isAuthenticated && (
            <div className="login-prompt">
              Already have an account? <button className="login-link" onClick={handleLoginPrompt}>Login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageCategory;
