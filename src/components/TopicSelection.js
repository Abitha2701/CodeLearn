import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TopicSelection.css';
import { COMPREHENSIVE_COURSES } from '../data/comprehensiveCourses';
import BackButton from './BackButton';

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
    },
    java: {
      beginner: [
        { id: 'introduction-to-java', name: 'Introduction to Java', icon: '☕', description: 'History, JDK/JRE/JVM, first program' },
        { id: 'variables-and-data-types', name: 'Variables and Data Types', icon: '📊', description: 'Primitive types, reference types' },
        { id: 'operators-arithmetic-logical-bitwise', name: 'Operators (arithmetic, logical, bitwise)', icon: '➗', description: 'Operators and precedence' },
        { id: 'control-flow-if-else-switch', name: 'Control Flow (if-else, switch)', icon: '🔀', description: 'Branching statements' },
        { id: 'loops-for-while-do', name: 'Loops (for, while, do-while)', icon: '🔁', description: 'Iteration constructs' },
        { id: 'arrays-1d-2d', name: 'Arrays (1D, 2D)', icon: '🧮', description: 'Array basics and traversal' }
      ],
      intermediate: [
        { id: 'object-oriented-programming', name: 'OOP Fundamentals', icon: '🏗️', description: 'Classes, objects, methods' },
        { id: 'constructors-and-overloading', name: 'Constructors & Overloading', icon: '🧱', description: 'Initialization patterns' },
        { id: 'inheritance-and-polymorphism', name: 'Inheritance & Polymorphism', icon: '🧬', description: 'Extending behavior' },
        { id: 'encapsulation-and-abstraction', name: 'Encapsulation & Abstraction', icon: '🔒', description: 'Hiding internals' },
        { id: 'exceptions-and-try-catch', name: 'Exception Handling', icon: '🛡️', description: 'try/catch/finally, throws' }
      ],
      advanced: [
        { id: 'collections-framework', name: 'Collections Framework', icon: '📚', description: 'List, Set, Map, generics' },
        { id: 'multithreading-and-concurrency', name: 'Multithreading & Concurrency', icon: '🧵', description: 'Threads, sync, executors' },
        { id: 'jvm-and-garbage-collection', name: 'JVM & Garbage Collection', icon: '♻️', description: 'Memory model and GC' }
      ]
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Try dynamic backend topics first
        const resp = await fetch(`http://localhost:5001/api/quizzes/topics/${courseId}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && Array.isArray(data.topics)) {
            setTopics(data.topics);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Falling back to built-in topics for', courseId, e?.message);
      }

      // Fallback to built-in map
      if (courseTopics[courseId]) {
        const allTopics = [
          ...courseTopics[courseId].beginner.map(topic => ({ ...topic, level: 'beginner', difficulty: 'Easy' })),
          ...courseTopics[courseId].intermediate.map(topic => ({ ...topic, level: 'intermediate', difficulty: 'Medium' })),
          ...courseTopics[courseId].advanced.map(topic => ({ ...topic, level: 'advanced', difficulty: 'Hard' }))
        ];
        setTopics(allTopics);
      } else {
        // Ultimate fallback: build from COMPREHENSIVE_COURSES if available
        const course = COMPREHENSIVE_COURSES[courseId];
        if (course && course.levels) {
          const slug = (s) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
          const built = [];
          Object.entries(course.levels).forEach(([levelKey, level]) => {
            const levelDiff = levelKey === 'beginner' ? 'Easy' : levelKey === 'intermediate' ? 'Medium' : 'Hard';
            (level.topics || []).forEach((t) => {
              built.push({
                id: slug(t),
                name: t,
                icon: '📘',
                description: t,
                level: levelKey,
                difficulty: levelDiff
              });
            });
          });
          setTopics(built);
        } else {
          setTopics([]);
        }
      }
      setLoading(false);
    };

    load();
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
        <BackButton />
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