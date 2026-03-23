// ============================================================
// CODE SANDBOX ENGINE — Python (Pyodide) & R (webR)
// With matplotlib plot capture support
// ============================================================

let pyodideInstance = null;
let webRInstance = null;
let pyodideLoading = false;
let webRLoading = false;
let matplotlibLoaded = false;

// ===== PYODIDE (Python) =====

async function initPyodideRuntime() {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoading) {
        while (pyodideLoading) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return pyodideInstance;
    }

    pyodideLoading = true;
    showLoading('Loading Python runtime (Pyodide)... This may take 15–30 seconds on first use.');

    try {
        if (typeof window._pyodideLoadPackage === 'undefined' && !document.querySelector('script[src*="pyodide"]')) {
            await loadScript('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
        }

        pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });

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

async function ensureMatplotlib(pyodide) {
    if (matplotlibLoaded) return;
    showLoading('Installing matplotlib for plotting... One-time setup.');
    await pyodide.loadPackage(['matplotlib']);
    // Configure matplotlib for non-interactive backend
    pyodide.runPython(`
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
    `);
    matplotlibLoaded = true;
    hideLoading();
}

async function runPython(code) {
    const pyodide = await initPyodideRuntime();

    // Check if code uses matplotlib/plt — if so, load it
    const needsMatplotlib = /\bimport\s+matplotlib\b|\bfrom\s+matplotlib\b|\bimport\s+.*plt\b|\bplt\.\b/.test(code);
    if (needsMatplotlib) {
        await ensureMatplotlib(pyodide);
    }

    // Redirect stdout/stderr
    pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
_plot_images_ = []
    `);

    // Inject plot capture helper — replaces plt.show() with base64 capture
    if (needsMatplotlib) {
        pyodide.runPython(`
import matplotlib.pyplot as plt
import base64

_orig_show = plt.show
def _capture_show(*args, **kwargs):
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=120, bbox_inches='tight', facecolor='white', edgecolor='none')
    buf.seek(0)
    _plot_images_.append(base64.b64encode(buf.read()).decode('utf-8'))
    buf.close()
    plt.close('all')
plt.show = _capture_show
        `);
    }

    try {
        await pyodide.runPythonAsync(code);
        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        const stderr = pyodide.runPython('sys.stderr.getvalue()');

        // Extract captured plots
        let plots = [];
        if (needsMatplotlib) {
            const plotJSON = pyodide.runPython('import json; json.dumps(_plot_images_)');
            plots = JSON.parse(plotJSON);
            // Also capture any lingering figure that wasn't explicitly shown
            const extraPlot = pyodide.runPython(`
import matplotlib.pyplot as plt
import base64, io as _io
_figs = plt.get_fignums()
_extra = []
for _fn in _figs:
    _fig = plt.figure(_fn)
    _buf = _io.BytesIO()
    _fig.savefig(_buf, format='png', dpi=120, bbox_inches='tight', facecolor='white', edgecolor='none')
    _buf.seek(0)
    _extra.append(base64.b64encode(_buf.read()).decode('utf-8'))
    _buf.close()
