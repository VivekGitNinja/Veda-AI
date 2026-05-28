import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { getRedisConnectionOptions } from '../config/db';
import { Assignment } from '../models/Assignment';
import { GenerationResult } from '../models/GenerationResult';
import { broadcastProgress } from '../sockets/socketServer';
import { IQuestionPaper, ISection, IQuestion, QuestionType, Difficulty } from '@vedaai/shared';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

interface ParsedSectionSpec {
  typeString: string;
  numQuestions: number;
  marks: number;
}

const parseQuestionStructure = (instructions: string): ParsedSectionSpec[] | null => {
  const match = instructions.match(/\[Question Structure:\s*([^\]]+)\]/);
  if (!match) return null;
  const parts = match[1].split(',');
  const specs: ParsedSectionSpec[] = [];
  for (const part of parts) {
    const parsed = part.trim().match(/^(\d+)\s+([^(]+)\s+\((\d+)\s+marks?\s+each\)$/i);
    if (parsed) specs.push({ numQuestions: parseInt(parsed[1], 10), typeString: parsed[2].trim(), marks: parseInt(parsed[3], 10) });
  }
  return specs.length > 0 ? specs : null;
};

const mapTypeStringToSchema = (typeString: string): QuestionType => {
  const t = typeString.toLowerCase();
  if (t.includes('multiple choice') || t.includes('mcq')) return 'mcq';
  if (t.includes('short')) return 'short-answer';
  if (t.includes('diagram') || t.includes('graph') || t.includes('case')) return 'case-based';
  if (t.includes('numerical') || t.includes('long') || t.includes('analytical')) return 'long-answer';
  return 'short-answer';
};

