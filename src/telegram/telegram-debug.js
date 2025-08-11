/**
 * Telegram Desktop Debug Utilities
 * For testing and debugging button interactions
 */

export class TelegramDebugger {
    constructor() {
        this.isActive = false;
        this.debugMode = false;
    }

    init() {
        if (!this.detectTelegramDesktop()) {
            console.log('Telegram Debugger: Not in Telegram Desktop');
            return;
        }

        this.isActive = true;
        console.log('Telegram Debugger: Activated');
        
        this.setupDebugMode();
        this.addDebugControls();
        this.monitorButtonStates();
    }

    detectTelegramDesktop() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isTelegramWebApp = !!window.Telegram?.WebApp;
        const isDesktop = !/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        return isTelegramWebApp && isDesktop;
    }

    setupDebugMode() {
        // Enable debug mode
        this.debugMode = true;
        
        // Add debug info to console
        console.log('=== TELEGRAM DESKTOP DEBUG MODE ===');
        console.log('User Agent:', navigator.userAgent);
        console.log('Telegram WebApp:', window.Telegram?.WebApp);
        console.log('Platform:', this.getPlatformInfo());
        
        // Monitor all button interactions
        this.interceptAllEvents();
    }

    getPlatformInfo() {
        return {
            isTelegramWebApp: !!window.Telegram?.WebApp,
            isDesktop: !/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent),
            hasTouch: 'ontouchstart' in window,
            hasPointer: 'onpointerdown' in window,
            hasMouse: 'onmousedown' in window
        };
    }

    interceptAllEvents() {
        const eventTypes = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'];
        
        eventTypes.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                if (this.debugMode && (e.target.classList.contains('action-button') || e.target.classList.contains('location-button'))) {
                    this.logButtonEvent(eventType, e.target, e);
                }
            }, { capture: true });
        });
    }

    logButtonEvent(eventType, target, event) {
        const buttonInfo = {
            type: target.classList.contains('action-button') ? 'action' : 'location',
            id: target.dataset.action || target.dataset.location,
            className: target.className,
            dataset: target.dataset,
            eventType: eventType,
            timestamp: new Date().toISOString(),
            coordinates: {
                clientX: event.clientX,
                clientY: event.clientY,
                pageX: event.pageX,
                pageY: event.pageY
            },
            modifiers: {
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey
            }
        };
        
        console.log('🔍 Button Event Detected:', buttonInfo);
        
        // Store event for analysis
        this.storeEvent(buttonInfo);
    }

    storeEvent(eventInfo) {
        if (!this.eventHistory) {
            this.eventHistory = [];
        }
        
        this.eventHistory.push(eventInfo);
        
        // Keep only last 50 events
        if (this.eventHistory.length > 50) {
            this.eventHistory.shift();
        }
    }

    addDebugControls() {
        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'telegram-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        debugPanel.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>🔧 Telegram Debug</strong>
                <button id="debug-test-buttons" style="margin-left: 10px; padding: 2px 5px;">Test Buttons</button>
            </div>
            <div id="debug-info"></div>
        `;
        
        document.body.appendChild(debugPanel);
        
        // Add test button functionality
        document.getElementById('debug-test-buttons').addEventListener('click', () => {
            this.testAllButtons();
        });
        
        // Update debug info
        this.updateDebugInfo();
        setInterval(() => this.updateDebugInfo(), 1000);
    }

    updateDebugInfo() {
        const debugInfo = document.getElementById('debug-info');
        if (!debugInfo) return;
        
        const actionButtons = document.querySelectorAll('.action-button');
        const locationButtons = document.querySelectorAll('.location-button');
        
        debugInfo.innerHTML = `
            <div>Action Buttons: ${actionButtons.length}</div>
            <div>Location Buttons: ${locationButtons.length}</div>
            <div>Events: ${this.eventHistory ? this.eventHistory.length : 0}</div>
            <div>Time: ${new Date().toLocaleTimeString()}</div>
        `;
    }

    testAllButtons() {
        console.log('🧪 Testing all buttons...');
        
        const actionButtons = document.querySelectorAll('.action-button');
        const locationButtons = document.querySelectorAll('.location-button');
        
        console.log(`Found ${actionButtons.length} action buttons and ${locationButtons.length} location buttons`);
        
        // Test action buttons
        actionButtons.forEach((button, index) => {
            const actionId = button.dataset.action;
            console.log(`Testing action button ${index + 1}: ${actionId}`);
            
            // Simulate click
            setTimeout(() => {
                this.simulateButtonClick(button, 'action', actionId);
            }, index * 100);
        });
        
        // Test location buttons
        locationButtons.forEach((button, index) => {
            const locationId = button.dataset.location;
            console.log(`Testing location button ${index + 1}: ${locationId}`);
            
            setTimeout(() => {
                this.simulateButtonClick(button, 'location', locationId);
            }, (actionButtons.length + index) * 100);
        });
    }

    simulateButtonClick(button, type, id) {
        console.log(`🎯 Simulating ${type} button click: ${id}`);
        
        // Create and dispatch click event
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: button.offsetLeft + button.offsetWidth / 2,
            clientY: button.offsetTop + button.offsetHeight / 2
        });
        
        button.dispatchEvent(clickEvent);
        
        // Also try direct function call
        if (window.gameEngineRef) {
            try {
                if (type === 'action') {
                    window.gameEngineRef.processAction(id);
                } else if (type === 'location') {
                    window.gameEngineRef.moveToLocation(id);
                }
                console.log(`✅ Direct function call successful for ${type}: ${id}`);
            } catch (error) {
                console.error(`❌ Direct function call failed for ${type}: ${id}`, error);
            }
        }
    }

    monitorButtonStates() {
        // Monitor button properties and styles
        setInterval(() => {
            const actionButtons = document.querySelectorAll('.action-button');
            const locationButtons = document.querySelectorAll('.location-button');
            
            [...actionButtons, ...locationButtons].forEach(button => {
                const computedStyle = window.getComputedStyle(button);
                const buttonState = {
                    element: button,
                    className: button.className,
                    dataset: button.dataset,
                    computedStyles: {
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        opacity: computedStyle.opacity,
                        pointerEvents: computedStyle.pointerEvents,
                        cursor: computedStyle.cursor,
                        position: computedStyle.position,
                        zIndex: computedStyle.zIndex
                    },
                    attributes: {
                        tabindex: button.getAttribute('tabindex'),
                        role: button.getAttribute('role'),
                        disabled: button.disabled
                    }
                };
                
                // Log if button seems non-interactive
                if (computedStyle.pointerEvents === 'none' || 
                    computedStyle.display === 'none' || 
                    computedStyle.visibility === 'hidden') {
                    console.warn('⚠️ Non-interactive button detected:', buttonState);
                }
            });
        }, 5000);
    }

    // Get debug information
    getDebugInfo() {
        return {
            isActive: this.isActive,
            debugMode: this.debugMode,
            platformInfo: this.getPlatformInfo(),
            eventHistory: this.eventHistory || [],
            buttonCounts: {
                action: document.querySelectorAll('.action-button').length,
                location: document.querySelectorAll('.location-button').length
            }
        };
    }

    // Cleanup
    destroy() {
        this.isActive = false;
        this.debugMode = false;
        
        const debugPanel = document.getElementById('telegram-debug-panel');
        if (debugPanel) {
            debugPanel.remove();
        }
        
        console.log('Telegram Debugger: Destroyed');
    }
}
