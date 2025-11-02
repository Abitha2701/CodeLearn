import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { COMPREHENSIVE_COURSES } from '../data/comprehensiveCourses';
import './CourseDetails.css';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiFetch } from '../api/client';
import { useNotifications } from '../hooks/useNotifications';

const CourseDetails = () => {
  const { courseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const { name, email } = state || {};
  const { token, isAuthenticated } = useAuth();
  const { notify } = useNotifications();
  const [lpLoading, setLpLoading] = useState(false);
  const [lpData, setLpData] = useState(null);
  const [lpError, setLpError] = useState("");

  const course = COMPREHENSIVE_COURSES[courseId];

  if (!course) {
    return <div>Course not found</div>;
  }

  const goBack = () => {
    navigate('/explore', { state: { name, email } });
  };

  const startLevel = (levelKey) => {
    // Navigate to topic selection page (existing functionality)
    navigate(`/course/${courseId}/topics`, { state: { name, email, level: levelKey } });
  };

  const startQuiz = (levelKey, levelTitle, topics) => {
    // Navigate to a new quiz page, passing necessary info
    navigate(`/course/${courseId}/level/${levelKey}/quiz`, { 
      state: { name, email, levelKey, levelTitle, topics, courseTitle: course.title } 
    });
  };

  // Create or fetch a personalized learning path
  const createPersonalizedPath = async () => {
    if (!isAuthenticated) {
      notify.warning('Please log in to create a personalized path.');
      return;
    }
    try {
      setLpLoading(true);
      setLpError("");
      console.log('[LP] Creating personalized path for', courseId);
      const res = await apiFetch(`/api/learning-paths/create/${courseId}?force=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: { learningStyle: 'visual', pace: 'medium', availableTimePerWeek: 5 },
          goals: ['general-learning']
        })
      });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        console.warn('[LP] Non-JSON response creating path');
      }
      if (!res.ok || !data?.success) {
        const msg = data?.message || `Request failed (${res.status})`;
        setLpError(msg);
        throw new Error(msg);
      }
      console.log('[LP] Created path:', data.learningPath);
      setLpData(data.learningPath);
    } catch (e) {
      console.error(e);
      // Also show inline error so it is visible even if alerts are blocked
      setLpError(e.message || 'Failed to create personalized path');
    } finally {
      setLpLoading(false);
    }
  };

  const continuePersonalizedPath = async () => {
    if (!isAuthenticated) {
      notify.warning('Please log in to continue your path.');
      return;
    }
    try {
      setLpLoading(true);
      setLpError("");
      console.log('[LP] Fetching next step for', courseId);
      const res = await apiFetch(`/api/learning-paths/${courseId}/next-step`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        console.warn('[LP] Non-JSON response next-step');
      }
      if (!res.ok || !data?.success) {
        const msg = data?.message || `Request failed (${res.status})`;
        setLpError(msg);
        throw new Error(msg);
      }
      console.log('[LP] Next step result:', data);
      const next = data.nextStep;
      if (!next) {
        notify.success('All steps completed!');
        return;
      }
      if (next.type === 'lesson' || next.type === 'reading' || next.type === 'video') {
        // Navigate to a generic lesson page if available, else keep user here with info
        navigate(`/course/${courseId}`, { state: { name, email } });
      } else if (next.type === 'quiz') {
        // Start an adaptive AI quiz for this step by passing stepId to Quiz page
        navigate(`/course/${courseId}/quiz/${(next.topics && next.topics[0]) || 'quiz'}`, {
          state: { name, email, mlAdaptiveStepId: next.stepId }
        });
      }
    } catch (e) {
      console.error(e);
      setLpError(e.message || 'Failed to load next step');
    } finally {
      setLpLoading(false);
    }
  };

  return (
    <div className="course-details">
      {/* Header */}
      <header className="course-details-header">
        <BackButton label="Back to Dashboard" onClick={goBack} fallbackTo="/dashboard" showHome={true} homeTo="/dashboard" />
        <div className="course-brand">🧑‍💻 CodeLearn</div>
      </header>

      {/* Main Content */}
      <main className="course-details-main">
        {/* Personalized Learning Path Controls */}
        <div className="course-info-actions" style={{ display: 'flex', gap: '12px', marginBottom: 16 }}>
          <button className="btn start-level-btn" onClick={createPersonalizedPath} disabled={lpLoading}>
            {lpLoading ? 'Creating Path…' : '🎯 Create Personalized Path'}
          </button>
          <button className="btn start-quiz-btn" onClick={continuePersonalizedPath} disabled={lpLoading}>
            {lpLoading ? 'Loading Next Step…' : '➡️ Continue Personalized Path'}
          </button>
        </div>

        {lpData && (
          <div className="lp-summary" style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 16 }}>
            <strong>Personalized Path:</strong> {lpData.pathName} • Steps: {lpData.completedSteps}/{lpData.totalSteps} • Progress: {lpData.overallProgress}%
          </div>
        )}

        {lpError && (
          <div className="lp-error" style={{ padding: 10, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 6, marginBottom: 16 }}>
            ⚠️ {lpError}
          </div>
        )}

        {/* Course Info Header */}
        <div className="course-info-header">
          <div className="course-icon-large">{course.icon}</div>
          <div className="course-header-content">
            <h1 className="course-title-main">{course.title}</h1>
            <p className="course-description-main">{course.description}</p>
            
            <div className="course-meta">
              <span className="meta-item">📚 {course.totalLessons} Lessons</span>
              <span className="meta-item">⏱️ {course.estimatedHours} Hours</span>
              <span className="meta-item">🎯 {course.category}</span>
            </div>
            
            <div className="learning-path-badge">
              🚀 Learning Path
            </div>
          </div>
        </div>

        {/* Course Levels */}
        <div className="course-levels-container">
          {Object.entries(course.levels || {}).map(([levelKey, level], index) => (
            <div key={levelKey} className="level-card">
              <div className="level-number">{index + 1}</div>
              <div className="level-content">
                <div className="level-header">
                  <h2 className="level-title">{level.title}</h2>
                  <span className={`level-badge ${levelKey}`}>
                    {levelKey.charAt(0).toUpperCase() + levelKey.slice(1)}
                  </span>
                </div>

                <div className="topics-section">
                  <h3 className="topics-header">📋 Topics Covered:</h3>
                  <div className="topics-grid">
                    {level.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="topic-item">
                        • {topic}
                      </div>
                    ))}
                  </div>
                </div>

                {level.youtubeLinks && level.youtubeLinks.length > 0 && (
                  <div className="video-resources">
                    <h3 className="video-header">🎥 Video Resources:</h3>
                    <div className="video-links">
                      {level.youtubeLinks.map((link, linkIndex) => (
                        <a 
                          key={linkIndex} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="video-link"
                        >
                          ▶️ Watch Tutorial {linkIndex + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="level-actions"> {/* New container for buttons */}
                  <button 
                    className="btn start-level-btn" // You might want to rename this class
                    onClick={() => startLevel(levelKey)}
                  >
                    Start {level.title} →
                  </button>
                  <button
                    className="btn start-quiz-btn" // New button for quiz
                    onClick={() => startQuiz(levelKey, level.title, level.topics)}
                  >
                    Attend Quiz 📝
                  </button>
                  {level.practiceSessions && level.practiceSessions.length > 0 && (
                    <button
                      className="btn attend-practice-btn"
                      onClick={() => {
                        // Navigate to practice session page
                        navigate(`/course/${courseId}/practice/${levelKey}`, {
                          state: { name, email, levelKey, levelTitle: level.title, practiceSessions: level.practiceSessions }
                        });
                      }}
                    >
                      Attend Practice Session 🏃‍♂️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;