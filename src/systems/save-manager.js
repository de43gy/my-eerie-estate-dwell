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
            
            console.log(`Игра сохранена в слот ${slotIndex}`);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения игры:', error);
            return false;
        }
    }

    loadGame(slotIndex = 0) {
        try {
            const saveKey = slotIndex === 'auto' ? this.autoSaveKey : `${this.saveKey}_${slotIndex}`;
            const saveData = localStorage.getItem(saveKey);
            
            if (!saveData) {
                console.log('Сохранение не найдено');
                return null;
            }

            const gameState = JSON.parse(saveData);
            
            if (!this.validateSaveData(gameState)) {
                console.error('Некорректные данные сохранения');
                return null;
            }

            console.log(`Игра загружена из слота ${slotIndex}`);
            return gameState;
        } catch (error) {
            console.error('Ошибка загрузки игры:', error);
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
            console.log(`Сохранение ${slotIndex} удалено`);
            return true;
        } catch (error) {
            console.error('Ошибка удаления сохранения:', error);
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
                console.error(`Отсутствует обязательное поле: ${field}`);
                return false;
            }
        }

        if (!gameState.time.hasOwnProperty('currentHour') || 
            !gameState.time.hasOwnProperty('currentDay')) {
            console.error('Некорректные данные времени');
            return false;
        }

        if (!gameState.character.hasOwnProperty('needs')) {
            console.error('Отсутствуют данные потребностей персонажа');
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