import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import
import './Dashboard.css';
import { useLocation } from 'react-router-dom';
const Dashboard = () => {
    const location = useLocation();
  const navigate = useNavigate();

  const { name, email, selectedLanguages } = location.state || {};

  const goToProfile = () => {
    navigate('/profile', {
      state: {
        name,
        email,
        selectedLanguages,
      },
    });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo-box"><span>{'<>'}</span> CodeLearn</div>

        <div className="header-right">
          <div className="user-welcome">Welcome Learner!!</div>

          {/* ✅ Profile icon clickable */}
          <div className="profile-icon" onClick={goToProfile} style={{ cursor: 'pointer' }}>
            👤
          </div>

          <button className="logout-btn">Logout</button>
        </div>
      </header>

      <section className="dashboard-main">
        <h1>Learning Journey</h1>
        <p className="subtext">
          You're doing great! Keep up the momentum and continue building your programming skills.
        </p>

        <div className="stats-grid">
          <div className="stat-box">
            <h2>0 →</h2>
            <p>Current Streak</p>
          </div>
          <div className="stat-box">
            <h2>0 ⭐</h2>
            <p>Total XP</p>
          </div>
          <div className="stat-box">
            <h2>0 of 20 📘</h2>
            <p>Lessons Completed</p>
          </div>
          <div className="stat-box">
            <h2>Jul 2025 🗓</h2>
            <p>Learning Since</p>
          </div>
        </div>

        {/* Course Progress */}
        <div className="course-progress">
          <h2>🏆 Course </h2>
          <div className="courses-grid">
            {[
              { title: 'JavaScript', completed: 0, total: 20 },
              { title: 'Python', completed: 3, total: 25 },
              { title: 'C++', completed: 10, total: 30 },
              { title: 'React', completed: 5, total: 15 },
            ].map((course, index) => (
              <div className="course-card" key={index}>
                <h3 className="course-title">{course.title}</h3>
                <p>{course.completed} of {course.total} lessons completed</p>
                <button className="continue-btn">Continue Learning →</button>
              </div>
            ))}
          </div>
        </div>

  <div className="recent-lessons">
        <h2>📚 Lessons for You</h2>
        <ul className="lesson-list">
          {selectedLanguages && selectedLanguages.includes("JavaScript") && (
            <li className="lesson-item">
              <span className="lesson-title">JavaScript: Variables and Data Types</span>
              <span className="lesson-duration">15 min</span>
            </li>
          )}
          {selectedLanguages && selectedLanguages.includes("React") && (
            <li className="lesson-item">
              <span className="lesson-title">React: Components Basics</span>
              <span className="lesson-duration">25 min</span>
            </li>
          )}
          {selectedLanguages && selectedLanguages.includes("Python") && (
            <li className="lesson-item">
              <span className="lesson-title">Python: Lists and Loops</span>
              <span className="lesson-duration">18 min</span>
            </li>
          )}
          {selectedLanguages && selectedLanguages.includes("C++") && (
            <li className="lesson-item">
              <span className="lesson-title">C++: Classes & Objects</span>
              <span className="lesson-duration">22 min</span>
            </li>
          )}
        </ul>
      </div>

      </section>
    </div>
  );
};

export default Dashboard;
