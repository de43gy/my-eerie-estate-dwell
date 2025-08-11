import { GameEngine } from './game-engine.js';
import { TelegramAPI } from './telegram/telegram-api.js';

class App {
    constructor() {
        this.gameEngine = null;
        this.telegramAPI = null;
    }

    async init() {
        try {
            this.telegramAPI = new TelegramAPI();
            this.telegramAPI.init();

            this.gameEngine = new GameEngine();
            await this.gameEngine.init();

            this.bindEvents();
            this.startGameLoop();

            // Global reference for direct button access
            window.gameEngineRef = this.gameEngine;

            console.log('Game successfully initialized');
        } catch (error) {
            console.error('Game initialization error:', error);
            this.showError('Ошибка загрузки игры');
        }
    }

    bindEvents() {
        // Platform detection for different event handling
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTelegramWebApp = window.Telegram?.WebApp;
        const isDesktop = !isMobile;
        
        console.log('Platform detection:', { isMobile, isDesktop, isTelegramWebApp });

        // Universal function to handle clicks/taps
        const handleInteraction = (event) => {
            console.log('Event triggered:', {
                type: event.type,
                target: event.target.className,
                dataset: event.target.dataset,
                platform: { isMobile, isDesktop }
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

        // Different event strategies for different platforms
        if (isDesktop) {
            // Desktop-specific event handling
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
        if (isDesktop) {
            this.setupFallbackButtonSystem();
        }

        window.addEventListener('beforeunload', () => {
            this.gameEngine?.saveGame();
        });

        setInterval(() => {
            this.gameEngine?.autoSave();
        }, 30000);
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