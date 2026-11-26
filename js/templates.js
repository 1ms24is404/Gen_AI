/**
 * Sample Pre-built Exam Paper Templates
 */

window.SAMPLE_TEMPLATES = [
  {
    id: 'physics_12',
    name: 'Class 12 Physics - Electrostatics & Current',
    subject: 'Physics',
    topic: 'Electrostatics, Gauss Law, Capacitance & Current Electricity',
    grade: 'Class 12 / Senior High',
    difficulty: 'Medium',
    blooms: 'Apply & Solve',
    institution: 'National Science Academy',
    examTitle: 'Mid-Term Physics Examination 2026',
    subjectCode: 'PHY-1201',
    duration: '3 Hours',
    totalMarks: 70,
    instructions: [
      'All questions are compulsory.',
      'Section A contains 10 MCQs carrying 1 mark each.',
      'Section B contains 5 Short Answer questions carrying 3 marks each.',
      'Section C contains 3 Long Answer questions carrying 5 marks each.',
      'Section D contains 2 Case Study/Numerical problems carrying 5 marks each.',
      'Use of log tables or calculators is permitted. Express final answers with units.'
    ],
    sections: [
      { id: 'sec_a', name: 'Section A - Multiple Choice Questions', type: 'mcq', markPerQuestion: 1, count: 10 },
      { id: 'sec_b', name: 'Section B - Short Answer Questions', type: 'short', markPerQuestion: 3, count: 5 },
      { id: 'sec_c', name: 'Section C - Long Answer Questions', type: 'long', markPerQuestion: 5, count: 3 },
      { id: 'sec_d', name: 'Section D - Numerical & Case Studies', type: 'case', markPerQuestion: 5, count: 2 }
    ]
  },
  {
    id: 'cs_algo',
    name: 'CS 101 - Data Structures & Algorithms',
    subject: 'Computer Science',
    topic: 'Binary Search Trees, Graph Traversals (BFS/DFS), Dynamic Programming & Sorting',
    grade: 'Undergraduate / College',
    difficulty: 'Hard',
    blooms: 'Analyze & Evaluate',
    institution: 'Institute of Technology',
    examTitle: 'End-Semester Computer Science Exam',
    subjectCode: 'CS-302',
    duration: '2.5 Hours',
    totalMarks: 50,
    instructions: [
      'Section A has 5 MCQs (1 mark each).',
      'Section B has 3 Short conceptual questions (5 marks each).',
      'Section C has 3 Coding / Algorithm design problems (10 marks each).',
      'Write clean pseudocode and state time/space complexity explicitly.'
    ],
    sections: [
      { id: 'sec_a', name: 'Section A - Fundamentals', type: 'mcq', markPerQuestion: 1, count: 5 },
      { id: 'sec_b', name: 'Section B - Conceptual Analysis', type: 'short', markPerQuestion: 5, count: 3 },
      { id: 'sec_c', name: 'Section C - Algorithm Design & Proofs', type: 'long', markPerQuestion: 10, count: 3 }
    ]
  },
  {
    id: 'math_calc',
    name: 'Mathematics - Calculus & Vectors',
    subject: 'Mathematics',
    topic: 'Definite Integrals, Differential Equations, Vector Algebra & 3D Geometry',
    grade: 'Senior High / College Prep',
    difficulty: 'Medium',
    blooms: 'Apply & Solve',
    institution: 'St. Jude School of Mathematics',
    examTitle: 'Final Calculus Test',
    subjectCode: 'MATH-401',
    duration: '3 Hours',
    totalMarks: 80,
    instructions: [
      'Show clear steps for full credit in calculation questions.',
      'Section A consists of 10 Multiple Choice Questions (2 marks each).',
      'Section B consists of 6 Problem Solving Questions (5 marks each).',
      'Section C consists of 3 Comprehensive Analytical Questions (10 marks each).'
    ],
    sections: [
      { id: 'sec_a', name: 'Section A - Objective Type', type: 'mcq', markPerQuestion: 2, count: 10 },
      { id: 'sec_b', name: 'Section B - Problem Solving', type: 'short', markPerQuestion: 5, count: 6 },
      { id: 'sec_c', name: 'Section C - Advanced Calculus Proofs', type: 'long', markPerQuestion: 10, count: 3 }
    ]
  },
  {
    id: 'history_world',
    name: 'World History - Industrial Revolution & WWI',
    subject: 'History',
    topic: 'Industrialization in Europe, Alliances, Causes & Impact of World War I',
    grade: 'High School',
    difficulty: 'Easy',
    blooms: 'Remember & Understand',
    institution: 'Oakridge International Academy',
    examTitle: 'History Unit Assessment',
    subjectCode: 'HIST-201',
    duration: '1.5 Hours',
    totalMarks: 35,
    instructions: [
      'Answer all questions in legible handwriting.',
      'Support historical assertions with relevant facts and historical context.'
    ],
    sections: [
      { id: 'sec_a', name: 'Section A - Key Terms & Dates', type: 'mcq', markPerQuestion: 1, count: 5 },
      { id: 'sec_b', name: 'Section B - Short Explanations', type: 'short', markPerQuestion: 3, count: 5 },
      { id: 'sec_c', name: 'Section C - Essay Question', type: 'long', markPerQuestion: 15, count: 1 }
    ]
  }
];
