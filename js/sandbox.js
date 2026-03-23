// ============================================================
// CODE SANDBOX ENGINE — Python (Pyodide) & R (webR)
// ============================================================

let pyodideInstance = null;
let webRInstance = null;
let pyodideLoading = false;
let webRLoading = false;

// ===== PYODIDE (Python) =====

async function initPyodideRuntime() {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoading) {
        // Wait for existing load to complete
        while (pyodideLoading) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return pyodideInstance;
    }

    pyodideLoading = true;
    showLoading('Loading Python runtime (Pyodide)... This may take 15–30 seconds on first use.');

    try {
        // Load Pyodide CDN script if not already loaded
        if (typeof window._pyodideLoadPackage === 'undefined' && !document.querySelector('script[src*="pyodide"]')) {
            await loadScript('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
        }

        // Now window.loadPyodide is the REAL Pyodide factory from the CDN
        pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });

        // Pre-load common packages
        showLoading('Installing numpy & scipy... Almost ready.');
        await pyodideInstance.loadPackage(['numpy', 'scipy']);

        hideLoading();
        pyodideLoading = false;
        return pyodideInstance;
    } catch (err) {
        hideLoading();
        pyodideLoading = false;
        throw new Error('Failed to load Python runtime: ' + err.message);
    }
}

