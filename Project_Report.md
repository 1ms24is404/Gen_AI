# AI Question Paper Generator & Solution Engine
## System Architecture, Code Guide & Output Paste Sections

**Date:** October 2026 | **Location:** `c:/Users/sheru/Downloads/gen_ai/`

---

## 1. Project Overview

The **AI Question Paper Generator** is a web application that takes subject parameters (Subject, Topic, Target Grade, Difficulty Level, Total Marks, and API Key) and generates structured, printable examination papers complete with answer keys and step-by-step marking rubrics.

---

## 2. Tools & Technologies Used

| Category | Technology / Tool | Purpose & Functionality |
| :--- | :--- | :--- |
| **Frontend Structure** | HTML5 | Semantic structure for inputs, presets, paper sheet container, and action controls. |
| **Styling & Theme** | CSS3 (Custom System) | Clean typography (Inter font), background wallpaper integration, card elevation shadows, and `@media print` rules. |
| **Application Logic** | Vanilla JavaScript (ES6+) | Form handling, dual-mode generation routing, DOM rendering pipeline, and clipboard export. |
| **AI Generation Engine** | Google Gemini 1.5 Flash API | Generates structured JSON question papers via direct REST API integration (`generativelanguage.googleapis.com`). |
| **Offline Synthesis Engine** | Built-in JS Generator | Fallback generator that synthesizes MCQs, Short Answer, and Long Answer questions instantly offline. |
| **Math Typesetting** | KaTeX Math Engine | Renders LaTeX mathematical & physics expressions (\(E = mc^2\), Gauss law, integrals, vectors). |
| **Print & Export** | CSS `@media print` | Formats document to university exam paper standards for saving as PDF or printing directly. |

---

## 3. Codebase Architecture & File Guide

### 3.1 File Structure
```
gen_ai/
├── index.html         # Main HTML layout, input form card, paper sheet display
├── style.css          # Styling, wallpaper background, print rules
├── app.js             # Controller: API calls, offline synthesis, KaTeX rendering
├── Project_Report.doc # Word Document format report with output paste placeholders
└── Project_Report.md  # Markdown format report with output paste placeholders
```

### 3.2 Detailed Code Explanation

#### A. `index.html`
- Contains the input form controls (`#subject`, `#grade`, `#topic`, `#difficulty`, `#totalMarks`, `#apiKey`).
- Contains preset quick selector (`#presetSelect`) for loading sample templates (Physics, CS, Math, History).
- Contains view toggles (`Question Paper` vs `Answer Key & Solution`) and action buttons (`Print / Save PDF`, `Copy Text`).

#### B. `style.css`
- Configures an aesthetic background wallpaper with subtle fixed attachment gradient overlays.
- Applies card elevation shadows (`box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3)`).
- Contains dedicated `@media print` stylesheet that strips UI navigation and formats the exam paper cleanly on white printable pages.

#### C. `app.js`
- **Class `App`**: Manages state and DOM bindings.
- **`generatePaper()`**: Evaluates whether to use Gemini REST API or `generateSynthesizedPaper()`.
- **`callGeminiAPI()`**: Constructs prompt requesting structured JSON output from Gemini 1.5 Flash API.
- **`renderPaper()` & `renderSolution()`**: Dynamically populates the DOM with institution headers, instructions, mark allocations, and question items.
- **`triggerKaTeX()`**: Calls KaTeX `renderMathInElement()` to convert LaTeX delimiters into formatted mathematical formulas.

---

## 4. Question Paper Output & Paste Sections

Use the formatted sections below to paste generated question paper outputs, solution keys, and exam summaries.

### 4.1 Question Paper Output
> **[ PASTE GENERATED QUESTION PAPER OUTPUT HERE ]**
> 
> *Example:*
> ```text
> NATIONAL EXAMINATION BOARD
> CLASS 12 PHYSICS FINAL EXAMINATION
> Subject: Physics (PHY-101) | Time: 3 Hours | Max Marks: 50
> 
> General Instructions:
> 1. Read all questions carefully before answering.
> 2. Section A carries 1 mark per question.
> 
> Section A - Objective Type Questions
> Q1. Which of the following describes Gauss's Law?
> (A) Electric flux equals Q / e_0    (B) Force is independent of distance
> ```

---

### 4.2 Solution Key & Marking Scheme Output
> **[ PASTE ANSWER KEY & SOLUTION MANUAL HERE ]**
> 
> *Example:*
> ```text
> Q1 Solution:
> Option A: Gauss law states total electric flux \Phi = Q_enclosed / \varepsilon_0.
> Marking Criteria: 1 mark for selecting Option A.
> ```

---

### 4.3 Paper Structural Analytics & Summary
> **[ PASTE PAPER ANALYTICS & MARK DISTRIBUTION SUMMARY HERE ]**
> 
> | Section | Question Type | Question Count | Marks per Q | Total Marks |
> | :--- | :--- | :--- | :--- | :--- |
> | **Section A** | MCQs | 10 | 1 | 10 |
> | **Section B** | Short Answer | 5 | 3 | 15 |
> | **Section C** | Long Answer | 5 | 5 | 25 |
> | **Total** | | **20** | | **50** |

---

## 5. Conclusion

The AI Question Paper Generator is fully deployed in `c:/Users/sheru/Downloads/gen_ai/`. It offers educators a flexible, dual-mode solution for generating exam papers online or offline with printable PDF exports.