plt.close('all')
import json
json.dumps(_extra)
            `);
            const extras = JSON.parse(extraPlot);
            plots = plots.concat(extras);
        }

        let output = stdout;
        if (stderr && stderr.trim()) output += '\n[stderr] ' + stderr;
        return {
            output: output || (plots.length ? '' : '(Code executed successfully — no print output)'),
            plots: plots,
            error: false
        };
    } catch (err) {
        let stderr = '';
        try { stderr = pyodide.runPython('sys.stderr.getvalue()'); } catch(e) {}
        // Still try to capture any plots even on error
        let plots = [];
        if (needsMatplotlib) {
            try {
                const plotJSON = pyodide.runPython('import json; json.dumps(_plot_images_)');
                plots = JSON.parse(plotJSON);
            } catch(e) {}
        }
        return { output: err.message + (stderr ? '\n' + stderr : ''), plots: plots, error: true };
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
        const shelter = await new webR.Shelter();

        try {
            const result = await shelter.captureR(code, {
                withAutoprint: true,
                captureStreams: true,
                captureConditions: false
            });

            let output = '';
            let plots = [];

            if (result.output) {
                output = result.output
                    .filter(o => o.type === 'stdout')
                    .map(o => o.data)
                    .join('\n');
            }

            // Capture any R plot images
            if (result.images) {
                for (const img of result.images) {
                    plots.push(img);
                }
            }

            const errors = result.output
                ? result.output.filter(o => o.type === 'stderr').map(o => o.data).join('\n')
                : '';

            shelter.purge();
            return {
                output: output + (errors ? '\n' + errors : '') || '(Code executed successfully — no output)',
                plots: plots,
                error: false
            };
        } catch (err) {
            shelter.purge();
            return { output: err.message, plots: [], error: true };
        }
    } catch (err) {
        return { output: err.message, plots: [], error: true };
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

// ===== RENDER OUTPUT WITH PLOTS =====

function renderOutputWithPlots(outputEl, result) {
    // Clear previous content
    outputEl.innerHTML = '';

    // Text output
    if (result.output && result.output.trim()) {
        const textPre = document.createElement('pre');
        textPre.className = 'output-text';
        textPre.textContent = result.output;
        if (result.error) textPre.style.color = 'var(--danger)';
        outputEl.appendChild(textPre);
    }

    // Plot images
    if (result.plots && result.plots.length > 0) {
        const plotContainer = document.createElement('div');
        plotContainer.className = 'output-plots';

        result.plots.forEach((imgData, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'plot-wrapper';

            const label = document.createElement('div');
            label.className = 'plot-label';
            label.innerHTML = `<i class="fas fa-chart-area"></i> Figure ${idx + 1}`;
            wrapper.appendChild(label);

            const img = document.createElement('img');
            img.src = 'data:image/png;base64,' + imgData;
            img.className = 'plot-image';
            img.alt = `Plot ${idx + 1}`;
            img.style.cursor = 'pointer';
            img.title = 'Click to open full size';
            img.addEventListener('click', () => {
                const win = window.open();
                win.document.write(`<img src="${img.src}" style="max-width:100%;">`);
                win.document.title = 'Plot ' + (idx + 1);
            });
            wrapper.appendChild(img);
            plotContainer.appendChild(wrapper);
        });

        outputEl.appendChild(plotContainer);
    }

    // If nothing at all
    if (!result.output?.trim() && (!result.plots || result.plots.length === 0)) {
        outputEl.textContent = '(Code executed successfully — no output)';
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

        if (result.plots && result.plots.length > 0) {
            outputEl.className = 'output-block visible';
            renderOutputWithPlots(outputEl, result);
        } else {
            outputEl.textContent = result.output || '(No output)';
            outputEl.className = 'output-block visible' + (result.error ? ' error' : '');
        }
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

        if (result.plots && result.plots.length > 0) {
            outputEl.className = 'sandbox-output-content';
            renderOutputWithPlots(outputEl, result);
        } else {
            outputEl.textContent = result.output || '(No output)';
            outputEl.className = 'sandbox-output-content' + (result.error ? ' error' : '');
        }
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
        outputEl.innerHTML = '';
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
x = np.array([10, 15, 20, 25, 30, 35, 40])
y = np.array([100, 140, 170, 210, 240, 280, 310])

slope, intercept, r, p, se = stats.linregress(x, y)
print(f"Y = {intercept:.2f} + {slope:.2f} * X")
print(f"R-squared: {r**2:.4f}, P-value: {p:.6f}")

# --- Visual: Scatter + Regression Line ---
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 5))
ax.scatter(x, y, color='#2563eb', s=80, zorder=5, label='Observed data')
ax.plot(x, intercept + slope * x, color='#dc2626', linewidth=2, label=f'Fit: Y = {intercept:.1f} + {slope:.1f}X')
ax.fill_between(x, intercept + slope*x - 10, intercept + slope*x + 10, alpha=0.1, color='red')
ax.set_xlabel('Ad Spend ($000s)', fontsize=12)
ax.set_ylabel('Sales ($000s)', fontsize=12)
ax.set_title(f'Simple Linear Regression  (R² = {r**2:.4f})', fontsize=14, fontweight='bold')
ax.legend(fontsize=11)
ax.grid(True, alpha=0.3)
plt.show()`,

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
print(f"R-squared: {R2:.4f}")

