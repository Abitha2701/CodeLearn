import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import BackButton from '../components/BackButton';
import { useStreak } from '../hooks/useStreak';

const allLanguages = [
  'Python', 'Java', 'C++', 'React', 'Node.js',
  'HTML', 'CSS', 'JavaScript', 'Go', 'Rust'
];

const ProfilePage = () => {
 const location = useLocation();
const state = location.state || {};

const {
  name = 'User',
  email = 'user@example.com',
  selectedLanguages = [],
} = state;


  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [languages, setLanguages] = useState(selectedLanguages);
  const [user, setUser] = useState({ name, email, selectedLanguages });
  const { currentStreak, bestStreak } = useStreak();

  // Aggregate quiz attempts across all courses from localStorage
  const stats = useMemo(() => {
    const attempts = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith('progress:')) continue;
        const val = localStorage.getItem(k);
        if (!val) continue;
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed?.attempts)) attempts.push(...parsed.attempts);
      }
    } catch {}

    const quizzes = attempts.length;
    const avg = quizzes > 0 ? Math.round(attempts.reduce((s, a) => s + (a.scorePct || 0), 0) / quizzes) : 0;
    const high = attempts.filter(a => (a.scorePct || 0) >= 80).length;
    const recent = attempts
      .slice()
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
      .slice(0, 10);

    // Build badges: award per topic when score >= 80
    const badgeMap = new Map();
    for (const a of attempts) {
      if ((a.scorePct || 0) >= 80) {
        const key = `${a.topic || 'general'}-${Math.floor((a.scorePct || 0) / 10)}0`;
        if (!badgeMap.has(key)) {
          badgeMap.set(key, {
            id: key,
            label: `${a.topic || 'General'} ${a.scorePct >= 90 ? 'Gold' : 'Silver'}`,
            score: a.scorePct,
            topic: a.topic || 'General'
          });
        }
      }
    }
    const badges = Array.from(badgeMap.values());

    return { quizzes, avg, high, recent, badges };
  }, []);

  const toggleLanguage = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  };

  const handleSave = () => {
    setUser((prev) => ({
      ...prev,
      selectedLanguages: languages,
    }));
    setEditing(false);
  };

  return (
    <div className="profile-container fade-in">
      <div className="profile-topbar">
        <BackButton label="Back to Dashboard" onClick={() => navigate('/dashboard', { state })} fallbackTo="/dashboard" showHome={true} homeTo="/dashboard" />
        <div className="profile-title">Profile</div>
      </div>
      <div className="profile-hero" />
      <div className="profile-card slide-up">
        <div className="profile-avatar bounce">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>

        <h3>Preferred Languages</h3>
        {editing ? (
          <div className="language-options">
            {allLanguages.map((lang) => (
              <label
                key={lang}
                className={`lang-chip ${languages.includes(lang) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={languages.includes(lang)}
                  onChange={() => toggleLanguage(lang)}
                />
                {lang}
              </label>
            ))}
          </div>
        ) : (
          <div className="language-badges">
            {languages.length > 0 ? (
              languages.map((lang) => (
                <span key={lang} className="badge fade-in-badge">
                  {lang}
                </span>
              ))
            ) : (
              <p className="no-langs">No languages selected</p>
            )}
          </div>
        )}

        <div className="profile-actions">
          {editing ? (
            <>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setEditing(true)}>Edit Languages</button>
          )}
        </div>
      </div>

      {/* Stats & Achievements */}
      <div className="profile-sections">
        <h3 className="section-title">Overview</h3>
        <div className="stats-grid glass">
          <div className="stat-card">
            <div className="stat-label">Quizzes Attempted</div>
            <div className="stat-value">{stats.quizzes}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Score</div>
            <div className="stat-value">{stats.avg}%</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${stats.avg}%` }} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current Streak</div>
            <div className="stat-value">{currentStreak || 0}</div>
            <div className="stat-sub">Best: {bestStreak || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Scores ≥ 80%</div>
            <div className="stat-value">{stats.high}</div>
          </div>
        </div>

        <div className="recent-grid glass">
          <h3>Recent Quiz Performance</h3>
          <ul className="recent-list">
            {stats.recent.length === 0 && <li className="recent-empty">No attempts yet</li>}
            {stats.recent.map((r, i) => (
              <li key={i} className={`recent-item ${r.scorePct >= 80 ? 'good' : 'bad'}`}>
                <span className="recent-topic">{r.topic || 'General'}</span>
                <span className="recent-score">{r.scorePct}%</span>
                <div className="mini-bar"><div className="mini-fill" style={{ width: `${Math.min(100, Math.max(0, r.scorePct))}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="achievements glass">
          <div className="ach-header">
            <h3>Achievements</h3>
            <span className="ach-count">{stats.badges.length} badges</span>
          </div>
          <div className="badge-grid">
            {stats.badges.length === 0 && <div className="no-badges">Earn badges by scoring 80%+ in quizzes</div>}
            {stats.badges.map((b) => (
              <div key={b.id} className="badge-card unlock">
                <div className="badge-icon">🏅</div>
                <div className="badge-meta">
                  <div className="badge-label">{b.label}</div>
                  <div className="badge-sub">{b.topic} • {b.score}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
