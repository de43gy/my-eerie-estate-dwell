export class EventDelegationMonitor {
    constructor() {
        this.isEnabled = false;
        this.actionClickCount = 0;
        this.locationClickCount = 0;
    }

    enable() {
        if (this.isEnabled) return;
        this.isEnabled = true;

        document.addEventListener('click', this.handleClick.bind(this), true);
        console.log('Event Delegation Monitor enabled');
    }

    disable() {
        this.isEnabled = false;
        document.removeEventListener('click', this.handleClick.bind(this), true);
        console.log('Event Delegation Monitor disabled');
    }

    handleClick(event) {
        if (!this.isEnabled) return;

        if (event.target.matches('.action-button') || event.target.closest('.action-button')) {
            this.actionClickCount++;
            const button = event.target.matches('.action-button') ? 
                event.target : event.target.closest('.action-button');
            console.log(`[Monitor] Action button clicked: ${button.dataset.action} (Total: ${this.actionClickCount})`);
        }

        if (event.target.matches('.location-button') || event.target.closest('.location-button')) {
            this.locationClickCount++;
            const button = event.target.matches('.location-button') ? 
                event.target : event.target.closest('.location-button');
            console.log(`[Monitor] Location button clicked: ${button.dataset.location} (Total: ${this.locationClickCount})`);
        }
    }

    getStats() {
        return {
            actionClicks: this.actionClickCount,
            locationClicks: this.locationClickCount,
            isEnabled: this.isEnabled
        };
    }

    reset() {
        this.actionClickCount = 0;
        this.locationClickCount = 0;
        console.log('[Monitor] Stats reset');
    }
}