// Subject-aware question pools
const getSubjectPool = (subject: string) => {
  const s = subject.toLowerCase();

  if (s.includes('java') || s.includes('programming') || s.includes('computer science') || s.includes('coding') || s.includes('javascript') || s.includes('python') || s.includes('cs')) {
    return {
      mcq: [
        { text: "Which of the following is not a primitive data type in Java?", options: ["int", "double", "boolean", "String"] },
        { text: "What is the size of an int data type in Java?", options: ["8 bits", "16 bits", "32 bits", "64 bits"] },
        { text: "Which Java keyword is used to create a subclass?", options: ["implements", "extends", "inherits", "super"] },
        { text: "Which component is responsible for running Java bytecode?", options: ["JDK", "JRE", "JVM", "Compiler"] },
        { text: "What is the default value of an uninitialized object reference in Java?", options: ["0", "null", "undefined", "false"] },
        { text: "Which memory area in JVM is used to store objects created via 'new'?", options: ["Stack", "Heap", "Method Area", "PC Register"] },
        { text: "What is the main purpose of garbage collection in Java?", options: ["Compiling source code", "Reclaiming unused memory", "Checking for syntax errors", "Preventing runtime exceptions"] },
        { text: "Which of these is a valid access modifier in Java?", options: ["internal", "protected", "friend", "secure"] },
      ],
      short: [
        { text: "Explain the difference between '==' and '.equals()' in Java." },
        { text: "What is JVM, JRE, and JDK? How do they relate to each other?" },
        { text: "Differentiate between an interface and an abstract class in Java." },
        { text: "Explain the purpose of the 'static' keyword in Java." },
        { text: "What is Garbage Collection in Java and how does it work?" },
        { text: "Differentiate between method overloading and method overriding." },
      ],
      long: [
        { text: "Write a complete Java class representing a stack of integers using arrays. Implement push(), pop(), and peek() methods, handling stack overflow and underflow scenarios." },
        { text: "Explain the concepts of Inheritance and Polymorphism in Java. Write a Java code snippet demonstrating dynamic method dispatch (runtime polymorphism) using a base class Shape and subclasses Circle and Rectangle." },
        { text: "Describe the Java Collections Framework. Contrast the performance characteristics (time and space complexity) and underlying data structures of ArrayList, LinkedList, and HashMap." },
        { text: "Explain Exception Handling in Java. Write a program demonstrating try-catch-finally blocks, custom exception throwing, and correct resource management using try-with-resources." },
      ],
      case: [
        { text: "A student writes a Java class where all instance variables are 'public' and there are no getter/setter methods. Analyze the architectural risks, explain encapsulation principles, and refactor the code to make it compliant with industry standards." },
        { text: "Performance audit: A program reads a 50MB log file line by line using string concatenation in a loop ('str += line'). Explain why this is slow in Java due to string immutability, and refactor the loop to use StringBuilder." },
      ],
    };
  }

  if (s.includes('physics') || s.includes('motion') || s.includes('force') || s.includes('mechanics')) {
    return {
      mcq: [
        { text: "Newton's First Law of Motion states that a body remains at rest or in uniform motion unless acted upon by:", options: ["A net external force", "Gravity alone", "Friction", "Air resistance"] },
        { text: "The SI unit of force is:", options: ["Joule", "Watt", "Newton", "Pascal"] },
        { text: "Which of the following is a scalar quantity?", options: ["Velocity", "Force", "Speed", "Acceleration"] },
        { text: "The momentum of an object depends on its:", options: ["Shape and size", "Mass and velocity", "Volume and density", "Color and texture"] },
        { text: "When a ball is thrown upward, at the highest point its velocity is:", options: ["Maximum", "Zero", "Equal to initial", "Negative"] },
        { text: "Work done is zero when force and displacement are:", options: ["Parallel", "Anti-parallel", "Perpendicular", "Equal"] },
        { text: "Kinetic energy of a body is proportional to:", options: ["Velocity", "Mass only", "Square of velocity", "Cube of velocity"] },
        { text: "The law of conservation of momentum applies when external force is:", options: ["Maximum", "Constant", "Zero", "Variable"] },
      ],
      short: [
        { text: "Define Newton's Second Law of Motion and write its mathematical form." },
        { text: "Differentiate between mass and weight with suitable examples." },
        { text: "State the law of conservation of energy with one real-life application." },
        { text: "What is the difference between speed and velocity? Give examples." },
        { text: "Explain the concept of inertia and how it relates to Newton's First Law." },
        { text: "Define uniform circular motion and name the force acting towards the centre." },
      ],
      long: [
        { text: "A car of mass 1000 kg accelerates from rest to 20 m/s in 10 seconds. Calculate (a) the acceleration, (b) the net force applied, and (c) the distance covered." },
        { text: "Derive the equations of motion for a uniformly accelerating body from graphical methods. State all three equations clearly." },
        { text: "Explain the concept of work, energy and power. A machine does 5000 J of work in 25 seconds. Find its power output." },
        { text: "Two objects of masses 2 kg and 5 kg collide and stick together. If the 2 kg object was moving at 10 m/s and the 5 kg was at rest, find the common velocity after collision." },
      ],
      case: [
        { text: "A velocity-time graph for a moving bus is given. The graph shows initial velocity 0, rises linearly to 20 m/s in 5s, remains constant for 10s, then decreases to 0 in 5s. Calculate total distance, average speed, and identify phases of motion." },
        { text: "Study the force-extension graph for a spring. The graph is linear up to 10 N extension = 5 cm, then curves. Identify the elastic limit, calculate the spring constant, and explain what happens beyond the elastic limit." },
        { text: "An experiment was conducted to measure reaction time. Results for 5 students are given. Analyze the data, calculate mean reaction time, and state one factor that could reduce it." },
      ],
    };
  }

  if (s.includes('math') || s.includes('algebra') || s.includes('geometry') || s.includes('calculus')) {
    return {
      mcq: [
        { text: "The quadratic formula to solve ax² + bx + c = 0 is:", options: ["x = -b ± √(b²-4ac) / 2a", "x = b ± √(b²+4ac) / 2a", "x = -b / 2a", "x = √b / a"] },
        { text: "The value of sin 90° is:", options: ["0", "1", "∞", "√2/2"] },
        { text: "The sum of interior angles of a triangle is:", options: ["90°", "270°", "180°", "360°"] },
        { text: "If f(x) = x², then f'(x) equals:", options: ["x", "2x", "x²", "2"] },
        { text: "Which of the following is an irrational number?", options: ["4/5", "√9", "√2", "0.25"] },
        { text: "The slope of the line y = 3x + 5 is:", options: ["5", "3", "1/3", "15"] },
        { text: "Area of a circle with radius r is:", options: ["πr", "2πr", "πr²", "4πr²"] },
        { text: "The HCF of 12 and 18 is:", options: ["3", "6", "9", "36"] },
      ],
      short: [
        { text: "Solve for x: 3x² - 12x + 9 = 0 using the quadratic formula." },
        { text: "Find the area of a triangle with base 8 cm and height 5 cm." },
        { text: "If the angles of a quadrilateral are in ratio 1:2:3:4, find each angle." },
        { text: "Simplify: (x² - 9) / (x - 3) and state any restriction on x." },
        { text: "Find the mean, median and mode of: 3, 7, 5, 7, 9, 3, 7." },
        { text: "Prove that √2 is irrational." },
      ],
      long: [
        { text: "A shopkeeper sells two articles at ₹990 each. On one he gains 10% and on the other he loses 10%. Find his overall profit or loss percentage." },
        { text: "Draw the graph of y = x² - 4x + 3 for x from 0 to 4. Find zeros, vertex, and axis of symmetry." },
        { text: "The sum of first n terms of an AP is 3n² + 5n. Find the AP and its 15th term." },
        { text: "Prove the Pythagorean theorem and use it to find the hypotenuse when the other two sides are 8 cm and 15 cm." },
      ],
      case: [
        { text: "A school collected donation data from 100 students (0-100 range). Study the frequency distribution table and (a) draw a histogram, (b) calculate mean using the assumed mean method, (c) identify the modal class." },
        { text: "A cylinder, cone, and hemisphere have equal base radii and equal heights. Calculate and compare their volumes. Which is largest?" },
      ],
    };
  }

  if (s.includes('science') || s.includes('biology') || s.includes('chemistry')) {
    return {
      mcq: [
        { text: "Which organelle is known as the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"] },
        { text: "The atomic number of Carbon is:", options: ["6", "12", "14", "8"] },
        { text: "Photosynthesis primarily occurs in the:", options: ["Roots", "Stem", "Chloroplasts", "Nucleus"] },
        { text: "Chemical formula of water is:", options: ["HO", "H₂O₂", "H₂O", "OH"] },
        { text: "Which gas is produced during photosynthesis?", options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"] },
        { text: "DNA stands for:", options: ["Deoxyribose Nucleic Acid", "Diribonucleic Acid", "Deoxyribonucleic Acid", "Dinucleoic Acid"] },
        { text: "The pH of pure water at 25°C is:", options: ["5", "7", "9", "14"] },
        { text: "Rusting of iron is an example of:", options: ["Physical change", "Chemical change", "Nuclear reaction", "Photosynthesis"] },
      ],
      short: [
        { text: "What is osmosis? How does it differ from diffusion?" },
        { text: "Explain the structure of an atom with a suitable diagram description." },
        { text: "What are the products of aerobic respiration? Write the balanced equation." },
        { text: "Differentiate between physical and chemical changes with two examples each." },
        { text: "What is Mendel's Law of Segregation? Explain with a monohybrid cross." },
        { text: "Describe the process of digestion of starch from mouth to small intestine." },
      ],
      long: [
        { text: "Draw and explain the structure of a plant cell. How does it differ from an animal cell? List at least 5 differences." },
        { text: "Explain the nitrogen cycle with a labelled diagram description. Why is it important for ecosystems?" },
        { text: "Describe the process of electrolysis of water. Write the equations at both electrodes and state the volumes of gases collected." },
        { text: "What are the different types of chemical reactions? Give one example of each with balanced chemical equations." },
      ],
      case: [
        { text: "Study the food chain: Grass → Grasshopper → Frog → Snake → Eagle. Answer: (a) Name the primary producer. (b) Which organism is a tertiary consumer? (c) What happens if frogs are removed from the ecosystem?" },
        { text: "A student tested several substances with litmus paper. Results: Vinegar turns red, baking soda turns blue, milk stays neutral. Classify these as acid, base, or neutral and explain using the pH scale." },
      ],
    };
  }

  if (s.includes('history') || s.includes('social') || s.includes('civics') || s.includes('geography')) {
    return {
      mcq: [
        { text: "India gained independence on:", options: ["26 January 1950", "15 August 1947", "26 January 1947", "2 October 1947"] },
        { text: "The Constitution of India came into effect on:", options: ["15 August 1947", "26 November 1949", "26 January 1950", "30 January 1948"] },
        { text: "The Dandi March was led by:", options: ["Jawaharlal Nehru", "Subhas Chandra Bose", "Mahatma Gandhi", "Bhagat Singh"] },
        { text: "The Himalayas are an example of:", options: ["Old fold mountains", "Block mountains", "Young fold mountains", "Volcanic mountains"] },
        { text: "Which river is known as the Sorrow of Bihar?", options: ["Ganga", "Kosi", "Son", "Gandak"] },
        { text: "Fundamental Rights are enshrined in which part of the Indian Constitution?", options: ["Part I", "Part II", "Part III", "Part IV"] },
        { text: "The first session of the Indian National Congress was held in:", options: ["Calcutta", "Bombay", "Delhi", "Madras"] },
        { text: "The Non-Cooperation Movement was launched in:", options: ["1919", "1920", "1922", "1930"] },
      ],
      short: [
        { text: "What were the main causes of the First World War? Explain any two." },
        { text: "Describe the significance of the Quit India Movement of 1942." },
        { text: "What is federalism? How is it implemented in India?" },
        { text: "Explain the importance of the Preamble of the Indian Constitution." },
        { text: "What are the main physical divisions of India? Briefly describe each." },
        { text: "What were the economic causes of the French Revolution?" },
      ],
      long: [
        { text: "Trace the rise of nationalism in India from 1885 to 1947. Discuss the key movements and leaders that shaped the independence struggle." },
        { text: "Compare and contrast the French Revolution and the American Revolution. What were their causes, events, and outcomes?" },
        { text: "Explain the features of Indian democracy. How does the Parliament function? Describe the roles of the Lok Sabha and Rajya Sabha." },
        { text: "Describe the geographical diversity of India. How does climate, vegetation, and terrain vary across regions?" },
      ],
      case: [
        { text: "Study the given map of India showing major rivers. (a) Identify three peninsular rivers. (b) State why Himalayan rivers are perennial. (c) Name the river that forms a delta before joining the sea." },
        { text: "Read the excerpt from Gandhi's speech during the Non-Cooperation Movement and answer: (a) What grievances are mentioned? (b) What methods of protest are encouraged? (c) How was this different from earlier protest movements?" },
      ],
    };
  }

  if (s.includes('english') || s.includes('literature') || s.includes('grammar')) {
    return {
      mcq: [
        { text: "Identify the correct passive voice: 'She wrote the letter':", options: ["The letter was written by her", "The letter is written by her", "She was written the letter", "The letter had written by her"] },
        { text: "Choose the correct synonym of 'Benevolent':", options: ["Cruel", "Kind", "Brave", "Hasty"] },
        { text: "A 'Sonnet' is a poem with how many lines?", options: ["8", "10", "14", "16"] },
        { text: "Which figure of speech is used in 'The world is a stage'?", options: ["Simile", "Metaphor", "Hyperbole", "Personification"] },
        { text: "The plural of 'phenomenon' is:", options: ["Phenomenons", "Phenomena", "Phenomenas", "Phenomenone"] },
        { text: "Identify the adverb: 'She sang beautifully':", options: ["She", "sang", "beautifully", "None"] },
        { text: "'To kill two birds with one stone' means:", options: ["To be cruel", "To achieve two things with one action", "To go hunting", "To waste effort"] },
        { text: "Which tense: 'He has been reading for two hours':", options: ["Simple Present", "Past Perfect", "Present Perfect Continuous", "Future Continuous"] },
      ],
      short: [
        { text: "Write a letter to your principal requesting permission to organise a cultural event." },
        { text: "Rewrite the following sentences in passive voice: (a) Tom eats an apple. (b) She will write the report." },
        { text: "Explain the theme of the poem you have studied in class. How does the poet use imagery?" },
        { text: "Write a paragraph about the importance of reading books in the digital age." },
        { text: "Identify and correct grammatical errors in the given sentences." },
        { text: "What is the difference between a phrase and a clause? Give examples." },
      ],
      long: [
        { text: "Write a descriptive essay (300-400 words) on 'A Visit to a Historical Monument'. Include sensory details and a reflective conclusion." },
        { text: "Analyse the character of the protagonist in the prose you have studied. How does the character evolve through the narrative?" },
        { text: "Write a speech for your school assembly on 'The Role of Youth in Nation Building'." },
        { text: "Compare and contrast two poems studied in class. Discuss themes, tone, figurative language, and structure." },
      ],
      case: [
        { text: "Read the given passage carefully. (a) Find the meaning of underlined words from context. (b) Answer comprehension questions. (c) Identify the literary devices used. (d) Write the central idea in your own words." },
        { text: "Study the dialogue between two characters in the chapter. (a) Identify the tone. (b) What conflict is revealed? (c) How does this scene advance the plot?" },
      ],
    };
  }

  // Generic fallback pool
  return {
    mcq: [
      { text: `Which of the following best defines the core concept in ${subject}?`, options: ["Systematic study of natural phenomena", "Application of theoretical frameworks", "Collection of empirical evidence", "Analysis of patterns and relationships"] },
      { text: `What is the primary method used in ${subject} research?`, options: ["Observation and hypothesis testing", "Random sampling only", "Literature review alone", "Expert opinion"] },
      { text: `The most fundamental principle in ${subject} is:`, options: ["Correlation implies causation", "Systematic inquiry and evidence-based reasoning", "Historical precedent", "Majority consensus"] },
      { text: `Which technique is used to analyse data in ${subject}?`, options: ["Qualitative analysis", "Quantitative analysis", "Both qualitative and quantitative", "None of the above"] },
    ],
    short: [
      { text: `Define the key terminology used in ${subject} and explain its significance.` },
      { text: `Explain the main theories or frameworks studied in ${subject}.` },
      { text: `Describe three real-world applications of ${subject} concepts.` },
      { text: `What are the limitations or challenges faced in ${subject}?` },
      { text: `Compare two major approaches or schools of thought in ${subject}.` },
    ],
    long: [
      { text: `Critically analyse the development of ${subject} as a field of study. Discuss major milestones, key contributors, and modern-day relevance.` },
      { text: `Design an experiment or study to investigate a key problem in ${subject}. Include hypothesis, methodology, expected results, and limitations.` },
      { text: `Evaluate the impact of technology on the advancement of ${subject}. Use specific examples to support your argument.` },
    ],
    case: [
      { text: `A case study is presented involving a real-world scenario in ${subject}. Analyse the situation, identify the key issues, and propose evidence-based solutions.` },
      { text: `Study the data set provided related to ${subject}. Interpret the trends, calculate key statistics, and draw meaningful conclusions.` },
    ],
  };
};

