import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { COMPREHENSIVE_COURSES, TOP_LANGUAGE_CATEGORIES } from '../data/comprehensiveCourses';
import './ExploreMoreCourses.css';

const ExploreMoreCourses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email } = location.state || {};
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Get all unique categories
  const categories = ['All', ...new Set(Object.values(COMPREHENSIVE_COURSES).map(course => course.category))];

  // Filter courses based on category and search term
  const filteredCourses = Object.entries(COMPREHENSIVE_COURSES).filter(([key, course]) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openCourse = (courseKey) => {
    navigate(`/course-details/${courseKey}`, { state: { name, email } });
  };

  const goBack = () => {
    navigate('/dashboard', { state: { name, email } });
  };

  return (
    <div className="explore-courses">
      {/* Header */}
      <header className="explore-header">
        <div className="header-left">
          <button className="back-btn" onClick={goBack}>← Back to Dashboard</button>
          <div className="logo-box"><span>{'<>'}</span> CodeLearn</div>
        </div>
        <div className="header-right">
          <div className="user-welcome">Welcome {name || 'Learner'}!</div>
          <div className="profile-icon">👤</div>
        </div>
      </header>

      <main className="explore-main">
        <div className="explore-hero">
          <h1>🚀 Explore All Courses</h1>
          <p>Discover new technologies and expand your programming skills with our comprehensive course catalog</p>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Categories */}
        <section className="popular-categories">
          <h2>🔥 Popular Technologies</h2>
          <div className="categories-grid">
            {TOP_LANGUAGE_CATEGORIES.map((tech, index) => (
              <div key={index} className="category-card" style={{ borderLeft: `4px solid ${tech.color}` }}>
                <div className="category-icon">{tech.icon}</div>
                <span className="category-name">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Course Results */}
        <section className="course-results">
          <h2>📚 Courses ({filteredCourses.length})</h2>
          <div className="courses-grid">
            {filteredCourses.map(([courseKey, course]) => (
              <div key={courseKey} className="course-card" onClick={() => openCourse(courseKey)}>
                <div className="course-header">
                  <div className="course-icon">{course.icon}</div>
                  <div className="course-category">{course.category}</div>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-stats">
                  <span className="stat">📖 {course.totalLessons} lessons</span>
                  <span className="stat">⏱️ {course.estimatedHours}h</span>
                </div>
                <div className="course-levels">
                  {Object.keys(course.levels || {}).map(level => (
                    <span key={level} className={`level-badge ${level}`}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                  ))}
                </div>
                <button 
                  className="start-course-btn"
                  onClick={() => openCourse(courseKey)}
                >
                  Start Learning →
                </button>
              </div>
            ))}
          </div>
          
        </section>

        {filteredCourses.length === 0 && (
          <div className="no-results">
            <h3>🔍 No courses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExploreMoreCourses;