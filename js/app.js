/**
 * Main Application Controller - ExamCraft AI Question Paper Generator
 */

class App {
  constructor() {
    this.generator = new window.PaperGenerator();
    
    // DOM Elements
    this.paperContainer = document.getElementById('paperContainer');
    this.answerContainer = document.getElementById('answerContainer');
    this.statsContainer = document.getElementById('statsContainer');

    this.renderer = new window.PaperRenderer(this.paperContainer, this.answerContainer, this.statsContainer);

    // Default configuration state
    this.config = {
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
        'Section D contains 2 Case Study/Numerical problems carrying 5 marks each.'
      ],
      sections: [
        { id: 'sec_a', name: 'Section A - Multiple Choice Questions', type: 'mcq', markPerQuestion: 1, count: 10 },
        { id: 'sec_b', name: 'Section B - Short Answer Questions', type: 'short', markPerQuestion: 3, count: 5 },
        { id: 'sec_c', name: 'Section C - Long Answer Questions', type: 'long', markPerQuestion: 5, count: 3 },
        { id: 'sec_d', name: 'Section D - Numerical & Case Studies', type: 'case', markPerQuestion: 5, count: 2 }
      ]
    };

    this.init();
  }

  init() {
    this.setupTheme();
    this.setupLucideIcons();
    this.setupTemplateSelector();
    this.setupSectionBuilderUI();
    this.bindEvents();

    // Initial paper generation on launch
    this.handleGenerate();
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  setupLucideIcons() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  setupTemplateSelector() {
    const select = document.getElementById('templateSelect');
    if (!select || !window.SAMPLE_TEMPLATES) return;

    select.innerHTML = '<option value="">⚡ Load Sample Template...</option>';

    window.SAMPLE_TEMPLATES.forEach(tpl => {
      const opt = document.createElement('option');
      opt.value = tpl.id;
      opt.textContent = `📋 ${tpl.name}`;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (!selectedId) return;

      const template = window.SAMPLE_TEMPLATES.find(t => t.id === selectedId);
      if (template) {
        this.loadTemplateConfig(template);
        this.showToast(`Loaded Template: ${template.name}`);
      }
    });
  }

  loadTemplateConfig(tpl) {
    this.config = JSON.parse(JSON.stringify(tpl));
    
    // Update inputs
    if (document.getElementById('inputSubject')) document.getElementById('inputSubject').value = this.config.subject;
    if (document.getElementById('inputTopic')) document.getElementById('inputTopic').value = this.config.topic;
    if (document.getElementById('inputGrade')) document.getElementById('inputGrade').value = this.config.grade;
    if (document.getElementById('inputDifficulty')) document.getElementById('inputDifficulty').value = this.config.difficulty;
    if (document.getElementById('inputBlooms')) document.getElementById('inputBlooms').value = this.config.blooms || 'Apply & Solve';

    if (document.getElementById('inputInst')) document.getElementById('inputInst').value = this.config.institution;
    if (document.getElementById('inputTitle')) document.getElementById('inputTitle').value = this.config.examTitle;
    if (document.getElementById('inputCode')) document.getElementById('inputCode').value = this.config.subjectCode;
    if (document.getElementById('inputDuration')) document.getElementById('inputDuration').value = this.config.duration;

    this.setupSectionBuilderUI();
    this.handleGenerate();
  }

  setupSectionBuilderUI() {
    const container = document.getElementById('sectionsConfigList');
    if (!container) return;

    container.innerHTML = '';

    (this.config.sections || []).forEach((sec, idx) => {
      const secCard = document.createElement('div');
      secCard.className = 'section-builder-card';
      secCard.innerHTML = `
        <div class="sec-card-header">
          <span class="sec-card-title">${sec.name}</span>
          ${this.config.sections.length > 1 ? `<button class="sec-card-remove" data-remove-idx="${idx}">&times;</button>` : ''}
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
          <input type="text" class="form-control sec-name-input" data-idx="${idx}" value="${sec.name}" placeholder="Section Title">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Question Type</label>
            <select class="form-select sec-type-select" data-idx="${idx}">
              <option value="mcq" ${sec.type === 'mcq' ? 'selected' : ''}>MCQs</option>
              <option value="short" ${sec.type === 'short' ? 'selected' : ''}>Short Answer</option>
              <option value="long" ${sec.type === 'long' ? 'selected' : ''}>Long Answer</option>
              <option value="case" ${sec.type === 'case' ? 'selected' : ''}>Case Study / Numerical</option>
            </select>
          </div>
          <div class="form-group">
            <label>Question Count</label>
            <input type="number" min="1" max="25" class="form-control sec-count-input" data-idx="${idx}" value="${sec.count}">
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label>Marks per Question</label>
          <input type="number" min="1" max="20" class="form-control sec-mark-input" data-idx="${idx}" value="${sec.markPerQuestion}">
        </div>
      `;
      container.appendChild(secCard);
    });

    container.querySelectorAll('.sec-name-input').forEach(input => {
      input.addEventListener('change', e => {
        this.config.sections[e.target.dataset.idx].name = e.target.value;
      });
    });

    container.querySelectorAll('.sec-type-select').forEach(select => {
      select.addEventListener('change', e => {
        this.config.sections[e.target.dataset.idx].type = e.target.value;
      });
    });

    container.querySelectorAll('.sec-count-input').forEach(input => {
      input.addEventListener('change', e => {
        this.config.sections[e.target.dataset.idx].count = Number(e.target.value) || 1;
        this.recalculateTotalConfigMarks();
      });
    });

    container.querySelectorAll('.sec-mark-input').forEach(input => {
      input.addEventListener('change', e => {
        this.config.sections[e.target.dataset.idx].markPerQuestion = Number(e.target.value) || 1;
        this.recalculateTotalConfigMarks();
      });
    });

    container.querySelectorAll('.sec-card-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = Number(e.target.dataset.removeIdx);
        this.config.sections.splice(idx, 1);
        this.setupSectionBuilderUI();
        this.recalculateTotalConfigMarks();
      });
    });

    this.recalculateTotalConfigMarks();
  }

  recalculateTotalConfigMarks() {
    let total = 0;
    (this.config.sections || []).forEach(s => {
      total += (Number(s.count) || 1) * (Number(s.markPerQuestion) || 1);
    });
    this.config.totalMarks = total;
  }

  bindEvents() {
    document.getElementById('generateBtn')?.addEventListener('click', () => this.handleGenerate());

    document.getElementById('addSectionBtn')?.addEventListener('click', () => {
      const newIdx = this.config.sections.length + 1;
      this.config.sections.push({
        id: `sec_${newIdx}`,
        name: `Section ${String.fromCharCode(64 + newIdx)} - Extra Questions`,
        type: 'short',
        markPerQuestion: 2,
        count: 3
      });
      this.setupSectionBuilderUI();
    });

    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('app_theme', next);
    });

    const modal = document.getElementById('apiModal');
    const keyInput = document.getElementById('apiKeyInput');
    if (keyInput) keyInput.value = this.generator.getApiKey();

    document.getElementById('apiKeyBtn')?.addEventListener('click', () => {
      modal?.classList.add('active');
    });

    document.getElementById('closeApiModal')?.addEventListener('click', () => {
      modal?.classList.remove('active');
    });

    document.getElementById('saveApiKeyBtn')?.addEventListener('click', () => {
      this.generator.setApiKey(keyInput.value);
      modal?.classList.remove('active');
      this.showToast(keyInput.value ? 'Gemini API Key Saved!' : 'Gemini Key Cleared. Offline Engine Active.');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        this.switchTab(targetTab);
      });
    });

    document.getElementById('btnPrint')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btnExportMd')?.addEventListener('click', () => {
      this.exportMarkdown();
    });

    document.getElementById('btnCopyText')?.addEventListener('click', () => {
      this.copyPaperText();
    });
  }

  syncConfigFromForm() {
    this.config.subject = document.getElementById('inputSubject')?.value || 'Physics';
    this.config.topic = document.getElementById('inputTopic')?.value || 'General Topics';
    this.config.grade = document.getElementById('inputGrade')?.value || 'Standard';
    this.config.difficulty = document.getElementById('inputDifficulty')?.value || 'Medium';
    this.config.blooms = document.getElementById('inputBlooms')?.value || 'Apply & Solve';

    this.config.institution = document.getElementById('inputInst')?.value || 'Institution';
    this.config.examTitle = document.getElementById('inputTitle')?.value || 'Question Paper';
    this.config.subjectCode = document.getElementById('inputCode')?.value || 'SUB-101';
    this.config.duration = document.getElementById('inputDuration')?.value || '2 Hours';
  }

  async handleGenerate() {
    this.syncConfigFromForm();

    const btn = document.getElementById('generateBtn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = `Generating Paper...`;
      btn.disabled = true;
    }

    try {
      const result = await this.generator.generate(this.config, (statusMsg) => {
        console.log('Status update:', statusMsg);
      });

      this.renderer.setPaper(result);
      this.setupLucideIcons();
      this.showToast('✨ AI Question Paper Generated!');
    } catch (err) {
      console.error('Error generating paper:', err);
      this.showToast('Error generating paper. Please check console.');
    } finally {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
      this.setupLucideIcons();
    }
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    if (this.paperContainer) this.paperContainer.style.display = tabName === 'paper' ? 'block' : 'none';
    if (this.answerContainer) this.answerContainer.style.display = tabName === 'answers' ? 'block' : 'none';
    if (this.statsContainer) this.statsContainer.style.display = tabName === 'analytics' ? 'block' : 'none';
  }

  exportMarkdown() {
    const paper = this.renderer.getPaper();
    if (!paper) return;

    const meta = paper.metadata;
    let md = `# ${meta.institution}\n## ${meta.examTitle}\n`;
    md += `**Subject:** ${meta.subject} (${meta.subjectCode})  \n`;
    md += `**Time Allowed:** ${meta.duration} | **Max Marks:** ${meta.totalMarks}  \n`;
    md += `**Date:** ${meta.dateGenerated}\n\n`;

    md += `### General Instructions:\n`;
    (meta.instructions || []).forEach((inst, idx) => {
      md += `${idx + 1}. ${inst}\n`;
    });
    md += `\n---\n\n`;

    (paper.sections || []).forEach(sec => {
      md += `## ${sec.title}\n\n`;
      (sec.questions || []).forEach((q, qIdx) => {
        md += `**Q${qIdx + 1}.** ${q.question} *[${q.marks} Mark(s)]*\n`;
        if (q.options && q.options.length) {
          q.options.forEach((opt, oIdx) => {
            md += `- (${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
          });
        }
        md += `\n`;
      });
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.subject}_Exam_Paper.md`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Downloaded Question Paper as Markdown (.md)');
  }

  copyPaperText() {
    const paper = this.renderer.getPaper();
    if (!paper) return;

    const meta = paper.metadata;
    let text = `${meta.institution}\n${meta.examTitle}\n`;
    text += `Subject: ${meta.subject} | Time: ${meta.duration} | Max Marks: ${meta.totalMarks}\n\n`;

    (paper.sections || []).forEach(sec => {
      text += `--- ${sec.title} ---\n`;
      (sec.questions || []).forEach((q, qIdx) => {
        text += `Q${qIdx + 1}. ${q.question} [${q.marks} Marks]\n`;
        if (q.options) {
          q.options.forEach((opt, oIdx) => {
            text += `   (${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
          });
        }
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    this.showToast('Copied Question Paper text to clipboard!');
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

window.App = App;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