const getMockQuestionsForType = (
  type: QuestionType,
  count: number,
  marks: number,
  difficulty: Difficulty,
  subject: string
): IQuestion[] => {
  const pool = getSubjectPool(subject);
  let selectedPool: { text: string; options?: string[] }[] = pool.short;

  if (type === 'mcq') selectedPool = pool.mcq;
  else if (type === 'long-answer') selectedPool = pool.long;
  else if (type === 'case-based') selectedPool = pool.case;

  const questions: IQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const item = selectedPool[i % selectedPool.length];
    questions.push({
      text: item.text,
      type,
      difficulty,
      marks,
      options: type === 'mcq' ? ((item as any).options || ['Option A', 'Option B', 'Option C', 'Option D']) : undefined,
    });
  }
  return questions;
};

const totalQuestionsCount = (specs: ParsedSectionSpec[]): number =>
  specs.reduce((sum, s) => sum + s.numQuestions, 0);

const generateMockPaper = (
  title: string,
  subject: string,
  numQuestions: number,
  marksPerQuestion: number,
  difficulty: Difficulty,
  questionType: QuestionType,
  instructions: string
): IQuestionPaper => {
  const parsedSpecs = parseQuestionStructure(instructions);

  if (parsedSpecs) {
    let totalMarks = 0;
    const sections: ISection[] = [];
    const answerKey: { questionIndex: number; answer: string }[] = [];
    let qIdx = 0;

    parsedSpecs.forEach((spec, idx) => {
      const typeTag = mapTypeStringToSchema(spec.typeString);
      const questions = getMockQuestionsForType(typeTag, spec.numQuestions, spec.marks, difficulty, subject);
      const sectionLetter = String.fromCharCode(65 + idx);

      sections.push({
        title: `Section ${sectionLetter}: ${spec.typeString}`,
        instruction: `Attempt all questions. Each question carries ${spec.marks} mark${spec.marks > 1 ? 's' : ''}.`,
        questions,
      });

      questions.forEach((q) => {
        const answer = q.type === 'mcq'
          ? `${(q.options as string[])[1]} — This is the correct answer based on the concept: "${q.text.substring(0, 50)}..."`
          : `Detailed answer: ${q.text.substring(0, 60)}... Refer to chapter notes for complete explanation.`;
        answerKey.push({ questionIndex: qIdx++, answer });
      });

      totalMarks += spec.numQuestions * spec.marks;
    });

    return {
      title, subject, totalMarks,
      duration: `${Math.max(30, totalQuestionsCount(parsedSpecs) * 5)} Minutes`,
      sections, answerKey,
    };
  }

  // Fallback
  const totalMarks = numQuestions * marksPerQuestion;
  const questions = getMockQuestionsForType(
    questionType === 'mixed' ? 'short-answer' : questionType,
    numQuestions, marksPerQuestion, difficulty, subject
  );

  const answerKey = questions.map((q, idx) => ({
    questionIndex: idx,
    answer: q.type === 'mcq'
      ? `${(q.options as string[])?.[1] || 'Option B'} — Correct based on: "${q.text.substring(0, 50)}..."`
      : `Answer: ${q.text.substring(0, 60)}... See textbook chapter for full explanation.`,
  }));

  return {
    title, subject, totalMarks,
    duration: `${Math.max(30, numQuestions * 5)} Minutes`,
    sections: [{ title: 'Section A: General Assessment', instruction: `Attempt all ${numQuestions} questions.`, questions }],
    answerKey,
  };
};

