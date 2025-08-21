import React, { useMemo } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { LEARNING_PATHS } from '../data/learningPaths';
import { useProgress } from '../hooks/useProgress';
import { chooseNextItem } from './logic';
import './CoursePath.css';

export default function CoursePath() {
  const { courseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const name = state?.name || "Learner";
  const email = state?.email || "guest@example.com";

  const course = LEARNING_PATHS[courseId] || null;

  // ✅ Always call hooks, even if course is invalid
  const items = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap(m =>
      m.items.map(it => ({
        ...it,
        moduleId: m.id,
        moduleTitle: m.title
      }))
    );
  }, [course]);

  const { mastery, done, toggleDone } = useProgress(email, courseId);
  const nextItem = chooseNextItem({ items, done, mastery });

  // ✅ Only render conditionally AFTER hooks are called
  if (!course) {
    return <div>❌ Course not found.</div>;
  }

  return (
    <div className="course-path">
      {/* Header */}
      <header className="course-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>{course.emoji} {course.title} — Your Path</h1>
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
        {course.modules.map(m => (
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
                      <button onClick={() => toggleDone(it.id)}>
                        {isDone ? 'Undo' : 'Mark done'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
