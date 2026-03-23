// ============================================================
// MAIN APPLICATION LOGIC
// ============================================================

let currentTopic = 'home';
let currentTab = 0;

// ===== NAVIGATION =====

function navigateTo(topic) {
    currentTopic = topic;
    currentTab = 0;

    // Update sidebar
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-topic') === topic);
    });

    // Render content
    renderContent();

    // Scroll to top
    document.getElementById('mainContent').scrollTop = 0;
}

function renderContent() {
    const main = document.getElementById('mainContent');

    if (currentTopic === 'home') {
        main.innerHTML = CONTENT.home.render();
        return;
    }

    if (currentTopic === 'sandbox') {
        renderSandbox();
        return;
    }

    const topic = CONTENT[currentTopic];
    if (!topic) {
        main.innerHTML = '<p>Topic not found.</p>';
        return;
    }

    const allTabs = [...topic.tabs, 'Assessment'];
    const tabIcons = ['fa-book-open', 'fa-check-circle', 'fa-pencil-alt', 'fa-code', 'fa-clipboard-check'];
    const tabsHtml = allTabs.map((tab, i) =>
        `<button class="tab-btn ${i === currentTab ? 'active' : ''}" onclick="switchTab(${i})">
            <i class="fas ${tabIcons[i]}"></i> ${tab}
        </button>`
    ).join('');

    const contentFns = [topic.tutorial, topic.solved, topic.exercises, topic.tryit];
    // Add assessment tab content
    const assessmentFn = function() { return renderAssessmentHTML(currentTopic); };
    const allContentFns = [...contentFns, assessmentFn];
    const tabContents = allContentFns.map((fn, i) =>
        `<div class="tab-content ${i === currentTab ? 'active' : ''}" data-tab="${i}">
            ${fn ? fn() : '<p>Coming soon.</p>'}
        </div>`
    ).join('');

    main.innerHTML = `
        <div class="tutorial-page">
            <div class="tutorial-header">
                <h1>${topic.title}</h1>
                <p class="subtitle">${topic.subtitle}</p>
            </div>
            <div class="tab-nav">${tabsHtml}</div>
            ${tabContents}
        </div>
    `;

    // Syntax highlight
    main.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });

    // Render KaTeX formulas
    renderFormulas();
}

