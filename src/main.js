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

        // SIMPLE APPROACH: Just use basic click handling like in working app
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
        } else {
            // Regular event handling for other platforms
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
        
        // SIMPLE APPROACH: Just use basic click handling like in working app
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-button')) {
                const actionId = e.target.dataset.action;
                console.log('Telegram Desktop action click:', actionId);
                e.preventDefault();
                e.stopPropagation();
                this.gameEngine.processAction(actionId);
                this.telegramAPI?.hapticFeedback();
                return;
            }
            
            if (e.target.classList.contains('location-button')) {
                const locationId = e.target.dataset.location;
                console.log('Telegram Desktop location click:', locationId);
                e.preventDefault();
                e.stopPropagation();
                this.gameEngine.moveToLocation(locationId);
                return;
            }
        }, { capture: true });
        
        // Set up simple polling-based button system for Telegram Desktop
        this.setupSimpleTelegramDesktopPolling();
    }

    setupSimpleTelegramDesktopPolling() {
        console.log('Setting up simple Telegram Desktop polling system');
        
        const checkAndBindButtons = () => {
            const actionButtons = document.querySelectorAll('.action-button');
            const locationButtons = document.querySelectorAll('.location-button');
            
            actionButtons.forEach(button => {
                if (!button.hasAttribute('data-telegram-simple-bound')) {
                    button.setAttribute('data-telegram-simple-bound', 'true');
                    
                    const actionId = button.dataset.action;
                    
                    // SIMPLE: Just use onclick like in working app
                    button.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Simple Telegram Desktop action:', actionId);
                        this.gameEngine.processAction(actionId);
                    };
                    
                    // Force button to be interactive
                    button.style.pointerEvents = 'auto';
                    button.style.cursor = 'pointer';
                    button.style.userSelect = 'none';
                    button.style.display = 'flex';
                    button.style.visibility = 'visible';
                    button.style.opacity = '1';
                    
                    console.log('Simple binding to action button:', actionId);
                }
            });
            
            locationButtons.forEach(button => {
                if (!button.hasAttribute('data-telegram-simple-bound')) {
                    button.setAttribute('data-telegram-simple-bound', 'true');
                    
                    const locationId = button.dataset.location;
                    
                    // SIMPLE: Just use onclick like in working app
                    button.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Simple Telegram Desktop location:', locationId);
                        this.gameEngine.moveToLocation(locationId);
                    };
                    
                    button.style.pointerEvents = 'auto';
                    button.style.cursor = 'pointer';
                    button.style.userSelect = 'none';
                    button.style.display = 'flex';
                    button.style.visibility = 'visible';
                    button.style.opacity = '1';
                    
                    console.log('Simple binding to location button:', locationId);
                }
            });
        };
        
        // Initial check
        setTimeout(checkAndBindButtons, 100);
        
        // Periodic re-check for dynamically added buttons
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