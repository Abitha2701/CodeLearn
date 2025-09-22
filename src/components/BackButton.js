import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

// BackButton with safe fallback. If there's no meaningful history, it navigates to fallbackTo (default: '/dashboard').
export default function BackButton({ to = null, fallbackTo = '/dashboard', label = 'Back', onClick, showHome = false, homeTo = '/dashboard' }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (to) {
      navigate(to);
      return;
    }
    // If there is no prior page in history (e.g., direct landing or refreshed route), go to fallback
    if (typeof window !== 'undefined' && window.history && window.history.length <= 1) {
      navigate(fallbackTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="back-controls" style={{ display: 'flex', gap: 8 }}>
      <button className="btn btn-back" onClick={handleClick} aria-label="Go back">
        ← {label}
      </button>
      {showHome && (
        <button className="btn btn-home" onClick={() => navigate(homeTo)} aria-label="Go home">
          ⌂ Home
        </button>
      )}
    </div>
  );
}
