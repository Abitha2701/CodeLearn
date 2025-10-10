import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { LEARNING_PATHS } from "../data/learningPaths";
import { COMPREHENSIVE_COURSES } from "../data/comprehensiveCourses";
import { useProgress } from "../hooks/useProgress";
import { useTopicVideos } from "../hooks/useVideos";

export default function Lesson() {
  const { courseId, itemId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const name = state?.name || "Learner";
  const email = state?.email || "guest@example.com";

  const course = LEARNING_PATHS[courseId] || null;
  const comprehensiveCourse = COMPREHENSIVE_COURSES[courseId] || null;

  // ✅ Always call hook, even if course/item invalid
  const { toggleDone } = useProgress(email, courseId);

  // Flatten items
  const allItems = course ? course.modules.flatMap((m) => m.items) : [];
  let item = allItems.find((i) => i.id === itemId);

  // If not found in learning paths, try to construct from comprehensive course
  if (!item && comprehensiveCourse) {
    // Parse itemId to extract level and topic information
    const parts = itemId.split('-');
    if (parts.length >= 3) {
      // For itemId like "python-beginner-0" or "py-intro"
      let levelId, topicIndex;
      
      if (itemId === 'py-intro') {
        // Special case for "py-intro" -> "Introduction to Python" in beginner level
        levelId = 'beginner';
        topicIndex = 0;
      } else {
        levelId = parts[1]; // e.g., 'beginner', 'intermediate', 'advanced'
        topicIndex = parseInt(parts[2]) || 0;
      }
      
      const level = comprehensiveCourse.levels[levelId];
      if (level && level.topics[topicIndex]) {
        item = {
          id: itemId,
          type: "lesson",
          title: level.topics[topicIndex],
          topic: levelId,
          difficulty: levelId === 'beginner' ? 1 : levelId === 'intermediate' ? 2 : 3,
          estMins: 15
        };
      }
    }
  }

  // Fetch top videos for this lesson topic/title - must be before early returns
  const { videos, loading: videosLoading } = useTopicVideos(
    courseId,
    item?.title || '',
    { enabled: !!item && item.type === 'lesson' }
  );
  const topVideoUrl = videos && videos.length > 0 ? `https://www.youtube.com/watch?v=${videos[0].youtubeVideoId}` : null;

  // ✅ Only render after hook calls
  if (!course && !comprehensiveCourse) return <div>❌ Course not found.</div>;
  if (!item) return <div>❌ Lesson not found.</div>;
  if (item.type !== "lesson") return <div>⚠️ This item is not a lesson.</div>;

  const handleMarkComplete = () => {
    toggleDone(itemId);
    navigate(`/course/${courseId}`, { state: { name, email } });
  };

  const backToCourse = () => {
    navigate(`/course/${courseId}`, { state: { name, email } });
  };

  const getLessonContent = () => {
    const courseTitle = course?.title || comprehensiveCourse?.title || courseId;
    const lessonTitle = item.title;
    
    // Generate lesson content based on the topic
    switch (courseId) {
      case 'python':
        return getPythonLessonContent(lessonTitle, item.topic);
      case 'java':
        return getJavaLessonContent(lessonTitle, item.topic);
      case 'javascript':
        return getJavaScriptLessonContent(lessonTitle, item.topic);
      default:
        return getGenericLessonContent(lessonTitle, courseTitle);
    }
  };

  return (
    <div className="lesson-page">
      {/* Lesson Header */}
      <div className="lesson-header">
        <button onClick={backToCourse} className="back-btn">← Back to Course</button>
        <h1>📘 {item.title}</h1>
        <div className="lesson-meta">
          <span className="meta-item">📚 {courseId.toUpperCase()}</span>
          <span className="meta-item">🎯 {item.topic}</span>
          <span className="meta-item">⏱️ ~{item.estMins} min</span>
          <span className="meta-item">📊 Level {item.difficulty}/5</span>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="lesson-content">
        {(() => {
          const content = getLessonContent();
          return (
            <>
              <div className="lesson-overview">
                <h2>📖 Overview</h2>
                <p>{content.overview}</p>
              </div>

              <div className="lesson-section">
                <h3>🎯 Key Points</h3>
                <ul className="key-points">
                  {content.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              {content.codeExample && (
                <div className="lesson-section">
                  <h3>💻 Code Example</h3>
                  <div className="code-container">
                    <pre>{content.codeExample}</pre>
                  </div>
                </div>
              )}

              <div className="lesson-section exercises">
                <h3>🚀 Practice Exercises</h3>
                <ul>
                  {content.exercises.map((exercise, index) => (
                    <li key={index}>{exercise}</li>
                  ))}
                </ul>
              </div>
            </>
          );
        })()}
      </div>

      {/* Lesson Actions */}
      <div className="lesson-actions">
        {videosLoading ? (
          <button className="back-btn" disabled>Loading video…</button>
        ) : topVideoUrl ? (
          <a href={topVideoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginRight: 12 }}>
            🎥 Watch Video
          </a>
        ) : (
          <span className="meta-item" style={{ marginRight: 12 }}>
            📺 No video found
          </span>
        )}
        <button onClick={handleMarkComplete} className="complete-btn">
          ✅ Mark as Complete
        </button>
        <button 
          onClick={() => {
            // For lessons, navigate to the level quiz (not individual topic quiz)
            const levelQuizId = `${courseId}-${item.topic}-quiz`; // e.g., python-beginner-quiz
            navigate(`/course/${courseId}/quiz/${levelQuizId}`, { state: { name, email } });
          }}
          className="quiz-btn"
        >
          📝 Take Quiz
        </button>
      </div>
    </div>
  );
}

function getPythonLessonContent(title, level) {
  const content = {
    "Introduction to Python": {
      overview: "Python is a high-level, interpreted programming language known for its simplicity and readability.",
      keyPoints: [
        "Python was created by Guido van Rossum in 1991",
        "It emphasizes code readability with its use of significant whitespace", 
        "Python supports multiple programming paradigms",
        "It has a comprehensive standard library",
        "Python is widely used in web development, data science, AI, and automation"
      ],
      codeExample: `# Your first Python program
print("Hello, World!")

# Variables and basic operations
name = "Python"
version = 3.9
print(f"Welcome to {name} {version}!")

# Python is dynamically typed
x = 10        # integer
x = "hello"   # now it's a string
x = [1,2,3]   # now it's a list`,
      exercises: [
        "Write a Python program that prints your name",
        "Create variables for your age, name, and favorite color",
        "Use f-strings to display a message with these variables"
      ]
    },
    "Variables and Data Types": {
      overview: "Python variables are containers for storing data values. Python has several built-in data types.",
      keyPoints: [
        "Variables don't need to be declared with a specific type",
        "Python determines the type automatically (dynamic typing)",
        "Main data types: int, float, str, bool, list, tuple, dict, set",
        "Use type() function to check variable type",
        "Variables are case-sensitive"
      ],
      codeExample: `# Different data types in Python
age = 25                    # int
height = 5.9               # float
name = "Alice"             # str
is_student = True          # bool
hobbies = ["reading", "coding"]  # list
coordinates = (10, 20)     # tuple
person = {"name": "Bob", "age": 30}  # dict

# Check types
print(type(age))           # <class 'int'>
print(type(name))          # <class 'str'>
print(type(hobbies))       # <class 'list'>`,
      exercises: [
        "Create variables of each data type",
        "Convert between different types using int(), str(), float()",
        "Create a dictionary with your personal information"
      ]
    }
  };

  return content[title] || getGenericLessonContent(title, "Python");
}

function getJavaLessonContent(title, level) {
  return getGenericLessonContent(title, "Java");
}

function getJavaScriptLessonContent(title, level) {
  return getGenericLessonContent(title, "JavaScript");
}

function getGenericLessonContent(title, course) {
  return {
    overview: `Learn about ${title} in ${course} programming.`,
    keyPoints: [
      `Understanding ${title} concepts`,
      `Practical applications in ${course}`,
      `Best practices and common patterns`,
      `Real-world examples and use cases`
    ],
    codeExample: `// Example code for ${title}
// This is a placeholder - specific content will be added
console.log("Learning ${title} in ${course}");`,
    exercises: [
      `Practice ${title} concepts`,
      `Build a simple project using ${title}`,
      `Explore advanced ${title} features`
    ]
  };
}