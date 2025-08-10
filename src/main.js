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

            console.log('Игра успешно инициализирована');
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
            this.showError('Ошибка загрузки игры');
        }
    }

    bindEvents() {
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('action-button')) {
                const actionId = event.target.dataset.action;
                this.gameEngine.processAction(actionId);
                this.telegramAPI?.hapticFeedback();
            }

            if (event.target.classList.contains('location-button')) {
                const locationId = event.target.dataset.location;
                this.gameEngine.moveToLocation(locationId);
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