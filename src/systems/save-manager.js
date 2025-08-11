export class SaveManager {
    constructor() {
        this.saveKey = 'my_eerie_estate_save';
        this.autoSaveKey = 'my_eerie_estate_autosave';
        this.maxSaveSlots = 3;
    }

    saveGame(gameState, slotIndex = 0) {
        try {
            const saveData = {
                ...gameState,
                saveDate: new Date().toISOString(),
                version: gameState.version || "1.0.0"
            };

            const saveKey = slotIndex === 'auto' ? this.autoSaveKey : `${this.saveKey}_${slotIndex}`;
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            
            console.log(`Game saved to slot ${slotIndex}`);
            return true;
        } catch (error) {
            console.error('Game save error:', error);
            return false;
        }
    }

    loadGame(slotIndex = 0) {
        try {
            const saveKey = slotIndex === 'auto' ? this.autoSaveKey : `${this.saveKey}_${slotIndex}`;
            const saveData = localStorage.getItem(saveKey);
            
            if (!saveData) {
                console.log('Save not found');
                return null;
            }

            const gameState = JSON.parse(saveData);
            
            if (!this.validateSaveData(gameState)) {
                console.error('Invalid save data');
                return null;
            }

            console.log(`Game loaded from slot ${slotIndex}`);
            return gameState;
        } catch (error) {
            console.error('Game load error:', error);
            return null;
        }
    }

    hasExistingSave(slotIndex = 0) {
        const saveKey = slotIndex === 'auto' ? this.autoSaveKey : `${this.saveKey}_${slotIndex}`;
        return localStorage.getItem(saveKey) !== null;
    }

    clearSave(slotIndex = 0) {
        try {
            const saveKey = slotIndex === 'auto' ? this.autoSaveKey : `${this.saveKey}_${slotIndex}`;
            localStorage.removeItem(saveKey);
            console.log(`Save ${slotIndex} deleted`);
            return true;
        } catch (error) {
            console.error('Save deletion error:', error);
            return false;
        }
    }

    validateSaveData(gameState) {
        if (!gameState || typeof gameState !== 'object') {
            return false;
        }

        const requiredFields = ['time', 'character', 'inventory', 'location'];
        for (const field of requiredFields) {
            if (!gameState.hasOwnProperty(field)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        if (!gameState.time.hasOwnProperty('currentHour') || 
            !gameState.time.hasOwnProperty('currentDay')) {
            console.error('Invalid time data');
            return false;
        }

        if (!gameState.character.hasOwnProperty('needs')) {
            console.error('Missing character needs data');
            return false;
        }

        return true;
    }

    autoSave(gameState) {
        return this.saveGame(gameState, 'auto');
    }

    getAutoSave() {
        return this.loadGame('auto');
    }
}