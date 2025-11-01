// Comprehensive course catalog with 40+ courses
export const COMPREHENSIVE_COURSES = {
  // Programming Languages
  python: {
    title: "Python",
    icon: "🐍",
    category: "Programming Languages",
    description: "Learn Python programming from basics to advanced",
    totalLessons: 45,
    estimatedHours: 60,
    levels: {
      beginner: {
        title: "Python Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Python",
          "Variables and Data Types", 
          "Operators (arithmetic, logical, bitwise)",
          "Control Flow (if-else, loops)",
          "Functions and Scope",
          "Lists and Tuples",
          "Dictionaries and Sets",
          "String Manipulation",
          "File I/O Operations",
          "Error Handling Basics"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=_uQrJ0TkZlc", // Python Full Course
          "https://www.youtube.com/watch?v=rfscVS0vtbw", // Python Beginner Tutorial
          "https://www.youtube.com/watch?v=kqtD5dpn9C8" // Python Crash Course
        ]
      },
      intermediate: {
        title: "Python Intermediate",
        color: "#FF9800", 
        topics: [
          "Object-Oriented Programming",
          "Classes and Objects",
          "Inheritance and Polymorphism",
          "Modules and Packages",
          "Decorators",
          "Generators and Iterators",
          "Regular Expressions",
          "Working with APIs",
          "Database Operations",
          "Web Scraping Basics"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=ZDa-Z5JzLYM", // OOP in Python
          "https://www.youtube.com/watch?v=jCzT9XFZ5bw", // Intermediate Python
          "https://www.youtube.com/watch?v=HGOBQPFzWKo" // Python Decorators
        ]
      },
      advanced: {
        title: "Python Advanced",
        color: "#F44336",
        topics: [
          "Advanced OOP Concepts",
          "Metaclasses",
          "Context Managers",
          "Multithreading and Multiprocessing",
          "Asyncio and Async Programming",
          "Testing with Pytest",
          "Performance Optimization",
          "Memory Management",
          "Design Patterns in Python",
          "Building CLI Applications"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Ej_02ICOIgs", // Advanced Python
          "https://www.youtube.com/watch?v=IEEhzQoKtQU", // Python Threading
          "https://www.youtube.com/watch?v=t5Bo1Je9EmE" // Async Python
        ]
      }
    }
  },

  java: {
    title: "Java",
    icon: "☕",
    category: "Programming Languages", 
    description: "Master Java programming and enterprise development",
    totalLessons: 50,
    estimatedHours: 70,
    levels: {
      beginner: {
        title: "Java Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Java",
          "History of Java, JDK, JRE, JVM",
          "Java program structure",
          "Variables and Data Types",
          "Type Casting",
          "Operators (arithmetic, logical, bitwise, ternary)",
          "Control Flow (if-else, switch)",
          "Loops (for, while, do-while, for-each)",
          "Arrays (1D, 2D)",
          "String, StringBuffer, StringBuilder",
          "Methods and Overloading",
          "Scanner and Input/Output"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=eIrMbAQSU34", // Java Full Course
          "https://www.youtube.com/watch?v=grEKMHGYyns", // Java Basics
          "https://www.youtube.com/watch?v=A74TOX803D0" // Java Tutorial
        ]
      },
      intermediate: {
        title: "Java Core & OOP",
        color: "#FF9800",
        topics: [
          "Object-Oriented Programming",
          "Classes and Objects",
          "Constructors",
          "Inheritance",
          "Polymorphism (compile-time & runtime)",
          "Encapsulation",
          "Abstraction (abstract classes, interfaces)",
          "Keywords (static, final, super, this)",
          "Exception Handling (try-catch-finally)",
          "Packages and Access Modifiers",
          "Collections Framework",
          "Generics and Wildcards",
          "File Handling",
          "Serialization"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=xk4_1vDrzzo", // Java OOP
          "https://www.youtube.com/watch?v=BSVKUk58K6U", // Java Collections
          "https://www.youtube.com/watch?v=le3OjjgLIKU" // Exception Handling
        ]
      },
      advanced: {
        title: "Java Advanced",
        color: "#F44336", 
        topics: [
          "Multithreading and Concurrency",
          "Thread class and Runnable interface",
          "Synchronization",
          "Executor Framework",
          "JVM Internals",
          "Garbage Collection",
          "Design Patterns",
          "Reflection and Annotations",
          "JDBC and Database Connectivity",
          "Spring Framework Basics",
          "Spring Boot",
          "REST APIs",
          "Microservices Concepts",
          "Testing with JUnit",
          "Performance Tuning"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=WnYKi9rHer0", // Java Multithreading
          "https://www.youtube.com/watch?v=vtPkZShrvXQ", // Spring Boot
          "https://www.youtube.com/watch?v=35EQXmHKZYs" // Java Design Patterns
        ]
      }
    }
  },

  javascript: {
    title: "JavaScript",
    icon: "📜",
    category: "Programming Languages",
    description: "Learn modern JavaScript and web development",
    totalLessons: 40,
    estimatedHours: 55,
    levels: {
      beginner: {
        title: "JavaScript Fundamentals",
        color: "#4CAF50",
        topics: [
          "Introduction to JavaScript",
          "Variables (var, let, const)",
          "Data Types and Type Conversion",
          "Operators and Expressions",
          "Control Structures",
          "Functions and Scope",
          "Arrays and Array Methods",
          "Objects and Properties",
          "Strings and String Methods",
          "Basic DOM Manipulation"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=PkZNo7MFNFg", // JavaScript Full Course
          "https://www.youtube.com/watch?v=hdI2bqOjy3c", // JavaScript Crash Course
          "https://www.youtube.com/watch?v=W6NZfCO5SIk" // JavaScript Basics
        ]
      },
      intermediate: {
        title: "Modern JavaScript", 
        color: "#FF9800",
        topics: [
          "ES6+ Features",
          "Arrow Functions",
          "Template Literals",
          "Destructuring",
          "Spread and Rest Operators",
          "Promises and Async/Await",
          "Modules (import/export)",
          "Classes and Inheritance",
          "Error Handling",
          "Local Storage and Session Storage",
          "Fetch API",
          "JSON Manipulation"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=NCwa_xi0Uuc", // Modern JavaScript
          "https://www.youtube.com/watch?v=DHvZLI7Db8E", // ES6 Features
          "https://www.youtube.com/watch?v=PoRJizFvM7s" // Async JavaScript
        ]
      },
      advanced: {
        title: "Advanced JavaScript",
        color: "#F44336",
        topics: [
          "Closures and Lexical Scope",
          "Prototype and Prototype Chain",
          "Event Loop and Asynchronous JavaScript",
          "Higher-Order Functions",
          "Functional Programming Concepts",
          "Design Patterns in JavaScript",
          "Performance Optimization",
          "Testing (Jest, Mocha)",
          "Build Tools (Webpack, Babel)",
          "Advanced DOM Manipulation",
          "Memory Management",
          "Security Best Practices"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Bv_5Zv5c-Ts", // Advanced JavaScript
          "https://www.youtube.com/watch?v=3PHXvlpOkf4", // JavaScript Closures
          "https://www.youtube.com/watch?v=8aGhZQkoFbQ" // Event Loop
        ]
      }
    }
  },

  react: {
    title: "React",
    icon: "⚛️",
    category: "Frontend Frameworks",
    description: "Build modern web applications with React",
    totalLessons: 35,
    estimatedHours: 50,
    levels: {
      beginner: {
        title: "React Fundamentals",
        color: "#4CAF50",
        topics: [
          "Introduction to React",
          "JSX Syntax",
          "Components and Props",
          "State and useState Hook",
          "Event Handling",
          "Conditional Rendering",
          "Lists and Keys",
          "Forms and Controlled Components",
          "Component Lifecycle",
          "Basic Styling in React"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Ke90Tje7VS0", // React Full Course
          "https://www.youtube.com/watch?v=SqcY0GlETPk", // React Tutorial
          "https://www.youtube.com/watch?v=DLX62G4lc44" // React Crash Course
        ]
      },
      intermediate: {
        title: "React Hooks & State Management",
        color: "#FF9800",
        topics: [
          "useEffect Hook",
          "useContext Hook",
          "useReducer Hook",
          "Custom Hooks",
          "React Router",
          "State Management (Context API)",
          "API Integration",
          "Error Boundaries",
          "Performance Optimization",
          "Testing React Components"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=TNhaISOUy6Q", // React Hooks
          "https://www.youtube.com/watch?v=35lXWvCuM8o", // React Router
          "https://www.youtube.com/watch?v=hQAHSlTtcmY" // React Context
        ]
      },
      advanced: {
        title: "Advanced React",
        color: "#F44336",
        topics: [
          "Redux and Redux Toolkit",
          "Advanced Performance Optimization",
          "Server-Side Rendering (Next.js)",
          "React Suspense and Lazy Loading",
          "Advanced Patterns (HOCs, Render Props)",
          "TypeScript with React",
          "Testing (Jest, React Testing Library)",
          "Deployment Strategies",
          "Progressive Web Apps",
          "React Native Basics"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=CVpUuw9XSjY", // Redux Tutorial
          "https://www.youtube.com/watch?v=Ullkm6wq5dM", // Next.js Course
          "https://www.youtube.com/watch?v=A8SzNVmxpwI" // React Testing
        ]
      }
    }
  },

  nodejs: {
    title: "Node.js",
    icon: "🌿",
    category: "Backend Technologies",
    description: "Server-side JavaScript development with Node.js",
    totalLessons: 30,
    estimatedHours: 45,
    levels: {
      beginner: {
        title: "Node.js Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Node.js",
          "Node.js Runtime Environment",
          "NPM and Package Management",
          "Modules (CommonJS, ES6)",
          "File System Operations",
          "Path and URL Modules",
          "HTTP Module",
          "Creating Basic Server",
          "Environment Variables",
          "Debugging Node.js Applications"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=TlB_eWDSMt4", // Node.js Full Course
          "https://www.youtube.com/watch?v=fBNz5xF-Kx4", // Node.js Crash Course
          "https://www.youtube.com/watch?v=RLtyhwFtXQA" // Node.js Tutorial
        ]
      },
      intermediate: {
        title: "Express & APIs",
        color: "#FF9800",
        topics: [
          "Express.js Framework",
          "Routing and Middleware",
          "RESTful API Development",
          "Request and Response Objects",
          "Template Engines (EJS, Handlebars)",
          "Database Integration (MongoDB, MySQL)",
          "Authentication and Authorization",
          "Session Management",
          "Error Handling",
          "API Documentation"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=L72fhGm1tfE", // Express.js Course
          "https://www.youtube.com/watch?v=pKd0Rpw7O48", // REST API Tutorial
          "https://www.youtube.com/watch?v=0oXYLzuucwE" // MongoDB with Node.js
        ]
      },
      advanced: {
        title: "Advanced Node.js",
        color: "#F44336",
        topics: [
          "Microservices Architecture",
          "GraphQL APIs",
          "Real-time Applications (Socket.io)",
          "Clustering and PM2",
          "Performance Optimization",
          "Testing (Mocha, Chai, Jest)",
          "Security Best Practices",
          "Docker and Containerization",
          "CI/CD Pipelines",
          "Monitoring and Logging"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=EN6Dx22cPRI", // Microservices
          "https://www.youtube.com/watch?v=BcLNfwF04Kw", // GraphQL Node.js
          "https://www.youtube.com/watch?v=1BfCnjr_Vjg" // Socket.io Tutorial
        ]
      }
    }
  },

  angular: {
    title: "Angular",
    icon: "🅰️",
    category: "Frontend Frameworks",
    description: "Build enterprise applications with Angular",
    totalLessons: 40,
    estimatedHours: 60,
    levels: {
      beginner: {
        title: "Angular Fundamentals",
        color: "#4CAF50",
        topics: [
          "Introduction to Angular",
          "Angular CLI",
          "Components and Templates",
          "Data Binding",
          "Directives",
          "Services and Dependency Injection",
          "Routing",
          "Forms (Template-driven)",
          "HTTP Client",
          "Component Lifecycle"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=k5E2AVpwsko", // Angular Full Course
          "https://www.youtube.com/watch?v=3qBXWUpoPHo", // Angular Crash Course
          "https://www.youtube.com/watch?v=Fdf5aTYRW0E" // Angular Tutorial
        ]
      },
      intermediate: {
        title: "Advanced Angular",
        color: "#FF9800",
        topics: [
          "Reactive Forms",
          "Advanced Routing",
          "Guards and Resolvers",
          "Custom Directives",
          "Pipes",
          "RxJS and Observables",
          "State Management",
          "Testing (Jasmine, Karma)",
          "Performance Optimization",
          "Angular Material"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=I317BhehZKM", // Angular RxJS
          "https://www.youtube.com/watch?v=LKVHFhuxZHU", // Angular Testing
          "https://www.youtube.com/watch?v=Y0CC4a3d1ZY" // Angular Advanced
        ]
      },
      advanced: {
        title: "Angular Expert",
        color: "#F44336",
        topics: [
          "Micro Frontends",
          "Angular Universal (SSR)",
          "PWA with Angular",
          "Custom Elements",
          "Angular Libraries",
          "NgRx Store",
          "Internationalization (i18n)",
          "Advanced Testing Strategies",
          "Performance Tuning",
          "Enterprise Patterns"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=vGE7_xP1yNM", // Angular Universal
          "https://www.youtube.com/watch?v=rpKPjK0Nqp0", // NgRx Tutorial
          "https://www.youtube.com/watch?v=qYJdEa6tBSM" // Angular PWA
        ]
      }
    }
  },

  vue: {
    title: "Vue.js",
    icon: "💚",
    category: "Frontend Frameworks",
    description: "Progressive framework for building user interfaces",
    totalLessons: 30,
    estimatedHours: 45,
    levels: {
      beginner: {
        title: "Vue.js Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Vue.js",
          "Vue Instance",
          "Template Syntax",
          "Data Binding",
          "Computed Properties",
          "Methods and Event Handling",
          "Conditional Rendering",
          "List Rendering",
          "Class and Style Bindings",
          "Component Basics"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=FXpIoQ_rT_c", // Vue.js Full Course
          "https://www.youtube.com/watch?v=qZXt1Aom3Cs", // Vue.js Crash Course
          "https://www.youtube.com/watch?v=4deVCNJq3qc" // Vue.js Tutorial
        ]
      },
      intermediate: {
        title: "Vue.js Intermediate",
        color: "#FF9800",
        topics: [
          "Component Communication",
          "Props and Events",
          "Slots",
          "Vue Router",
          "Vuex State Management",
          "Forms and Validation",
          "Transitions and Animations",
          "Custom Directives",
          "Mixins",
          "API Integration"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Wy9q22isx3U", // Vue Router
          "https://www.youtube.com/watch?v=5lVQgZzLMHc", // Vuex Tutorial
          "https://www.youtube.com/watch?v=WFpnhUKfG34" // Vue Components
        ]
      },
      advanced: {
        title: "Vue.js Advanced",
        color: "#F44336",
        topics: [
          "Vue 3 Composition API",
          "Custom Hooks",
          "Teleport",
          "Suspense",
          "Vue 3 Reactivity",
          "Testing (Vue Test Utils)",
          "Performance Optimization",
          "SSR with Nuxt.js",
          "TypeScript with Vue",
          "Vue Ecosystem"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=bwItFdPt-6M", // Vue 3 Course
          "https://www.youtube.com/watch?v=jdaaDPZ8jBw", // Composition API
          "https://www.youtube.com/watch?v=Cjxr14G2RpM" // Nuxt.js
        ]
      }
    }
  },

  typescript: {
    title: "TypeScript",
    icon: "🔷",
    category: "Programming Languages",
    description: "Typed superset of JavaScript",
    totalLessons: 25,
    estimatedHours: 35,
    levels: {
      beginner: {
        title: "TypeScript Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to TypeScript",
          "Type Annotations",
          "Basic Types",
          "Interfaces",
          "Classes",
          "Functions",
          "Arrays and Tuples",
          "Enums",
          "Union and Intersection Types",
          "Type Assertions"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=BwuLxPH8IDs", // TypeScript Full Course
          "https://www.youtube.com/watch?v=BCg4U1FzODs", // TypeScript Crash Course
          "https://www.youtube.com/watch?v=WlxcujsvcIY" // TypeScript Tutorial
        ]
      },
      intermediate: {
        title: "TypeScript Intermediate",
        color: "#FF9800",
        topics: [
          "Generics",
          "Advanced Types",
          "Mapped Types",
          "Conditional Types",
          "Utility Types",
          "Decorators",
          "Modules and Namespaces",
          "Declaration Files",
          "TypeScript with React",
          "Type Guards"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=nViEqpgwxHE", // TypeScript Generics
          "https://www.youtube.com/watch?v=pReR2yVSJlU", // Advanced TypeScript
          "https://www.youtube.com/watch?v=ydkQlJhodio" // TypeScript React
        ]
      },
      advanced: {
        title: "TypeScript Advanced",
        color: "#F44336",
        topics: [
          "Template Literal Types",
          "Type Programming",
          "Advanced Conditional Types",
          "Recursive Types",
          "TypeScript Compiler API",
          "Custom Transformers",
          "Performance Optimization",
          "Strict Mode",
          "Migration Strategies",
          "Best Practices"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=BNaOSHYNmGM", // Advanced TypeScript
          "https://www.youtube.com/watch?v=zhEhgWdYdq4", // TypeScript Deep Dive
          "https://www.youtube.com/watch?v=rAy_3SIqT-E" // TypeScript Patterns
        ]
      }
    }
  },

  mongodb: {
    title: "MongoDB",
    icon: "🍃",
    category: "Databases",
    description: "NoSQL database for modern applications",
    totalLessons: 20,
    estimatedHours: 30,
    levels: {
      beginner: {
        title: "MongoDB Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to NoSQL",
          "MongoDB Installation",
          "Documents and Collections",
          "CRUD Operations",
          "Query Operators",
          "Sorting and Limiting",
          "Indexes",
          "Data Modeling",
          "Mongoose ODM",
          "Basic Aggregation"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=ExcRbA7fy_A", // MongoDB Full Course
          "https://www.youtube.com/watch?v=9OPP_1eAENg", // MongoDB Crash Course
          "https://www.youtube.com/watch?v=ofme2o29ngU" // MongoDB Tutorial
        ]
      },
      intermediate: {
        title: "MongoDB Intermediate",
        color: "#FF9800",
        topics: [
          "Advanced Queries",
          "Aggregation Pipeline",
          "Text Search",
          "Geospatial Queries",
          "Replication",
          "Sharding",
          "Performance Optimization",
          "Security",
          "Backup and Recovery",
          "MongoDB Atlas"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=J6mDkcqU_ZE", // MongoDB Aggregation
          "https://www.youtube.com/watch?v=KKyag6t98g8", // MongoDB Advanced
          "https://www.youtube.com/watch?v=fbYExfeFsI0" // MongoDB Atlas
        ]
      },
      advanced: {
        title: "MongoDB Advanced",
        color: "#F44336",
        topics: [
          "Advanced Aggregation",
          "Change Streams",
          "Transactions",
          "GridFS",
          "MongoDB Ops Manager",
          "Monitoring and Profiling",
          "Schema Design Patterns",
          "Data Migration",
          "High Availability",
          "Production Best Practices"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=GtD93tVZDX4", // MongoDB Production
          "https://www.youtube.com/watch?v=IJWS_dVmE2c", // MongoDB Performance
          "https://www.youtube.com/watch?v=leNCfU5SYR8" // MongoDB Expert
        ]
      }
    }
  },

  mysql: {
    title: "MySQL",
    icon: "🐬",
    category: "Databases",
    description: "Relational database management system",
    totalLessons: 25,
    estimatedHours: 35,
    levels: {
      beginner: {
        title: "MySQL Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Relational Databases",
          "MySQL Installation and Setup",
          "Database and Table Creation",
          "Data Types",
          "INSERT, UPDATE, DELETE",
          "SELECT Queries",
          "WHERE Clauses",
          "ORDER BY and GROUP BY",
          "Joins (INNER, LEFT, RIGHT)",
          "Primary and Foreign Keys"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=HXV3zeQKqGY", // MySQL Full Course
          "https://www.youtube.com/watch?v=9ylj9NR0Lcg", // MySQL Crash Course
          "https://www.youtube.com/watch?v=7S_tz1z_5bA" // MySQL Tutorial
        ]
      },
      intermediate: {
        title: "MySQL Intermediate",
        color: "#FF9800",
        topics: [
          "Advanced Joins",
          "Subqueries",
          "Views",
          "Stored Procedures",
          "Functions",
          "Triggers",
          "Indexes and Performance",
          "Normalization",
          "Transactions and ACID",
          "User Management"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=rfcVKVSQaC8", // MySQL Advanced
          "https://www.youtube.com/watch?v=pHQDMyeDCPI", // Stored Procedures
          "https://www.youtube.com/watch?v=EE8WoYRJ3Sc" // MySQL Optimization
        ]
      },
      advanced: {
        title: "MySQL Advanced",
        color: "#F44336",
        topics: [
          "Query Optimization",
          "Performance Tuning",
          "Replication",
          "Clustering",
          "Partitioning",
          "Backup and Recovery",
          "Security Best Practices",
          "Monitoring and Maintenance",
          "High Availability",
          "Cloud MySQL (RDS, Aurora)"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=lxEdaElkQhQ", // MySQL Performance
          "https://www.youtube.com/watch?v=x5IUMzNODrU", // MySQL DBA
          "https://www.youtube.com/watch?v=sKUTXZ7O8rs" // MySQL Clustering
        ]
      }
    }
  },

  git: {
    title: "Git",
    icon: "📂",
    category: "Developer Tools",
    description: "Version control and collaboration",
    totalLessons: 15,
    estimatedHours: 20,
    levels: {
      beginner: {
        title: "Git Fundamentals",
        color: "#4CAF50",
        topics: [
          "Introduction to Version Control",
          "Git Installation and Setup",
          "Repository Initialization",
          "Basic Commands (add, commit, push)",
          "Working Directory vs Staging",
          "Git Status and Log",
          "Cloning Repositories",
          "Remote Repositories",
          "Basic Branching",
          "GitHub Basics"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=8JJ101D3knE", // Git Full Course
          "https://www.youtube.com/watch?v=SWYqp7iY_Tc", // Git Crash Course
          "https://www.youtube.com/watch?v=HVsySz-h9r4" // Git Tutorial
        ]
      },
      intermediate: {
        title: "Git Collaboration",
        color: "#FF9800",
        topics: [
          "Advanced Branching",
          "Merging Strategies",
          "Conflict Resolution",
          "Git Rebase",
          "Stashing",
          "Tagging",
          "Git Hooks",
          "GitHub/GitLab Workflows",
          "Pull Requests",
          "Code Reviews"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Uszj_k0DGsg", // Git Branching
          "https://www.youtube.com/watch?v=FyAAIHHClqI", // Git Workflows
          "https://www.youtube.com/watch?v=MnUd31TvBoU" // Git Collaboration
        ]
      },
      advanced: {
        title: "Git Mastery",
        color: "#F44336",
        topics: [
          "Git Internals",
          "Advanced Rebase Techniques",
          "Cherry Picking",
          "Subtrees and Submodules",
          "Git Bisect",
          "Custom Git Commands",
          "Git Server Setup",
          "Large File Handling (LFS)",
          "Git Workflows (Gitflow, etc.)",
          "Git Automation"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=qsTthZi23VE", // Git Advanced
          "https://www.youtube.com/watch?v=0SJCYPsef54", // Git Internals
          "https://www.youtube.com/watch?v=aJnFGMclhU8" // Git Mastery
        ]
      }
    }
  },

  php: {
    title: "PHP",
    icon: "🐘",
    category: "Backend Technologies",
    description: "Server-side scripting language",
    totalLessons: 35,
    estimatedHours: 50,
    levels: {
      beginner: {
        title: "PHP Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to PHP",
          "PHP Syntax",
          "Variables and Constants",
          "Data Types",
          "Operators",
          "Control Structures",
          "Functions",
          "Arrays",
          "Superglobals",
          "Form Handling",
          "File Operations"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=OK_JCtrrv-c", // PHP Full Course
          "https://www.youtube.com/watch?v=6EukZDFE_Zg", // PHP Crash Course
          "https://www.youtube.com/watch?v=a7_WFUlFS94" // PHP Tutorial
        ]
      },
      intermediate: {
        title: "PHP OOP & Database",
        color: "#FF9800",
        topics: [
          "Object-Oriented PHP",
          "Classes and Objects",
          "Inheritance",
          "Interfaces and Traits",
          "Exception Handling",
          "Database Connectivity (PDO)",
          "Sessions and Cookies",
          "Regular Expressions",
          "JSON and XML",
          "Email Handling"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=LuWxwLk8StM", // PHP OOP
          "https://www.youtube.com/watch?v=BUCiSSyIGGU", // PHP Database
          "https://www.youtube.com/watch?v=nkP_WgPg9nI" // PHP Intermediate
        ]
      },
      advanced: {
        title: "PHP Advanced",
        color: "#F44336",
        topics: [
          "Design Patterns",
          "Composer and Autoloading",
          "PSR Standards",
          "Framework Development",
          "Laravel Framework",
          "API Development",
          "Testing (PHPUnit)",
          "Performance Optimization",
          "Security Best Practices",
          "Deployment"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=MFh0Fd7BsjE", // Laravel Course
          "https://www.youtube.com/watch?v=EU7PRmCpx-0", // PHP Advanced
          "https://www.youtube.com/watch?v=rQKqHxAA6zI" // PHP Security
        ]
      }
    }
  },

  // Add more comprehensive courses...
  html: {
    title: "HTML",
    icon: "📄",
    category: "Frontend Technologies",
    description: "Structure web content with HTML",
    totalLessons: 20,
    estimatedHours: 25,
    levels: {
      beginner: {
        title: "HTML Fundamentals",
        color: "#4CAF50",
        topics: [
          "Introduction to HTML",
          "HTML Document Structure",
          "HTML Elements and Tags",
          "Text Formatting",
          "Links and Navigation",
          "Images and Media",
          "Lists (Ordered, Unordered)",
          "Tables",
          "Forms and Input Elements",
          "Semantic HTML5 Elements"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=qz0aGYrrlhU", // HTML Full Course
          "https://www.youtube.com/watch?v=pQN-pnXPaVg", // HTML Crash Course
          "https://www.youtube.com/watch?v=UB1O30fR-EE" // HTML Tutorial
        ]
      },
      intermediate: {
        title: "Advanced HTML",
        color: "#FF9800",
        topics: [
          "HTML5 APIs",
          "Canvas Element",
          "Audio and Video Elements",
          "Geolocation API",
          "Local Storage",
          "Web Workers",
          "Progressive Web Apps",
          "Accessibility (ARIA)",
          "SEO Optimization",
          "Performance Best Practices"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Y41RQrJiMZ4", // HTML5 APIs
          "https://www.youtube.com/watch?v=EO6OkltgudE", // HTML Canvas
          "https://www.youtube.com/watch?v=jfKfPfyJRdk" // Web Accessibility
        ]
      },
      advanced: {
        title: "Modern HTML",
        color: "#F44336",
        topics: [
          "Web Components",
          "Custom Elements",
          "Shadow DOM",
          "HTML Templates",
          "Module Scripts",
          "Service Workers",
          "Push Notifications",
          "Advanced SEO Techniques",
          "Performance Monitoring",
          "Browser Compatibility"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=PCWaFLy3VUo", // Web Components
          "https://www.youtube.com/watch?v=2KhRmFHLuCE", // Service Workers
          "https://www.youtube.com/watch?v=ksXwaWHCW6k" // Modern HTML
        ]
      }
    }
  },

  css: {
    title: "CSS",
    icon: "🎨",
    category: "Frontend Technologies",
    description: "Style and layout web pages with CSS",
    totalLessons: 30,
    estimatedHours: 40,
    levels: {
      beginner: {
        title: "CSS Fundamentals",
        color: "#4CAF50",
        topics: [
          "Introduction to CSS",
          "CSS Syntax and Selectors",
          "Colors and Backgrounds",
          "Text and Font Styling",
          "Box Model",
          "Margins, Padding, Borders",
          "Display Properties",
          "Positioning (Static, Relative, Absolute)",
          "Float and Clear",
          "Basic Responsive Design"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=yfoY53QXEnI", // CSS Full Course
          "https://www.youtube.com/watch?v=1Rs2ND1ryYc", // CSS Crash Course
          "https://www.youtube.com/watch?v=OXGznpKZ_sA" // CSS Tutorial
        ]
      },
      intermediate: {
        title: "Advanced CSS",
        color: "#FF9800",
        topics: [
          "Flexbox Layout",
          "CSS Grid",
          "CSS Transitions",
          "CSS Animations",
          "Transform Property",
          "Pseudo-classes and Pseudo-elements",
          "CSS Variables",
          "Media Queries",
          "CSS Preprocessors (SASS/SCSS)",
          "CSS Methodologies (BEM, OOCSS)"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=JJSoEo8JSnc", // Flexbox Tutorial
          "https://www.youtube.com/watch?v=9zBsdzdE4sM", // CSS Grid
          "https://www.youtube.com/watch?v=zHUpx90NerM" // CSS Animations
        ]
      },
      advanced: {
        title: "Modern CSS",
        color: "#F44336",
        topics: [
          "CSS-in-JS Solutions",
          "Styled Components",
          "CSS Modules",
          "PostCSS",
          "CSS Houdini",
          "Container Queries",
          "CSS Logical Properties",
          "Advanced Grid Techniques",
          "Performance Optimization",
          "Cross-browser Compatibility"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Xgnfky9-e68", // Modern CSS
          "https://www.youtube.com/watch?v=qm0IfG1GyZU", // CSS-in-JS
          "https://www.youtube.com/watch?v=TUD1AWZVgQ8" // CSS Performance
        ]
      }
    }
  },

  cpp: {
    title: "C++",
    icon: "💻",
    category: "Programming Languages",
    description: "Powerful systems programming language",
    totalLessons: 35,
    estimatedHours: 50,
    levels: {
      beginner: {
        title: "C++ Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to C++",
          "C++ Syntax and Structure",
          "Variables and Data Types",
          "Operators (Arithmetic, Logical, Bitwise)",
          "Control Flow (if-else, switch)",
          "Loops (for, while, do-while)",
          "Functions",
          "Arrays and Strings",
          "Pointers Basics",
          "Memory Management"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=vLnPwxZdW4Y", // C++ Full Course
          "https://www.youtube.com/watch?v=8jLOx1hD3_o", // C++ Crash Course
          "https://www.youtube.com/watch?v=Rub-JsjMhWY" // C++ Tutorial
        ]
      },
      intermediate: {
        title: "Object-Oriented C++",
        color: "#FF9800",
        topics: [
          "Classes and Objects",
          "Constructors and Destructors",
          "Inheritance",
          "Polymorphism",
          "Operator Overloading",
          "Templates",
          "Exception Handling",
          "File I/O",
          "STL Containers",
          "Algorithms and Iterators"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=wN0x9eZLix4", // C++ OOP
          "https://www.youtube.com/watch?v=2BP8NhxjrO0", // C++ STL
          "https://www.youtube.com/watch?v=8jLOx1hD3_o" // C++ Intermediate
        ]
      },
      advanced: {
        title: "Advanced C++",
        color: "#F44336",
        topics: [
          "Smart Pointers",
          "Move Semantics",
          "Lambda Expressions",
          "Multithreading",
          "Concurrency",
          "Design Patterns",
          "Template Metaprogramming",
          "Performance Optimization",
          "C++11/14/17/20 Features",
          "Cross-platform Development"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=32BtvwS4DU4", // Modern C++
          "https://www.youtube.com/watch?v=LL8wkskDlbs", // C++ Multithreading
          "https://www.youtube.com/watch?v=NzDwUK0PlI0" // C++ Advanced
        ]
      }
    }
  },

  go: {
    title: "Go",
    icon: "🌊",
    category: "Programming Languages",
    description: "Simple and efficient systems language",
    totalLessons: 30,
    estimatedHours: 45,
    levels: {
      beginner: {
        title: "Go Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Go",
          "Go Installation and Setup",
          "Basic Syntax",
          "Variables and Constants",
          "Data Types",
          "Operators",
          "Control Structures",
          "Functions",
          "Arrays and Slices",
          "Maps and Structs"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=YS4e4q9oBaU", // Go Full Course
          "https://www.youtube.com/watch?v=8uiZC0l4Ajw", // Go Crash Course
          "https://www.youtube.com/watch?v=CF9S4QZuV30" // Go Tutorial
        ]
      },
      intermediate: {
        title: "Go Intermediate",
        color: "#FF9800",
        topics: [
          "Pointers",
          "Methods and Interfaces",
          "Error Handling",
          "Goroutines",
          "Channels",
          "Select Statement",
          "File I/O",
          "JSON Handling",
          "HTTP Servers",
          "Testing in Go"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=f6kdp27TYZs", // Go Concurrency
          "https://www.youtube.com/watch?v=yyUHQIec83I", // Go Web Development
          "https://www.youtube.com/watch?v=8uiZC0l4Ajw" // Go Intermediate
        ]
      },
      advanced: {
        title: "Advanced Go",
        color: "#F44336",
        topics: [
          "Advanced Concurrency Patterns",
          "Context Package",
          "Reflection",
          "Generics (Go 1.18+)",
          "Performance Profiling",
          "Microservices with Go",
          "Database Integration",
          "REST APIs",
          "GraphQL",
          "Deployment and DevOps"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=5bYO60-qYDU", // Advanced Go
          "https://www.youtube.com/watch?v=KBzlmuB0Xhc", // Go Microservices
          "https://www.youtube.com/watch?v=VC9Nm1S3HEI" // Go Production
        ]
      }
    }
  },

  rust: {
    title: "Rust",
    icon: "🦀",
    category: "Programming Languages",
    description: "Safe and concurrent systems programming",
    totalLessons: 35,
    estimatedHours: 55,
    levels: {
      beginner: {
        title: "Rust Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Rust",
          "Rust Installation",
          "Hello World",
          "Variables and Mutability",
          "Data Types",
          "Functions",
          "Control Flow",
          "Ownership",
          "Borrowing",
          "Slices"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=zF34dRivLOw", // Rust Full Course
          "https://www.youtube.com/watch?v=MsocPEZBd-M", // Rust Crash Course
          "https://www.youtube.com/watch?v=2hXNd6x9sZs" // Rust Tutorial
        ]
      },
      intermediate: {
        title: "Rust Intermediate",
        color: "#FF9800",
        topics: [
          "Structs",
          "Enums",
          "Methods",
          "Pattern Matching",
          "Error Handling",
          "Generic Types",
          "Traits",
          "Lifetimes",
          "Collections",
          "Smart Pointers"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=U1EFgCNLDB8", // Rust Ownership
          "https://www.youtube.com/watch?v=DnT_7M7L7vo", // Rust Traits
          "https://www.youtube.com/watch?v=MsocPEZBd-M" // Rust Intermediate
        ]
      },
      advanced: {
        title: "Advanced Rust",
        color: "#F44336",
        topics: [
          "Unsafe Rust",
          "Macros",
          "Async Programming",
          "WebAssembly",
          "FFI (Foreign Function Interface)",
          "Embedded Systems",
          "Performance Optimization",
          "Testing and Documentation",
          "Cargo Workspaces",
          "Publishing Crates"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=3cURk_KL0nE", // Advanced Rust
          "https://www.youtube.com/watch?v=9l1mZKT3vlU", // Rust Async
          "https://www.youtube.com/watch?v=2hXNd6x9sZs" // Rust Advanced
        ]
      }
    }
  },

  kotlin: {
    title: "Kotlin",
    icon: "🔶",
    category: "Programming Languages",
    description: "Modern programming language for JVM, Android, and beyond",
    totalLessons: 30,
    estimatedHours: 45,
    levels: {
      beginner: {
        title: "Kotlin Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Kotlin",
          "Kotlin Installation and Setup",
          "Basic Syntax",
          "Variables and Data Types",
          "Operators",
          "Control Structures",
          "Functions",
          "Null Safety",
          "Classes and Objects",
          "Collections"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=F9UC9DY-vIU", // Kotlin Full Course
          "https://www.youtube.com/watch?v=EExSSotojVI", // Kotlin Crash Course
          "https://www.youtube.com/watch?v=H_oGi8uuDpA" // Kotlin Tutorial
        ]
      },
      intermediate: {
        title: "Kotlin Intermediate",
        color: "#FF9800",
        topics: [
          "Object-Oriented Programming",
          "Inheritance and Interfaces",
          "Generics",
          "Data Classes",
          "Sealed Classes",
          "Enums",
          "Extension Functions",
          "Lambdas and Higher-Order Functions",
          "Collections API",
          "Exception Handling"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=5flXf8nuq60", // Kotlin OOP
          "https://www.youtube.com/watch?v=6P20npkvcb8", // Kotlin Generics
          "https://www.youtube.com/watch?v=EExSSotojVI" // Kotlin Intermediate
        ]
      },
      advanced: {
        title: "Advanced Kotlin",
        color: "#F44336",
        topics: [
          "Coroutines",
          "Flow",
          "Inline Functions",
          "Operator Overloading",
          "Reflection",
          "DSL Creation",
          "Android Development with Kotlin",
          "Ktor Framework",
          "Testing in Kotlin",
          "Performance Optimization"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=9F9QeU_UlFo", // Kotlin Coroutines
          "https://www.youtube.com/watch?v=0z_dwBGQQdg", // Kotlin DSL
          "https://www.youtube.com/watch?v=5flXf8nuq60" // Kotlin Advanced
        ]
      }
    }
  },

  swift: {
    title: "Swift",
    icon: "🦉",
    category: "Programming Languages",
    description: "Powerful and intuitive programming language for iOS and macOS",
    totalLessons: 35,
    estimatedHours: 50,
    levels: {
      beginner: {
        title: "Swift Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Swift",
          "Swift Installation and Setup",
          "Basic Syntax",
          "Variables and Constants",
          "Data Types",
          "Operators",
          "Control Flow",
          "Functions",
          "Optionals",
          "Arrays and Dictionaries"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=comQ1-x2a1Q", // Swift Full Course
          "https://www.youtube.com/watch?v=8Xg7E9shq0U", // Swift Crash Course
          "https://www.youtube.com/watch?v=q2zW6E8Z5oE" // Swift Tutorial
        ]
      },
      intermediate: {
        title: "Swift Intermediate",
        color: "#FF9800",
        topics: [
          "Classes and Structures",
          "Properties",
          "Methods",
          "Inheritance",
          "Initialization",
          "Deinitialization",
          "Protocols",
          "Extensions",
          "Generics",
          "Error Handling"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=9bZH8u4C1O4", // Swift OOP
          "https://www.youtube.com/watch?v=XY__7E4y9F0", // Swift Protocols
          "https://www.youtube.com/watch?v=8Xg7E9shq0U" // Swift Intermediate
        ]
      },
      advanced: {
        title: "Advanced Swift",
        color: "#F44336",
        topics: [
          "Memory Management (ARC)",
          "Closures",
          "Concurrency (GCD)",
          "Async/Await",
          "SwiftUI Basics",
          "Custom Operators",
          "Advanced Generics",
          "Reflection and Metatypes",
          "Testing in Swift",
          "Performance Optimization"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=0CKnZKzE7qE", // Swift Concurrency
          "https://www.youtube.com/watch?v=bzZHRk0BS0o", // SwiftUI Tutorial
          "https://www.youtube.com/watch?v=9bZH8u4C1O4" // Swift Advanced
        ]
      }
    }
  },

  ruby: {
    title: "Ruby",
    icon: "💎",
    category: "Programming Languages",
    description: "Dynamic, open-source programming language focused on simplicity",
    totalLessons: 30,
    estimatedHours: 45,
    levels: {
      beginner: {
        title: "Ruby Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Ruby",
          "Ruby Installation and Setup",
          "Basic Syntax",
          "Variables and Constants",
          "Data Types",
          "Operators",
          "Control Structures",
          "Methods",
          "Arrays and Hashes",
          "Strings and Symbols"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=t_ispmWmdjY", // Ruby Full Course
          "https://www.youtube.com/watch?v=8w_ZcWo8r0I", // Ruby Crash Course
          "https://www.youtube.com/watch?v=6w6E0xH9YKo" // Ruby Tutorial
        ]
      },
      intermediate: {
        title: "Ruby Intermediate",
        color: "#FF9800",
        topics: [
          "Object-Oriented Programming",
          "Classes and Objects",
          "Inheritance",
          "Modules and Mixins",
          "Blocks, Procs, and Lambdas",
          "Exception Handling",
          "File I/O",
          "Regular Expressions",
          "Metaprogramming Basics",
          "Gems and Bundler"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Dji9Z4KRbYQ", // Ruby OOP
          "https://www.youtube.com/watch?v=9Z3Z2Z3Z3Z3", // Ruby Metaprogramming
          "https://www.youtube.com/watch?v=8w_ZcWo8r0I" // Ruby Intermediate
        ]
      },
      advanced: {
        title: "Advanced Ruby",
        color: "#F44336",
        topics: [
          "Rails Framework Basics",
          "Advanced Metaprogramming",
          "Concurrency and Threading",
          "Performance Optimization",
          "Testing (RSpec)",
          "Design Patterns in Ruby",
          "DSL Creation",
          "Ruby on Rails Advanced",
          "API Development",
          "Deployment"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=fmyvWz5TUWc", // Ruby on Rails
          "https://www.youtube.com/watch?v=Dji9Z4KRbYQ", // Advanced Ruby
          "https://www.youtube.com/watch?v=9Z3Z2Z3Z3Z3" // Ruby Advanced
        ]
      }
    }
  },

  scala: {
    title: "Scala",
    icon: "⚖️",
    category: "Programming Languages",
    description: "Scalable language combining object-oriented and functional programming",
    totalLessons: 35,
    estimatedHours: 55,
    levels: {
      beginner: {
        title: "Scala Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Scala",
          "Scala Installation and Setup",
          "Basic Syntax",
          "Variables and Data Types",
          "Operators",
          "Control Structures",
          "Functions",
          "Classes and Objects",
          "Case Classes",
          "Collections"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=DzFt0YkZo8M", // Scala Full Course
          "https://www.youtube.com/watch?v=4y2nL5RKjSQ", // Scala Crash Course
          "https://www.youtube.com/watch?v=3s5_9iKv9Qw" // Scala Tutorial
        ]
      },
      intermediate: {
        title: "Scala Intermediate",
        color: "#FF9800",
        topics: [
          "Object-Oriented Programming",
          "Traits",
          "Inheritance",
          "Pattern Matching",
          "Higher-Order Functions",
          "Immutability",
          "Options and Either",
          "For Comprehensions",
          "Implicit Parameters",
          "Type Classes"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=ozL0K8B3LUE", // Scala OOP
          "https://www.youtube.com/watch?v=4y2nL5RKjSQ", // Scala Functional
          "https://www.youtube.com/watch?v=DzFt0YkZo8M" // Scala Intermediate
        ]
      },
      advanced: {
        title: "Advanced Scala",
        color: "#F44336",
        topics: [
          "Advanced Functional Programming",
          "Macros",
          "Akka Framework",
          "Spark with Scala",
          "Type-Level Programming",
          "Category Theory Concepts",
          "Performance Optimization",
          "Testing in Scala",
          "Scalaz Library",
          "Big Data Processing"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=ozL0K8B3LUE", // Advanced Scala
          "https://www.youtube.com/watch?v=3s5_9iKv9Qw", // Scala Akka
          "https://www.youtube.com/watch?v=4y2nL5RKjSQ" // Scala Advanced
        ]
      }
    }
  },

  dart: {
    title: "Dart",
    icon: "🎯",
    category: "Programming Languages",
    description: "Client-optimized language for fast apps on any platform",
    totalLessons: 25,
    estimatedHours: 40,
    levels: {
      beginner: {
        title: "Dart Basics",
        color: "#4CAF50",
        topics: [
          "Introduction to Dart",
          "Dart Installation and Setup",
          "Basic Syntax",
          "Variables and Data Types",
          "Operators",
          "Control Structures",
          "Functions",
          "Classes and Objects",
          "Null Safety",
          "Collections"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q", // Dart Full Course
          "https://www.youtube.com/watch?v=5KlnlCq2M5Q", // Dart Crash Course
          "https://www.youtube.com/watch?v=veMhP2K-DZM" // Dart Tutorial
        ]
      },
      intermediate: {
        title: "Dart Intermediate",
        color: "#FF9800",
        topics: [
          "Object-Oriented Programming",
          "Inheritance and Interfaces",
          "Mixins",
          "Generics",
          "Asynchronous Programming",
          "Futures and Streams",
          "Error Handling",
          "Libraries and Packages",
          "File I/O",
          "JSON Handling"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=veMhP2K-DZM", // Dart OOP
          "https://www.youtube.com/watch?v=5KlnlCq2M5Q", // Dart Async
          "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q" // Dart Intermediate
        ]
      },
      advanced: {
        title: "Advanced Dart",
        color: "#F44336",
        topics: [
          "Flutter Framework",
          "Custom Widgets",
          "State Management",
          "Animations",
          "Networking",
          "Database Integration",
          "Testing in Dart",
          "Performance Optimization",
          "Platform Channels",
          "Publishing Packages"
        ],
        youtubeLinks: [
          "https://www.youtube.com/watch?v=veMhP2K-DZM", // Flutter with Dart
          "https://www.youtube.com/watch?v=5KlnlCq2M5Q", // Advanced Dart
          "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q" // Dart Advanced
        ]
      }
    }
  }
};

// Top language categories for the main dashboard
export const TOP_LANGUAGE_CATEGORIES = [
  { name: "HTML", icon: "📄", color: "#E34F26" },
  { name: "CSS", icon: "🎨", color: "#1572B6" },
  { name: "JavaScript", icon: "📜", color: "#F7DF1E" },
  { name: "Python", icon: "🐍", color: "#3776AB" },
  { name: "React", icon: "⚛️", color: "#61DAFB" },
  { name: "Databases", icon: "🗄️", color: "#336791" },
  { name: "Node.js", icon: "🌿", color: "#339933" },
  { name: "Git", icon: "📂", color: "#F05032" },
  { name: "PHP", icon: "🐘", color: "#777BB4" }
];