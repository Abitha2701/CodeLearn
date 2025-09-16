import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { COMPREHENSIVE_COURSES } from '../data/comprehensiveCourses';
import './CourseDetails.css';

const CourseDetails = () => {
  const { courseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const { name, email } = state || {};
  const course = COMPREHENSIVE_COURSES[courseId];

  if (!course) {
    return <div>Course not found</div>;
  }

  const goBack = () => {
    navigate('/explore', { state: { name, email } });
  };

  const startLevel = (levelKey) => {
    // Navigate to topic selection page instead of course path
    navigate(`/course/${courseId}/topics`, { state: { name, email, level: levelKey } });
  };

  return (
    <div className="course-details">
      {/* Header */}
      <header className="course-details-header">
        <button className="back-btn" onClick={goBack}>← Back to Dashboard</button>
        <div className="course-brand">🧑‍💻 CodeLearn</div>
      </header>

      {/* Main Content */}
      <main className="course-details-main">
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

                <button 
                  className="start-level-btn"
                  onClick={() => startLevel(levelKey)}
                >
                  Start {level.title} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;
