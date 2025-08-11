import { GameEngine } from './game-engine.js';
import { TelegramAPI } from './telegram/telegram-api.js';
import { TelegramDesktopFix } from './telegram/telegram-desktop-fix.js';
import { TelegramDebugger } from './telegram/telegram-debug.js';

class App {
    constructor() {
        this.gameEngine = null;
        this.telegramAPI = null;
        this.isTelegramDesktop = false;
        this.isTelegramWebApp = false;
        this.telegramDesktopFix = null;
        this.telegramDebugger = null;
    }

    async init() {
        try {
            this.telegramAPI = new TelegramAPI();
            this.telegramAPI.init();

            // Detect Telegram platform
            this.detectTelegramPlatform();

            // Initialize Telegram Desktop fixes if needed
            if (this.isTelegramDesktop) {
                this.telegramDesktopFix = new TelegramDesktopFix();
                this.telegramDesktopFix.init();
                
                // Initialize debugger for development
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    this.telegramDebugger = new TelegramDebugger();
                    this.telegramDebugger.init();
                }
            }

            this.gameEngine = new GameEngine();
            await this.gameEngine.init();

            this.bindEvents();
            this.startGameLoop();

            // Global reference for direct button access
            window.gameEngineRef = this.gameEngine;

            console.log('Game successfully initialized');
            console.log('Platform info:', {
                isTelegramWebApp: this.isTelegramWebApp,
                isTelegramDesktop: this.isTelegramDesktop,
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.error('Game initialization error:', error);
            this.showError('Ошибка загрузки игры');
        }
    }

    detectTelegramPlatform() {
        this.isTelegramWebApp = !!window.Telegram?.WebApp;
        
        if (this.isTelegramWebApp) {
            // Check if it's desktop version
            const userAgent = navigator.userAgent.toLowerCase();
            const isDesktop = !/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            
            // Additional checks for Telegram Desktop
            const isTelegramDesktopApp = userAgent.includes('telegram') || 
                                       userAgent.includes('tgdesktop') ||
                                       userAgent.includes('telegramdesktop');
            
            this.isTelegramDesktop = isDesktop && (isTelegramDesktopApp || this.isTelegramWebApp);
            
            // Add CSS class for Telegram Desktop
            if (this.isTelegramDesktop) {
                document.body.classList.add('telegram-desktop-mode');
                console.log('Added telegram-desktop-mode CSS class');
            }
            
            console.log('Telegram platform detection:', {
                isTelegramWebApp: this.isTelegramWebApp,
                isTelegramDesktop: this.isTelegramDesktop,
                userAgent: navigator.userAgent,
                isDesktop,
                isTelegramDesktopApp
            });
        }
    }

    bindEvents() {
        // Platform detection for different event handling
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isDesktop = !isMobile;
        
        console.log('Platform detection:', { 
            isMobile, 
            isDesktop, 
            isTelegramWebApp: this.isTelegramWebApp,
            isTelegramDesktop: this.isTelegramDesktop,
            userAgent: navigator.userAgent
        });

        // Universal function to handle clicks/taps
        const handleInteraction = (event) => {
            console.log('Event triggered:', {
                type: event.type,
                target: event.target.className,
                dataset: event.target.dataset,
                platform: { isMobile, isDesktop, isTelegramDesktop: this.isTelegramDesktop }
            });

            // Don't prevent default on desktop to allow normal click behavior
            if (isMobile) {
                event.preventDefault();
            }
            event.stopPropagation();

            if (event.target.classList.contains('action-button')) {
                const actionId = event.target.dataset.action;
                console.log('Action triggered:', actionId);
                this.gameEngine.processAction(actionId);
                this.telegramAPI?.hapticFeedback();
                return;
            }

            if (event.target.classList.contains('location-button')) {
                const locationId = event.target.dataset.location;
                console.log('Location triggered:', locationId);
                this.gameEngine.moveToLocation(locationId);
                return;
            }
        };

        // Special handling for Telegram Desktop
        if (this.isTelegramDesktop) {
            console.log('Setting up special event handling for Telegram Desktop');
            this.setupTelegramDesktopEvents();
        } else if (isDesktop) {
            // Regular desktop event handling
            document.addEventListener('click', handleInteraction, { capture: true });
            document.addEventListener('mousedown', handleInteraction, { capture: true });
            
            // Force delegation on document body for desktop
            document.body.addEventListener('click', (e) => {
                console.log('Body click detected:', e.target.className);
                if (e.target.classList.contains('action-button') || e.target.classList.contains('location-button')) {
                    handleInteraction(e);
                }
            }, { capture: true });
            
        } else {
            // Mobile-specific event handling
            document.addEventListener('touchstart', handleInteraction, { passive: false, capture: true });
            document.addEventListener('touchend', handleInteraction, { passive: false, capture: true });
            document.addEventListener('click', handleInteraction, { capture: true });
        }

        // Fallback: Direct button polling system for problematic platforms
        if (isDesktop || this.isTelegramDesktop) {
            this.setupFallbackButtonSystem();
        }

        window.addEventListener('beforeunload', () => {
            this.gameEngine?.saveGame();
        });

        setInterval(() => {
            this.gameEngine?.autoSave();
        }, 30000);
    }

    setupTelegramDesktopEvents() {
        console.log('Setting up Telegram Desktop specific event handling');
        
        // Multiple event binding strategies for Telegram Desktop
        const eventTypes = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
        
        eventTypes.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                if (e.target.classList.contains('action-button')) {
                    const actionId = e.target.dataset.action;
                    console.log(`Telegram Desktop ${eventType} action:`, actionId);
                    e.preventDefault();
                    e.stopPropagation();
                    this.gameEngine.processAction(actionId);
                    this.telegramAPI?.hapticFeedback();
                    return;
                }
                
                if (e.target.classList.contains('location-button')) {
                    const locationId = e.target.dataset.location;
                    console.log(`Telegram Desktop ${eventType} location:`, locationId);
                    e.preventDefault();
                    e.stopPropagation();
                    this.gameEngine.moveToLocation(locationId);
                    return;
                }
            }, { capture: true, passive: false });
        });
        
        // Additional global event listener for Telegram Desktop
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-button') || e.target.classList.contains('location-button')) {
                console.log('Telegram Desktop global click detected');
                // Force the event to be processed
                setTimeout(() => {
                    if (e.target.classList.contains('action-button')) {
                        const actionId = e.target.dataset.action;
                        console.log('Executing action via global handler:', actionId);
                        this.gameEngine.processAction(actionId);
                    } else if (e.target.classList.contains('location-button')) {
                        const locationId = e.target.dataset.location;
                        console.log('Executing location move via global handler:', locationId);
                        this.gameEngine.moveToLocation(locationId);
                    }
                }, 10);
            }
        }, { capture: true });
        
        // Set up polling-based button system for Telegram Desktop
        this.setupTelegramDesktopPolling();
        
        // Additional aggressive event handling
        this.setupAggressiveEventHandling();
    }

    setupAggressiveEventHandling() {
        console.log('Setting up aggressive event handling for Telegram Desktop');
        
        // Force button interactions every 100ms
        setInterval(() => {
            const actionButtons = document.querySelectorAll('.action-button');
            const locationButtons = document.querySelectorAll('.location-button');
            
            [...actionButtons, ...locationButtons].forEach(button => {
                // Force button to be interactive
                button.style.pointerEvents = 'auto';
                button.style.cursor = 'pointer';
                button.style.display = 'flex';
                button.style.visibility = 'visible';
                button.style.opacity = '1';
                
                // Add inline onclick handlers as ultimate fallback
                if (!button.hasAttribute('data-aggressive-bound')) {
                    button.setAttribute('data-aggressive-bound', 'true');
                    
                    if (button.classList.contains('action-button')) {
                        const actionId = button.dataset.action;
                        button.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Aggressive onclick handler triggered for action:', actionId);
                            this.gameEngine.processAction(actionId);
                        };
                    } else if (button.classList.contains('location-button')) {
                        const locationId = button.dataset.location;
                        button.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Aggressive onclick handler triggered for location:', locationId);
                            this.gameEngine.moveToLocation(locationId);
                        };
                    }
                }
            });
        }, 100);
        
        // Also try to intercept all mouse events at document level
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('action-button') || e.target.classList.contains('location-button')) {
                console.log('Document mousedown intercepted for button');
                // Force immediate action
                if (e.target.classList.contains('action-button')) {
                    const actionId = e.target.dataset.action;
                    console.log('Immediate action execution:', actionId);
                    this.gameEngine.processAction(actionId);
                } else if (e.target.classList.contains('location-button')) {
                    const locationId = e.target.dataset.location;
                    console.log('Immediate location execution:', locationId);
                    this.gameEngine.moveToLocation(locationId);
                }
            }
        }, { capture: true, passive: false });
    }

    setupTelegramDesktopPolling() {
        console.log('Setting up Telegram Desktop polling system');
        
        const checkAndBindButtons = () => {
            const actionButtons = document.querySelectorAll('.action-button');
            const locationButtons = document.querySelectorAll('.location-button');
            
            actionButtons.forEach(button => {
                if (!button.hasAttribute('data-telegram-desktop-bound')) {
                    button.setAttribute('data-telegram-desktop-bound', 'true');
                    
                    const actionId = button.dataset.action;
                    
                    // Multiple binding strategies for Telegram Desktop
                    const bindEvents = (element) => {
                        const handlers = [
                            () => {
                                console.log('Telegram Desktop direct action:', actionId);
                                this.gameEngine.processAction(actionId);
                                this.telegramAPI?.hapticFeedback();
                            },
                            (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Telegram Desktop event action:', actionId);
                                this.gameEngine.processAction(actionId);
                                this.telegramAPI?.hapticFeedback();
                            }
                        ];
                        
                        handlers.forEach(handler => {
                            element.onclick = handler;
                            element.addEventListener('click', handler, { capture: true });
                            element.addEventListener('mousedown', handler, { capture: true });
                            element.addEventListener('mouseup', handler, { capture: true });
                            element.addEventListener('touchstart', handler, { passive: false, capture: true });
                            element.addEventListener('touchend', handler, { passive: false, capture: true });
                        });
                        
                        // Make button more interactive
                        element.style.cursor = 'pointer';
                        element.style.userSelect = 'none';
                        element.style.pointerEvents = 'auto';
                        element.setAttribute('tabindex', '0');
                    };
                    
                    bindEvents(button);
                    
                    // Also bind to parent container for better event capture
                    const parent = button.parentElement;
                    if (parent && !parent.hasAttribute('data-telegram-desktop-bound')) {
                        parent.setAttribute('data-telegram-desktop-bound', 'true');
                        bindEvents(parent);
                    }
                    
                    console.log('Telegram Desktop bound to action button:', actionId);
                }
            });
            
            locationButtons.forEach(button => {
                if (!button.hasAttribute('data-telegram-desktop-bound')) {
                    button.setAttribute('data-telegram-desktop-bound', 'true');
                    
                    const locationId = button.dataset.location;
                    
                    const bindEvents = (element) => {
                        const handlers = [
                            () => {
                                console.log('Telegram Desktop direct location:', locationId);
                                this.gameEngine.moveToLocation(locationId);
                            },
                            (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Telegram Desktop event location:', locationId);
                                this.gameEngine.moveToLocation(locationId);
                            }
                        ];
                        
                        handlers.forEach(handler => {
                            element.onclick = handler;
                            element.addEventListener('click', handler, { capture: true });
                            element.addEventListener('mousedown', handler, { capture: true });
                            element.addEventListener('mouseup', handler, { capture: true });
                            element.addEventListener('touchstart', handler, { passive: false, capture: true });
                            element.addEventListener('touchend', handler, { passive: false, capture: true });
                        });
                        
                        element.style.cursor = 'pointer';
                        element.style.userSelect = 'none';
                        element.style.pointerEvents = 'auto';
                        element.setAttribute('tabindex', '0');
                    };
                    
                    bindEvents(button);
                    
                    const parent = button.parentElement;
                    if (parent && !parent.hasAttribute('data-telegram-desktop-bound')) {
                        parent.setAttribute('data-telegram-desktop-bound', 'true');
                        bindEvents(parent);
                    }
                    
                    console.log('Telegram Desktop bound to location button:', locationId);
                }
            });
        };
        
        // Initial check
        setTimeout(checkAndBindButtons, 100);
        
        // Frequent re-check for Telegram Desktop
        setInterval(checkAndBindButtons, 1000);
        
        // Observer for DOM changes
        const observer = new MutationObserver(() => {
            setTimeout(checkAndBindButtons, 50);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupFallbackButtonSystem() {
        console.log('Setting up fallback button system for desktop');
        
        // Polling-based button detection as absolute fallback
        const checkButtons = () => {
            const actionButtons = document.querySelectorAll('.action-button');
            const locationButtons = document.querySelectorAll('.location-button');
            
            // Add onclick handlers directly to each button
            actionButtons.forEach(button => {
                if (!button.hasAttribute('data-fallback-bound')) {
                    button.setAttribute('data-fallback-bound', 'true');
                    
                    // Multiple event binding strategies
                    const actionId = button.dataset.action;
                    const handleClick = () => {
                        console.log('Fallback action triggered:', actionId);
                        this.gameEngine.processAction(actionId);
                    };
                    
                    button.onclick = handleClick;
                    button.addEventListener('click', handleClick, { capture: true });
                    button.addEventListener('mousedown', handleClick, { capture: true });
                    
                    // Make button more clickable
                    button.style.cursor = 'pointer';
                    button.style.userSelect = 'none';
                    button.style.pointerEvents = 'auto';
                    
                    console.log('Fallback bound to action button:', actionId);
                }
            });
            
            locationButtons.forEach(button => {
                if (!button.hasAttribute('data-fallback-bound')) {
                    button.setAttribute('data-fallback-bound', 'true');
                    
                    const locationId = button.dataset.location;
                    const handleClick = () => {
                        console.log('Fallback location triggered:', locationId);
                        this.gameEngine.moveToLocation(locationId);
                    };
                    
                    button.onclick = handleClick;
                    button.addEventListener('click', handleClick, { capture: true });
                    button.addEventListener('mousedown', handleClick, { capture: true });
                    
                    button.style.cursor = 'pointer';
                    button.style.userSelect = 'none';
                    button.style.pointerEvents = 'auto';
                    
                    console.log('Fallback bound to location button:', locationId);
                }
            });
        };
        
        // Initial check
        setTimeout(checkButtons, 500);
        
        // Periodic re-check for dynamically added buttons
        setInterval(checkButtons, 2000);
        
        // Observer for DOM changes
        const observer = new MutationObserver(() => {
            setTimeout(checkButtons, 100);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    startGameLoop() {
        const gameLoop = () => {
            this.gameEngine.update();
            this.gameEngine.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});