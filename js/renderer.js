/**
 * DOM Renderer Module for Question Paper & Solution Key
 */

class PaperRenderer {
  constructor(paperContainer, answerContainer, statsContainer) {
    this.paperContainer = paperContainer;
    this.answerContainer = answerContainer;
    this.statsContainer = statsContainer;
    this.currentPaper = null;
    this.activeMode = 'paper';
  }

  setPaper(paperData) {
    this.currentPaper = paperData;
    this.render();
  }

  getPaper() {
    return this.currentPaper;
  }

  render() {
    if (!this.currentPaper) return;

    this.renderQuestionPaper();
    this.renderAnswerKey();
    this.renderAnalytics();
    this.triggerMathRendering();
  }

  renderQuestionPaper() {
    const meta = this.currentPaper.metadata;
    const sections = this.currentPaper.sections || [];

    let html = `
      <div class="exam-sheet">
        <!-- Official Exam Header -->
        <header class="exam-header">
          <div class="header-top">
            <h1 class="inst-name" contenteditable="true" data-field="institution">${this.escape(meta.institution)}</h1>
            <h2 class="exam-name" contenteditable="true" data-field="examTitle">${this.escape(meta.examTitle)}</h2>
          </div>
          
          <div class="header-meta-grid">
            <div class="meta-item">
              <span class="meta-label">Subject:</span>
              <span class="meta-val" contenteditable="true" data-field="subject">${this.escape(meta.subject)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Subject Code:</span>
              <span class="meta-val" contenteditable="true" data-field="subjectCode">${this.escape(meta.subjectCode)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Time Allowed:</span>
              <span class="meta-val" contenteditable="true" data-field="duration">${this.escape(meta.duration)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Maximum Marks:</span>
              <span class="meta-val highlight-marks">${meta.totalMarks}</span>
            </div>
          </div>

          <div class="candidate-box">
            <div class="candidate-row">
              <span class="cand-field">Roll No / Student ID: ______________________</span>
              <span class="cand-field">Date: ${meta.dateGenerated || ''}</span>
            </div>
          </div>

          <!-- General Instructions -->
          <div class="instructions-block">
            <h3>General Instructions:</h3>
            <ol class="instructions-list">
              ${(meta.instructions || []).map((inst, idx) => `
                <li contenteditable="true" data-inst-idx="${idx}">${this.escape(inst)}</li>
              `).join('')}
            </ol>
          </div>
        </header>

        <hr class="exam-divider" />

        <!-- Sections & Questions -->
        <main class="exam-body">
    `;

    sections.forEach((sec, sIdx) => {
      const secTotalMarks = (sec.questions || []).reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
      
      html += `
        <section class="paper-section" data-sec-idx="${sIdx}">
          <div class="section-header">
            <div class="section-title-wrap">
              <h3 contenteditable="true" class="section-title" data-sec-title="${sIdx}">${this.escape(sec.title)}</h3>
              <span class="section-badge">${(sec.type || '').toUpperCase()}</span>
            </div>
            <div class="section-marks-badge">
              [ Total Marks: ${secTotalMarks} ]
            </div>
          </div>

          <div class="section-questions">
      `;

      (sec.questions || []).forEach((q, qIdx) => {
        html += `
          <div class="question-card" data-sec-idx="${sIdx}" data-q-idx="${qIdx}">
            <div class="q-header">
              <span class="q-num">Q${qIdx + 1}.</span>
              <div class="q-actions no-print">
                <button class="btn-icon btn-del-q" title="Delete Question" data-action="delete" data-sec="${sIdx}" data-q="${qIdx}">
                  ✕
                </button>
              </div>
              <span class="q-marks" contenteditable="true" data-q-marks="${sIdx}-${qIdx}">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
            </div>

            <div class="q-text" contenteditable="true" data-q-text="${sIdx}-${qIdx}">
              ${this.formatMath(q.question)}
            </div>

            ${q.options && q.options.length ? `
              <div class="q-options-grid">
                ${q.options.map((opt, oIdx) => `
                  <div class="opt-item">
                    <span class="opt-key">(${String.fromCharCode(65 + oIdx)})</span>
                    <span class="opt-val" contenteditable="true" data-opt="${sIdx}-${qIdx}-${oIdx}">${this.formatMath(opt)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      });

      html += `
            <div class="add-q-wrap no-print">
              <button class="btn-add-q" data-action="add-question" data-sec="${sIdx}">
                + Add Question to ${this.escape(sec.title)}
              </button>
            </div>
          </div>
        </section>
      `;
    });

    html += `
        </main>

        <footer class="exam-footer">
          <div class="end-of-paper">*** END OF QUESTION PAPER ***</div>
        </footer>
      </div>
    `;

    this.paperContainer.innerHTML = html;
    this.attachPaperListeners();
  }

  renderAnswerKey() {
    const meta = this.currentPaper.metadata;
    const sections = this.currentPaper.sections || [];

    let html = `
      <div class="exam-sheet answer-key-sheet">
        <header class="exam-header answer-header">
          <div class="answer-badge-top">TEACHER'S SOLUTION MANUAL & MARKING SCHEME</div>
          <h1 class="inst-name">${this.escape(meta.institution)}</h1>
          <h2 class="exam-name">${this.escape(meta.examTitle)} - Answer Key</h2>
          <div class="header-meta-grid">
            <div class="meta-item"><strong>Subject:</strong> ${this.escape(meta.subject)} (${meta.subjectCode})</div>
            <div class="meta-item"><strong>Total Marks:</strong> ${meta.totalMarks}</div>
            <div class="meta-item"><strong>Target Level:</strong> ${meta.grade}</div>
            <div class="meta-item"><strong>Difficulty:</strong> ${meta.difficulty}</div>
          </div>
        </header>

        <hr class="exam-divider" />

        <main class="exam-body">
    `;

    sections.forEach((sec, sIdx) => {
      html += `
        <section class="paper-section">
          <h3 class="section-title">${this.escape(sec.title)} - Solution & Rubric</h3>
          <div class="section-questions">
      `;

      (sec.questions || []).forEach((q, qIdx) => {
        html += `
          <div class="answer-card">
            <div class="ans-header">
              <span class="q-num">Q${qIdx + 1}. Solution</span>
              <span class="q-marks">[Marks: ${q.marks}]</span>
            </div>

            <div class="ans-q-prompt">
              <strong>Question:</strong> ${this.formatMath(q.question)}
            </div>

            <div class="ans-solution-box">
              <div class="ans-label">✓ Complete Answer / Correct Solution:</div>
              <div class="ans-content" contenteditable="true" data-ans-text="${sIdx}-${qIdx}">
                ${this.formatMath(q.answer)}
              </div>
            </div>

            <div class="rubric-box">
              <div class="rubric-label">★ Marking Criteria / Step Rubric:</div>
              <div class="rubric-content" contenteditable="true" data-rubric-text="${sIdx}-${qIdx}">
                ${this.formatMath(q.markingScheme || '1 mark per step.')}
              </div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </section>
      `;
    });

    html += `
        </main>
      </div>
    `;

    this.answerContainer.innerHTML = html;
    this.attachAnswerListeners();
  }

  renderAnalytics() {
    if (!this.statsContainer) return;
    const meta = this.currentPaper.metadata;
    const sections = this.currentPaper.sections || [];

    let totalQuestions = 0;
    let mcqCount = 0;
    let shortCount = 0;
    let longCount = 0;

    sections.forEach(s => {
      totalQuestions += (s.questions || []).length;
      (s.questions || []).forEach(q => {
        if (s.type === 'mcq') mcqCount++;
        else if (s.type === 'short') shortCount++;
        else longCount++;
      });
    });

    let html = `
      <div class="analytics-card">
        <h3>Question Paper Structural Analytics</h3>
        
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-val">${meta.totalMarks}</div>
            <div class="stat-lbl">Total Paper Marks</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${totalQuestions}</div>
            <div class="stat-lbl">Total Questions</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${sections.length}</div>
            <div class="stat-lbl">Exam Sections</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${meta.difficulty}</div>
            <div class="stat-lbl">Difficulty Level</div>
          </div>
        </div>

        <div class="breakdown-list">
          <h4>Sectional Weightage & Cognitive Focus</h4>
          <div class="breakdown-bar">
            <div class="bar-seg seg-mcq" style="width: ${(totalQuestions ? (mcqCount / totalQuestions * 100) : 25)}%" title="MCQs: ${mcqCount}">
              ${mcqCount > 0 ? `MCQs (${mcqCount})` : ''}
            </div>
            <div class="bar-seg seg-short" style="width: ${(totalQuestions ? (shortCount / totalQuestions * 100) : 35)}%" title="Short Qs: ${shortCount}">
              ${shortCount > 0 ? `Short Qs (${shortCount})` : ''}
            </div>
            <div class="bar-seg seg-long" style="width: ${(totalQuestions ? (longCount / totalQuestions * 100) : 40)}%" title="Long Qs: ${longCount}">
              ${longCount > 0 ? `Long / Essay (${longCount})` : ''}
            </div>
          </div>
          <p class="blooms-tag"><strong>Bloom's Taxonomy Focus:</strong> ${meta.blooms || 'Recall, Application & Problem Solving'}</p>
        </div>
      </div>
    `;

    this.statsContainer.innerHTML = html;
  }

  attachPaperListeners() {
    this.paperContainer.querySelectorAll('[contenteditable="true"]').forEach(elem => {
      elem.addEventListener('blur', (e) => {
        this.updatePaperFromDOM(e.target);
      });
    });

    this.paperContainer.querySelectorAll('[data-action="add-question"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sIdx = Number(btn.dataset.sec);
        this.addQuestionToSection(sIdx);
      });
    });

    this.paperContainer.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sIdx = Number(btn.dataset.sec);
        const qIdx = Number(btn.dataset.q);
        this.deleteQuestion(sIdx, qIdx);
      });
    });
  }

  attachAnswerListeners() {
    this.answerContainer.querySelectorAll('[contenteditable="true"]').forEach(elem => {
      elem.addEventListener('blur', (e) => {
        const target = e.target;
        if (target.dataset.ansText) {
          const [sIdx, qIdx] = target.dataset.ansText.split('-').map(Number);
          this.currentPaper.sections[sIdx].questions[qIdx].answer = target.innerText;
        } else if (target.dataset.rubricText) {
          const [sIdx, qIdx] = target.dataset.rubricText.split('-').map(Number);
          this.currentPaper.sections[sIdx].questions[qIdx].markingScheme = target.innerText;
        }
      });
    });
  }

  updatePaperFromDOM(target) {
    if (!this.currentPaper) return;

    if (target.dataset.field) {
      this.currentPaper.metadata[target.dataset.field] = target.innerText;
    } else if (target.dataset.qText) {
      const [sIdx, qIdx] = target.dataset.qText.split('-').map(Number);
      this.currentPaper.sections[sIdx].questions[qIdx].question = target.innerText;
    } else if (target.dataset.qMarks) {
      const [sIdx, qIdx] = target.dataset.qMarks.split('-').map(Number);
      const cleanVal = target.innerText.replace(/[^0-9]/g, '');
      const newMark = Number(cleanVal) || 1;
      this.currentPaper.sections[sIdx].questions[qIdx].marks = newMark;
      this.recalculateTotalMarks();
      this.render();
    } else if (target.dataset.opt) {
      const [sIdx, qIdx, oIdx] = target.dataset.opt.split('-').map(Number);
      this.currentPaper.sections[sIdx].questions[qIdx].options[oIdx] = target.innerText;
    }
  }

  addQuestionToSection(secIdx) {
    const section = this.currentPaper.sections[secIdx];
    const newQ = {
      id: `sec_${secIdx}_q_${section.questions.length + 1}`,
      question: `New ${section.type.toUpperCase()} question text here. Click to edit question text.`,
      options: section.type === 'mcq' ? ['Option A', 'Option B', 'Option C', 'Option D'] : null,
      answer: 'Sample detailed solution for the added question.',
      markingScheme: `${section.marksPerQuestion || 1} mark(s) for complete answer.`,
      marks: section.marksPerQuestion || 1
    };

    section.questions.push(newQ);
    this.recalculateTotalMarks();
    this.render();
  }

  deleteQuestion(secIdx, qIdx) {
    const section = this.currentPaper.sections[secIdx];
    section.questions.splice(qIdx, 1);
    this.recalculateTotalMarks();
    this.render();
  }

  recalculateTotalMarks() {
    let total = 0;
    (this.currentPaper.sections || []).forEach(s => {
      (s.questions || []).forEach(q => {
        total += Number(q.marks) || 0;
      });
    });
    this.currentPaper.metadata.totalMarks = total;
  }

  triggerMathRendering() {
    if (window.renderMathInElement && this.paperContainer) {
      try {
        window.renderMathInElement(this.paperContainer, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });

        if (this.answerContainer) {
          window.renderMathInElement(this.answerContainer, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        }
      } catch (e) {
        console.warn('KaTeX render error:', e);
      }
    }
  }

  formatMath(str) {
    if (!str) return '';
    let escaped = this.escape(str);
    // Convert newlines to breaks
    escaped = escaped.replace(/\n/g, '<br>');
    // Bold syntax **text**
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
}

window.PaperRenderer = PaperRenderer;
