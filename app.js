/**
 * AI Question Paper Generator - Clean Minimalist Application Controller
 */

// Sample Preset Configurations
const PRESETS = {
  physics: {
    subject: 'Physics',
    grade: 'Class 12',
    topic: 'Electrostatics, Gauss Law & Capacitance',
    difficulty: 'Medium',
    totalMarks: 50
  },
  cs: {
    subject: 'Computer Science',
    grade: 'Undergraduate',
    topic: 'Binary Search Trees & Sorting Algorithms',
    difficulty: 'Hard',
    totalMarks: 40
  },
  math: {
    subject: 'Mathematics',
    grade: 'Class 12 / College Prep',
    topic: 'Definite Integrals & Differential Equations',
    difficulty: 'Medium',
    totalMarks: 60
  },
  history: {
    subject: 'History',
    grade: 'High School',
    topic: 'Industrial Revolution & Causes of WWI',
    difficulty: 'Easy',
    totalMarks: 30
  }
};

class App {
  constructor() {
    this.currentPaperData = null;
    this.init();
  }

  init() {
    this.bindEvents();
    // Auto-generate sample paper on page load
    this.generatePaper();
  }

  bindEvents() {
    // Form Submit
    const form = document.getElementById('generatorForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.generatePaper();
      });
    }

    // Presets Dropdown
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const key = e.target.value;
        if (key && PRESETS[key]) {
          const p = PRESETS[key];
          document.getElementById('subject').value = p.subject;
          document.getElementById('grade').value = p.grade;
          document.getElementById('topic').value = p.topic;
          document.getElementById('difficulty').value = p.difficulty;
          document.getElementById('totalMarks').value = p.totalMarks;
          this.generatePaper();
        }
      });
    }

    // Tab View Toggles
    const paperTabBtn = document.getElementById('viewPaperBtn');
    const solutionTabBtn = document.getElementById('viewSolutionBtn');
    const paperView = document.getElementById('paperView');
    const solutionView = document.getElementById('solutionView');

    if (paperTabBtn && solutionTabBtn) {
      paperTabBtn.addEventListener('click', () => {
        paperTabBtn.classList.add('active');
        solutionTabBtn.classList.remove('active');
        paperView.style.display = 'block';
        solutionView.style.display = 'none';
      });

      solutionTabBtn.addEventListener('click', () => {
        solutionTabBtn.classList.add('active');
        paperTabBtn.classList.remove('active');
        paperView.style.display = 'none';
        solutionView.style.display = 'block';
      });
    }

    // Print Button
    document.getElementById('printBtn')?.addEventListener('click', () => {
      window.print();
    });

    // Copy Text Button
    document.getElementById('copyBtn')?.addEventListener('click', () => {
      this.copyPaperText();
    });
  }

  async generatePaper() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Generating Paper...';
    }

    const config = {
      subject: document.getElementById('subject').value.trim() || 'Physics',
      grade: document.getElementById('grade').value.trim() || 'Class 12',
      topic: document.getElementById('topic').value.trim() || 'Core Topics',
      difficulty: document.getElementById('difficulty').value || 'Medium',
      totalMarks: parseInt(document.getElementById('totalMarks').value) || 50,
      apiKey: document.getElementById('apiKey').value.trim()
    };

    try {
      if (config.apiKey) {
        this.currentPaperData = await this.callGeminiAPI(config);
      } else {
        await new Promise(r => setTimeout(r, 400)); // Smooth UX delay
        this.currentPaperData = this.generateSynthesizedPaper(config);
      }

      this.renderPaper(this.currentPaperData);
      this.renderSolution(this.currentPaperData);
      this.triggerKaTeX();
    } catch (err) {
      console.warn('Generation fallback activated:', err);
      this.currentPaperData = this.generateSynthesizedPaper(config);
      this.renderPaper(this.currentPaperData);
      this.renderSolution(this.currentPaperData);
      this.triggerKaTeX();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Generate Question Paper';
      }
    }
  }

  async callGeminiAPI(config) {
    const prompt = `You are a professional professor setting an examination paper.
Subject: ${config.subject}
Grade: ${config.grade}
Topic: ${config.topic}
Difficulty: ${config.difficulty}
Total Marks: ${config.totalMarks}

Create a structured JSON question paper matching this schema:
{
  "institution": "National Examination Board",
  "examTitle": "${config.grade} ${config.subject} Final Examination",
  "duration": "2.5 Hours",
  "totalMarks": ${config.totalMarks},
  "instructions": [
    "All questions are compulsory.",
    "Draw neat diagrams wherever necessary."
  ],
  "sections": [
    {
      "title": "Section A - Multiple Choice Questions",
      "questions": [
        {
          "question": "Question string",
          "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
          "answer": "Option A explanation",
          "marks": 1
        }
      ]
    }
  ]
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  }

  generateSynthesizedPaper(config) {
    const subject = config.subject;
    const topic = config.topic;
    const total = config.totalMarks;

    // Distribute marks into Section A (MCQs), Section B (Short Answer), Section C (Long Answer)
    const mcqMarks = Math.max(5, Math.floor(total * 0.2));
    const shortMarks = Math.floor(total * 0.4);
    const longMarks = total - mcqMarks - shortMarks;

    const mcqCount = mcqMarks; // 1 mark each
    const shortCount = Math.max(1, Math.floor(shortMarks / 3)); // 3 marks each
    const longCount = Math.max(1, Math.floor(longMarks / 5)); // 5 marks each

    return {
      institution: 'Central Academic Board',
      examTitle: `${config.grade} ${subject} Examination`,
      subject: subject,
      subjectCode: `${subject.substring(0, 3).toUpperCase()}-101`,
      duration: total > 50 ? '3 Hours' : '2 Hours',
      totalMarks: total,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      instructions: [
        'Read all questions carefully before answering.',
        'Section A carries 1 mark per question.',
        'Section B carries 3 marks per question.',
        'Section C carries 5 marks per question.',
        'Express final numerical calculations with units where required.'
      ],
      sections: [
        {
          title: 'Section A - Objective Type Questions',
          questions: this.generateMCQs(subject, topic, mcqCount)
        },
        {
          title: 'Section B - Short Answer Questions',
          questions: this.generateShortQs(subject, topic, shortCount)
        },
        {
          title: 'Section C - Long Answer & Problem Solving',
          questions: this.generateLongQs(subject, topic, longCount)
        }
      ]
    };
  }

  generateMCQs(subject, topic, count) {
    const list = [];
    for (let i = 1; i <= count; i++) {
      if (subject.toLowerCase().includes('physic')) {
        list.push({
          question: `Which of the following describes the key principle of ${topic} regarding charge interaction?`,
          options: [
            'Electric flux through a closed surface is proportional to enclosed charge \\(Q / \\varepsilon_0\\)',
            'Force is inversely proportional to distance without square relationship',
            'Magnetic field lines always form open loops',
            'Capacitance decreases when dielectric material is inserted'
          ],
          answer: 'Option A: Gauss law states total electric flux \\(\\Phi = Q_{enclosed} / \\varepsilon_0\\).',
          marks: 1
        });
      } else if (subject.toLowerCase().includes('computer') || subject.toLowerCase().includes('cs')) {
        list.push({
          question: `What is the average time complexity of searching an element in a balanced Binary Search Tree (BST) for ${topic}?`,
          options: ['\\(O(\\log N)\\)', '\\(O(N)\\)', '\\(O(N^2)\\)', '\\(O(1)\\)'],
          answer: 'Option A: In a balanced BST, tree height is \\(\\log N\\), making search \\(O(\\log N)\\).',
          marks: 1
        });
      } else {
        list.push({
          question: `Which core foundational concept governs ${topic} in ${subject}?`,
          options: [
            `Empirical evaluation of ${topic} variables`,
            'Random unconstrained transformation',
            'Static zero-state equilibrium',
            'None of the above'
          ],
          answer: `Option A: Empirical evaluation forms the baseline for ${topic}.`,
          marks: 1
        });
      }
    }
    return list;
  }

  generateShortQs(subject, topic, count) {
    const list = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        question: `Explain the fundamental concept of **${topic}** in ${subject}. State two key applications or practical implications.`,
        answer: `Solution Outline:\n1. Core Definition: ${topic} establishes the framework for understanding primary domain interactions.\n2. Application 1: Modeling system behavior under boundary conditions.\n3. Application 2: Practical optimization in experimental setups.`,
        rubric: '1 mark for correct definition. 2 marks for stating two valid applications.',
        marks: 3
      });
    }
    return list;
  }

  generateLongQs(subject, topic, count) {
    const list = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        question: `(a) Derive or explain the main mathematical formulation for **${topic}**.\n(b) Solve a scenario where initial parameter \\(A_0 = 100\\) and decay constant \\(k = 0.05\\,\\text{s}^{-1}\\). Calculate half-life \\(t_{1/2}\\).`,
        answer: `Detailed Solution:\n(a) Mathematical Derivation: Parameter follows first-order dynamics \\(A(t) = A_0 e^{-kt}\\).\n(b) Half-life calculation:\n\\[ t_{1/2} = \\frac{\\ln(2)}{k} = \\frac{0.693}{0.05} = 13.86\\,\\text{seconds} \\]`,
        rubric: '2 marks for theoretical derivation. 3 marks for correct half-life calculation (13.86s).',
        marks: 5
      });
    }
    return list;
  }

  renderPaper(data) {
    const container = document.getElementById('paperView');
    if (!container) return;

    let html = `
      <div class="paper-header">
        <h1>${this.escape(data.institution)}</h1>
        <h2>${this.escape(data.examTitle)}</h2>
        <div class="paper-meta">
          <span>Subject: ${this.escape(data.subject || '')} (${this.escape(data.subjectCode || '')})</span>
          <span>Time: ${this.escape(data.duration || '2 Hours')}</span>
          <span>Max Marks: ${data.totalMarks}</span>
        </div>
        <div class="student-info">
          <span>Roll No: __________________</span>
          <span>Date: ${data.date || ''}</span>
        </div>
      </div>

      <div class="instructions">
        <h4>General Instructions:</h4>
        <ol>
          ${(data.instructions || []).map(i => `<li>${this.escape(i)}</li>`).join('')}
        </ol>
      </div>
    `;

    (data.sections || []).forEach(sec => {
      const secMarks = (sec.questions || []).reduce((sum, q) => sum + (q.marks || 1), 0);
      html += `
        <div class="paper-section">
          <div class="section-heading">
            <span>${this.escape(sec.title)}</span>
            <span>[Marks: ${secMarks}]</span>
          </div>
      `;

      (sec.questions || []).forEach((q, qIdx) => {
        html += `
          <div class="question-item">
            <div class="question-header">
              <div>
                <span class="q-number">Q${qIdx + 1}.</span>
                ${this.formatText(q.question)}
              </div>
              <span class="q-marks">[${q.marks}]</span>
            </div>
            ${q.options ? `
              <div class="q-options">
                ${q.options.map((opt, oIdx) => `
                  <div><strong>(${String.fromCharCode(65 + oIdx)})</strong> ${this.formatText(opt)}</div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      });

      html += `</div>`;
    });

    html += `<div class="paper-footer">*** END OF EXAMINATION PAPER ***</div>`;

    container.innerHTML = html;
  }

  renderSolution(data) {
    const container = document.getElementById('solutionView');
    if (!container) return;

    let html = `
      <div class="paper-header">
        <h1>${this.escape(data.institution)}</h1>
        <h2>${this.escape(data.examTitle)} - Official Solution Key</h2>
        <div class="paper-meta">
          <span>Subject: ${this.escape(data.subject || '')}</span>
          <span>Max Marks: ${data.totalMarks}</span>
        </div>
      </div>
    `;

    (data.sections || []).forEach(sec => {
      html += `
        <div class="paper-section">
          <div class="section-heading">${this.escape(sec.title)} Solutions</div>
      `;

      (sec.questions || []).forEach((q, qIdx) => {
        html += `
          <div class="question-item">
            <div><strong>Q${qIdx + 1}:</strong> ${this.formatText(q.question)}</div>
            <div class="solution-box">
              <h5>Correct Answer / Solution:</h5>
              <div>${this.formatText(q.answer)}</div>
              ${q.rubric ? `<div class="rubric-info">Marking Criteria: ${this.escape(q.rubric)}</div>` : ''}
            </div>
          </div>
        `;
      });

      html += `</div>`;
    });

    container.innerHTML = html;
  }

  triggerKaTeX() {
    if (window.renderMathInElement) {
      try {
        const paperView = document.getElementById('paperView');
        const solutionView = document.getElementById('solutionView');
        const options = {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        };
        if (paperView) window.renderMathInElement(paperView, options);
        if (solutionView) window.renderMathInElement(solutionView, options);
      } catch (e) {
        console.warn('KaTeX render error:', e);
      }
    }
  }

  formatText(str) {
    if (!str) return '';
    let escaped = this.escape(str);
    escaped = escaped.replace(/\n/g, '<br>');
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return escaped;
  }

  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  copyPaperText() {
    if (!this.currentPaperData) return;
    const data = this.currentPaperData;

    let text = `${data.institution}\n${data.examTitle}\n`;
    text += `Time: ${data.duration} | Max Marks: ${data.totalMarks}\n\n`;

    (data.sections || []).forEach(sec => {
      text += `--- ${sec.title} ---\n`;
      (sec.questions || []).forEach((q, idx) => {
        text += `Q${idx + 1}. ${q.question} [${q.marks} Marks]\n`;
        if (q.options) {
          q.options.forEach((opt, oIdx) => {
            text += `   (${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
          });
        }
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    alert('Copied question paper text to clipboard!');
  }
}

// Instantiate App on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
