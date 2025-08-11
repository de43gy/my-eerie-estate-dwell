import { TimeSystem } from './systems/time-system.js';
import { CharacterManager } from './systems/character-manager.js';
import { ResourceManager } from './systems/resource-manager.js';
import { LocationManager } from './systems/location-manager.js';
import { UIManager } from './systems/ui-manager.js';
import { SaveManager } from './systems/save-manager.js';

export class GameEngine {
    constructor() {
        this.timeSystem = new TimeSystem();
        this.characterManager = new CharacterManager();
        this.resourceManager = new ResourceManager();
        this.locationManager = new LocationManager();
        this.uiManager = new UIManager();
        this.saveManager = new SaveManager();
        
        this.isInitialized = false;
        this.lastUpdateTime = 0;
    }

    async init() {
        try {
            await this.loadGameData();
            this.setupSystems();
            this.bindSystemEvents();
            
            if (this.saveManager.hasExistingSave()) {
                this.loadGame();
            } else {
                this.startNewGame();
            }
            
            this.isInitialized = true;
            console.log('GameEngine initialized');
        } catch (error) {
            console.error('GameEngine initialization error:', error);
            throw error;
        }
    }

    async loadGameData() {
        const [locations, resources, actions] = await Promise.all([
            import('./data/locations.js'),
            import('./data/resources.js'),
            import('./data/actions.js')
        ]);

        this.gameData = {
            locations: locations.LOCATIONS,
            resources: resources.RESOURCES,
            actions: actions.ACTIONS
        };
    }

    setupSystems() {
        this.locationManager.init(this.gameData.locations);
        this.resourceManager.init(this.gameData.resources);
        this.uiManager.init();
    }

    bindSystemEvents() {
        this.timeSystem.onTimeChange((timeData) => {
            this.characterManager.updateNeeds(timeData.hoursElapsed);
            this.checkGameConditions();
        });
    }

    startNewGame() {
        this.timeSystem.reset();
        this.characterManager.reset();
        this.resourceManager.reset();
        this.locationManager.setCurrentLocation('main_room');
        
        this.resourceManager.addResource('food', 5);
        this.resourceManager.addResource('water', 3);
        
        this.uiManager.showMessage('Добро пожаловать в ваш новый дом! Время начать новую жизнь...');
    }

    processAction(actionId) {
        if (!this.isInitialized) return;

        const action = this.gameData.actions[actionId];
        if (!action) {
            console.error('Unknown action:', actionId);
            return;
        }

        if (!this.canPerformAction(action)) {
            this.uiManager.showMessage('Невозможно выполнить это действие сейчас');
            return;
        }

        this.executeAction(action);
    }

    canPerformAction(action) {
        if (action.energyCost && this.characterManager.needs.energy < action.energyCost) {
            return false;
        }

        if (action.location && !action.anyLocation) {
            if (Array.isArray(action.location)) {
                if (!action.location.includes(this.locationManager.currentLocation)) {
                    return false;
                }
            } else if (this.locationManager.currentLocation !== action.location) {
                return false;
            }
        }

        if (action.timeOfDay) {
            const isDaytime = this.timeSystem.isDaytime();
            if (action.timeOfDay === 'day' && !isDaytime) return false;
            if (action.timeOfDay === 'night' && isDaytime) return false;
        }

        if (action.requirements) {
            for (const [resource, amount] of Object.entries(action.requirements)) {
                if (!this.resourceManager.hasResource(resource, amount)) {
                    return false;
                }
            }
        }

        return true;
    }

    executeAction(action) {
        if (action.timeCost) {
            this.timeSystem.advanceTime(action.timeCost);
        }

        if (action.energyCost) {
            this.characterManager.modifyNeed('energy', -action.energyCost);
        }

        if (action.requirements) {
            for (const [resource, amount] of Object.entries(action.requirements)) {
                this.resourceManager.removeResource(resource, amount);
            }
        }

        if (action.consumedResources) {
            for (const [resource, amount] of Object.entries(action.consumedResources)) {
                this.resourceManager.removeResource(resource, amount);
            }
        }

        if (action.results) {
            this.applyActionResults(action.results);
        }

        this.uiManager.showMessage(`${action.name} выполнено`);
    }

    applyActionResults(results) {
        for (const [key, value] of Object.entries(results)) {
            if (key === 'consumedResources') continue;
            
            if (this.characterManager.needs.hasOwnProperty(key)) {
                this.characterManager.modifyNeed(key, value);
            } else if (this.gameData.resources[key]) {
                const amount = typeof value === 'object' ? 
                    Math.floor(Math.random() * (value.max - value.min + 1)) + value.min : 
                    value;
                this.resourceManager.addResource(key, amount);
            }
        }
    }

    moveToLocation(locationId) {
        if (this.locationManager.canMoveTo(locationId)) {
            this.locationManager.setCurrentLocation(locationId);
            this.timeSystem.advanceTime(0.5);
            this.uiManager.showMessage(`Перешли в: ${this.gameData.locations[locationId].name}`);
        }
    }

    checkGameConditions() {
        if (this.characterManager.needs.health <= 0) {
            this.gameOver('Вы погибли от ран...');
            return;
        }

        if (this.characterManager.needs.hunger <= 0 || this.characterManager.needs.thirst <= 0) {
            this.characterManager.modifyNeed('health', -10);
            this.uiManager.showMessage('Вы страдаете от голода или жажды!');
        }

        if (this.characterManager.needs.energy <= 10) {
            this.uiManager.showMessage('Вы очень устали...');
        }
    }

    gameOver(reason) {
        this.uiManager.showMessage(`Игра окончена: ${reason}`);
        this.saveManager.clearSave();
    }

    update() {
        if (!this.isInitialized) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        
        if (deltaTime >= 1000) {
            this.lastUpdateTime = currentTime;
        }
    }

    render() {
        if (!this.isInitialized) return;

        this.uiManager.updateTimeDisplay(this.timeSystem.getTimeString());
        this.uiManager.updateCharacterStats(this.characterManager.needs);
        this.uiManager.updateInventory(this.resourceManager.getInventory());
        this.uiManager.updateLocation(
            this.locationManager.getCurrentLocation(),
            this.getAvailableActions()
        );
        this.uiManager.updateNavigation(this.locationManager.getAvailableConnections());
    }

    getAvailableActions() {
        const currentLocation = this.locationManager.currentLocation;
        const locationData = this.gameData.locations[currentLocation];
        
        return locationData.actions
            .map(actionId => this.gameData.actions[actionId])
            .filter(action => action && this.canPerformAction(action));
    }

    getGameState() {
        return {
            version: "1.0.0",
            timestamp: Date.now(),
            time: this.timeSystem.getState(),
            character: this.characterManager.getState(),
            inventory: this.resourceManager.getState(),
            location: this.locationManager.getState()
        };
    }

    loadGame() {
        const gameState = this.saveManager.loadGame();
        if (gameState) {
            this.timeSystem.setState(gameState.time);
            this.characterManager.setState(gameState.character);
            this.resourceManager.setState(gameState.inventory);
            this.locationManager.setState(gameState.location);
            
            this.uiManager.showMessage('Игра загружена');
        }
    }

    saveGame() {
        this.saveManager.saveGame(this.getGameState());
    }

    autoSave() {
        this.saveGame();
        console.log('Auto-save completed');
    }
}