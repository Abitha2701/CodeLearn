import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRequiredModal.css';

const LoginRequiredModal = ({ isOpen, onClose, redirectPath }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate('/home', { state: { redirectAfterLogin: redirectPath } });
  };

  return (
    <div className="login-required-overlay">
      <div className="login-required-modal">
        <div className="login-required-icon">🔒</div>
        <h2>Login Required</h2>
        <p>You must have a CodeLearn account to access this content.</p>
        <div className="login-required-buttons">
          <button className="login-button" onClick={handleLogin}>Login / Sign Up</button>
          <button className="continue-button" onClick={onClose}>Continue Browsing</button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
