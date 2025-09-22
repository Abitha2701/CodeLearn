const axios = require('axios');
const { QuizTemplate } = require('../models/Quiz');
const LearningPath = require('../models/LearningPath');

class MLService {
  constructor() {
    // In production, this would connect to actual ML services like OpenAI, Hugging Face, etc.
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    
    // For demo purposes, we'll simulate ML responses
    this.simulateML = !this.openaiApiKey;
    // In-memory recent question hash cache to avoid repeats across requests
    this.recentHashes = new Map(); // key: course:topic:difficulty -> Set of hashes (LRU-like)
  }

  /**
   * Generate quiz questions using ML based on topic and user performance
   */
  async generateQuizQuestions(courseId, topic, difficulty = 2, userPerformance = null, count = 5) {
    try {
      if (this.simulateML) {
        return this.simulateQuizGeneration(courseId, topic, difficulty, count);
      }

      // Real ML implementation using OpenAI GPT
      const prompt = this.buildQuizGenerationPrompt(courseId, topic, difficulty, userPerformance, count);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in programming and technology courses. Generate high-quality quiz questions that are accurate, relevant, and appropriately challenging.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const generatedContent = response.data.choices[0].message.content;
      return this.parseGeneratedQuestions(generatedContent);
      
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      // Fallback to simulation if ML service fails
      return this.simulateQuizGeneration(courseId, topic, difficulty, count);
    }
  }

  /**
   * Validate quiz questions using ML for quality and accuracy
   */
  async validateQuizQuestions(questions, courseId, topic) {
    try {
      if (this.simulateML) {
        return this.simulateQuizValidation(questions);
      }

      const validationPrompt = this.buildValidationPrompt(questions, courseId, topic);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content reviewer. Validate quiz questions for accuracy, clarity, and educational value. Provide specific feedback and suggestions for improvement.'
          },
          {
            role: 'user',
            content: validationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const validationResult = response.data.choices[0].message.content;
      return this.parseValidationResult(validationResult);
      
    } catch (error) {
      console.error('Error validating quiz questions:', error);
      return this.simulateQuizValidation(questions);
    }
  }

  /**
   * Analyze user performance and recommend learning path adjustments
   */
  async analyzeUserPerformance(userId, courseId, recentAttempts) {
    try {
      const performanceData = await this.aggregatePerformanceData(userId, courseId, recentAttempts);
      
      if (this.simulateML) {
        return this.simulatePerformanceAnalysis(performanceData);
      }

      const analysisPrompt = this.buildPerformanceAnalysisPrompt(performanceData);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI learning analytics expert. Analyze student performance data and provide personalized learning recommendations to improve outcomes.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const analysisResult = response.data.choices[0].message.content;
      return this.parsePerformanceAnalysis(analysisResult);
      
    } catch (error) {
      console.error('Error analyzing user performance:', error);
      return this.simulatePerformanceAnalysis(performanceData);
    }
  }

  /**
   * Recommend personalized learning path adjustments
   */
  async recommendPathAdjustments(learningPath, userPerformance) {
    const recommendations = [];
    
    // Analyze struggling topics
    if (userPerformance.averageQuizScore < 70) {
      recommendations.push({
        type: 'additional_practice',
        message: 'Add more practice exercises for struggling topics',
        confidence: 0.85,
        changes: {
          addPracticeSteps: userPerformance.strugglingTopics
        }
      });
    }
    
    // Analyze pace
    if (userPerformance.averageTimePerStep > learningPath.steps.reduce((sum, step) => sum + step.content.estimatedTime, 0) / learningPath.steps.length * 1.5) {
      recommendations.push({
        type: 'change_pace',
        message: 'Consider slowing down the pace and adding more foundational content',
        confidence: 0.75,
        changes: {
          adjustPace: 'slower',
          addFoundationalSteps: true
        }
      });
    }
    
    // Analyze strong performance
    if (userPerformance.averageQuizScore > 90 && userPerformance.averageTimePerStep < learningPath.steps.reduce((sum, step) => sum + step.content.estimatedTime, 0) / learningPath.steps.length * 0.7) {
      recommendations.push({
        type: 'skip_ahead',
        message: 'You\'re excelling! Consider skipping some basic topics and moving to advanced content',
        confidence: 0.80,
        changes: {
          skipSteps: ['basic-topics'],
          addAdvancedSteps: true
        }
      });
    }
    
    return recommendations;
  }

