import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';
const programmingLanguages = [
  'Python', 'Java', 'C++', 'React', 'Node.js', 'HTML', 'CSS', 'JavaScript', 'Go', 'Rust',
];
const Home = () => {
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toggleForm = () => {
    setIsSignUp(prev => !prev);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const toggleLanguage = (lang) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMsg('');
  setSuccessMsg('');
  try {
    if (isSignUp) {
      // Signup
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match!');
        setIsLoading(false);
        return;
      }
      const result = await signup({
        name,
        email,
        password,
        confirmPassword,
        preferredLanguages: selectedLanguages,
      });

      if (result.success) {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setErrorMsg(result.message);
      }
    } else {
      // Login
      const result = await login(email, password);

      if (result.success) {
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setErrorMsg(result.message);
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    setErrorMsg('Account not registered. Please create account.');
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="home">
      <div className="home-container">
        <div className="home-left">
          <div className="logo-box">{'<>'}</div>
          <h1>
            Master <br /> Programming <br />
            <span>One Step at a Time</span>
          </h1>
          <p className="subtitle">
            Interactive lessons, hands-on coding practice, and personalized learning
            paths to help you become a confident programmer.
          </p>
          <div className="features">
            <div className="feature-box">
              <h3>📘 Interactive Lessons</h3>
              <p>Learn by doing with hands-on coding exercises</p>
            </div>
            <div className="feature-box">
              <h3>🏆 Track Progress</h3>
              <p>Monitor your learning journey and achievements</p>
            </div>
            <div className="feature-box">
              <h3>⚡ Daily Streaks</h3>
              <p>Build consistent learning habits</p>
            </div>
          </div>
        </div>
        <div className="home-right">
          <div className="login-card">
            <div className="login-icon">{'<>'}</div>
            <h2>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h2>
            <p className="login-subtext">
              {isSignUp ? 'Start your learning journey' : 'Continue your learning journey'}
            </p>

            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isSignUp && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}

              {isSignUp && (
                <div className="multi-select">
                  <label className="label">Preferred Programming Languages</label>
                  <div className="select-box" onClick={() => setShowDropdown(!showDropdown)}>
                    {selectedLanguages.length === 0
                      ? 'Select Languages'
                      : selectedLanguages.join(', ')}
                  </div>
                  {showDropdown && (
                    <div className="dropdown">
                      {programmingLanguages.map((lang) => (
                        <label key={lang} className="dropdown-option">
                          <input
                            type="checkbox"
                            checked={selectedLanguages.includes(lang)}
                            onChange={() => toggleLanguage(lang)}
                          />
                          {lang}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  isSignUp ? 'Creating Account...' : 'Logging in...'
                ) : (
                  isSignUp ? 'Sign Up →' : 'Login →'
                )}
              </button>
            </form>

            {errorMsg && <div className="error-message">{errorMsg}</div>}
            {successMsg && <div className="success-message">{successMsg}</div>}

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              
            </div>

            <p className="signup-link">
              {isSignUp ? (
                <>Already have an account?{' '}
                  <button type="button" className="link-button" onClick={toggleForm}>Sign in</button>
                </>
              ) : (
                <>Don’t have an account?{' '}
                  <button type="button" className="link-button" onClick={toggleForm}>Sign up</button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