# --- Visual: Actual vs Predicted ---
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].scatter(Y, y_hat, color='#2563eb', s=50, alpha=0.7)
mn, mx = min(Y.min(), y_hat.min()), max(Y.max(), y_hat.max())
axes[0].plot([mn, mx], [mn, mx], 'r--', linewidth=2, label='Perfect fit')
axes[0].set_xlabel('Actual Y', fontsize=11)
axes[0].set_ylabel('Predicted Y', fontsize=11)
axes[0].set_title('Actual vs Predicted', fontsize=13, fontweight='bold')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

residuals = Y - y_hat
axes[1].scatter(y_hat, residuals, color='#059669', s=50, alpha=0.7)
axes[1].axhline(y=0, color='red', linestyle='--', linewidth=2)
axes[1].set_xlabel('Predicted Y', fontsize=11)
axes[1].set_ylabel('Residuals', fontsize=11)
axes[1].set_title('Residual Plot', fontsize=13, fontweight='bold')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`,

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
    print(f"Score {s}: {p:.1%} default probability")

# --- Visual: Sigmoid Curve ---
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 5))
x_range = np.linspace(550, 800, 200)
y_prob = sigmoid(beta[0] + beta[1] * x_range)

ax.plot(x_range, y_prob, color='#2563eb', linewidth=2.5, label='Logistic curve')
ax.scatter(scores[default==1], default[default==1], color='#dc2626', s=80, zorder=5, label='Default (Y=1)', marker='x', linewidths=2)
ax.scatter(scores[default==0], default[default==0], color='#059669', s=80, zorder=5, label='No Default (Y=0)', marker='o')
ax.axhline(y=0.5, color='gray', linestyle='--', alpha=0.5, label='Decision boundary (0.5)')
ax.set_xlabel('Credit Score', fontsize=12)
ax.set_ylabel('P(Default)', fontsize=12)
ax.set_title('Logistic Regression: Default Probability', fontsize=14, fontweight='bold')
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.show()`,

        'K-Means Clustering': `import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)

# Generate 3-cluster customer data
data = np.vstack([
    np.random.normal([2,2], 0.8, (25,2)),   # Budget shoppers
    np.random.normal([8,8], 0.8, (25,2)),   # Premium shoppers
    np.random.normal([8,2], 0.8, (25,2))    # Bargain hunters
])
true_labels = np.array([0]*25 + [1]*25 + [2]*25)

# K-Means algorithm
K = 3
idx = np.random.choice(75, K, replace=False)
centroids = data[idx].copy()
for _ in range(50):
    dists = np.array([np.sum((data-c)**2, axis=1) for c in centroids]).T
    labels = np.argmin(dists, axis=1)
    centroids = np.array([data[labels==k].mean(0) for k in range(K)])

print("=== K-Means Clustering Results ===")
for k in range(K):
    n = np.sum(labels==k)
    print(f"Cluster {k+1}: center=({centroids[k,0]:.2f}, {centroids[k,1]:.2f}), size={n}")

# Elbow method (WCSS)
wcss = []
for k in range(1, 8):
    c = data[np.random.choice(75, k, replace=False)].copy()
    for _ in range(50):
        d = np.array([np.sum((data-ci)**2, axis=1) for ci in c]).T
        lb = np.argmin(d, axis=1)
        c = np.array([data[lb==j].mean(0) if np.sum(lb==j)>0 else c[j] for j in range(k)])
    wcss.append(sum(np.min(np.array([np.sum((data-ci)**2, axis=1) for ci in c]).T, axis=1)))

# --- Visuals ---
colors = ['#2563eb', '#dc2626', '#059669']
names = ['Cluster 1 (Budget)', 'Cluster 2 (Premium)', 'Cluster 3 (Bargain)']

fig, axes = plt.subplots(1, 2, figsize=(14, 5.5))

# Scatter plot
for k in range(K):
    mask = labels == k
    axes[0].scatter(data[mask,0], data[mask,1], c=colors[k], s=60, alpha=0.7, label=names[k])
axes[0].scatter(centroids[:,0], centroids[:,1], c='black', s=200, marker='*', zorder=10, label='Centroids')
axes[0].set_xlabel('Annual Spending ($000s)', fontsize=11)
axes[0].set_ylabel('Visit Frequency', fontsize=11)
axes[0].set_title('Customer Segments (K-Means, K=3)', fontsize=13, fontweight='bold')
axes[0].legend(fontsize=9)
axes[0].grid(True, alpha=0.3)

# Elbow plot
axes[1].plot(range(1,8), wcss, 'bo-', linewidth=2, markersize=8)
axes[1].axvline(x=3, color='red', linestyle='--', alpha=0.7, label='Optimal K=3')
axes[1].set_xlabel('Number of Clusters (K)', fontsize=11)
axes[1].set_ylabel('Within-Cluster Sum of Squares', fontsize=11)
axes[1].set_title('Elbow Method', fontsize=13, fontweight='bold')
axes[1].legend(fontsize=10)
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`,

        'Hierarchical Clustering': `import numpy as np
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from scipy.spatial.distance import pdist
import matplotlib.pyplot as plt

np.random.seed(42)

# === Business Context: Market Similarity Analysis ===
# 10 cities rated on 3 business dimensions
cities = ['New York', 'London', 'Tokyo', 'Mumbai', 'Shanghai',
          'Paris', 'Sydney', 'Dubai', 'Singapore', 'Toronto']

# Features: [Market Size, Tech Adoption, Cost of Living]
data = np.array([
    [9.5, 8.5, 9.2],   # New York
    [8.8, 8.0, 8.5],   # London
    [8.5, 9.2, 7.8],   # Tokyo
    [7.0, 5.5, 3.2],   # Mumbai
    [8.0, 6.5, 4.5],   # Shanghai
    [7.5, 7.8, 8.0],   # Paris
    [6.5, 7.5, 7.0],   # Sydney
    [6.0, 6.8, 6.5],   # Dubai
    [5.5, 8.5, 7.5],   # Singapore
    [7.0, 7.8, 7.8],   # Toronto
])

# --- Hierarchical Clustering (Ward's method) ---
Z_ward = linkage(data, method='ward')
Z_complete = linkage(data, method='complete')
Z_average = linkage(data, method='average')

# Cut into clusters
k = 3
cluster_labels = fcluster(Z_ward, k, criterion='maxclust')

print("=== Hierarchical Clustering: Market Similarity ===")
print(f"\\nMethod: Ward's Linkage | Clusters: {k}\\n")
for c in range(1, k+1):
    members = [cities[i] for i in range(len(cities)) if cluster_labels[i] == c]
    print(f"  Cluster {c}: {', '.join(members)}")

# Cophenetic correlation
from scipy.cluster.hierarchy import cophenet
coph_corr, _ = cophenet(Z_ward, pdist(data))
print(f"\\nCophenetic Correlation: {coph_corr:.4f}")

# --- FIGURE 1: Dendrogram (Ward's) ---
fig1, ax1 = plt.subplots(figsize=(12, 6))
dn = dendrogram(Z_ward, labels=cities, ax=ax1,
                 leaf_rotation=35, leaf_font_size=11,
                 color_threshold=Z_ward[-k+1, 2],
                 above_threshold_color='#888888')
ax1.set_title("Dendrogram — Ward's Linkage (Market Similarity)", fontsize=14, fontweight='bold')
ax1.set_ylabel('Distance', fontsize=12)
ax1.axhline(y=Z_ward[-k+1, 2], color='red', linestyle='--', alpha=0.7, label=f'Cut for K={k}')
ax1.legend(fontsize=11)
ax1.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.show()

# --- FIGURE 2: Compare linkage methods ---
fig2, axes = plt.subplots(1, 3, figsize=(18, 5))
for ax, Z, title in zip(axes,
                         [Z_ward, Z_complete, Z_average],
                         ["Ward's", "Complete", "Average"]):
    dendrogram(Z, labels=cities, ax=ax, leaf_rotation=45,
               leaf_font_size=9, color_threshold=0)
    ax.set_title(f'{title} Linkage', fontsize=12, fontweight='bold')
    ax.set_ylabel('Distance')
plt.suptitle('Comparing Linkage Methods', fontsize=14, fontweight='bold', y=1.02)
plt.tight_layout()
plt.show()

# --- FIGURE 3: Cluster scatter (first 2 features) ---
fig3, ax3 = plt.subplots(figsize=(9, 6))
colors = ['#2563eb', '#dc2626', '#059669']
for c in range(1, k+1):
    mask = cluster_labels == c
    ax3.scatter(data[mask, 0], data[mask, 1], c=colors[c-1], s=120,
                label=f'Cluster {c}', alpha=0.8, edgecolors='white', linewidth=1.5)
    for i in np.where(mask)[0]:
        ax3.annotate(cities[i], (data[i,0], data[i,1]),
                     fontsize=9, ha='center', va='bottom',
                     xytext=(0, 8), textcoords='offset points')
ax3.set_xlabel('Market Size', fontsize=12)
ax3.set_ylabel('Tech Adoption', fontsize=12)
ax3.set_title('Cluster Membership (Ward\\'s, K=3)', fontsize=13, fontweight='bold')
ax3.legend(fontsize=10)
ax3.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,

        'Factor Analysis': `import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
