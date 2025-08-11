/**
 * Telegram Desktop Compatibility Fixes
 * This file contains special workarounds for Telegram Desktop Web App issues
 */

export class TelegramDesktopFix {
    constructor() {
        this.isActive = false;
        this.buttonStates = new Map();
        this.eventQueue = [];
        this.isProcessing = false;
    }

    init() {
        // Check if we're in Telegram Desktop
        if (!this.detectTelegramDesktop()) {
            console.log('Not in Telegram Desktop, skipping fixes');
            return;
        }

        this.isActive = true;
        console.log('Telegram Desktop fixes activated');
        
        this.setupEventInterception();
        this.setupButtonMonitoring();
        this.setupGlobalEventHandlers();
    }

    detectTelegramDesktop() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isTelegramWebApp = !!window.Telegram?.WebApp;
        const isDesktop = !/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        return isTelegramWebApp && isDesktop;
    }

    setupEventInterception() {
        // Intercept and modify event handling for Telegram Desktop
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // Special handling for click events in Telegram Desktop
            if (type === 'click' && this.classList?.contains('action-button')) {
                const enhancedListener = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Enhanced click handler for action button');
                    listener.call(this, e);
                };
                
                // Store original listener for cleanup
                this._enhancedListeners = this._enhancedListeners || new Map();
                this._enhancedListeners.set(listener, enhancedListener);
                
                return originalAddEventListener.call(this, type, enhancedListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
        
        EventTarget.prototype.removeEventListener = function(type, listener, options) {
            if (this._enhancedListeners && this._enhancedListeners.has(listener)) {
                const enhancedListener = this._enhancedListeners.get(listener);
                this._enhancedListeners.delete(listener);
                return originalRemoveEventListener.call(this, type, enhancedListener, options);
            }
            
            return originalRemoveEventListener.call(this, type, listener, options);
        };
    }

    setupButtonMonitoring() {
        // Monitor button states and ensure they're interactive
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processNewButtons(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Initial processing
        this.processNewButtons(document.body);
    }

    processNewButtons(container) {
        const actionButtons = container.querySelectorAll('.action-button');
        const locationButtons = container.querySelectorAll('.location-button');
        
        [...actionButtons, ...locationButtons].forEach(button => {
            this.enhanceButton(button);
        });
    }

    enhanceButton(button) {
        if (button.hasAttribute('data-telegram-enhanced')) {
            return;
        }
        
        button.setAttribute('data-telegram-enhanced', 'true');
        
        // Force button to be interactive
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
        button.style.userSelect = 'none';
        button.style.position = 'relative';
        button.style.zIndex = '100';
        
        // Add multiple event handlers
        const eventTypes = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
        
        eventTypes.forEach(eventType => {
            button.addEventListener(eventType, (e) => {
                this.handleButtonEvent(e, button);
            }, { capture: true, passive: false });
        });
        
        // Add keyboard support
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleButtonEvent(e, button);
            }
        });
        
        // Make button focusable
        button.setAttribute('tabindex', '0');
        button.setAttribute('role', 'button');
        
        console.log('Enhanced button:', button.className, button.dataset);
    }

    handleButtonEvent(event, button) {
        event.preventDefault();
        event.stopPropagation();
        
        const buttonType = button.classList.contains('action-button') ? 'action' : 'location';
        const buttonId = button.dataset.action || button.dataset.location;
        
        console.log(`Telegram Desktop ${buttonType} button event:`, event.type, buttonId);
        
        // Queue the event for processing
        this.queueEvent(buttonType, buttonId, event);
        
        // Process immediately if possible
        this.processEventQueue();
    }

    queueEvent(type, id, event) {
        this.eventQueue.push({
            type,
            id,
            event,
            timestamp: Date.now()
        });
    }

    processEventQueue() {
        if (this.isProcessing || this.eventQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.eventQueue.length > 0) {
            const eventData = this.eventQueue.shift();
            this.executeEvent(eventData);
        }
        
        this.isProcessing = false;
    }

    executeEvent(eventData) {
        const { type, id } = eventData;
        
        try {
            if (type === 'action' && window.gameEngineRef) {
                console.log('Executing action:', id);
                window.gameEngineRef.processAction(id);
            } else if (type === 'location' && window.gameEngineRef) {
                console.log('Executing location move:', id);
                window.gameEngineRef.moveToLocation(id);
            }
        } catch (error) {
            console.error('Error executing event:', error);
        }
    }

    setupGlobalEventHandlers() {
        // Global event handler as fallback
        document.addEventListener('click', (e) => {
            if (!this.isActive) return;
            
            if (e.target.classList.contains('action-button') || e.target.classList.contains('location-button')) {
                console.log('Global click handler triggered');
                // Force event processing
                setTimeout(() => {
                    this.handleButtonEvent(e, e.target);
                }, 10);
            }
        }, { capture: true });
        
        // Handle mousedown events
        document.addEventListener('mousedown', (e) => {
            if (!this.isActive) return;
            
            if (e.target.classList.contains('action-button') || e.target.classList.contains('location-button')) {
                console.log('Global mousedown handler triggered');
                this.handleButtonEvent(e, e.target);
            }
        }, { capture: true });
    }

    // Method to manually trigger button actions (for debugging)
    triggerButtonAction(buttonType, buttonId) {
        console.log('Manually triggering button:', buttonType, buttonId);
        
        if (buttonType === 'action' && window.gameEngineRef) {
            window.gameEngineRef.processAction(buttonId);
        } else if (buttonType === 'location' && window.gameEngineRef) {
            window.gameEngineRef.moveToLocation(buttonId);
        }
    }

    // Cleanup method
    destroy() {
        this.isActive = false;
        this.eventQueue = [];
        this.buttonStates.clear();
    }
}