function switchTab(index) {
    currentTab = index;

    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    document.querySelectorAll('.tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });

    // Re-highlight code in newly visible tab
    document.querySelectorAll('.tab-content.active pre code').forEach(block => {
        hljs.highlightElement(block);
    });
}

// ===== SANDBOX PAGE =====

function renderSandbox() {
    const main = document.getElementById('mainContent');

    const templateChips = Object.keys(SANDBOX_TEMPLATES.python).map(name =>
        `<button class="template-chip" onclick="loadTemplate('${name}')">${name}</button>`
    ).join('');

    main.innerHTML = `
        <div class="sandbox-container">
            <div class="sandbox-header">
                <h1><i class="fas fa-code"></i> Code Sandbox</h1>
                <div class="sandbox-controls">
                    <select class="sandbox-lang-select" id="sandboxLang" onchange="onSandboxLangChange()">
                        <option value="python">Python</option>
                        <option value="r">R</option>
                    </select>
                    <button class="btn-run" id="sandboxRunBtn" onclick="runSandboxCode()">
                        <i class="fas fa-play"></i> Run
                    </button>
                    <button class="btn-clear" onclick="clearSandboxOutput()">
                        <i class="fas fa-eraser"></i> Clear
                    </button>
                </div>
            </div>

            <div class="sandbox-templates">
                <span style="font-size:12px;color:var(--text-muted);margin-right:8px;">Templates:</span>
                <div class="template-chips" id="templateChips">
                    ${templateChips}
                </div>
            </div>

            <div class="sandbox-body">
                <div class="sandbox-editor">
                    <div class="sandbox-editor-label">
                        <i class="fas fa-edit"></i> Editor
                    </div>
                    <textarea class="sandbox-textarea" id="sandboxEditor" spellcheck="false" placeholder="Write your code here..."># Welcome to the Code Sandbox!
# Select a template above or write your own code.

import numpy as np
from scipy import stats

x = [10, 20, 30, 40, 50]
y = [25, 50, 65, 80, 100]

slope, intercept, r, p, se = stats.linregress(x, y)
print(f"Regression: Y = {intercept:.2f} + {slope:.2f} * X")
print(f"R-squared: {r**2:.4f}")
print(f"P-value: {p:.6f}")
</textarea>
                </div>
                <div class="sandbox-output">
                    <div class="sandbox-editor-label">
                        <i class="fas fa-terminal"></i> Output
                    </div>
                    <div class="sandbox-output-content" id="sandboxOutput">Output will appear here after you click Run.</div>
                </div>
            </div>
        </div>
    `;
}

function onSandboxLangChange() {
    const lang = document.getElementById('sandboxLang').value;
    const textarea = document.getElementById('sandboxEditor');
    const chipContainer = document.getElementById('templateChips');

    // Update template chips
    const templates = SANDBOX_TEMPLATES[lang];
    chipContainer.innerHTML = Object.keys(templates).map(name =>
        `<button class="template-chip" onclick="loadTemplate('${name}')">${name}</button>`
    ).join('');

    // Set default code for the language
    if (lang === 'python') {
        textarea.value = `# Python Code Sandbox
import numpy as np
from scipy import stats

x = [10, 20, 30, 40, 50]
y = [25, 50, 65, 80, 100]

slope, intercept, r, p, se = stats.linregress(x, y)
print(f"Regression: Y = {intercept:.2f} + {slope:.2f} * X")
print(f"R-squared: {r**2:.4f}")`;
    } else {
        textarea.value = `# R Code Sandbox
x <- c(10, 20, 30, 40, 50)
y <- c(25, 50, 65, 80, 100)

model <- lm(y ~ x)
summary(model)`;
    }
}

// ===== UI HELPERS =====

function toggleSolvedProblem(header) {
    const problem = header.parentElement;
    problem.classList.toggle('open');
}

function toggleHint(btn) {
    const hint = btn.nextElementSibling;
    hint.classList.toggle('visible');
    btn.textContent = hint.classList.contains('visible') ? 'Hide Hint' : 'Show Hint';
}

function renderFormulas() {
    // KaTeX rendering for formula blocks if needed
    document.querySelectorAll('.formula-block[data-formula]').forEach(el => {
        try {
            katex.render(el.getAttribute('data-formula'), el, { displayMode: true });
        } catch (e) {
            // Keep the HTML fallback
        }
    });
}

// ===== THEME =====

function initTheme() {
    const saved = localStorage.getItem('ba-sim-theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon();
    }
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('ba-sim-theme', isDark ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===== TAB KEY SUPPORT IN TEXTAREA =====

function setupTabSupport() {
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'TEXTAREA' && e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            e.target.value = e.target.value.substring(0, start) + '    ' + e.target.value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 4;
        }
    });
}

// ===== KEYBOARD SHORTCUTS =====

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to run code in sandbox
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (currentTopic === 'sandbox') {
                e.preventDefault();
                runSandboxCode();
            }
        }
    });
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    setupTabSupport();
    setupKeyboardShortcuts();

    // Sidebar click handlers
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            if (topic) navigateTo(topic);
        });
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) profileBtn.addEventListener('click', function() { showProfileModal(); });

    // Profile modal close
    const modalClose = document.getElementById('profileModalClose');
    if (modalClose) modalClose.addEventListener('click', closeProfileModal);
    const modalSave = document.getElementById('profileModalSave');
    if (modalSave) modalSave.addEventListener('click', saveProfileFromModal);

    // Close modal on backdrop click
    const modal = document.getElementById('profileModal');
    if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) closeProfileModal(); });

    // Update profile button state
    updateProfileButton();
    updateSidebarStatus();

    // Initial render
    renderContent();
});