n = 200

# === Business: Customer Satisfaction Survey (8 items) ===
# Factor 1: Service Quality
F1 = np.random.normal(0, 1, n)
# Factor 2: Value for Money
F2 = np.random.normal(0, 1, n)

items = ['Staff Friendliness', 'Response Time', 'Problem Resolution', 'Expertise',
         'Price Fairness', 'Discounts', 'Value Perception', 'Overall Worth']
data = np.column_stack([
    0.85*F1 + np.random.normal(0,0.3,n),
    0.80*F1 + np.random.normal(0,0.3,n),
    0.75*F1 + np.random.normal(0,0.3,n),
    0.70*F1 + 0.2*F2 + np.random.normal(0,0.3,n),
    0.2*F1 + 0.85*F2 + np.random.normal(0,0.3,n),
    0.80*F2 + np.random.normal(0,0.3,n),
    0.15*F1 + 0.78*F2 + np.random.normal(0,0.3,n),
    0.3*F1 + 0.72*F2 + np.random.normal(0,0.3,n),
])

corr = np.corrcoef(data.T)
eigvals, eigvecs = np.linalg.eigh(corr)
eigvals = eigvals[::-1]
eigvecs = eigvecs[:, ::-1]

print("=== Factor Analysis: Satisfaction Survey ===")
print(f"\\nEigenvalues: {np.round(eigvals, 3)}")
print(f"Variance explained: {np.round(eigvals/8*100, 1)}%")
print(f"Cumulative: {np.round(np.cumsum(eigvals/8*100), 1)}%")

