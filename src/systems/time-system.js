export class TimeSystem {
    constructor() {
        this.currentHour = 8;
        this.currentDay = 1;
        this.totalHours = 8;
        this.timeChangeCallbacks = [];
    }

    advanceTime(hours) {
        const previousHour = this.currentHour;
        const previousDay = this.currentDay;
        
        this.totalHours += hours;
        this.currentHour += hours;
        
        while (this.currentHour >= 24) {
            this.currentHour -= 24;
            this.currentDay++;
        }
        
        const timeData = {
            previousHour,
            previousDay,
            currentHour: this.currentHour,
            currentDay: this.currentDay,
            hoursElapsed: hours
        };
        
        this.notifyTimeChange(timeData);
    }

    isDaytime() {
        return this.currentHour >= 6 && this.currentHour < 20;
    }

    isNighttime() {
        return !this.isDaytime();
    }

    getTimeString() {
        const hour = Math.floor(this.currentHour);
        const minutes = Math.floor((this.currentHour - hour) * 60);
        const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const period = this.isDaytime() ? 'День' : 'Ночь';
        
        return `День ${this.currentDay}, ${timeStr} (${period})`;
    }

    getPeriodName() {
        if (this.currentHour >= 6 && this.currentHour < 12) return 'Утро';
        if (this.currentHour >= 12 && this.currentHour < 18) return 'День';
        if (this.currentHour >= 18 && this.currentHour < 22) return 'Вечер';
        return 'Ночь';
    }

    onTimeChange(callback) {
        this.timeChangeCallbacks.push(callback);
    }

    notifyTimeChange(timeData) {
        this.timeChangeCallbacks.forEach(callback => {
            try {
                callback(timeData);
            } catch (error) {
                console.error('Ошибка в callback времени:', error);
            }
        });
    }

    getState() {
        return {
            currentHour: this.currentHour,
            currentDay: this.currentDay,
            totalHours: this.totalHours
        };
    }

    setState(state) {
        this.currentHour = state.currentHour || 8;
        this.currentDay = state.currentDay || 1;
        this.totalHours = state.totalHours || 8;
    }

    reset() {
        this.currentHour = 8;
        this.currentDay = 1;
        this.totalHours = 8;
    }
}