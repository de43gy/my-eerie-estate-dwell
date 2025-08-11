export class DebugHelper {
    static isEnabled = false;
    static logs = [];
    
    static init() {
        // Enable debug mode if running in Telegram Desktop or with debug parameter
        const tg = window.Telegram?.WebApp;
        const urlParams = new URLSearchParams(window.location.search);
        
        this.isEnabled = urlParams.get('debug') === 'true' || 
                        (tg && (tg.platform === 'tdesktop' || tg.platform === 'web'));
        
        if (this.isEnabled) {
            this.setupDebugPanel();
            this.interceptEvents();
            console.log('Debug mode enabled');
        }
    }
    
    static log(category, message, data = null) {
        if (!this.isEnabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            category,
            message,
            data
        };
        
        this.logs.push(logEntry);
        console.log(`[${category}]`, message, data);
        
        this.updateDebugPanel(logEntry);
    }
    
    static setupDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 300px;
            max-height: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: #0f0;
            font-family: monospace;
            font-size: 10px;
            padding: 10px;
            border-radius: 5px;
            overflow-y: auto;
            z-index: 10000;
            display: none;
        `;
        document.body.appendChild(panel);
        
        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Debug';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            padding: 5px 10px;
            background: #333;
            color: #0f0;
            border: 1px solid #0f0;
            border-radius: 3px;
            z-index: 10001;
            cursor: pointer;
        `;
        toggleBtn.onclick = () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            toggleBtn.style.display = panel.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(toggleBtn);
    }
    
    static updateDebugPanel(logEntry) {
        const panel = document.getElementById('debug-panel');
        if (!panel) return;
        
        const line = document.createElement('div');
        line.textContent = `[${logEntry.timestamp.split('T')[1].split('.')[0]}] ${logEntry.category}: ${logEntry.message}`;
        panel.appendChild(line);
        
        // Keep only last 50 lines
        while (panel.children.length > 50) {
            panel.removeChild(panel.firstChild);
        }
        
        panel.scrollTop = panel.scrollHeight;
    }
    
    static interceptEvents() {
        // Log all button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                this.log('CLICK', `Button clicked: ${button.textContent}`, {
                    className: button.className,
                    dataset: button.dataset
                });
            }
        }, true);
        
        // Log touch events
        document.addEventListener('touchstart', (e) => {
            const button = e.target.closest('button');
            if (button) {
                this.log('TOUCH', `Touch start: ${button.textContent}`);
            }
        }, true);
        
        document.addEventListener('touchend', (e) => {
            const button = e.target.closest('button');
            if (button) {
                this.log('TOUCH', `Touch end: ${button.textContent}`);
            }
        }, true);
        
        // Log pointer events
        if (window.PointerEvent) {
            document.addEventListener('pointerdown', (e) => {
                const button = e.target.closest('button');
                if (button) {
                    this.log('POINTER', `Pointer down: ${button.textContent}`, {
                        pointerType: e.pointerType,
                        pointerId: e.pointerId
                    });
                }
            }, true);
        }
        
        // Log Telegram WebApp info
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            this.log('TELEGRAM', 'WebApp initialized', {
                platform: tg.platform,
                version: tg.version,
                isExpanded: tg.isExpanded,
                viewportHeight: tg.viewportHeight,
                viewportStableHeight: tg.viewportStableHeight
            });
        }
    }
}
