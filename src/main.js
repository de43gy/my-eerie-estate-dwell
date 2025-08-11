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
        document.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            if (e.target.classList.contains('action-button')) {
                const actionId = e.target.dataset.action;
                console.log('Action button clicked:', actionId);
                this.gameEngine.processAction(actionId);
                this.telegramAPI?.hapticFeedback();
                return false;
            }

            if (e.target.classList.contains('location-button')) {
                const locationId = e.target.dataset.location;
                console.log('Location button clicked:', locationId);
                this.gameEngine.moveToLocation(locationId);
                return false;
            }
        }, true);

        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('action-button') || 
                e.target.classList.contains('location-button')) {
                e.target.style.transform = 'scale(0.95)';
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('action-button') || 
                e.target.classList.contains('location-button')) {
                e.target.style.transform = 'scale(1)';
            }
        });

        window.addEventListener('beforeunload', () => {
            this.gameEngine?.saveGame();
        });

        setInterval(() => {
            this.gameEngine?.autoSave();
        }, 30000);
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