import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TopicSelection.css';

const TopicSelection = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define topics for each course based on comprehensive_quiz_data.json
  const courseTopics = {
    python: {
      beginner: [
        { id: 'introduction-to-python', name: 'Introduction to Python', icon: '🐍', description: 'Learn Python basics and syntax' },
        { id: 'variables-and-data-types', name: 'Variables and Data Types', icon: '📊', description: 'Understanding data types and variables' },
        { id: 'operators-arithmetic-logical-bitwise', name: 'Operators (arithmetic, logical, bitwise)', icon: '⚡', description: 'Master Python operators' },
        { id: 'control-flow-if-else-loops', name: 'Control Flow (if-else, loops)', icon: '🔀', description: 'Control program flow with conditions and loops' },
        { id: 'functions-and-scope', name: 'Functions and Scope', icon: '🔧', description: 'Create reusable functions' },
        { id: 'lists-and-tuples', name: 'Lists and Tuples', icon: '📝', description: 'Work with ordered collections' },
        { id: 'dictionaries-and-sets', name: 'Dictionaries and Sets', icon: '🗂️', description: 'Key-value pairs and unique collections' },
        { id: 'string-manipulation', name: 'String Manipulation', icon: '✂️', description: 'Text processing and string operations' },
        { id: 'file-io-operations', name: 'File I/O Operations', icon: '📁', description: 'Read and write files' },
        { id: 'error-handling-basics', name: 'Error Handling Basics', icon: '🛡️', description: 'Handle exceptions gracefully' }
      ],
      intermediate: [
        { id: 'object-oriented-programming', name: 'Object-Oriented Programming', icon: '🏗️', description: 'OOP concepts and principles' },
        { id: 'classes-and-objects', name: 'Classes and Objects', icon: '🎯', description: 'Create and use classes' },
        { id: 'inheritance-and-polymorphism', name: 'Inheritance and Polymorphism', icon: '🧬', description: 'Advanced OOP features' },
        { id: 'modules-and-packages', name: 'Modules and Packages', icon: '📦', description: 'Organize code into modules' },
        { id: 'decorators', name: 'Decorators', icon: '✨', description: 'Enhance functions with decorators' }
      ],
      advanced: [
        { id: 'advanced-oop-concepts', name: 'Advanced OOP Concepts', icon: '🎓', description: 'Master advanced OOP techniques' },
        { id: 'metaclasses', name: 'Metaclasses', icon: '🔮', description: 'Classes that create classes' }
      ]
    }
  };

  useEffect(() => {
    if (courseTopics[courseId]) {
      const allTopics = [
        ...courseTopics[courseId].beginner.map(topic => ({ ...topic, level: 'beginner', difficulty: 'Easy' })),
        ...courseTopics[courseId].intermediate.map(topic => ({ ...topic, level: 'intermediate', difficulty: 'Medium' })),
        ...courseTopics[courseId].advanced.map(topic => ({ ...topic, level: 'advanced', difficulty: 'Hard' }))
      ];
      setTopics(allTopics);
    }
    setLoading(false);
  }, [courseId]);

  const handleTopicSelect = (topic) => {
    // Navigate to the quiz for this specific topic
    navigate(`/course/${courseId}/quiz/${topic.id}`);
  };

  const getCourseName = () => {
    const names = {
      python: 'Python',
      javascript: 'JavaScript', 
      java: 'Java'
    };
    return names[courseId] || courseId;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="topic-selection-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-selection-page">
      <div className="topic-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="course-info">
          <h1>{getCourseName()} Topics</h1>
          <p>Choose a topic to start your quiz journey</p>
        </div>
      </div>

      <div className="topics-grid">
        {topics.map((topic, index) => (
          <div 
            key={topic.id} 
            className="topic-card"
            onClick={() => handleTopicSelect(topic)}
          >
            <div className="topic-number">{index + 1}</div>
            <div className="topic-icon">{topic.icon}</div>
            <div className="topic-content">
              <h3 className="topic-name">{topic.name}</h3>
              <p className="topic-description">{topic.description}</p>
              <div className="topic-meta">
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(topic.difficulty) }}
                >
                  {topic.difficulty}
                </span>
                <span className="level-badge">{topic.level}</span>
              </div>
            </div>
            <div className="topic-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="topic-footer">
        <div className="progress-info">
          <h3>🎯 Complete all topics to master {getCourseName()}!</h3>
          <p>Each topic contains 5-8 carefully crafted questions to test your knowledge.</p>
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;