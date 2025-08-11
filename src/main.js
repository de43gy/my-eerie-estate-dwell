import { GameEngine } from './game-engine.js';
import { TelegramAPI } from './telegram/telegram-api.js';
import { DebugHelper } from './utils/debug-helper.js';

class App {
    constructor() {
        this.gameEngine = null;
        this.telegramAPI = null;
    }

    async init() {
        try {
            // Initialize debug helper first
            DebugHelper.init();
            
            this.telegramAPI = new TelegramAPI();
            this.telegramAPI.init();

            this.gameEngine = new GameEngine();
            await this.gameEngine.init();

            this.bindEvents();
            this.startGameLoop();

            window.gameEngine = this.gameEngine;
            window.gameEngineRef = this.gameEngine;
            
            console.log('Game successfully initialized');
        } catch (error) {
            console.error('Game initialization error:', error);
            this.showError('Ошибка загрузки игры');
        }
    }

    bindEvents() {
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