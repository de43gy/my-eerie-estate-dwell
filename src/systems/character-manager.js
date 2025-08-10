export class CharacterManager {
    constructor() {
        this.needs = {
            hunger: 100,
            thirst: 100,
            health: 100,
            energy: 100
        };
        
        this.needDecayRates = {
            hunger: 3,
            thirst: 4,
            energy: 2,
            health: 0
        };
        
        this.maxValues = {
            hunger: 100,
            thirst: 100,
            health: 100,
            energy: 100
        };
    }

    updateNeeds(hoursElapsed) {
        for (const [need, rate] of Object.entries(this.needDecayRates)) {
            if (rate > 0) {
                const decay = rate * hoursElapsed;
                this.modifyNeed(need, -decay);
            }
        }
        
        this.applyNeedEffects();
    }

    modifyNeed(needType, amount) {
        if (!this.needs.hasOwnProperty(needType)) {
            console.error('Неизвестная потребность:', needType);
            return;
        }
        
        this.needs[needType] += amount;
        this.needs[needType] = Math.max(0, Math.min(this.maxValues[needType], this.needs[needType]));
    }

    applyNeedEffects() {
        if (this.needs.hunger <= 20) {
            this.modifyNeed('energy', -0.5);
        }
        
        if (this.needs.thirst <= 15) {
            this.modifyNeed('health', -1);
        }
        
        if (this.needs.energy <= 0) {
            this.modifyNeed('health', -2);
        }
    }

    getNeedStatus(needType) {
        const value = this.needs[needType];
        
        if (value >= 80) return 'отлично';
        if (value >= 60) return 'хорошо';
        if (value >= 40) return 'нормально';
        if (value >= 20) return 'плохо';
        return 'критично';
    }

    getOverallCondition() {
        const average = Object.values(this.needs).reduce((sum, val) => sum + val, 0) / 4;
        
        if (average >= 80) return 'Отличное состояние';
        if (average >= 60) return 'Хорошее состояние';
        if (average >= 40) return 'Нормальное состояние';
        if (average >= 20) return 'Плохое состояние';
        return 'Критическое состояние';
    }

    isAlive() {
        return this.needs.health > 0;
    }

    canPerformAction(energyCost = 0) {
        return this.needs.energy >= energyCost && this.isAlive();
    }

    getState() {
        return {
            needs: { ...this.needs }
        };
    }

    setState(state) {
        if (state.needs) {
            this.needs = { ...this.needs, ...state.needs };
        }
    }

    reset() {
        this.needs = {
            hunger: 100,
            thirst: 100,
            health: 100,
            energy: 100
        };
    }
}