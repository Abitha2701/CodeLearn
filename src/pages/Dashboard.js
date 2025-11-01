import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStreak } from '../hooks/useStreak';
import './Dashboard.css';
// top imports
import { COURSE_SLUGS } from '../data/learningPaths';
import { COMPREHENSIVE_COURSES } from '../data/comprehensiveCourses';




const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { currentStreak, bestStreak, weekActivity } = useStreak();
  
  // Use auth context user data or fallback to location state
  const name = user?.name || location.state?.name || 'Learner';
  const email = user?.email || location.state?.email || '';
  const selectedLanguages = user?.preferredLanguages || location.state?.selectedLanguages || [];

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !location.state) {
      navigate('/');
    }
  }, [isAuthenticated, location.state, navigate]);
  const openCourse = (courseName) => {
    // First try to find the exact key in COMPREHENSIVE_COURSES
    const exactKey = Object.keys(COMPREHENSIVE_COURSES).find(key => 
      COMPREHENSIVE_COURSES[key].title === courseName
    );
    
    if (exactKey) {
      navigate(`/course-details/${exactKey}`, { state: { name, email, selectedLanguages } });
      return;
    }
    
    // Fallback to COURSE_SLUGS mapping for learning paths
    const courseId = COURSE_SLUGS[courseName] || courseName.toLowerCase().replace(/[^a-z0-9]+/g, '');
    navigate(`/course/${courseId}`, { state: { name, email, selectedLanguages } });
  };

  // Resume last lesson by scanning local progress storage
  const resumeLastLesson = () => {
    try {
      let latest = null;
      let latestCourseId = null;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith('progress:')) continue;
        const parts = k.split(':');
        // key shape: progress:<email>:<courseId>
        const courseIdFromKey = parts[2];
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const attempts = Array.isArray(parsed?.attempts) ? parsed.attempts : [];
        for (const a of attempts) {
          if (typeof a?.ts !== 'number') continue;
          if (!latest || a.ts > latest.ts) {
            latest = a;
            latestCourseId = courseIdFromKey;
          }
        }
      }
      if (latestCourseId) {
        navigate(`/course/${latestCourseId}`, { state: { name, email, selectedLanguages } });
      } else {
        // Fallback to explore
        navigate('/explore', { state: { name, email, selectedLanguages } });
      }
    } catch {
      navigate('/explore', { state: { name, email, selectedLanguages } });
    }
  };

  const viewAchievements = () => {
    navigate('/profile', { state: { name, email, selectedLanguages } });
  };

  // Slideshow
  const slides = [
    { title: "Welcome to CodeLearn 🎉", text: "Track your progress and keep learning every day!" },
    { title: "Tip of the Day 💡", text: "Consistency beats intensity. Try at least 15 mins daily." },
    { title: "Explore New Courses 🚀", text: "We’ve added AI, Data Science, and more!" }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToProfile = () => {
    navigate('/profile', { state: { name, email, selectedLanguages } });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

const allCourses = {
  Python: { completed: 0, total: 25 },
  Java: { completed: 0, total: 28 },
  "C++": { completed: 0, total: 30 },
  React: { completed: 0, total: 15 },
  "Node.js": { completed: 0, total: 18 },
  HTML: { completed: 0, total: 12 },
  CSS: { completed: 0, total: 14 },
  JavaScript: { completed: 0, total: 20 },
  Go: { completed: 0, total: 16 },
  Rust: { completed: 0, total: 22 },
};


  const coursesToShow = selectedLanguages
    ? selectedLanguages.map(lang => ({
        title: lang,
        completed: allCourses[lang]?.completed || 0,
        total: allCourses[lang]?.total || 0,
      }))
    : [];

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-box"><span>{'<>'}</span> CodeLearn</div>
        <div className="header-right">
          <div className="user-welcome">Welcome {name || 'Learner'}!!</div>
          <div className="profile-icon" onClick={goToProfile}>👤</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      

      <section className="dashboard-main">

        {/* Slideshow */}
        <div className="slideshow-card fade-in">
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].text}</p>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card" onClick={resumeLastLesson} style={{ cursor: 'pointer' }}>📖 Resume Last Lesson</div>
          <div className="action-card" onClick={viewAchievements} style={{ cursor: 'pointer' }}>🏅 View Achievements</div>
          <div className="action-card" onClick={() => navigate('/explore', { state: { name, email, selectedLanguages } })} style={{ cursor: 'pointer' }}>🌟 Explore New Courses</div>
        </div>

   

        <h1>Learning Journey</h1>
        <p className="subtext">You're doing great! Keep up the momentum and continue building your programming skills.</p>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-box">
            <h2>{currentStreak || 0} →</h2>
            <p>Current Streak</p>
            <div className="streak-week">
              {weekActivity?.map((active, i) => (
                <span key={i} className={`dot ${active ? 'on' : 'off'}`} />
              ))}
            </div>
            <div className="streak-sub">Best: {bestStreak || 0}</div>
          </div>
          <div className="stat-box"><h2>0 ⭐</h2><p>Total XP</p></div>
          <div className="stat-box"><h2>0 of 20 📘</h2><p>Lessons Completed</p></div>
          <div className="stat-box"><h2>Jul 2025 🗓</h2><p>Learning Since</p></div>
        </div>
         {/* Your Selected Courses */}
        <div className="course-progress">
          <h2>🏆 Your Courses</h2>
          <div className="courses-grid">
            {coursesToShow.length > 0 ? (
              coursesToShow.map((course, index) => (
                <div className="course-card" key={index}>
                  <h3 className="course-title">{course.title}</h3>
                  <p>{course.completed} of {course.total} lessons completed</p>
                  <button className="continue-btn" onClick={() => openCourse(course.title)}>
                    Start Learning →
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state-card">
                <h3>🎯 No courses selected yet</h3>
                <p>Go to Profile to add your learning interests and start your journey!</p>
                <button className="continue-btn" onClick={goToProfile}>
                  Set Up Profile →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Available Courses */}
        <div className="available-courses">
          <h2>📖 All Available Courses</h2>
          <p className="section-subtitle">Choose from our comprehensive catalog of programming courses</p>
          <div className="courses-grid">
            {Object.entries(COMPREHENSIVE_COURSES).map(([courseKey, course]) => (
              <div className="course-card" key={courseKey}>
                <div className="course-icon">{course.icon}</div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-stats">{course.totalLessons} lessons • {course.estimatedHours}h</p>
                <p className="course-description">{course.description}</p>
                <div className="course-levels">
                  {Object.keys(course.levels || {}).map(level => (
                    <span key={level} className={`level-badge ${level}`}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                  ))}
                </div>
                <button className="continue-btn" onClick={() => openCourse(course.title)}>
                  View Course →
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="explore-all-btn"
              onClick={() => navigate('/explore', { state: { name, email, selectedLanguages } })}
            >
              🚀 Explore All {Object.keys(COMPREHENSIVE_COURSES).length} Courses
            </button>
          </div>
        </div>
    
        {/* Lessons */}
        <div className="recent-lessons">
          <h2>📚 Lessons for You</h2>
          <ul className="lesson-list">
            {selectedLanguages?.includes("JavaScript") && (
              <li className="lesson-item"><span className="lesson-title">JavaScript: Variables and Data Types</span><span className="lesson-duration">15 min</span></li>
            )}
            {selectedLanguages?.includes("React") && (
              <li className="lesson-item"><span className="lesson-title">React: Components Basics</span><span className="lesson-duration">25 min</span></li>
            )}
            {selectedLanguages?.includes("Python") && (
              <li className="lesson-item"><span className="lesson-title">Python: Lists and Loops</span><span className="lesson-duration">18 min</span></li>
            )}
            {selectedLanguages?.includes("C++") && (
              <li className="lesson-item"><span className="lesson-title">C++: Classes & Objects</span><span className="lesson-duration">22 min</span></li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