L = eigvecs[:, :2] * np.sqrt(eigvals[:2])
print(f"\\nFactor Loadings:")
print(f"{'Item':<22} {'F1 (Service)':>12} {'F2 (Value)':>12}")
print("-" * 48)
for i in range(8):
    print(f"{items[i]:<22} {L[i,0]:>12.3f} {L[i,1]:>12.3f}")

# --- FIGURE 1: Scree Plot ---
fig1, ax1 = plt.subplots(figsize=(8, 5))
ax1.bar(range(1,9), eigvals, color='#2563eb', alpha=0.6, label='Eigenvalue')
ax1.plot(range(1,9), eigvals, 'ro-', linewidth=2, markersize=8, label='Scree line')
ax1.axhline(y=1, color='red', linestyle='--', alpha=0.5, label='Kaiser criterion (λ=1)')
ax1.set_xlabel('Factor Number', fontsize=12)
ax1.set_ylabel('Eigenvalue', fontsize=12)
ax1.set_title('Scree Plot', fontsize=14, fontweight='bold')
ax1.set_xticks(range(1,9))
ax1.legend(fontsize=10)
ax1.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.show()

# --- FIGURE 2: Factor Loading Plot ---
fig2, ax2 = plt.subplots(figsize=(8, 7))
service_items = [0,1,2,3]
value_items = [4,5,6,7]
ax2.scatter(L[service_items,0], L[service_items,1], c='#2563eb', s=120, zorder=5, label='Service Quality items')
ax2.scatter(L[value_items,0], L[value_items,1], c='#dc2626', s=120, zorder=5, label='Value for Money items')
for i in range(8):
    ax2.annotate(items[i], (L[i,0], L[i,1]), fontsize=9, ha='left', va='bottom',
                 xytext=(6, 4), textcoords='offset points')
    ax2.arrow(0, 0, L[i,0]*0.95, L[i,1]*0.95, head_width=0.02, head_length=0.01,
              fc='gray', ec='gray', alpha=0.4)