  // Simulation methods for demo purposes
  simulateQuizGeneration(courseId, topic, difficulty, count) {
    // Base seeds per course/difficulty. We'll still expand procedurally.
    const seeds = {
      python: {
        1: [
          { q: "In {course}, which is a valid variable assignment?", opts: ["var x = 5", "x = 5", "let x = 5", "const x: int = 5"], ans: "x = 5" },
          { q: "Which built-in returns the length of a sequence in {course}?", opts: ["size()", "count()", "len()", "length()"], ans: "len()" },
          { q: "What is the output of print(type(3.14)) in {course}?", opts: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>"], ans: "<class 'float'>" }
        ],
        2: [
          { q: "How do you define a function in {course}?", opts: ["func greet():", "def greet():", "function greet():", "define greet():"], ans: "def greet():" },
          { q: "Which data structure in {course} is immutable?", opts: ["list", "dict", "set", "tuple"], ans: "tuple" },
          { q: "What does the expression {n1} // {n2} evaluate to in {course}?", opts: ["Floor division", "True", "A float", "Modulo"], ans: "Floor division" }
        ]
      },
      javascript: {
        1: [
          { q: "How do you declare a variable in {course}?", opts: ["var x;", "variable x;", "declare x;", "def x;"], ans: "var x;" },
          { q: "Which method adds an element to an array in {course}?", opts: ["add()", "push()", "append()", "insert()"], ans: "push()" },
          { q: "What is the result of '5' + 3 in {course}?", opts: ["8", "'53'", "TypeError", "NaN"], ans: "'53'" }
        ],
        2: [
          { q: "Which keyword declares a block-scoped variable in {course}?", opts: ["var", "let", "const", "static"], ans: "let" },
          { q: "What does Array.prototype.map return?", opts: ["Mutated array", "New array", "Iterator", "Length"], ans: "New array" },
          { q: "What is the output of [1,2,3].filter(x => x > {n2}).length?", opts: ["{n1}", "0", "Depends on array", "Throws error"], ans: "Depends on array" }
        ]
      },
      react: {
        1: [
          { q: "What hook adds state to a functional component in {course}?", opts: ["useState", "useEffect", "useMemo", "useRef"], ans: "useState" },
          { q: "JSX stands for?", opts: ["Java Syntax eXtension", "JavaScript XML", "JSON XML", "JavaScript eXtension"], ans: "JavaScript XML" }
        ],
        2: [
          { q: "Which hook runs after render by default?", opts: ["useMemo", "useEffect", "useCallback", "useReducer"], ans: "useEffect" },
          { q: "How do you memoize an expensive computation?", opts: ["useMemo", "useEffect", "useRef", "useLayoutEffect"], ans: "useMemo" }
        ]
      },
      vue: {
        1: [
          { q: "Which directive renders a list in {course}?", opts: ["v-if", "v-show", "v-for", "v-bind"], ans: "v-for" },
          { q: "How do you bind a dynamic attribute in {course}?", opts: [":src=...", "bind-src=...", "v-attr=src", "src.bind"], ans: ":src=..." }
        ],
        2: [
          { q: "Which API is recommended in Vue 3 for composition?", opts: ["Options API", "Composition API", "Setup-less API", "Legacy API"], ans: "Composition API" },
          { q: "What does v-model create by default on an input?", opts: ["one-way binding", "two-way binding", "event listener only", "no binding"], ans: "two-way binding" }
        ]
      },
      nodejs: {
        1: [
          { q: "Which module handles file operations in {course}?", opts: ["http", "fs", "path", "os"], ans: "fs" },
          { q: "Which command initializes a project?", opts: ["npm start", "npm init", "node init", "npx run"], ans: "npm init" }
        ],
        2: [
          { q: "Which method creates an HTTP server in {course}?", opts: ["http.createServer", "fs.createServer", "net.createHttp", "server.create"], ans: "http.createServer" },
          { q: "Which module resolves file paths?", opts: ["fs", "http", "path", "url"], ans: "path" }
        ]
      },
      java: {
        1: [
          { q: "Which keyword defines a class in {course}?", opts: ["class", "def", "struct", "object"], ans: "class" },
          { q: "Which type holds true/false?", opts: ["int", "String", "boolean", "char"], ans: "boolean" },
          { q: "Which keyword creates a new object?", opts: ["make", "new", "create", "init"], ans: "new" },
          { q: "Which is a valid access modifier?", opts: ["visible", "public", "opened", "shared"], ans: "public" },
          { q: "Arrays in {course} are...", opts: ["dynamic sized", "fixed sized", "always null", "hash-based"], ans: "fixed sized" }
        ],
        2: [
          { q: "Which collection preserves insertion order?", opts: ["HashSet", "TreeSet", "LinkedHashSet", "PriorityQueue"], ans: "LinkedHashSet" },
          { q: "Which keyword prevents inheritance?", opts: ["static", "final", "abstract", "volatile"], ans: "final" },
          { q: "Method overloading means...", opts: ["same name, same params", "same name, different params", "different name, same params", "cannot happen"], ans: "same name, different params" },
          { q: "String in {course} is...", opts: ["mutable", "immutable", "primitive", "pointer"], ans: "immutable" },
          { q: "Which Map keeps insertion order?", opts: ["HashMap", "LinkedHashMap", "TreeMap", "WeakHashMap"], ans: "LinkedHashMap" }
        ],
        3: [
          { q: "Which interface is implemented to create a thread?", opts: ["Comparable", "Runnable", "AutoCloseable", "Iterable"], ans: "Runnable" },
          { q: "Which block always executes in try-catch?", opts: ["try", "catch", "finally", "throw"], ans: "finally" },
          { q: "Which method pair should be consistent?", opts: ["toString/hashCode", "equals/hashCode", "clone/close", "run/start"], ans: "equals/hashCode" },
          { q: "What does the 'synchronized' keyword control?", opts: ["I/O speed", "Thread access to a block/object", "JIT compiler", "GC pauses"], ans: "Thread access to a block/object" },
          { q: "Which stream operation returns a new stream?", opts: ["forEach", "collect", "map", "count"], ans: "map" }
        ]
      },
      html: {
        1: [
          { q: "Which tag defines a hyperlink in {course}?", opts: ["<div>", "<a>", "<p>", "<span>"], ans: "<a>" },
          { q: "Which tag represents the largest heading?", opts: ["<h6>", "<h1>", "<header>", "<title>"], ans: "<h1>" }
        ],
        2: [
          { q: "Which input type creates a checkbox?", opts: ["text", "checkbox", "radio", "button"], ans: "checkbox" },
          { q: "Which attribute provides alternate text for images?", opts: ["title", "name", "alt", "label"], ans: "alt" }
        ]
      },
      angular: {
        1: [
          { q: "Which decorator defines a component in {course}?", opts: ["@NgModule", "@Injectable", "@Component", "@Directive"], ans: "@Component" },
          { q: "Which CLI command generates a component?", opts: ["ng new c", "ng g c", "ng add c", "ng c"], ans: "ng g c" }
        ],
        2: [
          { q: "Which module is required for routing?", opts: ["FormsModule", "RouterModule", "HttpClientModule", "CommonModule"], ans: "RouterModule" },
          { q: "Which lifecycle hook runs once after the first ngOnChanges?", opts: ["ngOnInit", "ngAfterViewInit", "ngDoCheck", "ngOnDestroy"], ans: "ngOnInit" }
        ]
      },
      typescript: {
        1: [
          { q: "Which syntax declares a typed variable in {course}?", opts: ["let x: number = 1", "var x := 1", "int x = 1", "x number = 1"], ans: "let x: number = 1" },
          { q: "Which union type is valid?", opts: ["string||number", "(string|number)", "string|number", "string or number"], ans: "string|number" }
        ],
        2: [
          { q: "Which feature enables reusable type logic?", opts: ["classes", "generics", "interfaces", "namespaces"], ans: "generics" },
          { q: "Which keyword narrows type inside a block?", opts: ["typeof", "instanceof", "narrow", "as"], ans: "instanceof" }
        ]
      }
    };

    const courseKey = (courseId || 'python').toLowerCase();
    const seedCourse = seeds[courseKey] || seeds.python;
    let seedList = seedCourse[difficulty] || seedCourse[1];
    // For Java, broaden the base pool by merging all difficulty seeds to increase variety
    if (courseKey === 'java') {
      seedList = [
        ...((seedCourse[1] || [])),
        ...((seedCourse[2] || [])),
        ...((seedCourse[3] || []))
      ];
    }

    // Helper: shuffle array (Fisher–Yates)
    const shuffle = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // Helpers for dynamic distractors and code snippets
    const ensureUniqueOptions = (opts) => Array.from(new Set(opts));
    const generateDistractors = (correct, topicText) => {
      const base = [
        `Not related to ${topicText}`,
        `Common misconception about ${topicText}`,
        `Looks correct but isn't`,
        `Edge case answer`
      ];
      // Avoid including the correct answer
      return base.filter(b => b !== correct);
    };

    const codeSnippetVariant = (courseText, topicText, idx) => {
      if (/python/i.test(courseText)) {
        return `What is the output?
code:
print("{topic}")\nprint({n1} + {n2})`.replace('{topic}', topicText).replace('{n1}', String(1 + (idx % 4))).replace('{n2}', String(2 + (idx % 3)));
      }
      if (/javascript/i.test(courseText)) {
        return `What does this log?
code:
const a = ${1 + (idx % 3)};\nconsole.log(a + '${topicText.slice(0,3)}')`;
      }
      return '';
    };

    // Helper: create a unique variant from a seed
    const makeVariant = (seed, idx) => {
      // inject topic and course names
      const topicText = (topic || 'fundamentals').replace(/-/g, ' ');
      const courseText = courseId.charAt(0).toUpperCase() + courseId.slice(1);

      // light numeric parameterization to avoid duplicate surface forms
      const n1 = 3 + (idx % 7);
      const n2 = 2 + ((idx * 2) % 5);

      let stem = seed.q
        .replace('{course}', courseText)
        .replace('{topic}', topicText);

      // Sprinkle topic context
      if (!/\btopic\b|\b{topic}\b/i.test(seed.q) && Math.random() < 0.5) {
        stem += ` (topic: ${topicText})`;
      }

      // Option adjustments and shuffling
      let options = seed.opts.map(o => o
        .replace('{course}', courseText)
        .replace('{n1}', String(n1))
        .replace('{n2}', String(n2))
      );

      // Ensure the correct answer text is present once
      const correct = seed.ans
        .replace('{course}', courseText)
        .replace('{n1}', String(n1))
        .replace('{n2}', String(n2));

      // If correct answer not in options, inject it replacing a random slot
      let opts = options.slice();
      if (!opts.includes(correct)) {
        const replaceIdx = Math.floor(Math.random() * opts.length);
        opts[replaceIdx] = correct;
      }

      // Enrich with dynamic distractors if we still have duplicates or too-similar options
      opts = ensureUniqueOptions(opts);
      if (opts.length < 4) {
        const extra = generateDistractors(correct, topicText);
        for (const d of extra) {
          if (opts.length >= 4) break;
          if (!opts.includes(d)) opts.push(d);
        }
      }

      // Shuffle options for variety
      opts = shuffle(opts);

      // Occasionally vary stem with a tiny code snippet to avoid similar stems
      if (Math.random() < 0.35) {
        const snippet = codeSnippetVariant(courseText, topicText, idx);
        if (snippet) stem = `${stem}\n\n${snippet}`;
      }

      return {
        id: `generated_${Date.now()}_${idx}_${Math.floor(Math.random()*1000)}`,
        question: stem,
        options: opts,
        answer: correct,
        explanation: `Because "${correct}" is correct for ${topicText} in ${courseText}.`
      };
    };

    const unique = new Set();
    const out = [];
    let i = 0;
    // Prepare cross-request cache for this key
    const cacheKey = `${String(courseId).toLowerCase()}:${String(topic).toLowerCase()}:${difficulty}`;
    if (!this.recentHashes.has(cacheKey)) this.recentHashes.set(cacheKey, new Set());
    const recent = this.recentHashes.get(cacheKey);

    // Randomize base selection and limit reuse per base
    const baseIndices = [...Array(seedList.length).keys()];
    const shuffledBase = shuffle(baseIndices);
    const baseUseCount = new Map();

    while (out.length < count && i < count * 12) { // more attempts to achieve uniqueness
      const pick = shuffledBase[i % shuffledBase.length];
      const base = seedList[pick];
      const v = makeVariant(base, i);
      // Normalize question text to reduce superficial differences
      const normalizedQ = v.question.replace(/\s+/g, ' ').trim().toLowerCase();
      const key = `${normalizedQ}::${v.options.slice().map(o => o.trim().toLowerCase()).sort().join('|')}`;
      const used = baseUseCount.get(pick) || 0;
      if (!unique.has(key) && !recent.has(key) && used < 1) { // don't reuse same base more than once per quiz
        unique.add(key);
        out.push(v);
        baseUseCount.set(pick, used + 1);
      }
      i++;
    }

    // If we still have fewer than requested, borrow seeds from other difficulties
    if (out.length < count) {
      const otherDiffs = Object.keys(seedCourse)
        .map(k => parseInt(k, 10))
        .filter(k => k !== difficulty && Array.isArray(seedCourse[k]))
        .sort();
      for (const d of otherDiffs) {
        if (out.length >= count) break;
        const extraSeeds = seedCourse[d];
        let j = 0;
        const extraIdx = [...Array(extraSeeds.length).keys()];
        const shuffledExtra = shuffle(extraIdx);
        while (out.length < count && j < shuffledExtra.length * 6) {
          const base = extraSeeds[shuffledExtra[j % shuffledExtra.length]];
          const v = makeVariant(base, i + j + 1);
          const normalizedQ = v.question.replace(/\s+/g, ' ').trim().toLowerCase();
          const key = `${normalizedQ}::${v.options.slice().map(o => o.trim().toLowerCase()).sort().join('|')}`;
          if (!unique.has(key) && !recent.has(key)) {
            unique.add(key);
            out.push(v);
          }
          j++;
        }
      }
    }

    // Update recent cache (LRU-like: keep last ~200 entries)
    for (const k of unique) {
      recent.add(k);
      if (recent.size > 200) {
        // Remove an arbitrary earliest entry (no true LRU, acceptable for demo)
        const first = recent.values().next().value;
        if (first) recent.delete(first);
      }
    }

    return {
      success: true,
      questions: out,
      metadata: {
        courseId,
        topic,
        difficulty,
        generatedAt: new Date(),
        mlModel: 'simulated'
      }
    };
  }

  simulateQuizValidation(questions) {
    const validationResults = questions.map((question, index) => ({
      questionId: question.id || index,
      isValid: true,
      confidence: 0.85 + Math.random() * 0.1,
      feedback: 'Question is well-structured and appropriate for the topic',
      suggestions: []
    }));

    return {
      success: true,
      overallScore: 0.87,
      validQuestions: validationResults.filter(r => r.isValid).length,
      totalQuestions: questions.length,
      results: validationResults
    };
  }

  simulatePerformanceAnalysis(performanceData) {
    const analysis = {
      overallPerformance: performanceData.averageScore > 80 ? 'excellent' : 
                         performanceData.averageScore > 60 ? 'good' : 'needs_improvement',
      strengths: ['problem-solving', 'syntax-understanding'],
      weaknesses: performanceData.averageScore < 70 ? ['advanced-concepts', 'time-management'] : [],
      recommendations: [
        {
          type: 'additional_practice',
          priority: 'high',
          message: 'Focus on practicing more complex problems'
        }
      ],
      predictedSuccess: Math.min(performanceData.averageScore + 10, 95),
      confidence: 0.78
    };

    return analysis;
  }

  // Helper methods
  buildQuizGenerationPrompt(courseId, topic, difficulty, userPerformance, count) {
    let prompt = `Generate ${count} multiple-choice quiz questions for a ${courseId} course on the topic of "${topic}".
    
Difficulty level: ${difficulty}/5
Format each question as JSON with the following structure:
{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Correct answer text",
  "explanation": "Brief explanation of why this is correct"
}

Requirements:
- Questions should be practical and test real understanding
- Avoid trick questions or overly academic content
- Include code examples where appropriate
- Make sure all options are plausible
- Provide clear, concise explanations`;

    if (userPerformance) {
      prompt += `\n\nUser Performance Context:
- Average score: ${userPerformance.averageScore}%
- Struggling topics: ${userPerformance.strugglingTopics.join(', ')}
- Strong topics: ${userPerformance.strongTopics.join(', ')}
Please adjust question difficulty and focus areas accordingly.`;
    }

    return prompt;
  }

  buildValidationPrompt(questions, courseId, topic) {
    return `Please validate the following quiz questions for a ${courseId} course on "${topic}":

${JSON.stringify(questions, null, 2)}

For each question, evaluate:
1. Accuracy of the question and answer
2. Clarity and understandability
3. Appropriateness for the topic and level
4. Quality of distractors (incorrect options)

Provide feedback in JSON format:
{
  "overallScore": 0.85,
  "validQuestions": 4,
  "totalQuestions": 5,
  "results": [
    {
      "questionId": 0,
      "isValid": true,
      "confidence": 0.9,
      "feedback": "Well-structured question",
      "suggestions": ["Minor suggestion if any"]
    }
  ]
}`;
  }

  buildPerformanceAnalysisPrompt(performanceData) {
    return `Analyze the following student performance data and provide learning recommendations:

${JSON.stringify(performanceData, null, 2)}

Please provide analysis in JSON format including:
- Overall performance assessment
- Identified strengths and weaknesses
- Specific recommendations for improvement
- Predicted success rate with current trajectory
- Confidence level in the analysis`;
  }

  async aggregatePerformanceData(userId, courseId, recentAttempts) {
    // Aggregate performance metrics from recent attempts
    const totalAttempts = recentAttempts.length;
    const averageScore = totalAttempts > 0 ? 
      recentAttempts.reduce((sum, attempt) => sum + attempt.scorePct, 0) / totalAttempts : 0;
    
    const averageTime = totalAttempts > 0 ?
      recentAttempts.reduce((sum, attempt) => sum + attempt.timeSec, 0) / totalAttempts : 0;

    // Identify struggling and strong topics
    const topicPerformance = {};
    recentAttempts.forEach(attempt => {
      if (!topicPerformance[attempt.topic]) {
        topicPerformance[attempt.topic] = [];
      }
      topicPerformance[attempt.topic].push(attempt.scorePct);
    });

    const strugglingTopics = [];
    const strongTopics = [];
    
    Object.entries(topicPerformance).forEach(([topic, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avgScore < 60) {
        strugglingTopics.push(topic);
      } else if (avgScore > 85) {
        strongTopics.push(topic);
      }
    });

    return {
      userId,
      courseId,
      totalAttempts,
      averageScore,
      averageTime,
      strugglingTopics,
      strongTopics,
      recentTrend: this.calculateTrend(recentAttempts),
      lastActivity: recentAttempts.length > 0 ? recentAttempts[recentAttempts.length - 1].ts : null
    };
  }

  calculateTrend(attempts) {
    if (attempts.length < 3) return 'insufficient_data';
    
    const recent = attempts.slice(-3);
    const older = attempts.slice(-6, -3);
    
    if (older.length === 0) return 'insufficient_data';
    
    const recentAvg = recent.reduce((sum, a) => sum + a.scorePct, 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + a.scorePct, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  parseGeneratedQuestions(content) {
    try {
      // Parse the ML-generated content and extract questions
      const questions = JSON.parse(content);
      return {
        success: true,
        questions: questions,
        metadata: {
          generatedAt: new Date(),
          mlModel: 'gpt-3.5-turbo'
        }
      };
    } catch (error) {
      console.error('Error parsing generated questions:', error);
      return { success: false, error: 'Failed to parse generated questions' };
    }
  }

  parseValidationResult(content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing validation result:', error);
      return { success: false, error: 'Failed to parse validation result' };
    }
  }

  parsePerformanceAnalysis(content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing performance analysis:', error);
      return { success: false, error: 'Failed to parse performance analysis' };
    }
  }
}

module.exports = new MLService();
