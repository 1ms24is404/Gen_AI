/**
 * Question Paper Generator Module
 * Supports both Live Gemini API and Intelligent Offline Fallback Generator
 */

class PaperGenerator {
  constructor() {
    this.apiKey = localStorage.getItem('gemini_api_key') || '';
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem('gemini_api_key', this.apiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  async generate(config, onProgress = () => {}) {
    onProgress('Building exam parameters and prompt matrix...');

    if (this.apiKey) {
      try {
        onProgress('Sending request to Gemini AI model...');
        const result = await this.callGeminiApi(config);
        onProgress('Received AI response. Parsing structured paper...');
        return result;
      } catch (err) {
        console.warn('Gemini API failed or key invalid, falling back to Intelligent Offline Engine:', err);
        onProgress('Gemini API call failed. Switching seamlessly to Offline Intelligent Synthesis Engine...');
        await new Promise(r => setTimeout(r, 400));
        return this.generateOfflinePaper(config);
      }
    } else {
      onProgress('Synthesizing structured question paper with Intelligent Engine...');
      await new Promise(r => setTimeout(r, 500));
      return this.generateOfflinePaper(config);
    }
  }

  async callGeminiApi(config) {
    const prompt = this.buildPrompt(config);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API Error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini API');

    try {
      const parsed = JSON.parse(rawText);
      return this.formatPaperData(parsed, config);
    } catch (e) {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return this.formatPaperData(parsed, config);
    }
  }

  buildPrompt(config) {
    return `You are an expert academic professor and exam setter. 
Generate a comprehensive, high-quality, structured question paper based on the following specifications:

- Subject: ${config.subject}
- Topic Focus: ${config.topic}
- Target Grade / Level: ${config.grade}
- Difficulty Level: ${config.difficulty}
- Bloom's Taxonomy Focus: ${config.blooms}
- Total Marks Target: ${config.totalMarks}

Sections Required:
${(config.sections || []).map(s => `- ${s.name}: ${s.count} questions of type '${s.type}', carrying ${s.markPerQuestion} mark(s) each.`).join('\n')}

Output MUST be strictly valid JSON matching this exact structure:
{
  "institution": "${config.institution}",
  "examTitle": "${config.examTitle}",
  "subjectCode": "${config.subjectCode}",
  "duration": "${config.duration}",
  "instructions": [
    "Instruction 1",
    "Instruction 2"
  ],
  "sections": [
    {
      "title": "Section A Title",
      "type": "mcq",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "question": "Question text here. Use LaTeX for math like \\\\( E = mc^2 \\\\) if applicable.",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A - Full correct answer details",
          "markingScheme": "1 mark for selecting option A.",
          "marks": 1
        }
      ]
    }
  ]
}

Make sure questions test critical thinking, problem-solving, and subject mastery. Provide detailed, step-by-step solutions for every question in the 'answer' field and breakdown in 'markingScheme'.`;
  }

  formatPaperData(parsed, config) {
    return {
      metadata: {
        institution: parsed.institution || config.institution,
        examTitle: parsed.examTitle || config.examTitle,
        subject: config.subject,
        subjectCode: parsed.subjectCode || config.subjectCode,
        topic: config.topic,
        grade: config.grade,
        difficulty: config.difficulty,
        blooms: config.blooms,
        duration: parsed.duration || config.duration,
        totalMarks: config.totalMarks,
        dateGenerated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        instructions: parsed.instructions && parsed.instructions.length ? parsed.instructions : config.instructions
      },
      sections: parsed.sections || []
    };
  }

  generateOfflinePaper(config) {
    const subject = (config.subject || 'General Knowledge').toLowerCase();
    const topic = config.topic || 'Core Principles';
    const difficulty = config.difficulty || 'Medium';

    const generatedSections = (config.sections || []).map((sec, secIdx) => {
      const qList = [];
      const count = Number(sec.count) || 1;
      const mark = Number(sec.markPerQuestion) || 1;

      for (let i = 1; i <= count; i++) {
        const qNum = i;
        
        let qData = {};
        if (sec.type === 'mcq') {
          qData = this.getSampleMCQ(subject, topic, difficulty, qNum, secIdx);
        } else if (sec.type === 'short') {
          qData = this.getSampleShortQ(subject, topic, difficulty, qNum, secIdx);
        } else if (sec.type === 'long') {
          qData = this.getSampleLongQ(subject, topic, difficulty, qNum, secIdx);
        } else {
          qData = this.getSampleCaseQ(subject, topic, difficulty, qNum, secIdx);
        }

        qList.push({
          id: `sec_${secIdx + 1}_q_${i}`,
          question: qData.question,
          options: qData.options || null,
          answer: qData.answer,
          markingScheme: qData.markingScheme || `${mark} mark(s) awarded for complete and correct response with proper working.`,
          marks: mark
        });
      }

      return {
        id: sec.id || `sec_${secIdx}`,
        title: sec.name || `Section ${String.fromCharCode(65 + secIdx)}`,
        type: sec.type,
        marksPerQuestion: mark,
        questions: qList
      };
    });

    return {
      metadata: {
        institution: config.institution || 'Department of Examinations',
        examTitle: config.examTitle || `${config.subject} Assessment Test`,
        subject: config.subject,
        subjectCode: config.subjectCode || 'SUB-101',
        topic: config.topic,
        grade: config.grade,
        difficulty: config.difficulty,
        blooms: config.blooms,
        duration: config.duration || '2 Hours',
        totalMarks: config.totalMarks,
        dateGenerated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        instructions: config.instructions || [
          'Read all questions carefully before answering.',
          'Write legibly and show step-by-step working where required.',
          'All answers must be verified before submission.'
        ]
      },
      sections: generatedSections
    };
  }

  getSampleMCQ(subject, topic, difficulty, num, secIdx) {
    if (subject.includes('physic')) {
      const templates = [
        {
          question: `Which of the following statements correctly describes Gauss's Law in electrostatics regarding ${topic}?`,
          options: [
            'Total electric flux through a closed surface equals net charge enclosed divided by \\(\\varepsilon_0\\)',
            'Electric field is always independent of distance for point charges',
            'Magnetic flux through a closed surface is non-zero',
            'Electrostatic force is a non-conservative force field'
          ],
          answer: 'Option A: Gauss\'s Law states \\(\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enclosed}}{\\varepsilon_0}\\).',
          markingScheme: '1 mark for selecting Option A.'
        },
        {
          question: `A parallel plate capacitor with plate area \\(A\\) and separation \\(d\\) is filled with a dielectric material of constant \\(K = 4\\). If original capacitance was \\(C_0 = 10\\,\\mu\\text{F}\\), what is the new capacitance?`,
          options: ['40 \\(\\mu\\text{F}\\)', '2.5 \\(\\mu\\text{F}\\)', '20 \\(\\mu\\text{F}\\)', '10 \\(\\mu\\text{F}\\)'],
          answer: 'Option A: New capacitance \\(C = K \\cdot C_0 = 4 \\times 10 = 40\\,\\mu\\text{F}\\).',
          markingScheme: '1 mark for calculating \\(C = K C_0\\).'
        },
        {
          question: `What is the SI unit of electric dipole moment?`,
          options: ['Coulomb-meter (C·m)', 'Newton per Coulomb (N/C)', 'Farad per meter (F/m)', 'Joules per Tesla (J/T)'],
          answer: 'Option A: Dipole moment \\(p = q \\cdot 2a\\), so units are Coulomb \\(\\times\\) meter (C·m).',
          markingScheme: '1 mark for C·m.'
        }
      ];
      return templates[(num - 1) % templates.length];
    } else if (subject.includes('computer') || subject.includes('cs') || subject.includes('code')) {
      const templates = [
        {
          question: `What is the worst-case time complexity of QuickSort when bad pivot selection occurs on ${topic}?`,
          options: ['\\(O(N^2)\\)', '\\(O(N \\log N)\\)', '\\(O(N)\\)', '\\(O(2^N)\\)'],
          answer: 'Option A: In the worst-case (e.g. sorted array with first element as pivot), QuickSort degenerates to \\(O(N^2)\\).',
          markingScheme: '1 mark for selecting \\(O(N^2)\\).'
        },
        {
          question: `In a Binary Search Tree (BST), which traversal order yields elements in strictly ascending sorted order?`,
          options: ['In-order Traversal', 'Pre-order Traversal', 'Post-order Traversal', 'Level-order Traversal'],
          answer: 'Option A: In-order traversal (Left, Root, Right) produces sorted order in BST.',
          markingScheme: '1 mark for In-order.'
        },
        {
          question: `Which algorithm design strategy is typically used to solve the Shortest Path Problem in Dijkstra's Algorithm?`,
          options: ['Greedy Approach', 'Dynamic Programming', 'Divide and Conquer', 'Backtracking'],
          answer: 'Option A: Dijkstra algorithm selects the minimum weight vertex greedily at each step.',
          markingScheme: '1 mark for Greedy Approach.'
        }
      ];
      return templates[(num - 1) % templates.length];
    } else if (subject.includes('math')) {
      const templates = [
        {
          question: `What is the value of the definite integral \\(\\int_{0}^{\\pi/2} \\sin(x) \\, dx\\)?`,
          options: ['1', '0', '\\(\\pi\\)', '1/2'],
          answer: 'Option A: \\(\\int \\sin(x) dx = -\\cos(x)\\). Evaluating from 0 to \\(\\pi/2\\) gives \\(-\\cos(\\pi/2) - (-\\cos(0)) = 0 + 1 = 1\\).',
          markingScheme: '1 mark for correct evaluation.'
        },
        {
          question: `If vectors \\(\\vec{a} = 2\\hat{i} + 3\\hat{j}\\) and \\(\\vec{b} = x\\hat{i} - 4\\hat{j}\\) are perpendicular, what is the value of \\(x\\)?`,
          options: ['6', '4', '-6', '12'],
          answer: 'Option A: For perpendicular vectors, \\(\\vec{a} \\cdot \\vec{b} = 0 \\implies 2x + 3(-4) = 0 \\implies 2x = 12 \\implies x = 6\\).',
          markingScheme: '1 mark for solving dot product = 0.'
        }
      ];
      return templates[(num - 1) % templates.length];
    } else {
      return {
        question: `Regarding ${topic} in ${subject}, which of the following represents the key foundational principle?`,
        options: [
          `Systematic analysis of ${topic} through empirical observation`,
          `Random variable fluctuations without structured governing laws`,
          `Complete static state with zero qualitative transform`,
          `None of the above`
        ],
        answer: `Option A: Empirical observation and analytical proof form the core of ${topic}.`,
        markingScheme: '1 mark for correct choice.'
      };
    }
  }

  getSampleShortQ(subject, topic, difficulty, num, secIdx) {
    if (subject.includes('physic')) {
      return {
        question: `Derive an expression for the electric field \\(E\\) at a distance \\(r\\) from an infinitely long straight uniformly charged wire of linear charge density \\(\\lambda\\) using Gauss's Law.`,
        answer: `Solution Step-by-Step:\n1. Choose a cylindrical Gaussian surface of radius r and length L coaxial with the wire.\n2. Electric flux through flat circular ends is zero because E is perpendicular to dA.\n3. Flux through curved surface: \\(\\Phi = E \\cdot (2\\pi r L)\\).\n4. By Gauss's Law, \\(\\Phi = \\frac{Q}{\\varepsilon_0} = \\frac{\\lambda L}{\\varepsilon_0}\\).\n5. Equating both sides: \\(E (2\\pi r L) = \\frac{\\lambda L}{\\varepsilon_0} \\implies E = \\frac{\\lambda}{2\\pi \\varepsilon_0 r}\\).`,
        markingScheme: '1 mark for Gaussian cylinder setup. 1 mark for flux formulation. 1 mark for final derivation.'
      };
    } else if (subject.includes('computer') || subject.includes('cs')) {
      return {
        question: `Explain the fundamental difference between Breadth-First Search (BFS) and Depth-First Search (DFS) on graphs in terms of data structures used and traversal order.`,
        answer: `Key Differences:\n1. Data Structure: BFS utilizes a Queue (FIFO) while DFS utilizes a Stack (LIFO) or recursion.\n2. Traversal Path: BFS explores graph level-by-level (broad search). DFS explores as deep as possible before backtracking.\n3. Time Complexity: Both run in O(V + E) for adjacency list representation.`,
        markingScheme: '2 marks for Queue vs Stack comparison. 2 marks for traversal level explanation. 1 mark for complexity.'
      };
    } else if (subject.includes('math')) {
      return {
        question: `Solve the differential equation: \\(\\frac{dy}{dx} + 2y = e^{-x}\\).`,
        answer: `Solution:\n1. Linear differential equation of form dy/dx + P(x)y = Q(x) with P(x) = 2, Q(x) = e^(-x).\n2. Integrating factor I.F. = e^(integral 2 dx) = e^(2x).\n3. Solution: y * e^(2x) = integral e^(-x) * e^(2x) dx = e^x + C.\n4. General Solution: y = e^(-x) + C * e^(-2x).`,
        markingScheme: '2 marks for finding I.F. = e^(2x). 2 marks for integration. 1 mark for general solution.'
      };
    } else {
      return {
        question: `Analyze the primary factors influencing ${topic} in ${subject}, and outline two major real-world applications.`,
        answer: `Detailed Answer:\n1. Core Drivers: Systematic interaction, variable constraints, and historical context.\n2. Application 1: Predictive modeling in empirical studies.\n3. Application 2: Optimization of workflows in practical domain scenarios.`,
        markingScheme: '2 marks for identifying key factors. 2 marks for real-world applications.'
      };
    }
  }

  getSampleLongQ(subject, topic, difficulty, num, secIdx) {
    if (subject.includes('physic')) {
      return {
        question: `(a) State the principle of working of a parallel plate capacitor.\n(b) Obtain an expression for the energy stored in a parallel plate capacitor of capacitance \\(C\\) charged to potential \\(V\\).\n(c) A capacitor of capacitance \\(6\\,\\mu\\text{F}\\) is charged to \\(100\\,\\text{V}\\). Calculate the energy lost when it is connected in parallel with an uncharged capacitor of \\(4\\,\\mu\\text{F}\\).`,
        answer: `Detailed Solution:\n\n(a) Capacitor Principle: Stored electrical potential energy in the electric field between oppositely charged conductors.\n\n(b) Energy Derivation:\nWork done to add small charge dq when potential is v = q/C:\n dW = v dq = (q/C) dq\nTotal work done to charge from 0 to Q:\n U = integral_0^Q (q/C) dq = (1/2) * (Q^2 / C) = (1/2) C V^2\n\n(c) Numerical Calculation:\n- Initial energy U_i = (1/2) * C_1 * V_1^2 = (1/2) * (6 * 10^-6) * (100)^2 = 0.03 J.\n- Common potential V_common = (C_1 V_1 + C_2 V_2) / (C_1 + C_2) = (6 * 100) / 10 = 60 V.\n- Final energy U_f = (1/2) * (C_1 + C_2) * V_common^2 = (1/2) * (10 * 10^-6) * (60)^2 = 0.018 J.\n- Energy Lost = U_i - U_f = 0.03 - 0.018 = 0.012 J (12 mJ).`,
        markingScheme: '1 mark for principle definition. 2 marks for energy proof U = 1/2 CV^2. 2 marks for numerical calculation resulting in 12 mJ.'
      };
    } else if (subject.includes('computer') || subject.includes('cs')) {
      return {
        question: `(a) Define Dynamic Programming (DP) and state two necessary properties a problem must satisfy to be solved using DP.\n(b) Write an efficient dynamic programming algorithm (or pseudocode) to solve the 0/1 Knapsack Problem.\n(c) Analyze the Time and Space complexity of your solution.`,
        answer: `Solution:\n\n(a) Necessary Conditions:\n1. Overlapping Subproblems: The recursive space contains repeating subproblems.\n2. Optimal Substructure: An optimal solution contains optimal solutions to subproblems.\n\n(b) Pseudocode:\ninitialize dp[N+1][C+1] with 0\nfor i from 1 to N:\n    for w from 0 to C:\n        if weight[i-1] <= w:\n            dp[i][w] = max(value[i-1] + dp[i-1][w - weight[i-1]], dp[i-1][w])\n        else:\n            dp[i][w] = dp[i-1][w]\nreturn dp[N][C]\n\n(c) Complexity:\n- Time Complexity: O(N * C)\n- Space Complexity: O(N * C)`,
        markingScheme: '2 marks for DP properties. 2 marks for recurrence. 1 mark for complexity analysis.'
      };
    } else {
      return {
        question: `Construct a comprehensive analytical thesis addressing the impact of ${topic} on modern ${subject}.\n(a) Detail three critical historical or theoretical developments.\n(b) Formulate an evaluative model to address potential edge-case failures.\n(c) Provide recommendations for future practical advancements.`,
        answer: `Comprehensive Essay & Solution Outline:\n\n(a) Theoretical Foundations:\n- Development 1: Primary formulation of core hypotheses.\n- Development 2: Refinement of methodology and structural metrics.\n- Development 3: Integration of modern computational tools.\n\n(b) Edge Case Analysis:\n- Identifies vulnerability points when parameters exceed standard boundaries.\n- Proposes dynamic feedback loops to stabilize performance.\n\n(c) Strategic Recommendations:\n- Establish standardized evaluation benchmarks across institutions.`,
        markingScheme: '2 marks for part (a). 2 marks for part (b). 1 mark for recommendations in part (c).'
      };
    }
  }

  getSampleCaseQ(subject, topic, difficulty, num, secIdx) {
    return {
      question: `Case Study / Practical Scenario:\nAn academic laboratory is examining an experimental system centered on ${topic} under standard conditions.\n\nObservation Data:\n- Parameter A increases linearly with time t.\n- Parameter B demonstrates exponential decay: B(t) = B_0 * e^(-k*t).\n- Total energy is conserved within +/- 0.5% margin.\n\nQuestions:\n1. Identify the primary law governing Parameter B decay. (2 Marks)\n2. Calculate the half-life time t_(1/2) when decay constant k = 0.05 s^-1. (3 Marks)`,
      answer: `Answers:\n1. Parameter B follows first-order exponential decay dynamics.\n2. Half-Life Calculation:\n t_(1/2) = ln(2) / k = 0.693 / 0.05 = 13.86 seconds.`,
      markingScheme: '2 marks for identifying decay law. 3 marks for t_(1/2) calculation.'
    };
  }
}

window.PaperGenerator = PaperGenerator;
