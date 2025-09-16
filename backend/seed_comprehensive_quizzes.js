const mongoose = require('mongoose');
const { QuizTemplate } = require('./models/Quiz');
const fs = require('fs');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/codelearn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Load comprehensive quiz data from JSON file
const loadQuizData = () => {
  try {
    const quizData = fs.readFileSync('./comprehensive_quiz_data.json', 'utf8');
    return JSON.parse(quizData);
  } catch (error) {
    console.log('📄 Quiz data file not found, using fallback generation');
    return {};
  }
};

// Convert topic name to topic ID format (matching frontend)
const topicToId = (topicName) => {
  return topicName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

// Function to create quiz template in database
const createQuizTemplate = async (courseId, levelId, topicId, quizData) => {
  try {
    const difficultyMap = { 'beginner': 2, 'intermediate': 3, 'advanced': 4 };
    
    const quizTemplate = new QuizTemplate({
      course_id: courseId,
      level_id: levelId,
      topic_id: topicId,
      title: `${quizData.course} - ${quizData.topic}`,
      description: `Quiz on ${quizData.topic} from ${quizData.level} level`,
      questions: quizData.questions.map(q => ({
        question: q.question,
        options: q.options,
        correct_answer: q.options.indexOf(q.answer), // Convert answer to index
        explanation: q.explanation || `The correct answer is: ${q.answer}`
      })),
      estimated_time: quizData.questions.length * 1.5, // 1.5 minutes per question
      difficulty_level: difficultyMap[levelId] || 2,
      passing_score: 70,
      max_attempts: 3,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await quizTemplate.save();
    return true;
  } catch (error) {
    console.error(`❌ Error creating quiz for ${courseId}/${levelId}/${topicId}:`, error.message);
    return false;
  }
};

// Create fallback quiz questions if comprehensive data not available
const createFallbackQuestions = (course, level, topic) => {
  const questions = [];
  const questionCount = level === 'beginner' ? 5 : level === 'intermediate' ? 8 : 10;
  
  for (let i = 1; i <= questionCount; i++) {
    questions.push({
      question: `What is an important concept in ${topic}?`,
      options: [
        `Basic understanding of ${topic}`,
        `Advanced technique in ${topic}`,
        `Common mistake in ${topic}`,
        `Best practice for ${topic}`
      ],
      answer: `Basic understanding of ${topic}`,
      explanation: `Understanding the fundamentals of ${topic} is crucial for ${course} development.`
    });
  }
  
  return {
    course: course,
    level: level.charAt(0).toUpperCase() + level.slice(1),
    topic: topic,
    questions: questions
  };
};

const seedQuizzes = async () => {
  try {
    console.log('🌱 Starting comprehensive quiz seeding process...');
    console.log('📊 This will create quizzes for ALL courses and topics');
    
    // Clear existing quiz templates
    const deleteResult = await QuizTemplate.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing quiz templates`);

    // Load comprehensive quiz data
    const comprehensiveQuizData = loadQuizData();
    console.log('📖 Loaded comprehensive quiz data');

    let totalQuizzes = 0;
    let successfulQuizzes = 0;
    
    // Course structure from frontend (comprehensive courses)
    const courseStructure = {
      python: {
        title: "Python",
        levels: {
          beginner: {
            title: "Python Basics",
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
            ]
          },
          intermediate: {
            title: "Python Intermediate",
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
            ]
          },
          advanced: {
            title: "Python Advanced",
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
            ]
          }
        }
      },
      java: {
        title: "Java",
        levels: {
          beginner: {
            title: "Java Basics",
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
            ]
          },
          intermediate: {
            title: "Java Core & OOP",
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
            ]
          },
          advanced: {
            title: "Java Advanced",
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
            ]
          }
        }
      },
      // Add more courses as needed
      javascript: {
        title: "JavaScript",
        levels: {
          beginner: {
            title: "JavaScript Fundamentals",
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
            ]
          },
          intermediate: {
            title: "Modern JavaScript",
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
            ]
          },
          advanced: {
            title: "Advanced JavaScript",
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
            ]
          }
        }
      }
    };
    
    // Process each course
    for (const [courseId, courseData] of Object.entries(courseStructure)) {
      console.log(`\n📚 Processing course: ${courseData.title}`);
      
      for (const [levelId, levelData] of Object.entries(courseData.levels)) {
        console.log(`  📖 Processing level: ${levelData.title}`);
        
        for (const topic of levelData.topics) {
          const topicId = topicToId(topic);
          console.log(`    📝 Creating quiz for topic: ${topic} (ID: ${topicId})`);
          
          totalQuizzes++;
          
          // Check if we have comprehensive quiz data for this topic
          let quizData = null;
          if (comprehensiveQuizData[courseId] && 
              comprehensiveQuizData[courseId][levelId] && 
              comprehensiveQuizData[courseId][levelId][topicId]) {
            quizData = comprehensiveQuizData[courseId][levelId][topicId];
            console.log(`      ✅ Using comprehensive quiz data (${quizData.questions.length} questions)`);
          } else {
            // Create fallback quiz data
            quizData = createFallbackQuestions(courseData.title, levelId, topic);
            console.log(`      ⚠️  Using fallback quiz data (${quizData.questions.length} questions)`);
          }
          
          // Create quiz template in database
          const success = await createQuizTemplate(courseId, levelId, topicId, quizData);
          if (success) {
            successfulQuizzes++;
          }
        }
      }
    }
    
    console.log(`\n✅ Quiz seeding completed!`);
    console.log(`📊 Total quizzes attempted: ${totalQuizzes}`);
    console.log(`📊 Successful quizzes created: ${successfulQuizzes}`);
    console.log(`📊 Failed quizzes: ${totalQuizzes - successfulQuizzes}`);
    console.log(`🎯 Quiz system ready for testing!`);
    
    // Test quiz retrieval
    console.log(`\n🔍 Testing quiz retrieval...`);
    const testQuiz = await QuizTemplate.findOne({ 
      course_id: 'python', 
      level_id: 'beginner', 
      topic_id: 'introduction-to-python' 
    });
    
    if (testQuiz) {
      console.log(`✅ Test successful! Found quiz: "${testQuiz.title}" with ${testQuiz.questions.length} questions`);
    } else {
      console.log(`❌ Test failed! Could not find test quiz`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding quizzes:', error);
    throw error;
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedQuizzes()
    .then(() => {
      console.log('🎉 Quiz seeding script completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Start your backend server: node server.js');
      console.log('2. Start your frontend: npm start');
      console.log('3. Test quiz functionality in browser');
      console.log('4. Check quiz recommendations system');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Quiz seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedQuizzes, topicToId, createQuizTemplate };