ax2.axhline(y=0, color='gray', linewidth=0.5)
ax2.axvline(x=0, color='gray', linewidth=0.5)
ax2.set_xlabel('Factor 1 (Service Quality)', fontsize=12)
ax2.set_ylabel('Factor 2 (Value for Money)', fontsize=12)
ax2.set_title('Factor Loading Plot', fontsize=14, fontweight='bold')
ax2.legend(fontsize=10)
ax2.grid(True, alpha=0.3)
ax2.set_xlim(-0.2, 1.1)
ax2.set_ylim(-0.2, 1.1)
plt.tight_layout()
plt.show()`
    },

    r: {
        'Simple Regression': `x <- c(10, 15, 20, 25, 30, 35, 40)
y <- c(100, 140, 170, 210, 240, 280, 310)

model <- lm(y ~ x)
cat("=== Simple Linear Regression ===\\n")
summary(model)`,

        'Multiple Regression': `set.seed(42)
n <- 30
x1 <- runif(n, 5, 50)
x2 <- runif(n, 1, 10)
y <- 10 + 2.5*x1 + 5*x2 + rnorm(n, 0, 8)

model <- lm(y ~ x1 + x2)
cat("=== Multiple Regression ===\\n")
summary(model)`,

        'Logistic Regression': `scores <- c(580,620,650,680,700,720,750,780,600,640,660,690,710,740,770)
default <- c(1,1,1,0,0,0,0,0,1,1,0,0,0,0,0)

model <- glm(default ~ scores, family = binomial)
cat("=== Logistic Regression ===\\n")
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
cat("=== K-Means Clustering ===\\n")
cat("Cluster sizes:", km$size, "\\n")
cat("\\nCluster centers:\\n")
print(round(km$centers, 2))
cat("\\nWithin-cluster SS:", round(km$withinss, 2))
cat("\\nTotal within SS:", round(km$tot.withinss, 2))
cat("\\nBetween SS / Total SS:", round(km$betweenss/km$totss*100, 1), "%\\n")`,

        'Hierarchical Clustering': `# === Hierarchical Clustering: Market Similarity ===
cities <- c('New York','London','Tokyo','Mumbai','Shanghai',
            'Paris','Sydney','Dubai','Singapore','Toronto')

# Features: Market Size, Tech Adoption, Cost of Living
data <- matrix(c(
    9.5,8.5,9.2, 8.8,8.0,8.5, 8.5,9.2,7.8, 7.0,5.5,3.2, 8.0,6.5,4.5,
    7.5,7.8,8.0, 6.5,7.5,7.0, 6.0,6.8,6.5, 5.5,8.5,7.5, 7.0,7.8,7.8
), ncol=3, byrow=TRUE)
rownames(data) <- cities

# Ward's linkage
d <- dist(data)
hc_ward <- hclust(d, method="ward.D2")
hc_complete <- hclust(d, method="complete")
hc_average <- hclust(d, method="average")

# Cut into 3 clusters
clusters <- cutree(hc_ward, k=3)
cat("=== Hierarchical Clustering (Ward's Linkage) ===\\n\\n")
for (k in 1:3) {
    members <- cities[clusters == k]
    cat(sprintf("Cluster %d: %s\\n", k, paste(members, collapse=", ")))
}

# Cophenetic correlation
coph <- cor(d, cophenetic(hc_ward))
cat(sprintf("\\nCophenetic Correlation: %.4f\\n", coph))

# Agglomerative schedule
cat("\\nMerge Schedule (last 5):\\n")
n <- length(cities)
sched <- hc_ward$merge
heights <- hc_ward$height
for (i in (n-5):(n-1)) {
    cat(sprintf("  Step %d: height = %.3f\\n", i, heights[i]))
}`,

        'Factor Analysis': `set.seed(42)
n <- 150
F1 <- rnorm(n); F2 <- rnorm(n)
data <- data.frame(
    V1 = 0.9*F1 + rnorm(n,0,0.3),
    V2 = 0.8*F1 + rnorm(n,0,0.3),
    V3 = 0.85*F2 + rnorm(n,0,0.3),
    V4 = 0.75*F2 + rnorm(n,0,0.3)
)

cat("=== Factor Analysis ===\\n\\n")
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
