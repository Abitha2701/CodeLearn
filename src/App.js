import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import FrontPage from './pages/FrontPage';
import CoursePath from './pages/CoursePath';
import Quiz from './pages/Quiz';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FrontPage/>} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/profile" element={<ProfilePage />} />
         <Route path='/home' element={<Home />} />
            <Route path="/course/:courseId" element={<CoursePath />} />
        <Route path="/course/:courseId/quiz/:itemId" element={<Quiz />} />
      </Routes>
    </Router>
  );
}

export default App;
