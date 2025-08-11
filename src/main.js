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

            console.log('Game successfully initialized');
        } catch (error) {
            console.error('Game initialization error:', error);
            this.showError('Ошибка загрузки игры');
        }
    }

    bindEvents() {
        // Universal function to handle clicks/taps
        const handleInteraction = (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (event.target.classList.contains('action-button')) {
                const actionId = event.target.dataset.action;
                console.log('Action triggered:', actionId);
                this.gameEngine.processAction(actionId);
                this.telegramAPI?.hapticFeedback();
            }

            if (event.target.classList.contains('location-button')) {
                const locationId = event.target.dataset.location;
                console.log('Location triggered:', locationId);
                this.gameEngine.moveToLocation(locationId);
            }
        };

        // Add support for different event types
        document.addEventListener('click', handleInteraction, true);
        document.addEventListener('touchend', handleInteraction, true);
        document.addEventListener('mousedown', handleInteraction, true);

        // Additionally bind events to containers
        const actionsContainer = document.getElementById('actions-list');
        const locationsContainer = document.getElementById('location-buttons');

        if (actionsContainer) {
            actionsContainer.addEventListener('click', handleInteraction, true);
            actionsContainer.addEventListener('touchend', handleInteraction, true);
        }

        if (locationsContainer) {
            locationsContainer.addEventListener('click', handleInteraction, true);
            locationsContainer.addEventListener('touchend', handleInteraction, true);
        }

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