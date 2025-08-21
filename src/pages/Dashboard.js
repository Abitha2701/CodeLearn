import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
// top imports
import { COURSE_SLUGS } from '../data/learningPaths';




const Dashboard = () => {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email, selectedLanguages } = location.state || {};
  const openCourse = (courseName) => {
  const courseId = COURSE_SLUGS[courseName] || courseName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  navigate(`/course/${courseId}`, { state: { name, email, selectedLanguages } });
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
          <button className="logout-btn">Logout</button>
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
          <div className="action-card">📖 Resume Last Lesson</div>
          <div className="action-card">🏅 View Achievements</div>
          <div className="action-card">🌟 Explore New Courses</div>
        </div>

   

        <h1>Learning Journey</h1>
        <p className="subtext">You're doing great! Keep up the momentum and continue building your programming skills.</p>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-box"><h2>0 →</h2><p>Current Streak</p></div>
          <div className="stat-box"><h2>0 ⭐</h2><p>Total XP</p></div>
          <div className="stat-box"><h2>0 of 20 📘</h2><p>Lessons Completed</p></div>
          <div className="stat-box"><h2>Jul 2025 🗓</h2><p>Learning Since</p></div>
        </div>
         {/* Courses */}
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
              <p>No courses selected. Go to Profile to add your interests.</p>
            )}
          </div>
        </div>
{/* Courses Available */}
<div className="available-courses">
  <h2>📖 Courses Available</h2>
  <div className="courses-grid">
    {Object.keys(allCourses).map((course, index) => {
      const courseIcons = {
        Python: "🐍",
        Java: "☕",
        "C++": "💻",
        React: "⚛️",
        "Node.js": "🌿",
        HTML: "📄",
        CSS: "🎨",
        JavaScript: "📜",
        Go: "🌀",
        Rust: "🦀"
      };

      return (
        <div className="course-card" key={index}>
          <div className="course-icon">{courseIcons[course] || "📘"}</div>
          <h3 className="course-title">{course}</h3>
          <p>{allCourses[course].total} total lessons</p>
          <button className="continue-btn" onClick={() => openCourse(course)}>
  View Course →
</button>
        </div>
      );
    })}
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
