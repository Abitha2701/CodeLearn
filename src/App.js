import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import FrontPage from './pages/FrontPage';
import CoursePath from './pages/CoursePath';
import CourseDetails from './pages/CourseDetails';
import Quiz from './pages/Quiz';
import ExploreMoreCourses from './pages/ExploreMoreCourses';
import LanguageCategory from './pages/LanguageCategory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FrontPage/>} />
          <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/profile" element={<ProfilePage />} />
           <Route path='/home' element={<Home />} />
           <Route path="/explore" element={<ExploreMoreCourses />} />
           <Route path="/language/:categoryId" element={<LanguageCategory />} />
           <Route path="/course-details/:courseId" element={<CourseDetails />} />
           <Route path="/course/:courseId" element={<CoursePath />} />
          <Route path="/course/:courseId/quiz/:itemId" element={<Quiz />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
