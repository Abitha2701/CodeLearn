import React from "react";
import {
  FaHtml5,
  FaCss3Alt,
  FaJsSquare,
  FaPython,
  FaReact,
  FaDatabase,
  FaNodeJs,
  FaGitAlt,
  FaPhp,
} from "react-icons/fa";
import "./FrontPage.css";
import { useNavigate } from "react-router-dom"; 


const categories = [
  { icon: <FaHtml5 />, title: "HTML" },
  { icon: <FaCss3Alt />, title: "CSS" },
  { icon: <FaJsSquare />, title: "JavaScript" },
  { icon: <FaPython />, title: "Python" },
  { icon: <FaReact />, title: "React" },
  { icon: <FaDatabase />, title: "Databases" },
  { icon: <FaNodeJs />, title: "Node.js" },
  { icon: <FaGitAlt />, title: "Git" },
  { icon: <FaPhp />, title: "PHP" },
];

const courses = [
  { icon: <FaHtml5 />, title: "Mastering HTML5", desc: "Learn semantic HTML for structured, accessible web pages." },
  { icon: <FaCss3Alt />, title: "Advanced CSS", desc: "Master Flexbox, Grid, and modern responsive design." },
  { icon: <FaJsSquare />, title: "JavaScript Fundamentals", desc: "Understand the core concepts of JavaScript." },
  { icon: <FaPython />, title: "Python Essentials", desc: "Get started with Python for web and data applications." },
  { icon: <FaReact />, title: "React Crash Course", desc: "Build interactive UIs with React and hooks." },
  { icon: <FaDatabase />, title: "SQL Basics", desc: "Learn to query and manage relational databases." },
  { icon: <FaNodeJs />, title: "Node.js Beginner Guide", desc: "Server-side JavaScript with Express.js." },
  { icon: <FaGitAlt />, title: "Version Control with Git", desc: "Track, share, and collaborate on code." },
];

export default function FrontPage() {
    
const navigate = useNavigate();
  return (
    <div className="frontpage">
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text animate-fadein">
          <h1>Learn Skills From Our Top Courses</h1>
          <p>Master web development languages through engaging, hands-on lessons.</p>
       <button className="start-btn" onClick={() => navigate("/home")}>
            Start Learning
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <h2>Top Language Categories</h2>
        <div className="category-slider">
          {categories.map((cat, idx) => (
            <div key={idx} className="category-card animate-pop">
              <div className="category-icon">{cat.icon}</div>
              <p>{cat.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Courses */}
      <section className="popular">
        <h2>Most Popular Courses</h2>
        <div className="course-grid">
          {courses.map((course, idx) => (
            <div key={idx} className="course-card animate-fadeup">
              <div className="course-icon">{course.icon}</div>
              <h3>{course.title}</h3>
              <p>{course.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