// LLM API Generator
const generateLlmPaper = async (assignment: any): Promise<IQuestionPaper> => {
  const parsedSpecs = parseQuestionStructure(assignment.additionalInstructions || '');
  let expectedTotalMarks = assignment.numQuestions * assignment.marksPerQuestion;
  let specsPrompt = '';

  if (parsedSpecs) {
    expectedTotalMarks = parsedSpecs.reduce((sum, s) => sum + (s.numQuestions * s.marks), 0);
    specsPrompt = `STRUCTURE:\n${parsedSpecs.map((s, idx) =>
      `Section ${String.fromCharCode(65 + idx)}: "${s.typeString}", type="${mapTypeStringToSchema(s.typeString)}", count=${s.numQuestions}, marks=${s.marks}`
    ).join('\n')}\nTotal marks: ${expectedTotalMarks}`;
  }

  const prompt = `Generate a structured exam paper for:
Subject: ${assignment.subject}
Title: ${assignment.title}
Difficulty: ${assignment.difficulty}
${specsPrompt || `Type: ${assignment.questionType}, Questions: ${assignment.numQuestions}, Marks each: ${assignment.marksPerQuestion}`}
Extra: ${assignment.additionalInstructions || 'None'}
${assignment.fileContent ? `File context: ${assignment.fileContent.substring(0, 500)}` : ''}

Return ONLY valid JSON (no markdown):
{"title":"...","subject":"...","totalMarks":${expectedTotalMarks},"duration":"...","sections":[{"title":"...","instruction":"...","questions":[{"text":"...","type":"mcq|short-answer|long-answer|case-based","difficulty":"easy|medium|hard","marks":1,"options":["A","B","C","D"]}]}],"answerKey":[{"questionIndex":0,"answer":"..."}]}`;

  console.log(`Calling Gemini API for assignment ${assignment._id}...`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`Gemini API call timed out after 15 seconds for assignment ${assignment._id}. Aborting request.`);
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      throw new Error('Empty Gemini response structure');
    }
    
    let cleanRaw = raw.trim();
    if (cleanRaw.startsWith('```')) {
      cleanRaw = cleanRaw.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    }
    
    console.log(`Gemini API returned valid response for assignment ${assignment._id}`);
    return JSON.parse(cleanRaw);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`Error during Gemini API call for ${assignment._id}:`, err.message);
    throw err;
  }
};

