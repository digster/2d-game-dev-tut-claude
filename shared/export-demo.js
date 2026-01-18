// ===================================
// EXPORT DEMO FEATURE
// Generates standalone HTML files from code examples
// ===================================

/**
 * Generates a complete, self-contained HTML file for a demo
 * @param {string} demoId - The demo identifier (e.g., 'raycasting')
 * @param {string[]} deps - Array of dependency names (e.g., ['vector2d', 'clearCanvas'])
 * @returns {string} Complete HTML document as a string
 */
function generateStandaloneHTML(demoId, deps) {
    const config = DEMO_HTML[demoId];
    const demoCode = DEMO_CODE[demoId];

    if (!config || !demoCode) {
        console.error(`Demo '${demoId}' not found in DEMO_HTML or DEMO_CODE`);
        return null;
    }

    // Gather dependency code
    const depCode = deps
        .map(d => DEPENDENCY_BUNDLES[d])
        .filter(Boolean)
        .join('\n\n');

    // Generate controls HTML
    const controlsHTML = config.controls
        .map(c => `<button id="${c.id}">${c.text}</button>`)
        .join('\n            ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: #0a0e27;
            color: #e0e0e0;
            font-family: system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }
        h2 {
            color: #4fc3f7;
            margin-bottom: 20px;
        }
        canvas {
            border: 2px solid #4fc3f7;
            background: #0d1117;
            border-radius: 8px;
            cursor: crosshair;
        }
        .controls {
            margin: 15px 0;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }
        button {
            background: #4fc3f7;
            color: #0a0e27;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            transition: all 0.2s;
        }
        button:hover {
            background: #29b6f6;
            transform: translateY(-2px);
        }
        #info {
            color: #8b949e;
            font-size: 0.95em;
            margin-top: 10px;
        }
        .footer {
            margin-top: 30px;
            color: #555;
            font-size: 0.85em;
        }
        .footer a {
            color: #4fc3f7;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h2>${config.title}</h2>
    <canvas id="canvas" width="${config.canvas.width}" height="${config.canvas.height}"></canvas>
    <div class="controls">
        ${controlsHTML}
    </div>
    <div id="info">${config.info}</div>
    <div class="footer">
        Exported from <a href="https://github.com/your-repo/2d-game-dev-tut">Game Dev Math Guide</a>
    </div>

    <script>
// ========== Dependencies ==========
${depCode}

// ========== Demo Code ==========
${demoCode}
    </script>
</body>
</html>`;
}

/**
 * Injects export buttons into code sections with data-demo-id attributes
 */
function initExportButtons() {
    document.querySelectorAll('details[data-demo-id]').forEach(details => {
        const demoId = details.dataset.demoId;
        const deps = (details.dataset.deps || '').split(',').filter(Boolean);
        const summary = details.querySelector('summary');

        if (!summary) return;

        // Create export button
        const btn = document.createElement('button');
        btn.className = 'export-demo-btn';
        btn.innerHTML = '📋 Export';
        btn.title = 'Copy complete working demo to clipboard';

        btn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
                const html = generateStandaloneHTML(demoId, deps);
                if (!html) {
                    btn.innerHTML = '✗ Not found';
                    setTimeout(() => btn.innerHTML = '📋 Export', 2000);
                    return;
                }

                await navigator.clipboard.writeText(html);
                btn.innerHTML = '✓ Copied!';
                btn.classList.add('success');
                setTimeout(() => {
                    btn.innerHTML = '📋 Export';
                    btn.classList.remove('success');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                btn.innerHTML = '✗ Error';
                setTimeout(() => btn.innerHTML = '📋 Export', 2000);
            }
        };

        summary.appendChild(btn);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initExportButtons);
