import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ProfilePage.css';

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


  const [editing, setEditing] = useState(false);
  const [languages, setLanguages] = useState(selectedLanguages);
  const [user, setUser] = useState({ name, email, selectedLanguages });

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
    </div>
  );
};

export default ProfilePage;