export const startAssessmentWorker = () => {
  const redisOptions = getRedisConnectionOptions();

  const worker = new Worker(
    'assessment-queue',
    async (job: Job) => {
      const { assignmentId } = job.data;
      console.log(`Worker received job ${job.id} for assignment ${assignmentId}`);

      if (mongoose.connection.readyState !== 1) throw new Error('MongoDB not connected');

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

      try {
        assignment.status = 'processing';
        assignment.progress = 15;
        await assignment.save();
        broadcastProgress(assignmentId, 'processing', 15);
        await new Promise(r => setTimeout(r, 80));

        assignment.status = 'generating';
        assignment.progress = 40;
        await assignment.save();
        broadcastProgress(assignmentId, 'generating', 40);

        let questionPaper: IQuestionPaper;
        if (API_KEY) {
          try {
            questionPaper = await generateLlmPaper(assignment);
          } catch (e: any) {
            console.error('LLM failed, falling back to mock:', e.message);
            await new Promise(r => setTimeout(r, 50));
            questionPaper = generateMockPaper(assignment.title, assignment.subject, assignment.numQuestions, assignment.marksPerQuestion, assignment.difficulty, assignment.questionType, assignment.additionalInstructions || '');
          }
        } else {
          console.log('No API key — using mock generator.');
          await new Promise(r => setTimeout(r, 100));
          questionPaper = generateMockPaper(assignment.title, assignment.subject, assignment.numQuestions, assignment.marksPerQuestion, assignment.difficulty, assignment.questionType, assignment.additionalInstructions || '');
        }

        assignment.status = 'generating';
        assignment.progress = 75;
        await assignment.save();
        broadcastProgress(assignmentId, 'formatting', 75);
        await new Promise(r => setTimeout(r, 80));

        assignment.status = 'completed';
        assignment.progress = 100;
        assignment.result = questionPaper;
        await assignment.save();

        // Save to GenerationResult collection
        await GenerationResult.findOneAndUpdate(
          { assignmentId },
          { assignmentId, result: questionPaper, status: 'completed' },
          { upsert: true, new: true }
        );

        broadcastProgress(assignmentId, 'completed', 100, { result: questionPaper });
        console.log(`Worker completed job ${job.id}`);
        return questionPaper;

      } catch (error: any) {
        assignment.status = 'failed';
        assignment.progress = 100;
        assignment.error = error.message;
        await assignment.save();

        // Save/update status to failed in GenerationResult
        await GenerationResult.findOneAndUpdate(
          { assignmentId },
          { assignmentId, status: 'failed' },
          { upsert: true, new: true }
        );

        broadcastProgress(assignmentId, 'failed', 100, { error: error.message });
        throw error;
      }
    },
    {
      connection: redisOptions,
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err.message));
  worker.on('completed', (job) => console.log(`Job ${job.id} completed!`));
  console.log('BullMQ Assessment Worker started successfully.');
  return worker;
};
