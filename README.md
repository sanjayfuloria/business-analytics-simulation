# Business Analytics Simulation

An interactive web-based learning platform for MBA students covering core business analytics techniques. Built as a static site with in-browser code execution — no backend server required.

## Topics Covered

| Topic | Tutorial | Solved Problems | Exercises | Code Sandbox | Assessment |
|-------|----------|----------------|-----------|--------------|------------|
| Simple Linear Regression | OLS, R², assumptions, business applications | Ad spend vs sales, store size vs revenue | 3 problems (Easy/Medium/Hard) | Python & R | 5 MCQs + code + interpretation |
| Multiple Linear Regression | VIF, multicollinearity, dummy variables, interactions | Real estate pricing, marketing mix model | 3 problems | Python & R | 5 MCQs + code + interpretation |
| Logistic Regression | Sigmoid, odds ratios, confusion matrix, ROC/AUC | Customer churn, loan default prediction | 3 problems | Python & R | 5 MCQs + code + interpretation |
| Factor Analysis | Eigenvalues, scree plot, varimax/promax rotation | Hotel satisfaction survey (8 variables → 3 factors) | 3 problems | Python & R | 5 MCQs + code + interpretation |
| Cluster Analysis | K-Means, hierarchical, Ward's linkage, elbow method | Customer segmentation, market similarity | 3 problems | Python & R | 5 MCQs + code + interpretation |

## Features

- **Detailed tutorials** with formulas, business context, info boxes, and assumption checklists
- **Solved problems** with real business datasets, step-by-step solutions, and business interpretation
- **Practice exercises** graded by difficulty (Easy / Medium / Hard) with expandable hints
- **Code blocks** with Python/R tabs, syntax highlighting, Copy and Run buttons
- **Code Sandbox** — full editor with 5 pre-loaded templates per language
- **In-browser execution** — Python via [Pyodide](https://pyodide.org/) and R via [webR](https://webr.r-wasm.org/) (no server needed)
- **Assessment system** — MCQs (auto-graded), code submission, and free-text interpretation questions
- **Google Drive integration** — student submissions are automatically sent to a Google Sheet
- **Student registration** — Name, Email, Roll Number, Section saved locally
- **Dark mode** toggle
- **Responsive design** — works on desktop, tablet, and mobile

## Project Structure

```
├── index.html              # Main HTML shell with navigation and profile modal
├── css/
│   └── styles.css          # All styles (light/dark themes, responsive)
├── js/
│   ├── content.js          # Tutorial, solved problem, and exercise content for all 5 topics
│   ├── assessment.js       # Assessment engine: MCQs, grading, submission, student profile
│   ├── sandbox.js          # Code execution engine (Pyodide for Python, webR for R)
│   └── app.js              # Navigation, tab switching, theme, keyboard shortcuts
├── google-apps-script.js   # Google Apps Script backend (deploy separately)
├── package.json
└── README.md
```

## Setup

### 1. Run Locally

```bash
npx serve -s .
```

Open `http://localhost:3000` in your browser.

### 2. Deploy on Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Set **Framework Preset** to `Other` and **Output Directory** to `.`
4. Click **Deploy**

### 3. Connect Google Drive (for receiving student submissions)

1. Go to [script.google.com](https://script.google.com) → **New Project**
2. Paste the contents of `google-apps-script.js`
3. Click **Deploy** → **New deployment** → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the Web App URL
5. Paste it into `js/assessment.js` on the `GOOGLE_SCRIPT_URL` line
6. Commit and push — Vercel will auto-redeploy

Student submissions will appear in a Google Sheet called **"Business Analytics Assessments"** in your Google Drive, with a summary sheet and one tab per topic.

### Google Sheet Columns

| Column | Description |
|--------|-------------|
| Timestamp | When the submission was received |
| Name | Student's full name |
| Email | Student's email address |
| Roll Number | Student's roll/registration number |
| Section | Student's class section |
| Topic | Which topic was assessed |
| MCQ Score | Number of correct MCQ answers |
| MCQ Total | Total MCQ questions |
| MCQ Answers (JSON) | Detailed per-question results |
| Code Submissions (JSON) | Student's code responses |
| Interpretation Answers (JSON) | Student's written analyses |
| Submission ID | Unique identifier for each submission |

## Technology

- **Frontend:** Vanilla HTML/CSS/JavaScript (no build step, no framework)
- **Python execution:** [Pyodide](https://pyodide.org/) (CPython compiled to WebAssembly)
- **R execution:** [webR](https://webr.r-wasm.org/) (R compiled to WebAssembly)
- **Syntax highlighting:** [highlight.js](https://highlightjs.org/)
- **Math rendering:** [KaTeX](https://katex.org/)
- **Icons:** [Font Awesome 6](https://fontawesome.com/)
- **Backend:** Google Apps Script (serverless, writes to Google Sheets)

## License

For educational use. Built for the MBA Business Analytics course.
