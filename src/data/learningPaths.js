// src/data/learningPaths.js
export const COURSE_SLUGS = {
  Python: "python",
  Java: "java",
  "C++": "cpp",
  React: "react",
  "Node.js": "nodejs",
  HTML: "html",
  CSS: "css",
  JavaScript: "javascript",
  Go: "go",
  Rust: "rust",
}
export const LEARNING_PATHS = {
  python: {
    title: "Python",
    emoji: "🐍",
    modules: [
      {
        id: "py-basics",
        title: "Python Basics",
        level: "Beginner",
        items: [
          { id: "py-intro", type: "lesson", title: "Intro to Python", topic: "fundamentals", difficulty: 1, estMins: 8 },
          { id: "py-vars", type: "lesson", title: "Variables & Types", topic: "fundamentals", difficulty: 1, estMins: 12 },
          { id: "py-flow", type: "lesson", title: "Control Flow", topic: "flow", difficulty: 2, estMins: 15 },
          { id: "py-quiz-1", type: "quiz", title: "Basics Quiz", topic: "fundamentals", difficulty: 2, estMins: 10 },
        ],
      },
      {
        id: "py-ds",
        title: "Data Structures",
        level: "Beginner",
        items: [
          { id: "py-list", type: "lesson", title: "Lists & Tuples", topic: "collections", difficulty: 2, estMins: 12 },
          { id: "py-dict", type: "lesson", title: "Dictionaries & Sets", topic: "collections", difficulty: 2, estMins: 12 },
          { id: "py-quiz-2", type: "quiz", title: "Collections Quiz", topic: "collections", difficulty: 3, estMins: 10 },
        ],
      },
    ],
  },
  java: {
    title: "Java",
    emoji: "☕",
    modules: [
      {
        id: "java-basics",
        title: "Java Basics",
        level: "Beginner",
        items: [
          { id: "java-intro", type: "lesson", title: "Intro to Java", topic: "fundamentals", difficulty: 1, estMins: 10 },
          { id: "java-classes", type: "lesson", title: "Classes & Objects", topic: "oop", difficulty: 2, estMins: 15 },
          { id: "java-flow", type: "lesson", title: "Control Structures", topic: "flow", difficulty: 2, estMins: 15 },
          { id: "java-quiz-1", type: "quiz", title: "Java Basics Quiz", topic: "fundamentals", difficulty: 2, estMins: 12 },
        ],
      },
      {
        id: "java-adv",
        title: "Advanced Java",
        level: "Intermediate",
        items: [
          { id: "java-gen", type: "lesson", title: "Generics", topic: "advanced", difficulty: 3, estMins: 18 },
          { id: "java-streams", type: "lesson", title: "Streams & Lambdas", topic: "advanced", difficulty: 3, estMins: 20 },
          { id: "java-quiz-2", type: "quiz", title: "Advanced Quiz", topic: "advanced", difficulty: 3, estMins: 12 },
        ],
      },
    ],
  },
  cpp: {
    title: "C++",
    emoji: "💻",
    modules: [
      {
        id: "cpp-basics",
        title: "C++ Basics",
        level: "Beginner",
        items: [
          { id: "cpp-intro", type: "lesson", title: "Intro to C++", topic: "fundamentals", difficulty: 1, estMins: 10 },
          { id: "cpp-vars", type: "lesson", title: "Variables & Data Types", topic: "fundamentals", difficulty: 1, estMins: 12 },
          { id: "cpp-quiz-1", type: "quiz", title: "C++ Basics Quiz", topic: "fundamentals", difficulty: 2, estMins: 10 },
        ],
      },
      {
        id: "cpp-oop",
        title: "Object-Oriented Programming",
        level: "Intermediate",
        items: [
          { id: "cpp-classes", type: "lesson", title: "Classes & Objects", topic: "oop", difficulty: 2, estMins: 15 },
          { id: "cpp-inherit", type: "lesson", title: "Inheritance & Polymorphism", topic: "oop", difficulty: 3, estMins: 18 },
          { id: "cpp-quiz-2", type: "quiz", title: "OOP Quiz", topic: "oop", difficulty: 3, estMins: 12 },
        ],
      },
    ],
  },
  react: {
    title: "React",
    emoji: "⚛️",
    modules: [
      {
        id: "react-core",
        title: "React Core",
        level: "Beginner",
        items: [
          { id: "rc-components", type: "lesson", title: "Components & Props", topic: "components", difficulty: 1, estMins: 12 },
          { id: "rc-state", type: "lesson", title: "State & Events", topic: "state", difficulty: 2, estMins: 15 },
          { id: "rc-effects", type: "lesson", title: "useEffect Basics", topic: "effects", difficulty: 2, estMins: 15 },
          { id: "rc-quiz-1", type: "quiz", title: "React Basics Quiz", topic: "core", difficulty: 2, estMins: 10 },
        ],
      },
    ],
  },
  nodejs: {
    title: "Node.js",
    emoji: "🌿",
    modules: [
      {
        id: "node-basics",
        title: "Node.js Basics",
        level: "Beginner",
        items: [
          { id: "node-intro", type: "lesson", title: "What is Node.js?", topic: "fundamentals", difficulty: 1, estMins: 10 },
          { id: "node-modules", type: "lesson", title: "Modules & NPM", topic: "modules", difficulty: 2, estMins: 14 },
          { id: "node-quiz-1", type: "quiz", title: "Basics Quiz", topic: "fundamentals", difficulty: 2, estMins: 10 },
        ],
      },
      {
        id: "node-adv",
        title: "Advanced Node.js",
        level: "Intermediate",
        items: [
          { id: "node-async", type: "lesson", title: "Async Programming", topic: "async", difficulty: 3, estMins: 18 },
          { id: "node-express", type: "lesson", title: "Express Framework", topic: "web", difficulty: 3, estMins: 20 },
          { id: "node-quiz-2", type: "quiz", title: "Advanced Quiz", topic: "advanced", difficulty: 3, estMins: 12 },
        ],
      },
    ],
  },
  html: {
    title: "HTML",
    emoji: "📄",
    modules: [
      {
        id: "html-basics",
        title: "HTML Basics",
        level: "Beginner",
        items: [
          { id: "html-intro", type: "lesson", title: "Intro to HTML", topic: "fundamentals", difficulty: 1, estMins: 8 },
          { id: "html-tags", type: "lesson", title: "Common Tags", topic: "elements", difficulty: 1, estMins: 12 },
          { id: "html-quiz-1", type: "quiz", title: "HTML Quiz", topic: "fundamentals", difficulty: 1, estMins: 10 },
        ],
      },
    ],
  },
  css: {
    title: "CSS",
    emoji: "🎨",
    modules: [
      {
        id: "css-basics",
        title: "CSS Basics",
        level: "Beginner",
        items: [
          { id: "css-selectors", type: "lesson", title: "Selectors & Properties", topic: "selectors", difficulty: 1, estMins: 10 },
          { id: "css-box", type: "lesson", title: "Box Model", topic: "layout", difficulty: 2, estMins: 12 },
          { id: "css-quiz-1", type: "quiz", title: "CSS Basics Quiz", topic: "fundamentals", difficulty: 2, estMins: 10 },
        ],
      },
    ],
  },
  javascript: {
    title: "JavaScript",
    emoji: "📜",
    modules: [
      {
        id: "js-basics",
        title: "JavaScript Basics",
        level: "Beginner",
        items: [

          { id: "js-intro", type: "lesson", title: "Intro to JS", topic: "fundamentals", difficulty: 1, estMins: 10 },
          { id: "js-vars", type: "lesson", title: "Variables & Scope", topic: "fundamentals", difficulty: 2, estMins: 12 },
          { id: "js-quiz-1", type: "quiz", title: "JS Basics Quiz", topic: "fundamentals", difficulty: 2, estMins: 10 },
        ],
      },
      {
        id: "js-adv",
        title: "Advanced JS",
        level: "Intermediate",
        items: [
          { id: "js-async", type: "lesson", title: "Async & Promises", topic: "async", difficulty: 3, estMins: 15 },
          { id: "js-dom", type: "lesson", title: "DOM Manipulation", topic: "dom", difficulty: 3, estMins: 18 },
          { id: "js-quiz-2", type: "quiz", title: "Advanced Quiz", topic: "advanced", difficulty: 3, estMins: 12 },
        ],
      },
    ],
  },
  go: {
    title: "Go",
    emoji: "🌊",
    modules: [
      {
        id: "go-basics",
        title: "Go Basics",
        level: "Beginner",
        items: [
          { id: "go-intro", type: "lesson", title: "Intro to Go", topic: "fundamentals", difficulty: 1, estMins: 10 },
          { id: "go-vars", type: "lesson", title: "Variables & Types", topic: "fundamentals", difficulty: 2, estMins: 12 },
          { id: "go-quiz-1", type: "quiz", title: "Go Basics Quiz", topic: "fundamentals", difficulty: 2, estMins: 10 },
        ],
      },
      {
        id: "go-adv",
        title: "Advanced Go",
        level: "Intermediate",
        items: [
          { id: "go-concurrency", type: "lesson", title: "Concurrency & Goroutines", topic: "concurrency", difficulty: 3, estMins: 18 },
          { id: "go-channels", type: "lesson", title: "Channels", topic: "concurrency", difficulty: 3, estMins: 20 },
          { id: "go-quiz-2", type: "quiz", title: "Advanced Quiz", topic: "advanced", difficulty: 3, estMins: 12 },
        ],
      },
    ],
  },
  rust: {
    title: "Rust",
    emoji: "🦀",
    modules: [
      {
        id: "rust-basics",
        title: "Rust Basics",
        level: "Beginner",
        items: [
          { id: "rust-intro", type: "lesson", title: "Intro to Rust", topic: "fundamentals", difficulty: 1, estMins: 10 },
          { id: "rust-vars", type: "lesson", title: "Ownership & Borrowing", topic: "memory", difficulty: 2, estMins: 15 },
          { id: "rust-quiz-1", type: "quiz", title: "Rust Basics Quiz", topic: "fundamentals", difficulty: 2, estMins: 10 },
        ],
      },
      {
        id: "rust-adv",
        title: "Advanced Rust",
        level: "Intermediate",
        items: [
          { id: "rust-traits", type: "lesson", title: "Traits & Generics", topic: "advanced", difficulty: 3, estMins: 18 },
          { id: "rust-lifetimes", type: "lesson", title: "Lifetimes", topic: "advanced", difficulty: 3, estMins: 20 },
          { id: "rust-quiz-2", type: "quiz", title: "Advanced Quiz", topic: "advanced", difficulty: 3, estMins: 12 },
        ],
      },
    ],
  },
};