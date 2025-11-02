  import React, { useMemo } from 'react';
  import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
  import { LEARNING_PATHS } from '../data/learningPaths';
  import { COMPREHENSIVE_COURSES } from '../data/comprehensiveCourses';
  import { useProgress } from '../hooks/useProgress';
  import { chooseNextItem } from './logic';
  import './CoursePath.css';
  import { openTopVideoInNewTab } from '../hooks/useVideos';

  export default function CoursePath() {
    const { courseId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const name = state?.name || "Learner";
    const email = state?.email || "guest@example.com";

    const course = LEARNING_PATHS[courseId] || null;
    const comprehensiveCourse = COMPREHENSIVE_COURSES[courseId] || null;

    // Use comprehensive course if learning path doesn't exist
    const courseData = course || comprehensiveCourse;

    // ✅ Always call hooks, even if course is invalid
    const items = useMemo(() => {
      if (course) {
        // Use learning path structure
        return course.modules.flatMap(m =>
          m.items.map(it => ({
            ...it,
            moduleId: m.id,
            moduleTitle: m.title
          }))
        );
      } else if (comprehensiveCourse) {
        // Create items from comprehensive course structure
        const courseItems = [];
        Object.entries(comprehensiveCourse.levels || {}).forEach(([levelKey, level]) => {
          level.topics.forEach((topic, index) => {
            courseItems.push({
              id: `${courseId}-${levelKey}-${index}`,
              type: "lesson",
              title: topic,
              topic: levelKey,
              difficulty: levelKey === 'beginner' ? 1 : levelKey === 'intermediate' ? 2 : 3,
              estMins: 15,
              moduleId: levelKey,
              moduleTitle: level.title
            });
          });
          
          // Add a quiz for each level
          courseItems.push({
            id: `${courseId}-${levelKey}-quiz`,
            type: "quiz", 
            title: `${level.title} Quiz`,
            topic: levelKey,
            difficulty: levelKey === 'beginner' ? 2 : levelKey === 'intermediate' ? 3 : 4,
            estMins: 10,
            moduleId: levelKey,
            moduleTitle: level.title
          });
        });
        return courseItems;
      }
      return [];
    }, [course, comprehensiveCourse, courseId]);

    const { mastery, done, toggleDone } = useProgress(email, courseId);
    const nextItem = chooseNextItem({ items, done, mastery });

    // ✅ Only render conditionally AFTER hooks are called
    if (!courseData) {
      return <div>❌ Course not found.</div>;
    }

    const courseTitle = course ? course.title : comprehensiveCourse.title;
    const courseEmoji = course ? course.emoji : comprehensiveCourse.icon;

    return (
      <div className="course-path">
        {/* Header */}
        <header className="course-header">
          <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
          <h1>{courseEmoji} {courseTitle} — Your Path</h1>
          <div className="user-info">👋 {name}</div>
        </header>

        {/* Progress Row */}
        <div className="progress-row">
          <div className="progress-text">📊 Progress: {done.length}/{items.length}</div>
          {nextItem ? (
            <Link 
              className="primary-btn" 
              to={`/course/${courseId}/${nextItem.type}/${nextItem.id}`} 
              state={{ name, email }}
            >
              ▶️ Continue: {nextItem.title}
            </Link>
          ) : (
            <div className="done-badge">🏁 All caught up!</div>
          )}
        </div>

        {/* Modules Grid */}
        <div className="modules-grid">
          {course ? (
            // Render learning path modules
            course.modules.map(m => (
              <div className="module-card" key={m.id}>
                <h2>📦 {m.title} <small>({m.level})</small></h2>
                <ul className="items">
                  {m.items.map(it => {
                    const isDone = done.includes(it.id);
                    return (
                      <li key={it.id} className={`item ${isDone ? 'done' : ''}`}>
                        <div className="item-header">
                          <span>{it.type === 'quiz' ? '📝' : '📘'} {it.title}</span>
                        </div>
                        <div className="item-tags">
                          <span className="pill">Topic: {it.topic}</span>
                          <span className="pill">Diff: {it.difficulty}</span>
                        </div>
                        <div className="row">
                          <Link
                            to={`/course/${courseId}/${it.type}/${it.id}`}
                            state={{ name, email }}
                          >
                            Open
                          </Link>
                          {it.type === 'lesson' && (
                            <button
                              onClick={async () => {
                                await openTopVideoInNewTab(courseId, it.title);
                              }}
                              className="btn btn-secondary"
                            >
                              🎥 Watch
                            </button>
                          )}
                          {it.type === 'quiz' && m.practiceSessions && m.practiceSessions.length > 0 && (
                            <button
                              className="btn attend-practice-btn"
                              onClick={() => {
                                navigate(`/course/${courseId}/practice/${m.id}`, {
                                  state: { name, email, levelKey: m.id, levelTitle: m.title, practiceSessions: m.practiceSessions }
                                });
                              }}
                            >
                              Attend Practice Session 🏃‍♂️
                            </button>
                          )}
                          <button onClick={() => toggleDone(it.id)}>
                            {isDone ? 'Undo' : 'Mark done'}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          ) : (
            // Render comprehensive course modules
            Object.entries(comprehensiveCourse.levels || {}).map(([levelKey, level]) => {
              const levelItems = items.filter(item => item.moduleId === levelKey);
              return (
                <div className="module-card" key={levelKey}>
                  <h2>📦 {level.title} <small>({levelKey})</small></h2>
                  <p className="module-description" style={{ color: level.color, fontWeight: 'bold' }}>
                    {level.topics.length} topics + quiz
                  </p>
                  
                  {/* YouTube Links */}
                  {level.youtubeLinks && level.youtubeLinks.length > 0 && (
                    <div className="youtube-links">
                      <h4>📺 Video Resources:</h4>
                      {level.youtubeLinks.map((link, index) => (
                        <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="youtube-link">
                          🎥 Video {index + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <ul className="items">
                    {levelItems.map(it => {
                      const isDone = done.includes(it.id);
                      return (
                        <li key={it.id} className={`item ${isDone ? 'done' : ''}`}>
                          <div className="item-header">
                            <span>{it.type === 'quiz' ? '📝' : '📘'} {it.title}</span>
                          </div>
                          <div className="item-tags">
                            <span className="pill">Topic: {it.topic}</span>
                            <span className="pill">Diff: {it.difficulty}</span>
                          </div>
                        <div className="row">
                          <Link 
                            to={`/course/${courseId}/${it.type}/${it.id}`} 
                            state={{ name, email }}
                          >
                            Open
                          </Link>
                          {it.type === 'lesson' && (
                            <button
                              onClick={async () => {
                                await openTopVideoInNewTab(courseId, it.title);
                              }}
                              className="btn btn-secondary"
                            >
                              🎥 Watch
                            </button>
                          )}
                          <button onClick={() => toggleDone(it.id)}>
                            {isDone ? 'Undo' : 'Mark done'}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