async function runPython(code) {
    const pyodide = await initPyodideRuntime();

    // Redirect stdout/stderr to capture output
    pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
    `);

    try {
        await pyodide.runPythonAsync(code);
        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        const stderr = pyodide.runPython('sys.stderr.getvalue()');
        let output = stdout;
        if (stderr && stderr.trim()) output += '\n[stderr] ' + stderr;
        return { output: output || '(Code executed successfully — no print output)', error: false };
    } catch (err) {
        let stderr = '';
        try { stderr = pyodide.runPython('sys.stderr.getvalue()'); } catch(e) {}
        return { output: err.message + (stderr ? '\n' + stderr : ''), error: true };
    }
}

// ===== webR (R) =====

async function initWebRRuntime() {
    if (webRInstance) return webRInstance;
    if (webRLoading) {
        while (webRLoading) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return webRInstance;
    }

    webRLoading = true;
    showLoading('Loading R runtime (webR)... This may take 15–30 seconds on first use.');

    try {
        if (!window.WebR) {
            const module = await import('https://webr.r-wasm.org/latest/webr.mjs');
            window.WebR = module.WebR;
        }

        webRInstance = new window.WebR();
        await webRInstance.init();

        hideLoading();
        webRLoading = false;
        return webRInstance;
    } catch (err) {
        hideLoading();
        webRLoading = false;
        throw new Error('Failed to load R runtime: ' + err.message);
    }
}

async function runR(code) {
    try {
        const webR = await initWebRRuntime();

        // Use shelter for memory management
        const shelter = await new webR.Shelter();

        try {
            const result = await shelter.captureR(code, {
                withAutoprint: true,
                captureStreams: true,
                captureConditions: false
            });

            let output = '';
            if (result.output) {
                output = result.output
                    .filter(o => o.type === 'stdout')
                    .map(o => o.data)
                    .join('\n');
            }

            const errors = result.output
                ? result.output.filter(o => o.type === 'stderr').map(o => o.data).join('\n')
                : '';

            shelter.purge();
            return { output: output + (errors ? '\n' + errors : '') || '(Code executed successfully — no output)', error: false };
        } catch (err) {
            shelter.purge();
            return { output: err.message, error: true };
        }
    } catch (err) {
        return { output: err.message, error: true };
    }
}

// ===== UTILITY FUNCTIONS =====

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) { resolve(); return; }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load script: ' + src));
        document.head.appendChild(script);
    });
}

function showLoading(msg) {
    const overlay = document.getElementById('loadingOverlay');
    const message = document.getElementById('loadingMessage');
    if (overlay && message) {
        message.textContent = msg;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ===== RUN CODE FROM BLOCKS =====

async function runCodeBlock(blockId) {
    const wrapper = document.getElementById(blockId);
    if (!wrapper) return;

    const activePanel = wrapper.querySelector('.code-panel.active');
    if (!activePanel) return;
    const lang = activePanel.getAttribute('data-lang');
    const code = activePanel.querySelector('code').textContent;
    const outputEl = document.getElementById(blockId + '-output');
    if (!outputEl) return;

    outputEl.textContent = 'Running...';
    outputEl.className = 'output-block visible';

    try {
        let result;
        if (lang === 'python') {
            result = await runPython(code);
        } else {
            result = await runR(code);
        }

        outputEl.textContent = result.output || '(No output)';
        outputEl.className = 'output-block visible' + (result.error ? ' error' : '');
    } catch (err) {
        outputEl.textContent = 'Error: ' + err.message;
        outputEl.className = 'output-block visible error';
    }
}

// ===== RUN CODE FROM SANDBOX =====

async function runSandboxCode() {
    const textarea = document.getElementById('sandboxEditor');
    const outputEl = document.getElementById('sandboxOutput');
    const langSelect = document.getElementById('sandboxLang');
    const runBtn = document.getElementById('sandboxRunBtn');

    if (!textarea || !outputEl) return;

    const code = textarea.value;
    const lang = langSelect.value;

    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    outputEl.textContent = 'Executing...';
    outputEl.className = 'sandbox-output-content';

    try {
        let result;
        if (lang === 'python') {
            result = await runPython(code);
        } else {
            result = await runR(code);
        }

        outputEl.textContent = result.output || '(No output)';
        outputEl.className = 'sandbox-output-content' + (result.error ? ' error' : '');
    } catch (err) {
        outputEl.textContent = 'Error: ' + err.message;
        outputEl.className = 'sandbox-output-content error';
    } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
    }
}

function clearSandboxOutput() {
    const outputEl = document.getElementById('sandboxOutput');
    if (outputEl) {
        outputEl.textContent = 'Output will appear here after you click Run.';
        outputEl.className = 'sandbox-output-content';
    }
}

// ===== CODE SWITCHING / COPY =====

function switchCodeTab(blockId, lang) {
    const wrapper = document.getElementById(blockId);
    if (!wrapper) return;

    wrapper.querySelectorAll('.code-lang-tab').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().trim() === lang);
    });

    wrapper.querySelectorAll('.code-panel').forEach(panel => {
        panel.classList.toggle('active', panel.getAttribute('data-lang') === lang);
    });
}

function copyCode(blockId) {
    const wrapper = document.getElementById(blockId);
    if (!wrapper) return;

    const activePanel = wrapper.querySelector('.code-panel.active');
    const code = activePanel.querySelector('code').textContent;

    navigator.clipboard.writeText(code).then(() => {
        const btn = wrapper.querySelector('.btn-copy');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = original; }, 1500);
    });
}

// ===== SANDBOX TEMPLATES =====

const SANDBOX_TEMPLATES = {
    python: {
        'Simple Regression': `import numpy as np
from scipy import stats

# Example: Ad spend vs Sales
x = [10, 15, 20, 25, 30, 35, 40]
y = [100, 140, 170, 210, 240, 280, 310]

slope, intercept, r, p, se = stats.linregress(x, y)
print(f"Y = {intercept:.2f} + {slope:.2f} * X")
print(f"R-squared: {r**2:.4f}, P-value: {p:.6f}")`,

        'Multiple Regression': `import numpy as np

# Multiple regression via matrix algebra
np.random.seed(42)
n = 30
X1 = np.random.uniform(5, 50, n)
X2 = np.random.uniform(1, 10, n)
Y = 10 + 2.5*X1 + 5*X2 + np.random.normal(0, 8, n)

X = np.column_stack([np.ones(n), X1, X2])
beta = np.linalg.inv(X.T @ X) @ X.T @ Y
y_hat = X @ beta
R2 = 1 - np.sum((Y-y_hat)**2)/np.sum((Y-Y.mean())**2)

print(f"Y = {beta[0]:.2f} + {beta[1]:.2f}*X1 + {beta[2]:.2f}*X2")
print(f"R-squared: {R2:.4f}")`,

        'Logistic Regression': `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

# Example: Credit score -> default
scores = np.array([580,620,650,680,700,720,750,780,600,640,660,690,710,740,770])
default = np.array([1,1,1,0,0,0,0,0,1,1,0,0,0,0,0])

X = np.column_stack([np.ones(15), scores])
beta = np.zeros(2)
for _ in range(50000):
    p = sigmoid(X @ beta)
    beta -= 0.0001 * (X.T @ (p - default) / 15)

print(f"Intercept: {beta[0]:.4f}, Score coeff: {beta[1]:.6f}")
for s in [600, 650, 700, 750]:
    p = sigmoid(beta[0] + beta[1]*s)
    print(f"Score {s}: {p:.1%} default probability")`,

        'K-Means Clustering': `import numpy as np
np.random.seed(42)

# Generate sample data
data = np.vstack([
    np.random.normal([2,2], 0.8, (25,2)),
    np.random.normal([8,8], 0.8, (25,2)),
    np.random.normal([8,2], 0.8, (25,2))
])

# K-Means
K = 3
idx = np.random.choice(75, K, replace=False)
centroids = data[idx].copy()
for _ in range(50):
    dists = np.array([np.sum((data-c)**2, axis=1) for c in centroids]).T
    labels = np.argmin(dists, axis=1)
    centroids = np.array([data[labels==k].mean(0) for k in range(K)])

for k in range(K):
    n = np.sum(labels==k)
    print(f"Cluster {k+1}: center=({centroids[k,0]:.2f}, {centroids[k,1]:.2f}), size={n}")`,

        'Factor Analysis': `import numpy as np
np.random.seed(42)
n = 150

# 2 latent factors
F1, F2 = np.random.normal(0,1,n), np.random.normal(0,1,n)
data = np.column_stack([
    0.9*F1 + np.random.normal(0,0.3,n),
    0.8*F1 + np.random.normal(0,0.3,n),
    0.85*F2 + np.random.normal(0,0.3,n),
    0.75*F2 + np.random.normal(0,0.3,n)
])

corr = np.corrcoef(data.T)
eigvals, eigvecs = np.linalg.eigh(corr)
eigvals = eigvals[::-1]
eigvecs = eigvecs[:, ::-1]

print("Eigenvalues:", np.round(eigvals, 3))
print("Variance explained:", np.round(eigvals/4*100, 1), "%")
print("\\nLoadings (first 2 factors):")
L = eigvecs[:, :2] * np.sqrt(eigvals[:2])
for i in range(4):
    print(f"  V{i+1}: [{L[i,0]:.3f}, {L[i,1]:.3f}]")`
    },
    r: {
        'Simple Regression': `x <- c(10, 15, 20, 25, 30, 35, 40)
y <- c(100, 140, 170, 210, 240, 280, 310)

model <- lm(y ~ x)
summary(model)`,

        'Multiple Regression': `set.seed(42)
n <- 30
x1 <- runif(n, 5, 50)
x2 <- runif(n, 1, 10)
y <- 10 + 2.5*x1 + 5*x2 + rnorm(n, 0, 8)

model <- lm(y ~ x1 + x2)
summary(model)`,

        'Logistic Regression': `scores <- c(580,620,650,680,700,720,750,780,600,640,660,690,710,740,770)
default <- c(1,1,1,0,0,0,0,0,1,1,0,0,0,0,0)

model <- glm(default ~ scores, family = binomial)
summary(model)

new_scores <- data.frame(scores = c(600, 650, 700, 750))
probs <- predict(model, new_scores, type = "response")
cat("\\nDefault probabilities:\\n")
for (i in 1:4) cat(sprintf("Score %d: %.1f%%\\n", new_scores$scores[i], probs[i]*100))`,

        'K-Means Clustering': `set.seed(42)
data <- rbind(
    matrix(rnorm(50, mean=2, sd=0.8), ncol=2),
    matrix(rnorm(50, mean=8, sd=0.8), ncol=2),
    cbind(rnorm(25, 8, 0.8), rnorm(25, 2, 0.8))
)

km <- kmeans(data, centers=3, nstart=25)
cat("Cluster sizes:", km$size, "\\n")
cat("\\nCluster centers:\\n")
print(round(km$centers, 2))`,

        'Factor Analysis': `set.seed(42)
n <- 150
F1 <- rnorm(n); F2 <- rnorm(n)
data <- data.frame(
    V1 = 0.9*F1 + rnorm(n,0,0.3),
    V2 = 0.8*F1 + rnorm(n,0,0.3),
    V3 = 0.85*F2 + rnorm(n,0,0.3),
    V4 = 0.75*F2 + rnorm(n,0,0.3)
)

pca <- prcomp(data, scale.=TRUE)
cat("Eigenvalues:\\n")
print(round(pca$sdev^2, 3))

fa <- factanal(data, factors=2, rotation="varimax")
print(fa)`
    }
};

function loadTemplate(name) {
    const langSelect = document.getElementById('sandboxLang');
    const textarea = document.getElementById('sandboxEditor');
    if (!langSelect || !textarea) return;

    const lang = langSelect.value;
    const templates = SANDBOX_TEMPLATES[lang];
    if (templates && templates[name]) {
        textarea.value = templates[name];
    }
}
